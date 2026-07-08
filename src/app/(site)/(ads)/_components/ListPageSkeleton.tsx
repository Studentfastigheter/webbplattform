"use client";

import type { ReactNode } from "react";

import { SearchBar } from "@/components/ui/search-bar";

/**
 * Laddningsskal för listsidorna i (ads)-gruppen (bostäder, städer, köer).
 * Den statiska kromen (sökruta + rubrik) renderas på riktigt så att bara
 * ytorna som fylls med backend-data visas som skelett — layouten är samma
 * som de riktiga sidorna, så inget hoppar när sidan streamas in.
 */
type ListPageSkeletonProps = {
  heading: string;
  searchPlaceholder: string;
  searchSubmitLabel: string;
  children: ReactNode;
};

export default function ListPageSkeleton({
  heading,
  searchPlaceholder,
  searchSubmitLabel,
  children,
}: ListPageSkeletonProps) {
  return (
    <main
      className="flex h-auto w-full flex-col gap-6 pb-12 pt-4 sm:gap-8"
      aria-busy="true"
    >
      <div className="container mx-auto h-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <section className="mt-4 w-full sm:mt-8">
          <div className="flex w-full flex-col items-stretch gap-2 sm:gap-3 md:flex-row md:items-center md:justify-center lg:grid lg:grid-cols-[1fr_minmax(0,680px)_1fr] xl:grid-cols-[1fr_minmax(0,760px)_1fr] 2xl:grid-cols-[1fr_minmax(0,840px)_1fr]">
            <div className="w-full md:max-w-[620px] md:flex-1 lg:col-start-2 lg:max-w-none">
              {/* Sökrutan ersätts av sidans riktiga, tillståndskopplade ruta
                  när RSC-payloaden landat — samma utseende, ingen blink. */}
              <SearchBar
                value=""
                onValueChange={() => {}}
                onSubmit={(event) => event.preventDefault()}
                placeholder={searchPlaceholder}
                submitLabel={searchSubmitLabel}
                clearLabel=""
              />
            </div>
          </div>
        </section>

        <section className="mt-4 w-full sm:mt-5">
          <h2 className="min-w-0 text-base font-semibold text-black sm:text-lg">
            {heading}
          </h2>
        </section>

        <section className="mt-3 min-h-[400px] w-full sm:mt-4" aria-hidden="true">
          {children}
        </section>
      </div>
    </main>
  );
}
