"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  CalendarDays,
  ChevronDown,
  CircleCheck,
  CirclePause,
  Edit3,
  FileUser,
  Home,
  ImageIcon,
  MapPin,
  Ruler,
  Tag as TagIcon,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Tag from "@/components/ui/Tag";
import { useAuth } from "@/context/AuthContext";
import { getActiveCompanyId } from "@/lib/company-access";
import { companyService, type ObjectApplicationCount } from "@/services/company";
import { listingService } from "@/services/listing-service";
import { queueService } from "@/services/queue-service";
import { type ListingCardDTO, type ListingDetailDTO } from "@/types/listing";
import PortalListingStatusTag, {
  type PortalListingStatusTone,
} from "../_components/PortalListingStatusTag";
import { dashboardRelPath } from "../_statics/variables";

type AnnonsOverviewProps = {
  id: string;
};

type RawListing = ListingCardDTO & Record<string, unknown>;
type ListingStatusValue = "AVAILABLE" | "HIDDEN" | "RENTED";
type ListingActionState = "idle" | "status" | "delete";

type ListingMeta = {
  applications: number;
  publishedAt: string;
  updatedAt: string;
  statusLabel: string;
  statusTone: PortalListingStatusTone;
  statusValue: ListingStatusValue | null;
};

const emptyMeta: ListingMeta = {
  applications: 0,
  publishedAt: "-",
  updatedAt: "-",
  statusLabel: "Okänd",
  statusTone: "neutral",
  statusValue: null,
};

const listingStatusOptions: Array<{
  value: ListingStatusValue;
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
  value: ListingStatusValue | null;
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
    return { label: "Inaktiv", tone: "warning", value: "HIDDEN" };
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
  const { label, tone, value } = mapStatus(
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
    statusValue: value,
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
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [listing, setListing] = useState<ListingDetailDTO | null>(null);
  const [meta, setMeta] = useState<ListingMeta>(emptyMeta);
  const [isOwnListing, setIsOwnListing] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [actionState, setActionState] = useState<ListingActionState>("idle");

  const companyId = getActiveCompanyId(user);

  const fetchListingData = useCallback(async () => {
    const companyListingsPromise = companyId
      ? queueService.getCompanyListings(companyId, 0, 200)
      : Promise.resolve<ListingCardDTO[]>([]);
    const applicationsPromise = companyId
      ? companyService.applicationCountsPerObject(companyId, 200).catch(() => [])
      : Promise.resolve<ObjectApplicationCount[]>([]);

    const [listingDetail, companyListings, applicationsByObject] = await Promise.all([
      listingService.get(id),
      companyListingsPromise,
      applicationsPromise,
    ]);

    const matchedCompanyListing =
      (companyListings as RawListing[]).find(
        (item) => String(item.id) === String(listingDetail.id)
      ) ?? null;

    return {
      listingDetail,
      isOwnListing: Boolean(matchedCompanyListing),
      meta: resolveListingMeta(listingDetail, matchedCompanyListing, applicationsByObject),
    };
  }, [companyId, id]);

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

    fetchListingData()
      .then(({ listingDetail, isOwnListing: ownListing, meta: listingMeta }) => {
        if (!active) return;

        setListing(listingDetail);
        setIsOwnListing(ownListing);
        setMeta(listingMeta);
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
  }, [authLoading, fetchListingData]);

  const editHref = `${dashboardRelPath}/annonser/${encodeURIComponent(id)}/redigera`;
  const applicationsHref = `${dashboardRelPath}/ansokningar?listingId=${encodeURIComponent(id)}`;
  const image = useMemo(() => listing?.imageUrls?.find(Boolean), [listing]);

  const handleStatusChange = async (status: ListingStatusValue) => {
    const option = listingStatusOptions.find((item) => item.value === status);
    setActionState("status");

    try {
      await listingService.update(id, { status });
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
      await listingService.delete(id);
      toast.success("Annonsen har raderats.");
      setDeleteDialogOpen(false);
      router.push(`${dashboardRelPath}/annonser`);
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
            <h1 className="text-2xl font-semibold text-gray-900">{listing.title}</h1>
            <p className="flex flex-wrap items-center gap-1.5 text-sm text-gray-500">
              <MapPin className="h-4 w-4" />
              {locationLabel || "Plats saknas"}
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-full bg-[#004225] px-4 text-sm font-semibold text-white shadow-[0_6px_14px_rgba(0,0,0,0.18)] transition-colors hover:bg-[#004225]/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#004225] disabled:pointer-events-none disabled:opacity-50 sm:w-auto"
                  disabled={actionState !== "idle"}
                >
                  Hantera
                  <ChevronDown className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 border-gray-200 bg-white">
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href={editHref}>
                    <Edit3 className="h-4 w-4" />
                    Redigera information
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="cursor-pointer">
                    <CircleCheck className="h-4 w-4" />
                    Ändra status
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="w-44 border-gray-200 bg-white">
                    {listingStatusOptions.map((option) => {
                      const Icon = option.icon;
                      const isCurrent = meta.statusValue === option.value;

                      return (
                        <DropdownMenuItem
                          key={option.value}
                          className="cursor-pointer"
                          disabled={actionState !== "idle" || isCurrent}
                          onSelect={() => handleStatusChange(option.value)}
                        >
                          <Icon className="h-4 w-4" />
                          {option.label}
                          {isCurrent ? (
                            <span className="ml-auto text-xs text-gray-400">Nuvarande</span>
                          ) : null}
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>

                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer"
                  disabled={actionState !== "idle"}
                  onSelect={() => setDeleteDialogOpen(true)}
                  variant="destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  Radera annonsen
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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

        <section className="relative rounded-xl border border-gray-200 bg-white p-5">
          <PortalListingStatusTag
            label={meta.statusLabel}
            tone={meta.statusTone}
            className="absolute right-5 top-5"
          />
          <h2 className="pr-28 text-lg font-semibold text-gray-900">Detaljer</h2>
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
                  fontSize={13}
                  height={28}
                  horizontalPadding={14}
                  key={tag}
                  text={tag}
                />
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-gray-500">Inga taggar angivna.</p>
          )}
        </section>
      </div>

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
