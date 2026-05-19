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
import { AnalyticsBlock } from "@/components/analytics/AnalyticsBlocks";
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
  LISTING_DEMOGRAPHY_CATEGORIES,
  demographicsService,
  type CompanyDemography,
  type CompanyDemographyCategory,
  type DemographyCategory,
  type ListingDemography,
} from "@/services/demographics-service";
import { queueService } from "@/services/queue-service";
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
  QUICK: "Snabb",
  DETAILED: "Detalj",
  MOBILE: "Mobil",
  DESKTOP: "Desktop",
  true: "Favorit",
  false: "Ingen favorit",
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

function HorizontalBars({ data }: { data: BucketDatum[] }) {
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
            formatter={(value) => [formatNumber(Number(value)), "Visningar"]}
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
}: {
  data: Array<{ category: string; value: number }>;
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
            formatter={(value) => [formatNumber(Number(value)), "Visningar"]}
          />
          <Bar dataKey="value" fill="#004225" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
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
  const [category, setCategory] =
    React.useState<DemographyCategory>("VIEW_TYPE");
  const [rows, setRows] = React.useState<ListingRow[]>([]);
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
      const listings = await queueService.getAllCompanyListings(companyId!, 0, 200);
      const listingIds = listings.map((listing) => listing.id).filter(Boolean);
      const result =
        listingIds.length > 0
          ? await demographicsService.getListingsBatch(
              companyId!,
              listingIds,
              from,
              to,
              category
            )
          : {};

      if (!cancelled) setRows(mapListingRows(result, listings));
    }

    load()
      .catch((requestError) => {
        if (!cancelled) {
          setRows([]);
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Kunde inte hämta annonsbatch."
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
            categories={LISTING_DEMOGRAPHY_CATEGORIES}
            onChange={setCategory}
            value={category}
          />
          <ApplicationIntervalToggle onChange={setRange} value={range} />
        </div>
      }
      contentClassName="overflow-hidden"
      size="3x2"
      title="Annonsportfölj"
      description="Visningar och toppsegment per annons."
    >
      {authLoading || isLoading ? (
        <BlockSkeleton rows={3} />
      ) : error ? (
        <ErrorState message={error} />
      ) : (
        <ListingPortfolioChart rows={rows} />
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
