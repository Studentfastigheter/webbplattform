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

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
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
  listingId: string | null | undefined,
  from: string,
  to: string,
  category: DemographyCategory,
  enabled = true
) {
  return useQuery<ListingDemography>({
    queryKey: qk.demographics.listing(listingId ?? "", from, to, category),
    queryFn: ({ signal }) =>
      demographicsService.getListing(listingId!, from, to, category, { signal }),
    enabled: enabled && Boolean(listingId) && !!from && !!to,
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
    queryFn: ({ signal }) =>
      demographicsService.getCompany(companyId!, from, to, category, { signal }),
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
    queryFn: ({ signal }) =>
      demographicsService.getCompaniesBatchByAllCategories(
        companyIds,
        from,
        to,
        { signal }
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
    queryFn: ({ signal }) =>
      demographicsService.getFullCompanyListingsByAllCategories(
        companyId!,
        from,
        to,
        { signal }
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
    queryFn: ({ signal }) =>
      demographicsService.getApplicationsBatch(
        companyId!,
        listingIds,
        from,
        to,
        category,
        gotListing,
        { signal }
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
