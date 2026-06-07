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
import { useApplicationDemography } from "@/features/analytics/hooks/useDemographics";
import {
  APPLICATION_DEMOGRAPHY_CATEGORIES,
  type ApplicationDemography,
  type ApplicationDemographyCategory,
  type GotListingFilter,
} from "@/features/analytics/services/demographics-service";
import { useI18n } from "@/i18n/I18nProvider";
import type { Locale } from "@/i18n/config";
import { localizedText, numberLocale } from "@/i18n/text";

type ChartDatum = {
  label: string;
  value: number;
  share: number;
  fill: string;
};

// Palette mirrors the portfolio analytics blocks so listing-level
// application demographics share the same visual rhythm as the company-wide
// analytics page.
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
  SCHOOL: { sv: "Skola", en: "School" },
  PREFERRED_MAX_RENT: { sv: "Maxhyra", en: "Max rent" },
  DAYS_IN_QUEUE: { sv: "Dagar i kö", en: "Days in queue" },
  APPLICANT_OTHER_APPLICATIONS: { sv: "Andra ansökningar", en: "Other applications" },
  GOT_LISTING: { sv: "Utfall", en: "Outcome" },
  true: { sv: "Fick bostad", en: "Got housing" },
  false: { sv: "Fick ej bostad", en: "Did not get housing" },
};

const filterLabels: Record<GotListingFilter, { sv: string; en: string }> = {
  BOTH: { sv: "Alla utfall", en: "All outcomes" },
  ACCEPTED_ONLY: { sv: "Accepterade", en: "Accepted" },
  REJECTED_ONLY: { sv: "Nekade", en: "Rejected" },
};

function labelFor(locale: Locale, value: string) {
  const label = labels[value];
  return label ? localizedText(locale, label.sv, label.en) : value;
}

function filterLabelFor(locale: Locale, value: GotListingFilter) {
  const label = filterLabels[value];
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

function dateTimeLocalToIso(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return date.toISOString();
}

function keyLabel(value: unknown, locale: Locale) {
  if (value === null || value === undefined) return localizedText(locale, "Okänt", "Unknown");
  const raw = String(value).trim();
  return labels[raw] ? labelFor(locale, raw) : (raw || localizedText(locale, "Okänt", "Unknown"));
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

function toData(value: ApplicationDemography | null, locale: Locale): ChartDatum[] {
  const total = totalApplications(value);
  return (value?.buckets ?? [])
    .map((bucket, index) => {
      const count = Number(bucket.totalApplications ?? 0);
      return {
        label: keyLabel(bucket.key, locale),
        value: count,
        share: total > 0 ? (count / total) * 100 : 0,
        fill: colors[index % colors.length],
      };
    })
    .filter((item) => item.value > 0)
    .sort((left, right) => right.value - left.value);
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
              localizedText(locale, "Ansökningar", "Applications"),
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
            formatter={(value) => [formatNumber(Number(value), locale), localizedText(locale, "Ansökningar", "Applications")]}
          />
          <Bar dataKey="value" maxBarSize={18} radius={[4, 4, 0, 0]}>
            {data.map((entry) => (
              <Cell fill={entry.fill} key={entry.label} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function EmptyState({ locale }: { locale: Locale }) {
  return (
    <div className="flex min-h-[180px] items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50/50 px-4 text-center text-sm text-gray-500">
      {localizedText(locale, "Ingen ansökningsdemografi för perioden.", "No application demographics for this period.")}
    </div>
  );
}

/**
 * Compact swatch legend rendered below the chart. Same component shape as
 * the one in ListingDemographicsPanel — kept inline because both panels are
 * the only consumers and sharing would create a new export surface for one
 * call-site each.
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

function CategorySelect({
  value,
  onChange,
}: {
  value: ApplicationDemographyCategory;
  onChange: (value: ApplicationDemographyCategory) => void;
}) {
  const { locale } = useI18n();

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
            {labelFor(locale, category)}
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
  const { locale } = useI18n();
  const [fromValue, setFromValue] = React.useState(() => toDateTimeLocalValue(from));
  const [toValue, setToValue] = React.useState(() => toDateTimeLocalValue(to));
  const [category, setCategory] =
    React.useState<ApplicationDemographyCategory>("GOT_LISTING");
  const [gotListing, setGotListing] = React.useState<GotListingFilter>("BOTH");
  const fromIso = React.useMemo(() => dateTimeLocalToIso(fromValue), [fromValue]);
  const toIso = React.useMemo(() => dateTimeLocalToIso(toValue), [toValue]);
  const dateError = React.useMemo(() => {
    if (!fromIso || !toIso) {
      return "Välj giltiga datum för from och to.";
    }

    if (new Date(fromIso).getTime() > new Date(toIso).getTime()) {
      return "From måste vara tidigare än to.";
    }

    return null;
  }, [fromIso, locale, toIso]);
  const applicationQuery = useApplicationDemography(
    listingId,
    fromIso ?? "",
    toIso ?? "",
    category,
    gotListing,
    !dateError
  );
  const data = applicationQuery.data ?? null;
  const error =
    dateError ??
    (applicationQuery.isError
      ? applicationQuery.error instanceof Error
        ? applicationQuery.error.message
        : "Kunde inte hämta ansökningsdemografi."
      : null);

  React.useEffect(() => {
    setFromValue(toDateTimeLocalValue(from));
    setToValue(toDateTimeLocalValue(to));
  }, [from, to]);

  const chartData = React.useMemo(() => toData(data, locale), [data, locale]);
  const total = totalApplications(data);
  const top = chartData[0];

  if (applicationQuery.isLoading) {
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
            {localizedText(locale, "Ansökningsdemografi", "Application demographics")}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {localizedText(locale, "Data från GET /demographics/applications/listing för vald annons.", "Data from GET /demographics/applications/listing for the selected listing.")}
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 xl:flex xl:flex-wrap xl:justify-end">
          <Input
            aria-label={localizedText(locale, "Från", "From")}
            className="h-9 rounded-lg border-gray-200 bg-white text-sm xl:w-[190px]"
            onChange={(event) => setFromValue(event.target.value)}
            type="datetime-local"
            value={fromValue}
          />
          <Input
            aria-label={localizedText(locale, "Till", "To")}
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
                  {filterLabelFor(locale, filter)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <SummaryCard
          icon={<BadgeCheck className="h-4 w-4" />}
          label={labelFor(locale, category)}
          value={formatNumber(total, locale)}
          helper={localizedText(locale, "Ansökningar i urvalet", "Applications in the selection")}
        />
        <SummaryCard
          icon={<GraduationCap className="h-4 w-4" />}
          label={localizedText(locale, "Toppsegment", "Top segment")}
          value={top?.label ?? localizedText(locale, "Saknas", "Missing")}
          helper={top ? `${formatNumber(top.value, locale)} (${formatPercent(top.share, locale)})` : localizedText(locale, "Ingen data", "No data")}
        />
        <SummaryCard
          icon={<WalletCards className="h-4 w-4" />}
          label={filterLabelFor(locale, gotListing)}
          value={formatNumber(total, locale)}
          helper={localizedText(locale, "Vald utfallstyp", "Selected outcome type")}
        />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
          <h3 className="mb-2 text-sm font-semibold text-gray-900">
            {labelFor(locale, category)}
          </h3>
          {category === "GENDER" || category === "GOT_LISTING" ? (
            <MiniPie data={chartData} locale={locale} />
          ) : (
            <MiniBars data={chartData} locale={locale} />
          )}
          <ChartLegend
            data={chartData}
            limit={category === "GENDER" || category === "GOT_LISTING" ? undefined : 6}
            locale={locale}
          />
        </div>
        <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-4 shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
          <h3 className="text-sm font-semibold text-gray-900">{localizedText(locale, "Sammanfattning", "Summary")}</h3>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-gray-500">{localizedText(locale, "Ansökningar", "Applications")}</dt>
              <dd className="font-semibold text-gray-950">{formatNumber(total, locale)}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-gray-500">{localizedText(locale, "Toppsegment", "Top segment")}</dt>
              <dd className="truncate font-semibold text-gray-950">
                {top?.label ?? localizedText(locale, "Saknas", "Missing")}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-gray-500">{localizedText(locale, "Andel", "Share")}</dt>
              <dd className="font-semibold text-gray-950">
                {top ? formatPercent(top.share, locale) : "0%"}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
