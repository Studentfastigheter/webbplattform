"use client";

import { useEffect, useMemo, useState, type ComponentType } from "react";
import Link from "next/link";
import {
  BarChart3,
  CalendarDays,
  Check,
  ExternalLink,
  FileUser,
  Home,
  MapPin,
  TrendingUp,
} from "@/components/icons";
import { toast } from "sonner";
import { AnalyticsBlock, AnalyticsGrid } from "@/features/analytics/components/AnalyticsBlocks";
import {
  TrendBarChart,
  type TrendBarChartPoint,
} from "@/features/analytics/components/TrendBarChart";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/i18n/I18nProvider";
import type { Locale } from "@/i18n/config";
import { localizedText, numberLocale } from "@/i18n/text";
import { getActiveCompanyId } from "@/lib/company-access";
import { cn } from "@/lib/utils";
import {
  useCompanyApplications,
  useHandleCompanyApplication,
} from "@/features/companies/hooks/useCompanies";
import {
  APPLICATION_STATUS_VALUES,
  type ApplicationStatus,
  type NewApplication,
} from "@/features/companies/services/company-service";
import { dashboardRelPath } from "../_statics/variables";

type AnsokningarProps = {
  listingId?: string | null;
};

type PortalApplication = NewApplication & {
  listingName: string;
  submittedAtTime: number;
};

type ListingApplicationGroup = {
  key: string;
  listingId?: string | number;
  title: string;
  address: string;
  city?: string;
  rent?: number;
  imageUrl?: string;
  applications: PortalApplication[];
  total: number;
  firstSubmittedAt: number;
  lastSubmittedAt: number;
  trend: TrendBarChartPoint[];
};

type HandleApplicationStatusChange = (
  application: PortalApplication,
  status: ApplicationStatus
) => void;

function formatTimestamp(value: number, locale: Locale) {
  if (!Number.isFinite(value) || value <= 0) return "-";
  return new Intl.DateTimeFormat(numberLocale(locale), {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function parseDate(value?: string) {
  if (!value) return 0;

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
}

function parseApplicationDate(application: NewApplication) {
  const timestamp = parseDate(application.submittedAt ?? application.createdAt);
  return timestamp > 0 ? new Date(timestamp) : null;
}

function toPortalApplication(application: NewApplication, locale: Locale): PortalApplication {
  const submittedAt = application.submittedAt ?? application.createdAt;

  return {
    ...application,
    listingName: application.listingTitle || application.address || localizedText(locale, "Okänd annons", "Unknown listing"),
    submittedAtTime: parseDate(submittedAt),
  };
}

function getMonthStart(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function getMonthKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}`;
}

function buildMonthlyTrend(
  applications: PortalApplication[],
  minimumMonths: number
): TrendBarChartPoint[] {
  const countsByMonth = new Map<string, number>();
  const dates = applications
    .map(parseApplicationDate)
    .filter((date): date is Date => date !== null)
    .sort((a, b) => a.getTime() - b.getTime());

  if (dates.length === 0) {
    return [];
  }

  dates.forEach((date) => {
    const key = getMonthKey(date);
    countsByMonth.set(key, (countsByMonth.get(key) ?? 0) + 1);
  });

  const earliestMonth = getMonthStart(dates[0]);
  const latestMonth = getMonthStart(new Date());
  const defaultStart = new Date(
    latestMonth.getFullYear(),
    latestMonth.getMonth() - minimumMonths + 1,
    1
  );
  const startMonth =
    earliestMonth.getTime() < defaultStart.getTime() ? earliestMonth : defaultStart;
  const points: TrendBarChartPoint[] = [];

  for (
    let cursor = new Date(startMonth);
    cursor.getTime() <= latestMonth.getTime();
    cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1)
  ) {
    points.push({
      timestamp: new Date(cursor),
      value: countsByMonth.get(getMonthKey(cursor)) ?? 0,
    });
  }

  return points;
}

function getListingGroupKey(application: PortalApplication) {
  if (application.listingId != null) {
    return String(application.listingId);
  }

  return (
    [application.listingTitle, application.address, application.listingCity]
      .filter(Boolean)
      .join("|") || application.listingName
  );
}

function buildListingGroups(
  applications: PortalApplication[],
  locale: Locale
): ListingApplicationGroup[] {
  const grouped = new Map<string, PortalApplication[]>();

  applications.forEach((application) => {
    const key = getListingGroupKey(application);
    grouped.set(key, [...(grouped.get(key) ?? []), application]);
  });

  return Array.from(grouped.entries())
    .map(([key, rows]) => {
      const sortedRows = [...rows].sort(
        (a, b) => b.submittedAtTime - a.submittedAtTime
      );
      const first = sortedRows[sortedRows.length - 1];
      const latest = sortedRows[0];

      return {
        key,
        listingId: latest.listingId,
        title: latest.listingTitle || latest.address || localizedText(locale, "Okänd annons", "Unknown listing"),
        address: latest.address || latest.listingCity || localizedText(locale, "Ingen adress", "No address"),
        city: latest.listingCity,
        rent: latest.listingRent,
        imageUrl: latest.listingImage,
        applications: sortedRows,
        total: sortedRows.length,
        firstSubmittedAt: first?.submittedAtTime ?? 0,
        lastSubmittedAt: latest?.submittedAtTime ?? 0,
        trend: buildMonthlyTrend(sortedRows, 6),
      };
    })
    .sort((a, b) => {
      if (b.total !== a.total) return b.total - a.total;
      return b.lastSubmittedAt - a.lastSubmittedAt;
    });
}

function formatRent(value: number | undefined, locale: Locale) {
  return typeof value === "number" && Number.isFinite(value)
    ? localizedText(
        locale,
        `${value.toLocaleString(numberLocale(locale))} kr/mån`,
        `SEK ${value.toLocaleString(numberLocale(locale))}/mo`
      )
    : null;
}

function getRecentCount(applications: PortalApplication[], start: Date, end: Date) {
  return applications.filter((application) => {
    const timestamp = application.submittedAtTime;
    return timestamp >= start.getTime() && timestamp < end.getTime();
  }).length;
}

function formatPercentChange(current: number, previous: number, locale: Locale) {
  if (previous === 0) {
    return current > 0 ? "+100%" : null;
  }

  const change = ((current - previous) / previous) * 100;
  const prefix = change > 0 ? "+" : "";

  return `${prefix}${change.toLocaleString(numberLocale(locale), {
    maximumFractionDigits: 1,
  })}%`;
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

const applicationStatusBadgeClassName: Record<ApplicationStatus, string> = {
  SUBMITTED: "border-gray-200 bg-gray-50 text-gray-700",
  UNDER_REVIEW: "border-amber-200 bg-amber-50 text-amber-800",
  ACCEPTED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  OFFERED: "border-sky-200 bg-sky-50 text-sky-700",
  REJECTED: "border-red-200 bg-red-50 text-red-700",
};

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
        {localizedText(locale, "Ok\u00e4nd", "Unknown")}
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

  return localizedText(locale, "S\u00f6kande", "Applicant");
}

function getApplicationDetail(application: PortalApplication, locale: Locale) {
  if (application.message) return application.message;
  if (application.studentSchool) return application.studentSchool;
  if (application.applicationId != null) {
    return localizedText(
      locale,
      `Ans\u00f6kan #${application.applicationId}`,
      `Application #${application.applicationId}`
    );
  }

  return localizedText(locale, "Ingen kommentar", "No comment");
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
  const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus>(
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

  useEffect(() => {
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
            aria-label={localizedText(locale, "V\u00e4lj status", "Choose status")}
            className="h-8 w-full min-w-[150px] rounded-lg border-gray-200 bg-white text-xs sm:w-[170px]"
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

function StatTile({
  label,
  value,
  detail,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  detail?: string | null;
  icon: ComponentType<{ className?: string }>;
  tone: "brand" | "blue" | "rose" | "amber";
}) {
  const toneClass = {
    brand: "border-brand-100 bg-brand-25/70 text-brand-600",
    blue: "border-sky-100 bg-sky-50/70 text-sky-600",
    rose: "border-rose-100 bg-rose-50/70 text-rose-600",
    amber: "border-amber-100 bg-amber-50/70 text-amber-600",
  }[tone];

  return (
    <div className={cn("min-w-0 rounded-xl border p-4", toneClass)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/70 bg-white shadow-[0_8px_20px_rgba(16,24,40,0.06)]">
          <Icon className="h-5 w-5" />
        </div>
        {detail ? (
          <span className="truncate rounded-full border border-white/80 bg-white/80 px-2 py-1 text-[11px] font-semibold text-gray-600">
            {detail}
          </span>
        ) : null}
      </div>
      <p className="mt-4 truncate text-[13px] font-medium leading-5 text-gray-500">
        {label}
      </p>
      <p className="mt-1 truncate text-[28px] font-semibold leading-8 tracking-normal text-gray-950 tabular-nums">
        {value}
      </p>
    </div>
  );
}

function ApplicationStatsGrid({
  applications,
  groups,
  locale,
}: {
  applications: PortalApplication[];
  groups: ListingApplicationGroup[];
  locale: Locale;
}) {
  const now = new Date();
  const currentStart = new Date(now);
  currentStart.setDate(currentStart.getDate() - 30);
  const previousStart = new Date(now);
  previousStart.setDate(previousStart.getDate() - 60);
  const current30 = getRecentCount(applications, currentStart, now);
  const previous30 = getRecentCount(applications, previousStart, currentStart);
  const average = groups.length > 0 ? applications.length / groups.length : 0;

  return (
    <div className="grid h-full min-w-0 grid-cols-1 gap-3 min-[520px]:grid-cols-2 xl:grid-cols-4">
      <StatTile
        detail={localizedText(locale, "alla öppna", "all open")}
        icon={FileUser}
        label={localizedText(locale, "Totalt antal ansökningar", "Total applications")}
        tone="brand"
        value={applications.length.toLocaleString(numberLocale(locale))}
      />
      <StatTile
        detail={localizedText(locale, "med ansökningar", "with applications")}
        icon={Home}
        label={localizedText(locale, "Annonser", "Listings")}
        tone="blue"
        value={groups.length.toLocaleString(numberLocale(locale))}
      />
      <StatTile
        detail={formatPercentChange(current30, previous30, locale) ?? localizedText(locale, "oför.", "unch.")}
        icon={CalendarDays}
        label={localizedText(locale, "Senaste 30 dagar", "Last 30 days")}
        tone="rose"
        value={current30.toLocaleString(numberLocale(locale))}
      />
      <StatTile
        detail={localizedText(locale, "per annons", "per listing")}
        icon={BarChart3}
        label={localizedText(locale, "Snittansökningar", "Average applications")}
        tone="amber"
        value={average.toLocaleString(numberLocale(locale), {
          maximumFractionDigits: 1,
        })}
      />
    </div>
  );
}

function LoadingApplicationsLayout({ locale }: { locale: Locale }) {
  return (
    <div className="space-y-4">
      <AnalyticsGrid>
        <AnalyticsBlock size="1x4">
          <div className="grid h-full min-w-0 grid-cols-1 gap-3 min-[520px]:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton className="h-full min-h-[120px] rounded-xl" key={index} />
            ))}
          </div>
        </AnalyticsBlock>
        <AnalyticsBlock size="2x2" title={localizedText(locale, "Ansökningstrend", "Application trend")}>
          <Skeleton className="h-full min-h-[220px] rounded-md" />
        </AnalyticsBlock>
        <AnalyticsBlock size="2x2" title={localizedText(locale, "Trending annonser", "Trending listings")}>
          <Skeleton className="h-full min-h-[220px] rounded-md" />
        </AnalyticsBlock>
      </AnalyticsGrid>

      <div className="grid min-h-[520px] gap-4 lg:h-[calc(100vh-220px)] lg:grid-cols-[340px_minmax(0,1fr)]">
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <Skeleton className="h-5 w-40 rounded" />
          <div className="mt-5 grid gap-3">
            {[0, 1, 2, 3, 4].map((item) => (
              <Skeleton className="h-20 rounded-xl" key={item} />
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <Skeleton className="h-7 w-64 rounded" />
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
          </div>
          <Skeleton className="mt-6 h-28 rounded-xl" />
          <div className="mt-6 grid gap-3">
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ListingApplicationsLayout({
  groups,
  selectedGroup,
  onSelect,
  locale,
  onStatusChange,
  pendingApplicationId,
}: {
  groups: ListingApplicationGroup[];
  selectedGroup: ListingApplicationGroup | null;
  onSelect: (key: string) => void;
  locale: Locale;
  onStatusChange: HandleApplicationStatusChange;
  pendingApplicationId: number | null;
}) {
  return (
    <div className="grid min-h-[520px] gap-4 lg:h-[calc(100vh-220px)] lg:grid-cols-[340px_minmax(0,1fr)]">
      <aside className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white">
        {groups.length === 0 ? (
          <div className="flex flex-1 items-center justify-center px-5 py-10 text-center text-theme-sm text-gray-500">
            {localizedText(locale, "Det finns inga annonser med ansökningar att visa ännu.", "There are no listings with applications to show yet.")}
          </div>
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto p-2">
            <div className="grid gap-1">
              {groups.map((group) => (
                <ListingListItem
                  group={group}
                  isSelected={selectedGroup?.key === group.key}
                  key={group.key}
                  locale={locale}
                  onSelect={() => onSelect(group.key)}
                />
              ))}
            </div>
          </div>
        )}
      </aside>

      <section className="min-h-0 overflow-hidden rounded-2xl border border-gray-200 bg-white">
        {selectedGroup ? (
          <SelectedListingDetails
            group={selectedGroup}
            locale={locale}
            onStatusChange={onStatusChange}
            pendingApplicationId={pendingApplicationId}
          />
        ) : (
          <div className="flex h-full min-h-[360px] items-center justify-center px-6 py-10 text-center text-theme-sm text-gray-500">
            {localizedText(locale, "Välj en annons i listan för att visa ansökningarna.", "Choose a listing in the list to view applications.")}
          </div>
        )}
      </section>
    </div>
  );
}

function TrendingListings({ groups, locale }: { groups: ListingApplicationGroup[]; locale: Locale }) {
  const topGroups = groups.slice(0, 5);

  if (topGroups.length === 0) {
    return (
      <div className="flex h-full items-center justify-center rounded-md border border-dashed border-gray-200 px-4 text-center text-sm text-gray-500">
        {localizedText(locale, "Det finns inga annonser med ansökningar ännu.", "There are no listings with applications yet.")}
      </div>
    );
  }

  return (
    <div className="space-y-3 overflow-y-auto pr-1">
      {topGroups.map((group, index) => (
        <div
          className="flex min-w-0 items-center gap-3 rounded-xl border border-gray-100 bg-white p-3 shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
          key={group.key}
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-50 text-sm font-semibold text-gray-700">
            {index + 1}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-gray-950">
              {group.title}
            </p>
            <p className="mt-0.5 truncate text-xs text-gray-500">
              {group.address}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-lg font-semibold leading-6 text-gray-950 tabular-nums">
              {group.total.toLocaleString(numberLocale(locale))}
            </p>
            <p className="text-xs text-gray-500">{localizedText(locale, "ans.", "apps")}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function ListingListItem({
  group,
  isSelected,
  onSelect,
  locale,
}: {
  group: ListingApplicationGroup;
  isSelected: boolean;
  onSelect: () => void;
  locale: Locale;
}) {
  return (
    <button
      type="button"
      aria-pressed={isSelected}
      className={cn(
        "relative w-full rounded-lg px-3 py-3 pl-4 text-left transition-colors",
        isSelected
          ? "bg-[#004225]/5 text-[#004225]"
          : "text-gray-700 hover:bg-gray-50"
      )}
      onClick={onSelect}
    >
      {isSelected ? (
        <span className="absolute bottom-2 left-1.5 top-2 w-1 rounded-full bg-[#004225]" />
      ) : null}

      <span className="block truncate text-sm font-semibold">{group.title}</span>
      <span className="mt-1 block truncate text-xs text-gray-500">
        {group.city || localizedText(locale, "Stad saknas", "City missing")}
      </span>
    </button>
  );
}

function SelectedListingDetails({
  group,
  locale,
  onStatusChange,
  pendingApplicationId,
}: {
  group: ListingApplicationGroup;
  locale: Locale;
  onStatusChange: HandleApplicationStatusChange;
  pendingApplicationId: number | null;
}) {
  const href =
    group.listingId != null
      ? `${dashboardRelPath}/listings/${encodeURIComponent(String(group.listingId))}`
      : null;
  const rent = formatRent(group.rent, locale);
  const facts = [group.city, rent].filter(Boolean).join(" · ");

  return (
    <div className="h-full min-h-0 overflow-y-auto px-5 py-5 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="flex min-w-0 flex-col gap-4 border-b border-gray-100 pb-5 md:flex-row md:items-start">
          <div className="relative h-28 w-full shrink-0 overflow-hidden rounded-xl bg-gray-100 md:w-44">
            {group.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
                src={group.imageUrl}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-brand-50 text-xs font-semibold text-brand-500">
                {localizedText(locale, "Ingen bild", "No image")}
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <h2 className="break-words text-xl font-semibold text-gray-900">
                  {group.title}
                </h2>
                <p className="mt-2 flex min-w-0 items-center gap-2 text-theme-sm text-gray-500">
                  <MapPin className="h-4 w-4 shrink-0" />
                  <span className="truncate">{group.address}</span>
                </p>
                {facts ? (
                  <p className="mt-1 text-theme-sm text-gray-500">{facts}</p>
                ) : null}
              </div>

              <div className="shrink-0 sm:text-right">
                {href ? (
                  <Link
                    className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-gray-200 bg-white px-3 text-sm font-medium text-gray-900 transition hover:bg-gray-50"
                    href={href}
                  >
                    <ExternalLink className="h-4 w-4" />
                    {localizedText(locale, "Öppna annons", "Open listing")}
                  </Link>
                ) : null}
                <div className="mt-3">
                  <p className="text-xs font-medium text-gray-500">
                    {localizedText(locale, "Totalt antal ansökningar", "Total applications")}
                  </p>
                  <p className="mt-0.5 text-xl font-semibold leading-7 text-gray-950 tabular-nums">
                    {group.total.toLocaleString(numberLocale(locale))}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-gray-950">{localizedText(locale, "Ansökningar", "Applications")}</h3>
          <div className="mt-3 grid gap-2">
            {group.applications.map((application) => (
              <div
                className="grid gap-3 rounded-lg border border-gray-100 bg-gray-50/70 px-4 py-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
                key={`${application.applicationId ?? application.id}-${application.submittedAtTime}`}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-gray-900">
                    {getApplicantDisplayName(application, locale)}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-gray-500">
                    {getApplicationDetail(application, locale)}
                  </p>
                </div>
                <div className="flex min-w-0 flex-col gap-2 sm:items-end">
                  <ApplicationStatusControl
                    application={application}
                    locale={locale}
                    onStatusChange={onStatusChange}
                    pendingApplicationId={pendingApplicationId}
                  />
                  <span className="shrink-0 text-xs font-medium text-gray-500">
                    {formatTimestamp(application.submittedAtTime, locale)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Ansokningar({
  listingId = null,
}: AnsokningarProps) {
  const { locale } = useI18n();
  const { user, isLoading: authLoading } = useAuth();
  const companyId = getActiveCompanyId(user);
  const [selectedListingKey, setSelectedListingKey] = useState<string | null>(null);
  const handleApplicationMutation = useHandleCompanyApplication();

  const applicationsQuery = useCompanyApplications(companyId, {
    enabled: !authLoading,
  });
  const applications = useMemo(
    () =>
      (applicationsQuery.data ?? [])
        .map((application) => toPortalApplication(application, locale))
        .sort((a, b) => b.submittedAtTime - a.submittedAtTime),
    [applicationsQuery.data, locale]
  );
  const loading = applicationsQuery.isLoading;
  const error = applicationsQuery.isError
    ? applicationsQuery.error instanceof Error
      ? applicationsQuery.error.message
      : localizedText(locale, "Kunde inte h\u00e4mta ans\u00f6kningar.", "Could not load applications.")
    : null;
  const visibleApplications = useMemo(() => {
    if (!listingId) {
      return applications;
    }

    return applications.filter(
      (application) => String(application.listingId ?? "") === String(listingId)
    );
  }, [applications, listingId]);

  const listingGroups = useMemo(
    () => buildListingGroups(visibleApplications, locale),
    [locale, visibleApplications]
  );
  const applicationTrend = useMemo(
    () => buildMonthlyTrend(visibleApplications, 12),
    [visibleApplications]
  );
  const showOverviewAnalytics = !listingId;

  useEffect(() => {
    if (listingGroups.length === 0) {
      setSelectedListingKey(null);
      return;
    }

    setSelectedListingKey((current) => {
      if (current && listingGroups.some((group) => group.key === current)) {
        return current;
      }

      return listingGroups[0].key;
    });
  }, [listingGroups]);

  const selectedGroup = useMemo(() => {
    if (!selectedListingKey) return listingGroups[0] ?? null;
    return (
      listingGroups.find((group) => group.key === selectedListingKey) ??
      listingGroups[0] ??
      null
    );
  }, [listingGroups, selectedListingKey]);
  const pendingApplicationId = handleApplicationMutation.isPending
    ? handleApplicationMutation.variables?.payload.applicationId ?? null
    : null;

  const handleStatusChange: HandleApplicationStatusChange = (
    application,
    newStatus
  ) => {
    if (!companyId) {
      toast.error(
        localizedText(
          locale,
          "F\u00f6retagskonto saknas.",
          "Company account is missing."
        )
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
          "Ans\u00f6kan saknar n\u00f6dv\u00e4ndiga id:n.",
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
              "Ans\u00f6kningsstatus uppdaterades.",
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
                  "Kunde inte uppdatera ans\u00f6kningsstatus.",
                  "Could not update application status."
                )
          );
        },
      }
    );
  };

  if (authLoading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 text-sm text-gray-500">
        {localizedText(locale, "Laddar ansökningar...", "Loading applications...")}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
        {localizedText(locale, "Logga in för att se företagets ansökningar.", "Log in to view the company's applications.")}
      </div>
    );
  }

  if (!companyId) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
        {localizedText(locale, "Denna sida är bara tillgänglig för företagskonton.", "This page is only available for company accounts.")}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          {localizedText(locale, "Ansökningar", "Applications")}
        </h1>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <LoadingApplicationsLayout locale={locale} />
      ) : (
        <>
          {showOverviewAnalytics ? (
            <AnalyticsGrid>
              <AnalyticsBlock size="1x4">
                <ApplicationStatsGrid
                  applications={visibleApplications}
                  groups={listingGroups}
                  locale={locale}
                />
              </AnalyticsBlock>

              <AnalyticsBlock size="2x2" title={localizedText(locale, "Ansökningstrend", "Application trend")}>
                <TrendBarChart
                  data={applicationTrend}
                  defaultInterval="1m"
                  embedded
                  emptyMessage={localizedText(locale, "Det finns inga ansökningar registrerade ännu.", "There are no applications registered yet.")}
                  showHeader={false}
                  showSummary={false}
                  title={localizedText(locale, "Ansökningstrend", "Application trend")}
                  valueLabel={localizedText(locale, "Ansökningar", "Applications")}
                />
              </AnalyticsBlock>

              <AnalyticsBlock
                action={<TrendingUp className="h-5 w-5 text-brand-500" />}
                contentClassName="overflow-hidden"
                size="2x2"
                title={localizedText(locale, "Trending annonser", "Trending listings")}
              >
                <TrendingListings groups={listingGroups} locale={locale} />
              </AnalyticsBlock>
            </AnalyticsGrid>
          ) : null}

          <ListingApplicationsLayout
            groups={listingGroups}
            selectedGroup={selectedGroup}
            locale={locale}
            onSelect={setSelectedListingKey}
            onStatusChange={handleStatusChange}
            pendingApplicationId={pendingApplicationId}
          />
        </>
      )}
    </div>
  );
}
