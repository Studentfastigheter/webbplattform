"use client";

import { type ReactNode, useState } from "react";
import { useRouter } from "next/navigation";

import ListingCardSmall from "@/components/Listings/ListingCard_Small";
import ListingsFilterButton from "@/components/Listings/Search/ListingsFilterButton";
import SearchFilter3Fields from "@/components/Listings/Search/SearchFilter-3field";
import { FieldSet } from "@/components/ui/field";
import SwitchSelect, { SwitchSelectValue } from "@/components/ui/switchSelect";

type ListingItem = {
  id: string;
  title: string;
  area: string;
  city: string;
  dwellingType: string;
  rooms: number;
  sizeM2: number;
  rent: number;
  landlordType: string;
  isVerified?: boolean;
  imageUrl: string;
  tags?: string[];
};

const listings: ListingItem[] = Array.from({ length: 12 }).map((_, idx) => ({
  id: `listing-${idx + 1}`,
  title: "1:a Vasagatan 19",
  area: "Innerstan",
  city: "Goteborg",
  dwellingType: "Lagenhet",
  rooms: 3,
  sizeM2: 42,
  rent: 3800,
  landlordType: "Privat hyresvard",
  isVerified: true,
  imageUrl: "/appartment.jpg",
  tags: ["Moblerat", "Poangfri", "Korridor"],
}));

export default function Page() {
  const router = useRouter();
  const [view, setView] = useState<SwitchSelectValue>("lista");
  const isMapView = view === "karta";
  const totalListings = listings.length;

  const listingGridClasses = isMapView
    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 justify-items-center"
    : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 justify-items-center";

  const renderListingCard = (listing: ListingItem) => (
    <div key={listing.id} className="flex w-full justify-center">
      <ListingCardSmall
        {...listing}
        onClick={() => router.push(`/bostader/${listing.id}`)}
      />
    </div>
  );

  const renderMapListings = () => {
    const nodes: ReactNode[] = [];
    const itemsPerRow = 3;
    let rowIndex = 1;
    let i = 0;

    while (i < listings.length) {
      if (rowIndex % 3 === 0) {
        nodes.push(
          <div key={`ad-row-${rowIndex}`} className="col-span-full">
            <div
              className="h-36 w-full rounded-2xl bg-red-500"
              aria-label="Annonsutrymme"
            />
          </div>
        );
        rowIndex += 1;
        continue;
      }

      const rowListings = listings.slice(i, i + itemsPerRow);
      nodes.push(...rowListings.map(renderListingCard));
      i += rowListings.length;
      rowIndex += 1;
    }

    return nodes;
  };

  return (
    <main className="flex flex-col gap-10 px-4 pb-16 pt-5">
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
                  options: [
                    { label: "Goteborg", value: "goteborg" },
                    { label: "Stockholm", value: "stockholm" },
                    { label: "Uppsala", value: "uppsala" },
                  ],
                }}
                field2={{
                  id: "hyresvard",
                  label: "Hyresvard",
                  placeholder: "Valj hyresvard",
                  options: [
                    { label: "SGS", value: "sgs" },
                    { label: "Svenska Studenthus", value: "svenska-studenthus" },
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
                onSubmit={(values) => {
                  console.log("search submit", values);
                }}
              />
            </div>
            <ListingsFilterButton
              amenities={[
                { id: "gym", label: "Gym" },
                { id: "tvatt", label: "Tvattmaskin" },
                { id: "disk", label: "Diskmaskin" },
              ]}
              propertyTypes={[
                { id: "rum", label: "Rum" },
                { id: "lagenhet", label: "Lagenhet" },
                { id: "korridor", label: "Korridor" },
              ]}
              priceHistogram={[
                1, 3, 5, 8, 5, 3, 21, 3, 5, 8, 5, 3, 21, 3, 5, 8, 5, 3, 21, 3, 5,
                8, 5, 3, 21, 3, 5, 8, 5, 3, 21, 3, 5, 8, 5, 3, 21, 3, 5, 8, 5, 3,
                21, 3, 5, 8, 5, 3, 2,
              ]}
              priceBounds={{ min: 0, max: 12000 }}
              className="self-start"
            />
          </div>
        </div>
      </section>

      {/* Sektion 2: rubrik + vyval for bostaderna */}
      <section className="w-full">
        <div className="grid grid-cols-[minmax(120px,15vw)_minmax(0,1fr)_minmax(120px,15vw)] items-center gap-6">
          <div className="col-start-2 flex items-center justify-between gap-4">
            <h2
              id="bostader-heading"
              className="text-base font-semibold text-black"
            >
              Över {totalListings.toLocaleString("sv-SE")} boenden
            </h2>
            <SwitchSelect value={view} onChange={setView} />
          </div>
        </div>
      </section>

      {/* Sektion 3: annonser + plats for reklam som gar kant-till-kant */}
      <section className="w-full">
        {isMapView ? (
          <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] items-start gap-6 mx-4">
            <FieldSet className="w-full" aria-labelledby="bostader-heading">
              <div className={listingGridClasses}>{renderMapListings()}</div>
            </FieldSet>
            <div className="min-h-[520px] rounded-2xl bg-blue-500" aria-hidden />
          </div>
        ) : (
          <div className="grid grid-cols-[minmax(120px,15vw)_minmax(0,1fr)_minmax(120px,15vw)] items-start gap-6">
            <div className="h-full min-h-[520px] rounded-2xl bg-red-500" aria-hidden />

            <FieldSet className="w-full" aria-labelledby="bostader-heading">
              <div className={listingGridClasses}>
                {listings.map((listing) => renderListingCard(listing))}
              </div>
            </FieldSet>

            <div className="h-full min-h-[520px] rounded-2xl bg-red-500" aria-hidden />
          </div>
        )}
      </section>
    </main>
  );
}
