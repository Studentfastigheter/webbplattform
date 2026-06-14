"use client";

import * as React from "react";
import Link from "next/link";
import {
  CalendarDays,
  Check,
  CheckCircle,
  Clock3,
  ExternalLink,
  FileUser,
  GraduationCap,
  Home,
  Mail,
  MapPin,
  Percent,
  Search,
  SlidersHorizontal,
  UserCircle,
} from "@/components/icons";
import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCompanyApplicationOutcomeCounts,
  useCompanyApplicationStatusCounts,
  useCompanyApplications,
  useHandleCompanyApplication,
} from "@/features/companies/hooks/useCompanies";
import {
  APPLICATION_STATUS_VALUES,
  type AnalyticsCountBucket,
  type ApplicationStatus,
  type NewApplication,
} from "@/features/companies/services/company-service";
import { useAuth } from "@/context/AuthContext";
import type { Locale } from "@/i18n/config";
import { useI18n } from "@/i18n/I18nProvider";
import { localizedText, numberLocale } from "@/i18n/text";
import { getActiveCompanyId } from "@/lib/company-access";
import { cn } from "@/lib/utils";
import {
  PortalGrid,
  PortalGridItem,
  PortalPage,
  PortalSurface,
} from "../_components/shared/PortalGrid";
import PortalPageHeader from "../_components/shared/PortalPageHeader";
import { dashboardRelPath } from "../_statics/variables";

type ApplicationsViewProps = {
  listingId?: string | null;
};

type PortalApplication = NewApplication & {
  listingName: string;
  submittedAtTime: number;
};

type HandleApplicationStatusChange = (
  application: PortalApplication,
  status: ApplicationStatus
) => void;

type ApplicationStatusFilter = "all" | ApplicationStatus;
type ApplicationSort = "newest" | "oldest";
type TrendGranularity = "day" | "week" | "month";

type IntervalOption = {
  value: string;
  label: string;
  labelEn: string;
  days?: number;
  months?: number;
};

type ApplicationTrendPoint = {
  timestamp: Date;
  label: string;
  fullLabel: string;
  applications: number;
};

const intervalOptions: IntervalOption[] = [
  { value: "7d", label: "7 dagar", labelEn: "7 days", days: 7 },
  { value: "30d", label: "30 dagar", labelEn: "30 days", days: 30 },
  { value: "90d", label: "90 dagar", labelEn: "90 days", days: 90 },
  { value: "1y", label: "1 år", labelEn: "1 year", months: 12 },
];

const granularityOptions: Array<{
  value: TrendGranularity;
  label: string;
  labelEn: string;
}> = [
  { value: "day", label: "Dag", labelEn: "Day" },
  { value: "week", label: "Vecka", labelEn: "Week" },
  { value: "month", label: "Månad", labelEn: "Month" },
];

const applicationStatusBadgeClassName: Record<ApplicationStatus, string> = {
  SUBMITTED: "border-gray-200 bg-gray-50 text-gray-700",
  UNDER_REVIEW: "border-amber-200 bg-amber-50 text-amber-800",
  ACCEPTED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  OFFERED: "border-sky-200 bg-sky-50 text-sky-700",
  REJECTED: "border-red-200 bg-red-50 text-red-700",
};

const applicationStatusBarClassName: Record<ApplicationStatus, string> = {
  SUBMITTED: "bg-gray-500",
  UNDER_REVIEW: "bg-amber-500",
  ACCEPTED: "bg-emerald-500",
  OFFERED: "bg-sky-500",
  REJECTED: "bg-red-500",
};

const openApplicationStatusKeys = ["SUBMITTED", "UNDER_REVIEW", "OFFERED"];

function parseDate(value?: string) {
  if (!value) return 0;

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
}

function toPortalApplication(
  application: NewApplication,
  locale: Locale
): PortalApplication {
  const submittedAt = application.submittedAt ?? application.createdAt;

  return {
    ...application,
    listingName:
      application.listingTitle ||
      application.address ||
      localizedText(locale, "Okänd bostad", "Unknown listing"),
    submittedAtTime: parseDate(submittedAt),
  };
}

function formatTimestamp(value: number, locale: Locale) {
  if (!Number.isFinite(value) || value <= 0) return "-";

  return new Intl.DateTimeFormat(numberLocale(locale), {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatFullDate(date: Date, locale: Locale) {
  return new Intl.DateTimeFormat(numberLocale(locale), {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatAxisDate(date: Date, granularity: TrendGranularity, locale: Locale) {
  const formatter = new Intl.DateTimeFormat(numberLocale(locale), {
    day: granularity === "month" ? undefined : "numeric",
    month: "short",
    year: granularity === "month" ? "2-digit" : undefined,
  });

  return formatter.format(date).replace(".", "");
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

function getApplicationStatusLabel(status: ApplicationStatus, locale: Locale) {
  switch (status) {
    case "SUBMITTED":
      return localizedText(locale, "Inskickad", "Submitted");
    case "UNDER_REVIEW":
      return localizedText(locale, "Under granskning", "Under review");
    case "ACCEPTED":
      return localizedText(locale, "Antagen", "Accepted");
    case "OFFERED":
      return localizedText(locale, "Erbjudande", "Offer");
    case "REJECTED":
      return localizedText(locale, "Nekad", "Rejected");
  }
}

function ApplicationStatusBadge({
  status,
  locale,
}: {
  status?: ApplicationStatus;
  locale: Locale;
}) {
  if (!status) {
    return (
      <span className="inline-flex h-7 items-center rounded-full border border-gray-200 bg-gray-50 px-2.5 text-xs font-semibold text-gray-500">
        {localizedText(locale, "Okänd", "Unknown")}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex h-7 items-center rounded-full border px-2.5 text-xs font-semibold",
        applicationStatusBadgeClassName[status]
      )}
    >
      {getApplicationStatusLabel(status, locale)}
    </span>
  );
}

function getApplicantDisplayName(application: PortalApplication, locale: Locale) {
  const name = [application.firstName, application.surname]
    .filter(Boolean)
    .join(" ")
    .trim();

  if (name) return name;
  if (application.studentEmail) return application.studentEmail;
  if (application.studentId > 0) {
    return localizedText(
      locale,
      `Student #${application.studentId}`,
      `Student #${application.studentId}`
    );
  }

  return localizedText(locale, "Sökande", "Applicant");
}

function getApplicantFacts(application: PortalApplication) {
  return [
    application.studentSchool,
    application.studentProgram,
    application.studentCity,
  ].filter(Boolean);
}

function getListingFacts(application: PortalApplication, locale: Locale) {
  const facts = [
    application.listingCity,
    application.listingRooms
      ? localizedText(
          locale,
          `${application.listingRooms} rok`,
          `${application.listingRooms} rooms`
        )
      : null,
    application.listingSizeM2
      ? localizedText(
          locale,
          `${application.listingSizeM2} m²`,
          `${application.listingSizeM2} sqm`
        )
      : null,
    application.listingRent
      ? localizedText(
          locale,
          `${application.listingRent.toLocaleString(numberLocale(locale))} kr/mån`,
          `SEK ${application.listingRent.toLocaleString(numberLocale(locale))}/mo`
        )
      : null,
  ];

  return facts.filter(Boolean).join(" · ");
}

function getApplicationMessage(application: PortalApplication, locale: Locale) {
  return (
    application.message ||
    application.studentSchool ||
    localizedText(locale, "Ingen kommentar", "No comment")
  );
}

function getRecentCount(applications: PortalApplication[], days: number) {
  const now = Date.now();
  const start = new Date();
  start.setDate(start.getDate() - days);

  return applications.filter(
    (application) =>
      application.submittedAtTime >= start.getTime() &&
      application.submittedAtTime <= now
  ).length;
}

function getBackendAnalyticsRange() {
  const to = new Date();
  const from = new Date(to);
  from.setFullYear(from.getFullYear() - 1);

  return {
    from: from.toISOString(),
    to: to.toISOString(),
  };
}

function formatCount(value: number, locale: Locale) {
  return value.toLocaleString(numberLocale(locale));
}

function formatShare(value: number, total: number, locale: Locale) {
  const share = total > 0 ? value / total : 0;

  return `${(share * 100).toLocaleString(numberLocale(locale), {
    maximumFractionDigits: 1,
  })}%`;
}

function getBucketTotal(buckets: AnalyticsCountBucket[]) {
  return buckets.reduce((sum, bucket) => sum + bucket.count, 0);
}

function getBucketCountByKeys(buckets: AnalyticsCountBucket[], keys: string[]) {
  const normalizedKeys = new Set(keys.map((key) => key.toUpperCase()));

  return buckets.reduce((sum, bucket) => {
    const key = bucket.key.trim().toUpperCase();
    return normalizedKeys.has(key) ? sum + bucket.count : sum;
  }, 0);
}

function buildStatusBucketsFromApplications(
  applications: PortalApplication[]
): AnalyticsCountBucket[] {
  return APPLICATION_STATUS_VALUES.map((status) => ({
    key: status,
    count: applications.filter((application) => application.status === status).length,
  }));
}

function buildOutcomeBucketsFromApplications(
  applications: PortalApplication[]
): AnalyticsCountBucket[] {
  return [
    {
      key: "ACCEPTED",
      count: applications.filter((application) => application.status === "ACCEPTED")
        .length,
    },
    {
      key: "REJECTED",
      count: applications.filter((application) => application.status === "REJECTED")
        .length,
    },
  ];
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfWeek(date: Date) {
  const start = startOfDay(date);
  const dayOffset = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - dayOffset);
  return start;
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function getPeriodStart(date: Date, granularity: TrendGranularity) {
  if (granularity === "week") return startOfWeek(date);
  if (granularity === "month") return startOfMonth(date);
  return startOfDay(date);
}

function addPeriod(date: Date, granularity: TrendGranularity) {
  const next = new Date(date);

  if (granularity === "month") {
    next.setMonth(next.getMonth() + 1);
  } else if (granularity === "week") {
    next.setDate(next.getDate() + 7);
  } else {
    next.setDate(next.getDate() + 1);
  }

  return next;
}

function getPeriodEnd(date: Date, granularity: TrendGranularity, maxDate: Date) {
  const next = addPeriod(date, granularity);
  next.setDate(next.getDate() - 1);

  return next.getTime() > maxDate.getTime() ? maxDate : next;
}

function dateKey(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function resolveRange(interval: IntervalOption) {
  const to = startOfDay(new Date());
  const from = new Date(to);

  if (interval.days) {
    from.setDate(from.getDate() - interval.days + 1);
  } else if (interval.months) {
    from.setMonth(from.getMonth() - interval.months);
    from.setDate(from.getDate() + 1);
  }

  return { from, to };
}

function buildTrendPoints({
  applications,
  from,
  to,
  granularity,
  locale,
}: {
  applications: PortalApplication[];
  from: Date;
  to: Date;
  granularity: TrendGranularity;
  locale: Locale;
}): ApplicationTrendPoint[] {
  const countsByPeriod = new Map<string, number>();
  const fromTime = from.getTime();
  const toEnd = new Date(to);
  toEnd.setHours(23, 59, 59, 999);
  const toTime = toEnd.getTime();

  applications.forEach((application) => {
    const timestamp = application.submittedAtTime;

    if (!Number.isFinite(timestamp) || timestamp < fromTime || timestamp > toTime) {
      return;
    }

    const periodStart = getPeriodStart(new Date(timestamp), granularity);
    const key = dateKey(periodStart);
    countsByPeriod.set(key, (countsByPeriod.get(key) ?? 0) + 1);
  });

  const points: ApplicationTrendPoint[] = [];

  for (
    let cursor = getPeriodStart(from, granularity);
    cursor.getTime() <= to.getTime();
    cursor = addPeriod(cursor, granularity)
  ) {
    const periodEnd = getPeriodEnd(cursor, granularity, to);
    points.push({
      timestamp: new Date(cursor),
      label: formatAxisDate(cursor, granularity, locale),
      fullLabel:
        granularity === "day"
          ? formatFullDate(cursor, locale)
          : `${formatFullDate(cursor, locale)} - ${formatFullDate(periodEnd, locale)}`,
      applications: countsByPeriod.get(dateKey(cursor)) ?? 0,
    });
  }

  return points;
}

function applicationMatchesSearch(application: PortalApplication, search: string) {
  const query = search.trim().toLowerCase();

  if (!query) return true;

  return [
    application.firstName,
    application.surname,
    application.studentEmail,
    application.studentSchool,
    application.studentProgram,
    application.studentCity,
    application.listingName,
    application.address,
    application.listingCity,
    application.message,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .includes(query);
}

function ApplicationStatusControl({
  application,
  locale,
  onStatusChange,
  pendingApplicationId,
}: {
  application: PortalApplication;
  locale: Locale;
  onStatusChange: HandleApplicationStatusChange;
  pendingApplicationId: number | null;
}) {
  const currentStatus = application.status;
  const [selectedStatus, setSelectedStatus] = React.useState<ApplicationStatus>(
    currentStatus ?? "SUBMITTED"
  );
  const applicationId = application.applicationId;
  const canHandle =
    typeof applicationId === "number" &&
    Number.isFinite(applicationId) &&
    applicationId > 0 &&
    Number.isFinite(application.studentId) &&
    application.studentId > 0;
  const isSaving = pendingApplicationId === applicationId;
  const hasChanged = currentStatus !== selectedStatus;

  React.useEffect(() => {
    setSelectedStatus(currentStatus ?? "SUBMITTED");
  }, [applicationId, currentStatus]);

  return (
    <div className="flex w-full min-w-0 flex-col gap-2 sm:w-auto sm:items-end">
      <ApplicationStatusBadge locale={locale} status={currentStatus} />
      <div className="flex w-full min-w-0 items-center gap-2 sm:w-auto">
        <Select
          disabled={isSaving || !canHandle}
          onValueChange={(value) => setSelectedStatus(value as ApplicationStatus)}
          value={selectedStatus}
        >
          <SelectTrigger
            aria-label={localizedText(locale, "Välj status", "Choose status")}
            className="h-8 w-full min-w-[150px] rounded-lg border-gray-200 bg-white text-xs shadow-theme-xs sm:w-[170px]"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border-gray-200 bg-white">
            {APPLICATION_STATUS_VALUES.map((status) => (
              <SelectItem key={status} value={status}>
                {getApplicationStatusLabel(status, locale)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          aria-label={localizedText(locale, "Spara status", "Save status")}
          className="h-8 min-w-0 rounded-lg"
          isDisabled={!canHandle || !hasChanged || isSaving}
          isLoading={isSaving}
          onPress={() => onStatusChange(application, selectedStatus)}
          size="icon-sm"
          title={localizedText(locale, "Spara status", "Save status")}
          variant="secondary"
        >
          <Check className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function ApplicationsCountBlock({
  applications,
  locale,
}: {
  applications: PortalApplication[];
  locale: Locale;
}) {
  const recent30 = getRecentCount(applications, 30);
  const latest = applications[0]?.submittedAtTime ?? 0;

  return (
    <PortalGridItem contentClassName="p-5 sm:p-5" size="2x1">
      <div className="flex h-full min-h-[160px] min-w-0 flex-col justify-between">
        <div className="flex items-start justify-between gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-100 bg-gray-50 text-brand-600">
            <FileUser className="h-5 w-5" />
          </div>
          <span className="truncate rounded-full border border-gray-200 bg-gray-50 px-2 py-1 text-[11px] font-semibold text-gray-600">
            {localizedText(
              locale,
              `${recent30.toLocaleString(numberLocale(locale))} senaste 30 d`,
              `${recent30.toLocaleString(numberLocale(locale))} last 30d`
            )}
          </span>
        </div>

        <div className="min-w-0">
          <p className="truncate text-theme-sm font-medium text-gray-500">
            {localizedText(locale, "Mottagna ansökningar", "Received applications")}
          </p>
          <p className="mt-1 truncate text-3xl font-bold leading-9 tracking-normal text-gray-800 tabular-nums">
            {applications.length.toLocaleString(numberLocale(locale))}
          </p>
          <p className="mt-2 flex min-w-0 items-center gap-1.5 truncate text-xs font-medium text-gray-500">
            <Clock3 className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">
              {latest > 0
                ? localizedText(
                    locale,
                    `Senaste: ${formatTimestamp(latest, locale)}`,
                    `Latest: ${formatTimestamp(latest, locale)}`
                  )
                : localizedText(locale, "Inga ansökningar än", "No applications yet")}
            </span>
          </p>
        </div>
      </div>
    </PortalGridItem>
  );
}

function ApplicationsTrendBlock({
  applications,
  locale,
}: {
  applications: PortalApplication[];
  locale: Locale;
}) {
  const [selectedInterval, setSelectedInterval] = React.useState("90d");
  const [selectedGranularity, setSelectedGranularity] =
    React.useState<TrendGranularity>("week");
  const interval =
    intervalOptions.find((option) => option.value === selectedInterval) ??
    intervalOptions[2]!;
  const range = React.useMemo(() => resolveRange(interval), [interval]);
  const data = React.useMemo(
    () =>
      buildTrendPoints({
        applications,
        from: range.from,
        to: range.to,
        granularity: selectedGranularity,
        locale,
      }),
    [applications, locale, range.from, range.to, selectedGranularity]
  );
  const hasData = data.some((point) => point.applications > 0);
  const chartConfig = React.useMemo(
    () =>
      ({
        applications: {
          label: localizedText(locale, "Ansökningar", "Applications"),
          color: "#004225",
        },
      }) satisfies ChartConfig,
    [locale]
  );
  const selectTriggerClassName =
    "h-8 rounded-lg border-gray-200 bg-white px-2.5 text-xs font-medium text-gray-700 shadow-theme-xs hover:border-gray-300 hover:bg-gray-50 focus:border-[#004225] focus:ring-4 focus:ring-[#004225]/10";
  const controls = (
    <div className="flex min-w-max items-center gap-2">
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
        onValueChange={(value) => setSelectedGranularity(value as TrendGranularity)}
        value={selectedGranularity}
      >
        <SelectTrigger
          aria-label={localizedText(locale, "Upplösning", "Resolution")}
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
      action={controls}
      contentClassName="overflow-hidden p-3 pt-1 sm:p-4 sm:pt-1"
      size="2x4"
      title={localizedText(locale, "Ansökningar över tid", "Applications over time")}
    >
      {hasData ? (
        <ChartContainer
          className="h-full min-h-[160px] w-full min-w-0"
          config={chartConfig}
        >
          <LineChart
            accessibilityLayer
            data={data}
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
              interval={data.length > 18 ? "preserveStartEnd" : 0}
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
                      | ApplicationTrendPoint
                      | undefined;

                    return row?.fullLabel ?? "";
                  }}
                />
              }
              cursor={false}
            />
            <Line
              activeDot={{ r: 4 }}
              dataKey="applications"
              dot={false}
              name={localizedText(locale, "Ansökningar", "Applications")}
              stroke="var(--color-applications)"
              strokeWidth={2}
              type="monotone"
            />
          </LineChart>
        </ChartContainer>
      ) : (
        <div className="flex h-full min-h-[160px] items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50/60 px-4 text-center text-theme-sm text-gray-500">
          {localizedText(
            locale,
            "Det finns inga ansökningar i valt intervall.",
            "There are no applications in the selected interval."
          )}
        </div>
      )}
    </PortalGridItem>
  );
}

function PipelineMetric({
  icon: Icon,
  label,
  value,
  detail,
  className,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  detail: string;
  className: string;
}) {
  return (
    <div className="portal-inner-surface min-w-0 px-3 py-3">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-gray-500">{label}</p>
          <p className="mt-1 truncate text-2xl font-semibold leading-8 text-gray-900 tabular-nums">
            {value}
          </p>
        </div>
        <span
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
            className
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-2 line-clamp-2 text-xs leading-5 text-gray-500">
        {detail}
      </p>
    </div>
  );
}

function PipelineStatusRow({
  status,
  count,
  total,
  locale,
}: {
  status: ApplicationStatus;
  count: number;
  total: number;
  locale: Locale;
}) {
  const width = total > 0 ? Math.max((count / total) * 100, count > 0 ? 4 : 0) : 0;

  return (
    <div className="min-w-0">
      <div className="flex min-w-0 items-center justify-between gap-3">
        <p className="truncate text-xs font-medium text-gray-600">
          {getApplicationStatusLabel(status, locale)}
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <span className="text-xs font-semibold text-gray-900 tabular-nums">
            {formatCount(count, locale)}
          </span>
          <span className="w-11 text-right text-[11px] font-semibold text-gray-500 tabular-nums">
            {formatShare(count, total, locale)}
          </span>
        </div>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-gray-100">
        <div
          className={cn("h-full rounded-full", applicationStatusBarClassName[status])}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

function ApplicationPipelineBlock({
  applications,
  companyId,
  listingId,
  locale,
}: {
  applications: PortalApplication[];
  companyId: number;
  listingId?: string | null;
  locale: Locale;
}) {
  const useBackendBuckets = !listingId;
  const range = React.useMemo(() => getBackendAnalyticsRange(), []);
  const statusQuery = useCompanyApplicationStatusCounts(companyId, {
    enabled: useBackendBuckets,
    from: range.from,
    to: range.to,
  });
  const outcomeQuery = useCompanyApplicationOutcomeCounts(companyId, {
    enabled: useBackendBuckets,
    from: range.from,
    to: range.to,
  });
  const statusBuckets = React.useMemo(
    () =>
      useBackendBuckets
        ? (statusQuery.data ?? [])
        : buildStatusBucketsFromApplications(applications),
    [applications, statusQuery.data, useBackendBuckets]
  );
  const outcomeBuckets = React.useMemo(
    () =>
      useBackendBuckets
        ? (outcomeQuery.data ?? [])
        : buildOutcomeBucketsFromApplications(applications),
    [applications, outcomeQuery.data, useBackendBuckets]
  );
  const isLoading =
    useBackendBuckets && (statusQuery.isLoading || outcomeQuery.isLoading);
  const error =
    useBackendBuckets && (statusQuery.isError || outcomeQuery.isError)
      ? statusQuery.error instanceof Error
        ? statusQuery.error.message
        : outcomeQuery.error instanceof Error
          ? outcomeQuery.error.message
          : localizedText(
              locale,
              "Kunde inte h\u00e4mta pipeline-data.",
              "Could not load pipeline data."
            )
      : null;
  const statusTotal = useBackendBuckets
    ? getBucketTotal(statusBuckets)
    : applications.length;
  const openCount = getBucketCountByKeys(
    statusBuckets,
    openApplicationStatusKeys
  );
  const acceptedCount = getBucketCountByKeys(outcomeBuckets, ["ACCEPTED"]);
  const rejectedCount = getBucketCountByKeys(outcomeBuckets, ["REJECTED"]);
  const outcomeTotal = Math.max(getBucketTotal(outcomeBuckets), 0);
  const decidedCount = outcomeTotal || acceptedCount + rejectedCount;
  const statusRows = APPLICATION_STATUS_VALUES.map((status) => ({
    status,
    count: getBucketCountByKeys(statusBuckets, [status]),
  }));

  return (
    <PortalGridItem
      contentClassName="overflow-hidden"
      description={
        listingId
          ? localizedText(locale, "Vald bostad", "Selected listing")
          : localizedText(locale, "Senaste 12 m\u00e5naderna", "Last 12 months")
      }
      size="2x3"
      title={localizedText(locale, "Ans\u00f6kningspipeline", "Application pipeline")}
    >
      {isLoading ? (
        <div className="grid h-full min-h-0 gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {[0, 1, 2].map((item) => (
              <Skeleton className="h-[96px] rounded-lg" key={item} />
            ))}
          </div>
          <div className="space-y-4">
            {[0, 1, 2, 3, 4].map((item) => (
              <div className="space-y-2" key={item}>
                <div className="flex justify-between gap-3">
                  <Skeleton className="h-3.5 w-24" />
                  <Skeleton className="h-3.5 w-16" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            ))}
          </div>
        </div>
      ) : error ? (
        <div className="flex h-full items-center rounded-md border border-error-500/20 bg-error-50 px-4 text-theme-sm text-error-700">
          {error}
        </div>
      ) : (
        <div className="grid h-full min-h-0 gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="grid min-h-0 gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <PipelineMetric
              className="bg-sky-50 text-sky-600"
              detail={localizedText(
                locale,
                `${formatShare(openCount, statusTotal, locale)} av pipeline`,
                `${formatShare(openCount, statusTotal, locale)} of pipeline`
              )}
              icon={FileUser}
              label={localizedText(locale, "\u00d6ppna \u00e4renden", "Open cases")}
              value={formatCount(openCount, locale)}
            />
            <PipelineMetric
              className="bg-emerald-50 text-emerald-600"
              detail={localizedText(
                locale,
                `${formatCount(decidedCount, locale)} avgjorda \u00e4renden`,
                `${formatCount(decidedCount, locale)} resolved cases`
              )}
              icon={CheckCircle}
              label={localizedText(locale, "Antagna", "Accepted")}
              value={formatCount(acceptedCount, locale)}
            />
            <PipelineMetric
              className="bg-amber-50 text-amber-700"
              detail={localizedText(
                locale,
                `${formatCount(rejectedCount, locale)} avslag`,
                `${formatCount(rejectedCount, locale)} rejections`
              )}
              icon={Percent}
              label={localizedText(locale, "Acceptansgrad", "Acceptance rate")}
              value={formatShare(acceptedCount, decidedCount, locale)}
            />
          </div>

          <div className="min-h-0 min-w-0 overflow-y-auto pr-1">
            <div className="flex min-w-0 items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-600">
                  <SlidersHorizontal className="h-4 w-4" />
                </span>
                <h3 className="truncate text-sm font-semibold text-gray-900">
                  {localizedText(locale, "Statusf\u00f6rdelning", "Status breakdown")}
                </h3>
              </div>
              <span className="shrink-0 text-sm font-semibold text-gray-900 tabular-nums">
                {formatCount(statusTotal, locale)}
              </span>
            </div>
            <div className="mt-4 space-y-3">
              {statusRows.map((row) => (
                <PipelineStatusRow
                  count={row.count}
                  key={row.status}
                  locale={locale}
                  status={row.status}
                  total={statusTotal}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </PortalGridItem>
  );
}

function ApplicationsOverview({
  applications,
  companyId,
  listingId,
  locale,
}: {
  applications: PortalApplication[];
  companyId: number;
  listingId?: string | null;
  locale: Locale;
}) {
  return (
    <PortalGrid>
      <ApplicationsCountBlock applications={applications} locale={locale} />
      <ApplicationPipelineBlock
        applications={applications}
        companyId={companyId}
        listingId={listingId}
        locale={locale}
      />
      <ApplicationsTrendBlock applications={applications} locale={locale} />
    </PortalGrid>
  );
}

function ApplicationRow({
  application,
  index,
  locale,
  onStatusChange,
  pendingApplicationId,
}: {
  application: PortalApplication;
  index: number;
  locale: Locale;
  onStatusChange: HandleApplicationStatusChange;
  pendingApplicationId: number | null;
}) {
  const applicantFacts = getApplicantFacts(application);
  const listingFacts = getListingFacts(application, locale);
  const listingHref =
    application.listingId != null
      ? `${dashboardRelPath}/listings/${encodeURIComponent(String(application.listingId))}`
      : null;

  return (
    <div className="grid gap-4 border-t border-gray-100 px-4 py-4 transition-colors hover:bg-gray-50/50 sm:px-5 xl:grid-cols-[minmax(230px,1fr)_minmax(260px,1.2fr)_minmax(150px,0.7fr)_auto] xl:items-center">
      <div className="flex min-w-0 gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-100 bg-gray-50 text-brand-600">
          <UserCircle className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-gray-900">
            {getApplicantDisplayName(application, locale)}
          </p>
          {application.studentEmail ? (
            <p className="mt-1 flex min-w-0 items-center gap-1.5 truncate text-xs text-gray-500">
              <Mail className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{application.studentEmail}</span>
            </p>
          ) : null}
          {applicantFacts.length > 0 ? (
            <p className="mt-1 flex min-w-0 items-center gap-1.5 truncate text-xs text-gray-500">
              <GraduationCap className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{applicantFacts.join(" · ")}</span>
            </p>
          ) : null}
        </div>
      </div>

      <div className="min-w-0">
        <div className="flex min-w-0 items-center gap-2">
          <Home className="h-4 w-4 shrink-0 text-gray-400" />
          <p className="truncate text-sm font-semibold text-gray-900">
            {application.listingName}
          </p>
          {listingHref ? (
            <Link
              aria-label={localizedText(locale, "Öppna bostad", "Open listing")}
              className="shrink-0 text-gray-400 transition hover:text-[#004225]"
              href={listingHref}
            >
              <ExternalLink className="h-4 w-4" />
            </Link>
          ) : null}
        </div>
        <p className="mt-1 flex min-w-0 items-center gap-1.5 truncate text-xs text-gray-500">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">
            {application.address ||
              application.listingCity ||
              localizedText(locale, "Adress saknas", "Address missing")}
          </span>
        </p>
        {listingFacts ? (
          <p className="mt-1 truncate text-xs text-gray-500">{listingFacts}</p>
        ) : null}
        <p className="mt-2 line-clamp-2 text-xs leading-5 text-gray-500">
          {getApplicationMessage(application, locale)}
        </p>
      </div>

      <div className="min-w-0">
        <p className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
          <CalendarDays className="h-3.5 w-3.5" />
          {localizedText(locale, "Inkommen", "Received")}
        </p>
        <p className="mt-1 text-sm font-semibold text-gray-800">
          {formatTimestamp(application.submittedAtTime, locale)}
        </p>
      </div>

      <ApplicationStatusControl
        application={application}
        locale={locale}
        onStatusChange={onStatusChange}
        pendingApplicationId={pendingApplicationId}
      />

      <span className="sr-only">
        {localizedText(locale, `Rad ${index + 1}`, `Row ${index + 1}`)}
      </span>
    </div>
  );
}

function ApplicationsList({
  applications,
  listingId,
  locale,
  onStatusChange,
  pendingApplicationId,
}: {
  applications: PortalApplication[];
  listingId?: string | null;
  locale: Locale;
  onStatusChange: HandleApplicationStatusChange;
  pendingApplicationId: number | null;
}) {
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] =
    React.useState<ApplicationStatusFilter>("all");
  const [sort, setSort] = React.useState<ApplicationSort>("newest");
  const filteredApplications = React.useMemo(() => {
    return applications
      .filter((application) =>
        statusFilter === "all" ? true : application.status === statusFilter
      )
      .filter((application) => applicationMatchesSearch(application, search))
      .sort((left, right) =>
        sort === "newest"
          ? right.submittedAtTime - left.submittedAtTime
          : left.submittedAtTime - right.submittedAtTime
      );
  }, [applications, search, sort, statusFilter]);
  const selectTriggerClassName =
    "h-9 rounded-lg border-gray-200 bg-white px-3 text-xs font-medium text-gray-700 shadow-theme-xs hover:border-gray-300 hover:bg-gray-50 focus:border-[#004225] focus:ring-4 focus:ring-[#004225]/10";

  return (
    <section className="portal-surface overflow-hidden">
      <div className="flex min-w-0 flex-col gap-4 border-b border-gray-100 px-5 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold leading-6 text-gray-900">
            {listingId
              ? localizedText(locale, "Kandidater för vald bostad", "Candidates for selected listing")
              : localizedText(locale, "Kandidatlista", "Candidate list")}
          </h2>
          <p className="mt-1 text-theme-sm text-gray-500">
            {localizedText(
              locale,
              `${filteredApplications.length.toLocaleString(numberLocale(locale))} av ${applications.length.toLocaleString(numberLocale(locale))} visas`,
              `${filteredApplications.length.toLocaleString(numberLocale(locale))} of ${applications.length.toLocaleString(numberLocale(locale))} shown`
            )}
          </p>
        </div>

        <div className="flex min-w-0 flex-col gap-2 md:flex-row md:items-center">
          <div className="relative min-w-0 md:w-[260px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              aria-label={localizedText(locale, "Sök ansökningar", "Search applications")}
              className="portal-control h-9 pl-9 text-sm"
              onChange={(event) => setSearch(event.target.value)}
              placeholder={localizedText(locale, "Sök namn, bostad, skola", "Search name, listing, school")}
              value={search}
            />
          </div>

          <Select
            onValueChange={(value) => setStatusFilter(value as ApplicationStatusFilter)}
            value={statusFilter}
          >
            <SelectTrigger
              aria-label={localizedText(locale, "Filtrera status", "Filter status")}
              className={cn(selectTriggerClassName, "w-full md:w-[170px]")}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-gray-200 bg-white">
              <SelectItem value="all">
                {localizedText(locale, "Alla statusar", "All statuses")}
              </SelectItem>
              {APPLICATION_STATUS_VALUES.map((status) => (
                <SelectItem key={status} value={status}>
                  {getApplicationStatusLabel(status, locale)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            onValueChange={(value) => setSort(value as ApplicationSort)}
            value={sort}
          >
            <SelectTrigger
              aria-label={localizedText(locale, "Sortera", "Sort")}
              className={cn(selectTriggerClassName, "w-full md:w-[130px]")}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-gray-200 bg-white">
              <SelectItem value="newest">
                {localizedText(locale, "Nyast först", "Newest first")}
              </SelectItem>
              <SelectItem value="oldest">
                {localizedText(locale, "Äldst först", "Oldest first")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredApplications.length > 0 ? (
        <div>
          <div className="hidden border-b border-gray-100 bg-gray-50/70 px-5 py-2 text-xs font-semibold uppercase tracking-normal text-gray-500 xl:grid xl:grid-cols-[minmax(230px,1fr)_minmax(260px,1.2fr)_minmax(150px,0.7fr)_auto]">
            <span>{localizedText(locale, "Sökande", "Applicant")}</span>
            <span>{localizedText(locale, "Bostad", "Listing")}</span>
            <span>{localizedText(locale, "Inkommen", "Received")}</span>
            <span className="text-right">
              {localizedText(locale, "Hantering", "Handling")}
            </span>
          </div>
          {filteredApplications.map((application, index) => (
            <ApplicationRow
              application={application}
              index={index}
              key={`${application.applicationId ?? application.id ?? "application"}-${application.studentId}-${application.submittedAtTime}-${index}`}
              locale={locale}
              onStatusChange={onStatusChange}
              pendingApplicationId={pendingApplicationId}
            />
          ))}
        </div>
      ) : (
        <div className="flex min-h-[260px] flex-col items-center justify-center px-6 py-10 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-100 bg-gray-50 text-gray-500">
            <SlidersHorizontal className="h-5 w-5" />
          </div>
          <p className="mt-3 text-sm font-semibold text-gray-900">
            {localizedText(locale, "Inga ansökningar matchar filtret", "No applications match the filter")}
          </p>
          <p className="mt-1 max-w-md text-theme-sm text-gray-500">
            {localizedText(
              locale,
              "Justera sökningen eller statusfiltret för att visa fler ansökningar.",
              "Adjust the search or status filter to show more applications."
            )}
          </p>
        </div>
      )}
    </section>
  );
}

function LoadingApplicationsLayout({ locale }: { locale: Locale }) {
  return (
    <PortalPage>
      <PortalGrid>
        <PortalGridItem contentClassName="p-5 sm:p-5" size="2x1">
          <div className="flex h-full min-h-[160px] flex-col justify-between">
            <div className="flex items-start justify-between gap-3">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-4 w-40" />
            </div>
          </div>
        </PortalGridItem>
        <PortalGridItem
          size="2x3"
          title={localizedText(locale, "Ans\u00f6kningspipeline", "Application pipeline")}
        >
          <div className="grid h-full min-h-0 gap-4 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {[0, 1, 2].map((item) => (
                <Skeleton className="h-[96px] rounded-lg" key={item} />
              ))}
            </div>
            <div className="space-y-4">
              {[0, 1, 2, 3, 4].map((item) => (
                <div className="space-y-2" key={item}>
                  <div className="flex justify-between gap-3">
                    <Skeleton className="h-3.5 w-24" />
                    <Skeleton className="h-3.5 w-16" />
                  </div>
                  <Skeleton className="h-2 w-full rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </PortalGridItem>
        <PortalGridItem
          size="2x4"
          title={localizedText(locale, "Ansökningar över tid", "Applications over time")}
        >
          <Skeleton className="h-full min-h-[160px] rounded-xl" />
        </PortalGridItem>
      </PortalGrid>

      <section className="portal-surface overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-28" />
          </div>
          <Skeleton className="h-9 w-64 rounded-lg" />
        </div>
        {[0, 1, 2, 3, 4].map((item) => (
          <div
            className="grid gap-4 border-t border-gray-100 px-5 py-4 xl:grid-cols-[minmax(230px,1fr)_minmax(260px,1.2fr)_minmax(150px,0.7fr)_auto]"
            key={item}
          >
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-10 rounded-xl" />
            <Skeleton className="h-16 rounded-xl" />
          </div>
        ))}
      </section>
    </PortalPage>
  );
}

export default function ApplicationsView({
  listingId = null,
}: ApplicationsViewProps) {
  const { locale } = useI18n();
  const { user, isLoading: authLoading } = useAuth();
  const companyId = getActiveCompanyId(user);
  const handleApplicationMutation = useHandleCompanyApplication();

  const applicationsQuery = useCompanyApplications(companyId, {
    enabled: !authLoading,
  });
  const applications = React.useMemo(
    () =>
      (applicationsQuery.data ?? [])
        .map((application) => toPortalApplication(application, locale))
        .sort((left, right) => right.submittedAtTime - left.submittedAtTime),
    [applicationsQuery.data, locale]
  );
  const visibleApplications = React.useMemo(() => {
    if (!listingId) {
      return applications;
    }

    return applications.filter(
      (application) => String(application.listingId ?? "") === String(listingId)
    );
  }, [applications, listingId]);
  const pendingApplicationId = handleApplicationMutation.isPending
    ? handleApplicationMutation.variables?.payload.applicationId ?? null
    : null;
  const error = applicationsQuery.isError
    ? applicationsQuery.error instanceof Error
      ? applicationsQuery.error.message
      : localizedText(
          locale,
          "Kunde inte hämta ansökningar.",
          "Could not load applications."
        )
    : null;

  const handleStatusChange: HandleApplicationStatusChange = (
    application,
    newStatus
  ) => {
    if (!companyId) {
      toast.error(
        localizedText(locale, "Företagskonto saknas.", "Company account is missing.")
      );
      return;
    }

    const applicationId = application.applicationId;
    const studentId = application.studentId;

    if (
      typeof applicationId !== "number" ||
      !Number.isFinite(applicationId) ||
      applicationId <= 0 ||
      !Number.isFinite(studentId) ||
      studentId <= 0
    ) {
      toast.error(
        localizedText(
          locale,
          "Ansökan saknar nödvändiga id:n.",
          "The application is missing required ids."
        )
      );
      return;
    }

    handleApplicationMutation.mutate(
      {
        companyId,
        payload: {
          applicationId,
          studentId,
          newStatus,
        },
      },
      {
        onSuccess: () => {
          toast.success(
            localizedText(
              locale,
              "Ansökningsstatus uppdaterades.",
              "Application status was updated."
            )
          );
        },
        onError: (error) => {
          toast.error(
            error instanceof Error
              ? error.message
              : localizedText(
                  locale,
                  "Kunde inte uppdatera ansökningsstatus.",
                  "Could not update application status."
                )
          );
        },
      }
    );
  };

  if (authLoading) {
    return (
      <PortalSurface className="text-sm text-gray-500" padding="md">
        {localizedText(locale, "Laddar ansökningar...", "Loading applications...")}
      </PortalSurface>
    );
  }

  if (!user) {
    return (
      <PortalSurface dashed className="text-center text-sm text-gray-500" padding="lg">
        {localizedText(
          locale,
          "Logga in för att se företagets ansökningar.",
          "Log in to view the company's applications."
        )}
      </PortalSurface>
    );
  }

  if (!companyId) {
    return (
      <PortalSurface dashed className="text-center text-sm text-gray-500" padding="lg">
        {localizedText(
          locale,
          "Denna sida är bara tillgänglig för företagskonton.",
          "This page is only available for company accounts."
        )}
      </PortalSurface>
    );
  }

  return (
    <PortalPage>
      <PortalPageHeader
        title={
          listingId
            ? localizedText(locale, "Annonsans\u00f6kningar", "Listing applications")
            : localizedText(locale, "Ans\u00f6kningar", "Applications")
        }
        description={
          listingId
            ? localizedText(
                locale,
                "Hantera kandidater, statusar och pipeline f\u00f6r vald bostad.",
                "Manage candidates, statuses and pipeline for the selected listing."
              )
            : localizedText(
                locale,
                "Hantera inkommande ans\u00f6kningar, statusar och pipeline f\u00f6r hela portf\u00f6ljen.",
                "Manage incoming applications, statuses and pipeline for the full portfolio."
              )
        }
      />

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {applicationsQuery.isLoading ? (
        <LoadingApplicationsLayout locale={locale} />
      ) : (
        <>
          <ApplicationsOverview
            applications={visibleApplications}
            companyId={companyId}
            listingId={listingId}
            locale={locale}
          />
          <ApplicationsList
            applications={visibleApplications}
            listingId={listingId}
            locale={locale}
            onStatusChange={handleStatusChange}
            pendingApplicationId={pendingApplicationId}
          />
        </>
      )}
    </PortalPage>
  );
}
