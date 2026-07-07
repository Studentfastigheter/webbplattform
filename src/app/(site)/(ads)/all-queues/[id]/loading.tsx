import { Skeleton } from "@/components/ui/skeleton";
import ListingCardSkeleton from "@/features/listings/components/ListingCardSkeleton";

const pulse = "motion-reduce:animate-none";

/**
 * Visas direkt vid navigering till /all-queues/[id] medan servern prefetchar
 * bolaget — speglar QueueDetailPageClients hero (banner + logga) + bostadsgrid.
 */
export default function Loading() {
  return (
    <main
      className="container mx-auto min-h-screen bg-white px-3 pb-12 pt-4 sm:px-4 md:px-6 lg:px-8 lg:pt-10"
      aria-busy="true"
    >
      <div className="flex w-full flex-col" aria-hidden="true">
        {/* Skugga av QueueHero: banner + logga + bolagsinfo */}
        <Skeleton className={`h-[180px] w-full rounded-[22px] sm:h-[240px] sm:rounded-3xl ${pulse}`} />
        <div className="mt-5 flex items-start gap-4 sm:mt-6">
          <Skeleton className={`h-20 w-20 shrink-0 rounded-2xl sm:h-24 sm:w-24 ${pulse}`} />
          <div className="flex min-w-0 flex-1 flex-col gap-2 pt-1">
            <Skeleton className={`h-7 w-64 max-w-full ${pulse}`} />
            <Skeleton className={`h-4 w-40 max-w-full ${pulse}`} />
          </div>
        </div>
        <div className="mt-6 flex flex-col gap-2.5">
          <Skeleton className={`h-4 w-full max-w-2xl ${pulse}`} />
          <Skeleton className={`h-4 w-full max-w-xl ${pulse}`} />
          <Skeleton className={`h-4 w-2/3 max-w-lg ${pulse}`} />
        </div>

        <div className="mt-10 grid grid-cols-1 justify-items-center gap-4 sm:gap-5 md:grid-cols-2 lg:gap-6 xl:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={`listing-skeleton-${index}`} className="flex w-full justify-center">
              <ListingCardSkeleton />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
