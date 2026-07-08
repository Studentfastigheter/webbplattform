"use client";

import ListPageSkeleton from "../_components/ListPageSkeleton";

import { Skeleton } from "@/components/ui/skeleton";
import { useI18n } from "@/i18n/I18nProvider";
import { localizedText } from "@/i18n/text";

/**
 * Visas direkt vid navigering till /cities medan RSC-payloaden streamas —
 * riktig sökruta + rubrik, och samma kortgrid som CitiesPageClient
 * renderar medan städerna laddar.
 */
export default function Loading() {
  const { locale } = useI18n();

  return (
    <ListPageSkeleton
      heading={localizedText(locale, "Laddar städer...", "Loading cities...")}
      searchPlaceholder={localizedText(locale, "Sök efter stad", "Search by city")}
      searchSubmitLabel={localizedText(locale, "Sök", "Search")}
    >
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
