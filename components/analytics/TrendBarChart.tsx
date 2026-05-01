"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

export type TrendBarChartPoint = {
  timestamp: Date | string | number;
  value: number;
  comparisonValue?: number;
  label?: string;
};

export type TrendBarChartInterval = {
  value: string;
  label: string;
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
  { value: "6m", label: "6 mån", months: 6 },
  { value: "12m", label: "12 mån", months: 12 },
  { value: "24m", label: "24 mån", months: 24 },
  { value: "all", label: "Alla" },
];

const monthFormatter = new Intl.DateTimeFormat("sv-SE", {
  month: "short",
});

const monthYearFormatter = new Intl.DateTimeFormat("sv-SE", {
  month: "long",
  year: "numeric",
});

const chartConfig = {
  value: {
    label: "Värde",
    color: "var(--color-brand-500)",
  },
  comparisonValue: {
    label: "Jämförelse",
    color: "var(--color-brand-100)",
  },
} satisfies ChartConfig;

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
  if (!interval?.months || data.length === 0) {
    return data;
  }

  const lastTimestamp = data[data.length - 1].timestamp;
  const firstIncludedMonth = new Date(
    lastTimestamp.getFullYear(),
    lastTimestamp.getMonth() - interval.months + 1,
    1
  );

  return data.filter((entry) => entry.timestamp >= firstIncludedMonth);
}

function formatAxisValue(value: string | number) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue) || numericValue < 1000) {
    return String(value);
  }

  return `${numericValue / 1000}K`;
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
  const initialInterval = defaultInterval ?? intervals[0]?.value ?? "all";
  const [selectedInterval, setSelectedInterval] = React.useState(initialInterval);

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

  const average = chartData.length > 0 ? Math.round(total / chartData.length) : 0;
  const hasComparison = chartData.some(
    (entry) => entry.comparisonValue !== undefined
  );
  const Root = embedded ? "div" : "section";

  return (
    <Root
      className={cn(
        embedded
          ? "flex h-full min-h-0 flex-col"
          : "rounded-lg border border-gray-100 bg-white px-5 py-5 shadow-[0_18px_50px_rgba(15,23,42,0.04)] sm:px-6",
        className
      )}
    >
      {showHeader ? (
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-gray-800">{title}</h2>
            {description ? (
              <p className="mt-1 max-w-[36rem] text-theme-xs text-gray-400">
                {description}
              </p>
            ) : null}
          </div>

          {intervals.length > 1 ? (
            <ToggleGroup
              className="max-w-full shrink-0 overflow-x-auto rounded-md bg-transparent"
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
                  className="h-7 border-0 px-2 text-[11px] font-medium text-gray-400 hover:bg-gray-50 hover:text-gray-700 data-[state=on]:bg-gray-50 data-[state=on]:text-gray-900"
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
        <div className={cn("min-h-0", showHeader ? "mt-8" : "h-full flex-1")}>
          <Skeleton className="h-full min-h-[120px] w-full rounded-md" />
        </div>
      ) : error ? (
        <div
          className={cn(
            "rounded-md border border-error-500/20 bg-error-50 px-4 py-3 text-theme-sm text-error-700",
            showHeader ? "mt-8" : "mt-0"
          )}
        >
          {error}
        </div>
      ) : chartData.length === 0 ? (
        <div
          className={cn(
            "flex min-h-[120px] flex-1 items-center justify-center rounded-md border border-dashed border-gray-200 px-4 text-center text-theme-sm text-gray-500",
            showHeader ? "mt-8" : "mt-0"
          )}
        >
          {emptyMessage}
        </div>
      ) : (
        <div
          className={cn(
            "flex min-h-0 flex-1 flex-col",
            showHeader ? "mt-8" : "mt-0"
          )}
        >
          <div className="min-h-0 flex-1 max-w-full overflow-x-auto">
            <ChartContainer
              className={cn(
                embedded
                  ? "h-full min-w-[320px]"
                  : "h-[310px] min-w-[640px] xl:min-w-full",
                chartClassName
              )}
              config={chartConfig}
            >
              <BarChart
                barCategoryGap="34%"
                barGap={6}
                data={chartData}
                margin={{ bottom: 0, left: 0, right: 8, top: 16 }}
              >
                <CartesianGrid stroke="#f0f2f7" vertical={false} />
                <XAxis
                  axisLine={false}
                  dataKey="label"
                  tick={{ fill: "#9ca3af", fontSize: 11 }}
                  tickLine={false}
                  tickMargin={14}
                />
                <YAxis
                  allowDecimals={false}
                  axisLine={false}
                  tick={{ fill: "#9ca3af", fontSize: 11 }}
                  tickFormatter={formatAxisValue}
                  tickLine={false}
                  tickMargin={12}
                  width={44}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      labelFormatter={(_, payload) => {
                        const row = payload?.[0]?.payload as ChartDatum | undefined;
                        return row?.fullLabel ?? "";
                      }}
                    />
                  }
                  cursor={false}
                />
                {hasComparison ? (
                  <Bar
                    barSize={14}
                    dataKey="comparisonValue"
                    fill="var(--color-comparisonValue)"
                    name={comparisonLabel}
                    radius={[3, 3, 0, 0]}
                  />
                ) : null}
                <Bar
                  barSize={14}
                  dataKey="value"
                  fill="var(--color-value)"
                  name={valueLabel}
                  radius={[3, 3, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </div>

          {showSummary ? (
            <div className="mt-3 flex items-center justify-end gap-4 text-[11px] text-gray-400">
              <span>{total.toLocaleString("sv-SE")} totalt</span>
              <span>{average.toLocaleString("sv-SE")} i snitt/mån</span>
            </div>
          ) : null}
        </div>
      )}
    </Root>
  );
}
