"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  Edit3,
  FileUser,
  Home,
  ImageIcon,
  MapPin,
  Ruler,
  Tag as TagIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Tag from "@/components/ui/Tag";
import { useAuth } from "@/context/AuthContext";
import { getActiveCompanyId } from "@/lib/company-access";
import { cn } from "@/lib/utils";
import { companyService, type ObjectApplicationCount } from "@/services/company";
import { listingService } from "@/services/listing-service";
import { queueService } from "@/services/queue-service";
import { type ListingCardDTO, type ListingDetailDTO } from "@/types/listing";
import { dashboardRelPath } from "../_statics/variables";

type AnnonsOverviewProps = {
  id: string;
};

type RawListing = ListingCardDTO & Record<string, unknown>;
type ListingStatusTone = "success" | "warning" | "neutral";

type ListingMeta = {
  applications: number;
  publishedAt: string;
  updatedAt: string;
  statusLabel: string;
  statusTone: ListingStatusTone;
};

const emptyMeta: ListingMeta = {
  applications: 0,
  publishedAt: "-",
  updatedAt: "-",
  statusLabel: "Okänd",
  statusTone: "neutral",
};

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
  applicationsByObject: ObjectApplicationCount[]
): ListingMeta {
  const rawDetail = listing as unknown as Record<string, unknown>;
  const publishedAtRaw =
    (companyListing
      ? pickString(companyListing, [
          "publishedAt",
          "publishDate",
          "publishedDate",
          "createdAt",
          "postedAt",
          "uploadedAt",
        ])
      : undefined) ??
    pickString(rawDetail, [
      "publishedAt",
      "publishDate",
      "publishedDate",
      "createdAt",
      "postedAt",
      "uploadedAt",
    ]);
  const updatedAtRaw =
    (companyListing
      ? pickString(companyListing, ["updatedAt", "modifiedAt", "lastEditedAt"])
      : undefined) ?? pickString(rawDetail, ["updatedAt", "modifiedAt", "lastEditedAt"]);
  const { label, tone } = mapStatus(
    (companyListing
      ? pickString(companyListing, ["status", "listingStatus", "state"])
      : undefined) ?? pickString(rawDetail, ["status", "listingStatus", "state"])
  );

  return {
    applications: resolveApplicationCount(listing, companyListing, applicationsByObject),
    publishedAt: formatDate(publishedAtRaw),
    updatedAt: formatDate(updatedAtRaw),
    statusLabel: label,
    statusTone: tone,
  };
}

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-gray-100 py-3 last:border-b-0">
      <dt className="text-sm text-gray-500">{label}</dt>
      <dd className="max-w-[64%] text-right text-sm font-medium text-gray-900">{value}</dd>
    </div>
  );
}

function FactTile({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-700">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{label}</p>
          <p className="mt-1 truncate text-sm font-semibold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

export default function AnnonsOverview({ id }: AnnonsOverviewProps) {
  const { user, isLoading: authLoading } = useAuth();
  const [listing, setListing] = useState<ListingDetailDTO | null>(null);
  const [meta, setMeta] = useState<ListingMeta>(emptyMeta);
  const [isOwnListing, setIsOwnListing] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const companyId = getActiveCompanyId(user);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    let active = true;
    setLoading(true);
    setError(null);
    setListing(null);
    setMeta(emptyMeta);
    setIsOwnListing(true);

    const companyListingsPromise = companyId
      ? queueService.getCompanyListings(companyId, 0, 200)
      : Promise.resolve<ListingCardDTO[]>([]);
    const applicationsPromise = companyId
      ? companyService.applicationCountsPerObject(companyId, 200).catch(() => [])
      : Promise.resolve<ObjectApplicationCount[]>([]);

    Promise.all([listingService.get(id), companyListingsPromise, applicationsPromise])
      .then(([listingDetail, companyListings, applicationsByObject]) => {
        if (!active) return;

        const matchedCompanyListing =
          (companyListings as RawListing[]).find(
            (item) => String(item.id) === String(listingDetail.id)
          ) ?? null;

        setListing(listingDetail);
        setIsOwnListing(Boolean(matchedCompanyListing));
        setMeta(resolveListingMeta(listingDetail, matchedCompanyListing, applicationsByObject));
      })
      .catch((requestError) => {
        if (!active) return;
        setError(
          requestError instanceof Error ? requestError.message : "Kunde inte ladda annonsen."
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
  }, [authLoading, companyId, id]);

  const editHref = `${dashboardRelPath}/annonser/${encodeURIComponent(id)}/redigera`;
  const applicationsHref = `${dashboardRelPath}/ansokningar?listingId=${encodeURIComponent(id)}`;
  const image = useMemo(() => listing?.imageUrls?.find(Boolean), [listing]);

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

  return (
    <main className="space-y-6 pb-12">
      <div className="flex flex-col gap-4">
        <Link
          href={`${dashboardRelPath}/annonser`}
          className="inline-flex w-fit items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-[#004225]"
        >
          <ArrowLeft className="h-4 w-4" />
          Tillbaka till annonser
        </Link>

        <div className="flex flex-col gap-4 border-b border-gray-200 pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-theme-sm text-gray-500">Annons</p>
              <span
                className={cn(
                  "inline-flex rounded-full border px-3 py-1 text-xs font-semibold",
                  statusClassMap[meta.statusTone]
                )}
              >
                {meta.statusLabel}
              </span>
            </div>
            <h1 className="text-2xl font-semibold text-gray-900">{listing.title}</h1>
            <p className="flex flex-wrap items-center gap-1.5 text-sm text-gray-500">
              <MapPin className="h-4 w-4" />
              {locationLabel || "Plats saknas"}
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Button as="a" className="w-full sm:w-auto" href={editHref}>
              <Edit3 className="h-4 w-4" />
              Redigera annons
            </Button>
            <Button
              as="a"
              className="w-full sm:w-auto"
              href={applicationsHref}
              variant="outline"
            >
              <FileUser className="h-4 w-4" />
              Ansökningar
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <FactTile
          icon={<FileUser className="h-5 w-5" />}
          label="Ansökningar"
          value={formatNumber(meta.applications)}
        />
        <FactTile icon={<Home className="h-5 w-5" />} label="Bostadstyp" value={listing.dwellingType || "-"} />
        <FactTile icon={<Ruler className="h-5 w-5" />} label="Yta" value={formatArea(listing.sizeM2)} />
        <FactTile icon={<CalendarDays className="h-5 w-5" />} label="Publicerad" value={meta.publishedAt} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(340px,0.8fr)]">
        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          {image ? (
            <img alt="" className="h-[320px] w-full object-cover" src={image} />
          ) : (
            <div className="flex h-[320px] items-center justify-center bg-gray-50 text-sm text-gray-500">
              <div className="flex flex-col items-center gap-2">
                <ImageIcon className="h-8 w-8 text-gray-300" />
                Ingen bild uppladdad
              </div>
            </div>
          )}
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-gray-900">Detaljer</h2>
          <dl className="mt-4">
            <DetailRow label="Hyra" value={formatCurrency(listing.rent)} />
            <DetailRow label="Rum" value={listing.rooms || "-"} />
            <DetailRow label="Yta" value={formatArea(listing.sizeM2)} />
            <DetailRow label="Område" value={listing.area || "-"} />
            <DetailRow label="Stad" value={listing.city || "-"} />
            <DetailRow label="Tillgänglig från" value={listing.availableFrom || "-"} />
            <DetailRow label="Tillgänglig till" value={listing.availableTo || "-"} />
            <DetailRow label="Sista ansökan" value={listing.applyBy || "-"} />
            <DetailRow label="Senast ändrad" value={meta.updatedAt} />
          </dl>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(340px,0.8fr)]">
        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-gray-900">Beskrivning</h2>
          <p className="mt-3 whitespace-pre-line text-sm leading-6 text-gray-600">
            {listing.description || "Ingen beskrivning angiven."}
          </p>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-2">
            <TagIcon className="h-5 w-5 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900">Taggar</h2>
          </div>
          {listing.tags?.length ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {listing.tags.map((tag) => (
                <Tag
                  bgColor="#F3F4F6"
                  fontSize={13}
                  height={28}
                  horizontalPadding={14}
                  key={tag}
                  text={tag}
                  textColor="#1F2937"
                />
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-gray-500">Inga taggar angivna.</p>
          )}
        </section>
      </div>
    </main>
  );
}
