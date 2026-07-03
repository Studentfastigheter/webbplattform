"use client";

/**
 * Queues — TanStack Query hooks.
 *
 * Three key wins here:
 *  1. useMyQueues is shared by all pages that need the user's queue state.
 *  2. useAllCompanyListings is called from 5 sites — including 3 different
 *     blocks on the analytics screen. With caching they share one fetch.
 *  3. useJoinQueue mutation invalidates both my-queues and the queue's
 *     company-scoped queues, which is what most callers want after a join.
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
  queueService,
  type CompanyDTO,
  type CreateHousingQueueRequirementRequest,
  type QueueApplicationDTO,
  type QueueFilters,
} from "@/features/queues/services/queue-service";
import { isVerifiedStudentAuthAccount } from "@/features/auth/lib/account-access";
import type { HousingQueueDTO } from "@/types/queue";
import type { ListingCardDTO, PageResponse } from "@/types/listing";

const STALE_30_SECONDS = 30_000;
const STALE_5_MINUTES = 5 * 60_000;

function normalizedQueueFilters(filters: QueueFilters = {}): Required<QueueFilters> {
  return {
    id: filters.id ?? null,
    city: filters.city ?? null,
    pageNumber: filters.pageNumber ?? 1,
    pageSize: filters.pageSize ?? 12,
    pageCount: filters.pageCount ?? 1,
  };
}

// ---------------------------------------------------------------------------
// READS
// ---------------------------------------------------------------------------

export function useQueues(
  filters: QueueFilters = {},
  options?: Omit<
    UseQueryOptions<HousingQueueDTO[]>,
    "queryKey" | "queryFn"
  >
) {
  const normalizedFilters = normalizedQueueFilters(filters);
  const { enabled = true, ...restOptions } = options ?? {};

  return useQuery<HousingQueueDTO[]>({
    ...restOptions,
    queryKey: qk.queues.list(normalizedFilters),
    queryFn: ({ signal }) =>
      queueService.list(normalizedFilters, { signal }),
    enabled,
    staleTime: STALE_30_SECONDS,
  });
}

export function useAllQueues(
  options?: Omit<
    UseQueryOptions<HousingQueueDTO[]>,
    "queryKey" | "queryFn"
  >
) {
  const { enabled = true, ...restOptions } = options ?? {};

  return useQuery<HousingQueueDTO[]>({
    ...restOptions,
    queryKey: qk.queues.unfilteredList(),
    queryFn: ({ signal }) => queueService.getAll({ signal }),
    enabled,
    staleTime: STALE_30_SECONDS,
  });
}

/**
 * User's queue applications.
 *
 * The underlying service has TWO modes:
 *  - hydrated=true (default): also fetches a full HousingQueueDTO for every
 *    queue id the user is in. Used by pages that render queue name/logo/city
 *    (koer page).
 *  - hydrated=false: skip hydration, only application rows. Used by pages
 *    that just need a Set of joined queue ids (alla-koer pages).
 *
 * Each mode gets its own cache entry — they fetch different data, so they
 * can't share a key. Default matches the existing `queueService.getMyQueues()`
 * no-arg behavior (hydrated=true).
 */
export function useMyQueues(
  { hydrated = true }: { hydrated?: boolean } = {},
  options?: Omit<
    UseQueryOptions<QueueApplicationDTO[]>,
    "queryKey" | "queryFn"
  >
) {
  const { user } = useAuth();
  const { enabled = true, ...restOptions } = options ?? {};

  return useQuery<QueueApplicationDTO[]>({
    ...restOptions,
    queryKey: [...qk.queues.my(), { hydrated }] as const,
    queryFn: ({ signal }) =>
      queueService.getMyQueues({
        // Forward the exact same option name the service expects. When
        // hydrated=true we pass no hydrateQueues key so the service's
        // default-true branch runs.
        ...(hydrated ? {} : { hydrateQueues: false as const }),
        signal,
      }),
    enabled: enabled && isVerifiedStudentAuthAccount(user),
    staleTime: STALE_30_SECONDS,
  });
}

export function useQueuesByCompany(companyId: number | null | undefined) {
  return useQuery<HousingQueueDTO[]>({
    queryKey: qk.queues.byCompany(companyId ?? -1),
    queryFn: ({ signal }) => queueService.getByCompany(companyId!, { signal }),
    enabled: companyId != null && companyId > 0,
    staleTime: STALE_30_SECONDS,
  });
}

export function useQueue(queueId: string | null | undefined) {
  return useQuery<HousingQueueDTO>({
    queryKey: qk.queues.detail(queueId ?? ""),
    queryFn: ({ signal }) => queueService.get(queueId!, { signal }),
    enabled: Boolean(queueId),
    staleTime: STALE_30_SECONDS,
  });
}

/**
 * Wraps queueService.getCompany (NOT companyService.publicProfile — they hit
 * different endpoints with different DTOs and existing call-sites use this
 * one).
 */
export function useQueueCompany(companyId: number | null | undefined) {
  return useQuery<CompanyDTO>({
    queryKey: qk.queues.company(companyId ?? -1),
    queryFn: ({ signal }) => queueService.getCompany(companyId!, { signal }),
    enabled: companyId != null && companyId > 0,
    staleTime: STALE_5_MINUTES, // company profile is reference-ish data
  });
}

export function useCompanyListingsPage(
  companyId: number | null | undefined,
  page = 0,
  size = 12
) {
  return useQuery<PageResponse<ListingCardDTO>>({
    queryKey: qk.queues.companyListingsPage(companyId ?? -1, page, size),
    queryFn: ({ signal }) =>
      queueService.getCompanyListingsPage(companyId!, page, size, { signal }),
    enabled: companyId != null && companyId > 0,
    staleTime: STALE_30_SECONDS,
    placeholderData: (previousData) => previousData,
  });
}

/**
 * The 5x-duplicated call. Now shared across analytics blocks and any other
 * caller that asks with the same (companyId, page, size).
 */
export function useAllCompanyListings(
  companyId: number | null | undefined,
  page = 0,
  size = 200
) {
  return useQuery<ListingCardDTO[]>({
    queryKey: qk.queues.allCompanyListings(companyId ?? -1, page, size),
    queryFn: ({ signal }) =>
      queueService.getAllCompanyListings(companyId!, page, size, { signal }),
    enabled: companyId != null && companyId > 0,
    staleTime: STALE_30_SECONDS,
  });
}

export function useCompanyQueueApplications(
  companyId: number | null | undefined
) {
  return useQuery<QueueApplicationDTO[]>({
    queryKey: qk.queues.companyApplications(companyId ?? -1),
    queryFn: ({ signal }) =>
      queueService.getCompanyQueueApplications(companyId!, { signal }),
    enabled: companyId != null && companyId > 0,
    staleTime: STALE_30_SECONDS,
  });
}

// ---------------------------------------------------------------------------
// MUTATIONS
// ---------------------------------------------------------------------------

/**
 * Join a queue. Invalidates the user's queue list (so the freshly-joined
 * queue shows up everywhere). We don't optimistically patch because the join
 * endpoint can fail validation server-side (verification status etc.) and
 * recovery from a bad optimistic UI is worse than a brief loading state.
 */
export function useJoinQueue() {
  const qc = useQueryClient();
  return useMutation<string, Error, string>({
    mutationFn: (queueId: string) => queueService.join(queueId),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: qk.queues.my() });
    },
  });
}

/**
 * Leave a queue. Mirrors useJoinQueue: invalidate the user's queue list so the
 * queue disappears everywhere it's rendered. No optimistic patch — the leave
 * endpoint returns 400 if the student isn't actually a member, so we wait for
 * the server before updating the UI.
 */
export function useLeaveQueue() {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (queueId: string) => queueService.leave(queueId),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: qk.queues.my() });
    },
  });
}

export function useUpsertQueueRequirement() {
  const qc = useQueryClient();

  return useMutation<
    void,
    Error,
    {
      queueId: string;
      request: CreateHousingQueueRequirementRequest | string;
    }
  >({
    mutationFn: ({ queueId, request }) =>
      queueService.upsertRequirement(queueId, request),
    onSettled: (_data, _error, variables) => {
      qc.invalidateQueries({ queryKey: qk.queues.all });
      qc.invalidateQueries({ queryKey: qk.queues.detail(variables.queueId) });
    },
  });
}
