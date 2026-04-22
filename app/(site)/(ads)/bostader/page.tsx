"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
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

import ListingCardSmall from "@/components/Listings/ListingCard_Small";
import ListingsFilterButton, {
  type ListingsFilterState,
} from "@/components/Listings/Search/ListingsFilterButton";
import { FieldSet } from "@/components/ui/field";
import SwitchSelect, { SwitchSelectValue } from "@/components/ui/switchSelect";

import {
  listingService,
  type ListingSearchParams,
} from "@/services/listing-service";
import { schoolService } from "@/services/school-service";
import { ListingCardDTO } from "@/types/listing";
import type { School } from "@/types/school";

const ListingsMap = dynamic(() => import("@/components/Map/ListingsMap"), {
  ssr: false,
  loading: () => (
    <div
      className="min-h-[300px] rounded-2xl bg-gray-100 sm:min-h-[400px] lg:min-h-[520px]"
      aria-hidden
    />
  ),
});

const PAGE_SIZE = 12;
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

const defaultListingsFilterState: ListingsFilterState = {
  city: "",
  amenities: [],
  propertyType: null,
  priceRange: priceBounds,
  hostType: null,
  schoolId: null,
  schoolLat: null,
  schoolLng: null,
};

const hasSchoolCoordinates = (school: School) =>
  typeof school.lat === "number" && typeof school.lng === "number";

export default function ListingsPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [view, setView] = useState<SwitchSelectValue>("lista");
  const [searchInput, setSearchInput] = useState("");
  const [filters, setFilters] = useState<ListingsFilterState>(
    defaultListingsFilterState
  );

  const [schools, setSchools] = useState<School[]>([]);
  const [listings, setListings] = useState<ListingCardDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let active = true;

    schoolService
      .list()
      .then((items) => {
        if (active) setSchools(items);
      })
      .catch((err) => {
        console.error("Failed to load schools:", err);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (user) {
      listingService
        .getFavorites()
        .then((favs) => {
          setFavoriteIds(new Set(favs.map((f) => f.id)));
        })
        .catch(console.error);
    } else {
      setFavoriteIds(new Set());
    }
  }, [user]);

  const handleFavoriteToggle = useCallback(
    (id: string, isFav: boolean) => {
      if (!user) {
        alert("Du måste vara inloggad för att spara bostäder");
        return;
      }

      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (isFav) next.add(id);
        else next.delete(id);
        return next;
      });

      const action = isFav
        ? listingService.addFavorite(id)
        : listingService.removeFavorite(id);

      action.catch((err) => {
        console.error("Failed to toggle favorite:", err);
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          if (isFav) next.delete(id);
          else next.add(id);
          return next;
        });
      });
    },
    [user]
  );

  const currentFilters = useMemo<ListingSearchParams>(() => {
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
      school_lat: hasSchoolFilter ? filters.schoolLat : undefined,
      school_lng: hasSchoolFilter ? filters.schoolLng : undefined,
      amenities: filters.amenities.length > 0 ? filters.amenities : undefined,
    };
  }, [filters]);

  const schoolsWithCoordinates = useMemo(
    () => schools.filter(hasSchoolCoordinates),
    [schools]
  );

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.city.trim()) count += 1;
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

  const loadListings = useCallback(
    async (pageToLoad: number, replace = false) => {
      setError(null);

      if (replace) {
        setLoading(true);
        setListings([]);
      } else {
        setLoadingMore(true);
      }

      try {
        console.log(`Filtering listings on ${JSON.stringify(currentFilters)}`);
        const res = await listingService.getAll({
          ...currentFilters,
          page: pageToLoad,
          size: PAGE_SIZE,
        });

        const newItems = res.content || [];

        setTotalPages(
          (res as any).totalPages ?? (res as any).page?.totalPages ?? 0
        );
        setPage((res as any).number ?? (res as any).page?.number ?? 0);

        setListings((prev) => (replace ? newItems : [...prev, ...newItems]));
      } catch (err: any) {
        console.error("Error loading listings:", err);
        setError("Kunde inte ladda bostäder.");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [currentFilters]
  );

  useEffect(() => {
    setPage(0);
    loadListings(0, true);
  }, [currentFilters, loadListings]);

  useEffect(() => {
    const hasMore = page + 1 < totalPages;
    if (!hasMore || loading || loadingMore) return;

    const target = loadMoreRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !loadingMore) {
          loadListings(page + 1, false);
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [page, totalPages, loading, loadingMore, loadListings]);

  const totalListingsCount = listings.length;
  const isMapView = view === "karta";

  const listingGridClasses = isMapView
    ? "grid grid-cols-1 gap-3 justify-items-center"
    : "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-3 md:gap-6 justify-items-center";

  const renderListingCard = (
    listing: ListingCardDTO,
    variant: "default" | "compact" = "default"
  ) => (
    <div key={listing.id} className="flex w-full justify-center">
      <ListingCardSmall
        id={listing.id}
        title={listing.title}
        area={listing.location?.split(",")[0] || "Ej angivet"}
        city={
          listing.location?.split(",")[1]?.trim() ||
          listing.location ||
          "Ej angivet"
        }
        dwellingType={listing.dwellingType || "Bostad"}
        rooms={listing.rooms || 0}
        sizeM2={listing.sizeM2 || 0}
        rent={listing.rent || 0}
        landlordType={listing.hostType}
        hostName={listing.hostName}
        hostLogoUrl={listing.hostLogoUrl}
        isVerified={listing.verifiedHost}
        isFavorite={favoriteIds.has(listing.id)}
        onFavoriteToggle={handleFavoriteToggle}
        imageUrl={listing.imageUrl}
        tags={listing.tags}
        onClick={() => router.push(`/bostader/${listing.id}`)}
        variant={variant}
      />
    </div>
  );

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
                  amenities={amenityOptions}
                  propertyTypes={propertyTypeOptions}
                  hostTypes={hostTypeOptions}
                  priceBounds={priceBounds}
                  schools={schoolsWithCoordinates}
                  initialState={filters}
                  onApply={(state) => {
                    setFilters(state);
                    setSearchInput(state.city);
                  }}
                  onClear={() => {
                    setFilters(defaultListingsFilterState);
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
                  <div ref={loadMoreRef} className="col-span-full h-4 w-full" />
                </div>

                <div className="z-10 h-[280px] w-full shrink-0 overflow-hidden rounded-xl sm:h-[350px] lg:sticky lg:top-24 lg:h-[calc(100vh-120px)] lg:rounded-2xl 2xl:col-span-2">
                  <ListingsMap
                    listings={listings}
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
                  ref={loadMoreRef}
                  className="flex min-h-[60px] w-full items-center justify-center py-6 sm:py-8"
                >
                  {(loadingMore || loading) && (
                    <span className="animate-pulse text-xs text-gray-500 sm:text-sm">
                      Hämtar fler bostäder...
                    </span>
                  )}
                </div>
              </>
            )}
          </FieldSet>
        </section>
      </div>
    </main>
  );
}
