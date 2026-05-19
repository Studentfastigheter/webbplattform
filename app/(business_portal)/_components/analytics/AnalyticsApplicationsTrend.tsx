"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useAuth } from "@/context/AuthContext";
import { getActiveCompanyId } from "@/lib/company-access";
import { cn } from "@/lib/utils";
import { companyService, type TimelineEntry } from "@/services/company";

type Interval = {
  value: string;
  label: string;
  days?: number;
  months?: number;
};

type ApplicationTrendPoint = TimelineEntry & {
  comparisonValue?: number;
};

type ChartDatum = {
  timestamp: Date;
  label: string;
  fullLabel: string;
  applications: number;
  comparisonApplications?: number;
};

type AnalyticsApplicationsTrendProps = {
  embedded?: boolean;
  showHeader?: boolean;
  showSummary?: boolean;
  className?: string;
  chartClassName?: string;
};

const intervals: Interval[] = [
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

const chartConfig = {
  applications: {
    label: "Ansökningar",
    color: "var(--color-brand-500)",
  },
  comparisonApplications: {
    label: "Föregående år",
    color: "var(--color-brand-200)",
  },
} satisfies ChartConfig;

function parseTrendDate(entry: TimelineEntry) {
  const date =
    entry.timestamp instanceof Date ? entry.timestamp : new Date(entry.timestamp);

  return Number.isNaN(date.getTime()) ? null : date;
}

function formatShortMonth(date: Date, includeYear: boolean) {
  const month = monthFormatter.format(date).replace(".", "");

  if (!includeYear) {
    return month;
  }

  return `${month} ${String(date.getFullYear()).slice(-2)}`;
}

function normalizeData(data: ApplicationTrendPoint[]): ChartDatum[] {
  const parsed = data
    .map((entry) => {
      const timestamp = parseTrendDate(entry);

      if (!timestamp || !Number.isFinite(entry.value)) {
        return null;
      }

      const comparisonApplications =
        typeof entry.comparisonValue === "number" &&
        Number.isFinite(entry.comparisonValue)
          ? entry.comparisonValue
          : undefined;

      return {
        timestamp,
        label: "",
        fullLabel: monthYearFormatter.format(timestamp),
        applications: entry.value,
        ...(comparisonApplications !== undefined
          ? { comparisonApplications }
          : {}),
      };
    })
    .filter((entry): entry is ChartDatum => entry !== null)
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  const hasMultipleYears =
    new Set(parsed.map((entry) => entry.timestamp.getFullYear())).size > 1;

  return parsed.map((entry) => ({
    ...entry,
    label: formatShortMonth(entry.timestamp, hasMultipleYears),
  }));
}

function filterByInterval(data: ChartDatum[], interval?: Interval) {
  if ((!interval?.months && !interval?.days) || data.length === 0) {
    return data;
  }

  const latestTimestamp = data[data.length - 1].timestamp;
  const firstIncluded = new Date(latestTimestamp);

  if (interval.days) {
    firstIncluded.setDate(firstIncluded.getDate() - interval.days + 1);
  } else if (interval.months) {
    firstIncluded.setMonth(firstIncluded.getMonth() - interval.months + 1);
    firstIncluded.setDate(1);
  }

  return data.filter((entry) => entry.timestamp >= firstIncluded);
}

function formatAxisValue(value: string | number) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue) || numericValue < 1000) {
    return String(value);
  }

  return `${numericValue / 1000}K`;
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-md border border-error-500/20 bg-error-50 px-4 py-3 text-theme-sm text-error-700">
      {message}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex min-h-[180px] flex-1 items-center justify-center rounded-md border border-dashed border-gray-200 px-4 text-center text-theme-sm text-gray-500">
      {message}
    </div>
  );
}

export default function AnalyticsApplicationsTrend({
  embedded = false,
  showHeader = true,
  showSummary = true,
  className,
  chartClassName,
}: AnalyticsApplicationsTrendProps) {
  const { user, isLoading: authLoading } = useAuth();
  const companyId = getActiveCompanyId(user);
  const [trend, setTrend] = React.useState<ApplicationTrendPoint[]>([]);
  const [selectedInterval, setSelectedInterval] = React.useState("1m");
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
          setTrend(timeline);
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

  const selectedIntervalConfig =
    intervals.find((interval) => interval.value === selectedInterval) ??
    intervals[2]!;

  const chartData = React.useMemo(
    () => filterByInterval(normalizeData(trend), selectedIntervalConfig),
    [selectedIntervalConfig, trend]
  );

  const total = React.useMemo(
    () => chartData.reduce((sum, entry) => sum + entry.applications, 0),
    [chartData]
  );
  const average =
    chartData.length > 0 ? Math.round(total / chartData.length) : 0;
  const hasComparison = chartData.some(
    (entry) => entry.comparisonApplications !== undefined
  );
  const loading = authLoading || isLoading;
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
              Ansökningstrend
            </h2>
            <p className="mt-1 max-w-[36rem] text-theme-xs text-gray-400">
              Antal mottagna ansökningar per kalendermånad.
            </p>
          </div>

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
        </div>
      ) : null}

      {loading ? (
        <div className={cn("min-h-0 flex-1", showHeader ? "mt-6" : "h-full")}>
          <Skeleton className="h-full min-h-[180px] w-full rounded-md" />
        </div>
      ) : error ? (
        <div className={showHeader ? "mt-6" : "mt-0"}>
          <ErrorState message={error} />
        </div>
      ) : chartData.length === 0 ? (
        <div className={cn("flex flex-1", showHeader ? "mt-6" : "mt-0")}>
          <EmptyState message="Det finns inga ansökningar registrerade för perioden ännu." />
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
              <AreaChart
                data={chartData}
                margin={{
                  bottom: 0,
                  left: 0,
                  right: embedded ? 2 : 8,
                  top: 14,
                }}
              >
                <defs>
                  <linearGradient id="applicationTrendFill" x1="0" x2="0" y1="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-applications)"
                      stopOpacity={0.24}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-applications)"
                      stopOpacity={0.02}
                    />
                  </linearGradient>
                  <linearGradient
                    id="applicationTrendComparisonFill"
                    x1="0"
                    x2="0"
                    y1="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="var(--color-comparisonApplications)"
                      stopOpacity={0.18}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-comparisonApplications)"
                      stopOpacity={0.02}
                    />
                  </linearGradient>
                </defs>

                <CartesianGrid stroke="#f0f2f7" vertical={false} />

                <XAxis
                  axisLine={false}
                  dataKey="label"
                  interval={chartData.length > 14 ? "preserveStartEnd" : 0}
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
                  <Area
                    dataKey="comparisonApplications"
                    fill="url(#applicationTrendComparisonFill)"
                    name="Föregående år"
                    stroke="var(--color-comparisonApplications)"
                    strokeWidth={1.5}
                    type="monotone"
                  />
                ) : null}

                <Area
                  activeDot={{ r: 4 }}
                  dataKey="applications"
                  fill="url(#applicationTrendFill)"
                  name="Ansökningar"
                  stroke="var(--color-applications)"
                  strokeWidth={2}
                  type="monotone"
                />
              </AreaChart>
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
