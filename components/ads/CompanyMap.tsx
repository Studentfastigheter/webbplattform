"use client";

import { useCallback, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { ChevronDown, MapPin, Layers } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ListingCardDTO } from "@/types/listing";
import type { CompanyMapListing } from "@/app/(site)/(ads)/alla-koer/[id]/_dummy/companyMediaData";

// Reuse the same map component the bostader detail page uses so the visual
// rhythm (markers, clusters, popups, padding) is consistent across the app.
// `dynamic` with ssr:false because react-leaflet has no SSR support.
const ListingsMap = dynamic(() => import("@/components/Map/ListingsMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full animate-pulse rounded-3xl bg-gray-100" />
  ),
});

// ── Constants ────────────────────────────────────────────────────────────────

const ALL_CITIES_VALUE = "__all__";

type CompanyMapProps = {
  listings: CompanyMapListing[];
  companyName?: string;
};

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Converts the company's lightweight map-listing entries to the canonical
 * ListingCardDTO shape that ListingsMap expects. Fields not present on
 * CompanyMapListing are filled with sensible neutrals so the popup card
 * still renders nicely (no broken images, no missing tags).
 */
function toListingCardDTO(item: CompanyMapListing): ListingCardDTO {
  return {
    id: item.id,
    imageUrl: item.imageUrl ?? "",
    title: item.title,
    location: `${item.address}, ${item.city}`,
    rent: item.rent,
    dwellingType: "Bostad",
    rooms: item.rooms,
    sizeM2: 0,
    tags: [],
    hostType: "Företag",
    verifiedHost: false,
    lat: item.lat,
    lng: item.lng,
  };
}

// ── Main component ───────────────────────────────────────────────────────────

export default function CompanyMap({ listings, companyName }: CompanyMapProps) {
  const router = useRouter();
  const [selectedCity, setSelectedCity] = useState<string>(ALL_CITIES_VALUE);

  const cityOptions = useMemo(() => {
    const counts = listings.reduce<Record<string, number>>((acc, l) => {
      acc[l.city] = (acc[l.city] ?? 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts)
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count || a.city.localeCompare(b.city, "sv"));
  }, [listings]);

  const filteredListings = useMemo(() => {
    if (selectedCity === ALL_CITIES_VALUE) return listings;
    return listings.filter((l) => l.city === selectedCity);
  }, [listings, selectedCity]);

  const mapListings = useMemo<ListingCardDTO[]>(
    () => filteredListings.map(toListingCardDTO),
    [filteredListings],
  );

  const handleOpenListing = useCallback(
    (id: string) => {
      router.push(`/bostader/${id}`);
    },
    [router],
  );

  // Render guard — keep the page clean if no listings to map.
  if (listings.length === 0) return null;

  const totalLabel =
    selectedCity === ALL_CITIES_VALUE
      ? `${listings.length} bostäder i ${cityOptions.length} ${
          cityOptions.length === 1 ? "stad" : "städer"
        }`
      : `${filteredListings.length} ${
          filteredListings.length === 1 ? "bostad" : "bostäder"
        } i ${selectedCity}`;

  return (
    <section className="w-full">
      {/* Header — same rhythm as Video / Gallery sections */}
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#004225]/10 text-[#004225]">
            <Layers className="h-[18px] w-[18px]" />
          </span>
          <div className="flex flex-col">
            <h2 className="text-lg font-semibold text-gray-900">
              Hitta bostäder på kartan
            </h2>
            <p className="text-xs text-gray-500">{totalLabel}</p>
          </div>
        </div>

        {/* City dropdown */}
        <Select value={selectedCity} onValueChange={setSelectedCity}>
          <SelectTrigger className="h-11 w-full rounded-full border-[#004225]/15 bg-white px-4 text-sm font-semibold text-gray-900 shadow-sm transition hover:border-[#004225]/30 sm:w-64">
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[#004225]" />
              <SelectValue placeholder="Välj stad" />
            </span>
          </SelectTrigger>
          <SelectContent className="rounded-2xl border border-black/5 bg-white shadow-[0_18px_45px_rgba(0,0,0,0.12)]">
            {/* textValue keeps the trigger clean even when children include
                inline badges — Radix uses textValue (or ItemText's plain text)
                to render the selected label. */}
            <SelectItem
              value={ALL_CITIES_VALUE}
              textValue="Alla städer"
              className="rounded-xl text-sm font-medium"
            >
              <span className="flex w-full items-center justify-between gap-3">
                <span>Alla städer</span>
                <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-600">
                  {listings.length}
                </span>
              </span>
            </SelectItem>
            {cityOptions.map(({ city, count }) => (
              <SelectItem
                key={city}
                value={city}
                textValue={city}
                className="rounded-xl text-sm font-medium"
              >
                <span className="flex w-full items-center justify-between gap-3">
                  <span>{city}</span>
                  <span className="inline-flex items-center rounded-full bg-[#004225]/10 px-2 py-0.5 text-[11px] font-semibold text-[#004225]">
                    {count}
                  </span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/*
        Map shell — matches the bostader detail page's map preview frame
        (height, radius, border, shadow). `isolate` creates a new stacking
        context so Leaflet's internal z-indexes (panes go up to 700) stay
        local to this container; without it the dropdown / lightbox would
        render under the map.
      */}
      <div className="relative isolate z-0 h-[400px] w-full overflow-hidden rounded-3xl border border-black/5 shadow-[0_18px_45px_rgba(0,0,0,0.05)]">
        {/* Key forces a fresh mount when the city changes — that lets BaseMap
            re-center on the new city, not just refit existing bounds. */}
        <ListingsMap
          key={selectedCity}
          listings={mapListings}
          className="h-full w-full"
          fillContainer
          onOpenListing={handleOpenListing}
        />

        {/* Empty state — covers the case where a filter narrows to zero */}
        {filteredListings.length === 0 && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white/85 backdrop-blur-[1px]">
            <div className="pointer-events-auto rounded-2xl border border-black/5 bg-white px-6 py-4 text-center shadow-[0_12px_30px_rgba(0,0,0,0.08)]">
              <p className="text-sm font-semibold text-gray-900">
                Inga bostäder i {selectedCity}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Välj en annan stad eller visa alla.
              </p>
              <button
                type="button"
                onClick={() => setSelectedCity(ALL_CITIES_VALUE)}
                className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#004225] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#00331b]"
              >
                Visa alla städer
                <ChevronDown className="h-3.5 w-3.5 -rotate-90" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Helper hint under the map */}
      <p className="mt-3 text-center text-xs text-gray-500">
        Tryck på en markering för att se bostaden — eller välj stad ovan för att
        zooma in.
        {companyName ? ` Visar bostäder från ${companyName}.` : ""}
      </p>
    </section>
  );
}
