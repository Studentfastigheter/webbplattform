"use client";

import * as React from "react";
import Link from "next/link";
import { AnalyticsBlock } from "@/features/analytics/components/AnalyticsBlocks";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/i18n/I18nProvider";
import type { Locale } from "@/i18n/config";
import { localizedText, numberLocale } from "@/i18n/text";
import { getActiveCompanyId } from "@/lib/company-access";
import { useCompanyListingPerformance } from "@/features/companies/hooks/useCompanies";
import type { ListingAnalyticsPerformance } from "@/features/companies/services/company-service";
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
  numResolvedApplications: number;
};

function formatListingFacts(item: ObjectApplicationRow, locale: Locale) {
  return [
    item.dwellingType,
    item.rooms
      ? localizedText(locale, `${item.rooms} rum`, `${item.rooms} rooms`)
      : null,
    item.sizeM2 ? `${item.sizeM2} m²` : null,
  ]
    .filter(Boolean)
    .join(" â€¢ ");
}

function formatRent(rent: number | undefined, locale: Locale) {
  return typeof rent === "number" && Number.isFinite(rent)
    ? localizedText(
        locale,
        `${rent.toLocaleString(numberLocale(locale))} kr/mån`,
        `SEK ${rent.toLocaleString(numberLocale(locale))}/mo`
      )
    : null;
}

function buildApplicationRows(
  listings: ListingAnalyticsPerformance[],
  limit: Limit,
  locale: Locale
) {
  return listings
    .map((listing) => {
      const resolvedApplications =
        listing.periodAcceptedApplications + listing.periodRejectedApplications;
      const totalApplications = listing.periodApplications + resolvedApplications;

      return {
        listingId: listing.listingId,
        title:
          listing.title ||
          listing.address ||
          localizedText(locale, "Okänd annons", "Unknown listing"),
        address: listing.address || listing.city || undefined,
        location: listing.city || listing.area || listing.address,
        rent: listing.rent,
        dwellingType: listing.dwellingType,
        rooms: listing.rooms,
        sizeM2: listing.sizeM2,
        numApplications: totalApplications,
        numResolvedApplications: resolvedApplications,
      } satisfies ObjectApplicationRow;
    })
    .filter((row) => row.numApplications > 0)
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
      className="rounded-lg bg-gray-100 p-0.5"
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
          className="h-8 rounded-md border-0 px-3 text-theme-xs font-medium text-gray-500 hover:bg-white hover:text-gray-900 data-[state=on]:bg-white data-[state=on]:text-gray-900 data-[state=on]:shadow-theme-xs"
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
  locale,
}: {
  item: ObjectApplicationRow;
  index: number;
  locale: Locale;
}) {
  const title = item.title || item.address || localizedText(locale, `Annons ${index + 1}`, `Listing ${index + 1}`);
  const location = item.location || item.address;
  const rent = formatRent(item.rent, locale);
  const facts = formatListingFacts(item, locale);
  const href =
    item.listingId != null
      ? `${dashboardRelPath}/listings/${encodeURIComponent(String(item.listingId))}`
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
            {localizedText(locale, "Ingen bild", "No image")}
          </div>
        )}

        <span className="absolute left-2 top-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-white/95 px-1.5 text-[11px] font-semibold text-gray-900 shadow-sm">
          {index + 1}
        </span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-3 px-3 py-3 sm:flex-row sm:items-center sm:gap-4 sm:px-4 sm:py-4">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs leading-5 text-gray-500">
            {location || localizedText(locale, "Annons", "Listing")}
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
            {item.numApplications.toLocaleString(numberLocale(locale))}
          </span>
          <span className="text-xs font-medium leading-4 text-gray-500 sm:mt-1">
            {localizedText(locale, "ans.", "apps")}
          </span>
        </div>
      </div>
    </div>
  );

  if (!href) {
    return (
      <div className="portal-inner-surface min-h-[118px] overflow-hidden bg-white">
        {content}
      </div>
    );
  }

  return (
    <Link
      className="portal-inner-surface group block min-h-[118px] overflow-hidden bg-white transition hover:border-brand-100 hover:bg-brand-25/40"
      href={href}
    >
      {content}
    </Link>
  );
}

function ApplicationsByObjectList({
  items,
  locale,
}: {
  items: ObjectApplicationRow[];
  locale: Locale;
}) {
  if (items.length === 0) {
    return (
      <div className="flex h-full items-center justify-center rounded-md border border-dashed border-gray-200 px-4 text-center text-theme-sm text-gray-500">
        {localizedText(
          locale,
          "Det finns inga ans?kningar per annons att visa ?nnu.",
          "There are no applications per listing to show yet."
        )}
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
            locale={locale}
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
          className="portal-inner-surface min-h-[118px] overflow-hidden bg-white"
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
  const { locale } = useI18n();
  const { user, isLoading: authLoading } = useAuth();
  const companyId = getActiveCompanyId(user);
  const [limit, setLimit] = React.useState<Limit>(5);
  const performanceQuery = useCompanyListingPerformance(companyId, {
    enabled: !authLoading,
    limit: 200,
    sortBy: "periodApplications",
  });
  const items = React.useMemo(
    () => buildApplicationRows(performanceQuery.data ?? [], limit, locale),
    [performanceQuery.data, limit, locale]
  );
  const error =
    !authLoading && !companyId
      ? localizedText(
          locale,
          "Kunde inte hitta ett aktivt företag för statistiken.",
          "Could not find an active company for the statistics."
        )
      : performanceQuery.isError
        ? performanceQuery.error instanceof Error
          ? performanceQuery.error.message
          : localizedText(
              locale,
              "Kunde inte hämta ansökningar per annons.",
              "Could not load applications per listing."
            )
        : null;
  return (
    <AnalyticsBlock
      action={<LimitToggle onChange={setLimit} value={limit} />}
      contentClassName="overflow-hidden"
      size="2x2"
      title={localizedText(locale, "Ansökningar per annons", "Applications per listing")}
    >
      {authLoading || performanceQuery.isLoading ? (
        <LoadingList />
      ) : error ? (
        <div className="flex h-full items-center rounded-md border border-error-500/20 bg-error-50 px-4 text-theme-sm text-error-700">
          {error}
        </div>
      ) : (
        <ApplicationsByObjectList items={items} locale={locale} />
      )}
    </AnalyticsBlock>
  );
}
