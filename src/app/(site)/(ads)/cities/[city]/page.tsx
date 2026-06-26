import CityDetailPageClient from "./CityDetailPageClient";

import { formatCityName } from "@/features/cities/city-utils";
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

        const fallbackCityName = formatCityName(routeCity) || routeCity;
        const cityName =
          formatCityName(cityDetail?.city ?? fallbackCityName) || fallbackCityName;
        const cityListingsSearchParams = normalizeListingSearchParams({
          city: cityName,
          page: 0,
          size: CITY_LISTINGS_PAGE_SIZE,
        });

        if (!cityName) {
          return;
        }

        await queryClient.prefetchQuery({
          queryKey: qk.listings.list(cityListingsSearchParams),
          queryFn: () => listingService.getAll(cityListingsSearchParams),
        });
      }}
    >
      <CityDetailPageClient />
    </PrefetchedQueryBoundary>
  );
}
