"use client";

import { TrendBarChart } from "@/features/analytics/components/TrendBarChart";
import { useAdminApplicationsStatistics } from "@/features/admin/hooks/useAdmin";
import { ActionShell } from "../../shared";
import { DistributionBarList } from "./DistributionBarList";
import { KpiTile } from "./KpiTile";
import {
  applicationStatusLabel,
  errorMessage,
  formatCount,
  formatShare,
  toTrendData,
} from "./helpers";

export function ApplicationsBlock() {
  const query = useAdminApplicationsStatistics();
  const stats = query.data;

  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <div className="min-w-0 xl:col-span-2">
      <ActionShell
        title="Ansökningar"
        description="Inskickade bostadsansökningar per dag under de senaste 12 månaderna."
        method="GET"
        endpoint="/api/admin/statistics/applications"
      >
        <div className="mt-4 h-[360px]">
          <TrendBarChart
            data={toTrendData(stats?.submitted)}
            title="Inskickade ansökningar"
            valueLabel="Ansökningar"
            loading={query.isLoading}
            error={
              query.isError
                ? errorMessage(query.error, "Kunde inte hämta ansökningsstatistik.")
                : null
            }
            emptyMessage="Inga ansökningar under perioden."
            embedded
          />
        </div>
      </ActionShell>
      </div>

      <div className="min-w-0">
      <ActionShell
        title="Utfall"
        description="Statusfördelning och hur många som fick bostad."
        method="GET"
        endpoint="/api/admin/statistics/applications"
      >
        <div className="mt-4">
          <KpiTile
            label="Fick bostad"
            value={formatShare(stats?.gotListingShare)}
            hint={`${formatCount(stats?.answeredGotListing)} av ${formatCount(stats?.answeredTotal)} besvarade uppföljningar`}
            loading={query.isLoading}
          />
        </div>
        <div className="mt-5">
          <DistributionBarList
            title="Status"
            items={stats?.byStatus}
            loading={query.isLoading}
            labelFor={applicationStatusLabel}
          />
        </div>
      </ActionShell>
      </div>
    </div>
  );
}
