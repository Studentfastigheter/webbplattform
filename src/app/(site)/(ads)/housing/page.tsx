import HousingPageClient from "./HousingPageClient";

import { listingService, normalizeListingSearchParams, type ListingSearchParams } from "@/features/listings/services/listing-service";
import { schoolService } from "@/features/schools/services/school-service";
import { PrefetchedQueryBoundary } from "@/lib/query/PrefetchedQueryBoundary";
import { qk } from "@/lib/query/keys";

const PAGE_SIZE = 15;

type SearchParamValue = string | string[] | undefined;

type HousingPageProps = {
  searchParams: Promise<Record<string, SearchParamValue>>;
};

function firstSearchParam(value: SearchParamValue) {
  return Array.isArray(value) ? value[0] : value;
}

function pageFromSearchParam(value: SearchParamValue) {
  const parsed = Number(firstSearchParam(value));
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

export default async function ListingsPage({ searchParams }: HousingPageProps) {
  const params = await searchParams;
  const city = firstSearchParam(params.city)?.trim() ?? "";
  const page = pageFromSearchParam(params.page);
  const currentFilters: ListingSearchParams = city ? { city } : {};
  // One shuffle seed per visit: the backend orders the default feed
  // seed-stably (random but consistent across pages) and interleaves
  // companies. Generated here so the SSR prefetch and the client share the
  // same query key; a fresh page load reshuffles.
  const listingShuffleSeed = crypto.randomUUID();
  const listingsSearchParams = normalizeListingSearchParams({
    ...currentFilters,
    seed: listingShuffleSeed,
    page: page - 1,
    size: PAGE_SIZE,
  });
  const facetSearchParams = normalizeListingSearchParams(currentFilters, {
    includePageable: false,
  });

  return (
    <PrefetchedQueryBoundary
      strategy="stream"
      prefetch={async (queryClient) => {
        await Promise.allSettled([
          queryClient.prefetchQuery({
            queryKey: qk.listings.list(listingsSearchParams),
            queryFn: () => listingService.getAll(listingsSearchParams),
          }),
          queryClient.prefetchQuery({
            queryKey: qk.listings.facets(facetSearchParams),
            queryFn: () => listingService.getFacets(facetSearchParams),
          }),
          queryClient.prefetchQuery({
            queryKey: qk.listings.tags(),
            queryFn: () => listingService.getListingTags(),
          }),
          queryClient.prefetchQuery({
            queryKey: qk.schools.list(),
            queryFn: () => schoolService.list(),
          }),
        ]);
      }}
    >
      <HousingPageClient listingShuffleSeed={listingShuffleSeed} />
    </PrefetchedQueryBoundary>
  );
}
