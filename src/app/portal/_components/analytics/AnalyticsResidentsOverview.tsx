"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { GraduationCap, MapPin } from "@/components/icons";
import { AnalyticsBlock } from "@/features/analytics/components/AnalyticsBlocks";
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
import { useCompanyResidentAnalytics } from "@/features/companies/hooks/useCompanies";
import {
  type ResidentAnalyticsData,
  type ResidentsSchoolCount,
  type ResidentsTownCount,
} from "@/features/companies/services/company-service";

type Interval = {
  value: string;
  label: string;
  labelEn: string;
  days?: number;
  months?: number;
};

type TrendDatum = {
  timestamp: Date;
  label: string;
  fullLabel: string;
  residents: number;
};

type DistributionItem = {
  name: string;
  detail?: string;
  residents: number;
};

const intervals: Interval[] = [
  { value: "1d", label: "1 dag", labelEn: "1 day", days: 1 },
  { value: "1w", label: "1 vecka", labelEn: "1 week", days: 7 },
  { value: "1m", label: "1 månad", labelEn: "1 month", months: 1 },
  { value: "3m", label: "3 månader", labelEn: "3 months", months: 3 },
  { value: "6m", label: "6 månader", labelEn: "6 months", months: 6 },
  { value: "1y", label: "1 år", labelEn: "1 year", months: 12 },
];

const distributionToneClass = {
  brand: {
    bar: "bg-brand-500",
    icon: "text-brand-500",
  },
  sky: {
    bar: "bg-sky-500",
    icon: "text-sky-600",
  },
} as const;

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

function getMonthKey(year: number, month: number) {
  return `${year}-${month}`;
}

function toResidentTrend(data: ResidentAnalyticsData | null, locale: Locale): TrendDatum[] {
  const monthYearFormatter = new Intl.DateTimeFormat(numberLocale(locale), {
    month: "long",
    year: "numeric",
  });
  const residentByMonth = new Map<string, number>();

  data?.residentTrend.forEach((entry) => {
    const key = getMonthKey(entry.year, entry.month);
    residentByMonth.set(key, (residentByMonth.get(key) ?? 0) + entry.numResidents);
  });

  const trend = Array.from(residentByMonth.entries())
    .map(([key, residents]) => {
      const [year, month] = key.split("-").map(Number);
      const timestamp = new Date(year, month - 1, 1);

      return Number.isNaN(timestamp.getTime())
        ? null
        : {
            timestamp,
            label: "",
            fullLabel: monthYearFormatter.format(timestamp),
            residents,
          };
    })
    .filter((entry): entry is TrendDatum => entry !== null)
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  const hasMultipleYears =
    new Set(trend.map((entry) => entry.timestamp.getFullYear())).size > 1;

  return trend.map((entry) => ({
    ...entry,
    label: formatShortMonth(entry.timestamp, hasMultipleYears, locale),
  }));
}

function filterTrendByInterval(trend: TrendDatum[], interval: Interval) {
  if ((!interval.months && !interval.days) || trend.length === 0) {
    return trend;
  }

  const latestTimestamp = trend[trend.length - 1].timestamp;
  const firstIncluded = new Date(latestTimestamp);

  if (interval.days) {
    firstIncluded.setDate(firstIncluded.getDate() - interval.days + 1);
  } else if (interval.months) {
    firstIncluded.setMonth(firstIncluded.getMonth() - interval.months + 1);
    firstIncluded.setDate(1);
  }

  return trend.filter((entry) => entry.timestamp >= firstIncluded);
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

function toTownItems(towns: ResidentsTownCount[], locale: Locale): DistributionItem[] {
  return towns
    .map((town) => ({
      name: town.town || localizedText(locale, "Okänd stad", "Unknown city"),
      residents: town.residents,
    }))
    .sort((a, b) => b.residents - a.residents);
}

function toSchoolItems(schools: ResidentsSchoolCount[], locale: Locale): DistributionItem[] {
  return schools
    .map((entry) => ({
      name: entry.school?.name || localizedText(locale, "Okänd skola", "Unknown school"),
      detail: entry.school?.city,
      residents: entry.residents,
    }))
    .sort((a, b) => b.residents - a.residents);
}

function IntervalToggle({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const { locale } = useI18n();

  return (
    <ToggleGroup
      className="max-w-full justify-start overflow-x-auto rounded-md bg-gray-50 p-0.5"
      onValueChange={(nextValue) => {
        if (nextValue) {
          onChange(nextValue);
        }
      }}
      type="single"
      value={value}
      variant="outline"
    >
      {intervals.map((interval) => (
        <ToggleGroupItem
          aria-label={localizedText(locale, interval.label, interval.labelEn)}
          className="h-7 shrink-0 border-0 px-2 text-[11px] font-medium text-gray-500 hover:bg-white hover:text-gray-900 data-[state=on]:bg-white data-[state=on]:text-gray-900 data-[state=on]:shadow-theme-xs"
          key={interval.value}
          value={interval.value}
        >
          {localizedText(locale, interval.label, interval.labelEn)}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex h-full items-center rounded-md border border-error-500/20 bg-error-50 px-4 text-theme-sm text-error-700">
      {message}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex h-full min-h-[180px] items-center justify-center rounded-md border border-dashed border-gray-200 px-4 text-center text-theme-sm text-gray-500">
      {message}
    </div>
  );
}

function ResidentsTrendChart({
  data,
  intervalValue,
  locale,
}: {
  data: ResidentAnalyticsData | null;
  intervalValue: string;
  locale: Locale;
}) {
  const trend = React.useMemo(() => toResidentTrend(data, locale), [data, locale]);
  const selectedInterval =
    intervals.find((interval) => interval.value === intervalValue) ??
    intervals[0]!;
  const chartData = React.useMemo(
    () => filterTrendByInterval(trend, selectedInterval),
    [selectedInterval, trend]
  );
  const total = chartData.reduce((sum, entry) => sum + entry.residents, 0);
  const average =
    chartData.length > 0 ? Math.round(total / chartData.length) : 0;

  if (chartData.length === 0) {
    return <EmptyState message={localizedText(locale, "Det finns ingen boendedata för perioden ännu.", "There is no resident data for this period yet.")} />;
  }

  const residentChartConfig = {
    residents: {
      label: localizedText(locale, "Boende", "Residents"),
      color: "var(--color-brand-500)",
    },
  } satisfies ChartConfig;

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col">
      <div className="min-h-0 min-w-0 flex-1 overflow-hidden">
        <ChartContainer
          className="h-full min-h-[190px] w-full min-w-0"
          config={residentChartConfig}
        >
          <AreaChart
            data={chartData}
            margin={{
              bottom: 0,
              left: 0,
              right: 8,
              top: 14,
            }}
          >
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
              width={38}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(_, payload) => {
                    const row = payload?.[0]?.payload as TrendDatum | undefined;

                    return row?.fullLabel ?? "";
                  }}
                />
              }
              cursor={false}
            />
            <Area
              dataKey="residents"
              fill="var(--color-residents)"
              fillOpacity={0.16}
              name={localizedText(locale, "Boende", "Residents")}
              stroke="var(--color-residents)"
              strokeWidth={2}
              type="monotone"
            />
          </AreaChart>
        </ChartContainer>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-end gap-x-4 gap-y-1 text-[11px] text-gray-400">
        <span>{localizedText(locale, `${total.toLocaleString(numberLocale(locale))} totalt`, `${total.toLocaleString(numberLocale(locale))} total`)}</span>
        <span>{localizedText(locale, `${average.toLocaleString(numberLocale(locale))} i snitt/mån`, `${average.toLocaleString(numberLocale(locale))} avg/mo`)}</span>
      </div>
    </div>
  );
}

function DistributionList({
  icon: Icon,
  items,
  title,
  tone,
  locale,
}: {
  icon: React.ComponentType<{ className?: string }>;
  items: DistributionItem[];
  title: string;
  tone: "brand" | "sky";
  locale: Locale;
}) {
  const total = items.reduce((sum, item) => sum + item.residents, 0);
  const maxResidents = Math.max(...items.map((item) => item.residents), 0);
  const toneClass = distributionToneClass[tone];

  return (
    <div className="flex min-h-0 min-w-0 flex-col">
      <div className="mb-3 flex min-w-0 items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gray-100 bg-gray-50">
            <Icon className={cn("h-4 w-4", toneClass.icon)} />
          </span>
          <h3 className="truncate text-sm font-semibold text-gray-900">
            {title}
          </h3>
        </div>
        <span className="shrink-0 text-xs font-medium text-gray-500">
          {localizedText(locale, `${total.toLocaleString(numberLocale(locale))} totalt`, `${total.toLocaleString(numberLocale(locale))} total`)}
        </span>
      </div>

      {items.length === 0 ? (
        <EmptyState message={localizedText(locale, `Det finns inga boende per ${title.toLowerCase()} ännu.`, `There are no residents per ${title.toLowerCase()} yet.`)} />
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
          <div className="space-y-3">
            {items.map((item, index) => {
              const percentage =
                maxResidents > 0 ? (item.residents / maxResidents) * 100 : 0;

              return (
                <div className="min-w-0" key={`${item.name}-${index}`}>
                  <div className="mb-1.5 flex min-w-0 items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium leading-5 text-gray-900">
                        {item.name}
                      </p>
                      {item.detail ? (
                        <p className="truncate text-xs leading-4 text-gray-400">
                          {item.detail}
                        </p>
                      ) : null}
                    </div>
                    <span className="shrink-0 text-sm font-semibold tabular-nums text-gray-900">
                      {item.residents.toLocaleString(numberLocale(locale))}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className={cn("h-full rounded-full", toneClass.bar)}
                      style={{ width: `${Math.max(percentage, 3)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function DistributionSkeleton() {
  return (
    <div className="grid h-full min-h-0 grid-cols-1 gap-5 lg:grid-cols-2">
      {Array.from({ length: 2 }).map((_, groupIndex) => (
        <div className="space-y-3" key={groupIndex}>
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-36" />
            <Skeleton className="h-4 w-20" />
          </div>
          {Array.from({ length: 5 }).map((__, rowIndex) => (
            <div className="space-y-2" key={rowIndex}>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-10" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default function AnalyticsResidentsOverview() {
  const { locale } = useI18n();
  const { user, isLoading: authLoading } = useAuth();
  const companyId = getActiveCompanyId(user);
  const [intervalValue, setIntervalValue] = React.useState("1m");
  const residentAnalyticsQuery = useCompanyResidentAnalytics(companyId);
  const data = residentAnalyticsQuery.data ?? null;
  const error =
    !authLoading && !companyId
      ? localizedText(
          locale,
          "Kunde inte hitta ett aktivt företag för boendestatistiken.",
          "Could not find an active company for resident statistics."
        )
      : residentAnalyticsQuery.isError
        ? residentAnalyticsQuery.error instanceof Error
          ? residentAnalyticsQuery.error.message
          : localizedText(locale, "Kunde inte hämta boendestatistik.", "Could not load resident statistics.")
        : null;
  const loading = authLoading || residentAnalyticsQuery.isLoading;
  const townItems = React.useMemo(
    () => toTownItems(data?.residentTowns ?? [], locale),
    [data, locale]
  );
  const schoolItems = React.useMemo(
    () => toSchoolItems(data?.residentSchools ?? [], locale),
    [data, locale]
  );

  return (
    <>
      <AnalyticsBlock
        action={
          <IntervalToggle onChange={setIntervalValue} value={intervalValue} />
        }
        description={localizedText(locale, "Nya boende grupperade per månad.", "New residents grouped by month.")}
        size="2x2"
        title={localizedText(locale, "Boendetrend", "Resident trend")}
      >
        {loading ? (
          <Skeleton className="h-full min-h-[220px] w-full rounded-md" />
        ) : error ? (
          <ErrorState message={error} />
        ) : (
          <ResidentsTrendChart data={data} intervalValue={intervalValue} locale={locale} />
        )}
      </AnalyticsBlock>

      <AnalyticsBlock
        description={localizedText(locale, "Totalt antal boende uppdelat på stad och skola.", "Total residents split by city and school.")}
        size="2x2"
        title={localizedText(locale, "Boende per stad och skola", "Residents by city and school")}
      >
        {loading ? (
          <DistributionSkeleton />
        ) : error ? (
          <ErrorState message={error} />
        ) : (
          <div className="grid h-full min-h-0 grid-cols-1 gap-5 lg:grid-cols-2">
            <DistributionList
              icon={MapPin}
              items={townItems}
              title={localizedText(locale, "Stad", "City")}
              tone="brand"
              locale={locale}
            />
            <DistributionList
              icon={GraduationCap}
              items={schoolItems}
              title={localizedText(locale, "Skola", "School")}
              tone="sky"
              locale={locale}
            />
          </div>
        )}
      </AnalyticsBlock>
    </>
  );
}
