"use client";

import * as React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BadgeCheck, GraduationCap, WalletCards } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  APPLICATION_DEMOGRAPHY_CATEGORIES,
  demographicsService,
  type ApplicationDemography,
  type ApplicationDemographyCategory,
  type GotListingFilter,
} from "@/features/analytics/services/demographics-service";

type ChartDatum = {
  label: string;
  value: number;
  share: number;
  fill: string;
};

const colors = ["#004225", "#2563eb", "#e11d48", "#d97706", "#0891b2", "#64748b"];

const labels: Record<string, string> = {
  GENDER: "Kön",
  AGE: "Ålder",
  SCHOOL: "Skola",
  PREFERRED_MAX_RENT: "Maxhyra",
  DAYS_IN_QUEUE: "Dagar i kö",
  APPLICANT_OTHER_APPLICATIONS: "Andra ansökningar",
  GOT_LISTING: "Utfall",
  true: "Fick bostad",
  false: "Fick ej bostad",
};

const filterLabels: Record<GotListingFilter, string> = {
  BOTH: "Alla utfall",
  ACCEPTED_ONLY: "Accepterade",
  REJECTED_ONLY: "Nekade",
};

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

function dateTimeLocalToIso(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return date.toISOString();
}

function keyLabel(value: unknown) {
  if (value === null || value === undefined) return "Okänt";
  const raw = String(value).trim();
  return labels[raw] ?? (raw || "Okänt");
}

function totalApplications(value: ApplicationDemography | null) {
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

function toData(value: ApplicationDemography | null): ChartDatum[] {
  const total = totalApplications(value);
  return (value?.buckets ?? [])
    .map((bucket, index) => {
      const count = Number(bucket.totalApplications ?? 0);
      return {
        label: keyLabel(bucket.key),
        value: count,
        share: total > 0 ? (count / total) * 100 : 0,
        fill: colors[index % colors.length],
      };
    })
    .filter((item) => item.value > 0)
    .sort((left, right) => right.value - left.value);
}

function MiniPie({ data }: { data: ChartDatum[] }) {
  if (data.length === 0) return <EmptyState />;

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
              `${formatNumber(Number(value))} (${formatPercent(item.payload.share)})`,
              "Ansökningar",
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

function MiniBars({ data }: { data: ChartDatum[] }) {
  if (data.length === 0) return <EmptyState />;

  return (
    <div className="h-[210px] min-w-0">
      <ResponsiveContainer>
        <BarChart data={data.slice(0, 6)} margin={{ left: 4, right: 10 }}>
          <CartesianGrid stroke="#edf0f4" vertical={false} />
          <XAxis dataKey="label" tick={{ fill: "#6b7280", fontSize: 11 }} tickLine={false} />
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
            formatter={(value) => [formatNumber(Number(value)), "Ansökningar"]}
          />
          <Bar dataKey="value" radius={[8, 8, 0, 0]}>
            {data.map((entry) => (
              <Cell fill={entry.fill} key={entry.label} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex min-h-[180px] items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50/50 px-4 text-center text-sm text-gray-500">
      Ingen ansökningsdemografi för perioden.
    </div>
  );
}

function CategorySelect({
  value,
  onChange,
}: {
  value: ApplicationDemographyCategory;
  onChange: (value: ApplicationDemographyCategory) => void;
}) {
  return (
    <Select
      onValueChange={(next) => onChange(next as ApplicationDemographyCategory)}
      value={value}
    >
      <SelectTrigger className="h-9 w-full rounded-lg border-gray-200 bg-white text-sm sm:w-[190px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="border-gray-200 bg-white">
        {APPLICATION_DEMOGRAPHY_CATEGORIES.map((category) => (
          <SelectItem key={category} value={category}>
            {labels[category] ?? category}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  helper,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  helper?: string;
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-4 shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-gray-500">{label}</p>
          <p className="mt-1 truncate text-2xl font-semibold text-gray-950">
            {value}
          </p>
        </div>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#004225] shadow-sm">
          {icon}
        </span>
      </div>
      <p className="mt-2 truncate text-xs text-gray-500">
        {helper ?? " "}
      </p>
    </div>
  );
}

export default function ApplicationDemographicsPanel({
  listingId,
  from,
  to,
}: {
  listingId: string;
  from: Date;
  to: Date;
  periodLabel?: string;
}) {
  const [fromValue, setFromValue] = React.useState(() => toDateTimeLocalValue(from));
  const [toValue, setToValue] = React.useState(() => toDateTimeLocalValue(to));
  const [category, setCategory] =
    React.useState<ApplicationDemographyCategory>("GOT_LISTING");
  const [gotListing, setGotListing] = React.useState<GotListingFilter>("BOTH");
  const [data, setData] = React.useState<ApplicationDemography | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setFromValue(toDateTimeLocalValue(from));
    setToValue(toDateTimeLocalValue(to));
  }, [from, to]);

  React.useEffect(() => {
    const fromIso = dateTimeLocalToIso(fromValue);
    const toIso = dateTimeLocalToIso(toValue);

    if (!fromIso || !toIso) {
      setData(null);
      setError("Välj giltiga datum för from och to.");
      return;
    }

    if (new Date(fromIso).getTime() > new Date(toIso).getTime()) {
      setData(null);
      setError("From måste vara tidigare än to.");
      return;
    }

    let cancelled = false;

    setIsLoading(true);
    setError(null);

    demographicsService
      .getApplication(listingId, fromIso, toIso, category, gotListing)
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((requestError) => {
        if (cancelled) return;
        setData(null);
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Kunde inte hämta ansökningsdemografi."
        );
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [category, fromValue, gotListing, listingId, toValue]);

  const chartData = React.useMemo(() => toData(data), [data]);
  const total = totalApplications(data);
  const top = chartData[0];

  if (isLoading) {
    return (
      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <Skeleton className="h-6 w-52" />
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-[240px] rounded-xl" />
          <Skeleton className="h-[240px] rounded-xl" />
          <Skeleton className="h-[240px] rounded-xl" />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="rounded-xl border border-error-500/20 bg-error-50 p-5 text-sm text-error-700">
        {error}
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-theme-xs">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-950">
            Ansökningsdemografi
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Data från GET /demographics/applications/listing för vald annons.
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 xl:flex xl:flex-wrap xl:justify-end">
          <Input
            aria-label="From"
            className="h-9 rounded-lg border-gray-200 bg-white text-sm xl:w-[190px]"
            onChange={(event) => setFromValue(event.target.value)}
            type="datetime-local"
            value={fromValue}
          />
          <Input
            aria-label="To"
            className="h-9 rounded-lg border-gray-200 bg-white text-sm xl:w-[190px]"
            onChange={(event) => setToValue(event.target.value)}
            type="datetime-local"
            value={toValue}
          />
          <CategorySelect onChange={setCategory} value={category} />
          <Select
            onValueChange={(value) => setGotListing(value as GotListingFilter)}
            value={gotListing}
          >
            <SelectTrigger className="h-9 w-full rounded-lg border-gray-200 bg-white text-sm sm:w-[170px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-gray-200 bg-white">
              {(Object.keys(filterLabels) as GotListingFilter[]).map((filter) => (
                <SelectItem key={filter} value={filter}>
                  {filterLabels[filter]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <SummaryCard
          icon={<BadgeCheck className="h-4 w-4" />}
          label={labels[category] ?? category}
          value={formatNumber(total)}
          helper="Ansökningar i urvalet"
        />
        <SummaryCard
          icon={<GraduationCap className="h-4 w-4" />}
          label="Toppsegment"
          value={top?.label ?? "Saknas"}
          helper={top ? `${formatNumber(top.value)} (${formatPercent(top.share)})` : "Ingen data"}
        />
        <SummaryCard
          icon={<WalletCards className="h-4 w-4" />}
          label={filterLabels[gotListing]}
          value={formatNumber(total)}
          helper="Vald utfallstyp"
        />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
          <h3 className="mb-2 text-sm font-semibold text-gray-900">
            {labels[category] ?? category}
          </h3>
          {category === "GENDER" || category === "GOT_LISTING" ? (
            <MiniPie data={chartData} />
          ) : (
            <MiniBars data={chartData} />
          )}
        </div>
        <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-4 shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
          <h3 className="text-sm font-semibold text-gray-900">Sammanfattning</h3>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-gray-500">Ansökningar</dt>
              <dd className="font-semibold text-gray-950">{formatNumber(total)}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-gray-500">Toppsegment</dt>
              <dd className="truncate font-semibold text-gray-950">
                {top?.label ?? "Saknas"}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-gray-500">Andel</dt>
              <dd className="font-semibold text-gray-950">
                {top ? formatPercent(top.share) : "0%"}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
