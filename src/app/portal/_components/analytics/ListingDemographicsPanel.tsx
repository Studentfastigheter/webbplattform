"use client";

import * as React from "react";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Heart, Smartphone } from "@/components/icons";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";
import {
  AnalyticsBlock,
  type AnalyticsBlockSize,
} from "@/features/analytics/components/AnalyticsBlocks";
import { PortalVerticalBarChart } from "@/features/analytics/components/PortalBarCharts";
import { useListingByAllCategoriesDemography } from "@/features/analytics/hooks/useDemographics";
import {
  type DemographyCategory,
  type ListingDemography,
} from "@/features/analytics/services/demographics-service";
import { useI18n } from "@/i18n/I18nProvider";
import type { Locale } from "@/i18n/config";
import { localizedText, numberLocale } from "@/i18n/text";
import { getActiveCompanyId } from "@/lib/company-access";

type ChartDatum = {
  label: string;
  value: number;
  share: number;
  fill: string;
};

type ListingDemographicsPanelProps = {
  className?: string;
  from?: Date;
  listingId: string;
  periodLabel?: string;
  size?: AnalyticsBlockSize;
  to?: Date;
};

// Palette mirrors the one used in the portfolio analytics blocks
// (DemographicsEndpointBlocks) so the per-listing analytics share the same
// visual rhythm as the company-wide page.
const colors = [
  "#16a34a",
  "#38bdf8",
  "#fb7185",
  "#fbbf24",
  "#2dd4bf",
  "#a78bfa",
  "#4ade80",
  "#94a3b8",
];

const labels: Record<string, { sv: string; en: string }> = {
  MOBILE: { sv: "Mobil", en: "Mobile" },
  DESKTOP: { sv: "Desktop", en: "Desktop" },
  true: { sv: "Favorit", en: "Favorite" },
  false: { sv: "Ingen favorit", en: "No favorite" },
};

const swedishLabelCorrections: Record<string, string> = {
  Goteborg: "Göteborg",
  Malmo: "Malmö",
  Vaxjo: "Växjö",
  Vasteras: "Västerås",
  Orebro: "Örebro",
  Jonkoping: "Jönköping",
  Linkoping: "Linköping",
  Norrkoping: "Norrköping",
  Umea: "Umeå",
  Lulea: "Luleå",
  Boras: "Borås",
  Okant: "Okänt",
};

function repairMojibake(value: string) {
  if (!/[ÃÂâ]/.test(value)) return value;

  try {
    const bytes = Uint8Array.from(
      Array.from(value, (character) => character.charCodeAt(0) & 0xff)
    );
    return new TextDecoder("utf-8").decode(bytes);
  } catch {
    return value;
  }
}

function labelFor(locale: Locale, value: string) {
  const label = labels[value];
  return label ? localizedText(locale, label.sv, label.en) : value;
}

function formatNumber(value: number, locale: Locale) {
  return value.toLocaleString(numberLocale(locale));
}

function formatPercent(value: number, locale: Locale) {
  return `${value.toLocaleString(numberLocale(locale), { maximumFractionDigits: 1 })}%`;
}

function keyLabel(value: unknown, locale: Locale) {
  if (value === null || value === undefined) return localizedText(locale, "Okänt", "Unknown");
  const raw = repairMojibake(String(value).trim());
  if (labels[raw]) {
    return labelFor(locale, raw);
  }

  if (raw === "Okant") {
    return localizedText(locale, "Okänt", "Unknown");
  }

  return swedishLabelCorrections[raw] ?? (raw || localizedText(locale, "Okänt", "Unknown"));
}

function totalViews(value: ListingDemography | null) {
  if (!value) return 0;
  return (
    value.totalViews ??
    value.buckets?.reduce((sum, bucket) => sum + (bucket.totalViews ?? 0), 0) ??
    0
  );
}

function toData(value: ListingDemography | null, locale: Locale): ChartDatum[] {
  const total = totalViews(value);
  return (value?.buckets ?? [])
    .map((bucket, index) => {
      const count = Number(bucket.totalViews ?? 0);
      return {
        label: keyLabel(bucket.key, locale),
        value: count,
        share: total > 0 ? (count / total) * 100 : 0,
        fill: colors[index % colors.length],
      };
    })
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value);
}

function getRange() {
  const to = new Date();
  const from = new Date(to);
  from.setDate(from.getDate() - 90);
  return { from, to };
}

function EmptyState({ locale }: { locale: Locale }) {
  return (
    <div className="flex min-h-[180px] items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50/50 px-4 text-center text-sm text-gray-500">
      {localizedText(locale, "Ingen demografidata för den här annonsen ännu.", "No demographic data for this listing yet.")}
    </div>
  );
}

/**
 * Compact swatch legend rendered below every chart so each color maps to a
 * named bucket and its share. The `limit` mirrors what the chart itself
 * truncates (pies show all, bars cap at top-5) so the legend can't lie.
 */
function ChartLegend({
  data,
  locale,
  limit,
}: {
  data: ChartDatum[];
  locale: Locale;
  limit?: number;
}) {
  const items = typeof limit === "number" ? data.slice(0, limit) : data;
  if (items.length === 0) return null;

  return (
    <ul className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5">
      {items.map((item) => (
        <li
          className="flex min-w-0 items-center gap-1.5 text-[11px] leading-4 text-gray-600"
          key={item.label}
        >
          <span
            aria-hidden="true"
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: item.fill }}
          />
          <span className="min-w-0 truncate font-medium text-gray-700">
            {item.label}
          </span>
          <span className="shrink-0 tabular-nums text-gray-400">
            {formatNumber(item.value, locale)} ({formatPercent(item.share, locale)})
          </span>
        </li>
      ))}
    </ul>
  );
}

function MiniPie({ data, locale }: { data: ChartDatum[]; locale: Locale }) {
  if (data.length === 0) return <EmptyState locale={locale} />;

  return (
    <div className="h-[210px] min-w-0">
      <ResponsiveContainer>
        <PieChart>
          <Tooltip
            contentStyle={{
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
            }}
            formatter={(value, _, item) => [
              `${formatNumber(Number(value), locale)} (${formatPercent(item.payload.share, locale)})`,
              localizedText(locale, "Visningar", "Views"),
            ]}
          />
          <Pie
            cx="50%"
            cy="50%"
            data={data}
            dataKey="value"
            innerRadius={42}
            nameKey="label"
            outerRadius={72}
            paddingAngle={3}
          >
            {data.map((entry) => (
              <Cell fill={entry.fill} key={entry.label} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

function MiniBars({ data, locale }: { data: ChartDatum[]; locale: Locale }) {
  if (data.length === 0) return <EmptyState locale={locale} />;

  return (
    <div className="h-[210px] min-w-0">
      <PortalVerticalBarChart
        data={data.slice(0, 5)}
        heightClassName="h-[210px]"
        labelFormatter={(entry) => entry.label}
        margin={{ left: 4, right: 10, top: 12, bottom: 0 }}
        maxBarSize={22}
        useDatumFill
        valueFormatter={(value) => formatNumber(value, locale)}
        valueLabel={localizedText(locale, "Visningar", "Views")}
        yAxisWidth={36}
      />
    </div>
  );
}

function StatCard({
  icon,
  label,
  data,
  locale,
}: {
  icon: React.ReactNode;
  label: string;
  data: ListingDemography | null;
  locale: Locale;
}) {
  const total = totalViews(data);
  const top = toData(data, locale)[0];

  return (
    <div className="portal-inner-surface p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-gray-500">{label}</p>
          <p className="mt-1 text-2xl font-semibold text-gray-950">
            {formatNumber(total, locale)}
          </p>
        </div>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-brand-100 bg-brand-50 text-[#004225]">
          {icon}
        </span>
      </div>
      <p className="mt-2 truncate text-xs text-gray-500">
        {top ? `${top.label}: ${formatPercent(top.share, locale)}` : localizedText(locale, "Inget toppsegment", "No top segment")}
      </p>
    </div>
  );
}

export default function ListingDemographicsPanel({
  className,
  listingId,
  from,
  to,
  periodLabel = "senaste 90 dagarna",
  size = "4x4",
}: ListingDemographicsPanelProps) {
  const { locale } = useI18n();
  const { user, isLoading: authLoading } = useAuth();
  const companyId = getActiveCompanyId(user);
  const fallbackRange = React.useMemo(() => getRange(), []);
  const fromValue = from ?? fallbackRange.from;
  const toValue = to ?? fallbackRange.to;
  const fromKey = fromValue.toISOString();
  const toKey = toValue.toISOString();
  const demographyQuery = useListingByAllCategoriesDemography(
    companyId,
    listingId,
    fromKey,
    toKey,
    !authLoading
  );
  const data = demographyQuery.data ?? {
    VIEW_TYPE: null,
    DEVICE_TYPE: null,
    RESULTED_IN_LIKE: null,
    CITY: null,
    GENDER: null,
    AGE: null,
    SCHOOL: null,
  };
  const error = demographyQuery.isError
    ? demographyQuery.error instanceof Error
      ? demographyQuery.error.message
      : localizedText(locale, "Kunde inte hämta annonsdemografi.", "Could not load listing demographics.")
    : !authLoading && !companyId
    ? localizedText(locale, "Kunde inte hitta aktivt företag.", "Could not find active company.")
    : null;
  const localizedPeriodLabel =
    periodLabel === "senaste 90 dagarna"
      ? localizedText(locale, "senaste 90 dagarna", "the last 90 days")
      : periodLabel;
  const blockTitle = localizedText(
    locale,
    `Demografi ${localizedPeriodLabel}`,
    `Demographics ${localizedPeriodLabel}`
  );
  const blockDescription = localizedText(
    locale,
    "Annonsens visningar uppdelade på enhet, favorit och stad.",
    "Listing views split by device, favorite status and city."
  );

  if (authLoading || demographyQuery.isLoading) {
    return (
      <AnalyticsBlock
        className={className}
        description={blockDescription}
        size={size}
        title={blockTitle}
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-[240px] rounded-xl" />
          <Skeleton className="h-[240px] rounded-xl" />
        </div>
      </AnalyticsBlock>
    );
  }

  if (error) {
    return (
      <AnalyticsBlock
        className={className}
        description={blockDescription}
        size={size}
        title={blockTitle}
      >
        <div className="flex h-full min-h-[180px] items-center rounded-xl border border-error-500/20 bg-error-50 px-4 text-sm text-error-700">
          {error}
        </div>
      </AnalyticsBlock>
    );
  }

  return (
    <AnalyticsBlock
      className={className}
      description={blockDescription}
      size={size}
      title={blockTitle}
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <StatCard
          data={data.DEVICE_TYPE}
          icon={<Smartphone className="h-4 w-4" />}
          label={localizedText(locale, "Enheter", "Devices")}
          locale={locale}
        />
        <StatCard
          data={data.RESULTED_IN_LIKE}
          icon={<Heart className="h-4 w-4" />}
          label={localizedText(locale, "Favoritutfall", "Favorite outcome")}
          locale={locale}
        />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard
          chart={<MiniPie data={toData(data.DEVICE_TYPE, locale)} locale={locale} />}
          legend={<ChartLegend data={toData(data.DEVICE_TYPE, locale)} locale={locale} />}
          title={localizedText(locale, "Enheter", "Devices")}
        />
        <ChartCard
          chart={<MiniBars data={toData(data.CITY, locale)} locale={locale} />}
          legend={<ChartLegend data={toData(data.CITY, locale)} limit={5} locale={locale} />}
          title={localizedText(locale, "Städer", "Cities")}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard
          chart={<MiniBars data={toData(data.SCHOOL, locale)} locale={locale} />}
          legend={<ChartLegend data={toData(data.SCHOOL, locale)} limit={5} locale={locale} />}
          title={localizedText(locale, "Skolor", "Schools")}
        />
        <ChartCard
          chart={<MiniBars data={toData(data.AGE, locale)} locale={locale} />}
          legend={<ChartLegend data={toData(data.AGE, locale)} limit={5} locale={locale} />}
          title={localizedText(locale, "Ålder", "Age")}
        />
        <ChartCard
          chart={<MiniPie data={toData(data.GENDER, locale)} locale={locale} />}
          legend={<ChartLegend data={toData(data.GENDER, locale)} locale={locale} />}
          title={localizedText(locale, "Kön", "Gender")}
        />
      </div>
    </AnalyticsBlock>
  );
}

function ChartCard({
  title,
  chart,
  legend,
}: {
  title: string;
  chart: React.ReactNode;
  legend: React.ReactNode;
}) {
  return (
    <div className="portal-inner-surface p-4">
      <h3 className="mb-2 text-sm font-semibold text-gray-900">{title}</h3>
      {chart}
      {legend}
    </div>
  );
}
