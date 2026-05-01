"use client";

import * as React from "react";
import Link from "next/link";
import { AnalyticsBlock } from "@/components/analytics/AnalyticsBlocks";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useAuth } from "@/context/AuthContext";
import { getActiveCompanyId } from "@/lib/company-access";
import {
  companyService,
  type ObjectApplicationCount,
} from "@/services/company";
import { listingService } from "@/services/listing-service";
import type { ListingDetailDTO } from "@/types/listing";
import { dashboardRelPath } from "../_statics/variables";

type Limit = 5 | 10;

type ListingPreview = {
  title: string;
  imageUrl?: string;
  address?: string;
  location?: string;
  rent?: number;
  dwellingType?: string;
  rooms?: number | null;
  sizeM2?: number | null;
};

type ObjectApplicationRow = ObjectApplicationCount & {
  preview?: ListingPreview;
};

function formatListingFacts(preview: ListingPreview) {
  return [
    preview.dwellingType,
    preview.rooms ? `${preview.rooms} rum` : null,
    preview.sizeM2 ? `${preview.sizeM2} m²` : null,
  ]
    .filter(Boolean)
    .join(" • ");
}

function formatRent(rent?: number) {
  return typeof rent === "number" && Number.isFinite(rent)
    ? `${rent.toLocaleString("sv-SE")} kr/mån`
    : null;
}

function toListingPreview(listing: ListingDetailDTO): ListingPreview {
  const location = [listing.area, listing.city].filter(Boolean).join(", ");

  return {
    title: listing.title,
    imageUrl: listing.imageUrls?.[0],
    address: listing.fullAddress || location || undefined,
    location,
    rent: listing.rent,
    dwellingType: listing.dwellingType,
    rooms: listing.rooms,
    sizeM2: listing.sizeM2,
  };
}

function LimitToggle({
  value,
  onChange,
}: {
  value: Limit;
  onChange: (value: Limit) => void;
}) {
  return (
    <ToggleGroup
      className="rounded-md bg-gray-50 p-0.5"
      onValueChange={(nextValue) => {
        if (nextValue === "5" || nextValue === "10") {
          onChange(Number(nextValue) as Limit);
        }
      }}
      type="single"
      value={String(value)}
      variant="outline"
    >
      {[
        ["5", "Top 5"],
        ["10", "Top 10"],
      ].map(([optionValue, label]) => (
        <ToggleGroupItem
          aria-label={label}
          className="h-7 border-0 px-2.5 text-[11px] font-medium text-gray-500 hover:bg-white hover:text-gray-900 data-[state=on]:bg-white data-[state=on]:text-gray-900 data-[state=on]:shadow-theme-xs"
          key={optionValue}
          value={optionValue}
        >
          {label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}

function ListingApplicationPreviewRow({
  item,
  index,
}: {
  item: ObjectApplicationRow;
  index: number;
}) {
  const title = item.preview?.title || item.address || `Annons ${index + 1}`;
  const location = item.preview?.location || item.preview?.address || item.address;
  const imageUrl = item.preview?.imageUrl;
  const rent = item.preview ? formatRent(item.preview.rent) : null;
  const facts = item.preview ? formatListingFacts(item.preview) : null;
  const href = `${dashboardRelPath}/annonser/${encodeURIComponent(
    String(item.listingId)
  )}`;

  return (
    <Link
      className="group block min-h-[118px] overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition hover:border-brand-100 hover:bg-brand-25/40 hover:shadow-[0_6px_18px_rgba(16,24,40,0.08)]"
      href={href}
    >
      <div className="grid min-h-[118px] min-w-0 grid-cols-[132px_minmax(0,1fr)]">
        <div className="relative h-full min-h-[118px] overflow-hidden bg-gray-100">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt=""
              className="absolute inset-0 block !h-full !w-full max-w-none object-cover object-center"
              src={imageUrl}
            />
          ) : (
            <div className="absolute inset-0 flex h-full w-full items-center justify-center bg-brand-50 text-xs font-semibold text-brand-500">
              Ingen bild
            </div>
          )}

          <span className="absolute left-2 top-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-white/95 px-1.5 text-[11px] font-semibold text-gray-900 shadow-sm">
            {index + 1}
          </span>
        </div>

        <div className="flex min-w-0 flex-1 items-center gap-4 px-4 py-4">
          <div className="min-w-0">
            <p className="truncate text-xs leading-5 text-gray-500">
              {location || "Annons"}
            </p>
            <h3 className="truncate text-base font-semibold leading-6 text-gray-900">
              {title}
            </h3>

            <div className="mt-1.5 flex min-w-0 items-center gap-2">
              {rent ? (
                <span className="truncate text-sm font-semibold leading-5 text-gray-900">
                  {rent}
                </span>
              ) : null}
              {facts ? (
                <span className="truncate text-sm leading-5 text-gray-500">
                  {facts}
                </span>
              ) : null}
            </div>
          </div>

          <div className="ml-auto flex w-[86px] shrink-0 flex-col items-center justify-center rounded-2xl bg-gray-50 px-3 py-3 text-center">
            <span className="text-3xl font-semibold leading-8 tracking-normal text-gray-900 tabular-nums">
              {item.numApplications.toLocaleString("sv-SE")}
            </span>
            <span className="mt-1 text-xs font-medium leading-4 text-gray-500">
              ans.
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function ApplicationsByObjectList({
  items,
}: {
  items: ObjectApplicationRow[];
}) {
  if (items.length === 0) {
    return (
      <div className="flex h-full items-center justify-center rounded-md border border-dashed border-gray-200 px-4 text-center text-theme-sm text-gray-500">
        Det finns inga ansökningar per annons att visa ännu.
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto pr-1">
      <div className="space-y-3">
        {items.map((item, index) => (
          <ListingApplicationPreviewRow
            index={index}
            item={item}
            key={`${item.listingId}-${index}`}
          />
        ))}
      </div>
    </div>
  );
}

function LoadingList() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          className="min-h-[118px] overflow-hidden rounded-2xl border border-gray-100 bg-white"
          key={index}
        >
          <div className="grid min-h-[118px] grid-cols-[132px_minmax(0,1fr)]">
            <Skeleton className="h-full min-h-[118px] rounded-none" />
            <div className="min-w-0 flex-1 space-y-2 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-5 w-36" />
                </div>
                <Skeleton className="h-16 w-[86px] rounded-2xl" />
              </div>
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AnalyticsApplicationsByObjectBlock() {
  const { user, isLoading: authLoading } = useAuth();
  const companyId = getActiveCompanyId(user);
  const [limit, setLimit] = React.useState<Limit>(5);
  const [items, setItems] = React.useState<ObjectApplicationRow[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!companyId) {
      setItems([]);
      setError("Kunde inte hitta ett aktivt företag för statistiken.");
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    const activeCompanyId = companyId;
    setIsLoading(true);
    setError(null);

    async function loadApplicationsByObject() {
      const result = await companyService.applicationCountsPerObject(
        activeCompanyId,
        limit
      );
      const previewResults = await Promise.allSettled(
        result.map(async (item) => {
          const listing = await listingService.get(String(item.listingId));
          return {
            listingId: item.listingId,
            preview: toListingPreview(listing),
          };
        })
      );
      const previewByListingId = new Map<string, ListingPreview>();

      previewResults.forEach((previewResult) => {
        if (previewResult.status === "fulfilled") {
          previewByListingId.set(
            String(previewResult.value.listingId),
            previewResult.value.preview
          );
        }
      });

      return result.map((item) => ({
        ...item,
        preview: previewByListingId.get(String(item.listingId)),
      }));
    }

    loadApplicationsByObject()
      .then((result) => {
        if (!cancelled) {
          setItems(result);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setItems([]);
          setError(
            err instanceof Error
              ? err.message
              : "Kunde inte hämta ansökningar per annons."
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [authLoading, companyId, limit]);

  return (
    <AnalyticsBlock
      action={<LimitToggle onChange={setLimit} value={limit} />}
      contentClassName="overflow-hidden"
      size="4x2"
      title="Ansökningar per annons"
    >
      {authLoading || isLoading ? (
        <LoadingList />
      ) : error ? (
        <div className="flex h-full items-center rounded-md border border-error-500/20 bg-error-50 px-4 text-theme-sm text-error-700">
          {error}
        </div>
      ) : (
        <ApplicationsByObjectList items={items} />
      )}
    </AnalyticsBlock>
  );
}
