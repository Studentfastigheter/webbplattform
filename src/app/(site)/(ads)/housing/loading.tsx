import ListPageSkeleton from "../_components/ListPageSkeleton";

import ListingCardSkeleton from "@/features/listings/components/ListingCardSkeleton";

/**
 * Visas direkt vid navigering till /housing medan servern prefetchar
 * bostäderna — samma grid som HousingPageClient renderar i listvyn.
 */
export default function Loading() {
  return (
    <ListPageSkeleton>
      <div className="grid grid-cols-1 justify-items-center gap-3 md:grid-cols-2 md:gap-6 xl:grid-cols-2 2xl:grid-cols-3">
        {Array.from({ length: 9 }, (_, index) => (
          <div key={`listing-skeleton-${index}`} className="flex w-full justify-center">
            <ListingCardSkeleton />
          </div>
        ))}
      </div>
    </ListPageSkeleton>
  );
}
