import ListPageSkeleton from "../_components/ListPageSkeleton";

import { Skeleton } from "@/components/ui/skeleton";

/**
 * Visas direkt vid navigering till /cities medan servern prefetchar
 * städerna — samma kortgrid som CitiesPageClient renderar under laddning.
 */
export default function Loading() {
  return (
    <ListPageSkeleton>
      <div className="grid w-full grid-cols-1 justify-start gap-3 sm:gap-5 md:grid-cols-2 lg:gap-6 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton
            key={`city-skeleton-${index}`}
            className="h-[225px] w-full rounded-[22px] motion-reduce:animate-none sm:h-[245px]"
          />
        ))}
      </div>
    </ListPageSkeleton>
  );
}
