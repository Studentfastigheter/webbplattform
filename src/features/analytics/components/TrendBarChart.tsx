"use client";

import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import { PortalVerticalBarChart } from "./PortalBarCharts";

export type TrendBarChartPoint = {
  timestamp: Date | string | number;
  value: number;
  comparisonValue?: number;
  label?: string;
};

export type TrendBarChartInterval = {
  value: string;
  label: string;
  days?: number;
  months?: number;
};

type ChartDatum = {
  timestamp: Date;
  label: string;
  fullLabel: string;
  value: number;
  comparisonValue?: number;
};

type TrendBarChartProps = {
  data: TrendBarChartPoint[];
  title: string;
  description?: string;
  valueLabel?: string;
  comparisonLabel?: string;
  intervals?: TrendBarChartInterval[];
  defaultInterval?: string;
  emptyMessage?: string;
  error?: string | null;
  loading?: boolean;
  embedded?: boolean;
  showHeader?: boolean;
  showSummary?: boolean;
  className?: string;
  chartClassName?: string;
};

const defaultIntervals: TrendBarChartInterval[] = [
  { value: "1d", label: "1 dag", days: 1 },
  { value: "1w", label: "1 vecka", days: 7 },
  { value: "1m", label: "1 månad", months: 1 },
  { value: "3m", label: "3 månader", months: 3 },
  { value: "6m", label: "6 månader", months: 6 },
  { value: "1y", label: "1 år", months: 12 },
];

const monthFormatter = new Intl.DateTimeFormat("sv-SE", {
  month: "short",
});

const monthYearFormatter = new Intl.DateTimeFormat("sv-SE", {
  month: "long",
  year: "numeric",
});

function parseTimestamp(timestamp: TrendBarChartPoint["timestamp"]) {
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatShortMonth(date: Date, includeYear: boolean) {
  const month = monthFormatter.format(date).replace(".", "");

  if (!includeYear) {
    return month;
  }

  return `${month} ${String(date.getFullYear()).slice(-2)}`;
}

function normalizeData(data: TrendBarChartPoint[]): ChartDatum[] {
  const parsed = data
    .map((entry) => {
      const timestamp = parseTimestamp(entry.timestamp);

      if (!timestamp || !Number.isFinite(entry.value)) {
        return null;
      }

      const comparisonValue =
        typeof entry.comparisonValue === "number" &&
        Number.isFinite(entry.comparisonValue)
          ? entry.comparisonValue
          : undefined;

      return {
        timestamp,
        label: entry.label ?? "",
        fullLabel: monthYearFormatter.format(timestamp),
        value: entry.value,
        ...(comparisonValue !== undefined ? { comparisonValue } : {}),
      };
    })
    .filter((entry): entry is ChartDatum => entry !== null)
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  const hasMultipleYears =
    new Set(parsed.map((entry) => entry.timestamp.getFullYear())).size > 1;

  return parsed.map((entry) => ({
    ...entry,
    label: entry.label || formatShortMonth(entry.timestamp, hasMultipleYears),
  }));
}

function filterByInterval(data: ChartDatum[], interval?: TrendBarChartInterval) {
  if ((!interval?.months && !interval?.days) || data.length === 0) {
    return data;
  }

  const lastTimestamp = data[data.length - 1].timestamp;
  const firstIncluded = new Date(lastTimestamp);

  if (interval.days) {
    firstIncluded.setDate(firstIncluded.getDate() - interval.days + 1);
  } else if (interval.months) {
    firstIncluded.setMonth(firstIncluded.getMonth() - interval.months + 1);
    firstIncluded.setDate(1);
  }

  return data.filter((entry) => entry.timestamp >= firstIncluded);
}

export function TrendBarChart({
  data,
  title,
  description,
  valueLabel = "Värde",
  comparisonLabel = "Jämförelse",
  intervals = defaultIntervals,
  defaultInterval,
  emptyMessage = "Det finns ingen trenddata att visa ännu.",
  error,
  loading = false,
  embedded = false,
  showHeader = true,
  showSummary = true,
  className,
  chartClassName,
}: TrendBarChartProps) {
  const initialInterval = defaultInterval ?? intervals[2]?.value ?? intervals[0]?.value ?? "all";
  const [selectedInterval, setSelectedInterval] =
    React.useState(initialInterval);

  React.useEffect(() => {
    if (!intervals.some((interval) => interval.value === selectedInterval)) {
      setSelectedInterval(intervals[0]?.value ?? "all");
    }
  }, [intervals, selectedInterval]);

  const selectedIntervalConfig = intervals.find(
    (interval) => interval.value === selectedInterval
  );

  const chartData = React.useMemo(
    () => filterByInterval(normalizeData(data), selectedIntervalConfig),
    [data, selectedIntervalConfig]
  );

  const total = React.useMemo(
    () => chartData.reduce((sum, entry) => sum + entry.value, 0),
    [chartData]
  );

  const average =
    chartData.length > 0 ? Math.round(total / chartData.length) : 0;

  const hasComparison = chartData.some(
    (entry) => entry.comparisonValue !== undefined
  );

  const xAxisInterval = chartData.length > 14 ? "preserveStartEnd" : 0;
  const maxBarSize = embedded ? 16 : 28;
  const Root = embedded ? "div" : "section";

  return (
    <Root
      className={cn(
        embedded
          ? "flex h-full min-h-0 min-w-0 flex-col"
          : "portal-surface flex min-w-0 flex-col overflow-hidden",
        className
      )}
    >
      {showHeader ? (
        <div
          className={cn(
            "flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4",
            !embedded && "px-6 py-5"
          )}
        >
          <div className="min-w-0">
            <h2
              className={cn(
                "truncate text-gray-800",
                embedded ? "text-sm font-semibold" : "text-base font-medium"
              )}
            >
              {title}
            </h2>

            {description ? (
              <p
                className={cn(
                  "mt-1 max-w-[36rem]",
                  embedded ? "text-theme-xs text-gray-400" : "text-sm text-gray-500"
                )}
              >
                {description}
              </p>
            ) : null}
          </div>

          {intervals.length > 1 ? (
            <ToggleGroup
              className="w-full max-w-full shrink-0 justify-start overflow-x-auto rounded-lg bg-gray-100 p-0.5 sm:w-auto"
              onValueChange={(value) => {
                if (value) {
                  setSelectedInterval(value);
                }
              }}
              type="single"
              value={selectedInterval}
              variant="outline"
            >
              {intervals.map((interval) => (
                <ToggleGroupItem
                  aria-label={interval.label}
                  className="h-8 shrink-0 rounded-md border-0 px-3 text-theme-xs font-medium text-gray-500 hover:bg-white hover:text-gray-900 data-[state=on]:bg-white data-[state=on]:text-gray-900 data-[state=on]:shadow-theme-xs"
                  key={interval.value}
                  value={interval.value}
                >
                  {interval.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          ) : null}
        </div>
      ) : null}

      {loading ? (
        <div
          className={cn(
            "min-h-0 flex-1",
            embedded
              ? showHeader
                ? "mt-6"
                : "h-full"
              : showHeader
                ? "border-t border-gray-100 p-5 sm:p-6"
                : "p-5 sm:p-6"
          )}
        >
          <Skeleton className="h-full min-h-[180px] w-full rounded-xl" />
        </div>
      ) : error ? (
        <div
          className={cn(
            "rounded-xl border border-error-500/20 bg-error-50 px-4 py-3 text-theme-sm text-error-700",
            embedded
              ? showHeader
                ? "mt-6"
                : "mt-0"
              : "m-5 sm:m-6"
          )}
        >
          {error}
        </div>
      ) : chartData.length === 0 ? (
        <div
          className={cn(
            "flex min-h-[180px] flex-1 items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50/60 px-4 text-center text-theme-sm text-gray-500",
            embedded
              ? showHeader
                ? "mt-6"
                : "mt-0"
              : "m-5 sm:m-6"
          )}
        >
          {emptyMessage}
        </div>
      ) : (
        <div
          className={cn(
            "flex min-h-0 min-w-0 flex-1 flex-col",
            embedded
              ? showHeader
                ? "mt-6"
                : "mt-0"
              : showHeader
                ? "border-t border-gray-100 p-5 sm:p-6"
                : "p-5 sm:p-6"
          )}
        >
          <div className="min-h-0 min-w-0 flex-1 overflow-hidden">
            <PortalVerticalBarChart
              chartClassName={cn("min-w-0", chartClassName)}
              comparisonLabel={comparisonLabel}
              data={chartData}
              heightClassName={
                embedded
                  ? "h-full min-h-[180px]"
                  : "h-[clamp(220px,32vw,310px)]"
              }
              labelFormatter={(entry) => entry.fullLabel}
              margin={{
                bottom: 0,
                left: 0,
                right: embedded ? 2 : 8,
                top: 16,
              }}
              maxBarSize={maxBarSize}
              minWidthClassName={
                chartData.length > 14 && !embedded
                  ? "min-w-[720px]"
                  : "min-w-full"
              }
              showComparison={hasComparison}
              valueLabel={valueLabel}
              xAxisInterval={xAxisInterval}
              yAxisWidth={embedded ? 34 : 44}
            />
          </div>

          {showSummary ? (
            <div className="mt-3 flex flex-wrap items-center justify-end gap-x-4 gap-y-1 text-[11px] text-gray-400">
              <span>{total.toLocaleString("sv-SE")} totalt</span>
              <span>{average.toLocaleString("sv-SE")} i snitt/mån</span>
            </div>
          ) : null}
        </div>
      )}
    </Root>
  );
}
