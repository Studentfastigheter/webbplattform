"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

import ListingCardSmall from "@/components/Listings/ListingCard_Small";
import ListingsFilterButton, {
  type ListingsFilterState,
} from "@/components/Listings/Search/ListingsFilterButton";
import SearchFilter3Fields from "@/components/Listings/Search/SearchFilter-3field";
import { FieldSet } from "@/components/ui/field";
import SwitchSelect, { SwitchSelectValue } from "@/components/ui/switchSelect";
import { listingFixtures, type ListingFixture } from "@/lib/mockData";

const ListingsMap = dynamic(() => import("@/components/Map/ListingsMap"), {
  ssr: false,
  loading: () => (
    <div className="min-h-[520px] rounded-2xl bg-gray-100" aria-hidden />
  ),
});

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

type UIListing = ListingFixture;

const listings: UIListing[] = listingFixtures;

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

  const isMapView = view === "karta";

  const filteredListings = useMemo(() => {
    const searchCity =
      typeof searchValues.var === "string"
        ? searchValues.var.trim().toLowerCase()
        : "";
    const searchLandlord =
      typeof searchValues.hyresvard === "string"
        ? searchValues.hyresvard.trim().toLowerCase()
        : "";
    const searchPriceRange = parseSearchPriceRange(searchValues.pris);

    return listings.filter((listing) => {
      const matchesCity =
        !searchCity ||
        listing.city.toLowerCase().includes(searchCity) ||
        listing.area.toLowerCase().includes(searchCity);

      const matchesLandlord =
        !searchLandlord ||
        listing.landlordType.toLowerCase().includes(searchLandlord);

      const matchesSearchPrice =
        !searchPriceRange ||
        (listing.rent >= searchPriceRange.min &&
          (searchPriceRange.max === Number.POSITIVE_INFINITY ||
            listing.rent <= searchPriceRange.max));

      const matchesPropertyType =
        !filters.propertyType ||
        listing.dwellingType.toLowerCase() ===
          filters.propertyType.toLowerCase();

      const matchesAmenities =
        filters.amenities.length === 0 ||
        filters.amenities.every((amenity) =>
          (listing.tags ?? [])
            .map((tag) => tag.toLowerCase())
            .includes(amenity.toLowerCase())
        );

      const matchesPriceRange =
        listing.rent >= filters.priceRange.min &&
        listing.rent <= filters.priceRange.max;

      return (
        matchesCity &&
        matchesLandlord &&
        matchesSearchPrice &&
        matchesPropertyType &&
        matchesAmenities &&
        matchesPriceRange
      );
    });
  }, [filters, searchValues]);

  const totalListings = filteredListings.length;

  const listingGridClasses = isMapView
    ? "grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-4 justify-items-center"
    : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 justify-items-center";

  const renderListingCard = (
    listing: UIListing,
    variant: "default" | "compact" = "default"
  ) => (
    <div key={listing.listingId} className="flex w-full justify-center">
      <ListingCardSmall
        title={listing.title}
        area={listing.area}
        city={listing.city}
        dwellingType={listing.dwellingType}
        rooms={listing.rooms}
        sizeM2={listing.sizeM2}
        rent={listing.rent}
        landlordType={listing.landlordType ?? listing.advertiser.displayName}
        isVerified={listing.isVerified}
        imageUrl={listing.imageUrl}
        tags={listing.tags ?? undefined}
        onClick={() => router.push(`/bostader/${listing.listingId}`)}
        variant={variant}
      />
    </div>
  );

  const renderMapListings = () => {
    return filteredListings.map((listing) =>
      renderListingCard(listing, "compact")
    );
  };

  return (
    <main className="flex flex-col gap-8 px-4 pb-12 pt-4">
      {/* Sektion 1: filter */}
      <section className="flex justify-center">
        <div className="flex w-full max-w-[1200px] flex-col gap-4">
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
          {isMapView ? (
              <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] items-start gap-6">
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
        </FieldSet>
      </section>
    </main>
  );
}
