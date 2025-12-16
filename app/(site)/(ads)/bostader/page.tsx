"use client";

import { useEffect, useMemo, useState } from "react";
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    backendApi.listings
      .list({ size: 100 })
      .then((res) => {
        if (!active) return;
        setListings(res.items ?? []);
      })
      .catch((err: any) => {
        if (!active) return;
        setError(err?.message ?? "Kunde inte ladda bostader.");
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

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
      const city = (listing.city ?? "").toLowerCase();
      const area = (listing.area ?? "").toLowerCase();
      const landlordName = (listing.advertiser?.displayName ?? "").toLowerCase();
      const rentValue = listing.rent ?? 0;

      const matchesCity =
        !searchCity ||
        city.includes(searchCity) ||
        area.includes(searchCity);

      const matchesLandlord =
        !searchLandlord || landlordName.includes(searchLandlord);

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
  }, [filters, listings, searchValues]);

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
        </FieldSet>
      </section>
    </main>
  );
}
