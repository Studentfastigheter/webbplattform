import type { ReactNode } from "react";

import { Skeleton } from "@/components/ui/skeleton";

const pulse = "motion-reduce:animate-none";

/**
 * Skelettskal för listsidorna i (ads)-gruppen (bostäder, städer, köer):
 * sökfält + rubrikrad + kortyta med samma yttre rytm som de riktiga sidorna,
 * så att innehållet inte hoppar när sidan streamas in.
 */
export default function ListPageSkeleton({ children }: { children: ReactNode }) {
  return (
    <main
      className="flex h-auto w-full flex-col gap-6 pb-12 pt-4 sm:gap-8"
      aria-busy="true"
    >
      <div className="container mx-auto h-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <section className="mt-4 w-full sm:mt-8" aria-hidden="true">
          <div className="flex w-full flex-col items-stretch gap-2 sm:gap-3 md:flex-row md:items-center md:justify-center lg:grid lg:grid-cols-[1fr_minmax(0,680px)_1fr] xl:grid-cols-[1fr_minmax(0,760px)_1fr] 2xl:grid-cols-[1fr_minmax(0,840px)_1fr]">
            <div className="w-full md:max-w-[620px] md:flex-1 lg:col-start-2 lg:max-w-none">
              {/* Skugga av SearchBar (h-11 sm:h-12, rounded-full) */}
              <Skeleton className={`h-11 w-full rounded-full sm:h-12 ${pulse}`} />
            </div>
          </div>
        </section>

        <section className="mt-4 w-full sm:mt-5" aria-hidden="true">
          <Skeleton className={`h-5 w-44 sm:h-6 ${pulse}`} />
        </section>

        <section className="mt-3 min-h-[400px] w-full sm:mt-4" aria-hidden="true">
          {children}
        </section>
      </div>
    </main>
  );
}
