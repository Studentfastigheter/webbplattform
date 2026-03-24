"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ListingCard_Small from "@/components/Listings/ListingCard_Small";
import { type ListingCardDTO } from "@/types/listing";
import { Button } from "@/components/ui/button";

type Props = {
  listings: ListingCardDTO[];
  title?: string;
};

const ROWS = 2;
const COLS = 3;
const PAGE_SIZE = ROWS * COLS;

export default function QueueListings({
  listings,
  title = "Lediga bostäder",
}: Props) {
  const router = useRouter();
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const visible = listings.slice(0, visibleCount);
  const hasMore = visibleCount < listings.length;

  return (
    <section>
      {/* Header row */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        <Link
          href="/bostader"
          className="inline-flex items-center gap-2 rounded-full bg-[#004225] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#004225]/90"
        >
          Visa alla bostäder
        </Link>
      </div>

      {/* Grid - same layout as bostader page */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-3 md:gap-6 justify-items-center">
        {visible.map((listing) => (
          <div key={listing.id} className="flex w-full justify-center">
            <ListingCard_Small
              title={listing.title}
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
            />
          </div>
        ))}
      </div>

      {/* Show more */}
      {hasMore && (
        <div className="mt-8 flex justify-center">
          <Button
            variant="secondary"
            size="md"
            onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
          >
            Visa mer
          </Button>
        </div>
      )}
    </section>
  );
}
