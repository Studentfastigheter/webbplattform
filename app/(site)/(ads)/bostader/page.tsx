"use client";

import { type ReactNode, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

import ListingCardSmall from "@/components/Listings/ListingCard_Small";
import ListingsFilterButton from "@/components/Listings/Search/ListingsFilterButton";
import SearchFilter3Fields from "@/components/Listings/Search/SearchFilter-3field";
import { FieldSet } from "@/components/ui/field";
import SwitchSelect, { SwitchSelectValue } from "@/components/ui/switchSelect";

const ListingsMap = dynamic(() => import("@/components/Map/ListingsMap"), {
  ssr: false,
  loading: () => (
    <div className="min-h-[520px] rounded-2xl bg-gray-100" aria-hidden />
  ),
});

type ListingItem = {
  id: string;
  title: string;
  area: string;
  city: string;
  address?: string;
  lat: number;
  lng: number;
  dwellingType: string;
  rooms: number;
  sizeM2: number;
  rent: number;
  landlordType: string;
  isVerified?: boolean;
  imageUrl: string;
  tags?: string[];
};

const listings: ListingItem[] = [
  {
    id: "vasagatan-19",
    title: "1:a Vasagatan 19",
    area: "Innerstan",
    city: "Goteborg",
    address: "Vasagatan 19",
    lat: 57.7089,
    lng: 11.9746,
    dwellingType: "Lagenhet",
    rooms: 1,
    sizeM2: 28,
    rent: 3800,
    landlordType: "Privat hyresvard",
    isVerified: true,
    imageUrl: "/appartment.jpg",
    tags: ["Moblerat", "Poangfri", "Korridor"],
  },
  {
    id: "linnestaden-6",
    title: "1:a Linnegatan 6",
    area: "Linnestaden",
    city: "Goteborg",
    address: "Linnegatan 6",
    lat: 57.6935,
    lng: 11.9503,
    dwellingType: "Rum",
    rooms: 1,
    sizeM2: 22,
    rent: 3600,
    landlordType: "Privat hyresvard",
    imageUrl: "/appartment.jpg",
    tags: ["Moblerat", "Studentrum"],
  },
  {
    id: "kungshojd-11",
    title: "2:a Kungshojd 11",
    area: "Kungshojd",
    city: "Goteborg",
    address: "Kungshojdsgatan 11",
    lat: 57.7038,
    lng: 11.959,
    dwellingType: "Lagenhet",
    rooms: 2,
    sizeM2: 44,
    rent: 5200,
    landlordType: "Kommunal",
    isVerified: true,
    imageUrl: "/appartment.jpg",
    tags: ["Poangfri", "Balkong"],
  },
  {
    id: "karlaplan-5",
    title: "1:a Karlaplan 5",
    area: "Ostermalm",
    city: "Stockholm",
    address: "Karlaplan 5",
    lat: 59.3388,
    lng: 18.0934,
    dwellingType: "Rum",
    rooms: 1,
    sizeM2: 20,
    rent: 4700,
    landlordType: "Stiftelse",
    imageUrl: "/appartment.jpg",
    tags: ["Moblerat", "Nara campus"],
  },
  {
    id: "kista-centrum",
    title: "1,5:a Kista Centrum",
    area: "Kista",
    city: "Stockholm",
    address: "Borgarfjordsgatan 18",
    lat: 59.4035,
    lng: 17.9442,
    dwellingType: "Lagenhet",
    rooms: 1,
    sizeM2: 32,
    rent: 5100,
    landlordType: "Privat hyresvard",
    imageUrl: "/appartment.jpg",
    tags: ["Tunnelbana", "Student"],
  },
  {
    id: "uppsala-norr",
    title: "1:a Studentstaden",
    area: "Studentstaden",
    city: "Uppsala",
    address: "Studentvagen 12",
    lat: 59.8586,
    lng: 17.6389,
    dwellingType: "Rum",
    rooms: 1,
    sizeM2: 18,
    rent: 3400,
    landlordType: "Kommunal",
    imageUrl: "/appartment.jpg",
    tags: ["Moblerat", "Korridor"],
  },
  {
    id: "lund-centrum",
    title: "2:a Lund Centrum",
    area: "Centrum",
    city: "Lund",
    address: "Bredgatan 4",
    lat: 55.7047,
    lng: 13.191,
    dwellingType: "Lagenhet",
    rooms: 2,
    sizeM2: 46,
    rent: 5400,
    landlordType: "AF Bostader",
    isVerified: true,
    imageUrl: "/appartment.jpg",
    tags: ["Poangfri", "Student"],
  },
  {
    id: "malmo-vaster",
    title: "1:a Malmo Vaster",
    area: "Vaster",
    city: "Malmo",
    address: "Lernacken 2",
    lat: 55.605,
    lng: 13.0038,
    dwellingType: "Rum",
    rooms: 1,
    sizeM2: 24,
    rent: 4100,
    landlordType: "Privat hyresvard",
    imageUrl: "/appartment.jpg",
    tags: ["Moblerat"],
  },
  {
    id: "umea-campus",
    title: "1:a Umea Campus",
    area: "Campus",
    city: "Umea",
    address: "Universitetsomradet 3",
    lat: 63.8258,
    lng: 20.263,
    dwellingType: "Rum",
    rooms: 1,
    sizeM2: 21,
    rent: 3200,
    landlordType: "Kommunal",
    imageUrl: "/appartment.jpg",
    tags: ["Student", "Nara campus"],
  },
  {
    id: "orebro-sodra",
    title: "1,5:a Orebro Sodra",
    area: "Sodra",
    city: "Orebro",
    address: "Sodra Grev Rosengatan 7",
    lat: 59.2741,
    lng: 15.2066,
    dwellingType: "Lagenhet",
    rooms: 1,
    sizeM2: 30,
    rent: 4300,
    landlordType: "Kommunal",
    imageUrl: "/appartment.jpg",
    tags: ["Student", "Balkong"],
  },
  {
    id: "linkoping-valla",
    title: "2:a Linkoping Valla",
    area: "Valla",
    city: "Linkoping",
    address: "Vallavagen 16",
    lat: 58.4108,
    lng: 15.6214,
    dwellingType: "Lagenhet",
    rooms: 2,
    sizeM2: 50,
    rent: 5500,
    landlordType: "Privat hyresvard",
    imageUrl: "/appartment.jpg",
    tags: ["Student", "Moblerat"],
  },
  {
    id: "sundsvall-norra",
    title: "1:a Sundsvall Norra",
    area: "Norra",
    city: "Sundsvall",
    address: "Skonsberg 8",
    lat: 62.3908,
    lng: 17.3069,
    dwellingType: "Rum",
    rooms: 1,
    sizeM2: 23,
    rent: 3500,
    landlordType: "Kommunal",
    imageUrl: "/appartment.jpg",
    tags: ["Moblerat"],
  },
];

export default function Page() {
  const router = useRouter();
  const [view, setView] = useState<SwitchSelectValue>("lista");
  const isMapView = view === "karta";
  const totalListings = listings.length;

  const listingGridClasses = isMapView
    ? "grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-4 justify-items-center"
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
    return listings.map((listing) => renderListingCard(listing));
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
            />
          </div>
        </div>
      </section>

      {/* Sektion 2: rubrik + vyval for bostaderna */}
      <section className="w-full">
        <div className="flex w-full flex-wrap items-center justify-between gap-4">
          <h2 id="bostader-heading" className="text-base font-semibold text-black">
            Över {totalListings.toLocaleString("sv-SE")} boenden
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
                <ListingsMap listings={listings} />
              </div>
            </div>
          ) : (
            <div className={listingGridClasses}>
              {listings.map((listing) => renderListingCard(listing))}
            </div>
          )}
        </FieldSet>
      </section>
    </main>
  );
}
