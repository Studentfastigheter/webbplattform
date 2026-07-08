"use client";

import ListPageSkeleton from "../_components/ListPageSkeleton";

import ListingCardSkeleton from "@/features/listings/components/ListingCardSkeleton";
import { useI18n } from "@/i18n/I18nProvider";
import { localizedText } from "@/i18n/text";

/**
 * Visas direkt vid navigering till /housing medan RSC-payloaden streamas —
 * riktig sökruta + rubrik, och samma kortgrid som HousingPageClient
 * renderar i listvyn medan bostäderna laddar.
 */
export default function Loading() {
  const { locale } = useI18n();

  return (
    <ListPageSkeleton
      heading={localizedText(locale, "Laddar bostäder...", "Loading homes...")}
      searchPlaceholder={localizedText(
        locale,
        "Sök på stad, adress eller bostad",
        "Search by city, address or home",
      )}
      searchSubmitLabel={localizedText(locale, "Sök", "Search")}
    >
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
