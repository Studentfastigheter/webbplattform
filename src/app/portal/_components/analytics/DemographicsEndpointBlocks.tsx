"use client";

import * as React from "react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  AnalyticsBlock,
  type AnalyticsBlockSize,
} from "@/features/analytics/components/AnalyticsBlocks";
import {
  PortalBarLineChart,
  PortalHorizontalBarChart,
  PortalVerticalBarChart,
} from "@/features/analytics/components/PortalBarCharts";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { getActiveCompanyId } from "@/lib/company-access";
import {
  COMPANY_DEMOGRAPHY_CATEGORIES,
  APPLICATION_DEMOGRAPHY_CATEGORIES,
  LISTING_DEMOGRAPHY_CATEGORIES,
  type ApplicationDemography,
  type ApplicationDemographyCategory,
  type CompanyDemography,
  type CompanyDemographyCategory,
  type DemographyCategory,
  type GotListingFilter,
  type ListingDemography,
} from "@/features/analytics/services/demographics-service";
import { useAllCompanyListings } from "@/features/queues/hooks/useQueues";
import {
  useApplicationsBatchDemography,
  useCompaniesBatchByAllCategoriesDemography,
  useCompanyDemography,
  useFullCompanyListingsByAllCategoriesDemography,
  useListingDemography,
} from "@/features/analytics/hooks/useDemographics";
import type { ListingCardDTO } from "@/types/listing";
import {
  ApplicationIntervalToggle,
  getApplicationIntervalRange,
  type ApplicationIntervalValue,
} from "./ApplicationIntervalStats";
import { useI18n } from "@/i18n/I18nProvider";
import type { Locale } from "@/i18n/config";
import { localizedText, numberLocale } from "@/i18n/text";

type BucketDatum = {
  key: string;
  label: string;
  value: number;
  share: number;
  fill: string;
};

type ListingRow = {
  listingId: string;
  title: string;
  totalViews: number;
  clickThroughRate: number;
};

type ApplicationListingRow = {
  listingId: string;
  title: string;
  totalApplications: number;
};

type PortfolioSummary = {
  rows: ListingRow[];
  totalViews: number;
  clickThroughRate: number;
  likes: number;
  listingsWithViews: number;
  deviceData: BucketDatum[];
  cityData: BucketDatum[];
};

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
  GENDER: { sv: "Kön", en: "Gender" },
  AGE: { sv: "Ålder", en: "Age" },
  CITY: { sv: "Stad", en: "City" },
  SCHOOL: { sv: "Skola", en: "School" },
  RESULTED_IN_LIKE: { sv: "Favorit", en: "Favorite" },
  DEVICE_TYPE: { sv: "Enhet", en: "Device" },
  PREFERRED_MAX_RENT: { sv: "Maxhyra", en: "Max rent" },
  DAYS_IN_QUEUE: { sv: "Dagar i kö", en: "Days in queue" },
  APPLICANT_OTHER_APPLICATIONS: { sv: "Andra ansökningar", en: "Other applications" },
  GOT_LISTING: { sv: "Utfall", en: "Outcome" },
  MOBILE: { sv: "Mobil", en: "Mobile" },
  DESKTOP: { sv: "Desktop", en: "Desktop" },
  true: { sv: "Favorit", en: "Favorite" },
  false: { sv: "Ingen favorit", en: "No favorite" },
};

const visibleCompanyDemographyCategories = COMPANY_DEMOGRAPHY_CATEGORIES.filter(
  (category) => category !== "VIEW_TYPE"
);
const visibleListingDemographyCategories = LISTING_DEMOGRAPHY_CATEGORIES.filter(
  (category) => category !== "VIEW_TYPE"
);

const gotListingLabels: Record<GotListingFilter, { sv: string; en: string }> = {
  BOTH: { sv: "Alla utfall", en: "All outcomes" },
  ACCEPTED_ONLY: { sv: "Accepterade", en: "Accepted" },
  REJECTED_ONLY: { sv: "Nekade", en: "Rejected" },
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
  Helsingborg: "Helsingborg",
  "Umea": "Umeå",
  "Lulea": "Luleå",
  "Boras": "Borås",
  "Okant": "Okänt",
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

function gotListingLabelFor(locale: Locale, value: GotListingFilter) {
  const label = gotListingLabels[value];
  return localizedText(locale, label.sv, label.en);
}

function formatNumber(value: number, locale: Locale) {
  return value.toLocaleString(numberLocale(locale));
}

function formatPercent(value: number, locale: Locale) {
  return `${value.toLocaleString(numberLocale(locale), { maximumFractionDigits: 1 })}%`;
}

function toDateTimeLocalValue(value: Date) {
  const localDate = new Date(value.getTime() - value.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 16);
}

function defaultDateTimeRange() {
  const to = new Date();
  const from = new Date(to);
  from.setDate(from.getDate() - 30);

  return {
    from: toDateTimeLocalValue(from),
    to: toDateTimeLocalValue(to),
  };
}

function dateTimeLocalToIso(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return date.toISOString();
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

function totalViews(value?: CompanyDemography | ListingDemography | null) {
  if (!value) return 0;
  return (
    value.totalViews ??
    value.buckets?.reduce((sum, bucket) => sum + (bucket.totalViews ?? 0), 0) ??
    0
  );
}

function totalApplications(value?: ApplicationDemography | null) {
  if (!value) return 0;
  return (
    value.totalApplications ??
    value.buckets?.reduce(
      (sum, bucket) => sum + Number(bucket.totalApplications ?? 0),
      0
    ) ??
    0
  );
}

function bucketsToData(
  value?: CompanyDemography | ListingDemography | null,
  limit = 8,
  locale: Locale = "sv"
): BucketDatum[] {
  const total = totalViews(value);
  return (value?.buckets ?? [])
    .map((bucket, index) => {
      const bucketValue = Number(bucket.totalViews ?? 0);
      return {
        key: `${keyLabel(bucket.key, locale)}-${index}`,
        label: keyLabel(bucket.key, locale),
        value: bucketValue,
        share: total > 0 ? (bucketValue / total) * 100 : 0,
        fill: colors[index % colors.length],
      };
    })
    .filter((item) => item.value > 0)
    .sort((left, right) => right.value - left.value)
    .slice(0, limit);
}

function mapListingRows(
  batch: Record<string, ListingDemography>,
  listings: ListingCardDTO[],
  locale: Locale
): ListingRow[] {
  const titleById = new Map(listings.map((listing) => [String(listing.id), listing.title]));

  return Object.entries(batch)
    .map(([listingId, demography]) => {
      const detailedViews = bucketValue(demography, "DETAILED");
      const quickViews = bucketValue(demography, "QUICK");
      return {
        listingId,
        title: titleById.get(listingId) ?? localizedText(locale, `Annons ${listingId.slice(0, 8)}`, `Listing ${listingId.slice(0, 8)}`),
        totalViews: detailedViews,
        clickThroughRate: quickViews > 0 ? (detailedViews / quickViews) * 100 : 0,
      };
    })
    .filter((row) => row.totalViews > 0)
    .sort((left, right) => right.totalViews - left.totalViews)
    .slice(0, 8);
}

function mapApplicationListingRows(
  batch: Record<string, ApplicationDemography>,
  listings: ListingCardDTO[],
  locale: Locale
): ApplicationListingRow[] {
  const titleById = new Map(
    listings.map((listing) => [String(listing.id), listing.title])
  );

  return Object.entries(batch)
    .map(([listingId, demography]) => ({
      listingId,
      title: titleById.get(listingId) ?? localizedText(locale, `Annons ${listingId.slice(0, 8)}`, `Listing ${listingId.slice(0, 8)}`),
      totalApplications: totalApplications(demography),
    }))
    .filter((row) => row.totalApplications > 0)
    .sort((left, right) => right.totalApplications - left.totalApplications)
    .slice(0, 8);
}

function mergeBuckets(
  values: Array<ListingDemography | null | undefined>,
  limit = 8,
  locale: Locale = "sv"
): BucketDatum[] {
  const counts = new Map<string, { key: unknown; totalViews: number }>();

  values.forEach((value) => {
    value?.buckets?.forEach((bucket) => {
      const label = keyLabel(bucket.key, locale);
      const current = counts.get(label);
      counts.set(label, {
        key: bucket.key,
        totalViews: (current?.totalViews ?? 0) + Number(bucket.totalViews ?? 0),
      });
    });
  });

  const total = Array.from(counts.values()).reduce(
    (sum, bucket) => sum + bucket.totalViews,
    0
  );

  return Array.from(counts.values())
    .map((bucket, index) => ({
      key: `${keyLabel(bucket.key, locale)}-${index}`,
      label: keyLabel(bucket.key, locale),
      value: bucket.totalViews,
      share: total > 0 ? (bucket.totalViews / total) * 100 : 0,
      fill: colors[index % colors.length],
    }))
    .filter((item) => item.value > 0)
    .sort((left, right) => right.value - left.value)
    .slice(0, limit);
}

function mergeApplicationBuckets(
  values: Array<ApplicationDemography | null | undefined>,
  limit = 8,
  locale: Locale = "sv"
): BucketDatum[] {
  const counts = new Map<string, { key: unknown; totalApplications: number }>();

  values.forEach((value) => {
    value?.buckets?.forEach((bucket) => {
      const label = keyLabel(bucket.key, locale);
      const current = counts.get(label);
      counts.set(label, {
        key: bucket.key,
        totalApplications:
          (current?.totalApplications ?? 0) +
          Number(bucket.totalApplications ?? 0),
      });
    });
  });

  const total = Array.from(counts.values()).reduce(
    (sum, bucket) => sum + bucket.totalApplications,
    0
  );

  return Array.from(counts.values())
    .map((bucket, index) => ({
      key: `${keyLabel(bucket.key, locale)}-${index}`,
      label: keyLabel(bucket.key, locale),
      value: bucket.totalApplications,
      share: total > 0 ? (bucket.totalApplications / total) * 100 : 0,
      fill: colors[index % colors.length],
    }))
    .filter((item) => item.value > 0)
    .sort((left, right) => right.value - left.value)
    .slice(0, limit);
}

function bucketValue(
  value: ListingDemography | null | undefined,
  bucketKey: unknown
): number {
  return (
    value?.buckets
      ?.filter((bucket) => String(bucket.key) === String(bucketKey))
      .reduce((sum, bucket) => sum + Number(bucket.totalViews ?? 0), 0) ?? 0
  );
}

function buildPortfolioSummary(
  data: Record<DemographyCategory, Record<string, ListingDemography>>,
  listings: ListingCardDTO[],
  locale: Locale
): PortfolioSummary {
  const viewTypeByListing = data.VIEW_TYPE ?? {};
  const rows = mapListingRows(viewTypeByListing, listings, locale);
  const viewTypeValues = Object.values(viewTypeByListing);
  const resultedInLikeValues = Object.values(data.RESULTED_IN_LIKE ?? {});
  const quickViews = viewTypeValues.reduce(
    (sum, demography) => sum + bucketValue(demography, "QUICK"),
    0
  );
  const detailedViews = viewTypeValues.reduce(
    (sum, demography) => sum + bucketValue(demography, "DETAILED"),
    0
  );

  return {
    rows,
    totalViews: detailedViews,
    clickThroughRate: quickViews > 0 ? (detailedViews / quickViews) * 100 : 0,
    likes: resultedInLikeValues.reduce(
      (sum, demography) => sum + bucketValue(demography, true),
      0
    ),
    listingsWithViews: viewTypeValues.filter((demography) => bucketValue(demography, "DETAILED") > 0)
      .length,
    deviceData: mergeBuckets(Object.values(data.DEVICE_TYPE ?? {}), 6, locale),
    cityData: mergeBuckets(Object.values(data.CITY ?? {}), 6, locale),
  };
}

function categoryOptions<TCategory extends string>(
  categories: readonly TCategory[],
  locale: Locale
) {
  return categories.map((category) => ({
    value: category,
    label: labelFor(locale, category),
  }));
}

function CategorySelect<TCategory extends string>({
  value,
  onChange,
  categories,
}: {
  value: TCategory;
  onChange: (value: TCategory) => void;
  categories: readonly TCategory[];
}) {
  const { locale } = useI18n();

  return (
    <Select onValueChange={(next) => onChange(next as TCategory)} value={value}>
      <SelectTrigger className="h-9 w-full min-w-[150px] rounded-lg border-gray-200 bg-white text-xs shadow-theme-xs sm:w-[170px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="border-gray-200 bg-white">
        {categoryOptions(categories, locale).map((category) => (
          <SelectItem key={category.value} value={category.value}>
            {category.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex h-full min-h-[160px] items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50/50 px-4 text-center text-sm text-gray-500">
      {message}
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex h-full min-h-[160px] items-center rounded-xl border border-error-500/20 bg-error-50 px-4 text-sm text-error-700">
      {message}
    </div>
  );
}

function BlockSkeleton({ rows = 2 }: { rows?: number }) {
  return (
    <div className="grid h-full min-h-[220px] gap-3">
      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton className="h-full min-h-[96px] rounded-xl" key={index} />
      ))}
    </div>
  );
}

function PieDistribution({
  data,
  compact,
  locale,
}: {
  data: BucketDatum[];
  compact?: boolean;
  locale: Locale;
}) {
  if (data.length === 0) {
    return <EmptyState message={localizedText(locale, "Ingen data för perioden.", "No data for this period.")} />;
  }

  return (
    <div className={compact ? "min-h-[180px] min-w-0 h-[180px]" : "min-h-[180px] min-w-0 h-[180px]"}>
      <ResponsiveContainer>
        <PieChart>
          <Tooltip
            contentStyle={{
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
              fontSize: 12,
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
            innerRadius={46}
            nameKey="label"
            outerRadius={74}
            paddingAngle={3}
          >
            {data.map((entry) => (
              <Cell fill={entry.fill} key={entry.key} />
            ))}
          </Pie>
          <Legend
            formatter={(value) => <span style={{ color: "#6b7280", fontSize: 12 }}>{value}</span>}
            iconSize={10}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

function HorizontalBars({
  data,
  valueLabel,
  compact,
  locale,
}: {
  data: BucketDatum[];
  valueLabel?: string;
  compact?: boolean;
  locale: Locale;
}) {
  const resolvedValueLabel = valueLabel ?? localizedText(locale, "Visningar", "Views");

  if (data.length === 0) {
    return <EmptyState message={localizedText(locale, "Ingen data för perioden.", "No data for this period.")} />;
  }

  return (
    <PortalHorizontalBarChart
      data={data}
      heightClassName={compact ? "h-[160px]" : "h-[160px]"}
      labelFormatter={(entry) => entry.label}
      useDatumFill
      valueFormatter={(value) => formatNumber(value, locale)}
      valueLabel={resolvedValueLabel}
    />
  );
}

function CategoryBars({
  data,
  valueLabel,
  locale,
}: {
  data: Array<{ category: string; value: number }>;
  valueLabel?: string;
  locale: Locale;
}) {
  const resolvedValueLabel = valueLabel ?? localizedText(locale, "Visningar", "Views");

  if (data.length === 0) {
    return <EmptyState message={localizedText(locale, "Ingen batchdata för perioden.", "No batch data for this period.")} />;
  }

  return (
    <PortalVerticalBarChart
      data={data.map((entry) => ({
        label: entry.category,
        value: entry.value,
      }))}
      heightClassName="h-[280px]"
      labelFormatter={(entry) => entry.label}
      margin={{ left: 4, right: 16, top: 8, bottom: 40 }}
      maxBarSize={28}
      minWidthClassName={data.length > 8 ? "min-w-[720px]" : "min-w-full"}
      valueFormatter={(value) => formatNumber(value, locale)}
      valueLabel={resolvedValueLabel}
      xAxisHeight={60}
      xAxisTickAngle={-45}
    />
  );
}

function ApplicationPortfolioSummary({
  data,
  locale,
}: {
  data: Record<ApplicationDemographyCategory, Record<string, ApplicationDemography>>;
  locale: Locale;
}) {
  const outcomeValues = Object.values(data.GOT_LISTING ?? {});
  const schoolData = mergeApplicationBuckets(Object.values(data.SCHOOL ?? {}), 6, locale);
  const queueData = mergeApplicationBuckets(Object.values(data.DAYS_IN_QUEUE ?? {}), 6, locale);
  const rentData = mergeApplicationBuckets(Object.values(data.PREFERRED_MAX_RENT ?? {}), 6, locale);
  const total = outcomeValues.reduce(
    (sum, demography) => sum + totalApplications(demography),
    0
  );
  const accepted = mergeApplicationBuckets(outcomeValues, 10, locale)
    .filter((item) => item.label === localizedText(locale, "Fick bostad", "Got housing") || item.label === "true")
    .reduce((sum, item) => sum + item.value, 0);
  const rejected = mergeApplicationBuckets(outcomeValues, 10, locale)
    .filter((item) => item.label === localizedText(locale, "Fick ej bostad", "Did not get housing") || item.label === "false")
    .reduce((sum, item) => sum + item.value, 0);

  if (total === 0 && schoolData.length === 0 && queueData.length === 0) {
    return <EmptyState message={localizedText(locale, "Ingen ansökningsdemografi för perioden.", "No application demographics for this period.")} />;
  }

  return (
    <div className="grid h-full min-h-0 gap-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <SummaryMetric label={localizedText(locale, "Terminala ansökningar", "Terminal applications")} value={total} locale={locale} />
        <SummaryMetric label={localizedText(locale, "Accepterade", "Accepted")} value={accepted} locale={locale} />
        <SummaryMetric label={localizedText(locale, "Nekade", "Rejected")} value={rejected} locale={locale} />
      </div>
      <div className="grid min-h-0 gap-4 xl:grid-cols-3">
        <div className="portal-inner-surface p-4">
          <h3 className="mb-2 text-sm font-semibold text-gray-900">{localizedText(locale, "Skolor", "Schools")}</h3>
          <HorizontalBars data={schoolData} locale={locale} />
        </div>
        <div className="portal-inner-surface p-4">
          <h3 className="mb-2 text-sm font-semibold text-gray-900">{localizedText(locale, "Dagar i kö", "Days in queue")}</h3>
          <HorizontalBars data={queueData} locale={locale} />
        </div>
        <div className="portal-inner-surface p-4">
          <h3 className="mb-2 text-sm font-semibold text-gray-900">{localizedText(locale, "Maxhyra", "Max rent")}</h3>
          <HorizontalBars data={rentData} locale={locale} />
        </div>
      </div>
    </div>
  );
}

function ListingPortfolioChart({ rows, locale }: { rows: ListingRow[]; locale: Locale }) {
  if (rows.length === 0) {
    return <EmptyState message={localizedText(locale, "Ingen annonsdata för perioden.", "No listing data for this period.")} />;
  }

  const data = rows.map((row, index) => ({
    fullLabel: row.title,
    label: `#${index + 1}`,
    lineValue: row.clickThroughRate,
    value: row.totalViews,
  }));

  return (
    <PortalBarLineChart
      barLabel={localizedText(locale, "Visningar", "Views")}
      data={data}
      heightClassName="h-[280px]"
      labelFormatter={(entry) => entry.fullLabel}
      lineAxisFormatter={(value) => `${value}%`}
      lineFormatter={(value) => formatPercent(value, locale)}
      lineLabel={localizedText(locale, "Klickfrekvens", "Click-through rate")}
      valueFormatter={(value) => formatNumber(value, locale)}
    />
  );
}

function SummaryMetric({
  label,
  value,
  valueLabel,
  helper,
  locale,
}: {
  label: string;
  value: number;
  valueLabel?: string;
  helper?: string;
  locale: Locale;
}) {
  return (
    <div className="portal-inner-surface px-3 py-2.5">
      <p className="truncate text-[11px] font-medium leading-4 text-gray-500 sm:text-xs">
        {label}
      </p>
      <p className="mt-0.5 text-lg font-semibold text-gray-950 tabular-nums sm:text-xl">
        {valueLabel ?? formatNumber(value, locale)}
      </p>
      {helper ? (
        <p className="mt-0.5 truncate text-[11px] text-gray-400">{helper}</p>
      ) : null}
    </div>
  );
}

function ListingPortfolioSummary({
  summary,
  locale,
}: {
  summary: PortfolioSummary;
  locale: Locale;
}) {
  const hasData = summary.totalViews > 0 || summary.rows.length > 0;

  if (!hasData) {
    return <EmptyState message={localizedText(locale, "Ingen annonsdata för perioden.", "No listing data for this period.")} />;
  }

  return (
    <div className="grid h-full min-h-0 gap-4 w-full">
      {/* Compact metrics row */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <SummaryMetric label={localizedText(locale, "Visningar", "Views")} value={summary.totalViews} locale={locale} />
        <SummaryMetric
          label={localizedText(locale, "Klickfrekvens", "Click-through rate")}
          value={summary.clickThroughRate}
          valueLabel={formatPercent(summary.clickThroughRate, locale)}
          locale={locale}
        />
        <SummaryMetric label={localizedText(locale, "Favoriter", "Favorites")} value={summary.likes} locale={locale} />
        <SummaryMetric
          helper={localizedText(locale, "Med minst en visning", "With at least one view")}
          label={localizedText(locale, "Aktiva annonser", "Active listings")}
          value={summary.listingsWithViews}
          locale={locale}
        />
      </div>

      {/* Charts: 3-col grid for toppannonser, enheter, städer */}
      <div className="grid h-full gap-4 grid-cols-1 lg:grid-cols-4">
        <div className="portal-inner-surface p-4 col-span-1 lg:col-span-2">
          <div className="mb-2 flex items-baseline justify-between gap-3">
            <h3 className="text-sm font-semibold text-gray-900">
              {localizedText(locale, "Toppannonser", "Top listings")}
            </h3>
            <span className="text-xs text-gray-500">{localizedText(locale, "Visningar", "Views")}</span>
          </div>
          <ListingPortfolioChart rows={summary.rows} locale={locale} />
        </div>

        <div className="portal-inner-surface p-4 col-span-1 lg:col-span-1">
          <h3 className="mb-2 text-sm font-semibold text-gray-900">{localizedText(locale, "Enheter", "Devices")}</h3>
          <PieDistribution compact data={summary.deviceData} locale={locale} />
        </div>
        <div className="portal-inner-surface p-4 col-span-1 lg:col-span-1">
          <h3 className="mb-2 text-sm font-semibold text-gray-900">{localizedText(locale, "Städer", "Cities")}</h3>
          <HorizontalBars compact data={summary.cityData} locale={locale} />
        </div>
      </div>
    </div>
  );
}

type CompanyDemographyBlockProps = {
  className?: string;
  deferUntilSelection?: boolean;
  description?: React.ReactNode;
  size?: AnalyticsBlockSize;
  title?: React.ReactNode;
  useCompaniesQuery?: boolean;
};

type PortalAnalyticsBlockProps = {
  className?: string;
  size?: AnalyticsBlockSize;
};

export function CompanyDemographyBlock({
  className,
  deferUntilSelection = false,
  description,
  size = "2x2",
  title,
  useCompaniesQuery = false,
}: CompanyDemographyBlockProps = {}) {
  const { locale } = useI18n();
  const { user, isLoading: authLoading } = useAuth();
  const companyId = getActiveCompanyId(user);
  const [range, setRange] = React.useState<ApplicationIntervalValue>("1m");
  const [category, setCategory] =
    React.useState<CompanyDemographyCategory>("DEVICE_TYPE");
  const [hasSelection, setHasSelection] = React.useState(!deferUntilSelection);

  // Stable from/to strings for the query key — deriving them in a memo (vs
  // re-computing on every render) keeps the key stable between renders, so
  // refetches only happen when range actually changes.
  const { fromIso, toIso } = React.useMemo(() => {
    const { from, to } = getApplicationIntervalRange(range);
    return { fromIso: from.toISOString(), toIso: to.toISOString() };
  }, [range]);

  const queryEnabled =
    !authLoading && hasSelection && companyId != null && companyId > 0;

  // Two distinct hooks — the single-company endpoint vs the
  // single-category-batch endpoint — picked from `useCompaniesQuery`. Both
  // are gated by `queryEnabled` so the request fires only when needed.
  const companyDemographyQuery = useCompanyDemography(
    useCompaniesQuery ? null : companyId,
    fromIso,
    toIso,
    category,
    queryEnabled && !useCompaniesQuery,
  );
  const batchDemographyQuery = useCompaniesBatchByAllCategoriesDemography(
    companyId != null && companyId > 0 ? [companyId] : [],
    fromIso,
    toIso,
    queryEnabled && useCompaniesQuery,
  );

  const demography = useCompaniesQuery
    ? (batchDemographyQuery.data?.[category]?.[String(companyId)] ?? null)
    : companyDemographyQuery.data ?? null;
  const activeQuery = useCompaniesQuery ? batchDemographyQuery : companyDemographyQuery;
  const isLoading = hasSelection && (activeQuery.isLoading || activeQuery.isFetching);
  const error = !hasSelection
    ? null
    : !companyId
    ? "Kunde inte hitta ett aktivt företag."
    : activeQuery.isError
    ? activeQuery.error instanceof Error
      ? activeQuery.error.message
      : "Kunde inte hämta företagsdemografi."
    : null;

  const handleCategoryChange = (nextCategory: CompanyDemographyCategory) => {
    setCategory(nextCategory);
    setHasSelection(true);
  };

  const handleRangeChange = (nextRange: ApplicationIntervalValue) => {
    setRange(nextRange);
    setHasSelection(true);
  };

  return (
    <AnalyticsBlock
      action={
        <div className="flex max-w-full flex-col gap-2 sm:flex-row">
          <CategorySelect
            categories={visibleCompanyDemographyCategories}
            onChange={handleCategoryChange}
            value={category}
          />
          <ApplicationIntervalToggle onChange={handleRangeChange} value={range} />
        </div>
      }
      className={className}
      size={size}
      title={title ?? localizedText(locale, "Företagsprofil", "Company profile")}
      description={description ?? localizedText(locale, "Besökare uppdelade efter vald kategori.", "Visitors split by the selected category.")}
    >
      {authLoading || isLoading ? (
        <BlockSkeleton />
      ) : error ? (
        <ErrorState message={error} />
      ) : deferUntilSelection && !hasSelection ? (
        <EmptyState message={localizedText(locale, "Välj kategori eller tidsintervall för att ladda demografi.", "Choose a category or time interval to load demographics.")} />
      ) : category === "GENDER" || category === "DEVICE_TYPE" ? (
        <PieDistribution data={bucketsToData(demography, 8, locale)} locale={locale} />
      ) : (
        <HorizontalBars data={bucketsToData(demography, 8, locale)} locale={locale} />
      )}
    </AnalyticsBlock>
  );
}

export function CompanyDemographyBatchBlock({
  className,
  size = "2x2",
}: PortalAnalyticsBlockProps = {}) {
  const { locale } = useI18n();
  const { user, isLoading: authLoading } = useAuth();
  const companyId = getActiveCompanyId(user);
  const [range, setRange] = React.useState<ApplicationIntervalValue>("1m");

  const { fromIso, toIso } = React.useMemo(() => {
    const { from, to } = getApplicationIntervalRange(range);
    return { fromIso: from.toISOString(), toIso: to.toISOString() };
  }, [range]);

  const batchQuery = useCompaniesBatchByAllCategoriesDemography(
    companyId != null && companyId > 0 ? [companyId] : [],
    fromIso,
    toIso,
    !authLoading && companyId != null && companyId > 0,
  );

  // Derive the chart points from the cached batch result. Re-renders only
  // when the query data changes — no manual setData/cancelled bookkeeping.
  const data = React.useMemo(() => {
    if (!batchQuery.data || !companyId) return [];
    return visibleCompanyDemographyCategories.map((category) => ({
      category: labelFor(locale, category),
      value: totalViews(batchQuery.data?.[category]?.[String(companyId)] ?? null),
    })).filter((item) => item.value > 0);
  }, [batchQuery.data, companyId, locale]);
  const isLoading = batchQuery.isLoading || batchQuery.isFetching;
  const error = !companyId
    ? "Kunde inte hitta ett aktivt företag."
    : batchQuery.isError
    ? batchQuery.error instanceof Error
      ? batchQuery.error.message
      : "Kunde inte hämta batchdemografi."
    : null;

  return (
    <AnalyticsBlock
      action={<ApplicationIntervalToggle onChange={setRange} value={range} />}
      className={className}
      size={size}
      title={localizedText(locale, "Demografi per kategori", "Demographics by category")}
      description={localizedText(locale, "Samlad bild av företagets besökare.", "Overview of the company's visitors.")}
    >
      {authLoading || isLoading ? (
        <BlockSkeleton />
      ) : error ? (
        <ErrorState message={error} />
      ) : (
        <CategoryBars data={data} locale={locale} />
      )}
    </AnalyticsBlock>
  );
}

export function ListingDemographyBatchBlock({
  className,
  size = "4x4",
}: PortalAnalyticsBlockProps = {}) {
  const { locale } = useI18n();
  const { user, isLoading: authLoading } = useAuth();
  const companyId = getActiveCompanyId(user);
  const [range, setRange] = React.useState<ApplicationIntervalValue>("1m");

  // Shared cache: the same useAllCompanyListings(companyId) is called from
  // 3 different analytics blocks on this page. Before migration each of
  // them fired its own 200-row request; now they collapse to one.
  const { data: cachedListings } = useAllCompanyListings(companyId, 0, 200);

  const { fromIso, toIso } = React.useMemo(() => {
    const { from, to } = getApplicationIntervalRange(range);
    return { fromIso: from.toISOString(), toIso: to.toISOString() };
  }, [range]);

  // Only fetch demographics once the shared listings cache resolves; the
  // portfolio summary needs both datasets and there's no point firing the
  // demographics call until we have the listings to map them against.
  const demographyQuery = useFullCompanyListingsByAllCategoriesDemography(
    companyId,
    fromIso,
    toIso,
    !authLoading && Boolean(cachedListings) && companyId != null && companyId > 0,
  );

  const summary = React.useMemo<PortfolioSummary | null>(
    () =>
      demographyQuery.data && cachedListings
        ? buildPortfolioSummary(demographyQuery.data, cachedListings, locale)
        : null,
    [demographyQuery.data, cachedListings, locale],
  );
  const isLoading = demographyQuery.isLoading || demographyQuery.isFetching;
  const error = !companyId
    ? "Kunde inte hitta ett aktivt företag."
    : demographyQuery.isError
    ? demographyQuery.error instanceof Error
      ? demographyQuery.error.message
      : "Kunde inte hämta annonsportfölj."
    : null;

  return (
    <AnalyticsBlock
      action={<ApplicationIntervalToggle onChange={setRange} value={range} />}
      className={className}
      contentClassName="overflow-hidden p-4"
      size={size}
      title={localizedText(locale, "Annonsportfölj", "Listing portfolio")}
      description={localizedText(locale, "Summerad demografi för alla företagets annonser.", "Aggregated demographics for all company listings.")}
    >
      {authLoading || isLoading ? (
        <BlockSkeleton rows={4} />
      ) : error ? (
        <ErrorState message={error} />
      ) : summary ? (
        <ListingPortfolioSummary summary={summary} locale={locale} />
      ) : (
        <EmptyState message={localizedText(locale, "Ingen annonsdata för perioden.", "No listing data for this period.")} />
      )}
    </AnalyticsBlock>
  );
}

export function ApplicationDemographyPortfolioBlock({
  className,
  size = "2x4",
}: PortalAnalyticsBlockProps = {}) {
  const { locale } = useI18n();
  const { user, isLoading: authLoading } = useAuth();
  const companyId = getActiveCompanyId(user);
  const initialRange = React.useMemo(() => defaultDateTimeRange(), []);
  const [fromValue, setFromValue] = React.useState(initialRange.from);
  const [toValue, setToValue] = React.useState(initialRange.to);
  const [category, setCategory] =
    React.useState<ApplicationDemographyCategory>("GOT_LISTING");
  const [gotListing, setGotListing] = React.useState<GotListingFilter>("BOTH");

  // Shared with ListingDemographyBatchBlock / ListingDemographyDrilldownBlock —
  // same companyId hits the same cache slot.
  const { data: companyListingsForApplications } = useAllCompanyListings(
    companyId,
    0,
    200,
  );

  // Validate / normalise the user's date inputs into ISO strings. If the
  // dates are invalid or inverted, the query stays disabled and we surface
  // a specific error message — preserving the original UX.
  const dateError = React.useMemo<string | null>(() => {
    const from = dateTimeLocalToIso(fromValue);
    const to = dateTimeLocalToIso(toValue);
    if (!from || !to) return "Välj giltiga datum för from och to.";
    if (new Date(from).getTime() > new Date(to).getTime()) {
      return "From måste vara tidigare än to.";
    }
    return null;
  }, [fromValue, toValue]);

  const fromIso = React.useMemo(() => dateTimeLocalToIso(fromValue), [fromValue]);
  const toIso = React.useMemo(() => dateTimeLocalToIso(toValue), [toValue]);

  // Listing ids the batch request needs. Empty array stays an empty array so
  // the hook's `enabled` gate (which requires listingIds.length > 0) shuts
  // the request off cleanly.
  const listingIds = React.useMemo(
    () =>
      (companyListingsForApplications ?? [])
        .map((listing) => listing.id)
        .filter(Boolean),
    [companyListingsForApplications],
  );

  const queryEnabled =
    !authLoading &&
    !dateError &&
    companyId != null &&
    companyId > 0 &&
    Boolean(companyListingsForApplications);

  const applicationsBatchQuery = useApplicationsBatchDemography(
    companyId,
    listingIds,
    fromIso ?? "",
    toIso ?? "",
    category,
    gotListing,
    queryEnabled,
  );

  const demographies = React.useMemo<Record<string, ApplicationDemography> | null>(() => {
    if (!queryEnabled) return null;
    if (listingIds.length === 0 && companyListingsForApplications) return {};
    return applicationsBatchQuery.data ?? null;
  }, [
    queryEnabled,
    listingIds.length,
    companyListingsForApplications,
    applicationsBatchQuery.data,
  ]);
  const listingRows = React.useMemo(
    () =>
      demographies && companyListingsForApplications
        ? mapApplicationListingRows(demographies, companyListingsForApplications, locale)
        : [],
    [demographies, companyListingsForApplications, locale]
  );

  const isLoading =
    queryEnabled &&
    listingIds.length > 0 &&
    (applicationsBatchQuery.isLoading || applicationsBatchQuery.isFetching);
  const error = !companyId
    ? "Kunde inte hitta ett aktivt företag."
    : dateError
    ? dateError
    : applicationsBatchQuery.isError
    ? applicationsBatchQuery.error instanceof Error
      ? applicationsBatchQuery.error.message
      : "Kunde inte hämta ansökningsdemografi."
    : null;

  const bucketData = React.useMemo(
    () => mergeApplicationBuckets(Object.values(demographies ?? {}), 10, locale),
    [demographies, locale]
  );
  const total = React.useMemo(
    () =>
      Object.values(demographies ?? {}).reduce(
        (sum, demography) => sum + totalApplications(demography),
        0
      ),
    [demographies]
  );
  const listingChartData = React.useMemo(
    () =>
      listingRows.map((row) => ({
        category:
          row.title.length > 16 ? `${row.title.slice(0, 15)}...` : row.title,
        value: row.totalApplications,
      })),
    [listingRows]
  );

  return (
    <AnalyticsBlock
      action={
        <div className="flex max-w-full flex-wrap items-center gap-2">
          <Input
            aria-label={localizedText(locale, "Från", "From")}
            className="h-9 w-[170px] rounded-lg border-gray-200 bg-white text-xs shadow-theme-xs"
            onChange={(event) => setFromValue(event.target.value)}
            type="datetime-local"
            value={fromValue}
          />
          <Input
            aria-label={localizedText(locale, "Till", "To")}
            className="h-9 w-[170px] rounded-lg border-gray-200 bg-white text-xs shadow-theme-xs"
            onChange={(event) => setToValue(event.target.value)}
            type="datetime-local"
            value={toValue}
          />
          <CategorySelect
            categories={APPLICATION_DEMOGRAPHY_CATEGORIES}
            onChange={setCategory}
            value={category}
          />
          <Select
            onValueChange={(value) => setGotListing(value as GotListingFilter)}
            value={gotListing}
          >
            <SelectTrigger className="h-9 w-[140px] rounded-lg border-gray-200 bg-white text-xs shadow-theme-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-gray-200 bg-white">
              {(Object.keys(gotListingLabels) as GotListingFilter[]).map((filter) => (
                <SelectItem key={filter} value={filter}>
                  {gotListingLabelFor(locale, filter)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      }
      className={className}
      contentClassName="overflow-hidden p-3 pt-1"
      size={size}
      title={localizedText(locale, "Ansökningsdemografi", "Application demographics")}
      description={localizedText(locale, "Ansökningsstatistik uppdelad per annons och vald kategori.", "Application statistics split by listing and selected category.")}
    >
      {authLoading || isLoading ? (
        <BlockSkeleton rows={3} />
      ) : error ? (
        <ErrorState message={error} />
      ) : demographies ? (
        <div className="grid h-full min-h-0 gap-4">
          <div className="grid grid-cols-3 gap-3">
            <SummaryMetric
              helper={labelFor(locale, category)}
              label={localizedText(locale, "Ansökningar", "Applications")}
              value={total}
              locale={locale}
            />
            <SummaryMetric label={localizedText(locale, "Annonser i fråga", "Listings queried")} value={Object.keys(demographies).length} locale={locale} />
            <SummaryMetric
              helper={gotListingLabelFor(locale, gotListing)}
              label={localizedText(locale, "Annonser med data", "Listings with data")}
              value={listingRows.length}
              locale={locale}
            />
          </div>
          <div className="grid min-h-0 gap-4 xl:grid-cols-2">
            <div className="portal-inner-surface p-4">
              <h3 className="mb-2 text-sm font-semibold text-gray-900">
                {labelFor(locale, category)}
              </h3>
              <HorizontalBars data={bucketData} valueLabel={localizedText(locale, "Ansökningar", "Applications")} locale={locale} />
            </div>
            <div className="portal-inner-surface p-4">
              <h3 className="mb-2 text-sm font-semibold text-gray-900">
                {localizedText(locale, "Ansökningar per annons", "Applications per listing")}
              </h3>
              <CategoryBars data={listingChartData} valueLabel={localizedText(locale, "Ansökningar", "Applications")} locale={locale} />
            </div>
          </div>
        </div>
      ) : (
        <EmptyState message={localizedText(locale, "Ingen ansökningsdemografi för perioden.", "No application demographics for this period.")} />
      )}
    </AnalyticsBlock>
  );
}

export function ListingDemographyDrilldownBlock({
  className,
  size = "2x2",
}: PortalAnalyticsBlockProps = {}) {
  const { locale } = useI18n();
  const { user, isLoading: authLoading } = useAuth();
  const companyId = getActiveCompanyId(user);
  const [range, setRange] = React.useState<ApplicationIntervalValue>("1m");
  const [category, setCategory] =
    React.useState<DemographyCategory>("DEVICE_TYPE");
  const [listingId, setListingId] = React.useState<string>("");

  // Shared cache with the other two analytics blocks. One fetch per
  // companyId, regardless of how many blocks mount.
  const { data: listingsData } = useAllCompanyListings(companyId, 0, 200);
  const listings = React.useMemo<ListingCardDTO[]>(
    () => listingsData ?? [],
    [listingsData]
  );

  // Auto-select the first listing in the dropdown when listings first
  // resolve, but never overwrite an existing selection.
  React.useEffect(() => {
    if (listings.length === 0) return;
    setListingId((current) => current || listings[0]?.id || "");
  }, [listings]);

  const { fromIso, toIso } = React.useMemo(() => {
    const { from, to } = getApplicationIntervalRange(range);
    return { fromIso: from.toISOString(), toIso: to.toISOString() };
  }, [range]);

  const listingDemographyQuery = useListingDemography(
    companyId,
    listingId || null,
    fromIso,
    toIso,
    category,
    !authLoading && Boolean(companyId) && Boolean(listingId),
  );
  const demography = listingDemographyQuery.data ?? null;
  const isLoading =
    listingDemographyQuery.isLoading || listingDemographyQuery.isFetching;
  const error = !companyId
    ? null
    : listingDemographyQuery.isError
    ? listingDemographyQuery.error instanceof Error
      ? listingDemographyQuery.error.message
      : "Kunde inte hämta annonsdemografi."
    : null;

  return (
    <AnalyticsBlock
      action={
        <div className="flex max-w-full flex-col gap-2 sm:flex-row">
          <Select onValueChange={setListingId} value={listingId}>
            <SelectTrigger className="h-9 w-full min-w-[180px] rounded-lg border-gray-200 bg-white text-xs shadow-theme-xs sm:w-[210px]">
              <SelectValue placeholder={localizedText(locale, "Välj annons", "Choose listing")} />
            </SelectTrigger>
            <SelectContent className="border-gray-200 bg-white">
              {listings.map((listing) => (
                <SelectItem key={listing.id} value={listing.id}>
                  {listing.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <CategorySelect
            categories={visibleListingDemographyCategories}
            onChange={setCategory}
            value={category}
          />
          <ApplicationIntervalToggle onChange={setRange} value={range} />
        </div>
      }
      className={className}
      size={size}
      title={localizedText(locale, "Annonsdetalj", "Listing detail")}
      description={localizedText(locale, "Demografi för vald annons och period.", "Demographics for the selected listing and period.")}
    >
      {authLoading || isLoading ? (
        <BlockSkeleton />
      ) : error ? (
        <ErrorState message={error} />
      ) : category === "GENDER" || category === "RESULTED_IN_LIKE" || category === "DEVICE_TYPE" ? (
        <PieDistribution data={bucketsToData(demography, 8, locale)} locale={locale} />
      ) : (
        <HorizontalBars data={bucketsToData(demography, 8, locale)} locale={locale} />
      )}
    </AnalyticsBlock>
  );
}
