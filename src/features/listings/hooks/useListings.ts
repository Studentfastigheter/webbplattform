"use client";

/**
 * Listings — TanStack Query hooks.
 *
 * Convention notes (apply to every hooks file in features/):
 * - `enabled` guards turn the query off until prerequisites are met. Required
 *   for any query keyed on a value that might be null on first render
 *   (auth user, dynamic route param, derived id).
 * - Where we have a stable user list (favorites, my applications), staleTime
 *   defaults at 30s come from QueryProvider — explicitly bump per query when
 *   the data is essentially session-stable.
 * - Mutations live in this file next to their corresponding queries so the
 *   invalidation surface for a given key is local. Read the mutation's
 *   onSettled when in doubt about what gets re-fetched.
 * - Mutations that touch a list use optimistic updates with rollback in
 *   onError. The pattern is intentional: snapshot → cancel in-flight → patch
 *   cache → return snapshot → on error restore → on settled invalidate.
 *
 * What is NOT in this file:
 * - listingService.incrementViews + demographicsService.recordListingView:
 *   these are fire-and-forget action calls, not "server state" in the
 *   TanStack sense. Keep them as direct service calls inside onClick/effect
 *   handlers with the existing Set-ref guards.
 */

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { qk } from "@/lib/query/keys";
import { useAuth } from "@/context/AuthContext";
import {
  listingService,
  type ListingSearchFacetsDTO,
  type ListingSearchParams,
} from "@/features/listings/services/listing-service";
import type {
  ListingCardDTO,
  ListingDetailDTO,
  ListingTagDTO,
  PageResponse,
  RequirementsProfileDTO,
  StudentApplicationDTO,
} from "@/types/listing";

const STALE_30_SECONDS = 30_000;
const STALE_2_MINUTES = 2 * 60_000;
const STALE_5_MINUTES = 5 * 60_000;

// ---------------------------------------------------------------------------
// READS
// ---------------------------------------------------------------------------

/**
 * Single listing detail. Cached per id for 2 minutes — detail rarely changes
 * during a single browsing session, and the same listing is often loaded
 * from the search page (card) → detail page transition.
 */
export function useListing(
  listingId: string | null | undefined,
  options?: Omit<UseQueryOptions<ListingDetailDTO>, "queryKey" | "queryFn">
) {
  return useQuery<ListingDetailDTO>({
    queryKey: qk.listings.detail(listingId ?? ""),
    queryFn: ({ signal }) => listingService.get(listingId!, { signal }),
    enabled: Boolean(listingId),
    staleTime: STALE_2_MINUTES,
    ...options,
  });
}

/**
 * Search/feed. Each unique param combo is cached separately so re-applying a
 * recent filter shows instantly from cache.
 */
export function useListingsSearch(params: ListingSearchParams) {
  return useQuery<PageResponse<ListingCardDTO>>({
    queryKey: qk.listings.list(params),
    // listingService.getAll has the legacy positional overload; the object
    // form is the supported one for new code. Signal is NOT threaded here —
    // see audit; cancellation is a no-op for this call but caching still works.
    queryFn: () => listingService.getAll(params),
    staleTime: STALE_30_SECONDS,
    placeholderData: (previousData) => previousData, // keep last page during pagination
  });
}

export function useListingFacets(params: ListingSearchParams, enabled = true) {
  return useQuery<ListingSearchFacetsDTO>({
    queryKey: qk.listings.facets(params),
    queryFn: ({ signal }) => listingService.getFacets(params, { signal }),
    enabled,
    staleTime: STALE_30_SECONDS,
    placeholderData: (previousData) => previousData,
  });
}

export function useListingTags() {
  return useQuery<ListingTagDTO[]>({
    queryKey: qk.listings.tags(),
    queryFn: ({ signal }) => listingService.getListingTags({ signal }),
    // Tags are reference data — change rarely.
    staleTime: STALE_5_MINUTES,
  });
}

export function useListingCities() {
  return useQuery<string[]>({
    queryKey: qk.listings.cities(),
    queryFn: ({ signal }) => listingService.getCities({ signal }),
    // Cities are reference data — change rarely.
    staleTime: STALE_5_MINUTES,
  });
}

export function useRequirementsProfile(
  requirementsProfileId: string | null | undefined
) {
  return useQuery<RequirementsProfileDTO>({
    queryKey: qk.listings.requirementsProfile(requirementsProfileId ?? ""),
    queryFn: ({ signal }) =>
      listingService.getRequirementsProfile(requirementsProfileId!, { signal }),
    enabled: Boolean(requirementsProfileId),
    staleTime: STALE_5_MINUTES,
  });
}

/**
 * Favorites — the single highest-impact migration. Replaces 5 separate page
 * useEffects with one shared cache entry.
 */
export function useFavorites() {
  const { user } = useAuth();
  return useQuery<ListingCardDTO[]>({
    queryKey: qk.listings.favorites(),
    queryFn: ({ signal }) => listingService.getFavorites(0, 200, { signal }),
    enabled: Boolean(user),
    staleTime: STALE_30_SECONDS,
  });
}

export function useMyApplications() {
  const { user } = useAuth();
  return useQuery<StudentApplicationDTO[]>({
    queryKey: qk.listings.myApplications(),
    queryFn: ({ signal }) =>
      listingService.getMyApplications(0, 50, { signal }),
    enabled: Boolean(user),
    staleTime: STALE_30_SECONDS,
  });
}

export function useMyListings(page = 0, size = 200) {
  const { user } = useAuth();
  return useQuery<PageResponse<ListingCardDTO>>({
    queryKey: qk.listings.myListings(page, size),
    queryFn: ({ signal }) =>
      listingService.getMyListingsPage(page, size, { signal }),
    enabled: Boolean(user),
    staleTime: STALE_30_SECONDS,
    placeholderData: (previousData) => previousData,
  });
}

export function useQueueListings(
  queueId: string | null | undefined,
  page = 0,
  size = 12
) {
  return useQuery<PageResponse<ListingCardDTO>>({
    queryKey: qk.listings.queueListings(queueId ?? "", page, size),
    queryFn: ({ signal }) =>
      listingService.getQueueListings(queueId!, page, size, { signal }),
    enabled: Boolean(queueId),
    staleTime: STALE_30_SECONDS,
    placeholderData: (previousData) => previousData,
  });
}

// ---------------------------------------------------------------------------
// MUTATIONS
// ---------------------------------------------------------------------------

/**
 * Toggle favorite with optimistic UI.
 *
 * IMPORTANT: callers should NOT manage their own optimistic state on top of
 * this — `useFavorites().data` is the single source of truth for the favorite
 * set across the app. Derive `isFavorite` from `data?.some(f => f.id === id)`
 * (or wrap in a memoized Set).
 *
 * The mutation pays the cost of re-fetching favorites on settle so that if
 * the server's authoritative state ever diverges from our optimistic patch
 * (e.g. another device toggled it), we recover within one network round.
 */
export function useToggleFavorite() {
  const qc = useQueryClient();

  type Vars = { listingId: string; nextIsFavorite: boolean };
  type Ctx = { previous: ListingCardDTO[] | undefined };

  return useMutation<void, Error, Vars, Ctx>({
    mutationFn: ({ listingId, nextIsFavorite }) =>
      nextIsFavorite
        ? listingService.addFavorite(listingId)
        : listingService.removeFavorite(listingId),

    onMutate: async ({ listingId, nextIsFavorite }) => {
      await qc.cancelQueries({ queryKey: qk.listings.favorites() });
      const previous = qc.getQueryData<ListingCardDTO[]>(qk.listings.favorites());

      qc.setQueryData<ListingCardDTO[]>(
        qk.listings.favorites(),
        (old = []) => {
          if (nextIsFavorite) {
            if (old.some((entry) => entry.id === listingId)) return old;
            // We add a stub entry so cards-by-id checks reflect the new state.
            // The full object is refilled on settle via invalidate.
            return [...old, { id: listingId } as ListingCardDTO];
          }
          return old.filter((entry) => entry.id !== listingId);
        }
      );

      return { previous };
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.previous !== undefined) {
        qc.setQueryData(qk.listings.favorites(), ctx.previous);
      }
    },

    onSettled: () => {
      // Re-sync with authoritative server list. Settled (not Success) so we
      // still re-sync after a failed POST/DELETE — never trust optimistic.
      qc.invalidateQueries({ queryKey: qk.listings.favorites() });
    },
  });
}

/**
 * Mutation hook conventions (apply to every mutation in this file):
 * - The hook owns invalidation. Callers MUST NOT need to know which cache
 *   keys to bust — that's the hook's job.
 * - For per-call concerns (toast on success, navigate on failure), callers
 *   pass `{ onSuccess, onError }` into `mutate(vars, { ... })` — those
 *   run alongside the hook's own callbacks, they don't replace them.
 * - Hooks intentionally do NOT accept arbitrary `UseMutationOptions`.
 *   Spreading caller options is a footgun (a stray `onSettled` would
 *   silently clobber our invalidation), and there's no current use case.
 *   If you need this later, compose: call options.onSettled FIRST, then
 *   the hook's invalidation, never spread.
 */

export function useApplyToListing() {
  const qc = useQueryClient();
  return useMutation<
    void,
    Error,
    { listingId: string; message?: string; isPrivate: boolean }
  >({
    mutationFn: ({ listingId, message, isPrivate }) =>
      isPrivate
        ? listingService.applyToPrivateListing(listingId, message ?? "")
        : listingService.applyToListing(listingId, message),
    onSettled: (_data, _err, vars) => {
      qc.invalidateQueries({ queryKey: qk.listings.myApplications() });
      qc.invalidateQueries({ queryKey: qk.listings.detail(vars.listingId) });
    },
  });
}

export function useWithdrawApplication() {
  const qc = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: (applicationId: number) =>
      listingService.withdrawApplication(applicationId),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: qk.listings.myApplications() });
    },
  });
}

export function useAcceptOffer() {
  const qc = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: (applicationId: number) =>
      listingService.acceptOffer(applicationId),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: qk.listings.myApplications() });
    },
  });
}

export function useRejectOffer() {
  const qc = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: (applicationId: number) =>
      listingService.rejectOffer(applicationId),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: qk.listings.myApplications() });
    },
  });
}

/**
 * Update / delete on the landlord side. Invalidates broadly because a
 * listing change can ripple through `getAllCompanyListings`,
 * `getCompanyListingsPage`, `getMyListings`, search lists, and the detail.
 */
export function useUpdateListing() {
  const qc = useQueryClient();
  return useMutation<
    void,
    Error,
    { id: string; payload: Parameters<typeof listingService.update>[1] }
  >({
    mutationFn: ({ id, payload }) => listingService.update(id, payload),
    onSettled: () => {
      // Broad invalidation: a listing edit can change anything that's
      // surfaced from a listing — search lists, map view, facets, detail,
      // favorites (hostName changes), my-listings, company listings page.
      // Cheaper than enumerating each.
      qc.invalidateQueries({ queryKey: qk.listings.all });
      qc.invalidateQueries({ queryKey: qk.queues.all });
    },
  });
}

export function useDeleteListing() {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id: string) => listingService.delete(id),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: qk.listings.all });
      qc.invalidateQueries({ queryKey: qk.queues.all });
    },
  });
}
