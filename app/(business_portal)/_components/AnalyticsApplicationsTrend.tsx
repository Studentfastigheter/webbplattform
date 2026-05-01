"use client";

import * as React from "react";
import {
  TrendBarChart,
  type TrendBarChartInterval,
  type TrendBarChartPoint,
} from "@/components/analytics/TrendBarChart";
import { useAuth } from "@/context/AuthContext";
import { getActiveCompanyId } from "@/lib/company-access";
import { companyService } from "@/services/company";

const intervals: TrendBarChartInterval[] = [
  { value: "6m", label: "6 mån", months: 6 },
  { value: "12m", label: "12 mån", months: 12 },
  { value: "24m", label: "24 mån", months: 24 },
  { value: "all", label: "Alla" },
];

function withPreviousYearComparison(
  timeline: TrendBarChartPoint[]
): TrendBarChartPoint[] {
  const valueByMonth = new Map<string, number>();

  timeline.forEach((entry) => {
    const date =
      entry.timestamp instanceof Date ? entry.timestamp : new Date(entry.timestamp);

    if (!Number.isNaN(date.getTime())) {
      valueByMonth.set(`${date.getFullYear()}-${date.getMonth()}`, entry.value);
    }
  });

  return timeline.map((entry) => {
    const date =
      entry.timestamp instanceof Date ? entry.timestamp : new Date(entry.timestamp);

    if (Number.isNaN(date.getTime())) {
      return entry;
    }

    const comparisonValue = valueByMonth.get(
      `${date.getFullYear() - 1}-${date.getMonth()}`
    );

    return comparisonValue !== undefined
      ? { ...entry, comparisonValue }
      : entry;
  });
}

type AnalyticsApplicationsTrendProps = {
  embedded?: boolean;
  showHeader?: boolean;
  showSummary?: boolean;
  className?: string;
  chartClassName?: string;
};

export default function AnalyticsApplicationsTrend({
  embedded = false,
  showHeader = true,
  showSummary = true,
  className,
  chartClassName,
}: AnalyticsApplicationsTrendProps) {
  const { user, isLoading: authLoading } = useAuth();
  const companyId = getActiveCompanyId(user);
  const [trend, setTrend] = React.useState<TrendBarChartPoint[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!companyId) {
      setTrend([]);
      setError("Kunde inte hitta ett aktivt företag för analysen.");
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    companyService
      .applicationsTimeline(companyId)
      .then((timeline) => {
        if (!cancelled) {
          setTrend(withPreviousYearComparison(timeline));
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setTrend([]);
          setError(
            err instanceof Error
              ? err.message
              : "Kunde inte hämta ansökningstrenden."
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [authLoading, companyId]);

  return (
    <TrendBarChart
      data={trend}
      defaultInterval="12m"
      comparisonLabel="Föregående år"
      description="Antal mottagna ansökningar per kalendermånad."
      emptyMessage="Det finns inga ansökningar registrerade för perioden ännu."
      error={error}
      embedded={embedded}
      intervals={intervals}
      loading={authLoading || isLoading}
      showHeader={showHeader}
      showSummary={showSummary}
      title="Ansökningstrend"
      valueLabel="Ansökningar"
      className={className}
      chartClassName={chartClassName}
    />
  );
}
