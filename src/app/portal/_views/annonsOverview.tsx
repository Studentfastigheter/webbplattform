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
  MousePointerClick,
  Percent,
  Trash2,
} from "@/components/icons";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import BostadAbout from "@/features/ads/components/BostadAbout";
import BostadImagePreviewGrid from "@/features/ads/components/BostadImagePreviewGrid";
import {
  AnalyticsBlock,
  AnalyticsGrid,
} from "@/features/analytics/components/AnalyticsBlocks";
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
import { useAuth } from "@/context/AuthContext";
import { getActiveCompanyId } from "@/lib/company-access";
import {
  type ApplicationStatisticEntry,
  type ListingViewCounts,
  type ObjectApplicationCount,
} from "@/features/companies/services/company-service";
import {
  useApplicationCountsPerObject,
  useListingViewCounts,
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
} from "../_components/shared/PortalListingStatusTag";
import {
  ApplicationIntervalToggle,
  getApplicationIntervalRange,
  getLocalizedApplicationInterval,
  sumApplicationStatistics,
  type ApplicationIntervalValue,
} from "../_components/analytics/ApplicationIntervalStats";
import ListingDemographicsPanel from "../_components/analytics/ListingDemographicsPanel";
import ApplicationDemographicsPanel from "../_components/analytics/ApplicationDemographicsPanel";
import { dashboardRelPath } from "../_statics/variables";
import { useI18n } from "@/i18n/I18nProvider";
import type { Locale } from "@/i18n/config";
import { localizedText, numberLocale } from "@/i18n/text";
import { cn } from "@/lib/utils";

type AnnonsOverviewProps = {
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
  { value: "AVAILABLE", labelSv: "Aktiv", labelEn: "Active", icon: CircleCheck },
  { value: "HIDDEN", labelSv: "Gömd", labelEn: "Hidden", icon: CirclePause },
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

function normalizeKey(value: string): string {
  return value
    .toLowerCase()
    .replace(/[\s,.-]+/g, "")
    .replace(/[|]/g, "");
}

function mapStatus(statusRaw: string | undefined, locale: Locale): {
  label: string;
  tone: PortalListingStatusTone;
  value: ListingStatus | null;
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
    return {
      label: localizedText(locale, "Aktiv", "Active"),
      tone: "success",
      value: "AVAILABLE",
    };
  }

  if (["rented", "rentedout", "rented_out", "uthyrd"].includes(status)) {
    return {
      label: localizedText(locale, "Uthyrd", "Rented"),
      tone: "neutral",
      value: "RENTED",
    };
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
    ].includes(status)
  ) {
    return {
      label: localizedText(locale, "Gömd", "Hidden"),
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
  applicationsByObject: ObjectApplicationCount[],
  viewCounts: ListingViewCounts | null,
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
    (companyListing
      ? pickString(companyListing, ["status", "listingStatus", "state"])
      : undefined) ?? pickString(rawDetail, ["status", "listingStatus", "state"]),
    locale
  );

  return {
    applications: resolveApplicationCount(listing, companyListing, applicationsByObject),
    quickViews:
      viewCounts?.quickViews ??
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
      viewCounts?.detailedViews ??
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
    <section className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-700">
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
          <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              {localizedText(locale, "Ålderskrav", "Age requirements")}
            </p>
            <p className="mt-1 text-sm font-semibold text-gray-900">
              {formatAgeRange(profile, locale)}
            </p>
          </div>

          {profile.description ? (
            <p className="text-sm leading-6 text-gray-600">{profile.description}</p>
          ) : null}

          {profile.requiredDocuments?.length ? (
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {localizedText(locale, "Obligatoriska dokument", "Required documents")}
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {profile.requiredDocuments.map((document, index) => (
                  <div
                    className="rounded-lg border border-gray-200 bg-white px-4 py-3"
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
    <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
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
        <div className="flex h-[320px] items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 text-sm text-gray-500">
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
    tile: "border-green-100 bg-green-50/70",
    icon: "border-green-100 bg-white text-green-600 shadow-[0_8px_20px_rgba(22,163,74,0.08)]",
    accent: "from-green-500/20",
  },
  sky: {
    tile: "border-sky-100 bg-sky-50/70",
    icon: "border-sky-100 bg-white text-sky-500 shadow-[0_8px_20px_rgba(56,189,248,0.08)]",
    accent: "from-sky-400/20",
  },
  rose: {
    tile: "border-rose-100 bg-rose-50/70",
    icon: "border-rose-100 bg-white text-rose-500 shadow-[0_8px_20px_rgba(251,113,133,0.08)]",
    accent: "from-rose-400/20",
  },
  amber: {
    tile: "border-amber-100 bg-amber-50/70",
    icon: "border-amber-100 bg-white text-amber-500 shadow-[0_8px_20px_rgba(251,191,36,0.08)]",
    accent: "from-amber-400/20",
  },
  teal: {
    tile: "border-teal-100 bg-teal-50/70",
    icon: "border-teal-100 bg-white text-teal-500 shadow-[0_8px_20px_rgba(45,212,191,0.08)]",
    accent: "from-teal-400/20",
  },
  violet: {
    tile: "border-violet-100 bg-violet-50/70",
    icon: "border-violet-100 bg-white text-violet-500 shadow-[0_8px_20px_rgba(167,139,250,0.08)]",
    accent: "from-violet-400/20",
  },
};

// Hex equivalents used for charts that need raw colors (not Tailwind
// classes). Kept in lockstep with the tone keys above.
const TREND_GREEN = "#16a34a";

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
        "relative min-h-[116px] min-w-0 overflow-hidden rounded-xl border p-3 transition-colors sm:p-4",
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
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border sm:h-10 sm:w-10",
            tone.icon
          )}
        >
          <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
        </div>
        <TrendBadge change={item.change} locale={locale} />
      </div>

      <div className="mt-3 min-w-0">
        <p className="truncate text-[12px] font-medium leading-4 text-gray-500 sm:text-[13px] sm:leading-5">
          {item.label}
        </p>
        <p className="mt-0.5 truncate text-xl font-semibold leading-7 tracking-normal text-gray-950 tabular-nums sm:mt-1 sm:text-[26px] sm:leading-8">
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

/**
 * Standalone trend card for the analytics tab. Renders an inline bar chart
 * using #16a34a (the analytics page's primary green) so it visually matches
 * the demographic charts. Height is fixed via the chart container, not
 * driven by AnalyticsGrid row-spans.
 */
function ApplicationTrendCard({
  data,
  error,
  loading,
  locale,
  periodLabel,
  total,
}: {
  data: TrendPoint[];
  error: string | null;
  loading: boolean;
  locale: Locale;
  periodLabel: string;
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
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-theme-xs">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-950">
            {localizedText(locale, "Ansökningstrend", "Application trend")}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {localizedText(
              locale,
              `Mottagna ansökningar ${periodLabel}.`,
              `Received applications during ${periodLabel}.`
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 self-start rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-600">
          <span
            aria-hidden="true"
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: TREND_GREEN }}
          />
          {localizedText(
            locale,
            `${formatNumber(total, locale)} ansökningar`,
            `${formatNumber(total, locale)} applications`
          )}
        </div>
      </div>

      <div className="mt-4 h-[240px] w-full">
        {loading ? (
          <div className="h-full w-full animate-pulse rounded-md bg-gray-100" />
        ) : error ? (
          <div className="flex h-full items-center rounded-md border border-error-500/20 bg-error-50 px-4 text-theme-sm text-error-700">
            {error}
          </div>
        ) : !hasData ? (
          <div className="flex h-full items-center justify-center rounded-md border border-dashed border-gray-200 px-4 text-center text-sm text-gray-500">
            {localizedText(
              locale,
              "Det finns inga ansökningar registrerade för perioden.",
              "There are no applications registered for this period."
            )}
          </div>
        ) : (
          <ResponsiveContainer height="100%" width="100%">
            <BarChart
              data={chartData}
              margin={{ top: 12, right: 8, left: 0, bottom: 0 }}
            >
              <CartesianGrid stroke="#f0f2f7" vertical={false} />
              <XAxis
                axisLine={false}
                dataKey="label"
                interval={chartData.length > 14 ? "preserveStartEnd" : 0}
                minTickGap={8}
                tick={{ fill: "#6b7280", fontSize: 11 }}
                tickLine={false}
                tickMargin={8}
              />
              <YAxis
                allowDecimals={false}
                axisLine={false}
                tick={{ fill: "#6b7280", fontSize: 11 }}
                tickLine={false}
                tickMargin={6}
                width={32}
              />
              <RechartsTooltip
                contentStyle={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 12,
                  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
                }}
                cursor={{ fill: "rgba(22, 163, 74, 0.06)" }}
                formatter={(value) => [
                  formatNumber(Number(value), locale),
                  localizedText(locale, "Ansökningar", "Applications"),
                ]}
                labelFormatter={(_, payload) => {
                  const row = payload?.[0]?.payload as
                    | { fullLabel: string }
                    | undefined;
                  return row?.fullLabel ?? "";
                }}
              />
              <Bar
                dataKey="value"
                fill={TREND_GREEN}
                radius={[4, 4, 0, 0]}
                maxBarSize={10}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
}

export default function AnnonsOverview({ id }: AnnonsOverviewProps) {
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
  const { data: applicationsByObject = [] } = useApplicationCountsPerObject(
    companyId,
    200,
  );
  const { data: viewCounts = null } = useListingViewCounts(companyId, id);
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
      applicationsByObject as ObjectApplicationCount[],
      viewCounts as ListingViewCounts | null,
      locale,
    );
  }, [listing, companyListings, applicationsByObject, viewCounts, locale]);

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
    id || null,
    analyticsFromIso,
    analyticsToIso,
    "RESULTED_IN_LIKE",
    Boolean(id)
  );
  const analyticsFavorites =
    favoritesDemographyQuery.data?.buckets?.find(
      (bucket) => String(bucket.key) === "true"
    )?.totalViews ?? 0;
  const analyticsMetrics: AnalyticsMetricItem[] = useMemo(() => {
    const computedTotalViews = meta.quickViews + meta.detailedViews;
    const detailRatio =
      computedTotalViews > 0
        ? (meta.detailedViews / computedTotalViews) * 100
        : 0;
    const applicationRate =
      meta.detailedViews > 0
        ? (meta.applications / meta.detailedViews) * 100
        : 0;

    return [
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
        label: localizedText(locale, "Detaljvisningar", "Detailed views"),
        value: meta.detailedViews,
        helper: localizedText(locale, "Öppningar av annonsen", "Listing opens"),
        change: null,
        icon: Eye,
        tone: "sky",
      },
      {
        key: "quick",
        label: localizedText(locale, "Snabbvisningar", "Quick views"),
        value: meta.quickViews,
        helper: localizedText(locale, "Visningar i listor", "Impressions in lists"),
        change: null,
        icon: MousePointerClick,
        tone: "teal",
      },
      {
        key: "detail-ratio",
        label: localizedText(locale, "Detaljratio", "Detail ratio"),
        value: detailRatio,
        valueLabel: `${detailRatio.toLocaleString(numberLocale(locale), {
          maximumFractionDigits: 1,
        })}%`,
        helper: localizedText(locale, "Detalj vs. snabb", "Detailed vs. quick"),
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
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
          {localizedText(locale, "Laddar annons...", "Loading listing...")}
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="pb-12">
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
          {localizedText(locale, "Logga in för att se annonsen.", "Sign in to view the listing.")}
        </div>
      </main>
    );
  }

  if (!companyId) {
    return (
      <main className="pb-12">
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
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
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-800">
          {error ?? localizedText(locale, "Annonsen kunde inte hittas.", "The listing could not be found.")}
        </div>
      </main>
    );
  }

  if (!isOwnListing) {
    return (
      <main className="pb-12">
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
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
  const totalViews = meta.quickViews + meta.detailedViews;

  return (
    <main className="pb-12">
      <Tabs defaultValue="info" className="space-y-6">
        <header className="border-b border-gray-200 pb-6">
          <div className="space-y-5">
            <Link
              href={`${dashboardRelPath}/listings`}
              className="inline-flex w-fit items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-[#004225]"
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
                    value={formatNumber(totalViews, locale)}
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
              <TabsList className="h-10 w-full justify-start rounded-lg border border-gray-200 bg-white p-1 sm:w-fit">
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
                <div className="grid w-full grid-cols-3 rounded-full border border-gray-200 bg-gray-100 p-1 sm:w-[420px]">
                  {listingStatusOptions.map((option) => {
                    const Icon = option.icon;
                    const isCurrent = meta.statusValue === option.value;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        className={cn(
                          "inline-flex h-8 min-w-0 items-center justify-center gap-1.5 rounded-full px-3 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#004225] disabled:pointer-events-none disabled:opacity-60",
                          isCurrent
                            ? "bg-white text-[#004225]"
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
                <p className="mt-1 text-sm text-gray-500">
                  {localizedText(
                    locale,
                    "Översikt av ansökningar, visningar och demografi för denna annons.",
                    "Overview of applications, views and demographics for this listing."
                  )}
                </p>
              </div>
              <ApplicationIntervalToggle
                onChange={setApplicationInterval}
                value={applicationInterval}
              />
            </header>

            <AnalyticsGrid>
              <AnalyticsBlock
                size="2x2"
                title={localizedText(
                  locale,
                  "Ansökningar i perioden",
                  "Applications in the period"
                )}
                description={
                  applicationTrendError ??
                  localizedText(
                    locale,
                    `${localizedAnalyticsInterval.detailLabel}. Totalt ${formatNumber(
                      meta.applications,
                      locale
                    )} mottagna.`,
                    `${localizedAnalyticsInterval.detailLabel}. Total ${formatNumber(
                      meta.applications,
                      locale
                    )} received.`
                  )
                }
              >
                {timedApplicationsQuery.isLoading ? (
                  <div className="flex h-full items-center gap-4">
                    <span className="h-12 w-12 animate-pulse rounded-lg bg-gray-100" />
                    <div className="space-y-2">
                      <span className="block h-8 w-24 animate-pulse rounded bg-gray-100" />
                      <span className="block h-3.5 w-40 animate-pulse rounded bg-gray-100" />
                    </div>
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-between gap-4 rounded-xl border border-green-100 bg-green-50/70 px-4 py-3">
                    <div className="min-w-0">
                      <p className="text-[12px] font-medium leading-4 text-gray-500 sm:text-[13px] sm:leading-5">
                        {localizedAnalyticsInterval.detailLabel}
                      </p>
                      <p className="mt-0.5 text-[28px] font-semibold leading-8 tracking-normal text-gray-950 tabular-nums sm:mt-1 sm:text-[34px] sm:leading-9">
                        {formatNumber(periodApplicationsCount, locale)}
                      </p>
                    </div>
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-green-100 bg-white text-green-600 shadow-[0_8px_20px_rgba(22,163,74,0.08)] sm:h-12 sm:w-12">
                      <FileUser className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                  </div>
                )}
              </AnalyticsBlock>

              <AnalyticsBlock
                size="2x2"
                title={localizedText(locale, "Nyckeltal", "Key metrics")}
                description={localizedText(
                  locale,
                  "Visningar och konvertering för annonsen.",
                  "Views and conversion for the listing."
                )}
              >
                <div className="grid h-full min-w-0 grid-cols-2 gap-3 sm:grid-cols-3">
                  {analyticsMetrics.map((metric) => (
                    <MetricTile item={metric} key={metric.key} locale={locale} />
                  ))}
                </div>
              </AnalyticsBlock>
            </AnalyticsGrid>

            {/* Trend lives outside the AnalyticsGrid because the grid's
                auto-row sizing pairs row-spans with column width, which
                makes a full-width 2-row chart taller than the screen.
                A standalone card with a fixed chart height keeps the
                proportions sane. */}
            <ApplicationTrendCard
              data={applicationTrendPoints}
              error={applicationTrendError}
              loading={timedApplicationsQuery.isLoading}
              locale={locale}
              periodLabel={localizedAnalyticsInterval.detailLabel}
              total={periodApplicationsCount}
            />

            <ListingDemographicsPanel
              from={analyticsRange.from}
              listingId={listing.id}
              periodLabel={localizedAnalyticsInterval.detailLabel}
              to={analyticsRange.to}
            />
            <ApplicationDemographicsPanel
              from={analyticsRange.from}
              listingId={listing.id}
              periodLabel={localizedAnalyticsInterval.detailLabel}
              to={analyticsRange.to}
            />
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
