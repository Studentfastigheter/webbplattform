"use client";

import {
  useEffect,
  useMemo,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowDownRight,
  ArrowLeft,
  ArrowUpRight,
  BarChart3,
  CircleCheck,
  CirclePause,
  Edit3,
  Eye,
  FileText,
  FileUser,
  Heart,
  Home,
  ImageIcon,
  MapPin,
  Percent,
  Trash2,
} from "@/components/icons";
import BostadAbout from "@/features/ads/components/BostadAbout";
import BostadImagePreviewGrid from "@/features/ads/components/BostadImagePreviewGrid";
import {
  AnalyticsBlock,
  AnalyticsGrid,
  type AnalyticsBlockSize,
} from "@/features/analytics/components/AnalyticsBlocks";
import {
  PORTAL_BAR_COLOR,
  PortalBarChartSkeleton,
  PortalBarChartState,
  PortalVerticalBarChart,
} from "@/features/analytics/components/PortalBarCharts";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { RichTextParagraph } from "@/components/ui/RichText";
import { useAuth } from "@/context/AuthContext";
import { getActiveCompanyId } from "@/lib/company-access";
import {
  type ApplicationStatisticEntry,
  type ListingAnalyticsPerformance,
} from "@/features/companies/services/company-service";
import {
  useCompanyListingPerformanceDetail,
  useTimedApplicationsForListing,
} from "@/features/companies/hooks/useCompanies";
import { useListingDemography } from "@/features/analytics/hooks/useDemographics";
import { useAllCompanyListings } from "@/features/queues/hooks/useQueues";
import {
  useDeleteListing,
  useListing,
  useRequirementsProfile,
  useUpdateListing,
} from "@/features/listings/hooks/useListings";
import {
  type ListingCardDTO,
  type ListingDetailDTO,
  type ListingStatus,
  type RequirementsProfileDTO,
} from "@/types/listing";
import PortalListingStatusTag, {
  type PortalListingStatusTone,
} from "../../_components/shared/PortalListingStatusTag";
import {
  ApplicationIntervalToggle,
  getApplicationIntervalRange,
  getLocalizedApplicationInterval,
  sumApplicationStatistics,
  type ApplicationIntervalValue,
} from "../../_components/analytics/ApplicationIntervalStats";
import ListingDemographicsPanel from "../../_components/analytics/ListingDemographicsPanel";
import ApplicationDemographicsPanel from "../../_components/analytics/ApplicationDemographicsPanel";
import { dashboardRelPath } from "../../_statics/variables";
import { useI18n } from "@/i18n/I18nProvider";
import type { Locale } from "@/i18n/config";
import { localizedText, numberLocale } from "@/i18n/text";
import { cn } from "@/lib/utils";

type ListingOverviewViewProps = {
  id: string;
};

type RawListing = ListingCardDTO & Record<string, unknown>;
type ListingActionState = "idle" | "status" | "delete";

type ListingMeta = {
  applications: number;
  quickViews: number;
  detailedViews: number;
  publishedAt: string;
  updatedAt: string;
  statusLabel: string;
  statusTone: PortalListingStatusTone;
  statusValue: ListingStatus | null;
};

function HeaderStat({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: ReactNode;
}) {
  return (
    <span className="inline-flex min-w-0 items-center gap-1.5 text-sm text-gray-500">
      <Icon className="h-4 w-4 shrink-0 text-gray-400" />
      <span className="font-semibold tabular-nums text-gray-900">{value}</span>
      <span className="truncate">{label}</span>
    </span>
  );
}

const emptyMeta: ListingMeta = {
  applications: 0,
  quickViews: 0,
  detailedViews: 0,
  publishedAt: "-",
  updatedAt: "-",
  statusLabel: "Okänd",
  statusTone: "neutral",
  statusValue: null,
};

const listingStatusOptions: Array<{
  value: ListingStatus;
  labelSv: string;
  labelEn: string;
  icon: typeof CircleCheck;
}> = [
  { value: "AVAILABLE", labelSv: "Tillgänglig", labelEn: "Available", icon: CircleCheck },
  { value: "HIDDEN", labelSv: "Dold", labelEn: "Hidden", icon: CirclePause },
  { value: "RENTED", labelSv: "Uthyrd", labelEn: "Rented", icon: Home },
];

function statusOptionLabel(
  option: (typeof listingStatusOptions)[number],
  locale: Locale
) {
  return localizedText(locale, option.labelSv, option.labelEn);
}

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

function pickNumber(source: Record<string, unknown>, paths: string[]): number | undefined {
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

function pickString(source: Record<string, unknown>, paths: string[]): string | undefined {
  for (const path of paths) {
    const value = readPath(source, path);
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }

  return undefined;
}

function mapStatus(statusRaw: string | undefined, locale: Locale): {
  label: string;
  tone: PortalListingStatusTone;
  value: ListingStatus | null;
} {
  const status = statusRaw?.toLowerCase().trim();
  const compactStatus = status?.replace(/[\s_-]+/g, "");

  if (
    compactStatus &&
    [
      "active",
      "aktiv",
      "available",
      "published",
      "publicerad",
      "open",
      "live",
    ].includes(compactStatus)
  ) {
    return {
      label: localizedText(locale, "Tillgänglig", "Available"),
      tone: "success",
      value: "AVAILABLE",
    };
  }

  if (
    compactStatus &&
    [
      "rented",
      "rentedout",
      "uthyrd",
      "closed",
      "expired",
    ].includes(compactStatus)
  ) {
    return {
      label: localizedText(locale, "Uthyrd", "Rented"),
      tone: "neutral",
      value: "RENTED",
    };
  }

  if (
    compactStatus &&
    [
      "paused",
      "hidden",
      "dold",
      "gomd",
      "gömd",
      "inactive",
      "inaktiv",
      "archived",
      "draft",
      "coming",
    ].includes(compactStatus)
  ) {
    return {
      label: localizedText(locale, "Dold", "Hidden"),
      tone: "warning",
      value: "HIDDEN",
    };
  }

  return {
    label: statusRaw ?? localizedText(locale, "Okänd", "Unknown"),
    tone: "neutral",
    value: null,
  };
}

function formatDate(value: string | null | undefined, locale: Locale): string {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";

  return new Intl.DateTimeFormat(numberLocale(locale), {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(parsed);
}

function formatNumber(value: number, locale: Locale): string {
  return value.toLocaleString(numberLocale(locale));
}

function formatCurrency(value: number | null | undefined, locale: Locale): string {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "-";
  }

  const amount = value.toLocaleString(numberLocale(locale));
  return localizedText(locale, `${amount} kr/mån`, `SEK ${amount}/mo`);
}

function formatArea(value: number | null | undefined, locale: Locale): string {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "-";
  }

  return `${value.toLocaleString(numberLocale(locale))} m²`;
}

function formatDwellingType(value: string | null | undefined, locale: Locale): string {
  const labels: Record<string, { sv: string; en: string }> = {
    APARTMENT: { sv: "Lägenhet", en: "Apartment" },
    ROOM: { sv: "Rum", en: "Room" },
    CORRIDOR_ROOM: { sv: "Korridorsrum", en: "Corridor room" },
    apartment: { sv: "Lägenhet", en: "Apartment" },
    room: { sv: "Rum", en: "Room" },
    corridor_room: { sv: "Korridorsrum", en: "Corridor room" },
  };

  if (!value) return "-";
  const label = labels[value];
  return label ? localizedText(locale, label.sv, label.en) : value;
}

function resolveApplicationCount(
  listing: ListingDetailDTO,
  companyListing: RawListing | null,
  listingPerformance: ListingAnalyticsPerformance | null
): number {
  if (listingPerformance) {
    return listingPerformance.currentApplications;
  }

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

  const fromListing = pickNumber(listing as unknown as Record<string, unknown>, [
    "applications",
    "applicationCount",
    "applicationsCount",
    "numApplications",
    "stats.applications",
    "analytics.applications",
    "statistics.applications",
  ]);

  return fromListing ?? 0;
}

function resolveListingMeta(
  listing: ListingDetailDTO,
  companyListing: RawListing | null,
  listingPerformance: ListingAnalyticsPerformance | null,
  locale: Locale
): ListingMeta {
  const rawDetail = listing as unknown as Record<string, unknown>;
  const publishedAtRaw =
  (companyListing ? pickString(companyListing, ["published"]) : undefined) ??
  pickString(rawDetail, ["published"]);
  const updatedAtRaw =
    (companyListing
      ? pickString(companyListing, ["updatedAt", "modifiedAt", "lastEditedAt"])
      : undefined) ?? pickString(rawDetail, ["updatedAt", "modifiedAt", "lastEditedAt"]);
  const { label, tone, value } = mapStatus(
    listingPerformance?.status ??
    (companyListing
      ? pickString(companyListing, ["status", "listingStatus", "state"])
      : undefined) ?? pickString(rawDetail, ["status", "listingStatus", "state"]),
    locale
  );

  return {
    applications: resolveApplicationCount(listing, companyListing, listingPerformance),
    quickViews:
      listingPerformance?.lifetimeQuickViews ??
      (companyListing
        ? pickNumber(companyListing, [
            "quickViews",
            "quickViewCount",
            "quickViewsCount",
            "stats.quickViews",
            "analytics.quickViews",
            "statistics.quickViews",
            "views",
            "viewCount",
            "viewsCount",
            "viewings",
            "viewingsCount",
          ])
        : undefined) ??
      0,
    detailedViews:
      listingPerformance?.lifetimeDetailedViews ??
      (companyListing
        ? pickNumber(companyListing, [
            "detailedViews",
            "detailedViewCount",
            "detailedViewsCount",
            "stats.detailedViews",
            "analytics.detailedViews",
            "statistics.detailedViews",
            "clicks",
            "clickCount",
            "clicksCount",
          ])
        : undefined) ??
      0,
    publishedAt: formatDate(publishedAtRaw, locale),
    updatedAt: formatDate(updatedAtRaw, locale),
    statusLabel: label,
    statusTone: tone,
    statusValue: value,
  };
}

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-1 border-b border-gray-100 py-3 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] sm:gap-4">
      <dt className="text-sm text-gray-500">{label}</dt>
      <dd className="min-w-0 break-words text-sm font-medium text-gray-900 sm:text-right">{value}</dd>
    </div>
  );
}

function formatAgeRange(profile: RequirementsProfileDTO, locale: Locale): string {
  const parts = [
    typeof profile.minAge === "number"
      ? `${localizedText(locale, "Min", "Min")} ${profile.minAge} ${localizedText(locale, "år", "years")}`
      : null,
    typeof profile.maxAge === "number"
      ? `${localizedText(locale, "Max", "Max")} ${profile.maxAge} ${localizedText(locale, "år", "years")}`
      : null,
  ].filter(Boolean);

  return parts.length > 0
    ? parts.join(" / ")
    : localizedText(locale, "Inga ålderskrav", "No age requirements");
}

function RequirementProfileCard({
  locale,
  profile,
  profileId,
}: {
  locale: Locale;
  profile: RequirementsProfileDTO | null;
  profileId?: string | null;
}) {
  return (
    <section className="portal-surface p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-gray-700">
            <FileText className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              {localizedText(locale, "Kravprofil", "Requirement profile")}
            </p>
            <h2 className="mt-1 text-lg font-semibold text-gray-900">
              {profile?.title ||
                (profileId
                  ? localizedText(locale, "Kopplad kravprofil", "Linked requirement profile")
                  : localizedText(locale, "Ingen kravprofil", "No requirement profile"))}
            </h2>
          </div>
        </div>
      </div>

      {!profile ? (
        <p className="mt-4 text-sm leading-6 text-gray-500">
          {profileId
            ? localizedText(
                locale,
                "Kravprofilen kunde inte laddas från backend.",
                "The requirement profile could not be loaded from the backend."
              )
            : localizedText(
                locale,
                "Annonsen har ingen kravprofil kopplad.",
                "This listing has no linked requirement profile."
              )}
        </p>
      ) : (
        <div className="mt-4 space-y-4">
          <div className="portal-inner-surface px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              {localizedText(locale, "Ålderskrav", "Age requirements")}
            </p>
            <p className="mt-1 text-sm font-semibold text-gray-900">
              {formatAgeRange(profile, locale)}
            </p>
          </div>

          {profile.description ? (
            <RichTextParagraph
              text={profile.description}
              className="text-sm leading-6 text-gray-600"
            />
          ) : null}

          {profile.requiredDocuments?.length ? (
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {localizedText(locale, "Obligatoriska dokument", "Required documents")}
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {profile.requiredDocuments.map((document, index) => (
                  <div
                    className="portal-inner-surface px-4 py-3"
                    key={`${document.caption ?? "document"}-${index}`}
                  >
                    <p className="text-sm font-medium text-gray-900">
                      {document.caption ?? localizedText(locale, "Dokument", "Document")}
                    </p>
                    <p className="mt-1 text-xs font-medium uppercase tracking-wide text-gray-400">
                      {document.validTypes?.join(", ") ||
                        localizedText(locale, "Valfri filtyp", "Any file type")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              {localizedText(locale, "Inga dokumentkrav angivna.", "No document requirements specified.")}
            </p>
          )}
        </div>
      )}
    </section>
  );
}

function ListingDetailsCard({
  locale,
  listing,
  meta,
}: {
  locale: Locale;
  listing: ListingDetailDTO;
  meta: ListingMeta;
}) {
  return (
    <section className="portal-surface p-5">
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="mt-1 text-base font-semibold text-gray-950">
            {localizedText(locale, "Översikt", "Overview")}
          </h2>
        </div>
        <PortalListingStatusTag
          label={meta.statusLabel}
          tone={meta.statusTone}
          className="w-fit shrink-0 border-gray-200 bg-gray-50 text-gray-700 shadow-none ring-0"
        />
      </div>
      <dl className="mt-4">
        <DetailRow label={localizedText(locale, "Hyra", "Rent")} value={formatCurrency(listing.rent, locale)} />
        <DetailRow label={localizedText(locale, "Rum", "Rooms")} value={listing.rooms || "-"} />
        <DetailRow label={localizedText(locale, "Yta", "Area")} value={formatArea(listing.sizeM2, locale)} />
        <DetailRow
          label={localizedText(locale, "Bostadstyp", "Dwelling type")}
          value={formatDwellingType(listing.dwellingType, locale)}
        />
        <DetailRow label={localizedText(locale, "Område", "Area")} value={listing.area || "-"} />
        <DetailRow label={localizedText(locale, "Stad", "City")} value={listing.city || "-"} />
        <DetailRow label={localizedText(locale, "Tillgänglig från", "Available from")} value={listing.availableFrom || "-"} />
        <DetailRow label={localizedText(locale, "Tillgänglig till", "Available until")} value={listing.availableTo || "-"} />
        <DetailRow label={localizedText(locale, "Sista ansökan", "Application deadline")} value={listing.applyBy || "-"} />
        <DetailRow label={localizedText(locale, "Publicerad", "Published")} value={meta.publishedAt} />
        <DetailRow label={localizedText(locale, "Senast ändrad", "Last updated")} value={meta.updatedAt} />
      </dl>
    </section>
  );
}

function ListingPreview({
  listing,
  images,
  locale,
}: {
  listing: ListingDetailDTO;
  images: string[];
  locale: Locale;
}) {
  return (
    <section className="space-y-4">
      {images.length ? (
        <BostadImagePreviewGrid images={images} readOnly />
      ) : (
        <div className="flex h-[320px] items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 text-sm text-gray-500">
          <div className="flex flex-col items-center gap-2">
            <ImageIcon className="h-8 w-8 text-gray-300" />
            {localizedText(locale, "Ingen bild uppladdad", "No image uploaded")}
          </div>
        </div>
      )}

      <BostadAbout listing={listing} hideStudentActions />
    </section>
  );
}

// ---------------------------------------------------------------------------
// Analytics tab — inline below
// ---------------------------------------------------------------------------

type MetricTone = "green" | "sky" | "rose" | "amber" | "teal" | "violet";

type AnalyticsMetricItem = {
  key: string;
  label: string;
  value: number;
  valueLabel?: string;
  helper?: string;
  change: number | null;
  icon: React.ComponentType<{ className?: string }>;
  tone: MetricTone;
};

// Tone palette is taken from the company-wide analytics page
// (DemographicsEndpointBlocks: #16a34a / #38bdf8 / #fb7185 / #fbbf24 /
// #2dd4bf / #a78bfa). No dark-green brand tone — that's reserved for the
// site chrome and would clash with the chart palette.
const metricToneClass: Record<
  MetricTone,
  { tile: string; icon: string; accent: string }
> = {
  green: {
    tile: "",
    icon: "border-green-100 bg-green-50 text-green-600",
    accent: "from-green-500/20",
  },
  sky: {
    tile: "",
    icon: "border-sky-100 bg-sky-50 text-sky-500",
    accent: "from-sky-400/20",
  },
  rose: {
    tile: "",
    icon: "border-rose-100 bg-rose-50 text-rose-500",
    accent: "from-rose-400/20",
  },
  amber: {
    tile: "",
    icon: "border-amber-100 bg-amber-50 text-amber-500",
    accent: "from-amber-400/20",
  },
  teal: {
    tile: "",
    icon: "border-teal-100 bg-teal-50 text-teal-500",
    accent: "from-teal-400/20",
  },
  violet: {
    tile: "",
    icon: "border-violet-100 bg-violet-50 text-violet-500",
    accent: "from-violet-400/20",
  },
};

function formatChangeText(change: number | null, locale: Locale) {
  if (change === null) return null;
  const prefix = change > 0 ? "+" : "";
  return `${prefix}${change.toLocaleString(numberLocale(locale), {
    maximumFractionDigits: 1,
  })}%`;
}

function TrendBadge({
  change,
  locale,
}: {
  change: number | null;
  locale: Locale;
}) {
  const formatted = formatChangeText(change, locale);

  if (!formatted) {
    return null;
  }

  const positive = (change ?? 0) >= 0;
  const Icon = positive ? ArrowUpRight : ArrowDownRight;

  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1 rounded-full border px-2 text-[11px] font-semibold leading-none shadow-[0_1px_2px_rgba(16,24,40,0.04)]",
        positive
          ? "border-success-500/15 bg-success-50 text-success-700"
          : "border-error-500/15 bg-error-50 text-error-700"
      )}
    >
      <Icon className="h-3 w-3" />
      {formatted}
    </span>
  );
}

function MetricTile({
  item,
  locale,
}: {
  item: AnalyticsMetricItem;
  locale: Locale;
}) {
  const Icon = item.icon;
  const tone = metricToneClass[item.tone];
  const valueLabel =
    item.valueLabel ?? item.value.toLocaleString(numberLocale(locale));

  return (
    <div
      className={cn(
        "portal-inner-surface relative min-h-[116px] min-w-0 overflow-hidden p-4 transition-colors hover:border-gray-300",
        tone.tile
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r to-transparent",
          tone.accent
        )}
      />

      <div className="flex min-w-0 items-start justify-between gap-2">
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border",
            tone.icon
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <TrendBadge change={item.change} locale={locale} />
      </div>

      <div className="mt-3 min-w-0">
        <p className="truncate text-theme-sm font-medium text-gray-500">
          {item.label}
        </p>
        <p className="mt-1 truncate text-2xl font-bold leading-8 tracking-normal text-gray-800 tabular-nums">
          {valueLabel}
        </p>
        {item.helper ? (
          <p className="mt-1 truncate text-[11px] font-medium leading-4 text-gray-400">
            {item.helper}
          </p>
        ) : null}
      </div>
    </div>
  );
}

type TrendPoint = { timestamp: Date; value: number };

function applicationStatisticsToTrendPoints(
  entries: ApplicationStatisticEntry[]
): TrendPoint[] {
  return entries
    .flatMap((entry) => {
      const timestamp = new Date(entry.year, entry.month - 1, entry.day ?? 1);
      return Number.isNaN(timestamp.getTime())
        ? []
        : [{ timestamp, value: entry.numApplications }];
    })
    .sort((left, right) => left.timestamp.getTime() - right.timestamp.getTime());
}

function ApplicationTrendCard({
  data,
  error,
  loading,
  locale,
  periodLabel,
  size = "2x4",
  total,
}: {
  data: TrendPoint[];
  error: string | null;
  loading: boolean;
  locale: Locale;
  periodLabel: string;
  size?: AnalyticsBlockSize;
  total: number;
}) {
  const chartData = useMemo(
    () =>
      data.map((point) => ({
        label: point.timestamp.toLocaleDateString(numberLocale(locale), {
          day: "numeric",
          month: "short",
        }),
        fullLabel: point.timestamp.toLocaleDateString(numberLocale(locale), {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
        value: point.value,
      })),
    [data, locale]
  );
  const hasData = chartData.length > 0;

  return (
    <AnalyticsBlock
      action={
        <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-600">
          <span
            aria-hidden="true"
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: PORTAL_BAR_COLOR }}
          />
          {localizedText(
            locale,
            `${formatNumber(total, locale)} ansökningar`,
            `${formatNumber(total, locale)} applications`
          )}
        </div>
      }
      description={localizedText(
        locale,
        `Mottagna ansökningar ${periodLabel}.`,
        `Received applications during ${periodLabel}.`
      )}
      contentClassName="overflow-hidden"
      size={size}
      title={localizedText(locale, "Ansökningstrend", "Application trend")}
    >
      {loading ? (
        <PortalBarChartSkeleton className="h-[240px]" />
      ) : error ? (
        <PortalBarChartState className="h-[240px]" tone="error">
          {error}
        </PortalBarChartState>
      ) : !hasData ? (
        <PortalBarChartState className="h-[240px]">
          {localizedText(
            locale,
            "Det finns inga ansökningar registrerade för perioden.",
            "There are no applications registered for this period."
          )}
        </PortalBarChartState>
      ) : (
        <PortalVerticalBarChart
          data={chartData}
          heightClassName="h-[240px]"
          labelFormatter={(entry) => entry.fullLabel}
          margin={{ top: 12, right: 8, left: 0, bottom: 0 }}
          maxBarSize={30}
          minWidthClassName={
            chartData.length > 14 ? "min-w-[720px]" : "min-w-full"
          }
          valueFormatter={(value) => formatNumber(value, locale)}
          valueLabel={localizedText(locale, "Ansökningar", "Applications")}
          xAxisInterval={chartData.length > 14 ? "preserveStartEnd" : 0}
          yAxisWidth={34}
        />
      )}
    </AnalyticsBlock>
  );
}

export default function ListingOverviewView({ id }: ListingOverviewViewProps) {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { locale } = useI18n();
  // Action state for the status / delete mutations; meta still mirrors locally
  // so the chip flips immediately after a status change without waiting for an
  // invalidation roundtrip.
  const [meta, setMeta] = useState<ListingMeta>(emptyMeta);
  const [metaInitialized, setMetaInitialized] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [actionState, setActionState] = useState<ListingActionState>("idle");
  const [applicationInterval, setApplicationInterval] =
    useState<ApplicationIntervalValue>("1m");

  const companyId = getActiveCompanyId(user);

  // Core reads — every query has an `enabled` gate so we don't fire while
  // auth is loading or before we know the company id.
  const {
    data: listing = null,
    isLoading: listingLoading,
    isError: isListingError,
    error: listingErr,
  } = useListing(id, { enabled: !authLoading });
  const { data: companyListings = [] } = useAllCompanyListings(companyId, 0, 200);
  const { data: listingPerformance = null } = useCompanyListingPerformanceDetail(
    companyId,
    id || null,
    { enabled: !authLoading && Boolean(id) }
  );
  const { data: requirementsProfile = null } = useRequirementsProfile(
    listing?.requirementsProfileId ?? null,
  );

  const isOwnListing = useMemo(
    () =>
      listing
        ? (companyListings as RawListing[]).some(
            (item) => String(item.id) === String(listing.id),
          )
        : true,
    [companyListings, listing],
  );

  // Recompute meta from server data unless a local mutation (status change)
  // has overridden it. `metaInitialized` is false until the listing arrives,
  // then becomes true; the status mutation pushes a transient override and
  // the next read replaces it.
  const computedMeta = useMemo<ListingMeta>(() => {
    if (!listing) return emptyMeta;
    const matchedCompanyListing =
      (companyListings as RawListing[]).find(
        (item) => String(item.id) === String(listing.id),
      ) ?? null;
    return resolveListingMeta(
      listing,
      matchedCompanyListing,
      listingPerformance,
      locale,
    );
  }, [listing, companyListings, listingPerformance, locale]);

  useEffect(() => {
    if (!metaInitialized && listing) {
      setMeta(computedMeta);
      setMetaInitialized(true);
    } else if (metaInitialized && actionState === "idle") {
      setMeta(computedMeta);
    }
  }, [computedMeta, listing, metaInitialized, actionState]);

  const loading = authLoading || listingLoading;
  const error =
    isListingError && listingErr
      ? listingErr instanceof Error
        ? listingErr.message
        : localizedText(locale, "Kunde inte ladda annonsen.", "Could not load the listing.")
      : null;

  const editHref = `${dashboardRelPath}/listings/${encodeURIComponent(id)}/edit`;
  const applicationsHref = `${dashboardRelPath}/applications?listingId=${encodeURIComponent(id)}`;
  const galleryImages = useMemo(
    () => listing?.imageUrls?.filter(Boolean) ?? [],
    [listing]
  );

  // ---- Analytics tab: range + trend data ----
  const analyticsRange = useMemo(
    () => getApplicationIntervalRange(applicationInterval),
    [applicationInterval]
  );
  const analyticsFromIso = analyticsRange.from.toISOString();
  const analyticsToIso = analyticsRange.to.toISOString();
  const localizedAnalyticsInterval = useMemo(
    () => getLocalizedApplicationInterval(locale, applicationInterval),
    [applicationInterval, locale]
  );

  const timedApplicationsQuery = useTimedApplicationsForListing(
    companyId,
    analyticsFromIso,
    analyticsToIso,
    id || null
  );
  const periodApplicationsCount = useMemo(
    () =>
      timedApplicationsQuery.data
        ? sumApplicationStatistics(timedApplicationsQuery.data)
        : 0,
    [timedApplicationsQuery.data]
  );
  const applicationTrendPoints = useMemo(
    () =>
      timedApplicationsQuery.data
        ? applicationStatisticsToTrendPoints(timedApplicationsQuery.data)
        : [],
    [timedApplicationsQuery.data]
  );
  const applicationTrendError = timedApplicationsQuery.isError
    ? timedApplicationsQuery.error instanceof Error
      ? timedApplicationsQuery.error.message
      : localizedText(
          locale,
          "Kunde inte hämta ansökningar för perioden.",
          "Could not fetch applications for the period."
        )
    : null;

  const favoritesDemographyQuery = useListingDemography(
    companyId,
    id || null,
    analyticsFromIso,
    analyticsToIso,
    "RESULTED_IN_LIKE",
    Boolean(companyId) && Boolean(id)
  );
  const analyticsFavorites =
    favoritesDemographyQuery.data?.buckets?.find(
      (bucket) => String(bucket.key) === "true"
    )?.totalViews ?? 0;
  const analyticsMetrics: AnalyticsMetricItem[] = useMemo(() => {
    const clickThroughRate =
      meta.quickViews > 0 ? (meta.detailedViews / meta.quickViews) * 100 : 0;
    const applicationRate =
      meta.detailedViews > 0
        ? (meta.applications / meta.detailedViews) * 100
        : 0;

    const metrics: AnalyticsMetricItem[] = [
      {
        key: "applications",
        label: localizedText(locale, "Ansökningar", "Applications"),
        value: meta.applications,
        helper: localizedText(locale, "Totalt mottagna", "Total received"),
        change: null,
        icon: FileUser,
        tone: "green",
      },
      {
        key: "detailed",
        label: localizedText(locale, "Visningar", "Views"),
        value: meta.detailedViews,
        helper: localizedText(locale, "Öppningar av annonsen", "Listing opens"),
        change: null,
        icon: Eye,
        tone: "sky",
      },
      {
        key: "click-through-rate",
        label: localizedText(locale, "Klickfrekvens", "Click-through rate"),
        value: clickThroughRate,
        valueLabel: `${clickThroughRate.toLocaleString(numberLocale(locale), {
          maximumFractionDigits: 1,
        })}%`,
        helper: localizedText(
          locale,
          "Andel listvisningar som öppnades",
          "Share of list impressions opened"
        ),
        change: null,
        icon: Percent,
        tone: "amber",
      },
      {
        key: "app-rate",
        label: localizedText(locale, "Ansökningsgrad", "Application rate"),
        value: applicationRate,
        valueLabel: `${applicationRate.toLocaleString(numberLocale(locale), {
          maximumFractionDigits: 1,
        })}%`,
        helper: localizedText(locale, "Per detaljvisning", "Per detailed view"),
        change: null,
        icon: BarChart3,
        tone: "violet",
      },
      {
        key: "favorites",
        label: localizedText(locale, "Favoriter", "Favorites"),
        value: analyticsFavorites,
        helper: localizedText(
          locale,
          "Visningar som sparades",
          "Views saved as favorite"
        ),
        change: null,
        icon: Heart,
        tone: "rose",
      },
    ];

    return metrics.filter((metric) => metric.key !== "applications");
  }, [meta, locale, analyticsFavorites]);

  const updateListing = useUpdateListing();
  const deleteListing = useDeleteListing();

  const handleStatusChange = async (status: ListingStatus) => {
    const option = listingStatusOptions.find((item) => item.value === status);
    setActionState("status");

    try {
      // Mutation owns cache invalidation (listings.all + queues.all). We
      // still patch local `meta` for the chip flip because the meta mirror
      // is local state, not derived from the cached listing payload.
      await updateListing.mutateAsync({ id, payload: { status } });
      const mapped = mapStatus(status, locale);
      setMeta((current) => ({
        ...current,
        statusLabel: option ? statusOptionLabel(option, locale) : mapped.label,
        statusTone: mapped.tone,
        statusValue: status,
      }));
      toast.success(
        localizedText(
          locale,
          "Annonsens status har uppdaterats.",
          "The listing status has been updated."
        )
      );
    } catch (statusError) {
      toast.error(
        statusError instanceof Error
          ? statusError.message
          : localizedText(
              locale,
              "Kunde inte uppdatera annonsens status.",
              "Could not update the listing status."
            )
      );
    } finally {
      setActionState("idle");
    }
  };

  const handleDelete = async () => {
    setActionState("delete");

    try {
      await deleteListing.mutateAsync(id);
      toast.success(localizedText(locale, "Annonsen har raderats.", "The listing has been deleted."));
      setDeleteDialogOpen(false);
      router.push(`${dashboardRelPath}/listings`);
      router.refresh();
    } catch (deleteError) {
      toast.error(
        deleteError instanceof Error
          ? deleteError.message
          : localizedText(locale, "Kunde inte radera annonsen.", "Could not delete the listing.")
      );
      setActionState("idle");
    }
  };

  if (authLoading || loading) {
    return (
      <main className="pb-12">
        <div className="portal-surface p-8 text-center text-sm text-gray-500">
          {localizedText(locale, "Laddar annons...", "Loading listing...")}
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="pb-12">
        <div className="portal-surface border-dashed p-8 text-center text-sm text-gray-500">
          {localizedText(locale, "Logga in för att se annonsen.", "Sign in to view the listing.")}
        </div>
      </main>
    );
  }

  if (!companyId) {
    return (
      <main className="pb-12">
        <div className="portal-surface border-dashed p-8 text-center text-sm text-gray-500">
          {localizedText(
            locale,
            "Denna sida är bara tillgänglig för företagskonton.",
            "This page is only available to company accounts."
          )}
        </div>
      </main>
    );
  }

  if (error || !listing) {
    return (
      <main className="pb-12">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-800">
          {error ?? localizedText(locale, "Annonsen kunde inte hittas.", "The listing could not be found.")}
        </div>
      </main>
    );
  }

  if (!isOwnListing) {
    return (
      <main className="pb-12">
        <div className="portal-surface border-dashed p-8 text-center text-sm text-gray-500">
          {localizedText(
            locale,
            "Annonsen hittades inte bland företagets annonser.",
            "The listing was not found among the company's listings."
          )}
        </div>
      </main>
    );
  }

  const locationLabel = listing.fullAddress
    ? `${listing.fullAddress}, ${listing.city}`
    : [listing.area, listing.city].filter(Boolean).join(", ");
  const listingViews = meta.detailedViews;

  return (
    <main className="pb-12">
      <Tabs defaultValue="info" className="space-y-6">
        <header className="portal-surface p-5 sm:p-6">
          <div className="space-y-5">
            <Link
              href={`${dashboardRelPath}/listings`}
              className="portal-control inline-flex h-9 w-fit items-center gap-2 px-3 text-sm font-medium text-gray-600 transition-colors hover:border-gray-300 hover:bg-gray-50 hover:text-[#004225]"
            >
              <ArrowLeft className="h-4 w-4" />
              {localizedText(locale, "Tillbaka till annonser", "Back to listings")}
            </Link>

            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,440px)] xl:items-start">
              <div className="min-w-0 space-y-3">
                <div className="min-w-0 space-y-2">
                  <h1 className="text-2xl font-semibold leading-tight text-gray-950">
                    {listing.title}
                  </h1>
                  <p className="flex flex-wrap items-center gap-1.5 text-sm text-gray-500">
                    <MapPin className="h-4 w-4 shrink-0" />
                    {locationLabel ||
                      localizedText(locale, "Plats saknas", "Location missing")}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                  <HeaderStat
                    icon={FileUser}
                    label={localizedText(locale, "ansökningar", "applications")}
                    value={formatNumber(meta.applications, locale)}
                  />
                  <HeaderStat
                    icon={Eye}
                    label={localizedText(locale, "visningar", "views")}
                    value={formatNumber(listingViews, locale)}
                  />
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-3">
                <Button
                  as="a"
                  className="w-full"
                  href={editHref}
                  variant="default"
                >
                  <Edit3 className="h-4 w-4" />
                  {localizedText(locale, "Redigera", "Edit")}
                </Button>
                <Button
                  as="a"
                  className="w-full"
                  href={applicationsHref}
                  variant="outline"
                >
                  <FileUser className="h-4 w-4" />
                  {localizedText(locale, "Ansökningar", "Applications")}
                </Button>
                <Button
                  className="w-full"
                  isDisabled={actionState !== "idle"}
                  onPress={() => setDeleteDialogOpen(true)}
                  variant="destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  {localizedText(locale, "Radera", "Delete")}
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-gray-100 pt-4 xl:flex-row xl:items-center xl:justify-between">
              <TabsList className="portal-control h-10 w-full justify-start bg-white p-1 sm:w-fit">
                <TabsTrigger
                  className="h-8 flex-1 rounded-md px-4 data-[state=active]:bg-brand-50 data-[state=active]:text-brand-500 data-[state=active]:shadow-none sm:flex-none"
                  value="info"
                >
                  <FileText className="h-4 w-4" />
                  {localizedText(locale, "Info", "Info")}
                </TabsTrigger>
                <TabsTrigger
                  className="h-8 flex-1 rounded-md px-4 data-[state=active]:bg-brand-50 data-[state=active]:text-brand-500 data-[state=active]:shadow-none sm:flex-none"
                  value="analys"
                >
                  <BarChart3 className="h-4 w-4" />
                  {localizedText(locale, "Analys", "Analytics")}
                </TabsTrigger>
              </TabsList>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-400 sm:px-1">
                  {localizedText(locale, "Status", "Status")}
                </span>
                <div className="portal-control grid w-full grid-cols-3 bg-gray-50 p-1 sm:w-[420px]">
                  {listingStatusOptions.map((option) => {
                    const Icon = option.icon;
                    const isCurrent = meta.statusValue === option.value;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        className={cn(
                          "inline-flex h-8 min-w-0 items-center justify-center gap-1.5 rounded-md px-3 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#004225] disabled:pointer-events-none disabled:opacity-60",
                          isCurrent
                            ? "bg-white text-[#004225] shadow-theme-xs"
                            : "text-gray-500 hover:text-gray-900"
                        )}
                        disabled={actionState !== "idle" || isCurrent}
                        onClick={() => handleStatusChange(option.value)}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="truncate">
                          {statusOptionLabel(option, locale)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </header>

        <TabsContent className="mt-0" value="info">
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <ListingPreview listing={listing} images={galleryImages} locale={locale} />

            <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
              <ListingDetailsCard
                locale={locale}
                listing={listing}
                meta={meta}
              />
              <RequirementProfileCard
                locale={locale}
                profile={requirementsProfile}
                profileId={listing.requirementsProfileId}
              />
            </aside>
          </div>
        </TabsContent>

        <TabsContent className="mt-0" value="analys">
          <div className="space-y-6">
            <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-950">
                  {localizedText(locale, "Annonsanalys", "Listing analytics")}
                </h2>
              </div>
              <ApplicationIntervalToggle
                onChange={setApplicationInterval}
                value={applicationInterval}
              />
            </header>

            <AnalyticsGrid>
              <AnalyticsBlock
                size="2x4"
                title={localizedText(
                  locale,
                  "Respons och konvertering",
                  "Response and conversion"
                )}
                description={localizedText(
                  locale,
                  "Visningar, engagemang och andelar för annonsen.",
                  "Views, engagement and rates for the listing."
                )}
              >
                <div className="grid h-full min-w-0 grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                  {analyticsMetrics.map((metric) => (
                    <MetricTile item={metric} key={metric.key} locale={locale} />
                  ))}
                </div>
              </AnalyticsBlock>

              <ApplicationTrendCard
                data={applicationTrendPoints}
                error={applicationTrendError}
                loading={timedApplicationsQuery.isLoading}
                locale={locale}
                periodLabel={localizedAnalyticsInterval.detailLabel}
                size="2x4"
                total={periodApplicationsCount}
              />

              <ListingDemographicsPanel
                from={analyticsRange.from}
                listingId={listing.id}
                periodLabel={localizedAnalyticsInterval.detailLabel}
                size="4x4"
                to={analyticsRange.to}
              />
              <ApplicationDemographicsPanel
                from={analyticsRange.from}
                listingId={listing.id}
                periodLabel={localizedAnalyticsInterval.detailLabel}
                size="3x4"
                to={analyticsRange.to}
              />
            </AnalyticsGrid>
          </div>
        </TabsContent>
      </Tabs>

      <AlertDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          if (actionState === "delete") return;
          setDeleteDialogOpen(open);
        }}
      >
        <AlertDialogContent className="border-gray-200 bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {localizedText(locale, "Radera annons?", "Delete listing?")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {localizedText(
                locale,
                "Annonsen tas bort permanent och kan inte återställas.",
                "The listing will be permanently deleted and cannot be restored."
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button
              variant="outline"
              onPress={() => setDeleteDialogOpen(false)}
              isDisabled={actionState === "delete"}
            >
              {localizedText(locale, "Avbryt", "Cancel")}
            </Button>
            <Button
              variant="destructive"
              onPress={handleDelete}
              isLoading={actionState === "delete"}
              isDisabled={actionState === "delete"}
            >
              {localizedText(locale, "Radera annonsen", "Delete listing")}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
