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
    <div className="min-h-[520px] rounded-2xl bg-gray-100" aria-hidden />
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

  const listingGridClasses = isMapView
    ? "grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-4 justify-items-center"
    : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 justify-items-center";

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
    <main className="flex flex-col gap-8 pb-12 pt-4 container mx-auto px-4">
      <section className="w-full">
        <div className="flex w-full flex-col gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="min-w-[280px] flex-1">
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
                  options: [
                    { label: "0 - 4000", value: "0-4000" },
                    { label: "4000 - 8000", value: "4000-8000" },
                    { label: "8000+", value: "8000+" },
                  ],
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
            <ListingsFilterButton
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
      </section>

      <section className="w-full">
        <div className="flex w-full flex-wrap items-center justify-between gap-4">
          <h2 id="bostader-heading" className="text-lg font-semibold text-black">
             {loading && listings.length === 0 
                ? "Laddar bostäder..." 
                : `Visar ${totalListingsCount} bostäder`
             }
          </h2>
          <SwitchSelect value={view} onChange={setView} />
        </div>
      </section>

      <section className="w-full min-h-[400px]">
        <FieldSet className="w-full" aria-labelledby="bostader-heading">
          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </div>
          )}

          {isMapView ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 items-start gap-6 h-[calc(100vh-200px)]">
              <div className={`${listingGridClasses} overflow-y-auto h-full pr-2`}>
                 {listings.map((listing) => renderListingCard(listing, "compact"))}
                 <div ref={loadMoreRef} className="h-4 w-full" />
              </div>
              <div className="rounded-2xl overflow-hidden h-full sticky top-0">
                <ListingsMap
                  listings={listings} 
                  onOpenListing={(id) => router.push(`/bostader/${id}`)}
                />
              </div>
            </div>
          ) : (
            <>
              {listings.length === 0 && !loading && (
                 <div className="py-20 text-center text-gray-500">
                    Inga bostäder matchade din sökning.
                 </div>
              )}

              <div className={listingGridClasses}>
                {listings.map((listing) => renderListingCard(listing))}
              </div>

              <div ref={loadMoreRef} className="flex w-full items-center justify-center py-8 min-h-[60px]">
                {(loadingMore || loading) && (
                   <span className="text-sm text-gray-500 animate-pulse">
                     Hämtar fler bostäder...
                   </span>
                )}
              </div>
            </>
          )}
        </FieldSet>
      </section>

      {showScrollTop && (
        <button
          type="button"
          aria-label="Scrolla till toppen"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-8 right-8 z-50 rounded-full bg-black px-5 py-3 text-sm font-semibold text-white shadow-xl transition transform hover:-translate-y-1 hover:bg-gray-800"
        >
          Till toppen
        </button>
      )}
    </main>
  );
}
