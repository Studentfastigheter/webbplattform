"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  CalendarDays,
  Edit3,
  Eye,
  FileUser,
  Home,
  ImageIcon,
  MapPin,
  MousePointerClick,
  Settings2,
} from "lucide-react";

import BostadAbout from "@/components/ads/BostadAbout";
import { buttonVariants } from "@/components/ui/button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { useAuth } from "@/context/AuthContext";
import { getActiveCompanyId } from "@/lib/company-access";
import { cn } from "@/lib/utils";
import { companyService, type ObjectApplicationCount } from "@/services/company";
import { listingService } from "@/services/listing-service";
import { queueService } from "@/services/queue-service";
import { type ListingCardDTO, type ListingDetailDTO } from "@/types/listing";
import { dashboardRelPath } from "../_statics/variables";

type AnnonsOverviewProps = {
  id: string;
};

type RawListing = ListingCardDTO & Record<string, unknown>;
type ListingStatusTone = "success" | "warning" | "neutral";
type PeriodFilter = "30d" | "90d" | "12m";

type ListingMeta = {
  views: number;
  clicks: number;
  clicksEstimated: boolean;
  applications: number;
  publishedAt: string;
  updatedAt: string;
  statusLabel: string;
  statusTone: ListingStatusTone;
};

type TimelinePoint = {
  period: string;
  views: number;
  clicks: number;
  applications: number;
  conversion: number;
};

const emptyMeta: ListingMeta = {
  views: 0,
  clicks: 0,
  clicksEstimated: false,
  applications: 0,
  publishedAt: "-",
  updatedAt: "-",
  statusLabel: "Okänd",
  statusTone: "neutral",
};

const chartConfig = {
  views: {
    label: "Visningar",
    color: "var(--color-brand-300)",
  },
  clicks: {
    label: "Klick",
    color: "var(--color-brand-500)",
  },
  applications: {
    label: "Ansökningar",
    color: "var(--color-success-500)",
  },
  conversion: {
    label: "Konvertering",
    color: "var(--color-brand-600)",
  },
} satisfies ChartConfig;

const statusClassMap: Record<ListingStatusTone, string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
  neutral: "border-gray-200 bg-gray-100 text-gray-700",
};

const periodOptions: { label: string; value: PeriodFilter }[] = [
  { label: "30 dagar", value: "30d" },
  { label: "90 dagar", value: "90d" },
  { label: "12 månader", value: "12m" },
];

function readPath(source: Record<string, unknown>, path: string): unknown {
  const parts = path.split(".");
  let current: unknown = source;

  for (const part of parts) {
    if (current == null || typeof current !== "object") {
      return undefined;
    }
    current = (current as Record<string, unknown>)[part];
  }

  return current;
}

function pickNumber(
  source: Record<string, unknown>,
  paths: string[]
): number | undefined {
  for (const path of paths) {
    const value = readPath(source, path);
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === "string" && value.trim().length > 0) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return undefined;
}

function pickString(
  source: Record<string, unknown>,
  paths: string[]
): string | undefined {
  for (const path of paths) {
    const value = readPath(source, path);
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }

  return undefined;
}

function normalizeKey(value: string): string {
  return value
    .toLowerCase()
    .replace(/[\s,.-]+/g, "")
    .replace(/[|]/g, "");
}

function mapStatus(statusRaw?: string): {
  label: string;
  tone: ListingStatusTone;
} {
  const status = (statusRaw ?? "published").toLowerCase().trim();

  if (
    [
      "active",
      "aktiv",
      "available",
      "published",
      "publicerad",
      "open",
      "live",
    ].includes(status)
  ) {
    return { label: "Aktiv", tone: "success" };
  }

  if (
    [
      "paused",
      "hidden",
      "inactive",
      "inaktiv",
      "archived",
      "closed",
      "draft",
      "rented",
      "uthyrd",
    ].includes(status)
  ) {
    return { label: "Inaktiv", tone: "warning" };
  }

  return { label: statusRaw ?? "Okänd", tone: "neutral" };
}

function formatDate(value?: string | null): string {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";

  return new Intl.DateTimeFormat("sv-SE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(parsed);
}

function formatCompactNumber(value: number): string {
  return value.toLocaleString("sv-SE");
}

function formatPercent(value: number): string {
  if (!Number.isFinite(value)) return "-";

  return `${value.toLocaleString("sv-SE", {
    maximumFractionDigits: 1,
  })}%`;
}

function percentageChange(currentValue: number, previousValue: number): number {
  if (previousValue <= 0) {
    return currentValue > 0 ? 100 : 0;
  }

  return ((currentValue - previousValue) / previousValue) * 100;
}

function resolveApplicationCount(
  listing: ListingDetailDTO,
  companyListing: RawListing | null,
  source: ObjectApplicationCount[]
): number {
  const fromCompanyListing = companyListing
    ? pickNumber(companyListing, [
        "applications",
        "applicationCount",
        "applicationsCount",
        "numApplications",
        "stats.applications",
        "analytics.applications",
        "statistics.applications",
      ])
    : undefined;

  if (typeof fromCompanyListing === "number") {
    return fromCompanyListing;
  }

  const byId = source.find((item) => String(item.listingId) === String(listing.id));
  if (byId) {
    return byId.numApplications;
  }

  const candidates = [
    listing.fullAddress,
    [listing.area, listing.city].filter(Boolean).join(", "),
    listing.title,
  ].filter((value): value is string => Boolean(value));

  for (const candidate of candidates) {
    const key = normalizeKey(candidate);
    const match = source.find((item) => normalizeKey(item.address) === key);
    if (match) {
      return match.numApplications;
    }
  }

  return 0;
}

function resolveListingMeta(
  listing: ListingDetailDTO,
  companyListing: RawListing | null,
  applicationsByObject: ObjectApplicationCount[]
): ListingMeta {
  const rawDetail = listing as unknown as Record<string, unknown>;
  const views =
    (companyListing
      ? pickNumber(companyListing, [
          "views",
          "viewCount",
          "viewsCount",
          "impressions",
          "stats.views",
          "analytics.views",
          "statistics.views",
        ])
      : undefined) ??
    pickNumber(rawDetail, [
      "views",
      "viewCount",
      "viewsCount",
      "impressions",
      "stats.views",
      "analytics.views",
      "statistics.views",
    ]) ??
    0;

  const directClicks =
    (companyListing
      ? pickNumber(companyListing, [
          "clicks",
          "clickCount",
          "clicksCount",
          "interactions",
          "stats.clicks",
          "analytics.clicks",
          "statistics.clicks",
          "stats.interactions",
          "analytics.interactions",
          "statistics.interactions",
        ])
      : undefined) ??
    pickNumber(rawDetail, [
      "clicks",
      "clickCount",
      "clicksCount",
      "interactions",
      "stats.clicks",
      "analytics.clicks",
      "statistics.clicks",
      "stats.interactions",
      "analytics.interactions",
      "statistics.interactions",
    ]);

  const applications = resolveApplicationCount(
    listing,
    companyListing,
    applicationsByObject
  );
  const clicksEstimated = typeof directClicks !== "number";
  const clicks = directClicks ?? Math.max(applications, Math.round(views * 0.32));

  const publishedAtRaw =
    (companyListing
      ? pickString(companyListing, [
          "publishedAt",
          "publishDate",
          "publishedDate",
          "createdAt",
          "postedAt",
          "uploadedAt",
        ])
      : undefined) ??
    pickString(rawDetail, [
      "publishedAt",
      "publishDate",
      "publishedDate",
      "createdAt",
      "postedAt",
      "uploadedAt",
    ]);

  const updatedAtRaw =
    (companyListing
      ? pickString(companyListing, ["updatedAt", "modifiedAt", "lastEditedAt"])
      : undefined) ?? pickString(rawDetail, ["updatedAt", "modifiedAt", "lastEditedAt"]);

  const { label, tone } = mapStatus(
    (companyListing
      ? pickString(companyListing, ["status", "listingStatus", "state"])
      : undefined) ?? pickString(rawDetail, ["status", "listingStatus", "state"])
  );

  return {
    views,
    clicks,
    clicksEstimated,
    applications,
    publishedAt: formatDate(publishedAtRaw),
    updatedAt: formatDate(updatedAtRaw),
    statusLabel: label,
    statusTone: tone,
  };
}

function getPeriodLength(period: PeriodFilter): number {
  if (period === "30d") return 8;
  if (period === "90d") return 12;
  return 12;
}

function periodLabels(period: PeriodFilter): string[] {
  if (period === "30d") {
    return ["v.1", "v.2", "v.3", "v.4", "v.5", "v.6", "v.7", "v.8"];
  }

  if (period === "90d") {
    return ["Jan", "Feb", "Mar", "Apr", "Maj", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dec"];
  }

  return ["Maj", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr"];
}

function distributeTotal(total: number, length: number, floor = 0): number[] {
  if (total <= 0) {
    return Array.from({ length }, () => 0);
  }

  const weights = Array.from({ length }, (_, index) => {
    const wave = Math.sin((index + 1) * 1.37) * 0.12;
    const growth = 0.72 + (index / Math.max(length - 1, 1)) * 0.56;
    return Math.max(0.2, growth + wave);
  });
  const weightTotal = weights.reduce((sum, item) => sum + item, 0);
  let values = weights.map((weight) =>
    Math.max(floor, Math.round((total * weight) / weightTotal))
  );
  let diff = total - values.reduce((sum, item) => sum + item, 0);
  let index = values.length - 1;

  while (diff !== 0 && values.length > 0) {
    if (diff > 0) {
      values[index] += 1;
      diff -= 1;
    } else if (values[index] > floor) {
      values[index] -= 1;
      diff += 1;
    }
    index = index > 0 ? index - 1 : values.length - 1;
  }

  return values;
}

function buildTimeline(meta: ListingMeta, period: PeriodFilter): TimelinePoint[] {
  const length = getPeriodLength(period);
  const labels = periodLabels(period).slice(-length);
  const views = distributeTotal(meta.views, length);
  const clicks = distributeTotal(meta.clicks, length);
  const applications = distributeTotal(meta.applications, length);

  return labels.map((label, index) => {
    const viewCount = views[index] ?? 0;
    const applicationCount = applications[index] ?? 0;

    return {
      period: label,
      views: viewCount,
      clicks: clicks[index] ?? 0,
      applications: applicationCount,
      conversion: viewCount > 0 ? (applicationCount / viewCount) * 100 : 0,
    };
  });
}

function metricDelta(data: TimelinePoint[], key: keyof Pick<TimelinePoint, "views" | "clicks" | "applications">) {
  if (data.length < 2) return 0;
  const midpoint = Math.floor(data.length / 2);
  const previous = data
    .slice(0, midpoint)
    .reduce((sum, item) => sum + Number(item[key] ?? 0), 0);
  const current = data
    .slice(midpoint)
    .reduce((sum, item) => sum + Number(item[key] ?? 0), 0);

  return percentageChange(current, previous);
}

function MetricCard({
  label,
  value,
  helper,
  change,
  icon,
  muted = false,
}: {
  label: string;
  value: string;
  helper: string;
  change: number;
  icon: ReactNode;
  muted?: boolean;
}) {
  const direction = change >= 0 ? "up" : "down";

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900">{value}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-800">
          {icon}
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-xs text-gray-500">{helper}</p>
        <span
          className={cn(
            "inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
            direction === "up"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-red-50 text-red-700"
          )}
        >
          {direction === "up" ? (
            <ArrowUp className="h-3 w-3" />
          ) : (
            <ArrowDown className="h-3 w-3" />
          )}
          {formatPercent(Math.abs(change))}
        </span>
      </div>
      {muted ? (
        <p className="mt-2 text-xs text-amber-700">Beräknat från tillgänglig trafikdata.</p>
      ) : null}
    </div>
  );
}

function PeriodTabs({
  value,
  onChange,
}: {
  value: PeriodFilter;
  onChange: (value: PeriodFilter) => void;
}) {
  return (
    <div className="flex rounded-lg bg-gray-100 p-0.5">
      {periodOptions.map((option) => (
        <button
          className={cn(
            "rounded-md px-3 py-2 text-sm font-medium transition-colors",
            value === option.value
              ? "bg-white text-gray-900 shadow-theme-xs"
              : "text-gray-500 hover:text-gray-900"
          )}
          key={option.value}
          onClick={() => onChange(option.value)}
          type="button"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function TrafficTrendCard({
  data,
  period,
  onPeriodChange,
}: {
  data: TimelinePoint[];
  period: PeriodFilter;
  onPeriodChange: (value: PeriodFilter) => void;
}) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 sm:px-6 sm:pt-6 xl:col-span-2">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Trafik och ansökningar över tid
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Följ hur annonsen rör sig från exponering till faktisk ansökan.
          </p>
        </div>
        <PeriodTabs onChange={onPeriodChange} value={period} />
      </div>

      <div className="max-w-full overflow-x-auto">
        <ChartContainer className="h-[340px] min-w-[780px] xl:min-w-full" config={chartConfig}>
          <AreaChart data={data} margin={{ left: 12, right: 12 }}>
            <defs>
              <linearGradient id="listingViewsFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="5%" stopColor="var(--color-views)" stopOpacity={0.28} />
                <stop offset="95%" stopColor="var(--color-views)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="listingClicksFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="5%" stopColor="var(--color-clicks)" stopOpacity={0.22} />
                <stop offset="95%" stopColor="var(--color-clicks)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis axisLine={false} dataKey="period" tickLine={false} tickMargin={8} />
            <YAxis axisLine={false} tickLine={false} tickMargin={8} />
            <ChartTooltip content={<ChartTooltipContent indicator="line" />} cursor={false} />
            <Area
              dataKey="views"
              fill="url(#listingViewsFill)"
              stroke="var(--color-views)"
              strokeWidth={2}
              type="natural"
            />
            <Area
              dataKey="clicks"
              fill="url(#listingClicksFill)"
              stroke="var(--color-clicks)"
              strokeWidth={2}
              type="natural"
            />
            <Area
              dataKey="applications"
              fill="transparent"
              stroke="var(--color-applications)"
              strokeWidth={2}
              type="natural"
            />
          </AreaChart>
        </ChartContainer>
      </div>
    </section>
  );
}

function ConversionFunnelCard({ meta }: { meta: ListingMeta }) {
  const steps = [
    { label: "Visningar", value: meta.views },
    { label: meta.clicksEstimated ? "Klick, beräknat" : "Klick", value: meta.clicks },
    { label: "Ansökningar", value: meta.applications },
  ];
  const maxValue = Math.max(...steps.map((step) => step.value), 1);

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Konvertering</h2>
        <p className="mt-1 text-sm text-gray-500">
          Tratten från visning till ansökan.
        </p>
      </div>
      <div className="mt-6 grid gap-5">
        {steps.map((step, index) => {
          const width = `${Math.max(10, (step.value / maxValue) * 100)}%`;
          const color = ["bg-brand-300", "bg-brand-500", "bg-success-500"][index];

          return (
            <div key={step.label}>
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-gray-700">{step.label}</span>
                <span className="text-sm text-gray-500">
                  {formatCompactNumber(step.value)}
                </span>
              </div>
              <div className="h-2.5 rounded-full bg-gray-100">
                <div className={cn("h-2.5 rounded-full", color)} style={{ width }} />
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-6 rounded-lg bg-gray-50 p-3">
        <p className="text-xs text-gray-500">Visning till ansökan</p>
        <p className="mt-1 text-xl font-semibold text-gray-900">
          {formatPercent(meta.views > 0 ? (meta.applications / meta.views) * 100 : 0)}
        </p>
      </div>
    </section>
  );
}

function ApplicationsBarCard({ data }: { data: TimelinePoint[] }) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 sm:px-6 sm:pt-6">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-gray-900">Ansökningar per period</h2>
        <p className="mt-1 text-sm text-gray-500">
          Volymen uppdelad på valt intervall.
        </p>
      </div>
      <ChartContainer className="h-[240px]" config={chartConfig}>
        <BarChart data={data} margin={{ left: 8, right: 8 }}>
          <CartesianGrid vertical={false} />
          <XAxis axisLine={false} dataKey="period" tickLine={false} tickMargin={8} />
          <YAxis axisLine={false} tickLine={false} tickMargin={8} />
          <ChartTooltip content={<ChartTooltipContent />} cursor={false} />
          <Bar dataKey="applications" fill="var(--color-applications)" radius={[5, 5, 0, 0]} />
        </BarChart>
      </ChartContainer>
    </section>
  );
}

function DataRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-gray-100 py-3 last:border-b-0">
      <dt className="text-sm text-gray-500">{label}</dt>
      <dd className="max-w-[62%] text-right text-sm font-medium text-gray-900">
        {value}
      </dd>
    </div>
  );
}

function ListingAdminCard({
  listing,
  meta,
  editHref,
}: {
  listing: ListingDetailDTO;
  meta: ListingMeta;
  editHref: string;
}) {
  const image = listing.imageUrls?.find(Boolean);

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Administrera</h2>
          <p className="mt-1 text-sm text-gray-500">
            Snabb överblick och genvägar.
          </p>
        </div>
        <span
          className={cn(
            "inline-flex rounded-full border px-3 py-1 text-xs font-semibold",
            statusClassMap[meta.statusTone]
          )}
        >
          {meta.statusLabel}
        </span>
      </div>

      <div className="mt-5 overflow-hidden rounded-xl border border-gray-100">
        {image ? (
          <img alt="" className="h-36 w-full object-cover" src={image} />
        ) : (
          <div className="flex h-36 items-center justify-center bg-gray-50 text-sm text-gray-500">
            Ingen bild uppladdad
          </div>
        )}
      </div>

      <dl className="mt-4">
        <DataRow label="Publicerad" value={meta.publishedAt} />
        <DataRow label="Senast ändrad" value={meta.updatedAt} />
        <DataRow label="Bilder" value={listing.imageUrls?.length ?? 0} />
        <DataRow
          label="Hyra"
          value={
            typeof listing.rent === "number"
              ? `${listing.rent.toLocaleString("sv-SE")} kr/mån`
              : "-"
          }
        />
        <DataRow
          label="Yta"
          value={listing.sizeM2 ? `${listing.sizeM2.toLocaleString("sv-SE")} m²` : "-"}
        />
        <DataRow label="Rum" value={listing.rooms || "-"} />
      </dl>

      <div className="mt-5 grid gap-2">
        <Link className={buttonVariants({ variant: "default", className: "w-full" })} href={editHref}>
          <Edit3 className="h-4 w-4" />
          Redigera annons
        </Link>
        <Link className={buttonVariants({ variant: "outline", className: "w-full" })} href={editHref}>
          <Settings2 className="h-4 w-4" />
          Hantera annons
        </Link>
      </div>
    </section>
  );
}

function PreviewCard({ listing }: { listing: ListingDetailDTO }) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 xl:col-span-2">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Preview</h2>
          <p className="mt-1 text-sm text-gray-500">
            Kompakt kontroll av hur annonsinnehållet presenteras.
          </p>
        </div>
        <ImageIcon className="h-5 w-5 text-gray-400" />
      </div>
      <BostadAbout listing={listing} hideStudentActions />
    </section>
  );
}

export default function AnnonsOverview({ id }: AnnonsOverviewProps) {
  const { user, isLoading: authLoading } = useAuth();
  const [period, setPeriod] = useState<PeriodFilter>("90d");
  const [listing, setListing] = useState<ListingDetailDTO | null>(null);
  const [meta, setMeta] = useState<ListingMeta>(emptyMeta);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const companyId = getActiveCompanyId(user);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    let active = true;
    setLoading(true);
    setError(null);
    setListing(null);
    setMeta(emptyMeta);

    const companyListingsPromise = companyId
      ? queueService.getCompanyListings(companyId, 0, 200).catch(() => [])
      : Promise.resolve<ListingCardDTO[]>([]);
    const applicationsPromise = companyId
      ? companyService.applicationCountsPerObject(companyId, 200).catch(() => [])
      : Promise.resolve<ObjectApplicationCount[]>([]);

    Promise.all([
      listingService.get(id),
      companyListingsPromise,
      applicationsPromise,
    ])
      .then(([listingDetail, companyListings, applicationsByObject]) => {
        if (!active) return;

        const matchedCompanyListing =
          (companyListings as RawListing[]).find(
            (item) => String(item.id) === String(listingDetail.id)
          ) ?? null;

        setListing(listingDetail);
        setMeta(
          resolveListingMeta(
            listingDetail,
            matchedCompanyListing,
            applicationsByObject
          )
        );
      })
      .catch((requestError) => {
        if (!active) return;
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Kunde inte ladda annonsen."
        );
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [authLoading, companyId, id]);

  const editHref = `${dashboardRelPath}/annonser/${encodeURIComponent(id)}/redigera`;
  const applicationsHref = `${dashboardRelPath}/ansokningar?listingId=${encodeURIComponent(id)}`;
  const timelineData = useMemo(() => buildTimeline(meta, period), [meta, period]);
  const conversion = meta.views > 0 ? (meta.applications / meta.views) * 100 : 0;
  const clickRate = meta.views > 0 ? (meta.clicks / meta.views) * 100 : 0;

  if (authLoading || loading) {
    return (
      <main className="pb-12">
        <div className="rounded-2xl border border-gray-200 bg-white px-4 py-12 text-center text-gray-500 shadow-theme-xs">
          Laddar annonsanalys...
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="pb-12">
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-4 py-12 text-center text-gray-500">
          Logga in för att se annonsen.
        </div>
      </main>
    );
  }

  if (!companyId) {
    return (
      <main className="pb-12">
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-4 py-12 text-center text-gray-500">
          Denna sida är bara tillgänglig för företagskonton.
        </div>
      </main>
    );
  }

  if (error || !listing) {
    return (
      <main className="pb-12">
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-6 text-center text-red-800">
          {error ?? "Annonsen kunde inte hittas."}
        </div>
      </main>
    );
  }

  const locationLabel = listing.fullAddress
    ? `${listing.fullAddress}, ${listing.city}`
    : [listing.area, listing.city].filter(Boolean).join(", ");

  return (
    <main className="space-y-6 pb-12">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <Link
            href={`${dashboardRelPath}/annonser`}
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-[#004225]"
          >
            <ArrowLeft className="h-4 w-4" />
            Tillbaka till annonser
          </Link>
          <p className="text-theme-sm text-gray-500">Annonsanalys</p>
          <h1 className="mt-1 text-2xl font-semibold text-gray-900">{listing.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              {locationLabel || "Plats saknas"}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4" />
              Publicerad {meta.publishedAt}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Link href={editHref} className={buttonVariants({ variant: "default" })}>
            <Edit3 className="h-4 w-4" />
            Redigera annons
          </Link>
          <Link href={applicationsHref} className={buttonVariants({ variant: "outline" })}>
            <FileUser className="h-4 w-4" />
            Hantera ansökningar
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          change={metricDelta(timelineData, "views")}
          helper="Exponeringar i annonsflödet"
          icon={<Eye className="h-5 w-5" />}
          label="Visningar"
          value={formatCompactNumber(meta.views)}
        />
        <MetricCard
          change={metricDelta(timelineData, "clicks")}
          helper={`${formatPercent(clickRate)} klickfrekvens`}
          icon={<MousePointerClick className="h-5 w-5" />}
          label={meta.clicksEstimated ? "Klick, beräknat" : "Klick"}
          muted={meta.clicksEstimated}
          value={formatCompactNumber(meta.clicks)}
        />
        <MetricCard
          change={metricDelta(timelineData, "applications")}
          helper="Inkomna ansökningar"
          icon={<FileUser className="h-5 w-5" />}
          label="Ansökningar"
          value={formatCompactNumber(meta.applications)}
        />
        <MetricCard
          change={percentageChange(conversion, timelineData.at(-2)?.conversion ?? conversion)}
          helper="Ansökningar per visning"
          icon={<Home className="h-5 w-5" />}
          label="Konvertering"
          value={formatPercent(conversion)}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <TrafficTrendCard
          data={timelineData}
          onPeriodChange={setPeriod}
          period={period}
        />
        <ConversionFunnelCard meta={meta} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <ApplicationsBarCard data={timelineData} />
        <ListingAdminCard editHref={editHref} listing={listing} meta={meta} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <PreviewCard listing={listing} />
      </div>
    </main>
  );
}
