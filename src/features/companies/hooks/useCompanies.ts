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

import { useQuery } from "@tanstack/react-query";
import { qk } from "@/lib/query/keys";
import { useAuth } from "@/context/AuthContext";
import {
  companyService,
  type ApplicationStatisticEntry,
  type CompanyPrivateDTO,
  type CompanyPublicDTO,
  type CompanyRole,
  type CompanyUserDTO,
  type ListingViewCounts,
  type ObjectApplicationCount,
  type SocialPlatform,
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

/**
 * Social platforms list (LinkedIn, Instagram, etc.) used by the company
 * profile editor. Reference data — long staleTime. Public endpoint, so no
 * user gate.
 */
export function usePlatforms() {
  return useQuery<SocialPlatform[]>({
    queryKey: qk.companies.platforms(),
    queryFn: () => companyService.getAllPlatforms(),
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
    queryFn: () => companyService.users(companyId!),
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
    queryFn: () => companyService.roles(),
    staleTime: STALE_5_MINUTES,
  });
}
