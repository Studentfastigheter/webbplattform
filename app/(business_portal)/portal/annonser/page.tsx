"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, FileUser, MousePointerClick, Plus, Search, X } from "lucide-react";
import ListingCardSmall from "@/components/Listings/ListingCard_Small";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { getActiveCompanyId } from "@/lib/company-access";
import { companyService } from "@/services/company";
import { queueService } from "@/services/queue-service";
import { type ListingCardDTO } from "@/types/listing";
import { PortalControlSelectTrigger } from "../../_components/PortalControlSelectTrigger";
import { dashboardRelPath } from "../../_statics/variables";

type RawListing = ListingCardDTO & Record<string, unknown>;

type ListingStatusTone = "success" | "warning" | "neutral";
type StatusFilter = "all" | "active" | "inactive";
type DateSort = "newest" | "oldest";

type PortalListing = {
  listing: ListingCardDTO;
  views: number;
  clicks: number;
  applications: number;
  publishedAt: string;
  publishedAtTime: number | null;
  statusLabel: string;
  statusTone: ListingStatusTone;
};

type StatsLookup = Map<string, number>;

const statusClassMap: Record<ListingStatusTone, string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
  neutral: "border-gray-200 bg-gray-100 text-gray-700",
};

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

function mapStatus(statusRaw?: string): {
  label: string;
  tone: ListingStatusTone;
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
    return { label: "Aktiv", tone: "success" };
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
    return { label: "Inaktiv", tone: "warning" };
  }

  return { label: statusRaw ?? "Okänd", tone: "neutral" };
}

function formatDate(value?: string): string {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";

  return new Intl.DateTimeFormat("sv-SE", {
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

function splitLocation(location?: string): { area: string; city: string } {
  if (!location) {
    return { area: "Ej angivet", city: "Ej angivet" };
  }

  const parts = location
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 0) {
    return { area: "Ej angivet", city: "Ej angivet" };
  }

  return {
    area: parts[0] ?? "Ej angivet",
    city: parts[1] ?? parts[0] ?? "Ej angivet",
  };
}

export default function PortalAdsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [dateSort, setDateSort] = useState<DateSort>("newest");
  const [cityFilter, setCityFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ads, setAds] = useState<PortalListing[]>([]);
  const hasActiveFilters = statusFilter !== "all" || cityFilter !== "all";

  const companyId = getActiveCompanyId(user);

  useEffect(() => {
    if (authLoading || !companyId) {
      return;
    }

    let active = true;
    setLoading(true);
    setError(null);

    Promise.all([
      queueService.getCompanyListings(companyId, 0, 200),
      companyService.applicationCountsPerObject(companyId, 200).catch(() => []),
    ])
      .then(([companyListings, applicationsByObject]) => {
        if (!active) return;

        const applicationsLookup = createApplicationLookup(applicationsByObject);
        const normalized = companyListings.map((dto) => {
          const raw = dto as RawListing;
          const views =
            pickNumber(raw, [
              "views",
              "viewCount",
              "viewsCount",
              "viewings",
              "viewingsCount",
              "impressions",
              "stats.views",
              "stats.viewings",
              "analytics.views",
              "analytics.viewings",
              "statistics.views",
              "statistics.viewings",
            ]) ?? 0;
          const clicks =
            pickNumber(raw, [
              "clicks",
              "clickCount",
              "clicksCount",
              "interactions",
              "interactionCount",
              "interactionsCount",
              "stats.clicks",
              "stats.interactions",
              "analytics.clicks",
              "analytics.interactions",
              "statistics.clicks",
              "statistics.interactions",
            ]) ?? 0;

          const applications = resolveApplicationCount(raw, applicationsLookup) ?? 0;
          const publishedAtRaw = pickString(raw, [
            "publishedAt",
            "publishDate",
            "publishedDate",
            "createdAt",
            "postedAt",
            "uploadedAt",
          ]);
          const { label, tone } = mapStatus(
            pickString(raw, ["status", "listingStatus", "state"])
          );

          return {
            listing: dto,
            views,
            clicks,
            applications,
            publishedAt: formatDate(publishedAtRaw),
            publishedAtTime: parseDateTime(publishedAtRaw),
            statusLabel: label,
            statusTone: tone,
          };
        });

        setAds(normalized);
      })
      .catch((requestError) => {
        if (!active) return;
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Kunde inte hämta annonser för företaget."
        );
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [authLoading, companyId]);

  const availableCities = useMemo(() => {
    const cities = new Set<string>();

    ads.forEach((item) => {
      const { city } = splitLocation(item.listing.location);
      if (city && city !== "Ej angivet") {
        cities.add(city);
      }
    });

    return Array.from(cities).sort((a, b) => a.localeCompare(b, "sv-SE"));
  }, [ads]);

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

        const { city } = splitLocation(item.listing.location);
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
  }, [ads, cityFilter, dateSort, search, statusFilter]);

  if (authLoading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-500">
        Laddar annonser...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
        Logga in för att se företagets annonser.
      </div>
    );
  }

  if (!companyId) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
        Denna sida är bara tillgänglig för företagskonton.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-theme-sm text-gray-500">Objekt</p>
            <h1 className="text-2xl font-semibold text-gray-900">Mina annonser</h1>
          </div>

          <Button
            as="a"
            href={`${dashboardRelPath}/annonser/ny/onboarding/1`}
            className="w-full sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            Skapa annons
          </Button>
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
                        aria-label="Filtrera på status"
                      >
                        <SelectValue />
                      </PortalControlSelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Alla statusar</SelectItem>
                        <SelectItem value="active">Aktiva</SelectItem>
                        <SelectItem value="inactive">Inaktiva</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="min-w-0">
                    <Select value={cityFilter} onValueChange={setCityFilter}>
                      <PortalControlSelectTrigger
                        aria-label="Filtrera på stad"
                      >
                        <SelectValue />
                      </PortalControlSelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Alla städer</SelectItem>
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
                    Rensa filter
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
                placeholder="Sök på titel, stad eller område"
                className="min-w-0 flex-1 bg-transparent text-sm text-black outline-none placeholder:text-black/45 sm:text-base"
              />
              {searchInput && (
                <button
                  type="button"
                  aria-label="Rensa sökning"
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
                Sök
              </button>
            </form>

            <div className="hidden">
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-400">
                Filtrera
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
                      aria-label="Filtrera på status"
                    >
                      <SelectValue />
                    </PortalControlSelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alla statusar</SelectItem>
                      <SelectItem value="active">Aktiva</SelectItem>
                      <SelectItem value="inactive">Inaktiva</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="min-w-0">
                  <Select value={cityFilter} onValueChange={setCityFilter}>
                    <PortalControlSelectTrigger
                      aria-label="Filtrera på stad"
                    >
                      <SelectValue />
                    </PortalControlSelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alla städer</SelectItem>
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
                  Rensa filter
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
                  aria-label="Sortera annonser"
                >
                  <SelectValue />
                </PortalControlSelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Nyast först</SelectItem>
                  <SelectItem value="oldest">Äldst först</SelectItem>
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
          Hämtar företagets annonser...
        </div>
      ) : filteredAds.length === 0 ? (
        <div className="mt-6 rounded-lg border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-500">
          Inga annonser matchade ditt filter.
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredAds.map((item) => {
            const { area, city } = splitLocation(item.listing.location);
            return (
              <div key={item.listing.id} className="flex w-full justify-center">
                <ListingCardSmall
                  id={item.listing.id}
                  title={item.listing.title}
                  area={area}
                  city={city}
                  dwellingType={item.listing.dwellingType || "Bostad"}
                  rooms={item.listing.rooms || 0}
                  sizeM2={item.listing.sizeM2 || 0}
                  rent={item.listing.rent || 0}
                  tags={item.listing.tags}
                  imageUrl={item.listing.imageUrl}
                  landlordType={item.listing.hostType}
                  hostName={item.listing.hostName}
                  hostLogoUrl={item.listing.hostLogoUrl}
                  isVerified={item.listing.verifiedHost}
                  variant="compact"
                  showFavoriteButton={false}
                  showHostLogo={false}
                  imageTopRightContent={
                    <span
                      className={`inline-flex rounded-full border px-3 py-2.5 text-[10px] font-semibold shadow-sm ${statusClassMap[item.statusTone]}`}
                    >
                      {item.statusLabel}
                    </span>
                  }
                  footerContent={
                    <div className="flex items-end justify-between gap-3 text-[11px] text-gray-600">
                      <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
                        <span className="inline-flex items-center gap-1 whitespace-nowrap font-medium text-gray-800">
                          <Eye className="h-3 w-3 text-gray-500" />
                          {item.views.toLocaleString("sv-SE")} visn.
                        </span>
                        <span className="inline-flex items-center gap-1 whitespace-nowrap font-medium text-gray-800">
                          <MousePointerClick className="h-3 w-3 text-gray-500" />
                          {item.clicks.toLocaleString("sv-SE")} klick
                        </span>
                        <span className="inline-flex items-center gap-1 whitespace-nowrap font-medium text-gray-800">
                          <FileUser className="h-3 w-3 text-gray-500" />
                          {item.applications.toLocaleString("sv-SE")} ans.
                        </span>
                      </div>
                      <span className="shrink-0 whitespace-nowrap text-right">
                        Publicerad {item.publishedAt}
                      </span>
                    </div>
                  }
                  onClick={() =>
                    router.push(`${dashboardRelPath}/annonser/${item.listing.id}`)
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
