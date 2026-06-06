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
import { Heart, MousePointerClick, Smartphone } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useListingByAllCategoriesDemography } from "@/features/analytics/hooks/useDemographics";
import {
  type DemographyCategory,
  type ListingDemography,
} from "@/features/analytics/services/demographics-service";

type ChartDatum = {
  label: string;
  value: number;
  share: number;
  fill: string;
};

const colors = ["#004225", "#2563eb", "#e11d48", "#d97706", "#0891b2", "#64748b"];

const labels: Record<string, string> = {
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

function totalViews(value: ListingDemography | null) {
  if (!value) return 0;
  return (
    value.totalViews ??
    value.buckets?.reduce((sum, bucket) => sum + (bucket.totalViews ?? 0), 0) ??
    0
  );
}

function toData(value: ListingDemography | null): ChartDatum[] {
  const total = totalViews(value);
  return (value?.buckets ?? [])
    .map((bucket, index) => {
      const count = Number(bucket.totalViews ?? 0);
      return {
        label: keyLabel(bucket.key),
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

function EmptyState() {
  return (
    <div className="flex min-h-[180px] items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50/50 px-4 text-center text-sm text-gray-500">
      Ingen demografidata för den här annonsen ännu.
    </div>
  );
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
              "Visningar",
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
        <BarChart data={data.slice(0, 5)} margin={{ left: 4, right: 10 }}>
          <CartesianGrid stroke="#edf0f4" vertical={false} />
          <XAxis
            dataKey="label"
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

function StatCard({
  icon,
  label,
  data,
}: {
  icon: React.ReactNode;
  label: string;
  data: ListingDemography | null;
}) {
  const total = totalViews(data);
  const top = toData(data)[0];

  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-4 shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-gray-500">{label}</p>
          <p className="mt-1 text-2xl font-semibold text-gray-950">
            {formatNumber(total)}
          </p>
        </div>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#004225] shadow-sm">
          {icon}
        </span>
      </div>
      <p className="mt-2 truncate text-xs text-gray-500">
        {top ? `${top.label}: ${formatPercent(top.share)}` : "Inget toppsegment"}
      </p>
    </div>
  );
}

export default function ListingDemographicsPanel({
  listingId,
  from,
  to,
  periodLabel = "senaste 90 dagarna",
}: {
  listingId: string;
  from?: Date;
  to?: Date;
  periodLabel?: string;
}) {
  const fallbackRange = React.useMemo(() => getRange(), []);
  const fromValue = from ?? fallbackRange.from;
  const toValue = to ?? fallbackRange.to;
  const fromKey = fromValue.toISOString();
  const toKey = toValue.toISOString();
  const demographyQuery = useListingByAllCategoriesDemography(
    listingId,
    fromKey,
    toKey
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
      : "Kunde inte hämta annonsdemografi."
    : null;
  if (demographyQuery.isLoading) {
    return (
      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <Skeleton className="h-6 w-44" />
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
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
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-950">
            Demografi {periodLabel}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Annonsens visningar uppdelade på beteende, enhet, favorit och stad.
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard
          data={data.VIEW_TYPE}
          icon={<MousePointerClick className="h-4 w-4" />}
          label="Visningstyper"
        />
        <StatCard
          data={data.DEVICE_TYPE}
          icon={<Smartphone className="h-4 w-4" />}
          label="Enheter"
        />
        <StatCard
          data={data.RESULTED_IN_LIKE}
          icon={<Heart className="h-4 w-4" />}
          label="Favoritutfall"
        />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
          <h3 className="mb-2 text-sm font-semibold text-gray-900">Enheter</h3>
          <MiniPie data={toData(data.DEVICE_TYPE)} />
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
          <h3 className="mb-2 text-sm font-semibold text-gray-900">
            Visningstyp
          </h3>
          <MiniPie data={toData(data.VIEW_TYPE)} />
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
          <h3 className="mb-2 text-sm font-semibold text-gray-900">
            Städer
          </h3>
          <MiniBars data={toData(data.CITY)} />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
          <h3 className="mb-2 text-sm font-semibold text-gray-900">Skolor</h3>
          <MiniBars data={toData(data.SCHOOL)} />
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
          <h3 className="mb-2 text-sm font-semibold text-gray-900">Ålder</h3>
          <MiniBars data={toData(data.AGE)} />
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
          <h3 className="mb-2 text-sm font-semibold text-gray-900">Kön</h3>
          <MiniPie data={toData(data.GENDER)} />
        </div>
      </div>
    </section>
  );
}
