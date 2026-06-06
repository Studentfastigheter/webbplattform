"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  BarChart3,
  CircleCheck,
  CirclePause,
  Edit3,
  FileText,
  FileUser,
  Home,
  ImageIcon,
  MapPin,
  Trash2,
} from "lucide-react";
import BostadAbout from "@/features/ads/components/BostadAbout";
import BostadImagePreviewGrid from "@/features/ads/components/BostadImagePreviewGrid";
import { AnalyticsBlock, AnalyticsGrid } from "@/features/analytics/components/AnalyticsBlocks";
import {
  TrendBarChart,
  type TrendBarChartPoint,
} from "@/features/analytics/components/TrendBarChart";
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
  companyService,
  type ApplicationStatisticEntry,
  type ListingViewCounts,
  type ObjectApplicationCount,
} from "@/features/companies/services/company-service";
import { listingService } from "@/features/listings/services/listing-service";
import { queueService } from "@/features/queues/services/queue-service";
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
  getLocalizedApplicationInterval,
  getApplicationIntervalRange,
  sumApplicationStatistics,
  type ApplicationIntervalValue,
} from "../_components/analytics/ApplicationIntervalStats";
import ListingDemographicsPanel from "../_components/analytics/ListingDemographicsPanel";
import ApplicationDemographicsPanel from "../_components/analytics/ApplicationDemographicsPanel";
import { dashboardRelPath } from "../_statics/variables";
import { useI18n } from "@/i18n/I18nProvider";
import type { Locale } from "@/i18n/config";
import { localizedText, numberLocale } from "@/i18n/text";

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

function formatPercent(value: number, locale: Locale): string {
  if (!Number.isFinite(value)) return "-";
  return `${value.toLocaleString(numberLocale(locale), { maximumFractionDigits: 1 })}%`;
}

function applicationStatisticsToTrendPoints(
  entries: ApplicationStatisticEntry[]
): TrendBarChartPoint[] {
  return entries
    .flatMap((entry) => {
      const timestamp = new Date(entry.year, entry.month - 1, entry.day ?? 1);

      if (Number.isNaN(timestamp.getTime())) {
        return [];
      }

      return [{ timestamp, value: entry.numApplications }];
    })
    .sort((left, right) => {
      return new Date(left.timestamp).getTime() - new Date(right.timestamp).getTime();
    });
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
          className="w-fit shrink-0"
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

export default function AnnonsOverview({ id }: AnnonsOverviewProps) {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { locale } = useI18n();
  const [listing, setListing] = useState<ListingDetailDTO | null>(null);
  const [requirementsProfile, setRequirementsProfile] =
    useState<RequirementsProfileDTO | null>(null);
  const [meta, setMeta] = useState<ListingMeta>(emptyMeta);
  const [isOwnListing, setIsOwnListing] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [actionState, setActionState] = useState<ListingActionState>("idle");
  const [applicationInterval, setApplicationInterval] =
    useState<ApplicationIntervalValue>("1m");
  const [timedApplicationCount, setTimedApplicationCount] = useState(0);
  const [timedApplicationsLoading, setTimedApplicationsLoading] = useState(false);
  const [timedApplicationsError, setTimedApplicationsError] =
    useState<string | null>(null);
  const [applicationTrendPoints, setApplicationTrendPoints] = useState<
    TrendBarChartPoint[]
  >([]);
  const [applicationTrendLoading, setApplicationTrendLoading] = useState(false);
  const [applicationTrendError, setApplicationTrendError] =
    useState<string | null>(null);

  const companyId = getActiveCompanyId(user);

  const fetchListingData = useCallback(async () => {
    const companyListingsPromise = companyId
      ? queueService.getAllCompanyListings(companyId, 0, 200)
      : Promise.resolve<ListingCardDTO[]>([]);
    const applicationsPromise = companyId
      ? companyService.applicationCountsPerObject(companyId, 200).catch(() => [])
      : Promise.resolve<ObjectApplicationCount[]>([]);
    const viewCountsPromise = companyId
      ? companyService.listingViewCounts(companyId, id).catch(() => null)
      : Promise.resolve<ListingViewCounts | null>(null);

    const [listingDetail, companyListings, applicationsByObject, viewCounts] = await Promise.all([
      listingService.get(id),
      companyListingsPromise,
      applicationsPromise,
      viewCountsPromise,
    ]);
    const requirementsProfile = listingDetail.requirementsProfileId
      ? await listingService
          .getRequirementsProfile(listingDetail.requirementsProfileId)
          .catch(() => null)
      : null;

    const matchedCompanyListing =
      (companyListings as RawListing[]).find(
        (item) => String(item.id) === String(listingDetail.id)
      ) ?? null;

    return {
      listingDetail,
      requirementsProfile,
      isOwnListing: Boolean(matchedCompanyListing),
      meta: resolveListingMeta(
        listingDetail,
        matchedCompanyListing,
        applicationsByObject,
        viewCounts,
        locale
      ),
    };
  }, [companyId, id, locale]);

  const selectedApplicationInterval = useMemo(
    () => getLocalizedApplicationInterval(locale, applicationInterval),
    [applicationInterval, locale]
  );
  const analyticsRange = useMemo(
    () => getApplicationIntervalRange(applicationInterval),
    [applicationInterval]
  );

  useEffect(() => {
    if (authLoading) {
      return;
    }

    let active = true;
    setLoading(true);
    setError(null);
    setListing(null);
    setRequirementsProfile(null);
    setMeta(emptyMeta);
    setIsOwnListing(true);

    fetchListingData()
      .then(({
        listingDetail,
        requirementsProfile,
        isOwnListing: ownListing,
        meta: listingMeta,
      }) => {
        if (!active) return;

        setListing(listingDetail);
        setRequirementsProfile(requirementsProfile);
        setIsOwnListing(ownListing);
        setMeta(listingMeta);
      })
      .catch((requestError) => {
        if (!active) return;
        setError(
          requestError instanceof Error
            ? requestError.message
            : localizedText(locale, "Kunde inte ladda annonsen.", "Could not load the listing.")
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
  }, [authLoading, fetchListingData]);

  useEffect(() => {
    if (authLoading || !companyId || !id) {
      return;
    }

    const { from, to } = analyticsRange;
    let active = true;

    setTimedApplicationsLoading(true);
    setTimedApplicationsError(null);
    setApplicationTrendLoading(true);
    setApplicationTrendError(null);

    companyService
      .timedApplicationsForListing(companyId, from, to, id)
      .then((entries) => {
        if (!active) return;
        setTimedApplicationCount(sumApplicationStatistics(entries));
        setApplicationTrendPoints(applicationStatisticsToTrendPoints(entries));
      })
      .catch((requestError) => {
        if (!active) return;
        setTimedApplicationCount(0);
        setApplicationTrendPoints([]);
        const message =
          requestError instanceof Error
            ? requestError.message
            : localizedText(
                locale,
                "Kunde inte hämta ansökningar för perioden.",
                "Could not fetch applications for the period."
              );
        setTimedApplicationsError(
          message
        );
        setApplicationTrendError(message);
      })
      .finally(() => {
        if (active) {
          setTimedApplicationsLoading(false);
          setApplicationTrendLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [analyticsRange, authLoading, companyId, id, locale]);

  const editHref = `${dashboardRelPath}/listings/${encodeURIComponent(id)}/edit`;
  const applicationsHref = `${dashboardRelPath}/applications?listingId=${encodeURIComponent(id)}`;
  const galleryImages = useMemo(
    () => listing?.imageUrls?.filter(Boolean) ?? [],
    [listing]
  );

  const handleStatusChange = async (status: ListingStatus) => {
    const option = listingStatusOptions.find((item) => item.value === status);
    setActionState("status");

    try {
      await listingService.update(id, { status });
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
      await listingService.delete(id);
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
  const applicationsDetail = timedApplicationsLoading
    ? localizedText(locale, "Hämtar ansökningar...", "Fetching applications...")
    : timedApplicationsError
      ? timedApplicationsError
      : localizedText(
          locale,
          `${selectedApplicationInterval.detailLabel}. Totalt ${formatNumber(meta.applications, locale)} mottagna.`,
          `${selectedApplicationInterval.detailLabel}. Total ${formatNumber(meta.applications, locale)} received.`
        );
  const totalViews = meta.quickViews + meta.detailedViews;
  const detailShare =
    totalViews > 0 ? (meta.detailedViews / totalViews) * 100 : Number.NaN;
  const applicationRate =
    meta.detailedViews > 0 ? (meta.applications / meta.detailedViews) * 100 : Number.NaN;

  return (
    <main className="pb-12">
      <Tabs defaultValue="info" className="space-y-6">
        <header className="space-y-5 border-b border-gray-200 pb-5">
          <Link
            href={`${dashboardRelPath}/listings`}
            className="inline-flex w-fit items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-[#004225]"
          >
            <ArrowLeft className="h-4 w-4" />
            {localizedText(locale, "Tillbaka till annonser", "Back to listings")}
          </Link>

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-start">
            <div className="min-w-0 space-y-3">
              <div className="min-w-0 space-y-2">
                <h1 className="text-2xl font-semibold leading-tight text-gray-900">
                  {listing.title}
                </h1>
                <p className="flex flex-wrap items-center gap-1.5 text-sm text-gray-500">
                  <MapPin className="h-4 w-4 shrink-0" />
                  {locationLabel || localizedText(locale, "Plats saknas", "Location missing")}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <PortalListingStatusTag
                  label={meta.statusLabel}
                  tone={meta.statusTone}
                  className="w-fit shrink-0"
                />
                <span className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-600">
                  {formatNumber(meta.applications, locale)}{" "}
                  {localizedText(locale, "ansökningar", "applications")}
                </span>
                <span className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-600">
                  {formatNumber(totalViews, locale)}{" "}
                  {localizedText(locale, "visningar", "views")}
                </span>
              </div>
            </div>

            <div className="flex min-w-0 flex-col gap-3 xl:items-end">
              <TabsList className="h-10 w-full justify-start rounded-xl border border-gray-200 bg-white p-1 shadow-theme-xs sm:w-fit">
                <TabsTrigger
                  className="h-8 flex-1 rounded-lg px-4 data-[state=active]:bg-brand-50 data-[state=active]:text-brand-500 data-[state=active]:shadow-none sm:flex-none"
                  value="info"
                >
                  <FileText className="h-4 w-4" />
                  {localizedText(locale, "Info", "Info")}
                </TabsTrigger>
                <TabsTrigger
                  className="h-8 flex-1 rounded-lg px-4 data-[state=active]:bg-brand-50 data-[state=active]:text-brand-500 data-[state=active]:shadow-none sm:flex-none"
                  value="analys"
                >
                  <BarChart3 className="h-4 w-4" />
                  {localizedText(locale, "Analys", "Analytics")}
                </TabsTrigger>
              </TabsList>
              <div className="flex w-full flex-col gap-2 lg:w-auto">
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:flex lg:flex-wrap lg:justify-end">
                  <Button
                    as="a"
                    className="w-full lg:w-auto"
                    href={editHref}
                    variant="default"
                  >
                    <Edit3 className="h-4 w-4" />
                    {localizedText(locale, "Redigera", "Edit")}
                  </Button>
                  <Button
                    as="a"
                    className="w-full lg:w-auto"
                    href={applicationsHref}
                    variant="outline"
                  >
                    <FileUser className="h-4 w-4" />
                    {localizedText(locale, "Ansökningar", "Applications")}
                  </Button>
                  <Button
                    className="w-full lg:w-auto"
                    isDisabled={actionState !== "idle"}
                    onPress={() => setDeleteDialogOpen(true)}
                    variant="destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                    {localizedText(locale, "Radera", "Delete")}
                  </Button>
                </div>

                <div className="flex flex-col gap-2 rounded-xl border border-gray-200 bg-white p-2 sm:flex-row sm:items-center">
                  <span className="px-1 text-xs font-semibold uppercase tracking-wide text-gray-400 sm:px-2">
                    {localizedText(locale, "Status", "Status")}
                  </span>
                  <div className="grid flex-1 grid-cols-3 gap-1.5">
                    {listingStatusOptions.map((option) => {
                      const Icon = option.icon;
                      const isCurrent = meta.statusValue === option.value;

                      return (
                        <button
                          key={option.value}
                          type="button"
                          className={[
                            "inline-flex h-9 min-w-0 items-center justify-center gap-1.5 rounded-lg border px-2 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#004225] disabled:pointer-events-none disabled:opacity-60",
                            isCurrent
                              ? "border-[#004225] bg-[#004225] text-white"
                              : "border-gray-200 bg-gray-50 text-gray-700 hover:border-[#004225]/30 hover:bg-[#004225]/5 hover:text-[#004225]",
                          ].join(" ")}
                          disabled={actionState !== "idle" || isCurrent}
                          onClick={() => handleStatusChange(option.value)}
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          <span className="truncate">{statusOptionLabel(option, locale)}</span>
                        </button>
                      );
                    })}
                  </div>
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

        <TabsContent className="mt-0 space-y-5" value="analys">
          <section className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-950">
                  {localizedText(locale, "Annonsanalys", "Listing analytics")}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  {localizedText(
                    locale,
                    "Statistik och demografi för just den här annonsen.",
                    "Statistics and demographics for this listing."
                  )}
                </p>
              </div>
              <ApplicationIntervalToggle
                onChange={setApplicationInterval}
                value={applicationInterval}
              />
            </div>

            <AnalyticsGrid rowHeightClassName="xl:auto-rows-[132px]">
              <AnalyticsBlock
                size="1x1"
                title={localizedText(locale, "Ansökningar", "Applications")}
              >
                <div className="flex h-full min-h-[72px] flex-col justify-between">
                  <p className="text-[13px] font-medium leading-5 text-gray-500">
                    {selectedApplicationInterval.detailLabel}
                  </p>
                  <p className="mt-2 text-[32px] font-semibold leading-9 tracking-normal text-gray-950 tabular-nums">
                    {timedApplicationsLoading
                      ? "..."
                      : formatNumber(timedApplicationCount, locale)}
                  </p>
                  <p className="mt-2 line-clamp-2 text-xs leading-4 text-gray-500">
                    {applicationsDetail}
                  </p>
                </div>
              </AnalyticsBlock>

              <AnalyticsBlock size="1x1" title={localizedText(locale, "Visningar", "Views")}>
                <div className="flex h-full min-h-[72px] flex-col justify-between">
                  <p className="text-[13px] font-medium leading-5 text-gray-500">
                    {localizedText(locale, "Totalt för annonsen", "Total for the listing")}
                  </p>
                  <p className="mt-2 text-[32px] font-semibold leading-9 tracking-normal text-gray-950 tabular-nums">
                    {formatNumber(totalViews, locale)}
                  </p>
                  <p className="mt-2 text-xs leading-4 text-gray-500">
                    {localizedText(
                      locale,
                      `${formatNumber(meta.quickViews, locale)} snabba, ${formatNumber(meta.detailedViews, locale)} detaljerade`,
                      `${formatNumber(meta.quickViews, locale)} quick, ${formatNumber(meta.detailedViews, locale)} detailed`
                    )}
                  </p>
                </div>
              </AnalyticsBlock>

              <AnalyticsBlock
                size="1x1"
                title={localizedText(locale, "Detaljratio", "Detail ratio")}
              >
                <div className="flex h-full min-h-[72px] flex-col justify-between">
                  <p className="text-[13px] font-medium leading-5 text-gray-500">
                    {localizedText(
                      locale,
                      "Detaljvisningar av alla visningar",
                      "Detailed views out of all views"
                    )}
                  </p>
                  <p className="mt-2 text-[32px] font-semibold leading-9 tracking-normal text-gray-950 tabular-nums">
                    {formatPercent(detailShare, locale)}
                  </p>
                  <p className="mt-2 text-xs leading-4 text-gray-500">
                    {localizedText(
                      locale,
                      "Visar hur många som öppnar annonsen.",
                      "Shows how many people open the listing."
                    )}
                  </p>
                </div>
              </AnalyticsBlock>

              <AnalyticsBlock
                size="1x1"
                title={localizedText(locale, "Ansökningsgrad", "Application rate")}
              >
                <div className="flex h-full min-h-[72px] flex-col justify-between">
                  <p className="text-[13px] font-medium leading-5 text-gray-500">
                    {localizedText(
                      locale,
                      "Totala ansökningar per detaljvisning",
                      "Total applications per detailed view"
                    )}
                  </p>
                  <p className="mt-2 text-[32px] font-semibold leading-9 tracking-normal text-gray-950 tabular-nums">
                    {formatPercent(applicationRate, locale)}
                  </p>
                  <p className="mt-2 text-xs leading-4 text-gray-500">
                    {localizedText(
                      locale,
                      `Baserat på ${formatNumber(meta.applications, locale)} ansökningar.`,
                      `Based on ${formatNumber(meta.applications, locale)} applications.`
                    )}
                  </p>
                </div>
              </AnalyticsBlock>

              <AnalyticsBlock
                size="2x2"
                title={localizedText(locale, "Ansökningstrend", "Application trend")}
                description={localizedText(
                  locale,
                  `Mottagna ansökningar ${selectedApplicationInterval.detailLabel}.`,
                  `Received applications during ${selectedApplicationInterval.detailLabel}.`
                )}
              >
                <TrendBarChart
                  chartClassName="min-h-[210px]"
                  data={applicationTrendPoints}
                  embedded
                  emptyMessage={localizedText(
                    locale,
                    "Det finns inga ansökningar registrerade för perioden.",
                    "There are no applications registered for this period."
                  )}
                  error={applicationTrendError}
                  intervals={[]}
                  loading={applicationTrendLoading}
                  showHeader={false}
                  title={localizedText(locale, "Ansökningstrend", "Application trend")}
                  valueLabel={localizedText(locale, "Ansökningar", "Applications")}
                />
              </AnalyticsBlock>
            </AnalyticsGrid>
          </section>

          <ListingDemographicsPanel
            from={analyticsRange.from}
            listingId={listing.id}
            periodLabel={selectedApplicationInterval.detailLabel}
            to={analyticsRange.to}
          />
          <ApplicationDemographicsPanel
            from={analyticsRange.from}
            listingId={listing.id}
            periodLabel={selectedApplicationInterval.detailLabel}
            to={analyticsRange.to}
          />
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
