import { Skeleton } from "@/components/ui/skeleton";

const pulse = "motion-reduce:animate-none";

/**
 * Visas direkt vid navigering till /housing/[id] medan servern prefetchar
 * annonsen — samma skelett som ListingDetailPageClient renderar under laddning.
 */
export default function Loading() {
  return (
    <main
      className="mx-auto min-h-screen w-full max-w-7xl bg-white px-4 pb-10 pt-4 sm:px-6 sm:pb-12 lg:px-8 lg:pt-8"
      aria-busy="true"
    >
      <div className="flex w-full flex-col gap-6 sm:gap-8 lg:gap-10" aria-hidden="true">
        {/* Skugga av bildgrid + rubrik/pris + innehållsblock */}
        <Skeleton className={`aspect-[16/10] w-full rounded-2xl sm:aspect-[16/9] lg:aspect-[16/8] lg:rounded-3xl ${pulse}`} />
        <div className="flex flex-col gap-3">
          <Skeleton className={`h-4 w-32 ${pulse}`} />
          <Skeleton className={`h-8 w-2/3 max-w-md ${pulse}`} />
          <Skeleton className={`h-5 w-40 ${pulse}`} />
        </div>
        <div className="flex flex-col gap-2.5">
          <Skeleton className={`h-4 w-full max-w-2xl ${pulse}`} />
          <Skeleton className={`h-4 w-full max-w-xl ${pulse}`} />
          <Skeleton className={`h-4 w-2/3 max-w-lg ${pulse}`} />
        </div>
        <Skeleton className={`h-[300px] w-full rounded-2xl sm:h-[360px] sm:rounded-3xl lg:h-[420px] ${pulse}`} />
      </div>
    </main>
  );
}
