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
import { useI18n } from "@/i18n/I18nProvider";
import type { Locale } from "@/i18n/config";
import { localizedText, numberLocale } from "@/i18n/text";
import { getActiveCompanyId } from "@/lib/company-access";
import { cn } from "@/lib/utils";
import { useCompanyApplicationsTimeline } from "@/features/companies/hooks/useCompanies";
import type { TimelineEntry } from "@/features/companies/services/company-service";

type Interval = {
  value: string;
  label: string;
  labelEn: string;
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
  { value: "1d", label: "1 dag", labelEn: "1 day", days: 1 },
  { value: "1w", label: "1 vecka", labelEn: "1 week", days: 7 },
  { value: "1m", label: "1 månad", labelEn: "1 month", months: 1 },
  { value: "3m", label: "3 månader", labelEn: "3 months", months: 3 },
  { value: "6m", label: "6 månader", labelEn: "6 months", months: 6 },
  { value: "1y", label: "1 år", labelEn: "1 year", months: 12 },
];

function parseTrendDate(entry: TimelineEntry) {
  const date =
    entry.timestamp instanceof Date ? entry.timestamp : new Date(entry.timestamp);

  return Number.isNaN(date.getTime()) ? null : date;
}

function formatShortMonth(date: Date, includeYear: boolean, locale: Locale) {
  const monthFormatter = new Intl.DateTimeFormat(numberLocale(locale), {
    month: "short",
  });
  const month = monthFormatter.format(date).replace(".", "");

  if (!includeYear) {
    return month;
  }

  return `${month} ${String(date.getFullYear()).slice(-2)}`;
}

function normalizeData(data: ApplicationTrendPoint[], locale: Locale): ChartDatum[] {
  const monthYearFormatter = new Intl.DateTimeFormat(numberLocale(locale), {
    month: "long",
    year: "numeric",
  });
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
    label: formatShortMonth(entry.timestamp, hasMultipleYears, locale),
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

function formatAxisValue(value: string | number, locale: Locale) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue) || numericValue < 1000) {
    return String(value);
  }

  return `${(numericValue / 1000).toLocaleString(numberLocale(locale), {
    maximumFractionDigits: 1,
  })}K`;
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-error-500/20 bg-error-50 px-4 py-3 text-theme-sm text-error-700">
      {message}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex min-h-[180px] flex-1 items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50/60 px-4 text-center text-theme-sm text-gray-500">
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
  const { locale } = useI18n();
  const { user, isLoading: authLoading } = useAuth();
  const companyId = getActiveCompanyId(user);
  const trendQuery = useCompanyApplicationsTimeline(companyId);
  const trend = trendQuery.data ?? [];
  const [selectedInterval, setSelectedInterval] = React.useState("1m");
  const error =
    !authLoading && !companyId
      ? localizedText(
          locale,
          "Kunde inte hitta ett aktivt företag för analysen.",
          "Could not find an active company for the analytics."
        )
      : trendQuery.isError
        ? trendQuery.error instanceof Error
          ? trendQuery.error.message
          : localizedText(
              locale,
              "Kunde inte hämta ansökningstrenden.",
              "Could not load the application trend."
            )
        : null;
  const selectedIntervalConfig =
    intervals.find((interval) => interval.value === selectedInterval) ??
    intervals[2]!;

  const chartData = React.useMemo(
    () => filterByInterval(normalizeData(trend, locale), selectedIntervalConfig),
    [locale, selectedIntervalConfig, trend]
  );
  const chartConfig = React.useMemo(
    () =>
      ({
        applications: {
          label: localizedText(locale, "Ansökningar", "Applications"),
          color: "var(--color-brand-500)",
        },
        comparisonApplications: {
          label: localizedText(locale, "Föregående år", "Previous year"),
          color: "var(--color-brand-200)",
        },
      }) satisfies ChartConfig,
    [locale]
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
  const loading = authLoading || trendQuery.isLoading;
  const Root = embedded ? "div" : "section";

  return (
    <Root
      className={cn(
        embedded
          ? "flex h-full min-h-0 min-w-0 flex-col"
          : "portal-surface flex min-w-0 flex-col overflow-hidden px-5 py-5 sm:px-6",
        className
      )}
    >
      {showHeader ? (
        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold text-gray-800">
              {localizedText(locale, "Ansökningstrend", "Application trend")}
            </h2>
            <p className="mt-1 max-w-[36rem] text-theme-xs text-gray-400">
              {localizedText(locale, "Antal mottagna ansökningar per kalendermånad.", "Number of received applications per calendar month.")}
            </p>
          </div>

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
                aria-label={localizedText(locale, interval.label, interval.labelEn)}
                className="h-8 shrink-0 rounded-md border-0 px-3 text-theme-xs font-medium text-gray-500 hover:bg-white hover:text-gray-900 data-[state=on]:bg-white data-[state=on]:text-gray-900 data-[state=on]:shadow-theme-xs"
                key={interval.value}
                value={interval.value}
              >
                {localizedText(locale, interval.label, interval.labelEn)}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      ) : null}

      {loading ? (
        <div className={cn("min-h-0 flex-1", showHeader ? "mt-6" : "h-full")}>
          <Skeleton className="h-full min-h-[180px] w-full rounded-xl" />
        </div>
      ) : error ? (
        <div className={showHeader ? "mt-6" : "mt-0"}>
          <ErrorState message={error} />
        </div>
      ) : chartData.length === 0 ? (
        <div className={cn("flex flex-1", showHeader ? "mt-6" : "mt-0")}>
          <EmptyState message={localizedText(locale, "Det finns inga ansökningar registrerade för perioden ännu.", "There are no applications registered for this period yet.")} />
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
                  tickFormatter={(value) => formatAxisValue(value, locale)}
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
                    name={localizedText(locale, "Föregående år", "Previous year")}
                    stroke="var(--color-comparisonApplications)"
                    strokeWidth={1.5}
                    type="monotone"
                  />
                ) : null}

                <Area
                  activeDot={{ r: 4 }}
                  dataKey="applications"
                  fill="url(#applicationTrendFill)"
                  name={localizedText(locale, "Ansökningar", "Applications")}
                  stroke="var(--color-applications)"
                  strokeWidth={2}
                  type="monotone"
                />
              </AreaChart>
            </ChartContainer>
          </div>

          {showSummary ? (
            <div className="mt-3 flex flex-wrap items-center justify-end gap-x-4 gap-y-1 text-[11px] text-gray-400">
              <span>{localizedText(locale, `${total.toLocaleString(numberLocale(locale))} totalt`, `${total.toLocaleString(numberLocale(locale))} total`)}</span>
              <span>{localizedText(locale, `${average.toLocaleString(numberLocale(locale))} i snitt/mån`, `${average.toLocaleString(numberLocale(locale))} avg/mo`)}</span>
            </div>
          ) : null}
        </div>
      )}
    </Root>
  );
}
