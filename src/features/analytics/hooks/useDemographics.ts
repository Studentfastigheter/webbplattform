"use client";

/**
 * Demographics — TanStack Query hooks.
 *
 * Each query is keyed on (id, from, to, category[, gotListing]) so the
 * analytics dashboard's many concurrent blocks share whatever's cacheable.
 *
 * The big win on the analytics page is that several blocks all call
 * `queueService.getAllCompanyListings(companyId, 0, 200)` to render their
 * listing-selector dropdown. After migration, those three calls collapse to
 * a single shared cache entry via useAllCompanyListings (see queues hooks).
 *
 * Action-only calls (recordListingView, recordCompanyView) are NOT hooks —
 * they fire-and-forget. Keep them as direct service calls inside event
 * handlers / Set-guarded effects.
 */

import { useQuery } from "@tanstack/react-query";
import { qk } from "@/lib/query/keys";
import {
  demographicsService,
  type ApplicationDemography,
  type ApplicationDemographyCategory,
  type CompanyDemography,
  type CompanyDemographyCategory,
  type DemographyCategory,
  type GotListingFilter,
  type ListingDemography,
} from "@/features/analytics/services/demographics-service";

const STALE_30_SECONDS = 30_000;

export function useListingDemography(
  companyId: number | null | undefined,
  listingId: string | null | undefined,
  from: string,
  to: string,
  category: DemographyCategory,
  enabled = true
) {
  return useQuery<ListingDemography>({
    queryKey: qk.demographics.listing(
      companyId ?? -1,
      listingId ?? "",
      from,
      to,
      category
    ),
    queryFn: () =>
      demographicsService.getCompanyListing(
        companyId!,
        listingId!,
        from,
        to,
        category
      ),
    enabled:
      enabled &&
      companyId != null &&
      companyId > 0 &&
      Boolean(listingId) &&
      !!from &&
      !!to,
    staleTime: STALE_30_SECONDS,
  });
}

export function useListingByAllCategoriesDemography(
  companyId: number | null | undefined,
  listingId: string | null | undefined,
  from: string,
  to: string,
  enabled = true
) {
  return useQuery<Record<DemographyCategory, ListingDemography | null>>({
    queryKey: qk.demographics.listingByAllCategories(
      companyId ?? -1,
      listingId ?? "",
      from,
      to
    ),
    queryFn: () =>
      demographicsService.getCompanyListingByAllCategories(
        companyId!,
        listingId!,
        from,
        to
      ),
    enabled:
      enabled &&
      companyId != null &&
      companyId > 0 &&
      Boolean(listingId) &&
      !!from &&
      !!to,
    staleTime: STALE_30_SECONDS,
  });
}

export function useCompanyDemography(
  companyId: number | null | undefined,
  from: string,
  to: string,
  category: CompanyDemographyCategory,
  enabled = true
) {
  return useQuery<CompanyDemography>({
    queryKey: qk.demographics.company(companyId ?? -1, from, to, category),
    queryFn: () =>
      demographicsService.getCompany(companyId!, from, to, category),
    enabled:
      enabled && companyId != null && companyId > 0 && !!from && !!to,
    staleTime: STALE_30_SECONDS,
  });
}

export function useCompaniesBatchByAllCategoriesDemography(
  companyIds: number[],
  from: string,
  to: string,
  enabled = true
) {
  return useQuery({
    queryKey: qk.demographics.companiesBatchByAllCategories(
      companyIds,
      from,
      to
    ),
    queryFn: () =>
      demographicsService.getCompaniesBatchByAllCategories(
        companyIds,
        from,
        to
      ),
    enabled: enabled && companyIds.length > 0 && !!from && !!to,
    staleTime: STALE_30_SECONDS,
  });
}

export function useFullCompanyListingsByAllCategoriesDemography(
  companyId: number | null | undefined,
  from: string,
  to: string,
  enabled = true
) {
  return useQuery({
    queryKey: qk.demographics.fullCompanyListingsByAllCategories(
      companyId ?? -1,
      from,
      to
    ),
    queryFn: () =>
      demographicsService.getFullCompanyListingsByAllCategories(
        companyId!,
        from,
        to
      ),
    enabled:
      enabled && companyId != null && companyId > 0 && !!from && !!to,
    staleTime: STALE_30_SECONDS,
  });
}

export function useApplicationsBatchDemography(
  companyId: number | null | undefined,
  listingIds: string[],
  from: string,
  to: string,
  category: ApplicationDemographyCategory,
  gotListing: GotListingFilter,
  enabled = true
) {
  return useQuery<Record<string, ApplicationDemography>>({
    queryKey: qk.demographics.applicationsBatch(
      companyId ?? -1,
      listingIds,
      from,
      to,
      category,
      gotListing
    ),
    queryFn: () =>
      demographicsService.getApplicationsBatch(
        companyId!,
        listingIds,
        from,
        to,
        category,
        gotListing
      ),
    enabled:
      enabled &&
      companyId != null &&
      companyId > 0 &&
      listingIds.length > 0 &&
      !!from &&
      !!to,
    staleTime: STALE_30_SECONDS,
  });
}

export function useApplicationDemography(
  companyId: number | null | undefined,
  listingId: string | null | undefined,
  from: string,
  to: string,
  category: ApplicationDemographyCategory,
  gotListing: GotListingFilter = "BOTH",
  enabled = true
) {
  return useQuery<ApplicationDemography>({
    queryKey: qk.demographics.application(
      companyId ?? -1,
      listingId ?? "",
      from,
      to,
      category,
      gotListing
    ),
    queryFn: () =>
      demographicsService.getCompanyApplication(
        companyId!,
        listingId!,
        from,
        to,
        category,
        gotListing
      ),
    enabled:
      enabled &&
      companyId != null &&
      companyId > 0 &&
      Boolean(listingId) &&
      !!from &&
      !!to,
    staleTime: STALE_30_SECONDS,
  });
}

export function useApplicationByAllCategoriesDemography(
  companyId: number | null | undefined,
  listingId: string | null | undefined,
  from: string,
  to: string,
  gotListing: GotListingFilter = "BOTH",
  enabled = true
) {
  return useQuery<
    Record<ApplicationDemographyCategory, ApplicationDemography | null>
  >({
    queryKey: qk.demographics.applicationByAllCategories(
      companyId ?? -1,
      listingId ?? "",
      from,
      to,
      gotListing
    ),
    queryFn: () =>
      demographicsService.getCompanyApplicationByAllCategories(
        companyId!,
        listingId!,
        from,
        to,
        gotListing
      ),
    enabled:
      enabled &&
      companyId != null &&
      companyId > 0 &&
      Boolean(listingId) &&
      !!from &&
      !!to,
    staleTime: STALE_30_SECONDS,
  });
}
