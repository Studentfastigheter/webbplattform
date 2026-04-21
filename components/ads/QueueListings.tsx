"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import ListingCardSmall from "@/components/Listings/ListingCard_Small";
import { type ListingCardDTO } from "@/types/listing";

type Props = {
  listings: ListingCardDTO[];
  title?: string;
};

const ROWS = 2;
const COLS = 3;
const MAX_VISIBLE_LISTINGS = ROWS * COLS;

const splitListingLocation = (location?: string | null) => {
  const [area, ...cityParts] = (location ?? "").split(",");
  const trimmedArea = area?.trim();
  const trimmedCity = cityParts.join(",").trim();

  return {
    area: trimmedArea || "Ej angivet",
    city: trimmedCity || trimmedArea || "Ej angivet",
  };
};

export default function QueueListings({
  listings,
  title = "Lediga bostäder",
}: Props) {
  const router = useRouter();
  const visible = listings.slice(0, MAX_VISIBLE_LISTINGS);

  return (
    <section>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        <Link
          href="/bostader"
          className="inline-flex items-center gap-2 rounded-full bg-[#004225] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#004225]/90"
        >
          Visa alla bostäder
        </Link>
      </div>

      <div className="grid grid-cols-1 justify-items-center gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visible.map((listing) => {
          const { area, city } = splitListingLocation(listing.location);

          return (
            <div key={listing.id} className="flex w-full justify-center">
              <ListingCardSmall
                id={listing.id}
                title={listing.title}
                area={area}
                city={city}
                dwellingType={listing.dwellingType || "Bostad"}
                rooms={listing.rooms || 0}
                sizeM2={listing.sizeM2 || 0}
                rent={listing.rent || 0}
                landlordType={listing.hostType}
                hostName={listing.hostName}
                hostLogoUrl={listing.hostLogoUrl}
                isVerified={listing.verifiedHost}
                imageUrl={listing.imageUrl}
                tags={listing.tags}
                showFavoriteButton={false}
                onClick={() => router.push(`/bostader/${listing.id}`)}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
