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

// Importera din nya service och typer
import { listingService } from "@/services/listing-service";
import { ListingCardDTO } from "@/types/listing";

// Ladda kartan dynamiskt (SSR false är viktigt för Leaflet/Mapbox)
const ListingsMap = dynamic(() => import("@/components/Map/ListingsMap"), {
  ssr: false,
  loading: () => (
    <div className="min-h-[520px] rounded-2xl bg-gray-100" aria-hidden />
  ),
});

const PAGE_SIZE = 12; // Öka gärna till 12 för bättre grid-layout (3x4 eller 4x3)
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

// Hjälpfunktion för att tolka pris-sträng från URL/Sökfält
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

export default function ListingsPage() {
  const router = useRouter();
  
  // State
  const [view, setView] = useState<SwitchSelectValue>("lista");
  const [searchValues, setSearchValues] = useState<Record<string, string | string[] | null>>({});
  const [filters, setFilters] = useState<ListingsFilterState>(defaultListingsFilterState);
  
  // Data State - Använd ListingCardDTO här!
  const [listings, setListings] = useState<ListingCardDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0); // Ny state för att hålla koll på totala sidor
  const [error, setError] = useState<string | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // --- Filtrering Logic ---
  
  const searchCityValue = useMemo(
    () => (typeof searchValues.var === "string" ? searchValues.var.trim() : ""),
    [searchValues]
  );
  
  // Beräkna priser baserat på filter och sökfält
  const searchPriceRange = useMemo(
    () => parseSearchPriceRange(searchValues.pris),
    [searchValues]
  );

  // Huvudfunktion för att hämta data
  const loadListings = useCallback(
    async (pageToLoad: number, replace = false) => {
      setError(null);
      
      if (replace) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      try {
        // Anropa din nya service. 
        // OBS: Om du vill att backend ska filtrera på stad/pris måste du uppdatera getAll i servicen
        // att ta emot dessa parametrar. Just nu hämtar vi allt (paginerat) och filtrerar klient-side 
        // för de som hämtats, vilket fungerar ok för nu men backend-filtrering är bättre på sikt.
        const res = await listingService.getAll(pageToLoad, PAGE_SIZE);

        setTotalPages(res.page.totalPages);
        setPage(res.page.number);
        setListings((prev) => (replace ? res.content : [...prev, ...res.content]));
        
      } catch (err: any) {
        console.error("Error loading listings:", err);
        setError("Kunde inte ladda bostader. Försök igen senare.");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [] 
  );

  // Ladda data vid start (mount)
  useEffect(() => {
    loadListings(0, true);
  }, [loadListings]);

  // Infinite Scroll Observer
  useEffect(() => {
    const hasMore = page + 1 < totalPages;
    if (!hasMore || loading || loadingMore) return;
    
    const target = loadMoreRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting && !loadingMore) {
          loadListings(page + 1, false);
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [page, totalPages, loading, loadingMore, loadListings]);

  // Scroll-to-top knapp logik
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 320);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // --- Klient-side Filtrering ---
  // Vi filtrerar listan vi har hämtat. 
  // (Idealet är att skicka dessa filter till backend i loadListings, men detta funkar för nu)
  const filteredListings = useMemo(() => {
    return listings.filter((listing) => {
      // 1. Stad/Område
      const normalizedSearchCity = searchCityValue.toLowerCase();
      const listingLocation = (listing.location || "").toLowerCase();
      const matchesCity = !normalizedSearchCity || listingLocation.includes(normalizedSearchCity);

      // 2. Hyresvärd
      const searchLandlord = (typeof searchValues.hyresvard === "string" ? searchValues.hyresvard : "").toLowerCase();
      const matchesLandlord = !searchLandlord || 
          (listing.hostType || "").toLowerCase().includes(searchLandlord); // Enkel matchning

      // 3. Pris (Sökfält + Slider)
      const rent = listing.rent || 0;
      
      // Slider filter
      const matchesSliderPrice = 
        rent >= filters.priceRange.min && 
        rent <= filters.priceRange.max;

      // Dropdown filter
      const matchesDropdownPrice = 
         !searchPriceRange || 
         (rent >= searchPriceRange.min && (searchPriceRange.max === Number.POSITIVE_INFINITY || rent <= searchPriceRange.max));

      // 4. Bostadstyp
      const matchesPropertyType = 
        !filters.propertyType || 
        (listing.dwellingType || "").toLowerCase() === filters.propertyType.toLowerCase();

      // 5. Bekvämligheter (Tags)
      const listingTags = (listing.tags || []).map(t => t.toLowerCase());
      const matchesAmenities = 
        filters.amenities.length === 0 || 
        filters.amenities.every(a => listingTags.includes(a.toLowerCase()));

      return (
        matchesCity &&
        matchesLandlord &&
        matchesSliderPrice &&
        matchesDropdownPrice &&
        matchesPropertyType &&
        matchesAmenities
      );
    });
  }, [listings, searchCityValue, searchValues.hyresvard, searchPriceRange, filters]);

  const totalListingsCount = filteredListings.length;
  const isMapView = view === "karta";

  // Grid classes
  const listingGridClasses = isMapView
    ? "grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-4 justify-items-center"
    : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 justify-items-center";

  // Render Funktion för kortet
  // ... inne i page.tsx ...
  const renderListingCard = (
    listing: ListingCardDTO,
    variant: "default" | "compact" = "default"
  ) => {
    return (
      <div key={listing.id} className="flex w-full justify-center">
        <ListingCardSmall
          title={listing.title}
          // Vi splittar location strängen om vi vill separera area/stad, eller skickar hela
          area={listing.location.split(",")[0] || ""} 
          city={listing.location.split(",")[1]?.trim() || ""} 
          dwellingType={listing.dwellingType}
          rooms={listing.rooms}
          sizeM2={listing.sizeM2}
          rent={listing.rent}
          landlordType={listing.hostType} // <-- Nu matchar prop namnet
          isVerified={listing.verifiedHost}
          imageUrl={listing.imageUrl}     // <-- Enkel sträng
          tags={listing.tags}
          onClick={() => router.push(`/bostader/${listing.id}`)}
          variant={variant}
        />
      </div>
    );
  };

  return (
    <main className="flex flex-col gap-8 pb-12 pt-4 container mx-auto px-4">
      {/* SEKTION 1: Filter */}
      <section className="w-full">
        <div className="flex w-full flex-col gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="min-w-[280px] flex-1">
              <SearchFilter3Fields
                className="w-full"
                field1={{
                  id: "var",
                  label: "Var",
                  placeholder: "Sök studentstad",
                  searchable: true,
                  options: [
                    { label: "Göteborg", value: "goteborg" },
                    { label: "Stockholm", value: "stockholm" },
                    { label: "Uppsala", value: "uppsala" },
                    { label: "Lund", value: "lund" },
                    { label: "Malmö", value: "malmo" },
                  ],
                }}
                field2={{
                  id: "hyresvard",
                  label: "Hyresvärd",
                  placeholder: "Välj hyresvärd",
                  searchable: true,
                  options: [
                    { label: "Privat hyresvärd", value: "privat" },
                    { label: "Företag", value: "företag" }, // Uppdaterat värde
                  ],
                }}
                field3={{
                  id: "pris",
                  label: "Pris",
                  placeholder: "Välj prisintervall",
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
              priceHistogram={[1, 3, 5, 8, 5, 3, 21, 3, 5, 8, 5, 3, 2]} // Exempeldata
              priceBounds={priceBounds}
              initialState={defaultListingsFilterState}
              onApply={(state) => setFilters(state)}
              onClear={() => setFilters(defaultListingsFilterState)}
            />
          </div>
        </div>
      </section>

      {/* SEKTION 2: Rubrik + Vyval */}
      <section className="w-full">
        <div className="flex w-full flex-wrap items-center justify-between gap-4">
          <h2 id="bostader-heading" className="text-lg font-semibold text-black">
             {loading && filteredListings.length === 0 
                ? "Laddar bostäder..." 
                : `Visar ${totalListingsCount} bostäder`
             }
          </h2>
          <SwitchSelect value={view} onChange={setView} />
        </div>
      </section>

      {/* SEKTION 3: Grid med annonser */}
      <section className="w-full min-h-[400px]">
        <FieldSet className="w-full" aria-labelledby="bostader-heading">
          
          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </div>
          )}

          {/* Fall 1: Karta */}
          {isMapView ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 items-start gap-6 h-[calc(100vh-200px)]">
              {/* Lista i kartvyn */}
              <div className={`${listingGridClasses} overflow-y-auto h-full pr-2`}>
                 {filteredListings.map((listing) => renderListingCard(listing, "compact"))}
                 {loadingMore && <div className="col-span-full py-4 text-center text-sm text-gray-500">Laddar fler...</div>}
                 <div ref={loadMoreRef} className="h-4 w-full" />
              </div>
              
              {/* Karta */}
              <div className="rounded-2xl overflow-hidden h-full sticky top-0">
                <ListingsMap
                  listings={filteredListings} // Se till att ListingsMap accepterar ListingCardDTO
                  onOpenListing={(id) => router.push(`/bostader/${id}`)}
                />
              </div>
            </div>
          ) : (
            /* Fall 2: Vanlig Grid */
            <>
              {filteredListings.length === 0 && !loading && (
                 <div className="py-20 text-center text-gray-500">
                    Inga bostäder matchade din sökning.
                 </div>
              )}

              <div className={listingGridClasses}>
                {filteredListings.map((listing) => renderListingCard(listing))}
              </div>

              {/* Loader och trigger för Infinite Scroll */}
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

      {/* Scroll to Top Knapp */}
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