"use client";

import * as React from "react";
import Link from "next/link";
import { AnalyticsBlock } from "@/features/analytics/components/AnalyticsBlocks";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useAuth } from "@/context/AuthContext";
import { getActiveCompanyId } from "@/lib/company-access";
import { companyService, type NewApplication } from "@/features/companies/services/company-service";
import { dashboardRelPath } from "../../_statics/variables";

type Limit = 5 | 10;

type ObjectApplicationRow = {
  listingId?: string | number;
  title: string;
  imageUrl?: string;
  address?: string;
  location?: string;
  rent?: number;
  dwellingType?: string;
  rooms?: number | null;
  sizeM2?: number | null;
  numApplications: number;
};

function formatListingFacts(item: ObjectApplicationRow) {
  return [
    item.dwellingType,
    item.rooms ? `${item.rooms} rum` : null,
    item.sizeM2 ? `${item.sizeM2} m²` : null,
  ]
    .filter(Boolean)
    .join(" • ");
}

function formatRent(rent?: number) {
  return typeof rent === "number" && Number.isFinite(rent)
    ? `${rent.toLocaleString("sv-SE")} kr/mån`
    : null;
}

function getApplicationListingKey(application: NewApplication) {
  if (application.listingId != null) {
    return String(application.listingId);
  }

  return [
    application.listingTitle,
    application.address,
    application.listingCity,
  ]
    .filter(Boolean)
    .join("|") || "unknown";
}

function buildApplicationRows(applications: NewApplication[], limit: Limit) {
  const grouped = new Map<string, NewApplication[]>();

  applications.forEach((application) => {
    const key = getApplicationListingKey(application);
    grouped.set(key, [...(grouped.get(key) ?? []), application]);
  });

  return Array.from(grouped.values())
    .map((rows) => {
      const first = rows[0];
      const location = first.listingCity;

      return {
        listingId: first.listingId,
        title: first.listingTitle || first.address || "Okänd annons",
        imageUrl: first.listingImage,
        address: first.address || location || undefined,
        location,
        rent: first.listingRent,
        dwellingType: first.listingDwellingType,
        rooms: first.listingRooms,
        sizeM2: first.listingSizeM2,
        numApplications: rows.length,
      } satisfies ObjectApplicationRow;
    })
    .sort((a, b) => b.numApplications - a.numApplications)
    .slice(0, limit);
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
  const title = item.title || item.address || `Annons ${index + 1}`;
  const location = item.location || item.address;
  const rent = formatRent(item.rent);
  const facts = formatListingFacts(item);
  const href =
    item.listingId != null
      ? `${dashboardRelPath}/annonser/${encodeURIComponent(String(item.listingId))}`
      : null;
  const content = (
    <div className="grid min-h-[118px] min-w-0 grid-cols-[96px_minmax(0,1fr)] sm:grid-cols-[132px_minmax(0,1fr)]">
      <div className="relative h-full min-h-[118px] overflow-hidden bg-gray-100">
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt=""
            className="absolute inset-0 block !h-full !w-full max-w-none object-cover object-center"
            src={item.imageUrl}
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

      <div className="flex min-w-0 flex-1 flex-col gap-3 px-3 py-3 sm:flex-row sm:items-center sm:gap-4 sm:px-4 sm:py-4">
        <div className="min-w-0 flex-1">
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

        <div className="flex w-full shrink-0 items-center justify-between rounded-xl bg-gray-50 px-3 py-2 text-center sm:ml-auto sm:w-[86px] sm:flex-col sm:justify-center sm:rounded-2xl sm:py-3">
          <span className="text-xl font-semibold leading-7 tracking-normal text-gray-900 tabular-nums sm:text-3xl sm:leading-8">
            {item.numApplications.toLocaleString("sv-SE")}
          </span>
          <span className="text-xs font-medium leading-4 text-gray-500 sm:mt-1">
            ans.
          </span>
        </div>
      </div>
    </div>
  );

  if (!href) {
    return (
      <div className="min-h-[118px] overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        {content}
      </div>
    );
  }

  return (
    <Link
      className="group block min-h-[118px] overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition hover:border-brand-100 hover:bg-brand-25/40 hover:shadow-[0_6px_18px_rgba(16,24,40,0.08)]"
      href={href}
    >
      {content}
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
            key={`${item.listingId ?? item.title}-${index}`}
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
          <div className="grid min-h-[118px] grid-cols-[96px_minmax(0,1fr)] sm:grid-cols-[132px_minmax(0,1fr)]">
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
    setIsLoading(true);
    setError(null);

    companyService
      .applications(companyId)
      .then((result) => {
        if (!cancelled) {
          setItems(buildApplicationRows(result, limit));
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
      size="2x2"
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
