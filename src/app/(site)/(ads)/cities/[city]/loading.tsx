import { Skeleton } from "@/components/ui/skeleton";
import ListingCardSkeleton from "@/features/listings/components/ListingCardSkeleton";

const pulse = "motion-reduce:animate-none";

/**
 * Visas direkt vid navigering till /cities/[city] medan servern prefetchar
 * staden — speglar CityDetailPageClients banner + rubrik + bostadsgrid.
 */
export default function Loading() {
  return (
    <main
      className="flex h-auto w-full flex-col pb-10 pt-3 sm:pb-12 sm:pt-4"
      aria-busy="true"
    >
      <div
        className="container mx-auto h-auto px-3 sm:px-4 md:px-6 lg:px-8"
        aria-hidden="true"
      >
        <section className="mt-4 w-full sm:mt-8 lg:mt-10">
          {/* Skugga av stadsbannern */}
          <Skeleton className={`min-h-[180px] w-full rounded-[22px] sm:aspect-[1440/425] sm:min-h-0 sm:rounded-3xl ${pulse}`} />

          <div className="mx-auto flex max-w-4xl flex-col gap-3 px-1 pt-5 sm:gap-4 sm:px-6 sm:pt-9">
            <Skeleton className={`h-8 w-56 ${pulse}`} />
            <div className="flex flex-col gap-2.5">
              <Skeleton className={`h-4 w-full max-w-2xl ${pulse}`} />
              <Skeleton className={`h-4 w-full max-w-xl ${pulse}`} />
              <Skeleton className={`h-4 w-2/3 max-w-lg ${pulse}`} />
            </div>
          </div>
        </section>

        <section className="mt-8 w-full sm:mt-10 lg:mt-12">
          <div className="mb-4 sm:mb-5">
            <Skeleton className={`h-6 w-48 ${pulse}`} />
          </div>
          <div className="grid grid-cols-1 justify-items-center gap-4 sm:gap-5 md:grid-cols-2 lg:gap-6 xl:grid-cols-3">
            {Array.from({ length: 3 }, (_, index) => (
              <div key={`listing-skeleton-${index}`} className="flex w-full justify-center">
                <ListingCardSkeleton />
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
