"use client";

import { useMemo, useState, type ReactNode } from "react";
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
  type ApplicationStatisticEntry,
  type ListingViewCounts,
  type ObjectApplicationCount,
} from "@/features/companies/services/company-service";
import {
  useApplicationCountsPerObject,
  useListingViewCounts,
  useTimedApplicationsForListing,
} from "@/features/companies/hooks/useCompanies";
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
  getApplicationInterval,
  getApplicationIntervalRange,
  sumApplicationStatistics,
  type ApplicationIntervalValue,
} from "../_components/analytics/ApplicationIntervalStats";
import ListingDemographicsPanel from "../_components/analytics/ListingDemographicsPanel";
import ApplicationDemographicsPanel from "../_components/analytics/ApplicationDemographicsPanel";
import { dashboardRelPath } from "../_statics/variables";

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
  label: string;
  icon: typeof CircleCheck;
}> = [
  { value: "AVAILABLE", label: "Aktiv", icon: CircleCheck },
  { value: "HIDDEN", label: "Gömd", icon: CirclePause },
  { value: "RENTED", label: "Uthyrd", icon: Home },
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

function mapStatus(statusRaw?: string): {
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
    return { label: "Aktiv", tone: "success", value: "AVAILABLE" };
  }

  if (["rented", "rentedout", "rented_out", "uthyrd"].includes(status)) {
    return { label: "Uthyrd", tone: "neutral", value: "RENTED" };
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
    return { label: "Gömd", tone: "warning", value: "HIDDEN" };
  }

  return { label: statusRaw ?? "Okänd", tone: "neutral", value: null };
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

function formatNumber(value: number): string {
  return value.toLocaleString("sv-SE");
}

function formatCurrency(value?: number | null): string {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "-";
  }

  return `${value.toLocaleString("sv-SE")} kr/mån`;
}

function formatArea(value?: number | null): string {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "-";
  }

  return `${value.toLocaleString("sv-SE")} m²`;
}

function formatPercent(value: number): string {
  if (!Number.isFinite(value)) return "-";
  return `${value.toLocaleString("sv-SE", { maximumFractionDigits: 1 })}%`;
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

function formatDwellingType(value?: string | null): string {
  const labels: Record<string, string> = {
    APARTMENT: "Lägenhet",
    ROOM: "Rum",
    CORRIDOR_ROOM: "Korridorsrum",
    apartment: "Lägenhet",
    room: "Rum",
    corridor_room: "Korridorsrum",
  };

  if (!value) return "-";
  return labels[value] ?? value;
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
  viewCounts: ListingViewCounts | null
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
      : undefined) ?? pickString(rawDetail, ["status", "listingStatus", "state"])
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
    publishedAt: formatDate(publishedAtRaw),
    updatedAt: formatDate(updatedAtRaw),
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

function formatAgeRange(profile: RequirementsProfileDTO): string {
  const parts = [
    typeof profile.minAge === "number" ? `Min ${profile.minAge} år` : null,
    typeof profile.maxAge === "number" ? `Max ${profile.maxAge} år` : null,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(" / ") : "Inga ålderskrav";
}

function RequirementProfileCard({
  profile,
  profileId,
}: {
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
              Kravprofil
            </p>
            <h2 className="mt-1 text-lg font-semibold text-gray-900">
              {profile?.title || (profileId ? "Kopplad kravprofil" : "Ingen kravprofil")}
            </h2>
          </div>
        </div>
      </div>

      {!profile ? (
        <p className="mt-4 text-sm leading-6 text-gray-500">
          {profileId
            ? "Kravprofilen kunde inte laddas från backend."
            : "Annonsen har ingen kravprofil kopplad."}
        </p>
      ) : (
        <div className="mt-4 space-y-4">
          <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Ålderskrav
            </p>
            <p className="mt-1 text-sm font-semibold text-gray-900">
              {formatAgeRange(profile)}
            </p>
          </div>

          {profile.description ? (
            <p className="text-sm leading-6 text-gray-600">{profile.description}</p>
          ) : null}

          {profile.requiredDocuments?.length ? (
            <div>
              <p className="text-sm font-semibold text-gray-900">Obligatoriska dokument</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {profile.requiredDocuments.map((document, index) => (
                  <div
                    className="rounded-lg border border-gray-200 bg-white px-4 py-3"
                    key={`${document.caption ?? "document"}-${index}`}
                  >
                    <p className="text-sm font-medium text-gray-900">
                      {document.caption ?? "Dokument"}
                    </p>
                    <p className="mt-1 text-xs font-medium uppercase tracking-wide text-gray-400">
                      {document.validTypes?.join(", ") || "Valfri filtyp"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">Inga dokumentkrav angivna.</p>
          )}
        </div>
      )}
    </section>
  );
}

function ListingDetailsCard({
  listing,
  meta,
  requirementsProfile,
}: {
  listing: ListingDetailDTO;
  meta: ListingMeta;
  requirementsProfile: RequirementsProfileDTO | null;
}) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="mt-1 text-base font-semibold text-gray-950">Översikt</h2>
        </div>
        <PortalListingStatusTag
          label={meta.statusLabel}
          tone={meta.statusTone}
          className="w-fit shrink-0"
        />
      </div>
      <dl className="mt-4">
        <DetailRow label="Hyra" value={formatCurrency(listing.rent)} />
        <DetailRow label="Rum" value={listing.rooms || "-"} />
        <DetailRow label="Yta" value={formatArea(listing.sizeM2)} />
        <DetailRow label="Bostadstyp" value={formatDwellingType(listing.dwellingType)} />
        <DetailRow label="Område" value={listing.area || "-"} />
        <DetailRow label="Stad" value={listing.city || "-"} />
        <DetailRow label="Tillgänglig från" value={listing.availableFrom || "-"} />
        <DetailRow label="Tillgänglig till" value={listing.availableTo || "-"} />
        <DetailRow label="Sista ansökan" value={listing.applyBy || "-"} />
        <DetailRow label="Publicerad" value={meta.publishedAt} />
        <DetailRow label="Senast ändrad" value={meta.updatedAt} />
      </dl>
    </section>
  );
}

function ListingPreview({
  listing,
  images,
}: {
  listing: ListingDetailDTO;
  images: string[];
}) {
  return (
    <section className="space-y-4">
      {images.length ? (
        <BostadImagePreviewGrid images={images} readOnly />
      ) : (
        <div className="flex h-[320px] items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 text-sm text-gray-500">
          <div className="flex flex-col items-center gap-2">
            <ImageIcon className="h-8 w-8 text-gray-300" />
            Ingen bild uppladdad
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
  // Action state for the status / delete mutations (Phase 2 will replace these
  // with proper mutation hooks; meta still mirrors locally so the chip flips
  // immediately after a status change without waiting for an invalidation).
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
    );
  }, [listing, companyListings, applicationsByObject, viewCounts]);

  useMemo(() => {
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
        : "Kunde inte ladda annonsen."
      : null;

  const selectedApplicationInterval = useMemo(
    () => getApplicationInterval(applicationInterval),
    [applicationInterval]
  );
  const analyticsRange = useMemo(
    () => getApplicationIntervalRange(applicationInterval),
    [applicationInterval]
  );

  // Timed applications for the trend chart. Empty `id` is still a valid
  // string, but `useTimedApplicationsForListing` is gated by id presence.
  const {
    data: timedEntries,
    isLoading: timedApplicationsLoading,
    isError: timedApplicationsIsError,
    error: timedApplicationsErr,
  } = useTimedApplicationsForListing(
    companyId,
    analyticsRange.from.toISOString(),
    analyticsRange.to.toISOString(),
    id || null,
  );
  const timedApplicationCount = useMemo(
    () => (timedEntries ? sumApplicationStatistics(timedEntries) : 0),
    [timedEntries],
  );
  const applicationTrendPoints = useMemo(
    () => (timedEntries ? applicationStatisticsToTrendPoints(timedEntries) : []),
    [timedEntries],
  );
  const timedApplicationsErrorMessage = timedApplicationsIsError
    ? timedApplicationsErr instanceof Error
      ? timedApplicationsErr.message
      : "Kunde inte hämta ansökningar för perioden."
    : null;
  const timedApplicationsError = timedApplicationsErrorMessage;
  const applicationTrendLoading = timedApplicationsLoading;
  const applicationTrendError = timedApplicationsErrorMessage;

  const editHref = `${dashboardRelPath}/listings/${encodeURIComponent(id)}/edit`;
  const applicationsHref = `${dashboardRelPath}/applications?listingId=${encodeURIComponent(id)}`;
  const galleryImages = useMemo(
    () => listing?.imageUrls?.filter(Boolean) ?? [],
    [listing]
  );

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
      const mapped = mapStatus(status);
      setMeta((current) => ({
        ...current,
        statusLabel: option?.label ?? mapped.label,
        statusTone: mapped.tone,
        statusValue: status,
      }));
      toast.success("Annonsens status har uppdaterats.");
    } catch (statusError) {
      toast.error(
        statusError instanceof Error
          ? statusError.message
          : "Kunde inte uppdatera annonsens status."
      );
    } finally {
      setActionState("idle");
    }
  };

  const handleDelete = async () => {
    setActionState("delete");

    try {
      await deleteListing.mutateAsync(id);
      toast.success("Annonsen har raderats.");
      setDeleteDialogOpen(false);
      router.push(`${dashboardRelPath}/listings`);
      router.refresh();
    } catch (deleteError) {
      toast.error(
        deleteError instanceof Error ? deleteError.message : "Kunde inte radera annonsen."
      );
      setActionState("idle");
    }
  };

  if (authLoading || loading) {
    return (
      <main className="pb-12">
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
          Laddar annons...
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="pb-12">
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
          Logga in för att se annonsen.
        </div>
      </main>
    );
  }

  if (!companyId) {
    return (
      <main className="pb-12">
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
          Denna sida är bara tillgänglig för företagskonton.
        </div>
      </main>
    );
  }

  if (error || !listing) {
    return (
      <main className="pb-12">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-800">
          {error ?? "Annonsen kunde inte hittas."}
        </div>
      </main>
    );
  }

  if (!isOwnListing) {
    return (
      <main className="pb-12">
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
          Annonsen hittades inte bland företagets annonser.
        </div>
      </main>
    );
  }

  const locationLabel = listing.fullAddress
    ? `${listing.fullAddress}, ${listing.city}`
    : [listing.area, listing.city].filter(Boolean).join(", ");
  const applicationsDetail = timedApplicationsLoading
    ? "Hämtar ansökningar..."
    : timedApplicationsError
      ? timedApplicationsError
      : `${selectedApplicationInterval.detailLabel}. Totalt ${formatNumber(meta.applications)} mottagna.`;
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
            Tillbaka till annonser
          </Link>

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-start">
            <div className="min-w-0 space-y-3">
              <div className="min-w-0 space-y-2">
                <h1 className="text-2xl font-semibold leading-tight text-gray-900">
                  {listing.title}
                </h1>
                <p className="flex flex-wrap items-center gap-1.5 text-sm text-gray-500">
                  <MapPin className="h-4 w-4 shrink-0" />
                  {locationLabel || "Plats saknas"}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <PortalListingStatusTag
                  label={meta.statusLabel}
                  tone={meta.statusTone}
                  className="w-fit shrink-0"
                />
                <span className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-600">
                  {formatNumber(meta.applications)} ansökningar
                </span>
                <span className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-600">
                  {formatNumber(totalViews)} visningar
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
                  Info
                </TabsTrigger>
                <TabsTrigger
                  className="h-8 flex-1 rounded-lg px-4 data-[state=active]:bg-brand-50 data-[state=active]:text-brand-500 data-[state=active]:shadow-none sm:flex-none"
                  value="analys"
                >
                  <BarChart3 className="h-4 w-4" />
                  Analys
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
                    Redigera
                  </Button>
                  <Button
                    as="a"
                    className="w-full lg:w-auto"
                    href={applicationsHref}
                    variant="outline"
                  >
                    <FileUser className="h-4 w-4" />
                    Ansökningar
                  </Button>
                  <Button
                    className="w-full lg:w-auto"
                    isDisabled={actionState !== "idle"}
                    onPress={() => setDeleteDialogOpen(true)}
                    variant="destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                    Radera
                  </Button>
                </div>

                <div className="flex flex-col gap-2 rounded-xl border border-gray-200 bg-white p-2 sm:flex-row sm:items-center">
                  <span className="px-1 text-xs font-semibold uppercase tracking-wide text-gray-400 sm:px-2">
                    Status
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
                          <span className="truncate">{option.label}</span>
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
            <ListingPreview listing={listing} images={galleryImages} />

            <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
              <ListingDetailsCard
                listing={listing}
                meta={meta}
                requirementsProfile={requirementsProfile}
              />
              <RequirementProfileCard
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
                <h2 className="text-lg font-semibold text-gray-950">Annonsanalys</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Statistik och demografi för just den här annonsen.
                </p>
              </div>
              <ApplicationIntervalToggle
                onChange={setApplicationInterval}
                value={applicationInterval}
              />
            </div>

            <AnalyticsGrid rowHeightClassName="xl:auto-rows-[132px]">
              <AnalyticsBlock size="1x1" title="Ansökningar">
                <div className="flex h-full min-h-[72px] flex-col justify-between">
                  <p className="text-[13px] font-medium leading-5 text-gray-500">
                    {selectedApplicationInterval.detailLabel}
                  </p>
                  <p className="mt-2 text-[32px] font-semibold leading-9 tracking-normal text-gray-950 tabular-nums">
                    {timedApplicationsLoading
                      ? "..."
                      : formatNumber(timedApplicationCount)}
                  </p>
                  <p className="mt-2 line-clamp-2 text-xs leading-4 text-gray-500">
                    {applicationsDetail}
                  </p>
                </div>
              </AnalyticsBlock>

              <AnalyticsBlock size="1x1" title="Visningar">
                <div className="flex h-full min-h-[72px] flex-col justify-between">
                  <p className="text-[13px] font-medium leading-5 text-gray-500">
                    Totalt för annonsen
                  </p>
                  <p className="mt-2 text-[32px] font-semibold leading-9 tracking-normal text-gray-950 tabular-nums">
                    {formatNumber(totalViews)}
                  </p>
                  <p className="mt-2 text-xs leading-4 text-gray-500">
                    {formatNumber(meta.quickViews)} snabba,{" "}
                    {formatNumber(meta.detailedViews)} detaljerade
                  </p>
                </div>
              </AnalyticsBlock>

              <AnalyticsBlock size="1x1" title="Detaljratio">
                <div className="flex h-full min-h-[72px] flex-col justify-between">
                  <p className="text-[13px] font-medium leading-5 text-gray-500">
                    Detaljvisningar av alla visningar
                  </p>
                  <p className="mt-2 text-[32px] font-semibold leading-9 tracking-normal text-gray-950 tabular-nums">
                    {formatPercent(detailShare)}
                  </p>
                  <p className="mt-2 text-xs leading-4 text-gray-500">
                    Visar hur många som öppnar annonsen.
                  </p>
                </div>
              </AnalyticsBlock>

              <AnalyticsBlock size="1x1" title="Ansökningsgrad">
                <div className="flex h-full min-h-[72px] flex-col justify-between">
                  <p className="text-[13px] font-medium leading-5 text-gray-500">
                    Totala ansökningar per detaljvisning
                  </p>
                  <p className="mt-2 text-[32px] font-semibold leading-9 tracking-normal text-gray-950 tabular-nums">
                    {formatPercent(applicationRate)}
                  </p>
                  <p className="mt-2 text-xs leading-4 text-gray-500">
                    Baserat på {formatNumber(meta.applications)} ansökningar.
                  </p>
                </div>
              </AnalyticsBlock>

              <AnalyticsBlock
                size="2x2"
                title="Ansökningstrend"
                description={`Mottagna ansökningar ${selectedApplicationInterval.detailLabel}.`}
              >
                <TrendBarChart
                  chartClassName="min-h-[210px]"
                  data={applicationTrendPoints}
                  embedded
                  emptyMessage="Det finns inga ansökningar registrerade för perioden."
                  error={applicationTrendError}
                  intervals={[]}
                  loading={applicationTrendLoading}
                  showHeader={false}
                  title="Ansökningstrend"
                  valueLabel="Ansökningar"
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
            <AlertDialogTitle>Radera annons?</AlertDialogTitle>
            <AlertDialogDescription>
              Annonsen tas bort permanent och kan inte återställas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button
              variant="outline"
              onPress={() => setDeleteDialogOpen(false)}
              isDisabled={actionState === "delete"}
            >
              Avbryt
            </Button>
            <Button
              variant="destructive"
              onPress={handleDelete}
              isLoading={actionState === "delete"}
              isDisabled={actionState === "delete"}
            >
              Radera annonsen
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
