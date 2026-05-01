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

function parseTrendDate(entry: TrendBarChartPoint) {
  const date =
    entry.timestamp instanceof Date ? entry.timestamp : new Date(entry.timestamp);

  return Number.isNaN(date.getTime()) ? null : date;
}

function getMonthKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}`;
}

function completeCalendarYearTrend(
  timeline: TrendBarChartPoint[]
): TrendBarChartPoint[] {
  const valueByMonth = new Map<string, number>();
  const validDates: Date[] = [];

  timeline.forEach((entry) => {
    const date = parseTrendDate(entry);

    if (date && Number.isFinite(entry.value)) {
      valueByMonth.set(getMonthKey(date), entry.value);
      validDates.push(date);
    }
  });

  const latestDate = validDates.sort((a, b) => b.getTime() - a.getTime())[0];
  const year = latestDate?.getFullYear() ?? new Date().getFullYear();

  return Array.from({ length: 12 }, (_, monthIndex) => {
    const timestamp = new Date(year, monthIndex, 1);
    const comparisonTimestamp = new Date(year - 1, monthIndex, 1);

    return {
      timestamp,
      value: valueByMonth.get(getMonthKey(timestamp)) ?? 0,
      comparisonValue: valueByMonth.get(getMonthKey(comparisonTimestamp)) ?? 0,
    };
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
          setTrend(completeCalendarYearTrend(timeline));
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
