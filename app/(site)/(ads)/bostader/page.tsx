"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

import { toSearchString } from "@/lib/utils";

import ListingCardSmall from "@/components/Listings/ListingCard_Small";
import ListingsFilterButton, {
  type ListingsFilterState,
} from "@/components/Listings/Search/ListingsFilterButton";
import SearchFilter3Fields from "@/components/Listings/Search/SearchFilter-3field";
import { FieldSet } from "@/components/ui/field";
import SwitchSelect, { SwitchSelectValue } from "@/components/ui/switchSelect";

import { listingService } from "@/services/listing-service";
import { ListingCardDTO } from "@/types/listing";

type SearchValues = {
  city: string;
  hosts: string;
  price: string;
};

const ListingsMap = dynamic(() => import("@/components/Map/ListingsMap"), {
  ssr: false,
  loading: () => (
    <div className="min-h-[300px] sm:min-h-[400px] lg:min-h-[520px] rounded-2xl bg-gray-100" aria-hidden />
  ),
});

const PAGE_SIZE = 12;
const priceBounds = { min: 0, max: 12000 };

const propertyTypeOptions = [
  { id: "Rum", label: "Rum" },
  { id: "Lagenhet", label: "Lägenhet" },
  { id: "Korridor", label: "Korridor" },
];

const amenityOptions = [
  { id: "Moblerat", label: "Möblerat" },
  { id: "Poangfri", label: "Poängfri" },
  { id: "Balkong", label: "Balkong" },
  { id: "Student", label: "Student" },
  { id: "Tunnelbana", label: "Tunnelbana" },
];

const defaultListingsFilterState: ListingsFilterState = {
  amenities: [],
  propertyType: null,
  priceRange: priceBounds,
};

const MAX_POSSIBLE_RENT: number = 1_000_000_000_000;
const MIN_PRICE_RANGE_STEP: number = 500;
const TARGET_RANGE_COUNT: number = 3;

function roundInteger(x: number, target: number) {
  return Math.round(x / target) * target;
}

// Gets a list of price ranges based on the current pricing levels.
function extractRelevantPriceRanges(listings: ListingCardDTO[]): string[] {
  var min: number = MAX_POSSIBLE_RENT;
  var max: number = 0;

  // Ensure there is always a default
  if (listings.length == 0) {
    return ["0 - 8000", "8000+"];
  }

  // Only one listing, make that the only range (including the upper range).
  if (listings.length == 1) {
    return [ `0 - ${listings[0].rent}`, `${listings[0].rent}+` ];
  }

  // Get the minimum and maximum range
  for (const listing of listings) {

    if (listing.rent > MAX_POSSIBLE_RENT) {
      throw "Listing rent exceeds highest possible rent";
    }
    if (listing.rent < 0) {
      throw "Listing rent is not a positive integer";
    }

    if (listing.rent < min) {
      min = listing.rent;
    }
    if (listing.rent > max) {
      max = listing.rent;
    }
  }

  // Round step size to the closest multiple of 500 that produces roughly TARGET_RANGE_COUNT number of ranges.
  // Also ensure that the range step does not go any lower than MIN_PRICE_RANGE_STEP.
  //
  var stepSize = Math.max(
      MIN_PRICE_RANGE_STEP,
      roundInteger((max - min) / TARGET_RANGE_COUNT, 500.0));

  // Get all price ranges in (min, max]
  let results: string[] = [];
  let prev = min;

  // Add the low end range
  results.push(`0 - ${min}`)
  
  // Add intermediate price ranges
  for (let i = min + stepSize; i < max; i += stepSize) {
    // Do not include if there are no listings in that range
    if (!listings.some(listing => listing.rent >= prev && listing.rent <= i)) {
      continue;
    }
    results.push(`${prev} - ${i}`);
    prev = i;
  }
  // Add the max case
  results.push(`${max}+`);
  return results;
}

const parseSearchPriceRange = (raw: string): { min: number; max: number } | null => {
  const normalized = raw.replace(/\s/g, "");
  if (!normalized)
    return null;
  if (normalized.endsWith("+")) {
    const min = parseInt(normalized.replace("+", ""), 10);
    return Number.isNaN(min) ? null : { min, max: 200000 };
  }
  const [minStr, maxStr] = normalized.split("-");
  const min = parseInt(minStr ?? "", 10);
  const max = parseInt(maxStr ?? "", 10);
  return Number.isNaN(min) || Number.isNaN(max) ? null : { min, max };
};

export default function ListingsPage() {
  const router = useRouter();
  
  const [view, setView] = useState<SwitchSelectValue>("lista");
  const [searchValues, setSearchValues] = useState<SearchValues>({
    city: "",
    hosts: "",
    price: ""
  } as SearchValues);
  const [filters, setFilters] = useState<ListingsFilterState>(defaultListingsFilterState);
  
  const [listings, setListings] = useState<ListingCardDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // Samla ihop alla filter till ett format som backend förstår
  const currentFilters = useMemo(() => {
    const searchPrice = parseSearchPriceRange(searchValues.price);
    return {
      city: toSearchString(searchValues.city),
      hostType: toSearchString(searchValues.hosts),
      dwellingType: filters.propertyType,
      minRent: filters.priceRange.min > 0 ? filters.priceRange.min : (searchPrice?.min ?? null),
      maxRent: filters.priceRange.max < priceBounds.max ? filters.priceRange.max : (searchPrice?.max ?? null),
    };
  }, [searchValues, filters]);

  const loadListings = useCallback(
    async (pageToLoad: number, replace = false) => {
      setError(null);

      if (replace) {
        setLoading(true);
        // VIKTIGT: Töm listan direkt så att de gamla annonserna försvinner omedelbart
        setListings([]); 
      } else {
        setLoadingMore(true);
      }

      try {
        console.log(`Filtering listings on ${JSON.stringify(currentFilters)}`)
        const res = await listingService.getAll(
          pageToLoad, 
          PAGE_SIZE, 
          currentFilters.city,
          currentFilters.dwellingType,
          currentFilters.minRent,
          currentFilters.maxRent,
          currentFilters.hostType
        );

        // Spring Boot returnerar data i res.content
        const newItems = res.content || [];
 
        setTotalPages((res as any).totalPages ?? (res as any).page?.totalPages ?? 0);
        setPage((res as any).number ?? (res as any).page?.number ?? 0);

        // Om replace är true, använd endast de nya objekten
        setListings((prev) => (replace ? newItems : [...prev, ...newItems]));
      } catch (err: any) {
        console.error("Error loading listings:", err);
        setError("Kunde inte ladda bostäder.");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [currentFilters] // Dependency array ser till att funktionen har rätt filtervärden
  );

  // Åtgärd: Nollställ allt när filtren ändras
  useEffect(() => {
    // När filtren ändras:
    // 1. Återställ sidnumret till 0 internt
    // 2. Trigga en omladdning som ersätter (replace) all data
    setPage(0);
    loadListings(0, true);
  }, [currentFilters, loadListings]);

  useEffect(() => {
    const hasMore = page + 1 < totalPages;
    if (!hasMore || loading || loadingMore)
      return;

    const target = loadMoreRef.current;
    if (!target)
      return;

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

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 320);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const totalListingsCount = listings.length;
  const isMapView = view === "karta";

  // Responsive grid classes with better breakpoint handling
  const listingGridClasses = isMapView
    ? "grid grid-cols-1 gap-3 justify-items-center"
    : "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-3 md:gap-6 justify-items-center";

  const renderListingCard = (listing: ListingCardDTO, variant: "default" | "compact" = "default") => {
    return (
      <div key={listing.id} className="flex w-full justify-center">
        <ListingCardSmall
          title={listing.title}
          // Åtgärd: Skicka med obligatoriska props
          area={listing.location?.split(",")[0] || "Ej angivet"} 
          city={listing.location?.split(",")[1]?.trim() || listing.location || "Ej angivet"} 
          dwellingType={listing.dwellingType || "Bostad"}
          rooms={listing.rooms || 0}
          sizeM2={listing.sizeM2 || 0}
          rent={listing.rent || 0}
          landlordType={listing.hostType}
          isVerified={listing.verifiedHost}
          imageUrl={listing.imageUrl}
          tags={listing.tags}
          onClick={() => router.push(`/bostader/${listing.id}`)}
          variant={variant}
        />
      </div>
    );
  };

  return (
    <main className="flex flex-col gap-6 sm:gap-8 pb-12 pt-4 w-full h-auto">
      {/* Responsive container with proper padding */}
      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 h-auto">
        
        {/* Search and Filter Section */}
        <section className="w-full">
          <div className="flex w-full flex-col gap-3 sm:gap-4">
            <div className="flex flex-col lg:flex-row lg:items-start xl:items-center gap-3 sm:gap-4">
              {/* Search Filter - Responsive width */}
              <div className="w-full lg:flex-1 lg:min-w-[280px] lg:max-w-2xl">
                <SearchFilter3Fields
                  className="w-full"
                  field1={{
                    id: "location",
                    label: "Var",
                    placeholder: "Sök studentstad",
                    searchable: true,
                    options: [
                      { label: "Göteborg", value: "Göteborg" },
                      { label: "Stockholm", value: "Stockholm" },
                      { label: "Uppsala", value: "Uppsala" },
                      { label: "Lund", value: "Lund" },
                      { label: "Malmö", value: "Malmö" },
                    ],
                  }}
                  field2={{
                    id: "hosts",
                    label: "Hyresvärd",
                    placeholder: "Välj hyresvärd",
                    searchable: false,
                    options: [
                      { label: "Alla", value: "Alla" },
                      { label: "Privat hyresvärd", value: "Privat hyresvärd" },
                      { label: "Företag", value: "Företag" },
                    ],
                  }}
                  field3={{
                    id: "price",
                    label: "Pris",
                    placeholder: "Välj prisintervall",
                    options: extractRelevantPriceRanges(listings)
                            .map(priceRange =>
                              ({ label: priceRange, value: priceRange } as Option))
                  }}
                  onSubmit={(values) => setSearchValues({
                    city: toSearchString(values.city),
                    hosts: ({
                      ["Alla"]: "",
                      ["Privat hyresvärd"]: "privat",
                      ["Företag"]: "företag"
                    })[values.hosts],
                    price: toSearchString(values.price)
                  } as SearchValues)}
                />
              </div>
              
              {/* Filter Button - Sticks to right on desktop, full width on mobile */}
              <div className="flex justify-stretch lg:justify-end w-full lg:w-auto">
                 <ListingsFilterButton
                   className="w-full lg:w-auto"
                   amenities={amenityOptions}
                   propertyTypes={propertyTypeOptions}
                   priceHistogram={[1, 3, 5, 8, 5, 3, 21, 3, 5, 8, 5, 3, 2]}
                   priceBounds={priceBounds}
                   initialState={defaultListingsFilterState}
                   onApply={(state) => setFilters(state)}
                   onClear={() => setFilters(defaultListingsFilterState)}
                 />
              </div>
            </div>
          </div>
        </section>

        {/* Results Header and View Toggle */}
        <section className="w-full mt-6 sm:mt-8">
          <div className="flex w-full flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <h2 id="bostader-heading" className="text-base sm:text-lg font-semibold text-black">
               {loading && listings.length === 0 
                  ? "Laddar bostäder..." 
                  : `Visar ${totalListingsCount} ${totalListingsCount === 1 ? 'bostad' : 'bostäder'}`
               }
            </h2>
            <div className="w-full sm:w-auto">
              <SwitchSelect value={view} onChange={setView} />
            </div>
          </div>
        </section>

        {/* Main Content Area */}
        <section className="w-full min-h-[400px] mt-4 sm:mt-6">
          <FieldSet className="w-full" aria-labelledby="bostader-heading">
            {/* Error Message */}
            {error && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 sm:px-4 py-3 text-xs sm:text-sm text-red-800">
                {error}
              </div>
            )}

            {isMapView ? (
              /* Map View Layout - Responsive stacking */
              <div className="flex flex-col-reverse lg:grid lg:grid-cols-2 lg:items-start gap-4 sm:gap-6">
                {/* Lista - On mobile below map, scrollable on desktop */}
                <div className={`${listingGridClasses} w-full`}>
                   {(listings.length === 0 && !loading) ? (
                     <div className="col-span-full py-12 sm:py-20 text-center text-sm sm:text-base text-gray-500">
                        Inga bostäder matchade din sökning.
                     </div>) :
                     listings.map((listing) => renderListingCard(listing))
                   }
                   <div ref={loadMoreRef} className="h-4 w-full col-span-full" />
                </div>
                
                {/* Map - On mobile at top, sticky on desktop */}
                <div className="w-full h-[280px] sm:h-[350px] lg:h-[calc(100vh-120px)] rounded-xl lg:rounded-2xl overflow-hidden lg:sticky lg:top-24 z-10 shrink-0">
                  <ListingsMap
                    listings={listings} 
                    onOpenListing={(id) => router.push(`/bostader/${id}`)}
                  />
                </div>
              </div>
            ) : (
              /* List View Layout */
              <>
                {listings.length === 0 && !loading && (
                   <div className="py-12 sm:py-20 text-center text-sm sm:text-base text-gray-500">
                      Inga bostäder matchade din sökning.
                   </div>
                )}

                <div className={listingGridClasses}>
                  {listings.map((listing) => renderListingCard(listing))}
                </div>

                {/* Load More Indicator */}
                <div ref={loadMoreRef} className="flex w-full items-center justify-center py-6 sm:py-8 min-h-[60px]">
                  {(loadingMore || loading) && (
                     <span className="text-xs sm:text-sm text-gray-500 animate-pulse">
                       Hämtar fler bostäder...
                     </span>
                  )}
                </div>
              </>
            )}
          </FieldSet>
        </section>
      </div>

      {/* Scroll to Top Button - Responsive positioning and sizing */}
      {showScrollTop && (
        <button
          type="button"
          aria-label="Scrolla till toppen"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 lg:bottom-8 lg:right-8 z-50 rounded-full bg-black px-4 py-2.5 sm:px-5 sm:py-3 text-xs sm:text-sm font-semibold text-white shadow-xl transition transform hover:-translate-y-1 hover:bg-gray-800 active:scale-95"
        >
          <span className="hidden sm:inline">Till toppen</span>
          <span className="sm:hidden">↑</span>
        </button>
      )}
    </main>
  );
}