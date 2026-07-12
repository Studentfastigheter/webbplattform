"use client";

import { TrendBarChart } from "@/features/analytics/components/TrendBarChart";
import { useAdminEngagementStatistics } from "@/features/admin/hooks/useAdmin";
import type { AdminTrendPointDTO } from "@/types";
import { ActionShell } from "../../shared";
import { errorMessage, toTrendData } from "./helpers";

const MINI_CHART_INTERVAL = [{ value: "3m", label: "3 månader", months: 3 }];

function MiniTrend({
  title,
  valueLabel,
  points,
  loading,
  error,
}: {
  title: string;
  valueLabel: string;
  points: AdminTrendPointDTO[] | undefined;
  loading: boolean;
  error: string | null;
}) {
  return (
    <div className="min-w-0 rounded-[8px] border border-[#dfe7e3] bg-[#fbfcfb] p-4">
      <div className="h-[240px]">
        <TrendBarChart
          data={toTrendData(points)}
          title={title}
          valueLabel={valueLabel}
          intervals={MINI_CHART_INTERVAL}
          loading={loading}
          error={error}
          emptyMessage="Ingen aktivitet under perioden."
          embedded
          showSummary={false}
        />
      </div>
    </div>
  );
}

export function EngagementBlock() {
  const query = useAdminEngagementStatistics();
  const error = query.isError
    ? errorMessage(query.error, "Kunde inte hämta engagemangsstatistik.")
    : null;

  return (
    <ActionShell
      title="Engagemang"
      description="Hur aktivt plattformen används: visningar, gillamarkeringar, bevakningar och meddelanden per dag (senaste 3 månaderna)."
      method="GET"
      endpoint="/api/admin/statistics/engagement"
    >
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <MiniTrend
          title="Annonsvisningar"
          valueLabel="Visningar"
          points={query.data?.views}
          loading={query.isLoading}
          error={error}
        />
        <MiniTrend
          title="Gillamarkeringar"
          valueLabel="Gillamarkeringar"
          points={query.data?.likes}
          loading={query.isLoading}
          error={error}
        />
        <MiniTrend
          title="Sparade bevakningar"
          valueLabel="Bevakningar"
          points={query.data?.watchlists}
          loading={query.isLoading}
          error={error}
        />
        <MiniTrend
          title="Meddelanden"
          valueLabel="Meddelanden"
          points={query.data?.messages}
          loading={query.isLoading}
          error={error}
        />
      </div>
    </ActionShell>
  );
}
