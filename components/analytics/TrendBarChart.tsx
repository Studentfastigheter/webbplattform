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
  const maxBarSize = embedded ? 12 : 16;
  const Root = embedded ? "div" : "section";

  return (
    <Root
      className={cn(
        embedded
          ? "flex h-full min-h-0 min-w-0 flex-col"
          : "flex min-w-0 flex-col rounded-lg border border-gray-100 bg-white px-5 py-5 shadow-[0_18px_50px_rgba(15,23,42,0.04)] sm:px-6",
        className
      )}
    >
      {showHeader ? (
        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold text-gray-800">
              {title}
            </h2>

            {description ? (
              <p className="mt-1 max-w-[36rem] text-theme-xs text-gray-400">
                {description}
              </p>
            ) : null}
          </div>

          {intervals.length > 1 ? (
            <ToggleGroup
              className="w-full max-w-full shrink-0 justify-start overflow-x-auto rounded-md bg-transparent sm:w-auto"
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
                  className="h-7 shrink-0 border-0 px-2 text-[11px] font-medium text-gray-400 hover:bg-gray-50 hover:text-gray-700 data-[state=on]:bg-gray-50 data-[state=on]:text-gray-900"
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
            showHeader ? "mt-6" : "h-full"
          )}
        >
          <Skeleton className="h-full min-h-[180px] w-full rounded-md" />
        </div>
      ) : error ? (
        <div
          className={cn(
            "rounded-md border border-error-500/20 bg-error-50 px-4 py-3 text-theme-sm text-error-700",
            showHeader ? "mt-6" : "mt-0"
          )}
        >
          {error}
        </div>
      ) : chartData.length === 0 ? (
        <div
          className={cn(
            "flex min-h-[180px] flex-1 items-center justify-center rounded-md border border-dashed border-gray-200 px-4 text-center text-theme-sm text-gray-500",
            showHeader ? "mt-6" : "mt-0"
          )}
        >
          {emptyMessage}
        </div>
      ) : (
        <div
          className={cn(
            "flex min-h-0 min-w-0 flex-1 flex-col",
            showHeader ? "mt-6" : "mt-0"
          )}
        >
          <div className="min-h-0 min-w-0 flex-1 overflow-hidden">
            <ChartContainer
              className={cn(
                "aspect-auto w-full min-w-0",
                embedded
                  ? "h-full min-h-[180px]"
                  : "h-[clamp(220px,32vw,310px)]",
                chartClassName
              )}
              config={chartConfig}
            >
              <BarChart
                barCategoryGap={chartData.length > 12 ? "24%" : "34%"}
                barGap={4}
                data={chartData}
                margin={{
                  bottom: 0,
                  left: 0,
                  right: embedded ? 2 : 8,
                  top: 16,
                }}
              >
                <CartesianGrid stroke="#f0f2f7" vertical={false} />

                <XAxis
                  axisLine={false}
                  dataKey="label"
                  interval={xAxisInterval}
                  minTickGap={8}
                  tick={{ fill: "#9ca3af", fontSize: 11 }}
                  tickLine={false}
                  tickMargin={12}
                />

                <YAxis
                  allowDecimals={false}
                  axisLine={false}
                  tick={{ fill: "#9ca3af", fontSize: 11 }}
                  tickFormatter={formatAxisValue}
                  tickLine={false}
                  tickMargin={8}
                  width={embedded ? 34 : 44}
                />

                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      labelFormatter={(_, payload) => {
                        const row = payload?.[0]?.payload as
                          | ChartDatum
                          | undefined;

                        return row?.fullLabel ?? "";
                      }}
                    />
                  }
                  cursor={false}
                />

                {hasComparison ? (
                  <Bar
                    dataKey="comparisonValue"
                    fill="var(--color-comparisonValue)"
                    maxBarSize={maxBarSize}
                    name={comparisonLabel}
                    radius={[4, 4, 0, 0]}
                  />
                ) : null}

                <Bar
                  dataKey="value"
                  fill="var(--color-value)"
                  maxBarSize={maxBarSize}
                  name={valueLabel}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
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