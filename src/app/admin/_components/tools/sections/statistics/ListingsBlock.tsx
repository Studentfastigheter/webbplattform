"use client";

import { TrendBarChart } from "@/features/analytics/components/TrendBarChart";
import { useAdminListingsStatistics } from "@/features/admin/hooks/useAdmin";
import { ActionShell } from "../../shared";
import { DistributionBarList } from "./DistributionBarList";
import {
  errorMessage,
  listingSourceLabel,
  listingStatusLabel,
  toTrendData,
} from "./helpers";

export function ListingsBlock() {
  const query = useAdminListingsStatistics();

  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <div className="min-w-0 xl:col-span-2">
      <ActionShell
        title="Annonser"
        description="Nya bostadsannonser per dag under de senaste 12 månaderna."
        method="GET"
        endpoint="/api/admin/statistics/listings"
      >
        <div className="mt-4 h-[360px]">
          <TrendBarChart
            data={toTrendData(query.data?.created)}
            title="Nya annonser"
            valueLabel="Annonser"
            loading={query.isLoading}
            error={
              query.isError
                ? errorMessage(query.error, "Kunde inte hämta annonsstatistik.")
                : null
            }
            emptyMessage="Inga nya annonser under perioden."
            embedded
          />
        </div>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <DistributionBarList
            title="Per stad"
            items={query.data?.byCity}
            loading={query.isLoading}
            labelFor={(key) => (key === "UNKNOWN" ? "Okänd stad" : key)}
          />
          <DistributionBarList
            title="Per källa"
            items={query.data?.bySource}
            loading={query.isLoading}
            labelFor={listingSourceLabel}
            footnote="Källa = externt fastighetssystem eller annonser skapade direkt på plattformen."
          />
        </div>
      </ActionShell>
      </div>

      <div className="min-w-0">
      <ActionShell
        title="Annonsstatus"
        description="Hela annonsbeståndet fördelat på status."
        method="GET"
        endpoint="/api/admin/statistics/listings"
      >
        <div className="mt-4">
          <DistributionBarList
            title="Status"
            items={query.data?.byStatus}
            loading={query.isLoading}
            labelFor={listingStatusLabel}
          />
        </div>
      </ActionShell>
      </div>
    </div>
  );
}
