"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, FileUser, Plus, Search } from "lucide-react";
import ListingCardSmall from "@/components/Listings/ListingCard_Small";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { companyService } from "@/services/company";
import { queueService } from "@/services/queue-service";
import { type ListingCardDTO } from "@/types/listing";
import { dashboardRelPath } from "../../_statics/variables";

type RawListing = ListingCardDTO & Record<string, unknown>;

type ListingStatusTone = "success" | "warning" | "neutral";

type PortalListing = {
  listing: ListingCardDTO;
  views: number;
  applications: number;
  publishedAt: string;
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

  return { label: statusRaw ?? "Okand", tone: "neutral" };
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
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">(
    "all"
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ads, setAds] = useState<PortalListing[]>([]);

  const companyId =
    user?.accountType === "company" && Number.isFinite(Number(user.id))
      ? Number(user.id)
      : null;

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
              "impressions",
              "stats.views",
              "analytics.views",
              "statistics.views",
            ]) ?? 0;

          const applications = resolveApplicationCount(raw, applicationsLookup) ?? 0;
          const publishedAt = formatDate(
            pickString(raw, [
              "publishedAt",
              "publishDate",
              "publishedDate",
              "createdAt",
              "postedAt",
              "uploadedAt",
            ])
          );
          const { label, tone } = mapStatus(
            pickString(raw, ["status", "listingStatus", "state"])
          );

          return {
            listing: dto,
            views,
            applications,
            publishedAt,
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
            : "Kunde inte hamta annonser for foretaget."
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

  const filteredAds = useMemo(() => {
    const normalizedQuery = search.trim().toLowerCase();

    return ads.filter((item) => {
      const statusPass =
        statusFilter === "all"
          ? true
          : statusFilter === "active"
            ? item.statusTone === "success"
            : item.statusTone !== "success";

      if (!statusPass) return false;
      if (!normalizedQuery) return true;

      const location = item.listing.location ?? "";
      return (
        item.listing.title.toLowerCase().includes(normalizedQuery) ||
        location.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [ads, search, statusFilter]);

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
        Logga in for att se foretagets annonser.
      </div>
    );
  }

  if (user.accountType !== "company") {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
        Denna sida ar bara tillganglig for foretagskonton.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <p className="text-theme-sm text-gray-500">Objekt</p>
        <h1 className="text-2xl font-semibold text-gray-900">Mina annonser</h1>
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-theme-xs lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full max-w-xl">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Sok pa titel eller omrade"
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={statusFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("all")}
          >
            Alla
          </Button>
          <Button
            variant={statusFilter === "active" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("active")}
          >
            Aktiva
          </Button>
          <Button
            variant={statusFilter === "inactive" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("inactive")}
          >
            Inaktiva
          </Button>
          <Button as="a" href={`${dashboardRelPath}/annonser/ny/onboarding/1`}>
            <Plus className="h-4 w-4" />
            Skapa annons
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
          Hamtar foretagets annonser...
        </div>
      ) : filteredAds.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-500">
          Inga annonser matchade ditt filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
                    <div className="grid grid-cols-[auto_auto_1fr] items-center gap-2 text-[11px] text-gray-600">
                      <span className="inline-flex items-center gap-1 whitespace-nowrap font-medium text-gray-800">
                        <Eye className="h-3 w-3 text-gray-500" />
                        {item.views.toLocaleString("sv-SE")}
                      </span>
                      <span className="inline-flex items-center gap-1 whitespace-nowrap font-medium text-gray-800">
                        <FileUser className="h-3 w-3 text-gray-500" />
                        {item.applications.toLocaleString("sv-SE")}
                      </span>
                      <span className="truncate text-right">
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
