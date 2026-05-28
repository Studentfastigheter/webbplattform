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
  "#004225",
  "#0ea5e9",
  "#f43f5e",
  "#f59e0b",
  "#14b8a6",
  "#8b5cf6",
  "#22c55e",
  "#64748b",
];

const labels: Record<string, string> = {
  GENDER: "Kön",
  AGE: "Ålder",
  CITY: "Stad",
  SCHOOL: "Skola",
  RESULTED_IN_LIKE: "Favorit",
  VIEW_TYPE: "Visningstyp",
  DEVICE_TYPE: "Enhet",
  PREFERRED_MAX_RENT: "Maxhyra",
  DAYS_IN_QUEUE: "Dagar i kö",
  APPLICANT_OTHER_APPLICATIONS: "Andra ansökningar",
  GOT_LISTING: "Utfall",
  QUICK: "Snabb",
  DETAILED: "Detalj",
  MOBILE: "Mobil",
  DESKTOP: "Desktop",
  true: "Favorit",
  false: "Ingen favorit",
};

const gotListingLabels: Record<GotListingFilter, string> = {
  BOTH: "Alla utfall",
  ACCEPTED_ONLY: "Accepterade",
  REJECTED_ONLY: "Nekade",
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

function formatNumber(value: number) {
  return value.toLocaleString("sv-SE");
}

function formatPercent(value: number) {
  return `${value.toLocaleString("sv-SE", { maximumFractionDigits: 1 })}%`;
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

function keyLabel(value: unknown) {
  if (value === null || value === undefined) return "Okänt";
  const raw = repairMojibake(String(value).trim());
  return labels[raw] ?? swedishLabelCorrections[raw] ?? (raw || "Okänt");
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
  limit = 8
): BucketDatum[] {
  const total = totalViews(value);
  return (value?.buckets ?? [])
    .map((bucket, index) => {
      const bucketValue = Number(bucket.totalViews ?? 0);
      return {
        key: `${keyLabel(bucket.key)}-${index}`,
        label: keyLabel(bucket.key),
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
  listings: ListingCardDTO[]
): ListingRow[] {
  const titleById = new Map(listings.map((listing) => [String(listing.id), listing.title]));

  return Object.entries(batch)
    .map(([listingId, demography]) => {
      const top = bucketsToData(demography, 1)[0];
      return {
        listingId,
        title: titleById.get(listingId) ?? `Annons ${listingId.slice(0, 8)}`,
        totalViews: totalViews(demography),
        topLabel: top?.label ?? "Saknas",
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
  listings: ListingCardDTO[]
): ApplicationListingRow[] {
  const titleById = new Map(
    listings.map((listing) => [String(listing.id), listing.title])
  );

  return Object.entries(batch)
    .map(([listingId, demography]) => ({
      listingId,
      title: titleById.get(listingId) ?? `Annons ${listingId.slice(0, 8)}`,
      totalApplications: totalApplications(demography),
    }))
    .filter((row) => row.totalApplications > 0)
    .sort((left, right) => right.totalApplications - left.totalApplications)
    .slice(0, 8);
}

function mergeBuckets(
  values: Array<ListingDemography | null | undefined>,
  limit = 8
): BucketDatum[] {
  const counts = new Map<string, { key: unknown; totalViews: number }>();

  values.forEach((value) => {
    value?.buckets?.forEach((bucket) => {
      const label = keyLabel(bucket.key);
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
      key: `${keyLabel(bucket.key)}-${index}`,
      label: keyLabel(bucket.key),
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
  limit = 8
): BucketDatum[] {
  const counts = new Map<string, { key: unknown; totalApplications: number }>();

  values.forEach((value) => {
    value?.buckets?.forEach((bucket) => {
      const label = keyLabel(bucket.key);
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
      key: `${keyLabel(bucket.key)}-${index}`,
      label: keyLabel(bucket.key),
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
  listings: ListingCardDTO[]
): PortfolioSummary {
  const viewTypeByListing = data.VIEW_TYPE ?? {};
  const rows = mapListingRows(viewTypeByListing, listings);
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
    deviceData: mergeBuckets(Object.values(data.DEVICE_TYPE ?? {}), 6),
    cityData: mergeBuckets(Object.values(data.CITY ?? {}), 6),
  };
}

function categoryOptions<TCategory extends string>(
  categories: readonly TCategory[]
) {
  return categories.map((category) => ({
    value: category,
    label: labels[category] ?? category,
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
  return (
    <Select onValueChange={(next) => onChange(next as TCategory)} value={value}>
      <SelectTrigger className="h-8 w-full min-w-[150px] rounded-lg border-gray-200 bg-white text-xs shadow-[0_1px_2px_rgba(16,24,40,0.03)] sm:w-[170px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="border-gray-200 bg-white">
        {categoryOptions(categories).map((category) => (
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

function PieDistribution({ data }: { data: BucketDatum[] }) {
  if (data.length === 0) return <EmptyState message="Ingen data för perioden." />;

  return (
    <div className="h-full min-h-[230px] min-w-0">
      <ResponsiveContainer>
        <PieChart>
          <Tooltip
            contentStyle={{
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
            }}
            formatter={(value, _, item) => [
              `${formatNumber(Number(value))} (${formatPercent(item.payload.share)})`,
              "Visningar",
            ]}
          />
          <Pie
            cx="50%"
            cy="50%"
            data={data}
            dataKey="value"
            innerRadius={50}
            nameKey="label"
            outerRadius={82}
            paddingAngle={3}
          >
            {data.map((entry) => (
              <Cell fill={entry.fill} key={entry.key} />
            ))}
          </Pie>
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

function HorizontalBars({
  data,
  valueLabel = "Visningar",
}: {
  data: BucketDatum[];
  valueLabel?: string;
}) {
  if (data.length === 0) return <EmptyState message="Ingen data för perioden." />;

  return (
    <div className="h-full min-h-[230px] min-w-0">
      <ResponsiveContainer>
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
          <CartesianGrid horizontal={false} stroke="#edf0f4" />
          <XAxis axisLine={false} tickLine={false} type="number" />
          <YAxis
            axisLine={false}
            dataKey="label"
            tickLine={false}
            type="category"
            width={92}
          />
          <Tooltip
            contentStyle={{
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
            }}
            formatter={(value) => [formatNumber(Number(value)), valueLabel]}
          />
          <Bar dataKey="value" radius={[0, 8, 8, 0]}>
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
  valueLabel = "Visningar",
}: {
  data: Array<{ category: string; value: number }>;
  valueLabel?: string;
}) {
  if (data.length === 0) return <EmptyState message="Ingen batchdata för perioden." />;

  return (
    <div className="h-full min-h-[230px] min-w-0">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ left: 4, right: 16, top: 8 }}>
          <CartesianGrid stroke="#edf0f4" vertical={false} />
          <XAxis
            dataKey="category"
            interval={0}
            tick={{ fill: "#6b7280", fontSize: 11 }}
            tickLine={false}
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
            }}
            formatter={(value) => [formatNumber(Number(value)), valueLabel]}
          />
          <Bar dataKey="value" fill="#004225" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function ApplicationPortfolioSummary({
  data,
}: {
  data: Record<ApplicationDemographyCategory, Record<string, ApplicationDemography>>;
}) {
  const outcomeValues = Object.values(data.GOT_LISTING ?? {});
  const schoolData = mergeApplicationBuckets(Object.values(data.SCHOOL ?? {}), 6);
  const queueData = mergeApplicationBuckets(Object.values(data.DAYS_IN_QUEUE ?? {}), 6);
  const rentData = mergeApplicationBuckets(Object.values(data.PREFERRED_MAX_RENT ?? {}), 6);
  const total = outcomeValues.reduce(
    (sum, demography) => sum + totalApplications(demography),
    0
  );
  const accepted = mergeApplicationBuckets(outcomeValues, 10)
    .filter((item) => item.label === "Fick bostad" || item.label === "true")
    .reduce((sum, item) => sum + item.value, 0);
  const rejected = mergeApplicationBuckets(outcomeValues, 10)
    .filter((item) => item.label === "Fick ej bostad" || item.label === "false")
    .reduce((sum, item) => sum + item.value, 0);

  if (total === 0 && schoolData.length === 0 && queueData.length === 0) {
    return <EmptyState message="Ingen ansökningsdemografi för perioden." />;
  }

  return (
    <div className="grid h-full min-h-0 gap-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <SummaryMetric label="Terminala ansökningar" value={total} />
        <SummaryMetric label="Accepterade" value={accepted} />
        <SummaryMetric label="Nekade" value={rejected} />
      </div>
      <div className="grid min-h-0 gap-4 xl:grid-cols-3">
        <div className="rounded-xl border border-gray-100 bg-white p-4">
          <h3 className="mb-2 text-sm font-semibold text-gray-900">Skolor</h3>
          <HorizontalBars data={schoolData} />
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4">
          <h3 className="mb-2 text-sm font-semibold text-gray-900">Dagar i kö</h3>
          <HorizontalBars data={queueData} />
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4">
          <h3 className="mb-2 text-sm font-semibold text-gray-900">Maxhyra</h3>
          <HorizontalBars data={rentData} />
        </div>
      </div>
    </div>
  );
}

function ListingPortfolioChart({ rows }: { rows: ListingRow[] }) {
  if (rows.length === 0) return <EmptyState message="Ingen annonsdata för perioden." />;

  const data = rows.map((row) => ({
    ...row,
    shortTitle: row.title.length > 16 ? `${row.title.slice(0, 15)}...` : row.title,
  }));

  return (
    <div className="h-full min-h-[280px] min-w-0">
      <ResponsiveContainer>
        <ComposedChart data={data} margin={{ left: 4, right: 18, top: 8 }}>
          <CartesianGrid stroke="#edf0f4" vertical={false} />
          <XAxis
            dataKey="shortTitle"
            interval={0}
            tick={{ fill: "#6b7280", fontSize: 11 }}
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
            }}
            formatter={(value, name) => [
              name === "topShare" ? formatPercent(Number(value)) : formatNumber(Number(value)),
              name === "topShare" ? "Andel toppsegment" : "Visningar",
            ]}
            labelFormatter={(_, payload: any[]) => payload?.[0]?.payload?.title ?? ""}
          />
          <Bar
            dataKey="totalViews"
            fill="#004225"
            name="Visningar"
            radius={[8, 8, 0, 0]}
            yAxisId="views"
          />
          <Line
            dataKey="topShare"
            dot={{ r: 3 }}
            name="Andel toppsegment"
            stroke="#e11d48"
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
}: {
  label: string;
  value: number;
  helper?: string;
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-3">
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className="mt-1 text-xl font-semibold text-gray-950">
        {formatNumber(value)}
      </p>
      {helper ? (
        <p className="mt-1 truncate text-xs text-gray-500">{helper}</p>
      ) : null}
    </div>
  );
}

function ListingPortfolioSummary({ summary }: { summary: PortfolioSummary }) {
  const hasData = summary.totalViews > 0 || summary.rows.length > 0;

  if (!hasData) {
    return <EmptyState message="Ingen annonsdata för perioden." />;
  }

  return (
    <div className="grid h-full min-h-0 gap-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <SummaryMetric label="Totala visningar" value={summary.totalViews} />
        <SummaryMetric label="Snabbvisningar" value={summary.quickViews} />
        <SummaryMetric label="Detaljvisningar" value={summary.detailedViews} />
        <SummaryMetric label="Favoriter" value={summary.likes} />
        <SummaryMetric
          helper="Med minst en visning"
          label="Aktiva annonser"
          value={summary.listingsWithViews}
        />
      </div>

      <div className="grid min-h-0 gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,0.8fr)]">
        <div className="rounded-xl border border-gray-100 bg-white p-4">
          <div className="mb-2 flex items-baseline justify-between gap-3">
            <h3 className="text-sm font-semibold text-gray-900">
              Toppannonser
            </h3>
            <span className="text-xs text-gray-500">Visningar och toppsegment</span>
          </div>
          <ListingPortfolioChart rows={summary.rows} />
        </div>

        <div className="grid gap-4">
          <div className="rounded-xl border border-gray-100 bg-white p-4">
            <h3 className="mb-2 text-sm font-semibold text-gray-900">Enheter</h3>
            <PieDistribution data={summary.deviceData} />
          </div>
          <div className="rounded-xl border border-gray-100 bg-white p-4">
            <h3 className="mb-2 text-sm font-semibold text-gray-900">Städer</h3>
            <HorizontalBars data={summary.cityData} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function CompanyDemographyBlock() {
  const { user, isLoading: authLoading } = useAuth();
  const companyId = getActiveCompanyId(user);
  const [range, setRange] = React.useState<ApplicationIntervalValue>("1m");
  const [category, setCategory] =
    React.useState<CompanyDemographyCategory>("VIEW_TYPE");
  const [demography, setDemography] = React.useState<CompanyDemography | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (authLoading) return;

    if (!companyId) {
      setError("Kunde inte hitta ett aktivt företag.");
      return;
    }

    const { from, to } = getApplicationIntervalRange(range);
    let cancelled = false;

    setIsLoading(true);
    setError(null);

    demographicsService
      .getCompany(companyId, from, to, category)
      .then((result) => {
        if (!cancelled) setDemography(result);
      })
      .catch((requestError) => {
        if (!cancelled) {
          setDemography(null);
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Kunde inte hämta företagsdemografi."
          );
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [authLoading, category, companyId, range]);

  return (
    <AnalyticsBlock
      action={
        <div className="flex max-w-full flex-col gap-2 sm:flex-row">
          <CategorySelect
            categories={COMPANY_DEMOGRAPHY_CATEGORIES}
            onChange={setCategory}
            value={category}
          />
          <ApplicationIntervalToggle onChange={setRange} value={range} />
        </div>
      }
      size="2x2"
      title="Företagsprofil"
      description="Besökare uppdelade efter vald kategori."
    >
      {authLoading || isLoading ? (
        <BlockSkeleton />
      ) : error ? (
        <ErrorState message={error} />
      ) : category === "GENDER" || category === "VIEW_TYPE" || category === "DEVICE_TYPE" ? (
        <PieDistribution data={bucketsToData(demography)} />
      ) : (
        <HorizontalBars data={bucketsToData(demography)} />
      )}
    </AnalyticsBlock>
  );
}

export function CompanyDemographyBatchBlock() {
  const { user, isLoading: authLoading } = useAuth();
  const companyId = getActiveCompanyId(user);
  const [range, setRange] = React.useState<ApplicationIntervalValue>("1m");
  const [data, setData] = React.useState<Array<{ category: string; value: number }>>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (authLoading) return;

    if (!companyId) {
      setError("Kunde inte hitta ett aktivt företag.");
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
            category: labels[category] ?? category,
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
              : "Kunde inte hämta batchdemografi."
          );
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [authLoading, companyId, range]);

  return (
    <AnalyticsBlock
      action={<ApplicationIntervalToggle onChange={setRange} value={range} />}
      size="2x2"
      title="Demografi per kategori"
      description="Samlad bild av företagets besökare."
    >
      {authLoading || isLoading ? (
        <BlockSkeleton />
      ) : error ? (
        <ErrorState message={error} />
      ) : (
        <CategoryBars data={data} />
      )}
    </AnalyticsBlock>
  );
}

export function ListingDemographyBatchBlock() {
  const { user, isLoading: authLoading } = useAuth();
  const companyId = getActiveCompanyId(user);
  const [range, setRange] = React.useState<ApplicationIntervalValue>("1m");
  const [summary, setSummary] = React.useState<PortfolioSummary | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (authLoading) return;

    if (!companyId) {
      setError("Kunde inte hitta ett aktivt företag.");
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

      if (!cancelled) setSummary(buildPortfolioSummary(result, listings));
    }

    load()
      .catch((requestError) => {
        if (!cancelled) {
          setSummary(null);
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Kunde inte hämta annonsportfölj."
          );
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [authLoading, companyId, range]);

  return (
    <AnalyticsBlock
      action={<ApplicationIntervalToggle onChange={setRange} value={range} />}
      contentClassName="overflow-hidden p-4"
      size="4x4"
      title="Annonsportfölj"
      description="Summerad demografi för alla företagets annonser."
    >
      {authLoading || isLoading ? (
        <BlockSkeleton rows={4} />
      ) : error ? (
        <ErrorState message={error} />
      ) : summary ? (
        <ListingPortfolioSummary summary={summary} />
      ) : (
        <EmptyState message="Ingen annonsdata för perioden." />
      )}
    </AnalyticsBlock>
  );
}

export function ApplicationDemographyPortfolioBlock() {
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
      setError("Kunde inte hitta ett aktivt företag.");
      return;
    }

    const from = dateTimeLocalToIso(fromValue);
    const to = dateTimeLocalToIso(toValue);

    if (!from || !to) {
      setDemographies(null);
      setListingRows([]);
      setError("Välj giltiga datum för from och to.");
      return;
    }

    if (new Date(from).getTime() > new Date(to).getTime()) {
      setDemographies(null);
      setListingRows([]);
      setError("From måste vara tidigare än to.");
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
        setListingRows(mapApplicationListingRows(result, listings));
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
              : "Kunde inte hämta ansökningsdemografi."
          );
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [authLoading, category, companyId, fromValue, gotListing, toValue]);

  const bucketData = React.useMemo(
    () => mergeApplicationBuckets(Object.values(demographies ?? {}), 10),
    [demographies]
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
        <div className="flex max-w-full flex-col gap-2 lg:flex-row lg:flex-wrap lg:items-center">
          <Input
            aria-label="From"
            className="h-8 min-w-[180px] rounded-lg border-gray-200 bg-white text-xs shadow-[0_1px_2px_rgba(16,24,40,0.03)] lg:w-[190px]"
            onChange={(event) => setFromValue(event.target.value)}
            type="datetime-local"
            value={fromValue}
          />
          <Input
            aria-label="To"
            className="h-8 min-w-[180px] rounded-lg border-gray-200 bg-white text-xs shadow-[0_1px_2px_rgba(16,24,40,0.03)] lg:w-[190px]"
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
            <SelectTrigger className="h-8 w-full min-w-[150px] rounded-lg border-gray-200 bg-white text-xs shadow-[0_1px_2px_rgba(16,24,40,0.03)] sm:w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-gray-200 bg-white">
              {(Object.keys(gotListingLabels) as GotListingFilter[]).map((filter) => (
                <SelectItem key={filter} value={filter}>
                  {gotListingLabels[filter]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      }
      contentClassName="overflow-hidden p-4"
      size="3x4"
      title="Ansökningsdemografi"
      description="Batchdata från POST /demographics/applications/listings/query."
    >
      {authLoading || isLoading ? (
        <BlockSkeleton rows={3} />
      ) : error ? (
        <ErrorState message={error} />
      ) : demographies ? (
        <div className="grid h-full min-h-0 gap-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <SummaryMetric
              helper={labels[category] ?? category}
              label="Ansökningar"
              value={total}
            />
            <SummaryMetric label="Annonser i fråga" value={Object.keys(demographies).length} />
            <SummaryMetric
              helper={gotListingLabels[gotListing]}
              label="Annonser med data"
              value={listingRows.length}
            />
          </div>
          <div className="rounded-xl border border-gray-100 bg-white p-4">
            <h3 className="mb-2 text-sm font-semibold text-gray-900">
              {labels[category] ?? category}
            </h3>
            <HorizontalBars data={bucketData} valueLabel="Ansökningar" />
          </div>
          <div className="rounded-xl border border-gray-100 bg-white p-4">
            <h3 className="mb-2 text-sm font-semibold text-gray-900">
              Ansökningar per annons
            </h3>
            <CategoryBars data={listingChartData} valueLabel="Ansökningar" />
          </div>
        </div>
      ) : (
        <EmptyState message="Ingen ansökningsdemografi för perioden." />
      )}
    </AnalyticsBlock>
  );
}

export function ListingDemographyDrilldownBlock() {
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
              : "Kunde inte hämta annonsdemografi."
          );
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [authLoading, category, companyId, listingId, range]);

  return (
    <AnalyticsBlock
      action={
        <div className="flex max-w-full flex-col gap-2 sm:flex-row">
          <Select onValueChange={setListingId} value={listingId}>
            <SelectTrigger className="h-8 w-full min-w-[180px] rounded-lg border-gray-200 bg-white text-xs shadow-[0_1px_2px_rgba(16,24,40,0.03)] sm:w-[210px]">
              <SelectValue placeholder="Välj annons" />
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
      title="Annonsdetalj"
      description="Demografi för vald annons och period."
    >
      {authLoading || isLoading ? (
        <BlockSkeleton />
      ) : error ? (
        <ErrorState message={error} />
      ) : category === "GENDER" || category === "VIEW_TYPE" || category === "RESULTED_IN_LIKE" || category === "DEVICE_TYPE" ? (
        <PieDistribution data={bucketsToData(demography)} />
      ) : (
        <HorizontalBars data={bucketsToData(demography)} />
      )}
    </AnalyticsBlock>
  );
}
