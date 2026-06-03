"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import {
  Building2,
  Car,
  Cat,
  CookingPot,
  Search,
  Sofa,
  Sparkles,
  Wifi,
  WashingMachine,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

import ListingCardFromDTO from "@/features/listings/components/ListingCardFromDTO";
import ListingsFilterButton, {
  type ListingsFilterState,
} from "@/features/listings/components/Search/ListingsFilterButton";
import { FieldSet } from "@/components/ui/field";
import SwitchSelect, { SwitchSelectValue } from "@/components/ui/switchSelect";

import {
  listingService,
  type ListingSearchFacetsDTO,
  type ListingSearchParams,
} from "@/features/listings/services/listing-service";
import {
  useFavorites,
  useListingFacets,
  useListingTags,
  useListingsSearch,
  useToggleFavorite,
} from "@/features/listings/hooks/useListings";
import { useSchools } from "@/features/schools/hooks/useSchools";
import {
  demographicsService,
  getClientDeviceType,
} from "@/features/analytics/services/demographics-service";
import { qk } from "@/lib/query/keys";
import { ListingCardDTO } from "@/types/listing";

const ListingsMap = dynamic(() => import("@/components/shared/map/ListingsMap"), {
  ssr: false,
  loading: () => (
    <div
      className="min-h-[300px] rounded-2xl bg-gray-100 sm:min-h-[400px] lg:min-h-[520px]"
      aria-hidden
    />
  ),
});

const PAGE_SIZE = 15;
const MAP_PAGE_SIZE = 500;
const priceBounds = { min: 0, max: 20000 };

const propertyTypeOptions = [
  { id: "APARTMENT", label: "Lägenhet" },
  { id: "ROOM", label: "Rum" },
  { id: "CORRIDOR_ROOM", label: "Korridorsrum" },
];

const hostTypeOptions = [
  { id: "COMPANY", label: "Företag" },
  { id: "PRIVATE", label: "Privat värd" },
];

const amenityOptions = [
  { id: "BALCONY", label: "Balkong", icon: <Sparkles className="h-6 w-6" /> },
  {
    id: "DISHWASHER",
    label: "Diskmaskin",
    icon: <CookingPot className="h-6 w-6" />,
  },
  { id: "PARKING", label: "Parkering", icon: <Car className="h-6 w-6" /> },
  {
    id: "PET_FRIENDLY",
    label: "Husdjur",
    icon: <Cat className="h-6 w-6" />,
  },
  { id: "ELEVATOR", label: "Hiss", icon: <Building2 className="h-6 w-6" /> },
  {
    id: "LAUNDRY",
    label: "Tvätt",
    icon: <WashingMachine className="h-6 w-6" />,
  },
  {
    id: "FURNISHED",
    label: "Möblerad",
    icon: <Sofa className="h-6 w-6" />,
  },
  {
    id: "INTERNET_INCLUDED",
    label: "Internet",
    icon: <Wifi className="h-6 w-6" />,
  },
];

type AmenityOption = {
  id: string;
  label: string;
  icon?: ReactNode;
};

const amenityIconByKey: Record<string, ReactNode> = {
  balcony: <Sparkles className="h-6 w-6" />,
  balkong: <Sparkles className="h-6 w-6" />,
  dishwasher: <CookingPot className="h-6 w-6" />,
  diskmaskin: <CookingPot className="h-6 w-6" />,
  parking: <Car className="h-6 w-6" />,
  parkering: <Car className="h-6 w-6" />,
  pet_friendly: <Cat className="h-6 w-6" />,
  husdjur: <Cat className="h-6 w-6" />,
  elevator: <Building2 className="h-6 w-6" />,
  hiss: <Building2 className="h-6 w-6" />,
  laundry: <WashingMachine className="h-6 w-6" />,
  tvätt: <WashingMachine className="h-6 w-6" />,
  furnished: <Sofa className="h-6 w-6" />,
  möblerad: <Sofa className="h-6 w-6" />,
  internet_included: <Wifi className="h-6 w-6" />,
  internet: <Wifi className="h-6 w-6" />,
};

function toAmenityOptions(
  tags: { tagKey?: string | null; displayName: string; icon?: string | null }[]
) {
  const mapped = tags
    .map<AmenityOption | null>((tag) => {
      const label = tag.displayName.trim();
      if (!label) return null;

      const normalizedKey = label.toLowerCase().replace(/\s+/g, "_");
      const normalizedTagKey = tag.tagKey?.toLowerCase() ?? "";
      return {
        id: tag.tagKey?.trim() || label,
        label,
        icon:
          amenityIconByKey[normalizedTagKey] ??
          amenityIconByKey[normalizedKey] ??
          amenityIconByKey[tag.icon?.toLowerCase() ?? ""],
      };
    })
    .filter((item): item is AmenityOption => item !== null);

  return mapped.length > 0 ? mapped : amenityOptions;
}

const createDefaultListingsFilterState = (): ListingsFilterState => ({
  city: "",
  amenities: [],
  propertyType: null,
  priceRange: { ...priceBounds },
  hostType: null,
  schoolId: null,
  schoolLat: null,
  schoolLng: null,
});

const getPageFromParam = (value: string | null) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
};

const getTotalPagesFromResponse = (res: unknown) => {
  const response = res as {
    totalPages?: number;
    totalElements?: number;
    page?: { totalPages?: number; totalElements?: number };
  };

  return (
    response.totalPages ??
    response.page?.totalPages ??
    (response.totalElements != null
      ? Math.ceil(response.totalElements / MAP_PAGE_SIZE)
      : response.page?.totalElements != null
        ? Math.ceil(response.page.totalElements / MAP_PAGE_SIZE)
        : 1)
  );
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

const filtersToListingSearchParams = (
  filters: ListingsFilterState
): ListingSearchParams => {
  const city = filters.city.trim();
  const hasSchoolFilter =
    typeof filters.schoolLat === "number" &&
    typeof filters.schoolLng === "number";

  return {
    city: city || undefined,
    dwellingType: filters.propertyType ?? undefined,
    minRent:
      filters.priceRange.min > priceBounds.min
        ? filters.priceRange.min
        : undefined,
    maxRent:
      filters.priceRange.max < priceBounds.max
        ? filters.priceRange.max
        : undefined,
    hostType: filters.hostType ?? undefined,
    schoolTargetLat: hasSchoolFilter ? filters.schoolLat : undefined,
    schoolTargetLng: hasSchoolFilter ? filters.schoolLng : undefined,
    amenities: filters.amenities.length > 0 ? filters.amenities : undefined,
  };
};

const getFacetTotalHits = (facets: ListingSearchFacetsDTO | null) => {
  const total =
    facets?.totalHits ?? facets?.totalCount ?? facets?.totalElements ?? null;
  return typeof total === "number" && Number.isFinite(total) ? total : null;
};

const getFacetPriceHistogram = (facets: ListingSearchFacetsDTO | null) =>
  facets?.priceDistribution?.histogram?.map((bucket) => ({
    minRent: bucket.minRent,
    maxRent: bucket.maxRent,
    count: bucket.count,
  })) ?? [];

const getObservedRentRange = (facets: ListingSearchFacetsDTO | null) => {
  const distribution = facets?.priceDistribution;
  const min = distribution?.minRentObserved ?? distribution?.minRent;
  const max = distribution?.maxRentObserved ?? distribution?.maxRent;

  if (
    typeof min !== "number" ||
    typeof max !== "number" ||
    !Number.isFinite(min) ||
    !Number.isFinite(max)
  ) {
    return null;
  }

  return { min, max };
};

const getDwellingTypeCounts = (facets: ListingSearchFacetsDTO | null) =>
  facets?.dwellingTypeCounts?.reduce<Record<string, number>>((acc, item) => {
    if (item.dwellingType && typeof item.count === "number") {
      acc[item.dwellingType] = item.count;
    }
    return acc;
  }, {});

const getHostTypeCounts = (facets: ListingSearchFacetsDTO | null) => {
  if (!facets) return undefined;

  const companyCount =
    facets.companyCounts?.reduce(
      (sum, item) => sum + (item.listingCount ?? item.count ?? 0),
      0
    ) ?? 0;

  return {
    COMPANY: companyCount,
    PRIVATE: facets.privateLandlordCount ?? 0,
  };
};

export default function ListingsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const pageFromUrl = getPageFromParam(searchParams.get("page"));
  const cityFromUrl = searchParams.get("city")?.trim() ?? "";

  const [view, setView] = useState<SwitchSelectValue>("lista");
  const [searchInput, setSearchInput] = useState(cityFromUrl);
  const [filters, setFilters] = useState<ListingsFilterState>(() => ({
    ...createDefaultListingsFilterState(),
    city: cityFromUrl,
  }));
  const [filterPreview, setFilterPreview] = useState<ListingsFilterState>(() => ({
    ...createDefaultListingsFilterState(),
    city: cityFromUrl,
  }));

  const [page, setPage] = useState(pageFromUrl);

  const [hoveredListingId, setHoveredListingId] = useState<string | undefined>();
  const quickViewIncrementedIds = useRef<Set<string>>(new Set());
  const quickViewDemographicsRecordedIds = useRef<Set<string>>(new Set());

  // Reference data — schools + amenity tags. Cached long (10m / 5m).
  const { data: schoolsData } = useSchools();
  const schools = schoolsData ?? [];
  const { data: tagsData } = useListingTags();
  const availableAmenities = useMemo<AmenityOption[]>(
    () => (tagsData ? toAmenityOptions(tagsData) : amenityOptions),
    [tagsData]
  );

  // Favorites — shared cache.
  const { data: favoritesData } = useFavorites();
  const favoriteIds = useMemo<Set<string>>(
    () => new Set((favoritesData ?? []).map((f) => f.id)),
    [favoritesData]
  );
  const toggleFavorite = useToggleFavorite();

  const updatePageInUrl = useCallback(
    (nextPage: number, mode: "push" | "replace" = "push") => {
      const nextParams = new URLSearchParams(searchParams.toString());
      nextParams.set("page", String(Math.max(1, nextPage)));
      const nextUrl = `${pathname}?${nextParams.toString()}`;

      if (mode === "replace") {
        router.replace(nextUrl, { scroll: false });
        return;
      }

      router.push(nextUrl, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  useEffect(() => {
    if (!searchParams.get("page")) {
      updatePageInUrl(1, "replace");
      return;
    }

    setPage(pageFromUrl);
  }, [pageFromUrl, searchParams, updatePageInUrl]);

  const handleFavoriteToggle = useCallback(
    (id: string, isFav: boolean) => {
      if (!user) {
        alert("Du måste vara inloggad för att spara bostäder");
        return;
      }

      // Optimistic patch + rollback handled by useToggleFavorite. Demographics
      // recording stays as a fire-and-forget side effect.
      toggleFavorite.mutate({ listingId: id, nextIsFavorite: isFav });

      if (isFav) {
        demographicsService
          .recordListingView(id, {
            deviceType: getClientDeviceType(),
            viewType: "QUICK",
            resultedInLike: true,
          })
          .catch((err) =>
            console.error("Failed to record favorite demographics:", err)
          );
      }
    },
    [user, toggleFavorite]
  );

  const currentFilters = useMemo(
    () => filtersToListingSearchParams(filters),
    [filters]
  );

  const previewSearchFilters = useMemo(
    () => filtersToListingSearchParams(filterPreview),
    [filterPreview]
  );

  const previewPriceSearchFilters = useMemo(
    () =>
      filtersToListingSearchParams({
        ...filterPreview,
        priceRange: { ...priceBounds },
      }),
    [
      filterPreview.amenities,
      filterPreview.city,
      filterPreview.hostType,
      filterPreview.propertyType,
      filterPreview.schoolLat,
      filterPreview.schoolLng,
    ]
  );

  useEffect(() => {
    setFilterPreview(filters);
  }, [filters]);

  // Debounced versions of the filter-preview params. We feed these into the
  // facet hooks as queryKey inputs so the debounce gates the actual request
  // exactly the way the old setTimeout did \u2014 but cached and shared across
  // identical param tuples.
  const [debouncedPreviewSearchFilters, setDebouncedPreviewSearchFilters] =
    useState<ListingSearchParams>(previewSearchFilters);
  const [debouncedPreviewPriceSearchFilters, setDebouncedPreviewPriceSearchFilters] =
    useState<ListingSearchParams>(previewPriceSearchFilters);

  useEffect(() => {
    const id = window.setTimeout(
      () => setDebouncedPreviewSearchFilters(previewSearchFilters),
      250
    );
    return () => window.clearTimeout(id);
  }, [previewSearchFilters]);

  useEffect(() => {
    const id = window.setTimeout(
      () => setDebouncedPreviewPriceSearchFilters(previewPriceSearchFilters),
      250
    );
    return () => window.clearTimeout(id);
  }, [previewPriceSearchFilters]);

  // Applied facets (no debounce \u2014 only changes when the user actually
  // commits a filter). One cache entry per currentFilters tuple.
  const { data: appliedFacetsData } = useListingFacets(currentFilters);
  const appliedFacets = appliedFacetsData ?? null;

  // Preview facets \u2014 debounced. Note that previewSearchFilters and
  // debouncedPreviewSearchFilters can produce the SAME tuple in which case
  // both share one cache entry; that's the source of the existing extra
  // call that often duplicated. We don't try to dedupe further here; it's
  // safe.
  const {
    data: previewFacetsData,
    isError: previewFacetsIsError,
    isFetching: previewFacetsFetching,
  } = useListingFacets(debouncedPreviewSearchFilters);
  const previewFacets = previewFacetsData ?? null;
  const previewFacetsLoading = previewFacetsFetching;
  const previewFacetsError = previewFacetsIsError
    ? "Kunde inte h\u00e4mta antal tr\u00e4ffar."
    : null;

  const { data: previewPriceFacetsData } = useListingFacets(
    debouncedPreviewPriceSearchFilters
  );
  const previewPriceFacets = previewPriceFacetsData ?? null;

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.propertyType) count += 1;
    if (filters.hostType) count += 1;
    if (
      filters.priceRange.min > priceBounds.min ||
      filters.priceRange.max < priceBounds.max
    ) {
      count += 1;
    }
    if (
      typeof filters.schoolLat === "number" &&
      typeof filters.schoolLng === "number"
    ) {
      count += 1;
    }
    count += filters.amenities.length;
    return count;
  }, [filters]);

  const isMapView = view === "karta";

  // Listings list — paged. Cached per (filters, page, size). Going back to
  // page N or to a previous filter tuple returns instantly from cache.
  // placeholderData keeps the previous page on screen while the next one
  // loads, so the user never sees an empty grid mid-pagination.
  const listingsSearchParams = useMemo<ListingSearchParams>(
    () => ({ ...currentFilters, page: page - 1, size: PAGE_SIZE }),
    [currentFilters, page]
  );
  const {
    data: listingsPageData,
    isLoading: listingsLoading,
    isError: listingsIsError,
  } = useListingsSearch(listingsSearchParams);

  const listings = listingsPageData?.content ?? [];
  const totalPages =
    (listingsPageData as any)?.totalPages ??
    (listingsPageData as any)?.page?.totalPages ??
    0;
  const totalElements =
    (listingsPageData as any)?.totalElements ??
    (listingsPageData as any)?.page?.totalElements ??
    0;
  const loading = listingsLoading;
  const error = listingsIsError ? "Kunde inte ladda bostäder." : null;

  // Fire-and-forget side effects: view-count increment + demographics,
  // once per id per session. Same Set-ref guard as before — runs whenever
  // the visible listings change.
  useEffect(() => {
    listings.forEach((listing) => {
      if (!quickViewIncrementedIds.current.has(listing.id)) {
        quickViewIncrementedIds.current.add(listing.id);
        listingService
          .incrementViews(listing.id, "QUICK")
          .catch((err) =>
            console.error("Failed to increment quick view:", err)
          );
      }

      if (user && !quickViewDemographicsRecordedIds.current.has(listing.id)) {
        quickViewDemographicsRecordedIds.current.add(listing.id);
        demographicsService
          .recordListingView(listing.id, {
            deviceType: getClientDeviceType(),
            viewType: "QUICK",
            resultedInLike: false,
          })
          .catch((err) =>
            console.error("Failed to record quick-view demographics:", err)
          );
      }
    });
    // listings identity is stable across re-renders unless data actually
    // changes (TanStack Query gives us structural sharing).
  }, [listings, user]);

  // Map view — a separate cache slot. The same filters produce TWO entries
  // (lista PAGE_SIZE vs karta MAP_PAGE_SIZE * pages); that's intentional.
  // Only fetches while in map view, via enabled.
  const mapQuery = useQuery<ListingCardDTO[]>({
    queryKey: qk.listings.map(currentFilters),
    enabled: isMapView,
    staleTime: 30_000,
    queryFn: async () => {
      const firstPage = await listingService.getAll({
        ...currentFilters,
        page: 0,
        size: MAP_PAGE_SIZE,
      });

      const pageCount = Math.max(1, getTotalPagesFromResponse(firstPage));
      const pages = [firstPage.content || []];

      if (pageCount > 1) {
        const remainingPages = await Promise.all(
          Array.from({ length: pageCount - 1 }, (_, index) =>
            listingService.getAll({
              ...currentFilters,
              page: index + 1,
              size: MAP_PAGE_SIZE,
            })
          )
        );

        pages.push(...remainingPages.map((res) => res.content || []));
      }

      return uniqueListingsById(pages.flat());
    },
  });
  const mapListings = isMapView ? mapQuery.data ?? [] : [];

  useEffect(() => {
    if (totalPages > 0 && page > totalPages) {
      setPage(totalPages);
      updatePageInUrl(totalPages, "replace");
    }
  }, [page, totalPages, updatePageInUrl]);

  const paginationPages = useMemo(() => {
    if (totalPages <= 1) return [];

    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, page + 2);
    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }, [page, totalPages]);

  const goToPage = useCallback(
    (nextPage: number) => {
      const clampedPage = Math.min(
        Math.max(1, nextPage),
        Math.max(totalPages, 1)
      );
      setPage(clampedPage);
      updatePageInUrl(clampedPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [totalPages, updatePageInUrl]
  );

  const facetTotalListingsCount = getFacetTotalHits(appliedFacets);
  const totalListingsCount =
    facetTotalListingsCount ?? (totalElements > 0 ? totalElements : listings.length);
  const previewFacetTotalCount = getFacetTotalHits(previewFacets);
  const priceDistributionFacets = previewPriceFacets ?? previewFacets;
  const previewPriceHistogram = getFacetPriceHistogram(priceDistributionFacets);
  const previewObservedRentRange = getObservedRentRange(priceDistributionFacets);
  const previewPropertyTypeCounts = getDwellingTypeCounts(previewFacets);
  const previewHostTypeCounts = getHostTypeCounts(previewFacets);
  const listingGridClasses = isMapView
    ? "grid grid-cols-1 gap-3 justify-items-center"
    : "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-3 md:gap-6 justify-items-center";

  const renderListingCard = (
    listing: ListingCardDTO,
    variant: "default" | "compact" = "default"
  ) => (
    <div key={listing.id} className="flex w-full justify-center">
      <ListingCardFromDTO
        listing={listing}
        isFavorite={favoriteIds.has(listing.id)}
        onFavoriteToggle={handleFavoriteToggle}
        onOpen={(id) => router.push(`/bostader/${id}`)}
        onHoverChange={
          isMapView
            ? (hovering) =>
                setHoveredListingId((current) =>
                  hovering ? listing.id : current === listing.id ? undefined : current
                )
            : undefined
        }
        variant={variant}
      />
    </div>
  );

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <nav
        className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
        aria-label="Sidnavigering för bostäder"
      >
        <button
          type="button"
          onClick={() => goToPage(page - 1)}
          disabled={page <= 1 || loading}
          className="h-10 rounded-full border border-black/15 px-4 text-sm font-semibold text-[#004225] transition hover:bg-[#004225]/5 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Föregående
        </button>

        <div className="flex items-center gap-2">
          {paginationPages[0] > 1 && (
            <>
              <button
                type="button"
                onClick={() => goToPage(1)}
                disabled={loading}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-black/15 text-sm font-semibold text-black transition hover:border-[#004225] hover:text-[#004225] disabled:cursor-not-allowed disabled:opacity-40"
              >
                1
              </button>
              <span className="px-1 text-sm text-black/45">...</span>
            </>
          )}

          {paginationPages.map((pageNumber) => {
            const isActive = pageNumber === page;
            return (
              <button
                key={pageNumber}
                type="button"
                onClick={() => goToPage(pageNumber)}
                disabled={isActive || loading}
                aria-current={isActive ? "page" : undefined}
                className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold transition ${
                  isActive
                    ? "border-[#004225] bg-[#004225] text-white"
                    : "border-black/15 text-black hover:border-[#004225] hover:text-[#004225]"
                } disabled:cursor-not-allowed`}
              >
                {pageNumber}
              </button>
            );
          })}

          {paginationPages[paginationPages.length - 1] < totalPages && (
            <>
              <span className="px-1 text-sm text-black/45">...</span>
              <button
                type="button"
                onClick={() => goToPage(totalPages)}
                disabled={loading}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-black/15 text-sm font-semibold text-black transition hover:border-[#004225] hover:text-[#004225] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {totalPages}
              </button>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => goToPage(page + 1)}
          disabled={page >= totalPages || loading}
          className="h-10 rounded-full border border-black/15 px-4 text-sm font-semibold text-[#004225] transition hover:bg-[#004225]/5 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Nästa
        </button>
      </nav>
    );
  };

  return (
    <main className="flex h-auto w-full flex-col gap-6 pb-12 pt-4 sm:gap-8">
      <div className="container mx-auto h-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <section className="mt-6 w-full sm:mt-12">
          <div className="flex w-full flex-col gap-3 sm:gap-4">
            <div className="flex w-full flex-col items-stretch gap-3 sm:gap-4 md:flex-row md:items-center md:justify-center lg:grid lg:grid-cols-[1fr_minmax(0,680px)_1fr] xl:grid-cols-[1fr_minmax(0,760px)_1fr] 2xl:grid-cols-[1fr_minmax(0,840px)_1fr]">
              <div className="w-full md:max-w-[620px] md:flex-1 lg:col-start-2 lg:max-w-none">
                <form
                  className="flex h-11 w-full items-center gap-2 rounded-full border border-black/10 bg-white py-1.5 pl-4 pr-1.5 shadow-[0_6px_18px_rgba(0,0,0,0.08)] sm:h-12 sm:gap-3 sm:pl-5 xl:h-14 xl:pl-6 xl:pr-2"
                  onSubmit={(event) => {
                    event.preventDefault();
                    setPage(1);
                    updatePageInUrl(1);
                    setFilters((prev) => ({
                      ...prev,
                      city: searchInput.trim(),
                    }));
                  }}
                >
                  <Search className="h-[18px] w-[18px] shrink-0 text-black/55 sm:h-5 sm:w-5" />
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(event) => setSearchInput(event.target.value)}
                    placeholder="Sök på stad"
                    className="min-w-0 flex-1 bg-transparent text-sm text-black outline-none placeholder:text-black/45 sm:text-base"
                  />
                  {searchInput && (
                    <button
                      type="button"
                      aria-label="Rensa sökning"
                      onClick={() => {
                        setSearchInput("");
                        setPage(1);
                        updatePageInUrl(1);
                        setFilters((prev) => ({ ...prev, city: "" }));
                      }}
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[#004225] transition-colors hover:bg-[#004225]/5 sm:h-8 sm:w-8"
                    >
                      <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </button>
                  )}
                  <button
                    type="submit"
                    className="h-8 shrink-0 rounded-full bg-[#004225] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#004225]/90 sm:h-9 sm:px-5 xl:h-10 xl:px-6"
                  >
                    Sök
                  </button>
                </form>
              </div>
              <div className="w-auto self-center md:shrink-0 lg:col-start-3 lg:justify-self-start">
                <ListingsFilterButton
                  variant="ghost"
                  size="icon-lg"
                  title="Avancerade filter"
                  triggerLabel={
                    activeFilterCount > 0
                      ? `Filtrera (${activeFilterCount})`
                      : "Filtrera"
                  }
                  className="h-10 w-auto min-w-0 rounded-full border-0 bg-transparent px-2 text-sm font-medium text-[#004225] shadow-none hover:bg-transparent sm:h-12 sm:text-base xl:h-14 [&_svg]:h-[18px] [&_svg]:w-[18px] sm:[&_svg]:h-5 sm:[&_svg]:w-5"
                  amenities={availableAmenities}
                  propertyTypes={propertyTypeOptions}
                  hostTypes={hostTypeOptions}
                  priceHistogram={previewPriceHistogram}
                  facetTotalCount={previewFacetTotalCount}
                  facetsLoading={previewFacetsLoading}
                  facetsError={previewFacetsError}
                  propertyTypeCounts={previewPropertyTypeCounts}
                  hostTypeCounts={previewHostTypeCounts}
                  observedRentRange={previewObservedRentRange}
                  priceBounds={priceBounds}
                  schools={schools}
                  initialState={filters}
                  onApply={(state) => {
                    setPage(1);
                    updatePageInUrl(1);
                    setFilterPreview(state);
                    setFilters(state);
                  }}
                  onChange={setFilterPreview}
                  onClear={() => {
                    setPage(1);
                    updatePageInUrl(1);
                    const nextState = createDefaultListingsFilterState();
                    setFilterPreview(nextState);
                    setFilters(nextState);
                    setSearchInput("");
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 w-full sm:mt-8">
          <div className="flex w-full flex-col justify-between gap-3 sm:flex-row sm:items-center sm:gap-4">
            <h2
              id="bostader-heading"
              className="text-base font-semibold text-black sm:text-lg"
            >
              {loading && listings.length === 0
                ? "Laddar bostäder..."
                : `Visar ${totalListingsCount} ${
                    totalListingsCount === 1 ? "bostad" : "bostäder"
                  }`}
            </h2>
            <div className="w-full sm:w-auto">
              <SwitchSelect value={view} onChange={setView} />
            </div>
          </div>
        </section>

        <section className="mt-4 min-h-[400px] w-full sm:mt-6">
          <FieldSet className="w-full" aria-labelledby="bostader-heading">
            {error && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-3 text-xs text-red-800 sm:px-4 sm:text-sm">
                {error}
              </div>
            )}

            {isMapView ? (
              <div className="flex flex-col-reverse gap-4 sm:gap-6 lg:grid lg:grid-cols-2 lg:items-start 2xl:grid-cols-3">
                <div className={`${listingGridClasses} w-full 2xl:col-span-1`}>
                  {listings.length === 0 && !loading ? (
                    <div className="col-span-full py-12 text-center text-sm text-gray-500 sm:py-20 sm:text-base">
                      Inga bostäder matchade din sökning.
                    </div>
                  ) : (
                    listings.map((listing) => renderListingCard(listing))
                  )}
                  <div className="col-span-full w-full">
                    {renderPagination()}
                  </div>
                </div>

                <div className="z-10 h-[280px] w-full shrink-0 overflow-hidden rounded-xl sm:h-[350px] lg:sticky lg:top-24 lg:h-[calc(100vh-120px)] lg:rounded-2xl 2xl:col-span-2">
                  <ListingsMap
                    listings={mapListings}
                    activeListingId={hoveredListingId}
                    getIsFavorite={(id) => favoriteIds.has(id)}
                    onFavoriteToggle={handleFavoriteToggle}
                    onOpenListing={(id) => router.push(`/bostader/${id}`)}
                  />
                </div>
              </div>
            ) : (
              <>
                {listings.length === 0 && !loading && (
                  <div className="py-12 text-center text-sm text-gray-500 sm:py-20 sm:text-base">
                    Inga bostäder matchade din sökning.
                  </div>
                )}

                <div className={listingGridClasses}>
                  {listings.map((listing) => renderListingCard(listing))}
                </div>

                <div
                  className="flex min-h-[60px] w-full items-center justify-center py-6 sm:py-8"
                >
                  {loading && (
                    <span className="animate-pulse text-xs text-gray-500 sm:text-sm">
                      Hämtar bostäder...
                    </span>
                  )}
                </div>

                {renderPagination()}
              </>
            )}
          </FieldSet>
        </section>
      </div>
    </main>
  );
}
