"use client";

import * as React from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";
import { useCompanyOverviewTrend } from "@/features/companies/hooks/useCompanies";
import type {
  CompanyOverviewTrendEntry,
  CompanyOverviewTrendGranularity,
} from "@/features/companies/services/company-service";
import type { Locale } from "@/i18n/config";
import { useI18n } from "@/i18n/I18nProvider";
import { localizedText, numberLocale } from "@/i18n/text";
import { getActiveCompanyId } from "@/lib/company-access";
import { cn } from "@/lib/utils";
import {
  PortalGridItem,
  type PortalGridItemSize,
} from "../shared/PortalGrid";

type IntervalOption = {
  value: string;
  label: string;
  labelEn: string;
  days?: number;
  months?: number;
};

type ChartDatum = {
  timestamp: Date;
  label: string;
  fullLabel: string;
  companyProfileViews: number;
  queueApplications: number;
  listingApplications: number;
};

type TrendMetricKey =
  | "companyProfileViews"
  | "queueApplications"
  | "listingApplications";

type OverviewEngagementTrendProps = {
  className?: string;
  size?: PortalGridItemSize;
};

const intervalOptions: IntervalOption[] = [
  { value: "7d", label: "7 dagar", labelEn: "7 days", days: 7 },
  { value: "30d", label: "30 dagar", labelEn: "30 days", days: 30 },
  { value: "90d", label: "90 dagar", labelEn: "90 days", days: 90 },
  { value: "1y", label: "1 \u00e5r", labelEn: "1 year", months: 12 },
  { value: "2y", label: "2 \u00e5r", labelEn: "2 years", months: 24 },
];

const granularityOptions: Array<{
  value: CompanyOverviewTrendGranularity;
  label: string;
  labelEn: string;
}> = [
  { value: "day", label: "Dag", labelEn: "Day" },
  { value: "week", label: "Vecka", labelEn: "Week" },
  { value: "month", label: "M\u00e5nad", labelEn: "Month" },
];

const metricOptions: Array<{
  value: TrendMetricKey;
  label: string;
  labelEn: string;
  color: string;
}> = [
  {
    value: "companyProfileViews",
    label: "Profilvisningar",
    labelEn: "Profile views",
    color: "#2563eb",
  },
  {
    value: "queueApplications",
    label: "Ans\u00f6kningar till bostadsk\u00f6",
    labelEn: "Housing queue applications",
    color: "#d97706",
  },
  {
    value: "listingApplications",
    label: "Ans\u00f6kningar till bost\u00e4der",
    labelEn: "Housing applications",
    color: "#16a34a",
  },
];

const blockHeightClassByRows: Record<string, string> = {
  "1": "xl:h-[var(--analytics-block-unit)]",
  "2": "xl:h-[calc(var(--analytics-block-unit)*2+1.5rem)]",
  "3": "xl:h-[calc(var(--analytics-block-unit)*3+3rem)]",
  "4": "xl:h-[calc(var(--analytics-block-unit)*4+4.5rem)]",
};

function rowsFromSize(size: PortalGridItemSize) {
  return size.split("x")[0];
}

function resolveRange(interval: IntervalOption) {
  const to = new Date();
  const from = new Date(to);

  if (interval.days) {
    from.setDate(from.getDate() - interval.days + 1);
  } else if (interval.months) {
    from.setMonth(from.getMonth() - interval.months);
    from.setDate(from.getDate() + 1);
  }

  return {
    from: from.toISOString(),
    to: to.toISOString(),
  };
}

function parseLocalDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatAxisDate(date: Date, granularity: CompanyOverviewTrendGranularity, locale: Locale) {
  const options: Intl.DateTimeFormatOptions =
    granularity === "month"
      ? { month: "short", year: "2-digit" }
      : { day: "numeric", month: "short" };
  const formatter = new Intl.DateTimeFormat(numberLocale(locale), options);

  return formatter.format(date).replace(".", "");
}

function formatFullDate(date: Date, locale: Locale) {
  return new Intl.DateTimeFormat(numberLocale(locale), {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function normalizeTrendData(
  rows: CompanyOverviewTrendEntry[],
  granularity: CompanyOverviewTrendGranularity,
  locale: Locale
): ChartDatum[] {
  return rows
    .map((row) => {
      const start = parseLocalDate(row.periodStart);
      const end = parseLocalDate(row.periodEnd);

      if (!start || !end) {
        return null;
      }

      return {
        timestamp: start,
        label: formatAxisDate(start, granularity, locale),
        fullLabel:
          row.periodStart === row.periodEnd
            ? formatFullDate(start, locale)
            : `${formatFullDate(start, locale)} - ${formatFullDate(end, locale)}`,
        companyProfileViews: row.companyProfileViews,
        queueApplications: row.queueApplications,
        listingApplications: row.listingApplications,
      };
    })
    .filter((entry): entry is ChartDatum => entry !== null)
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
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

function totalFor(data: ChartDatum[], key: TrendMetricKey) {
  return data.reduce((sum, row) => sum + row[key], 0);
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
    <div className="flex min-h-[120px] flex-1 items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50/60 px-4 text-center text-theme-sm text-gray-500">
      {message}
    </div>
  );
}

export default function OverviewEngagementTrend({
  className,
  size = "2x4",
}: OverviewEngagementTrendProps) {
  const { locale } = useI18n();
  const { user, isLoading: authLoading } = useAuth();
  const companyId = getActiveCompanyId(user);
  const [selectedInterval, setSelectedInterval] = React.useState("90d");
  const [selectedGranularity, setSelectedGranularity] =
    React.useState<CompanyOverviewTrendGranularity>("week");
  const [selectedMetric, setSelectedMetric] =
    React.useState<TrendMetricKey>("listingApplications");
  const interval =
    intervalOptions.find((option) => option.value === selectedInterval) ??
    intervalOptions[2]!;
  const selectedMetricConfig =
    metricOptions.find((option) => option.value === selectedMetric) ??
    metricOptions[2]!;
  const blockHeightClass =
    blockHeightClassByRows[rowsFromSize(size)] ?? blockHeightClassByRows["2"];
  const range = React.useMemo(() => resolveRange(interval), [interval]);
  const trendQuery = useCompanyOverviewTrend(companyId, {
    ...range,
    granularity: selectedGranularity,
  });

  const chartData = React.useMemo(
    () => normalizeTrendData(trendQuery.data ?? [], selectedGranularity, locale),
    [locale, selectedGranularity, trendQuery.data]
  );
  const totals = React.useMemo(
    () => ({
      companyProfileViews: totalFor(chartData, "companyProfileViews"),
      queueApplications: totalFor(chartData, "queueApplications"),
      listingApplications: totalFor(chartData, "listingApplications"),
    }),
    [chartData]
  );
  const selectedTotal = totals[selectedMetric];
  const hasData = selectedTotal > 0;
  const loading = authLoading || trendQuery.isLoading;
  const error =
    !authLoading && !companyId
      ? localizedText(
          locale,
          "Kunde inte hitta ett aktivt f\u00f6retag f\u00f6r \u00f6versikten.",
          "Could not find an active company for the overview."
        )
      : trendQuery.isError
        ? trendQuery.error instanceof Error
          ? trendQuery.error.message
          : localizedText(
              locale,
              "Kunde inte h\u00e4mta \u00f6versiktstrenden.",
              "Could not load the overview trend."
            )
        : null;

  const chartConfig = React.useMemo(
    () =>
      ({
        companyProfileViews: {
          label: localizedText(locale, "Profilvisningar", "Profile views"),
          color: metricOptions[0]!.color,
        },
        queueApplications: {
          label: localizedText(locale, "Ans\u00f6kningar till bostadsk\u00f6", "Housing queue applications"),
          color: metricOptions[1]!.color,
        },
        listingApplications: {
          label: localizedText(locale, "Ans\u00f6kningar till bost\u00e4der", "Housing applications"),
          color: metricOptions[2]!.color,
        },
      }) satisfies ChartConfig,
    [locale]
  );
  const selectTriggerClassName =
    "h-8 rounded-lg border-gray-200 bg-white px-2.5 text-xs font-medium text-gray-700 shadow-theme-xs hover:border-gray-300 hover:bg-gray-50 focus:border-[#004225] focus:ring-4 focus:ring-[#004225]/10";
  const controls = (
    <div className="flex min-w-max items-center gap-2">
      <Select
        onValueChange={(value) => setSelectedMetric(value as TrendMetricKey)}
        value={selectedMetric}
      >
        <SelectTrigger
          aria-label={localizedText(locale, "Kategori", "Category")}
          className={cn(selectTriggerClassName, "w-[190px] sm:w-[220px]")}
          size="sm"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="border-gray-200 bg-white">
          {metricOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {localizedText(locale, option.label, option.labelEn)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select onValueChange={setSelectedInterval} value={selectedInterval}>
        <SelectTrigger
          aria-label={localizedText(locale, "Tidsintervall", "Time interval")}
          className={cn(selectTriggerClassName, "w-[86px]")}
          size="sm"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="border-gray-200 bg-white">
          {intervalOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {localizedText(locale, option.label, option.labelEn)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        onValueChange={(value) =>
          setSelectedGranularity(value as CompanyOverviewTrendGranularity)
        }
        value={selectedGranularity}
      >
        <SelectTrigger
          aria-label={localizedText(locale, "Uppl\u00f6sning", "Resolution")}
          className={cn(selectTriggerClassName, "w-[96px]")}
          size="sm"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="border-gray-200 bg-white">
          {granularityOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {localizedText(locale, option.label, option.labelEn)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <PortalGridItem
      className={cn(
        blockHeightClass,
        className
      )}
      contentClassName="overflow-hidden p-3 pt-1 sm:p-4 sm:pt-1"
      action={controls}
      size={size}
      title={localizedText(locale, "\u00d6versikt \u00f6ver tid", "Overview over time")}
    >
      <div className="flex h-full min-h-0 min-w-0 flex-col">
        {loading ? (
          <div className="min-h-0 flex-1">
            <Skeleton className="h-full min-h-[120px] w-full rounded-xl" />
          </div>
        ) : error ? (
          <div>
            <ErrorState message={error} />
          </div>
        ) : !hasData ? (
          <div className="flex flex-1">
            <EmptyState
              message={localizedText(
                locale,
                `Det finns ingen data f\u00f6r ${localizedText(locale, selectedMetricConfig.label.toLowerCase(), selectedMetricConfig.labelEn.toLowerCase())} i valt intervall \u00e4nnu.`,
                `There is no data for ${localizedText(locale, selectedMetricConfig.label.toLowerCase(), selectedMetricConfig.labelEn.toLowerCase())} in the selected interval yet.`
              )}
            />
          </div>
        ) : (
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <div className="min-h-0 min-w-0 flex-1 overflow-hidden">
              <ChartContainer
                className="h-full min-h-[120px] w-full min-w-0"
                config={chartConfig}
              >
                <LineChart
                  accessibilityLayer
                  data={chartData}
                  margin={{
                    bottom: 0,
                    left: 0,
                    right: 8,
                    top: 8,
                  }}
                >
                  <CartesianGrid stroke="#f0f2f7" vertical={false} />
                  <XAxis
                    axisLine={false}
                    dataKey="label"
                    interval={chartData.length > 18 ? "preserveStartEnd" : 0}
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
                          const row = payload?.[0]?.payload as
                            | ChartDatum
                            | undefined;

                          return row?.fullLabel ?? "";
                        }}
                      />
                    }
                    cursor={false}
                  />
                  <Line
                    activeDot={{ r: 4 }}
                    dataKey={selectedMetric}
                    dot={false}
                    key={selectedMetric}
                    name={localizedText(
                      locale,
                      selectedMetricConfig.label,
                      selectedMetricConfig.labelEn
                    )}
                    stroke={`var(--color-${selectedMetric})`}
                    strokeWidth={2}
                    type="monotone"
                  />
                </LineChart>
              </ChartContainer>
            </div>
          </div>
        )}
      </div>
    </PortalGridItem>
  );
}
