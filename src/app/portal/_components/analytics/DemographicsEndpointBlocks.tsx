"use client";

import * as React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AnalyticsBlock } from "@/features/analytics/components/AnalyticsBlocks";
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
  demographicsService,
  type ApplicationDemography,
  type ApplicationDemographyCategory,
  type CompanyDemography,
  type CompanyDemographyCategory,
  type DemographyCategory,
  type GotListingFilter,
  type ListingDemography,
} from "@/features/analytics/services/demographics-service";
import { queueService } from "@/features/queues/services/queue-service";
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
  topLabel: string;
  topViews: number;
  topShare: number;
};

type ApplicationListingRow = {
  listingId: string;
  title: string;
  totalApplications: number;
};

type PortfolioSummary = {
  rows: ListingRow[];
  totalViews: number;
  quickViews: number;
  detailedViews: number;
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
  VIEW_TYPE: { sv: "Visningstyp", en: "View type" },
  DEVICE_TYPE: { sv: "Enhet", en: "Device" },
  PREFERRED_MAX_RENT: { sv: "Maxhyra", en: "Max rent" },
  DAYS_IN_QUEUE: { sv: "Dagar i kö", en: "Days in queue" },
  APPLICANT_OTHER_APPLICATIONS: { sv: "Andra ansökningar", en: "Other applications" },
  GOT_LISTING: { sv: "Utfall", en: "Outcome" },
  QUICK: { sv: "Snabb", en: "Quick" },
  DETAILED: { sv: "Detalj", en: "Detailed" },
  MOBILE: { sv: "Mobil", en: "Mobile" },
  DESKTOP: { sv: "Desktop", en: "Desktop" },
  true: { sv: "Favorit", en: "Favorite" },
  false: { sv: "Ingen favorit", en: "No favorite" },
};

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
      const top = bucketsToData(demography, 1, locale)[0];
      return {
        listingId,
        title: titleById.get(listingId) ?? localizedText(locale, `Annons ${listingId.slice(0, 8)}`, `Listing ${listingId.slice(0, 8)}`),
        totalViews: totalViews(demography),
        topLabel: top?.label ?? localizedText(locale, "Saknas", "Missing"),
        topViews: top?.value ?? 0,
        topShare: top?.share ?? 0,
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

  return {
    rows,
    totalViews: viewTypeValues.reduce(
      (sum, demography) => sum + totalViews(demography),
      0
    ),
    quickViews: viewTypeValues.reduce(
      (sum, demography) => sum + bucketValue(demography, "QUICK"),
      0
    ),
    detailedViews: viewTypeValues.reduce(
      (sum, demography) => sum + bucketValue(demography, "DETAILED"),
      0
    ),
    likes: resultedInLikeValues.reduce(
      (sum, demography) => sum + bucketValue(demography, true),
      0
    ),
    listingsWithViews: viewTypeValues.filter((demography) => totalViews(demography) > 0)
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
      <SelectTrigger className="h-8 w-full min-w-[150px] rounded-lg border-gray-200 bg-white text-xs shadow-[0_1px_2px_rgba(16,24,40,0.03)] sm:w-[170px]">
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
    <div className={compact ? "min-h-[140px] min-w-0 h-[160px]" : "min-h-[140px] min-w-0 h-[160px]"}>
      <ResponsiveContainer>
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
          <CartesianGrid horizontal={false} stroke="#edf0f4" />
          <XAxis axisLine={false} tick={{ fontSize: 11 }} tickLine={false} type="number" />
          <YAxis
            axisLine={false}
            dataKey="label"
            tick={{ fontSize: 11 }}
            tickLine={false}
            type="category"
            width={92}
          />
          <Tooltip
            contentStyle={{
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
              fontSize: 12,
            }}
            formatter={(value) => [formatNumber(Number(value), locale), resolvedValueLabel]}
          />
          <Bar barSize={18} dataKey="value" radius={[0, 6, 6, 0]}>
            {data.map((entry) => (
              <Cell fill={entry.fill} key={entry.key} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
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
    <div className="min-h-[250px] min-w-0 h-[280px]">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ left: 4, right: 16, top: 8, bottom: 40 }}>
          <CartesianGrid stroke="#edf0f4" vertical={false} />
          <XAxis
            dataKey="category"
            interval={0}
            tick={{ fill: "#6b7280", fontSize: 10, angle: -45, textAnchor: "end" } as any}
            tickLine={false}
            height={60}
          />
          <YAxis
            allowDecimals={false}
            axisLine={false}
            tick={{ fill: "#6b7280", fontSize: 11 }}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
              fontSize: 12,
            }}
            formatter={(value) => [formatNumber(Number(value), locale), resolvedValueLabel]}
          />
          <Bar barSize={16} dataKey="value" fill="#16a34a" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
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
        <div className="rounded-xl border border-gray-100 bg-white p-4">
          <h3 className="mb-2 text-sm font-semibold text-gray-900">{localizedText(locale, "Skolor", "Schools")}</h3>
          <HorizontalBars data={schoolData} locale={locale} />
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4">
          <h3 className="mb-2 text-sm font-semibold text-gray-900">{localizedText(locale, "Dagar i kö", "Days in queue")}</h3>
          <HorizontalBars data={queueData} locale={locale} />
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4">
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
    ...row,
    shortTitle: `#${index + 1}`,
  }));

  return (
    <div className="min-h-[240px] min-w-0 h-[280px]">
      <ResponsiveContainer>
        <ComposedChart data={data} margin={{ left: 4, right: 18, top: 8, bottom: 4 }}>
          <CartesianGrid stroke="#edf0f4" vertical={false} />
          <XAxis
            dataKey="shortTitle"
            interval={0}
            tick={{ fill: "#6b7280", fontSize: 11 }}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            axisLine={false}
            tick={{ fill: "#6b7280", fontSize: 11 }}
            tickLine={false}
            yAxisId="views"
          />
          <YAxis
            axisLine={false}
            orientation="right"
            tick={{ fill: "#6b7280", fontSize: 11 }}
            tickFormatter={(value) => `${value}%`}
            tickLine={false}
            yAxisId="share"
          />
          <Tooltip
            contentStyle={{
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
              fontSize: 12,
            }}
            formatter={(value, name) => [
              name === "topShare" ? formatPercent(Number(value), locale) : formatNumber(Number(value), locale),
              name === "topShare" ? localizedText(locale, "Andel toppsegment", "Top segment share") : localizedText(locale, "Visningar", "Views"),
            ]}
            labelFormatter={(_, payload: unknown[]) => {
              const item = payload?.[0] as { payload?: { title?: string } } | undefined;
              return item?.payload?.title ?? "";
            }}
          />
          <Bar
            barSize={20}
            dataKey="totalViews"
            fill="#16a34a"
            name={localizedText(locale, "Visningar", "Views")}
            radius={[6, 6, 0, 0]}
            yAxisId="views"
          />
          <Line
            dataKey="topShare"
            dot={{ r: 3 }}
            name={localizedText(locale, "Andel toppsegment", "Top segment share")}
            stroke="#f472b6"
            strokeWidth={2}
            yAxisId="share"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

function SummaryMetric({
  label,
  value,
  helper,
  locale,
}: {
  label: string;
  value: number;
  helper?: string;
  locale: Locale;
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50/70 px-3 py-2.5">
      <p className="truncate text-[11px] font-medium leading-4 text-gray-500 sm:text-xs">
        {label}
      </p>
      <p className="mt-0.5 text-lg font-semibold text-gray-950 tabular-nums sm:text-xl">
        {formatNumber(value, locale)}
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
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        <SummaryMetric label={localizedText(locale, "Totala visningar", "Total views")} value={summary.totalViews} locale={locale} />
        <SummaryMetric label={localizedText(locale, "Snabbvisningar", "Quick views")} value={summary.quickViews} locale={locale} />
        <SummaryMetric label={localizedText(locale, "Detaljvisningar", "Detailed views")} value={summary.detailedViews} locale={locale} />
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
        <div className="rounded-xl border border-gray-100 bg-white p-4 col-span-1 lg:col-span-2">
          <div className="mb-2 flex items-baseline justify-between gap-3">
            <h3 className="text-sm font-semibold text-gray-900">
              {localizedText(locale, "Toppannonser", "Top listings")}
            </h3>
            <span className="text-xs text-gray-500">{localizedText(locale, "Visningar", "Views")}</span>
          </div>
          <ListingPortfolioChart rows={summary.rows} locale={locale} />
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-4 col-span-1 lg:col-span-1">
          <h3 className="mb-2 text-sm font-semibold text-gray-900">{localizedText(locale, "Enheter", "Devices")}</h3>
          <PieDistribution compact data={summary.deviceData} locale={locale} />
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4 col-span-1 lg:col-span-1">
          <h3 className="mb-2 text-sm font-semibold text-gray-900">{localizedText(locale, "Städer", "Cities")}</h3>
          <HorizontalBars compact data={summary.cityData} locale={locale} />
        </div>
      </div>
    </div>
  );
}

type CompanyDemographyBlockProps = {
  deferUntilSelection?: boolean;
  description?: React.ReactNode;
  title?: React.ReactNode;
  useCompaniesQuery?: boolean;
};

export function CompanyDemographyBlock({
  deferUntilSelection = false,
  description,
  title,
  useCompaniesQuery = false,
}: CompanyDemographyBlockProps = {}) {
  const { locale } = useI18n();
  const { user, isLoading: authLoading } = useAuth();
  const companyId = getActiveCompanyId(user);
  const [range, setRange] = React.useState<ApplicationIntervalValue>("1m");
  const [category, setCategory] =
    React.useState<CompanyDemographyCategory>("VIEW_TYPE");
  const [demography, setDemography] = React.useState<CompanyDemography | null>(null);
  const [hasSelection, setHasSelection] = React.useState(!deferUntilSelection);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (authLoading) return;

    if (!hasSelection) {
      setDemography(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    if (!companyId) {
      setError(localizedText(locale, "Kunde inte hitta ett aktivt företag.", "Could not find an active company."));
      return;
    }

    const { from, to } = getApplicationIntervalRange(range);
    let cancelled = false;

    setIsLoading(true);
    setError(null);

    const request = useCompaniesQuery
      ? demographicsService
          .getCompaniesBatch([companyId], from, to, category)
          .then((result) => result[String(companyId)] ?? null)
      : demographicsService.getCompany(companyId, from, to, category);

    request
      .then((result) => {
        if (!cancelled) setDemography(result);
      })
      .catch((requestError) => {
        if (!cancelled) {
          setDemography(null);
          setError(
            requestError instanceof Error
              ? requestError.message
              : localizedText(locale, "Kunde inte hämta företagsdemografi.", "Could not load company demographics.")
          );
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [authLoading, category, companyId, hasSelection, locale, range, useCompaniesQuery]);

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
            categories={COMPANY_DEMOGRAPHY_CATEGORIES}
            onChange={handleCategoryChange}
            value={category}
          />
          <ApplicationIntervalToggle onChange={handleRangeChange} value={range} />
        </div>
      }
      size="2x2"
      title={title ?? localizedText(locale, "Företagsprofil", "Company profile")}
      description={description ?? localizedText(locale, "Besökare uppdelade efter vald kategori.", "Visitors split by the selected category.")}
    >
      {authLoading || isLoading ? (
        <BlockSkeleton />
      ) : error ? (
        <ErrorState message={error} />
      ) : deferUntilSelection && !hasSelection ? (
        <EmptyState message={localizedText(locale, "Välj kategori eller tidsintervall för att ladda demografi.", "Choose a category or time interval to load demographics.")} />
      ) : category === "GENDER" || category === "VIEW_TYPE" || category === "DEVICE_TYPE" ? (
        <PieDistribution data={bucketsToData(demography, 8, locale)} locale={locale} />
      ) : (
        <HorizontalBars data={bucketsToData(demography, 8, locale)} locale={locale} />
      )}
    </AnalyticsBlock>
  );
}

export function CompanyDemographyBatchBlock() {
  const { locale } = useI18n();
  const { user, isLoading: authLoading } = useAuth();
  const companyId = getActiveCompanyId(user);
  const [range, setRange] = React.useState<ApplicationIntervalValue>("1m");
  const [data, setData] = React.useState<Array<{ category: string; value: number }>>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (authLoading) return;

    if (!companyId) {
      setError(localizedText(locale, "Kunde inte hitta ett aktivt företag.", "Could not find an active company."));
      return;
    }

    const { from, to } = getApplicationIntervalRange(range);
    let cancelled = false;

    setIsLoading(true);
    setError(null);

    demographicsService
      .getCompaniesBatchByAllCategories([companyId], from, to)
      .then((result) => {
        if (cancelled) return;
        setData(
          COMPANY_DEMOGRAPHY_CATEGORIES.map((category) => ({
            category: labelFor(locale, category),
            value: totalViews(result[category]?.[String(companyId)] ?? null),
          })).filter((item) => item.value > 0)
        );
      })
      .catch((requestError) => {
        if (!cancelled) {
          setData([]);
          setError(
            requestError instanceof Error
              ? requestError.message
              : localizedText(locale, "Kunde inte hämta batchdemografi.", "Could not load batch demographics.")
          );
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [authLoading, companyId, locale, range]);

  return (
    <AnalyticsBlock
      action={<ApplicationIntervalToggle onChange={setRange} value={range} />}
      size="2x2"
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

export function ListingDemographyBatchBlock() {
  const { locale } = useI18n();
  const { user, isLoading: authLoading } = useAuth();
  const companyId = getActiveCompanyId(user);
  const [range, setRange] = React.useState<ApplicationIntervalValue>("1m");
  const [summary, setSummary] = React.useState<PortfolioSummary | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (authLoading) return;

    if (!companyId) {
      setError(localizedText(locale, "Kunde inte hitta ett aktivt företag.", "Could not find an active company."));
      return;
    }

    const { from, to } = getApplicationIntervalRange(range);
    let cancelled = false;

    setIsLoading(true);
    setError(null);

    async function load() {
      const [listings, result] = await Promise.all([
        queueService.getAllCompanyListings(companyId!, 0, 200),
        demographicsService.getFullCompanyListingsByAllCategories(
          companyId!,
          from,
          to
        ),
      ]);

      if (!cancelled) setSummary(buildPortfolioSummary(result, listings, locale));
    }

    load()
      .catch((requestError) => {
        if (!cancelled) {
          setSummary(null);
          setError(
            requestError instanceof Error
              ? requestError.message
              : localizedText(locale, "Kunde inte hämta annonsportfölj.", "Could not load listing portfolio.")
          );
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [authLoading, companyId, locale, range]);

  return (
    <AnalyticsBlock
      action={<ApplicationIntervalToggle onChange={setRange} value={range} />}
      contentClassName="overflow-hidden p-4"
      size="4x4"
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

export function ApplicationDemographyPortfolioBlock() {
  const { locale } = useI18n();
  const { user, isLoading: authLoading } = useAuth();
  const companyId = getActiveCompanyId(user);
  const initialRange = React.useMemo(() => defaultDateTimeRange(), []);
  const [fromValue, setFromValue] = React.useState(initialRange.from);
  const [toValue, setToValue] = React.useState(initialRange.to);
  const [category, setCategory] =
    React.useState<ApplicationDemographyCategory>("GOT_LISTING");
  const [gotListing, setGotListing] = React.useState<GotListingFilter>("BOTH");
  const [demographies, setDemographies] =
    React.useState<Record<string, ApplicationDemography> | null>(null);
  const [listingRows, setListingRows] = React.useState<ApplicationListingRow[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (authLoading) return;

    if (!companyId) {
      setError(localizedText(locale, "Kunde inte hitta ett aktivt företag.", "Could not find an active company."));
      return;
    }

    const from = dateTimeLocalToIso(fromValue);
    const to = dateTimeLocalToIso(toValue);

    if (!from || !to) {
      setDemographies(null);
      setListingRows([]);
      setError(localizedText(locale, "Välj giltiga datum för från och till.", "Choose valid from and to dates."));
      return;
    }

    if (new Date(from).getTime() > new Date(to).getTime()) {
      setDemographies(null);
      setListingRows([]);
      setError(localizedText(locale, "Från måste vara tidigare än till.", "From must be earlier than to."));
      return;
    }

    const fromIso = from;
    const toIso = to;
    let cancelled = false;

    setIsLoading(true);
    setError(null);

    async function load() {
      const listings = await queueService.getAllCompanyListings(companyId!, 0, 200);
      const listingIds = listings.map((listing) => listing.id).filter(Boolean);

      if (listingIds.length === 0) {
        if (!cancelled) {
          setDemographies({});
          setListingRows([]);
        }
        return;
      }

      const result = await demographicsService.getApplicationsBatch(
        companyId!,
        listingIds,
        fromIso,
        toIso,
        category,
        gotListing
      );

      if (!cancelled) {
        setDemographies(result);
        setListingRows(mapApplicationListingRows(result, listings, locale));
      }
    }

    load()
      .catch((requestError) => {
        if (!cancelled) {
          setDemographies(null);
          setListingRows([]);
          setError(
            requestError instanceof Error
              ? requestError.message
              : localizedText(locale, "Kunde inte hämta ansökningsdemografi.", "Could not load application demographics.")
          );
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [authLoading, category, companyId, fromValue, gotListing, locale, toValue]);

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
            className="h-8 w-[170px] rounded-lg border-gray-200 bg-white text-xs shadow-[0_1px_2px_rgba(16,24,40,0.03)]"
            onChange={(event) => setFromValue(event.target.value)}
            type="datetime-local"
            value={fromValue}
          />
          <Input
            aria-label={localizedText(locale, "Till", "To")}
            className="h-8 w-[170px] rounded-lg border-gray-200 bg-white text-xs shadow-[0_1px_2px_rgba(16,24,40,0.03)]"
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
            <SelectTrigger className="h-8 w-[140px] rounded-lg border-gray-200 bg-white text-xs shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
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
      contentClassName="overflow-hidden p-3 pt-1"
      size="2x4"
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
            <div className="rounded-xl border border-gray-100 bg-white p-4">
              <h3 className="mb-2 text-sm font-semibold text-gray-900">
                {labelFor(locale, category)}
              </h3>
              <HorizontalBars data={bucketData} valueLabel={localizedText(locale, "Ansökningar", "Applications")} locale={locale} />
            </div>
            <div className="rounded-xl border border-gray-100 bg-white p-4">
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

export function ListingDemographyDrilldownBlock() {
  const { locale } = useI18n();
  const { user, isLoading: authLoading } = useAuth();
  const companyId = getActiveCompanyId(user);
  const [range, setRange] = React.useState<ApplicationIntervalValue>("1m");
  const [category, setCategory] =
    React.useState<DemographyCategory>("DEVICE_TYPE");
  const [listings, setListings] = React.useState<ListingCardDTO[]>([]);
  const [listingId, setListingId] = React.useState<string>("");
  const [demography, setDemography] = React.useState<ListingDemography | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (authLoading || !companyId) return;

    let cancelled = false;
    queueService
      .getAllCompanyListings(companyId, 0, 200)
      .then((items) => {
        if (cancelled) return;
        setListings(items);
        setListingId((current) => current || items[0]?.id || "");
      })
      .catch(() => {
        if (!cancelled) setListings([]);
      });

    return () => {
      cancelled = true;
    };
  }, [authLoading, companyId]);

  React.useEffect(() => {
    if (authLoading) return;

    if (!companyId || !listingId) {
      setDemography(null);
      return;
    }

    const { from, to } = getApplicationIntervalRange(range);
    let cancelled = false;

    setIsLoading(true);
    setError(null);

    demographicsService
      .getListing(listingId, from, to, category)
      .then((result) => {
        if (!cancelled) setDemography(result);
      })
      .catch((requestError) => {
        if (!cancelled) {
          setDemography(null);
          setError(
            requestError instanceof Error
              ? requestError.message
              : localizedText(locale, "Kunde inte hämta annonsdemografi.", "Could not load listing demographics.")
          );
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [authLoading, category, companyId, listingId, locale, range]);

  return (
    <AnalyticsBlock
      action={
        <div className="flex max-w-full flex-col gap-2 sm:flex-row">
          <Select onValueChange={setListingId} value={listingId}>
            <SelectTrigger className="h-8 w-full min-w-[180px] rounded-lg border-gray-200 bg-white text-xs shadow-[0_1px_2px_rgba(16,24,40,0.03)] sm:w-[210px]">
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
            categories={LISTING_DEMOGRAPHY_CATEGORIES}
            onChange={setCategory}
            value={category}
          />
          <ApplicationIntervalToggle onChange={setRange} value={range} />
        </div>
      }
      size="2x2"
      title={localizedText(locale, "Annonsdetalj", "Listing detail")}
      description={localizedText(locale, "Demografi för vald annons och period.", "Demographics for the selected listing and period.")}
    >
      {authLoading || isLoading ? (
        <BlockSkeleton />
      ) : error ? (
        <ErrorState message={error} />
      ) : category === "GENDER" || category === "VIEW_TYPE" || category === "RESULTED_IN_LIKE" || category === "DEVICE_TYPE" ? (
        <PieDistribution data={bucketsToData(demography, 8, locale)} locale={locale} />
      ) : (
        <HorizontalBars data={bucketsToData(demography, 8, locale)} locale={locale} />
      )}
    </AnalyticsBlock>
  );
}
