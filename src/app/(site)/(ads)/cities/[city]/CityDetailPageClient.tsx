"use client";

import SafeImage from "@/components/shared/SafeImage";
import ListingCardSkeleton from "@/features/listings/components/ListingCardSkeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { GraduationCapIcon, HomeIcon, MapPinIcon } from "@/components/icons";

import { LocalizedLink } from "@/components/i18n/LocalizedLink";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { RichTextParagraph } from "@/components/ui/RichText";
import type { BaseMarker } from "@/components/shared/map/BaseMap";
import { useAuth } from "@/context/AuthContext";
import { formatCityName } from "@/features/cities/city-utils";
import SimpleCompanyCard from "@/features/cities/components/SimpleCompanyCard";
import { useCityDetail } from "@/features/cities/hooks/useCities";
import type { CompanyPublicDTO } from "@/features/companies/services/company-service";
import ListingCardFromDTO from "@/features/listings/components/ListingCardFromDTO";
import {
  useFavorites,
  useListingsSearch,
  useToggleFavorite,
} from "@/features/listings/hooks/useListings";
import {
  listingService,
  normalizeListingSearchParams,
  type ListingSearchParams,
} from "@/features/listings/services/listing-service";
import { useI18n } from "@/i18n/I18nProvider";
import { localizedText } from "@/i18n/text";
import { qk } from "@/lib/query/keys";
import type { CityCompanyDTO } from "@/types/city";
import type { ListingCardDTO } from "@/types/listing";

const CityPointsMap = dynamic(() => import("@/components/shared/map/BaseMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full animate-pulse rounded-3xl bg-gray-100" />
  ),
});

const ListingsMap = dynamic(() => import("@/components/shared/map/ListingsMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full animate-pulse rounded-3xl bg-gray-100" />
  ),
});

const inlineLinkButtonClassName =
  "inline-flex shrink-0 items-center justify-center text-sm font-semibold leading-tight text-brand underline-offset-4 transition-colors hover:text-[#005b33] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand";

const CITY_LISTINGS_PAGE_SIZE = 6;
const CITY_MAP_PAGE_SIZE = 500;

type CityMapLayer = "homes" | "schools" | "activities";

const decodeRouteParam = (value: string | undefined) => {
  if (!value) return "";

  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

const cityCompanyToPublicCompany = (
  company: CityCompanyDTO,
  cityName: string
): CompanyPublicDTO | null => {
  if (typeof company.id !== "number" || !company.name?.trim()) {
    return null;
  }

  return {
    id: company.id,
    name: company.name.trim(),
    subtitle: company.subtitle ?? null,
    description: company.description ?? company.subtitle ?? null,
    websiteUrl: company.websiteUrl ?? null,
    logoUrl: company.logoUrl ?? null,
    bannerUrl: company.bannerUrl ?? null,
    cities: [cityName],
  };
};

const hasMapCoordinates = (value: { lat?: number | null; lng?: number | null }) =>
  Number.isFinite(value.lat) && Number.isFinite(value.lng);

const getTotalPagesFromResponse = (res: unknown, pageSize: number) => {
  if (!res || typeof res !== "object") {
    return 1;
  }

  const response = res as {
    totalPages?: number;
    totalElements?: number;
    page?: { totalPages?: number; totalElements?: number };
  };

  return (
    response.totalPages ??
    response.page?.totalPages ??
    (response.totalElements != null
      ? Math.ceil(response.totalElements / pageSize)
      : response.page?.totalElements != null
        ? Math.ceil(response.page.totalElements / pageSize)
        : 1)
  );
};

const getTotalElementsFromResponse = (res: unknown) => {
  if (!res || typeof res !== "object") {
    return 0;
  }

  const response = res as {
    totalElements?: number;
    page?: { totalElements?: number };
  };

  return response.totalElements ?? response.page?.totalElements ?? 0;
};

const uniqueListingsById = (items: ListingCardDTO[]) => {
  const byId = new Map<string, ListingCardDTO>();
  items.forEach((item) => {
    if (!byId.has(item.id)) {
      byId.set(item.id, item);
    }
  });
  return Array.from(byId.values());
};

function CityPointPopup({
  title,
  meta,
  variant,
}: {
  title: string;
  meta: string;
  variant: "school" | "activity";
}) {
  return (
    <div className="w-[260px] rounded-2xl bg-white p-4 text-sm shadow-sm">
      <div
        className={
          variant === "school"
            ? "mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-700"
            : "mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-pink-50 text-pink-700"
        }
      >
        {variant === "school" ? (
          <GraduationCapIcon className="h-5 w-5" />
        ) : (
          <MapPinIcon className="h-5 w-5" />
        )}
      </div>
      <p className="font-semibold leading-snug text-gray-950">{title}</p>
      <p className="mt-1 text-xs font-medium uppercase tracking-normal text-gray-500">
        {meta}
      </p>
    </div>
  );
}

export default function CityDetailPage() {
  const params = useParams<{ city: string }>();
  const router = useRouter();
  const { locale, localizedHref } = useI18n();
  const { user } = useAuth();
  const homesSectionRef = useRef<HTMLElement | null>(null);
  const routeCity = decodeRouteParam(params?.city);
  const fallbackCityName = formatCityName(routeCity) || localizedText(locale, "Stad", "City");

  // City detail — companies, external companies, schools, activities, banner.
  // All keyed on the normalized city code so two spellings collapse to one
  // cache entry. The page renders progressively from `cityDetail` once it
  // resolves.
  const {
    data: cityDetail,
    isLoading: cityDetailLoading,
    isError: isCityDetailError,
  } = useCityDetail(routeCity || fallbackCityName);

  const cityName = formatCityName(cityDetail?.city ?? fallbackCityName) || fallbackCityName;
  const cityDescription = cityDetail?.description?.trim() || "";
  const cityBannerUrl = cityDetail?.bannerUrl?.trim() || null;

  const [cityListingsPage, setCityListingsPage] = useState(1);

  useEffect(() => {
    setCityListingsPage(1);
  }, [cityName]);

  // Listings in this city — paged card section, 6 items per page.
  // The map below has its own all-pages query so map markers are not limited by
  // this card page size.
  const cityListingsSearchParams = useMemo<ListingSearchParams>(
    () => ({
      city: cityName,
      page: cityListingsPage - 1,
      size: CITY_LISTINGS_PAGE_SIZE,
    }),
    [cityName, cityListingsPage]
  );
  const {
    data: listingsPage,
    isLoading: listingsLoading,
    isError: isListingsError,
  } = useListingsSearch(cityListingsSearchParams);
  const listings = listingsPage?.content ?? [];
  const listingsTotalPages = getTotalPagesFromResponse(
    listingsPage,
    CITY_LISTINGS_PAGE_SIZE
  );
  const listingsTotalElements = getTotalElementsFromResponse(listingsPage);
  const listingsError = isListingsError
    ? localizedText(
        locale,
        "Kunde inte ladda bostäder i staden.",
        "Could not load homes in the city.",
      )
    : null;

  const cityMapSearchParams = useMemo(
    () =>
      normalizeListingSearchParams(
        { city: cityName },
        {
          includePageable: false,
        }
      ),
    [cityName]
  );

  const mapListingsQuery = useQuery<ListingCardDTO[]>({
    queryKey: qk.listings.map(cityMapSearchParams),
    enabled: Boolean(cityName),
    staleTime: 30_000,
    queryFn: async () => {
      const firstPage = await listingService.getAll({
        ...cityMapSearchParams,
        page: 0,
        size: CITY_MAP_PAGE_SIZE,
      });

      const pageCount = Math.max(
        1,
        getTotalPagesFromResponse(firstPage, CITY_MAP_PAGE_SIZE)
      );
      const pages = [firstPage.content ?? []];

      if (pageCount > 1) {
        const remainingPages = await Promise.all(
          Array.from({ length: pageCount - 1 }, (_, index) =>
            listingService.getAll({
              ...cityMapSearchParams,
              page: index + 1,
              size: CITY_MAP_PAGE_SIZE,
            })
          )
        );

        pages.push(...remainingPages.map((res) => res.content ?? []));
      }

      return uniqueListingsById(pages.flat());
    },
  });
  const mapListings = mapListingsQuery.data ?? listings;
  const mapListingsCount =
    listingsTotalElements > 0 ? listingsTotalElements : mapListings.length;

  useEffect(() => {
    if (listingsTotalPages > 0 && cityListingsPage > listingsTotalPages) {
      setCityListingsPage(listingsTotalPages);
    }
  }, [cityListingsPage, listingsTotalPages]);

  const goToCityListingsPage = useCallback(
    (nextPage: number) => {
      const clampedPage = Math.min(
        Math.max(1, nextPage),
        Math.max(listingsTotalPages, 1)
      );
      setCityListingsPage(clampedPage);
      window.requestAnimationFrame(() => {
        homesSectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    },
    [listingsTotalPages]
  );

  // Favorites: one shared cache entry across the whole app. Toggling here
  // updates every page that reads from the same key (saved/, housing/, etc.)
  // — `useToggleFavorite` owns optimistic patch + rollback.
  const { data: favoritesData } = useFavorites();
  const favoriteIds = useMemo(
    () => new Set((favoritesData ?? []).map((listing) => listing.id)),
    [favoritesData],
  );
  const toggleFavorite = useToggleFavorite();

  // Derived: companies / external companies. `cityDetail` is the single
  // source of truth — re-derive on the fly instead of mirroring into state
  // (which is what the old code did and which is what caused the stale-data
  // window on page rehydration).
  const companies = useMemo<CompanyPublicDTO[]>(
    () =>
      (cityDetail?.companies ?? [])
        .map((company) => cityCompanyToPublicCompany(company, cityName))
        .filter((company): company is CompanyPublicDTO => company !== null),
    [cityDetail, cityName],
  );
  const externalCompanies = useMemo<CompanyPublicDTO[]>(
    () =>
      (cityDetail?.externalCompanies ?? [])
        .map((company) => cityCompanyToPublicCompany(company, cityName))
        .filter((company): company is CompanyPublicDTO => company !== null),
    [cityDetail, cityName],
  );
  const companiesLoading = cityDetailLoading;
  const companiesError = isCityDetailError
    ? localizedText(locale, "Kunde inte ladda företag.", "Could not load companies.")
    : null;

  const [mapLayer, setMapLayer] = useState<CityMapLayer>("homes");
  const [selectedActivityCategories, setSelectedActivityCategories] = useState<Set<string>>(
    new Set(),
  );

  const handleFavoriteToggle = (id: string, isFavorite: boolean) => {
    if (!user) {
      router.push(localizedHref("/login"));
      return;
    }
    // Optimistic patch + rollback live inside the hook. Errors are surfaced
    // there via toast/log paths — we don't need a per-page rollback.
    toggleFavorite.mutate({ listingId: id, nextIsFavorite: isFavorite });
  };

  const schools = cityDetail?.schools ?? [];
  const studentActivities = cityDetail?.studentActivities ?? [];
  const activityCategories = useMemo(
    () =>
      Array.from(
        new Set(
          studentActivities
            .map((activity) => activity.category?.trim())
            .filter((category): category is string => Boolean(category))
        )
      ).sort((left, right) => left.localeCompare(right, locale === "en" ? "en" : "sv")),
    [studentActivities, locale]
  );
  const activityCategoryKey = activityCategories.join("|");

  useEffect(() => {
    setSelectedActivityCategories(new Set(activityCategories));
  }, [activityCategoryKey, cityDetail?.code]);

  const toggleActivityCategory = (category: string) => {
    setSelectedActivityCategories((current) => {
      const next = new Set(current);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const visibleStudentActivities = useMemo(
    () =>
      studentActivities.filter((activity) => {
        const category = activity.category?.trim();
        return category ? selectedActivityCategories.has(category) : false;
      }),
    [studentActivities, selectedActivityCategories]
  );

  const schoolMarkers = useMemo<BaseMarker[]>(
    () =>
      schools
        .filter(hasMapCoordinates)
        .map((school, index) => {
          const name = school.name?.trim() || localizedText(locale, "Skola", "School");
          return {
            id: `school-${school.id ?? `${name}-${index}`}`,
            position: [school.lat as number, school.lng as number],
            variant: "school",
            popup: (
              <CityPointPopup
                title={name}
                meta={localizedText(locale, "Skola", "School")}
                variant="school"
              />
            ),
          };
        }),
    [schools, locale]
  );

  const activityMarkers = useMemo<BaseMarker[]>(
    () =>
      visibleStudentActivities
        .filter(hasMapCoordinates)
        .map((activity, index) => {
          const name = activity.name?.trim() || localizedText(locale, "Aktivitet", "Activity");
          const category = activity.category?.trim() || localizedText(locale, "Aktivitet", "Activity");
          return {
            id: `activity-${activity.id ?? `${name}-${category}-${index}`}`,
            position: [activity.lat as number, activity.lng as number],
            variant: "activity",
            popup: <CityPointPopup title={name} meta={category} variant="activity" />,
          };
        }),
    [visibleStudentActivities, locale]
  );

  const activePointMarkers = mapLayer === "schools" ? schoolMarkers : activityMarkers;
  const mapLayerOptions = [
    {
      value: "homes" as const,
      label: localizedText(locale, "Bostäder", "Homes"),
      count: mapListingsCount,
      icon: HomeIcon,
    },
    {
      value: "schools" as const,
      label: localizedText(locale, "Skolor", "Schools"),
      count: schools.length,
      icon: GraduationCapIcon,
    },
    {
      value: "activities" as const,
      label: localizedText(locale, "Aktiviteter", "Activities"),
      count: studentActivities.length,
      icon: MapPinIcon,
    },
  ];
  const emptyMapMessage =
    mapLayer === "homes" && mapListingsQuery.isLoading
      ? localizedText(
          locale,
          "Hämtar alla bostäder till kartan...",
          "Loading all homes for the map..."
        )
      : mapLayer === "homes" && mapListingsQuery.isError
        ? localizedText(
            locale,
            "Kunde inte ladda alla bostäder till kartan.",
            "Could not load all homes for the map."
          )
        : mapLayer === "schools" && schoolMarkers.length === 0
          ? localizedText(locale, "Inga skolor med koordinater.", "No schools with coordinates.")
          : mapLayer === "activities" && activityMarkers.length === 0
            ? localizedText(locale, "Inga aktiviteter valda.", "No activities selected.")
            : null;

  return (
    <main className="flex h-auto w-full flex-col pb-10 pt-3 sm:pb-12 sm:pt-4">
      <div className="container mx-auto h-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <section className="mt-4 w-full sm:mt-8 lg:mt-10">
          <div
            className="relative min-h-[180px] w-full overflow-hidden rounded-[22px] bg-gray-100 shadow-[0_14px_34px_rgba(15,23,42,0.08)] sm:aspect-[1440/425] sm:min-h-0 sm:rounded-3xl"
          >
            {cityBannerUrl ? (
              <SafeImage
                src={cityBannerUrl}
                alt=""
                fill
                priority
                sizes="(max-width: 1280px) 100vw, 1280px"
                className="object-cover object-center"
                aria-hidden
              />
            ) : null}
          </div>

          <div className="mx-auto max-w-4xl px-1 pt-5 sm:px-6 sm:pt-9">
            <h1 className="text-[28px] font-bold leading-tight text-gray-900 sm:text-3xl">
              {cityName}
            </h1>
            {cityDescription && (
              <RichTextParagraph
                text={cityDescription}
                className="mt-3 text-[15px] leading-relaxed text-gray-600 sm:mt-4 sm:text-base"
              />
            )}
          </div>
        </section>

        <div className="mt-8 flex flex-col gap-10 sm:mt-10 lg:mt-12 lg:gap-12">
          <section ref={homesSectionRef} className="order-2 w-full lg:order-1">
            <div className="mb-4 flex items-center justify-between gap-3 sm:mb-5">
              <h2 className="min-w-0 text-lg font-semibold leading-tight text-gray-900">
                {localizedText(locale, `Bostäder i ${cityName}`, `Homes in ${cityName}`)}
              </h2>
              <LocalizedLink
                href={`/housing?city=${encodeURIComponent(cityName)}&page=1`}
                className={inlineLinkButtonClassName}
              >
                {localizedText(locale, "Visa alla", "Show all")}
              </LocalizedLink>
            </div>

            {listingsError && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                {listingsError}
              </div>
            )}

            {listingsLoading ? (
              <div
                className="grid grid-cols-1 justify-items-center gap-4 sm:gap-5 md:grid-cols-2 lg:gap-6 xl:grid-cols-3"
                aria-busy="true"
              >
                {Array.from({ length: 3 }, (_, index) => (
                  <div key={`listing-skeleton-${index}`} className="flex w-full justify-center">
                    <ListingCardSkeleton />
                  </div>
                ))}
              </div>
            ) : listings.length === 0 ? (
              <div className="rounded-2xl border border-black/5 bg-white px-4 py-10 text-center text-sm text-gray-500 shadow-sm">
                {localizedText(locale, `Inga bostäder hittades i ${cityName} just nu.`, `No homes were found in ${cityName} right now.`)}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 justify-items-center gap-4 sm:gap-5 md:grid-cols-2 lg:gap-6 xl:grid-cols-3">
                  {listings.map((listing) => (
                    <div key={listing.id} className="flex w-full justify-center">
                      <ListingCardFromDTO
                        listing={listing}
                        isFavorite={favoriteIds.has(listing.id)}
                        onFavoriteToggle={handleFavoriteToggle}
                        onOpen={(id) => router.push(localizedHref(`/housing/${id}`))}
                      />
                    </div>
                  ))}
                </div>

                <PaginationControls
                  className="mt-7 sm:mt-8"
                  currentPage={cityListingsPage}
                  totalPages={listingsTotalPages}
                  onPageChange={goToCityListingsPage}
                  isDisabled={listingsLoading}
                  ariaLabel={localizedText(locale, "Sidnavigering för bostäder i staden", "Pagination for homes in the city")}
                  previousLabel={localizedText(locale, "Föregående", "Previous")}
                  nextLabel={localizedText(locale, "Nästa", "Next")}
                  pageLabel={(pageNumber) =>
                    localizedText(locale, `Sida ${pageNumber}`, `Page ${pageNumber}`)
                  }
                />
              </>
            )}
          </section>

          <section className="order-1 w-full lg:order-2">
            <div className="mb-4 flex flex-col gap-3 lg:mb-5 lg:flex-row lg:items-center lg:justify-between">
              <h2 className="text-lg font-semibold leading-tight text-gray-900">
                {localizedText(locale, "Karta", "Map")}
              </h2>
              <div className="flex min-w-0 flex-col gap-3 lg:items-end">
                <div
                  role="tablist"
                  aria-label={localizedText(locale, "Kartlager", "Map layer")}
                  className="grid w-full grid-cols-3 overflow-hidden rounded-full border border-black/10 bg-white p-1 shadow-sm sm:inline-flex sm:w-auto"
                >
                  {mapLayerOptions.map((option) => {
                    const Icon = option.icon;
                    const isActive = mapLayer === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => setMapLayer(option.value)}
                        className={`flex min-w-0 items-center justify-center gap-1.5 rounded-full px-2 py-2 text-[11px] font-semibold transition sm:flex-none sm:gap-2 sm:px-4 sm:text-xs ${
                          isActive
                            ? "bg-brand text-white shadow-sm"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="truncate">{option.label}</span>
                        <span
                          className={`rounded-full px-1.5 py-0.5 text-[10px] sm:text-[11px] ${
                            isActive ? "bg-white/15 text-white" : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {option.count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {mapLayer === "activities" && activityCategories.length > 0 && (
                  <div className="flex max-w-full flex-wrap justify-start gap-2 lg:justify-end">
                    <button
                      type="button"
                      onClick={() => setSelectedActivityCategories(new Set(activityCategories))}
                      className="h-8 rounded-full border border-black/10 px-3 text-xs font-semibold text-brand transition hover:bg-brand/5"
                    >
                      {localizedText(locale, "Alla", "All")}
                    </button>
                    {activityCategories.map((category) => {
                      const isActive = selectedActivityCategories.has(category);
                      return (
                        <button
                          key={category}
                          type="button"
                          aria-pressed={isActive}
                          onClick={() => toggleActivityCategory(category)}
                          className={`inline-flex h-8 max-w-full items-center gap-2 rounded-full border px-3 text-xs font-semibold transition ${
                            isActive
                              ? "border-pink-200 bg-pink-50 text-pink-800"
                              : "border-black/10 bg-white text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          <span
                            className={`h-2 w-2 shrink-0 rounded-full ${
                              isActive ? "bg-pink-600" : "bg-gray-300"
                            }`}
                          />
                          <span className="truncate">{category}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
            <div className="relative isolate z-0 h-[430px] min-h-[360px] max-h-[560px] w-full overflow-hidden rounded-[24px] border border-black/5 shadow-[0_18px_45px_rgba(0,0,0,0.05)] sm:h-[500px] sm:min-h-[440px] sm:rounded-3xl lg:h-[70vh] lg:min-h-[520px] lg:max-h-[860px]">
              {emptyMapMessage && (
                <div className="pointer-events-none absolute left-3 right-3 top-3 z-[600] rounded-2xl bg-white/95 px-3 py-2 text-xs font-semibold text-gray-700 shadow-sm sm:left-4 sm:right-auto sm:top-4 sm:rounded-full sm:px-4 sm:text-sm">
                  {emptyMapMessage}
                </div>
              )}
              {mapLayer === "homes" ? (
                <ListingsMap
                  listings={mapListings}
                  className="h-full w-full"
                  fillContainer
                  getIsFavorite={(id) => favoriteIds.has(id)}
                  onFavoriteToggle={handleFavoriteToggle}
                  onOpenListing={(id) => router.push(localizedHref(`/housing/${id}`))}
                />
              ) : (
                <CityPointsMap
                  key={mapLayer}
                  markers={activePointMarkers}
                  className="h-full w-full"
                  fillContainer
                  center={[62, 15]}
                  zoom={5}
                />
              )}
            </div>
          </section>
        </div>

        <section className="mt-10 w-full sm:mt-12">
          <div className="mb-4 flex items-center justify-between gap-3 sm:mb-5">
            <h2 className="min-w-0 text-lg font-semibold leading-tight text-gray-900">
              {localizedText(locale, `Företag i ${cityName}`, `Companies in ${cityName}`)}
            </h2>
            <LocalizedLink
              href={`/all-queues?city=${encodeURIComponent(cityName)}`}
              className={inlineLinkButtonClassName}
            >
              {localizedText(locale, "Sök alla", "Search all")}
            </LocalizedLink>
          </div>

          {companiesError && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {companiesError}
            </div>
          )}

          {companiesLoading ? (
            <div
              className="grid w-full grid-cols-1 justify-start gap-8 md:grid-cols-2 lg:grid-cols-3"
              aria-busy="true"
            >
              {Array.from({ length: 3 }, (_, index) => (
                <Skeleton
                  key={`company-skeleton-${index}`}
                  className="min-h-[18rem] w-full rounded-lg motion-reduce:animate-none sm:min-h-80"
                />
              ))}
            </div>
          ) : companies.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-500">
              {localizedText(locale, "Inga företag hittades just nu.", "No companies were found right now.")}
            </div>
          ) : (
            <div className="grid w-full grid-cols-1 justify-start gap-8 md:grid-cols-2 lg:grid-cols-3">
              {companies.map((company) => (
                <SimpleCompanyCard
                  key={company.id}
                  company={company}
                  description={company.subtitle ?? company.description}
                  href={localizedHref(`/all-queues/${company.id}`)}
                />
              ))}
            </div>
          )}
        </section>

        <section className="mt-10 w-full sm:mt-12">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 sm:mb-5">
            {localizedText(locale, `Övriga företag i ${cityName}`, `Other companies in ${cityName}`)}
          </h2>

          {companiesError && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {companiesError}
            </div>
          )}

          {companiesLoading ? (
            <div
              className="grid w-full grid-cols-1 justify-start gap-4 sm:gap-5 md:grid-cols-2 lg:gap-6 xl:grid-cols-3"
              aria-busy="true"
            >
              {Array.from({ length: 3 }, (_, index) => (
                <Skeleton
                  key={`external-company-skeleton-${index}`}
                  className="h-24 w-full rounded-lg motion-reduce:animate-none"
                />
              ))}
            </div>
          ) : externalCompanies.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-500">
              {localizedText(locale, "Inga andra företag hittades just nu.", "No other companies were found right now.")}
            </div>
          ) : (
            <div className="grid w-full grid-cols-1 justify-start gap-4 sm:gap-5 md:grid-cols-2 lg:gap-6 xl:grid-cols-3">
              {externalCompanies.map((company) => (
                <SimpleCompanyCard key={company.id} company={company} size="compact" />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
