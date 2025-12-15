"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import SavedListingRow, {
  type SavedListingRowProps,
} from "@/components/Listings/SavedListingRow";
import SwitchSelect, { type SwitchSelectValue } from "@/components/ui/switchSelect";
import type { ListingWithRelations } from "@/types";

const ListingsMap = dynamic(() => import("@/components/Map/ListingsMap"), { ssr: false });

const DEMO_LISTINGS: ListingWithRelations[] = [
  makeListing({
    listingId: "demo-vasagatan-1",
    imageUrl:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80",
    lat: 57.7079,
    lng: 11.9667,
  }),
  makeListing({
    listingId: "demo-vasagatan-2",
    imageUrl:
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80",
    lat: 57.7085,
    lng: 11.978,
  }),
  makeListing({
    listingId: "demo-vasagatan-3",
    imageUrl:
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80",
    lat: 57.7092,
    lng: 11.958,
  }),
];

export default function Page() {
  const router = useRouter();
  const [view, setView] = useState<SwitchSelectValue>("lista");

  const savedRows = useMemo(
    () =>
      DEMO_LISTINGS.map((listing) =>
        mapListingToRow(listing, () => router.push(`/bostader/${listing.listingId}`))
      ),
    [router]
  );

  const isMapView = view === "karta";

  return (
    <main className="pb-12 pt-6">
      <div className="w-full space-y-2">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Sparade annonser</h1>
        </div>
        <div className="flex items-center justify-between pb-2">
          <div className="text-sm text-muted-foreground">
            {savedRows.length} sparade annonser
          </div>
          <SwitchSelect value={view} onChange={setView} />
        </div>

        {savedRows.length === 0 ? (
          <div className="rounded-2xl border bg-muted/30 px-4 py-6 text-sm text-muted-foreground">
            Du har inga sparade annonser just nu.
          </div>
        ) : isMapView ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="flex flex-col gap-3">
              {savedRows.map((item) => (
                <SavedListingRow key={item.listingId} {...item} />
              ))}
            </div>
            <div className="min-h-[520px] overflow-hidden rounded-2xl border">
              <ListingsMap
                listings={DEMO_LISTINGS}
                onOpenListing={(id) => router.push(`/bostader/${id}`)}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {savedRows.map((item) => (
              <SavedListingRow key={item.listingId} {...item} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function mapListingToRow(
  listing: ListingWithRelations,
  onOpen: () => void
): SavedListingRowProps {
  const primaryImage =
    typeof listing.images?.[0] === "string"
      ? (listing.images?.[0] as string)
      : listing.images?.[0]?.imageUrl ?? undefined;

  return {
    listingId: listing.listingId,
    title: listing.title,
    rent: listing.rent,
    area: listing.area ?? null,
    city: listing.city ?? null,
    dwellingType: listing.dwellingType ?? null,
    rooms: listing.rooms ?? null,
    sizeM2: listing.sizeM2 ?? null,
    tags: listing.tags ?? [],
    landlordLabel: listing.advertiser?.displayName ?? "Hyresvard",
    imageUrl: primaryImage,
    verified: Boolean(listing.advertiser),
    onOpen,
  };
}

function makeListing(options: {
  listingId: string;
  imageUrl: string;
  lat: number;
  lng: number;
}): ListingWithRelations {
  const now = "2024-12-15T12:00:00.000Z";
  return {
    listingId: options.listingId,
    listingType: "company",
    companyId: 1,
    title: "1:a Vasagatan 19",
    area: "Innerstan",
    city: "Goteborg",
    address: "Vasagatan 19",
    dwellingType: "Lagenhet",
    rooms: 1,
    sizeM2: 42,
    rent: 3800,
    moveIn: null,
    applyBy: null,
    availableFrom: null,
    availableTo: null,
    description: null,
    tags: ["Moblerat", "Poangfri", "Korridor"],
    images: [
      { imageId: 1, listingId: options.listingId, imageUrl: options.imageUrl },
    ],
    status: "available",
    createdAt: now,
    updatedAt: now,
    lat: options.lat,
    lng: options.lng,
    advertiser: {
      type: "company",
      id: 1,
      displayName: "Privat hyresvard",
      logoUrl: null,
      bannerUrl: null,
      phone: null,
      contactEmail: null,
      contactPhone: null,
      contactNote: null,
      rating: null,
      subtitle: null,
      description: null,
      website: null,
      city: "Goteborg",
    },
  };
}
