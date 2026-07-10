"use client";

import { useAdminStatisticsOverview } from "@/features/admin/hooks/useAdmin";
import { ActionShell } from "../../shared";
import { KpiTile } from "./KpiTile";
import {
  errorMessage,
  formatCount,
  formatShare,
  listingStatusLabel,
} from "./helpers";

export function OverviewKpiRow() {
  const query = useAdminStatisticsOverview();
  const stats = query.data;
  const loading = query.isLoading;

  const listingsHint = stats?.listingsByStatus
    ?.map(
      (bucket) =>
        `${formatCount(bucket.count)} ${listingStatusLabel(bucket.key).toLowerCase()}`
    )
    .join(" · ");

  return (
    <ActionShell
      title="Översikt"
      description="Plattformens nyckeltal just nu."
      method="GET"
      endpoint="/api/admin/statistics/overview"
    >
      {query.isError ? (
        <p className="mt-4 text-sm text-red-600">
          {errorMessage(query.error, "Kunde inte hämta översikten.")}
        </p>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <KpiTile
            label="Studenter"
            value={formatCount(stats?.students)}
            loading={loading}
          />
          <KpiTile
            label="Verifierade"
            value={formatShare(stats?.verifiedStudentRatio)}
            hint={`${formatCount(stats?.verifiedStudents)} verifierade studenter`}
            loading={loading}
          />
          <KpiTile
            label="Snabbregistreringar"
            value={formatCount(stats?.pendingQuickRegisters)}
            hint="Väntar på full registrering"
            loading={loading}
          />
          <KpiTile
            label="Bolag"
            value={formatCount(stats?.companies)}
            loading={loading}
          />
          <KpiTile
            label="Annonser"
            value={formatCount(stats?.listings)}
            hint={listingsHint}
            loading={loading}
          />
          <KpiTile
            label="Ansökningar"
            value={formatCount(stats?.applications)}
            loading={loading}
          />
        </div>
      )}
    </ActionShell>
  );
}
