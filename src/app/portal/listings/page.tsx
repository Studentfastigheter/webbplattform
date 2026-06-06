"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useQueries } from "@tanstack/react-query";
import {
  Eye,
  MousePointerClick,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import ListingCardSmall from "@/features/listings/components/ListingCard_Small";
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
import { companyService, type ListingViewCounts } from "@/features/companies/services/company-service";
import {
  useApplicationCountsPerObject,
  useRefreshCompanyListings,
} from "@/features/companies/hooks/useCompanies";
import { useAllCompanyListings } from "@/features/queues/hooks/useQueues";
import { qk } from "@/lib/query/keys";
import { type ListingCardDTO } from "@/types/listing";
import PortalListingStatusTag, {
  type PortalListingStatusTone,
} from "../_components/shared/PortalListingStatusTag";
import { PortalControlSelectTrigger } from "../_components/shared/PortalControlSelectTrigger";
import { dashboardRelPath } from "../_statics/variables";

type RawListing = ListingCardDTO & Record<string, unknown>;

type StatusFilter = "all" | "active" | "inactive";
type DateSort = "newest" | "oldest";

type PortalListing = {
  listing: ListingCardDTO;
  quickViews: number;
  detailedViews: number;
  applications: number;
  publishedAt: string;
  publishedAtTime: number | null;
  statusLabel: string;
  statusTone: PortalListingStatusTone;
};

type StatsLookup = Map<string, number>;
type ListingViewCountsLookup = Map<string, ListingViewCounts>;

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

function mapStatus(statusRaw: string | undefined, locale: Locale): {
  label: string;
  tone: PortalListingStatusTone;
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
    return { label: localizedText(locale, "Aktiv", "Active"), tone: "success" };
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
      "rented",
      "uthyrd",
    ].includes(status)
  ) {
    return { label: localizedText(locale, "Inaktiv", "Inactive"), tone: "warning" };
  }

  return { label: statusRaw ?? localizedText(locale, "Okänd", "Unknown"), tone: "neutral" };
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

export default function PortalAdsPage() {
  const { locale } = useI18n();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [dateSort, setDateSort] = useState<DateSort>("newest");
  const [cityFilter, setCityFilter] = useState("all");
  const hasActiveFilters = statusFilter !== "all" || cityFilter !== "all";

  const companyId = getActiveCompanyId(user);
  const refreshListingsMutation = useRefreshCompanyListings();
  const refreshingListings = refreshListingsMutation.isPending;

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

  // Per-listing view counts — N parallel queries, each cached under the
  // same key the analytics page uses. After the listings array settles
  // these fire in parallel and merge into a Map. Listings that fail or
  // are still loading simply have no entry → `resolveListingViewCounts`
  // falls back to the embedded count fields on the listing DTO.
  const viewCountQueries = useQueries({
    queries: companyListings.map((listing) => ({
      queryKey: qk.companies.viewCounts(companyId ?? -1, String(listing.id)),
      queryFn: ({ signal }) =>
        companyService.listingViewCounts(companyId!, listing.id, { signal }),
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
    if (!companyId || refreshingListings) {
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
  }, [companyId, locale, refreshingListings, refreshListingsMutation]);

  const ads = useMemo<PortalListing[]>(() => {
    if (!companyListings || companyListings.length === 0) return [];
    const applicationsLookup = createApplicationLookup(applicationsByObject);
    return companyListings.map((dto) => {
      const raw = dto as RawListing;
      const { quickViews, detailedViews } = resolveListingViewCounts(
        raw,
        viewCountsByListingId,
      );
      const applications = resolveApplicationCount(raw, applicationsLookup) ?? 0;
      const publishedAtRaw = pickString(raw, ["published"]);
      const { label, tone } = mapStatus(
        pickString(raw, ["status", "listingStatus", "state"]),
        locale
      );
      return {
        listing: dto,
        quickViews,
        detailedViews,
        applications,
        publishedAt: formatDate(publishedAtRaw, locale),
        publishedAtTime: parseDateTime(publishedAtRaw),
        statusLabel: label,
        statusTone: tone,
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
            : statusFilter === "active"
              ? item.statusTone === "success"
              : item.statusTone !== "success";

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
            <Button
              className="w-full sm:w-auto"
              isDisabled={loading || refreshingListings}
              isLoading={refreshingListings}
              onPress={() => void handleRefreshListings()}
              variant="outline"
            >
              <RefreshCw className="h-4 w-4" />
              {localizedText(locale, "Synka annonser", "Sync listings")}
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-6 border-b border-gray-200 pb-3 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,720px)_minmax(0,1fr)] lg:grid-rows-[auto_auto] lg:items-start">
          <div className="order-2 w-full lg:col-start-1 lg:row-start-2">
            <div className="w-full sm:max-w-md">
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                <div className="grid min-w-0 flex-1 grid-cols-1 gap-2 sm:grid-cols-2">
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
                      <SelectContent>
                        <SelectItem value="all">{localizedText(locale, "Alla statusar", "All statuses")}</SelectItem>
                        <SelectItem value="active">{localizedText(locale, "Aktiva", "Active")}</SelectItem>
                        <SelectItem value="inactive">{localizedText(locale, "Inaktiva", "Inactive")}</SelectItem>
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
                      <SelectContent>
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
                    className="h-8 shrink-0 px-1 text-xs font-medium text-gray-500 transition-colors hover:text-[#004225]"
                  >
                    {localizedText(locale, "Rensa filter", "Clear filters")}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="order-1 w-full lg:col-start-2 lg:row-start-1">
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

            <div className="hidden">
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-400">
                {localizedText(locale, "Filtrera", "Filter")}
              </span>
              <div className="grid min-w-0 flex-1 grid-cols-1 gap-2 sm:grid-cols-2">
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
                    <SelectContent>
                      <SelectItem value="all">{localizedText(locale, "Alla statusar", "All statuses")}</SelectItem>
                      <SelectItem value="active">{localizedText(locale, "Aktiva", "Active")}</SelectItem>
                      <SelectItem value="inactive">{localizedText(locale, "Inaktiva", "Inactive")}</SelectItem>
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
                    <SelectContent>
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
                  className="h-8 shrink-0 px-1 text-xs font-medium text-gray-500 transition-colors hover:text-[#004225]"
                >
                  {localizedText(locale, "Rensa filter", "Clear filters")}
                </button>
              )}
            </div>
          </div>

          <div className="order-3 w-full lg:col-start-3 lg:row-start-2">
            <div className="w-full sm:ml-auto sm:w-44">
              <Select
                value={dateSort}
                onValueChange={(value) => setDateSort(value as DateSort)}
              >
                <PortalControlSelectTrigger
                  aria-label={localizedText(locale, "Sortera annonser", "Sort listings")}
                >
                  <SelectValue />
                </PortalControlSelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">{localizedText(locale, "Nyast först", "Newest first")}</SelectItem>
                  <SelectItem value="oldest">{localizedText(locale, "Äldst först", "Oldest first")}</SelectItem>
                </SelectContent>
              </Select>
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
        <div className="mt-6 grid min-w-0 grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredAds.map((item) => {
            const { area, city } = splitLocation(item.listing.location, locale);
            return (
              <div key={item.listing.id} className="flex min-w-0 w-full justify-center">
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
                          {item.quickViews.toLocaleString(numberLocale(locale))} {localizedText(locale, "snabb", "quick")}
                        </span>
                        <span className="inline-flex items-center gap-1 whitespace-nowrap font-medium text-gray-800">
                          <MousePointerClick className="h-3 w-3 text-gray-500" />
                          {item.detailedViews.toLocaleString(numberLocale(locale))} {localizedText(locale, "klicks", "clicks")}
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
            );
          })}
        </div>
      )}
    </div>
  );
}
