"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

import ListingCardSmall from "@/components/Listings/ListingCard_Small";
import ListingsFilterButton, {
  type ListingsFilterState,
} from "@/components/Listings/Search/ListingsFilterButton";
import SearchFilter3Fields from "@/components/Listings/Search/SearchFilter-3field";
import { FieldSet } from "@/components/ui/field";
import SwitchSelect, { SwitchSelectValue } from "@/components/ui/switchSelect";
import { backendApi } from "@/lib/api";
import { type ListingWithRelations } from "@/types";

const ListingsMap = dynamic(() => import("@/components/Map/ListingsMap"), {
  ssr: false,
  loading: () => (
    <div className="min-h-[520px] rounded-2xl bg-gray-100" aria-hidden />
  ),
});

const PAGE_SIZE = 6;
const priceBounds = { min: 0, max: 12000 };

const propertyTypeOptions = [
  { id: "Rum", label: "Rum" },
  { id: "Lagenhet", label: "Lagenhet" },
  { id: "Korridor", label: "Korridor" },
];

const amenityOptions = [
  { id: "Moblerat", label: "Moblerat" },
  { id: "Poangfri", label: "Poangfri" },
  { id: "Balkong", label: "Balkong" },
  { id: "Student", label: "Student" },
  { id: "Tunnelbana", label: "Tunnelbana" },
];

const defaultListingsFilterState: ListingsFilterState = {
  amenities: [],
  propertyType: null,
  priceRange: priceBounds,
};

type UIListing = ListingWithRelations;

const parseSearchPriceRange = (
  raw: string | string[] | null
): { min: number; max: number } | null => {
  if (typeof raw !== "string") return null;
  const normalized = raw.replace(/\s/g, "");

  if (!normalized) return null;
  if (normalized.endsWith("+")) {
    const min = parseInt(normalized.replace("+", ""), 10);
    if (Number.isNaN(min)) return null;
    return { min, max: Number.POSITIVE_INFINITY };
  }

  const [minStr, maxStr] = normalized.split("-");
  const min = parseInt(minStr ?? "", 10);
  const max = parseInt(maxStr ?? "", 10);
  if (Number.isNaN(min) || Number.isNaN(max)) return null;

  return { min, max };
};

export default function Page() {
  const router = useRouter();
  const [view, setView] = useState<SwitchSelectValue>("lista");
  const [searchValues, setSearchValues] = useState<
    Record<string, string | string[] | null>
  >({});
  const [filters, setFilters] = useState<ListingsFilterState>(
    defaultListingsFilterState
  );
  const [listings, setListings] = useState<UIListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const searchCityValue = useMemo(
    () => (typeof searchValues.var === "string" ? searchValues.var.trim() : ""),
    [searchValues]
  );
  const normalizedSearchCity = searchCityValue.toLowerCase();
  const searchLandlordValue = useMemo(
    () =>
      typeof searchValues.hyresvard === "string"
        ? searchValues.hyresvard.trim()
        : "",
    [searchValues]
  );
  const normalizedSearchLandlord = searchLandlordValue.toLowerCase();
  const searchPriceRange = useMemo(
    () => parseSearchPriceRange(searchValues.pris),
    [searchValues]
  );

  const mergedPriceRange = useMemo(() => {
    if (!searchPriceRange) {
      return { min: filters.priceRange.min, max: filters.priceRange.max };
    }
    return {
      min: Math.max(filters.priceRange.min, searchPriceRange.min),
      max: Math.min(filters.priceRange.max, searchPriceRange.max),
    };
  }, [filters.priceRange.max, filters.priceRange.min, searchPriceRange]);

  const apiQuery = useMemo(
    () => ({
      city: searchCityValue || undefined,
      minRent: Number.isFinite(mergedPriceRange.min)
        ? mergedPriceRange.min
        : undefined,
      maxRent:
        Number.isFinite(mergedPriceRange.max) &&
        mergedPriceRange.max !== Number.POSITIVE_INFINITY
          ? mergedPriceRange.max
          : undefined,
    }),
    [mergedPriceRange.max, mergedPriceRange.min, searchCityValue]
  );

  const loadListings = useCallback(
    async (pageToLoad: number, replace = false) => {
      setError(null);
      if (pageToLoad === 0 && replace) {
        setLoading(true);
        setHasMore(true);
      } else {
        setLoadingMore(true);
      }

      try {
        const res = await backendApi.listings.list({
          page: pageToLoad,
          size: PAGE_SIZE,
          city: apiQuery.city,
          minRent: apiQuery.minRent,
          maxRent: apiQuery.maxRent,
        });

        setListings((prev) => (replace ? res.items ?? [] : [...prev, ...(res.items ?? [])]));
        setPage(res.page);
        setHasMore(res.page + 1 < res.totalPages);
      } catch (err: any) {
        setError(err?.message ?? "Kunde inte ladda bostader.");
      } finally {
        if (pageToLoad === 0 && replace) {
          setLoading(false);
        } else {
          setLoadingMore(false);
        }
      }
    },
    [apiQuery.city, apiQuery.maxRent, apiQuery.minRent]
  );

  useEffect(() => {
    setListings([]);
    setPage(0);
    setHasMore(true);
    loadListings(0, true);
  }, [loadListings]);

  useEffect(() => {
    if (!hasMore || loading || loadingMore) return;
    const target = loadMoreRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting && hasMore && !loadingMore) {
          loadListings(page + 1);
        }
      },
      { rootMargin: "320px" }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMore, loadListings, loading, loadingMore, page]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 320);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isMapView = view === "karta";

  const filteredListings = useMemo(() => {
    return listings.filter((listing) => {
      const city = (listing.city ?? "").toLowerCase();
      const area = (listing.area ?? "").toLowerCase();
      const landlordName = (listing.advertiser?.displayName ?? "").toLowerCase();
      const rentValue = listing.rent ?? 0;

      const matchesCity =
        !normalizedSearchCity ||
        city.includes(normalizedSearchCity) ||
        area.includes(normalizedSearchCity);

      const matchesLandlord =
        !normalizedSearchLandlord || landlordName.includes(normalizedSearchLandlord);

      const matchesSearchPrice =
        !searchPriceRange ||
        (rentValue >= searchPriceRange.min &&
          (searchPriceRange.max === Number.POSITIVE_INFINITY ||
            rentValue <= searchPriceRange.max));

      const matchesPropertyType =
        !filters.propertyType ||
        (listing.dwellingType ?? "").toLowerCase() ===
          filters.propertyType.toLowerCase();

      const normalizedTags = (listing.tags ?? []).map((tag) =>
        tag.toLowerCase()
      );
      const matchesAmenities =
        filters.amenities.length === 0 ||
        filters.amenities.every((amenity) =>
          normalizedTags.includes(amenity.toLowerCase())
        );

      const matchesPriceRange =
        rentValue >= filters.priceRange.min &&
        rentValue <= filters.priceRange.max;

      return (
        matchesCity &&
        matchesLandlord &&
        matchesSearchPrice &&
        matchesPropertyType &&
        matchesAmenities &&
        matchesPriceRange
      );
    });
  }, [filters, listings, normalizedSearchCity, normalizedSearchLandlord, searchPriceRange]);

  const totalListings = filteredListings.length;

  const listingGridClasses = isMapView
    ? "grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-4 justify-items-center"
    : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 justify-items-center";

  const renderListingCard = (
    listing: UIListing,
    variant: "default" | "compact" = "default"
  ) => {
    const primaryImage =
      typeof listing.images?.[0] === "string"
        ? (listing.images?.[0] as string)
        : listing.images?.[0]?.imageUrl;

    return (
      <div key={listing.listingId} className="flex w-full justify-center">
        <ListingCardSmall
          title={listing.title}
          area={listing.area ?? ""}
          city={listing.city ?? ""}
          dwellingType={listing.dwellingType ?? ""}
          rooms={listing.rooms ?? undefined}
          sizeM2={listing.sizeM2 ?? undefined}
          rent={listing.rent ?? undefined}
          landlordType={listing.advertiser?.displayName ?? "Hyresvard"}
          isVerified={Boolean(listing.advertiser)}
          imageUrl={primaryImage}
          tags={listing.tags ?? undefined}
          images={listing.images}
          onClick={() => router.push(`/bostader/${listing.listingId}`)}
          variant={variant}
        />
      </div>
    );
  };

  const renderMapListings = () => {
    return filteredListings.map((listing) =>
      renderListingCard(listing, "compact")
    );
  };

  return (
    <main className="flex flex-col gap-8 pb-12 pt-4">
      {/* Sektion 1: filter */}
      <section className="w-full">
        <div className="flex w-full flex-col gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="min-w-[280px] flex-1">
              <SearchFilter3Fields
                className="w-full"
                field1={{
                  id: "var",
                  label: "Var",
                  placeholder: "Sok studentstad",
                  searchable: true,
                  options: [
                    { label: "Goteborg", value: "goteborg" },
                    { label: "Stockholm", value: "stockholm" },
                    { label: "Uppsala", value: "uppsala" },
                    { label: "Lund", value: "lund" },
                    { label: "Malmo", value: "malmo" },
                  ],
                }}
                field2={{
                  id: "hyresvard",
                  label: "Hyresvard",
                  placeholder: "Valj hyresvard",
                  searchable: true,
                  options: [
                    { label: "Privat hyresvard", value: "privat" },
                    { label: "Kommunal", value: "kommunal" },
                    { label: "Stiftelse", value: "stiftelse" },
                    { label: "AF Bostader", value: "af-bostader" },
                  ],
                }}
                field3={{
                  id: "pris",
                  label: "Pris",
                  placeholder: "Valj prisintervall",
                  options: [
                    { label: "0 - 4000", value: "0-4000" },
                    { label: "4000 - 8000", value: "4000-8000" },
                    { label: "8000+", value: "8000+" },
                  ],
                }}
                onSubmit={(values) => setSearchValues(values)}
              />
            </div>
            <ListingsFilterButton
              amenities={amenityOptions}
              propertyTypes={propertyTypeOptions}
              priceHistogram={[
                1, 3, 5, 8, 5, 3, 21, 3, 5, 8, 5, 3, 21, 3, 5, 8, 5, 3, 21, 3, 5,
                8, 5, 3, 21, 3, 5, 8, 5, 3, 21, 3, 5, 8, 5, 3, 21, 3, 5, 8, 5, 3,
                21, 3, 5, 8, 5, 3, 2,
              ]}
              priceBounds={priceBounds}
              initialState={defaultListingsFilterState}
              onApply={(state) => setFilters(state)}
              onClear={() => setFilters(defaultListingsFilterState)}
            />
          </div>
        </div>
      </section>

      {/* Sektion 2: rubrik + vyval for bostaderna */}
      <section className="w-full">
        <div className="flex w-full flex-wrap items-center justify-between gap-4">
          <h2 id="bostader-heading" className="text-base font-semibold text-black">
            Over {totalListings.toLocaleString("sv-SE")} boenden
          </h2>
          <SwitchSelect value={view} onChange={setView} />
        </div>
      </section>

      {/* Sektion 3: annonser (annonsytor hanteras i layouten) */}
      <section className="w-full">
        <FieldSet className="w-full" aria-labelledby="bostader-heading">
          {error && (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </div>
          )}
          {loading ? (
            <div className="py-12 text-center text-sm text-gray-500">
              Laddar bostäder...
            </div>
          ) : filteredListings.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-500">
              Inga bostäder att visa just nu.
            </div>
          ) : isMapView ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 items-start gap-6">
              <div className={listingGridClasses}>{renderMapListings()}</div>
              <div
                className="rounded-2xl overflow-hidden lg:sticky lg:top-24"
                style={{ minHeight: 600, height: "min(72vh, 760px)" }}
              >
                <ListingsMap
                  listings={filteredListings}
                  onOpenListing={(id) => router.push(`/bostader/${id}`)}
                />
              </div>
            </div>
          ) : (
            <div className={listingGridClasses}>
              {filteredListings.map((listing) => renderListingCard(listing))}
            </div>
          )}
          {(hasMore || loadingMore) && (
            <div
              ref={loadMoreRef}
              className="flex w-full items-center justify-center py-4"
              aria-hidden
            >
              {loadingMore && (
                <span className="text-xs text-gray-500">
                  Laddar fler bostäder...
                </span>
              )}
            </div>
          )}
        </FieldSet>
      </section>
      {showScrollTop && (
        <button
          type="button"
          aria-label="Scrolla till toppen"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-20 rounded-full bg-black px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-black/90"
        >
          Till toppen
        </button>
      )}
    </main>
  );
}
