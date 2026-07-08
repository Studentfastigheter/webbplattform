"use client";

import ListPageSkeleton from "../_components/ListPageSkeleton";

import QueueCardSkeleton from "@/features/listings/components/QueueCardSkeleton";
import { useI18n } from "@/i18n/I18nProvider";

/**
 * Visas direkt vid navigering till /all-queues medan RSC-payloaden streamas —
 * riktig sökruta + rubrik, och samma grid som AllQueuesPageClient renderar
 * medan bostadsbolagen laddar.
 */
export default function Loading() {
  const { t } = useI18n();

  return (
    <ListPageSkeleton
      heading={t("allQueues.loadingCompanies")}
      searchPlaceholder={t("allQueues.searchPlaceholder")}
      searchSubmitLabel={t("allQueues.searchSubmit")}
    >
      <div className="grid w-full grid-cols-1 justify-start gap-3 sm:gap-5 md:grid-cols-2 lg:gap-6 2xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <QueueCardSkeleton key={`queue-skeleton-${index}`} />
        ))}
      </div>
    </ListPageSkeleton>
  );
}
