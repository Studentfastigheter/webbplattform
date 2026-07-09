import CityDetailPageClient from "./CityDetailPageClient";

import { cityService, normalizeCityCode } from "@/features/cities/services/city-service";
import { listingService, normalizeListingSearchParams } from "@/features/listings/services/listing-service";
import { PrefetchedQueryBoundary } from "@/lib/query/PrefetchedQueryBoundary";
import { qk } from "@/lib/query/keys";
import type { CityDetailedDTO } from "@/types/city";

const CITY_LISTINGS_PAGE_SIZE = 6;

type CityDetailPageProps = {
  params: Promise<{ city: string }>;
};

function decodeRouteParam(value: string | undefined) {
  if (!value) return "";

  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export default async function CityDetailPage({ params }: CityDetailPageProps) {
  const { city } = await params;
  const routeCity = decodeRouteParam(city);
  const normalizedCityCode = normalizeCityCode(routeCity);
  // One shuffle seed per visit — see the housing page: keeps the backend's
  // shuffled feed order stable across the client's pagination while sharing
  // the query key with the SSR prefetch below.
  const listingShuffleSeed = crypto.randomUUID();

  return (
    <PrefetchedQueryBoundary
      prefetch={async (queryClient) => {
        let cityDetail: CityDetailedDTO | undefined;

        await queryClient
          .prefetchQuery({
            queryKey: qk.cities.detail(normalizedCityCode),
            queryFn: async () => {
              cityDetail = await cityService.get(normalizedCityCode);
              return cityDetail;
            },
          })
          .catch(() => undefined);

        cityDetail ??= queryClient.getQueryData<CityDetailedDTO>(
          qk.cities.detail(normalizedCityCode),
        );

        // Listings are prefetched on the stable city code relation — the same
        // key the client uses — so no display-name spelling can miss the cache.
        const cityCode = cityDetail?.code ?? normalizedCityCode;
        const cityListingsSearchParams = normalizeListingSearchParams({
          cityCode,
          seed: listingShuffleSeed,
          page: 0,
          size: CITY_LISTINGS_PAGE_SIZE,
        });

        if (!cityCode) {
          return;
        }

        await queryClient.prefetchQuery({
          queryKey: qk.listings.list(cityListingsSearchParams),
          queryFn: () => listingService.getAll(cityListingsSearchParams),
        });
      }}
    >
      <CityDetailPageClient listingShuffleSeed={listingShuffleSeed} />
    </PrefetchedQueryBoundary>
  );
}
