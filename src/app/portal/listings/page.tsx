"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useQueries } from "@tanstack/react-query";
import {
  Eye,
  RefreshCw,
  Search,
  X,
} from "@/components/icons";
import ListingCardSmall from "@/features/listings/components/ListingCard_Small";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/i18n/I18nProvider";
import type { Locale } from "@/i18n/config";
import { localizedText, numberLocale } from "@/i18n/text";
import { getActiveCompanyId } from "@/lib/company-access";
import { cn } from "@/lib/utils";
import { companyService, type ListingViewCounts } from "@/features/companies/services/company-service";
import {
  useApplicationCountsPerObject,
  useRefreshCompanyListings,
} from "@/features/companies/hooks/useCompanies";
import { useUpdateListings } from "@/features/listings/hooks/useListings";
import { useAllCompanyListings } from "@/features/queues/hooks/useQueues";
import { qk } from "@/lib/query/keys";
import { type ListingCardDTO, type ListingStatus } from "@/types/listing";
import PortalListingStatusTag, {
  type PortalListingStatusTone,
} from "../_components/shared/PortalListingStatusTag";
import { useCompanyPortal } from "../_components/layout/CompanyPortalContext";
import { useDashboardFooter } from "../_components/layout/DashboardShell";
import {
  PortalControlSelectTrigger,
  portalControlSelectContentClassName,
} from "../_components/shared/PortalControlSelectTrigger";
import { dashboardRelPath } from "../_statics/variables";

type RawListing = ListingCardDTO & Record<string, unknown>;

type PortalListingStatusValue = "available" | "hidden" | "rented";
type StatusFilter = "all" | PortalListingStatusValue;
type DateSort = "newest" | "oldest";

type PortalListing = {
  listing: ListingCardDTO;
  detailedViews: number;
  applications: number;
  publishedAt: string;
  publishedAtTime: number | null;
  statusLabel: string;
  statusTone: PortalListingStatusTone;
  statusValue: PortalListingStatusValue | null;
};

type StatsLookup = Map<string, number>;
type ListingViewCountsLookup = Map<string, ListingViewCounts>;

const BULK_STATUS_OPTIONS: ListingStatus[] = ["AVAILABLE", "HIDDEN", "RENTED"];
const selectionCheckboxClassName =
  "size-5 rounded-[7px] border-gray-300 bg-white text-white shadow-[0_1px_2px_rgba(15,23,42,0.08)] transition-all data-[state=checked]:border-[#004225] data-[state=checked]:bg-[#004225] data-[state=checked]:text-white data-[state=indeterminate]:border-[#004225] data-[state=indeterminate]:bg-[#004225] focus-visible:ring-[#004225]/20";

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

function normalizeListingStatus(
  statusRaw: string | undefined
): PortalListingStatusValue | null {
  const status = statusRaw?.toLowerCase().trim();
  if (!status) return null;

  const compactStatus = status.replace(/[\s_-]+/g, "");

  if (
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
    return "available";
  }

  if (
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
    return "hidden";
  }

  if (
    [
      "rented",
      "rentedout",
      "uthyrd",
      "closed",
      "expired",
    ].includes(compactStatus)
  ) {
    return "rented";
  }

  return null;
}

function mapStatus(statusRaw: string | undefined, locale: Locale): {
  label: string;
  tone: PortalListingStatusTone;
  value: PortalListingStatusValue | null;
} {
  const status = normalizeListingStatus(statusRaw);

  if (status === "available") {
    return {
      label: localizedText(locale, "Tillgänglig", "Available"),
      tone: "success",
      value: status,
    };
  }

  if (status === "hidden") {
    return {
      label: localizedText(locale, "Dold", "Hidden"),
      tone: "warning",
      value: status,
    };
  }

  if (status === "rented") {
    return {
      label: localizedText(locale, "Uthyrd", "Rented"),
      tone: "neutral",
      value: status,
    };
  }

  return {
    label: statusRaw ?? localizedText(locale, "Okänd", "Unknown"),
    tone: "neutral",
    value: null,
  };
}

function formatDate(value: string | undefined, locale: Locale): string {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";

  return new Intl.DateTimeFormat(numberLocale(locale), {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(parsed);
}

function parseDateTime(value?: string): number | null {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;

  return parsed.getTime();
}

function createApplicationLookup(
  source: Array<{ address: string; numApplications: number }>
): StatsLookup {
  const lookup = new Map<string, number>();
  source.forEach((item) => {
    const key = normalizeKey(item.address);
    if (!key) return;
    lookup.set(key, item.numApplications);
  });
  return lookup;
}

function resolveApplicationCount(
  listing: RawListing,
  lookup: StatsLookup
): number | undefined {
  const fromListing = pickNumber(listing, [
    "applications",
    "applicationCount",
    "applicationsCount",
    "numApplications",
    "stats.applications",
    "analytics.applications",
    "statistics.applications",
  ]);

  if (typeof fromListing === "number") {
    return fromListing;
  }

  const candidates = [
    pickString(listing, ["address", "fullAddress", "streetAddress"]),
    listing.location,
    listing.title,
  ].filter((value): value is string => Boolean(value));

  for (const candidate of candidates) {
    const mapped = lookup.get(normalizeKey(candidate));
    if (typeof mapped === "number") {
      return mapped;
    }
  }

  return undefined;
}

function resolveListingViewCounts(
  listing: RawListing,
  lookup: ListingViewCountsLookup
): ListingViewCounts {
  const fromEndpoint = lookup.get(String(listing.id));
  if (fromEndpoint) {
    return fromEndpoint;
  }

  return {
    quickViews:
      pickNumber(listing, [
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
      ]) ?? 0,
    detailedViews:
      pickNumber(listing, [
        "detailedViews",
        "detailedViewCount",
        "detailedViewsCount",
        "stats.detailedViews",
        "analytics.detailedViews",
        "statistics.detailedViews",
        "clicks",
        "clickCount",
        "clicksCount",
      ]) ?? 0,
  };
}

function splitLocation(location: string | undefined, locale: Locale): { area: string; city: string } {
  const fallback = localizedText(locale, "Ej angivet", "Not specified");

  if (!location) {
    return { area: fallback, city: fallback };
  }

  const parts = location
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 0) {
    return { area: fallback, city: fallback };
  }

  return {
    area: parts[0] ?? fallback,
    city: parts[1] ?? parts[0] ?? fallback,
  };
}

function formatListingStatusOption(status: ListingStatus, locale: Locale) {
  switch (status) {
    case "AVAILABLE":
      return localizedText(locale, "Tillgänglig", "Available");
    case "HIDDEN":
      return localizedText(locale, "Dold", "Hidden");
    case "RENTED":
      return localizedText(locale, "Uthyrd", "Rented");
  }
}

export default function PortalAdsPage() {
  const { locale } = useI18n();
  const router = useRouter();
  const setDashboardFooter = useDashboardFooter();
  const { user, isLoading: authLoading } = useAuth();
  const portal = useCompanyPortal();
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [dateSort, setDateSort] = useState<DateSort>("newest");
  const [cityFilter, setCityFilter] = useState("all");
  const [selectedListingIds, setSelectedListingIds] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState<ListingStatus>("HIDDEN");
  const hasActiveFilters = statusFilter !== "all" || cityFilter !== "all";

  const companyId = getActiveCompanyId(user);
  const canSyncListings = portal.canUseFeature("listingSync");
  const refreshListingsMutation = useRefreshCompanyListings();
  const updateListingsMutation = useUpdateListings();
  const refreshingListings = refreshListingsMutation.isPending;
  const updatingListings = updateListingsMutation.isPending;

  // Core reads — both shared with the analytics dashboard via the same
  // query keys, so navigating between portal pages reuses cached data.
  const {
    data: companyListings = [],
    isLoading: listingsLoading,
    isError: listingsError,
    error: listingsErr,
  } = useAllCompanyListings(companyId, 0, 200);
  const { data: applicationsByObject = [] } =
    useApplicationCountsPerObject(companyId, 200);

  useEffect(() => {
    const validIds = new Set(companyListings.map((listing) => String(listing.id)));
    setSelectedListingIds((current) => {
      const next = current.filter((id) => validIds.has(id));
      return next.length === current.length ? current : next;
    });
  }, [companyListings]);

  // Per-listing view counts — N parallel queries, each cached under the
  // same key the analytics page uses. After the listings array settles
  // these fire in parallel and merge into a Map. Listings that fail or
  // are still loading simply have no entry → `resolveListingViewCounts`
  // falls back to the embedded count fields on the listing DTO.
  const viewCountQueries = useQueries({
    queries: companyListings.map((listing) => ({
      queryKey: qk.companies.viewCounts(companyId ?? -1, String(listing.id)),
      queryFn: () => companyService.listingViewCounts(companyId!, listing.id),
      enabled: companyId != null && companyId > 0,
      staleTime: 30_000,
    })),
  });
  const viewCountsByListingId = useMemo(() => {
    const map = new Map<string, ListingViewCounts>();
    companyListings.forEach((listing, idx) => {
      const query = viewCountQueries[idx];
      if (query?.isSuccess && query.data) {
        map.set(String(listing.id), query.data);
      }
    });
    return map;
  }, [companyListings, viewCountQueries]);

  const loading = authLoading || listingsLoading;
  const error =
    listingsError && listingsErr
      ? listingsErr instanceof Error
        ? listingsErr.message
        : localizedText(locale, "Kunde inte hämta annonser för företaget.", "Could not load company listings.")
      : null;

  // Refresh mutation owns its invalidation (listings list, application
  // counts, per-listing view counts). The hook reports `isPending` which
  // we surface as `refreshingListings` for the button-disabled state.
  const handleRefreshListings = useCallback(async () => {
    if (!companyId || refreshingListings || !canSyncListings) {
      return;
    }

    try {
      await refreshListingsMutation.mutateAsync(companyId);
      toast.success(localizedText(locale, "Annonssynken har startats.", "Listing sync has started."));
    } catch (refreshError) {
      toast.error(
        refreshError instanceof Error
          ? refreshError.message
          : localizedText(locale, "Kunde inte starta annonssynken.", "Could not start listing sync.")
      );
    }
  }, [
    canSyncListings,
    companyId,
    locale,
    refreshingListings,
    refreshListingsMutation,
  ]);

  const ads = useMemo<PortalListing[]>(() => {
    if (!companyListings || companyListings.length === 0) return [];
    const applicationsLookup = createApplicationLookup(applicationsByObject);
    return companyListings.map((dto) => {
      const raw = dto as RawListing;
      const { detailedViews } = resolveListingViewCounts(
        raw,
        viewCountsByListingId,
      );
      const applications = resolveApplicationCount(raw, applicationsLookup) ?? 0;
      const publishedAtRaw = pickString(raw, ["published"]);
      const { label, tone, value } = mapStatus(
        pickString(raw, ["status", "listingStatus", "state"]),
        locale
      );
      return {
        listing: dto,
        detailedViews,
        applications,
        publishedAt: formatDate(publishedAtRaw, locale),
        publishedAtTime: parseDateTime(publishedAtRaw),
        statusLabel: label,
        statusTone: tone,
        statusValue: value,
      };
    });
  }, [applicationsByObject, companyListings, locale, viewCountsByListingId]);

  const availableCities = useMemo(() => {
    const cities = new Set<string>();

    ads.forEach((item) => {
      const { city } = splitLocation(item.listing.location, locale);
      if (city && city !== localizedText(locale, "Ej angivet", "Not specified")) {
        cities.add(city);
      }
    });

    return Array.from(cities).sort((a, b) => a.localeCompare(b, numberLocale(locale)));
  }, [ads, locale]);

  const filteredAds = useMemo(() => {
    const normalizedQuery = search.trim().toLowerCase();

    return ads
      .filter((item) => {
        const statusPass =
          statusFilter === "all"
            ? true
            : item.statusValue === statusFilter;

        if (!statusPass) return false;

        const { city } = splitLocation(item.listing.location, locale);
        if (cityFilter !== "all" && city !== cityFilter) {
          return false;
        }

        if (!normalizedQuery) return true;

        const location = item.listing.location ?? "";
        return (
          item.listing.title.toLowerCase().includes(normalizedQuery) ||
          location.toLowerCase().includes(normalizedQuery)
        );
      })
      .sort((a, b) => {
        if (a.publishedAtTime == null && b.publishedAtTime == null) return 0;
        if (a.publishedAtTime == null) return 1;
        if (b.publishedAtTime == null) return -1;

        return dateSort === "newest"
          ? b.publishedAtTime - a.publishedAtTime
          : a.publishedAtTime - b.publishedAtTime;
      });
  }, [ads, cityFilter, dateSort, locale, search, statusFilter]);

  const selectedListingIdSet = useMemo(
    () => new Set(selectedListingIds),
    [selectedListingIds]
  );

  const filteredListingIds = useMemo(
    () => filteredAds.map((item) => String(item.listing.id)),
    [filteredAds]
  );

  const allFilteredListingsSelected =
    filteredListingIds.length > 0 &&
    filteredListingIds.every((id) => selectedListingIdSet.has(id));

  const toggleListingSelection = useCallback((listingId: string, checked: boolean) => {
    setSelectedListingIds((current) => {
      if (checked) {
        return current.includes(listingId) ? current : [...current, listingId];
      }

      const next = current.filter((id) => id !== listingId);
      return next.length === current.length ? current : next;
    });
  }, []);

  const toggleFilteredListingsSelection = useCallback(() => {
    if (filteredListingIds.length === 0) {
      return;
    }

    if (allFilteredListingsSelected) {
      const filteredIds = new Set(filteredListingIds);
      setSelectedListingIds((current) =>
        current.filter((id) => !filteredIds.has(id))
      );
      return;
    }

    setSelectedListingIds(filteredListingIds);
  }, [allFilteredListingsSelected, filteredListingIds]);

  const clearSelectedListings = useCallback(() => {
    setSelectedListingIds([]);
  }, []);

  const handleBulkStatusUpdate = useCallback(async () => {
    const selectedCount = selectedListingIds.length;
    if (selectedCount === 0) {
      return;
    }

    const listingDatas = selectedListingIds.reduce<
      Record<string, { status: ListingStatus }>
    >((acc, listingId) => {
      acc[listingId] = { status: bulkStatus };
      return acc;
    }, {});

    try {
      await updateListingsMutation.mutateAsync({ listingDatas });
      setSelectedListingIds([]);
      toast.success(
        localizedText(
          locale,
          `${selectedCount} annonser har uppdaterats.`,
          `${selectedCount} listings have been updated.`
        )
      );
    } catch (updateError) {
      toast.error(
        updateError instanceof Error
          ? updateError.message
          : localizedText(
              locale,
              "Kunde inte uppdatera valda annonser.",
              "Could not update selected listings."
            )
      );
    }
  }, [bulkStatus, locale, selectedListingIds, updateListingsMutation]);

  const bulkStatusFooter = useMemo(() => {
    if (selectedListingIds.length === 0 || !user || !companyId) {
      return null;
    }

    return (
      <div className="mx-auto w-full max-w-[1536px] px-4 pb-4 md:px-6 md:pb-6">
        <div className="pointer-events-auto mx-auto flex w-full max-w-[760px] flex-col gap-2 rounded-xl border border-gray-200/80 bg-white/95 px-3 py-2 shadow-[0_16px_42px_rgba(15,23,42,0.16)] backdrop-blur-xl sm:flex-row sm:items-center">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <span className="shrink-0 text-xs font-medium text-gray-500">
              {localizedText(locale, "Status", "Status")}
            </span>
            <Select
              value={bulkStatus}
              onValueChange={(value) => setBulkStatus(value as ListingStatus)}
              disabled={updatingListings}
            >
              <PortalControlSelectTrigger
                aria-label={localizedText(
                  locale,
                  "Välj ny status",
                  "Choose new status"
                )}
                className="h-8 min-w-0 flex-1 rounded-md border-transparent bg-gray-50 px-2.5 text-xs font-medium shadow-none hover:border-gray-200 hover:bg-gray-50 focus:ring-2 focus:ring-[#004225]/10 sm:max-w-[190px]"
              >
                <SelectValue />
              </PortalControlSelectTrigger>
              <SelectContent
                align="center"
                className="z-[60] max-w-[calc(100vw-2rem)] rounded-lg border-gray-200 bg-white p-1 shadow-[0_16px_34px_rgba(15,23,42,0.14)]"
              >
                {BULK_STATUS_OPTIONS.map((status) => (
                  <SelectItem
                    key={status}
                    value={status}
                    className="rounded-md py-2 pl-2 pr-8 text-sm"
                  >
                    {formatListingStatusOption(status, locale)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button
              className="h-8 rounded-md px-3 text-xs font-medium shadow-none"
              isDisabled={updatingListings}
              isLoading={updatingListings}
              onPress={() => void handleBulkStatusUpdate()}
            >
              {localizedText(locale, "Byt status", "Change status")}
            </Button>

            <Button
              className="h-8 rounded-md px-3 text-xs font-medium text-gray-500 hover:bg-gray-50 hover:text-[#004225]"
              variant="ghost"
              isDisabled={updatingListings}
              onPress={clearSelectedListings}
            >
              {localizedText(locale, "Avbryt", "Cancel")}
            </Button>
          </div>
        </div>
      </div>
    );
  }, [
    bulkStatus,
    clearSelectedListings,
    companyId,
    handleBulkStatusUpdate,
    locale,
    selectedListingIds.length,
    updatingListings,
    user,
  ]);

  useEffect(() => {
    setDashboardFooter(bulkStatusFooter);

    return () => {
      setDashboardFooter(null);
    };
  }, [bulkStatusFooter, setDashboardFooter]);

  if (authLoading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-500">
        {localizedText(locale, "Laddar annonser...", "Loading listings...")}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
        {localizedText(locale, "Logga in för att se företagets annonser.", "Log in to view the company's listings.")}
      </div>
    );
  }

  if (!companyId) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
        {localizedText(locale, "Denna sida är bara tillgänglig för företagskonton.", "This page is only available for company accounts.")}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">
              {localizedText(locale, "Mina annonser", "My listings")}
            </h1>
            {canSyncListings ? (
              <Button
                className="w-full bg-white sm:w-auto"
                isDisabled={loading || refreshingListings}
                isLoading={refreshingListings}
                onPress={() => void handleRefreshListings()}
                variant="outline"
              >
                <RefreshCw className="h-4 w-4" />
                {localizedText(locale, "Synka annonser", "Sync listings")}
              </Button>
            ) : null}
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-3 border-b border-gray-200 pb-4">
          <div className="w-full lg:mx-auto lg:max-w-[720px]">
            <form
              className="flex h-11 w-full items-center gap-2 rounded-full border border-black/10 bg-white py-1.5 pl-4 pr-1.5 shadow-[0_6px_18px_rgba(0,0,0,0.08)] sm:h-12 sm:gap-3 sm:pl-5 xl:h-14 xl:pl-6 xl:pr-2"
              onSubmit={(event) => {
                event.preventDefault();
                setSearch(searchInput);
              }}
            >
              <Search className="h-[18px] w-[18px] shrink-0 text-black/55 sm:h-5 sm:w-5" />
              <input
                type="text"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder={localizedText(locale, "Sök på titel, stad eller område", "Search by title, city or area")}
                className="min-w-0 flex-1 bg-transparent text-sm text-black outline-none placeholder:text-black/45 sm:text-base"
              />
              {searchInput && (
                <button
                  type="button"
                  aria-label={localizedText(locale, "Rensa sökning", "Clear search")}
                  onClick={() => {
                    setSearchInput("");
                    setSearch("");
                  }}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[#004225] transition-colors hover:bg-[#004225]/5 sm:h-8 sm:w-8"
                >
                  <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </button>
              )}
              <button
                type="submit"
                className="h-8 shrink-0 rounded-full bg-[#004225] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#004225]/90 sm:h-9 sm:px-5 xl:h-10 xl:px-6"
              >
                {localizedText(locale, "Sök", "Search")}
              </button>
            </form>
          </div>

          <div className="flex w-full min-w-0 flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
              <div className="grid w-full min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 lg:w-auto lg:grid-cols-[repeat(2,minmax(160px,180px))]">
                <div className="min-w-0">
                  <Select
                    value={statusFilter}
                    onValueChange={(value) =>
                      setStatusFilter(value as StatusFilter)
                    }
                  >
                    <PortalControlSelectTrigger
                      aria-label={localizedText(locale, "Filtrera på status", "Filter by status")}
                    >
                      <SelectValue />
                    </PortalControlSelectTrigger>
                    <SelectContent align="end" className={portalControlSelectContentClassName}>
                      <SelectItem value="all">{localizedText(locale, "Alla statusar", "All statuses")}</SelectItem>
                      <SelectItem value="available">{localizedText(locale, "Tillgängliga", "Available")}</SelectItem>
                      <SelectItem value="hidden">{localizedText(locale, "Dolda", "Hidden")}</SelectItem>
                      <SelectItem value="rented">{localizedText(locale, "Uthyrda", "Rented")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="min-w-0">
                  <Select value={cityFilter} onValueChange={setCityFilter}>
                    <PortalControlSelectTrigger
                      aria-label={localizedText(locale, "Filtrera på stad", "Filter by city")}
                    >
                      <SelectValue />
                    </PortalControlSelectTrigger>
                    <SelectContent align="end" className={portalControlSelectContentClassName}>
                      <SelectItem value="all">{localizedText(locale, "Alla städer", "All cities")}</SelectItem>
                      {availableCities.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter("all");
                    setCityFilter("all");
                  }}
                  className="h-9 w-full shrink-0 rounded-lg px-3 text-left text-xs font-medium text-gray-500 transition-colors hover:bg-gray-50 hover:text-[#004225] sm:w-auto sm:text-center"
                >
                  {localizedText(locale, "Rensa filter", "Clear filters")}
                </button>
              )}
            </div>

            <div className="flex w-full min-w-0 flex-col gap-2 sm:flex-row sm:items-center lg:ml-auto lg:w-auto lg:justify-end">
              <Button
                className="h-9 w-full rounded-lg border-gray-200 bg-white px-3 text-xs font-medium text-gray-700 shadow-theme-xs hover:border-gray-300 hover:bg-gray-50 hover:text-[#004225] sm:w-auto"
                isDisabled={
                  loading ||
                  updatingListings ||
                  filteredListingIds.length === 0
                }
                onPress={toggleFilteredListingsSelection}
                variant="outline"
              >
                {allFilteredListingsSelected
                  ? localizedText(locale, "Avvälj alla", "Deselect all")
                  : localizedText(locale, "Välj alla", "Select all")}
              </Button>

              <div className="w-full min-w-0 sm:w-[180px]">
                <Select
                  value={dateSort}
                  onValueChange={(value) => setDateSort(value as DateSort)}
                >
                  <PortalControlSelectTrigger
                    aria-label={localizedText(locale, "Sortera annonser", "Sort listings")}
                  >
                    <SelectValue />
                  </PortalControlSelectTrigger>
                  <SelectContent align="end" className={portalControlSelectContentClassName}>
                    <SelectItem value="newest">{localizedText(locale, "Nyast först", "Newest first")}</SelectItem>
                    <SelectItem value="oldest">{localizedText(locale, "Äldst först", "Oldest first")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

        </div>
      </div>

      {error && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="mt-6 rounded-lg border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
          {localizedText(locale, "Hämtar företagets annonser...", "Loading company listings...")}
        </div>
      ) : filteredAds.length === 0 ? (
        <div className="mt-6 rounded-lg border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-500">
          {localizedText(locale, "Inga annonser matchade ditt filter.", "No listings matched your filters.")}
        </div>
      ) : (
        <div
          className={cn(
            "mt-6 grid min-w-0 grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
            selectedListingIds.length > 0 && "pb-28 sm:pb-24"
          )}
        >
          {filteredAds.map((item) => {
            const { area, city } = splitLocation(item.listing.location, locale);
            const listingId = String(item.listing.id);
            const isSelected = selectedListingIdSet.has(listingId);
            return (
              <div key={item.listing.id} className="flex w-full min-w-0 justify-center">
                <div
                  className={cn(
                    "relative w-full max-w-[360px] rounded-[28px] transition-[box-shadow,transform] duration-200",
                    isSelected && "ring-2 ring-[#004225]/40 ring-offset-2 ring-offset-white"
                  )}
                >
                  <Checkbox
                    checked={isSelected}
                    disabled={updatingListings}
                    onClick={(event) => event.stopPropagation()}
                    onCheckedChange={(checked) =>
                      toggleListingSelection(listingId, checked === true)
                    }
                    aria-label={localizedText(locale, "Välj annons", "Select listing")}
                    className={cn(
                      selectionCheckboxClassName,
                      "absolute left-3 top-3 z-20 size-6 border-white/80 bg-white/95 shadow-[0_8px_18px_rgba(15,23,42,0.16)] backdrop-blur-md",
                      isSelected && "border-[#004225] bg-[#004225]"
                    )}
                  />
                  <ListingCardSmall
                    id={item.listing.id}
                    title={item.listing.title}
                    area={area}
                    city={city}
                    dwellingType={item.listing.dwellingType || localizedText(locale, "Bostad", "Home")}
                    rooms={item.listing.rooms || 0}
                    sizeM2={item.listing.sizeM2 || 0}
                    rent={item.listing.rent || 0}
                    imageUrl={item.listing.imageUrl}
                    landlordType={item.listing.hostType}
                    hostName={item.listing.hostName}
                    hostLogoUrl={item.listing.hostLogoUrl}
                    isVerified={item.listing.verifiedHost}
                    variant="compact"
                    showFavoriteButton={false}
                    showHostLogo={false}
                    reserveTagSpace={false}
                    imageTopRightContent={
                      <PortalListingStatusTag
                        label={item.statusLabel}
                        tone={item.statusTone}
                      />
                    }
                    footerContent={
                      <div className="flex items-end justify-between gap-3 text-[11px] text-gray-600">
                        <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
                          <span className="inline-flex items-center gap-1 whitespace-nowrap font-medium text-gray-800">
                            <Eye className="h-3 w-3 text-gray-500" />
                            {item.detailedViews.toLocaleString(numberLocale(locale))} {localizedText(locale, "visningar", "views")}
                          </span>
                        </div>
                        <span className="shrink-0 whitespace-nowrap text-right">
                          {localizedText(locale, `Publicerad ${item.publishedAt}`, `Published ${item.publishedAt}`)}
                        </span>
                      </div>
                    }
                    onClick={() =>
                      router.push(`${dashboardRelPath}/listings/${item.listing.id}`)
                    }
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
