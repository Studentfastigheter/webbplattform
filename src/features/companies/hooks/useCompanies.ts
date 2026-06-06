"use client";

/**
 * Companies — TanStack Query hooks.
 *
 * Note: there's overlap with queueService.getCompany (different endpoint,
 * different DTO). Use:
 *   - useCompanyPublic / useCompanyPrivate from this file when working with
 *     the marketing / profile pages (CompanyPublicDTO / CompanyPrivateDTO).
 *   - useQueueCompany from features/queues/hooks/useQueues when the consumer
 *     was already wired to queueService.getCompany (CompanyDTO).
 *
 * Do not collapse these — the existing call-sites depend on the DTO shapes
 * staying as-is.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { qk } from "@/lib/query/keys";
import { useAuth } from "@/context/AuthContext";
import {
  companyService,
  type AnalyticalQuantities,
  type ApplicationStatisticEntry,
  type CompanyChangeableDataDTO,
  type CompanyImageTarget,
  type CompanyPrivateDTO,
  type CompanyPublicDTO,
  type CompanyRole,
  type CompanyUserCreateRequest,
  type CompanyUserDTO,
  type CompanyUserUpdateRequest,
  type ListingViewCounts,
  type NewApplication,
  type ObjectApplicationCount,
  type ResidentAnalyticsData,
  type SocialPlatform,
  type Timeline,
} from "@/features/companies/services/company-service";

const STALE_30_SECONDS = 30_000;
const STALE_5_MINUTES = 5 * 60_000;

export function useCompanies() {
  return useQuery<CompanyPublicDTO[]>({
    queryKey: qk.companies.list(),
    // The service splits params (city filter) from ServiceOptions (signal).
    // listCompanies(params, options) — pass an empty filter and forward signal
    // via the second argument so cancellation works on unmount.
    queryFn: ({ signal }) => companyService.listCompanies({}, { signal }),
    staleTime: STALE_5_MINUTES, // landlord list is reference-ish
  });
}

export function useCompanyPublic(id: number | null | undefined) {
  return useQuery<CompanyPublicDTO>({
    queryKey: qk.companies.publicProfile(id ?? -1),
    queryFn: ({ signal }) => companyService.publicProfile(id!, { signal }),
    enabled: id != null && id > 0,
    staleTime: STALE_5_MINUTES,
  });
}

export function useCompanyPrivate(id: number | null | undefined) {
  const { user } = useAuth();
  return useQuery<CompanyPrivateDTO>({
    queryKey: qk.companies.privateProfile(id ?? -1),
    queryFn: ({ signal }) => companyService.privateProfile(id!, { signal }),
    enabled: Boolean(user) && id != null && id > 0,
    staleTime: STALE_30_SECONDS,
  });
}

export function useApplicationCountsPerObject(
  companyId: number | null | undefined,
  limit = 200
) {
  return useQuery<ObjectApplicationCount[]>({
    queryKey: qk.companies.applicationCounts(companyId ?? -1, limit),
    queryFn: ({ signal }) =>
      companyService.applicationCountsPerObject(companyId!, limit, { signal }),
    enabled: companyId != null && companyId > 0,
    staleTime: STALE_30_SECONDS,
  });
}

export function useListingViewCounts(
  companyId: number | null | undefined,
  listingId: string | null | undefined
) {
  return useQuery<ListingViewCounts>({
    queryKey: qk.companies.viewCounts(companyId ?? -1, listingId ?? ""),
    queryFn: ({ signal }) =>
      companyService.listingViewCounts(companyId!, listingId!, { signal }),
    enabled: companyId != null && companyId > 0 && Boolean(listingId),
    staleTime: STALE_30_SECONDS,
  });
}

export function useTimedApplicationsForListing(
  companyId: number | null | undefined,
  from: string,
  to: string,
  listingId: string | null | undefined
) {
  return useQuery<ApplicationStatisticEntry[]>({
    queryKey: qk.companies.timedApplications(
      companyId ?? -1,
      from,
      to,
      listingId ?? ""
    ),
    queryFn: ({ signal }) =>
      companyService.timedApplicationsForListing(
        companyId!,
        from,
        to,
        listingId!,
        { signal }
      ),
    enabled:
      companyId != null && companyId > 0 && Boolean(listingId) && !!from && !!to,
    staleTime: STALE_30_SECONDS,
  });
}

export function useCompanyApplications(
  companyId: number | null | undefined,
  {
    pageSize = 200,
    maxPages = 25,
    enabled = true,
  }: { pageSize?: number; maxPages?: number; enabled?: boolean } = {}
) {
  const { user } = useAuth();

  return useQuery<NewApplication[]>({
    queryKey: qk.companies.applications(companyId ?? -1, pageSize, maxPages),
    queryFn: ({ signal }) =>
      companyService.applications(companyId!, { pageSize, maxPages, signal }),
    enabled: enabled && Boolean(user) && companyId != null && companyId > 0,
    staleTime: STALE_30_SECONDS,
  });
}

export function useCompanyApplicationsTimeline(
  companyId: number | null | undefined
) {
  const { user } = useAuth();

  return useQuery<Timeline>({
    queryKey: qk.companies.applicationsTimeline(companyId ?? -1),
    queryFn: ({ signal }) =>
      companyService.applicationsTimeline(companyId!, { signal }),
    enabled: Boolean(user) && companyId != null && companyId > 0,
    staleTime: STALE_30_SECONDS,
  });
}

export function useCompanyTimedApplications(
  companyId: number | null | undefined,
  from: string,
  to: string,
  enabled = true
) {
  const { user } = useAuth();

  return useQuery<ApplicationStatisticEntry[]>({
    queryKey: qk.companies.timedApplicationsTotal(companyId ?? -1, from, to),
    queryFn: ({ signal }) =>
      companyService.timedApplications(companyId!, from, to, { signal }),
    enabled:
      enabled && Boolean(user) && companyId != null && companyId > 0 && !!from && !!to,
    staleTime: STALE_30_SECONDS,
  });
}

export function useCompanyGeneralAnalytics(
  companyId: number | null | undefined
) {
  const { user } = useAuth();

  return useQuery<AnalyticalQuantities>({
    queryKey: qk.companies.generalAnalytics(companyId ?? -1),
    queryFn: ({ signal }) => companyService.generalAnalytics(companyId!, { signal }),
    enabled: Boolean(user) && companyId != null && companyId > 0,
    staleTime: STALE_30_SECONDS,
  });
}

export function useCompanyResidentAnalytics(
  companyId: number | null | undefined
) {
  const { user } = useAuth();

  return useQuery<ResidentAnalyticsData>({
    queryKey: qk.companies.residentAnalytics(companyId ?? -1),
    queryFn: ({ signal }) =>
      companyService.residentAnalyticsData(companyId!, { signal }),
    enabled: Boolean(user) && companyId != null && companyId > 0,
    staleTime: STALE_30_SECONDS,
  });
}

/**
 * Social platforms list (LinkedIn, Instagram, etc.) used by the company
 * profile editor. Reference data — long staleTime. Public endpoint, so no
 * user gate.
 */
export function usePlatforms() {
  return useQuery<SocialPlatform[]>({
    queryKey: qk.companies.platforms(),
    queryFn: ({ signal }) => companyService.getAllPlatforms({ signal }),
    staleTime: STALE_5_MINUTES,
  });
}

/**
 * The list of CompanyUsers attached to a company (for the portal's
 * "Användare" / users page). Requires an authenticated company user.
 *
 * No mutations here — Phase 1 is read-only. Create/update/verify mutations
 * are added in Phase 2.
 */
export function useCompanyUsers(companyId: number | null | undefined) {
  const { user } = useAuth();
  return useQuery<CompanyUserDTO[]>({
    queryKey: qk.companies.users(companyId ?? -1),
    queryFn: ({ signal }) => companyService.users(companyId!, { signal }),
    enabled: Boolean(user) && companyId != null && companyId > 0,
    staleTime: STALE_30_SECONDS,
  });
}

/**
 * Roles the system recognises (admin / company_user / etc.). Reference data
 * — shared between the create form and the table, long staleTime.
 */
export function useCompanyRoles() {
  return useQuery<CompanyRole[]>({
    queryKey: qk.companies.roles(),
    queryFn: ({ signal }) => companyService.roles({ signal }),
    staleTime: STALE_5_MINUTES,
  });
}

// ---------------------------------------------------------------------------
// MUTATIONS (Phase 2)
// ---------------------------------------------------------------------------

/**
 * Mutation conventions in this file:
 * - Mutations own their invalidation. Callers should NOT call qc.invalidate
 *   themselves; that's a footgun.
 * - For per-call concerns (toast on success, navigate on failure), callers
 *   pass `{ onSuccess, onError }` into `mutate(vars, { ... })` — those run
 *   alongside the hook's own callbacks, they don't replace them.
 * - `onSettled` (not `onSuccess`) is used for invalidation so we still
 *   refetch after a failed write — never trust optimistic state on errors.
 */

/**
 * Save the editable fields of a company (profile page).
 * Invalidates: privateProfile + publicProfile + queues by-company (logos
 * shown in queue cards).
 */
export function useUpdateCompanyData() {
  const qc = useQueryClient();
  return useMutation<
    void,
    Error,
    { id: number; payload: CompanyChangeableDataDTO }
  >({
    mutationFn: ({ id, payload }) =>
      companyService.updateCompanyData(id, payload),
    onSettled: (_data, _err, { id }) => {
      qc.invalidateQueries({ queryKey: qk.companies.privateProfile(id) });
      qc.invalidateQueries({ queryKey: qk.companies.publicProfile(id) });
      qc.invalidateQueries({ queryKey: qk.queues.byCompany(id) });
    },
  });
}

/**
 * Upload company logo / banner. Two convenience wrappers around the same
 * `uploadImage` endpoint so call-sites read naturally.
 */
export function useUploadCompanyImage() {
  const qc = useQueryClient();
  return useMutation<
    string | null,
    Error,
    { id: number; target: CompanyImageTarget; file: File; mediaType?: string }
  >({
    mutationFn: ({ id, target, file, mediaType }) =>
      companyService.uploadImage(id, target, file, { mediaType }),
    onSettled: (_data, _err, { id }) => {
      qc.invalidateQueries({ queryKey: qk.companies.privateProfile(id) });
      qc.invalidateQueries({ queryKey: qk.companies.publicProfile(id) });
      qc.invalidateQueries({ queryKey: qk.queues.byCompany(id) });
    },
  });
}

export function useUploadCompanyLogo() {
  return useUploadCompanyImage();
}

export function useUploadCompanyBanner() {
  return useUploadCompanyImage();
}

/**
 * Create a company user. Invalidates the users list so the new row appears
 * after the create. We don't optimistically patch because the created row
 * needs the server-assigned id.
 */
export function useCreateCompanyUser() {
  const qc = useQueryClient();
  return useMutation<void, Error, { companyId: number; payload: CompanyUserCreateRequest }>({
    mutationFn: ({ payload }) => companyService.createUser(payload),
    onSettled: (_data, _err, { companyId }) => {
      qc.invalidateQueries({ queryKey: qk.companies.users(companyId) });
    },
  });
}

/**
 * Update a company user. Returns the freshly server-serialised row, but we
 * still invalidate to keep the table in lockstep with any backend-side
 * derived fields (verified, role).
 */
export function useUpdateCompanyUser() {
  const qc = useQueryClient();
  return useMutation<
    CompanyUserDTO,
    Error,
    {
      companyId: number;
      userId: number;
      payload: CompanyUserUpdateRequest;
    }
  >({
    mutationFn: ({ companyId, userId, payload }) =>
      companyService.updateUser(companyId, userId, payload),
    onSettled: (_data, _err, { companyId }) => {
      qc.invalidateQueries({ queryKey: qk.companies.users(companyId) });
    },
  });
}

/**
 * Verify a company user. Uses optimistic patch on the cached list (the
 * verified badge needs to flip immediately for UX), and rolls back on error.
 */
export function useVerifyCompanyUser() {
  const qc = useQueryClient();

  type Vars = { companyId: number; userId: number };
  type Ctx = { previous: CompanyUserDTO[] | undefined };

  return useMutation<void, Error, Vars, Ctx>({
    mutationFn: ({ companyId, userId }) =>
      companyService.verifyUser(companyId, userId),

    onMutate: async ({ companyId, userId }) => {
      await qc.cancelQueries({ queryKey: qk.companies.users(companyId) });
      const previous = qc.getQueryData<CompanyUserDTO[]>(
        qk.companies.users(companyId),
      );
      qc.setQueryData<CompanyUserDTO[]>(
        qk.companies.users(companyId),
        (current) =>
          (current ?? []).map((entry) =>
            entry.id === userId ? { ...entry, verified: true } : entry,
          ),
      );
      return { previous };
    },

    onError: (_err, { companyId }, ctx) => {
      if (ctx?.previous !== undefined) {
        qc.setQueryData(qk.companies.users(companyId), ctx.previous);
      }
    },

    onSettled: (_data, _err, { companyId }) => {
      qc.invalidateQueries({ queryKey: qk.companies.users(companyId) });
    },
  });
}

/**
 * Trigger the backend sync that pulls fresh listings for an external
 * company. The backend kicks off an async job; we invalidate both the
 * listings list and the analytics surfaces so the UI re-fetches whenever
 * the sync has produced new data.
 */
export function useRefreshCompanyListings() {
  const qc = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: (id) => companyService.refreshCompanyListings(id),
    onSettled: (_data, _err, id) => {
      qc.invalidateQueries({ queryKey: qk.queues.allCompanyListingsByCompany(id) });
      qc.invalidateQueries({ queryKey: qk.queues.companyListingsPageByCompany(id) });
      qc.invalidateQueries({ queryKey: qk.companies.applicationCounts(id, 200) });
      qc.invalidateQueries({ queryKey: qk.companies.applicationsByCompany(id) });
      qc.invalidateQueries({ queryKey: qk.companies.applicationsTimeline(id) });
      qc.invalidateQueries({ queryKey: qk.companies.generalAnalytics(id) });
      qc.invalidateQueries({ queryKey: qk.companies.residentAnalytics(id) });
      qc.invalidateQueries({ queryKey: qk.companies.viewCountsByCompany(id) });
    },
  });
}
