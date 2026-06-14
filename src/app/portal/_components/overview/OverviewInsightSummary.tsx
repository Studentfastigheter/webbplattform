"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle,
  FileUser,
  Heart,
  Percent,
  TrendingUp,
} from "@/components/icons";
import { Skeleton } from "@/components/ui/skeleton";
import { useCompanyAnalyticsDashboard } from "@/features/companies/hooks/useCompanies";
import type {
  AnalyticsCountBucket,
  CompanyPortalAnalyticsDashboard,
  ListingAnalyticsPerformance,
} from "@/features/companies/services/company-service";
import { useAuth } from "@/context/AuthContext";
import type { Locale } from "@/i18n/config";
import { useI18n } from "@/i18n/I18nProvider";
import { localizedText, numberLocale } from "@/i18n/text";
import { getActiveCompanyId } from "@/lib/company-access";
import { cn } from "@/lib/utils";
import { dashboardRelPath } from "../../_statics/variables";
import {
  PortalGridItem,
  type PortalGridItemSize,
  usePortalGridItem,
} from "../shared/PortalGrid";

type InsightMetric = {
  label: string;
  value: string;
  detail: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: "brand" | "sky" | "emerald" | "amber";
};

type OverviewInsightSummaryProps = {
  className?: string;
  size?: PortalGridItemSize;
};

const openApplicationStatusKeys = ["SUBMITTED", "UNDER_REVIEW", "OFFERED"];

const toneClassNames: Record<InsightMetric["tone"], string> = {
  brand: "bg-brand-50 text-brand-600",
  sky: "bg-sky-50 text-sky-600",
  emerald: "bg-emerald-50 text-emerald-600",
  amber: "bg-amber-50 text-amber-700",
};

function getDefaultRange() {
  const to = new Date();
  const from = new Date(to);
  from.setFullYear(from.getFullYear() - 1);

  return {
    from: from.toISOString(),
    to: to.toISOString(),
  };
}

function formatNumber(value: number, locale: Locale) {
  return value.toLocaleString(numberLocale(locale));
}

function formatDecimal(value: number, locale: Locale) {
  return value.toLocaleString(numberLocale(locale), {
    maximumFractionDigits: 1,
  });
}

function formatRate(value: number, locale: Locale) {
  return `${(Number.isFinite(value) ? value * 100 : 0).toLocaleString(
    numberLocale(locale),
    {
      maximumFractionDigits: 1,
    }
  )}%`;
}

function sumBuckets(buckets: AnalyticsCountBucket[]) {
  return buckets.reduce((sum, bucket) => sum + bucket.count, 0);
}

function getBucketCount(buckets: AnalyticsCountBucket[], keys: string[]) {
  const normalizedKeys = new Set(keys.map((key) => key.toUpperCase()));

  return buckets.reduce((sum, bucket) => {
    const key = bucket.key.trim().toUpperCase();
    return normalizedKeys.has(key) ? sum + bucket.count : sum;
  }, 0);
}

function getListingTitle(listing: ListingAnalyticsPerformance, locale: Locale) {
  return (
    listing.title ||
    listing.address ||
    localizedText(locale, "Bostad utan titel", "Untitled listing")
  );
}

function getListingMeta(listing: ListingAnalyticsPerformance, locale: Locale) {
  const facts = [
    listing.city,
    listing.rooms
      ? localizedText(locale, `${listing.rooms} rok`, `${listing.rooms} rooms`)
      : null,
    listing.sizeM2
      ? localizedText(locale, `${listing.sizeM2} m2`, `${listing.sizeM2} sqm`)
      : null,
    listing.rent
      ? localizedText(
          locale,
          `${listing.rent.toLocaleString(numberLocale(locale))} kr/m\u00e5n`,
          `SEK ${listing.rent.toLocaleString(numberLocale(locale))}/mo`
        )
      : null,
  ];

  return facts.filter(Boolean).join(" · ");
}

function buildMetrics(
  data: CompanyPortalAnalyticsDashboard,
  locale: Locale
): InsightMetric[] {
  const openApplications = getBucketCount(
    data.applicationStatuses,
    openApplicationStatusKeys
  );
  const activeListings = getBucketCount(data.listingStatuses, ["AVAILABLE"]);
  const openPerActiveListing =
    activeListings > 0 ? openApplications / activeListings : openApplications;

  return [
    {
      label: localizedText(
        locale,
        "Ans\u00f6kningskonvertering",
        "Application conversion"
      ),
      value: formatRate(data.funnel.applicationConversionRate, locale),
      detail: localizedText(
        locale,
        `${formatNumber(data.funnel.listingApplications, locale)} ans\u00f6kningar fr\u00e5n ${formatNumber(data.funnel.listingDetailedViews, locale)} detaljvisningar`,
        `${formatNumber(data.funnel.listingApplications, locale)} applications from ${formatNumber(data.funnel.listingDetailedViews, locale)} detailed views`
      ),
      icon: Percent,
      tone: "brand",
    },
    {
      label: localizedText(locale, "\u00d6ppna \u00e4renden", "Open cases"),
      value: formatNumber(openApplications, locale),
      detail: localizedText(
        locale,
        `${formatDecimal(openPerActiveListing, locale)} per aktiv annons`,
        `${formatDecimal(openPerActiveListing, locale)} per active listing`
      ),
      icon: FileUser,
      tone: "sky",
    },
    {
      label: localizedText(locale, "Acceptansgrad", "Acceptance rate"),
      value: formatRate(data.funnel.acceptanceRate, locale),
      detail: localizedText(
        locale,
        `${formatNumber(data.funnel.acceptedApplications, locale)} antagna av ${formatNumber(data.funnel.resolvedApplications, locale)} avgjorda`,
        `${formatNumber(data.funnel.acceptedApplications, locale)} accepted of ${formatNumber(data.funnel.resolvedApplications, locale)} resolved`
      ),
      icon: CheckCircle,
      tone: "emerald",
    },
    {
      label: localizedText(locale, "Favoritsignal", "Favorite signal"),
      value: formatRate(data.funnel.likeRate, locale),
      detail: localizedText(
        locale,
        `${formatNumber(data.funnel.listingLikes, locale)} favoritmarkeringar`,
        `${formatNumber(data.funnel.listingLikes, locale)} favorites`
      ),
      icon: Heart,
      tone: "amber",
    },
  ];
}

function MetricTile({ metric }: { metric: InsightMetric }) {
  const Icon = metric.icon;

  return (
    <div className="portal-inner-surface min-w-0 px-3 py-3">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-gray-500">
            {metric.label}
          </p>
          <p className="mt-1 truncate text-2xl font-semibold leading-8 text-gray-900 tabular-nums">
            {metric.value}
          </p>
        </div>
        <span
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
            toneClassNames[metric.tone]
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-2 line-clamp-2 text-xs leading-5 text-gray-500">
        {metric.detail}
      </p>
    </div>
  );
}

function ListingRow({
  listing,
  locale,
  maxApplications,
}: {
  listing: ListingAnalyticsPerformance;
  locale: Locale;
  maxApplications: number;
}) {
  const width =
    maxApplications > 0
      ? Math.max((listing.periodApplications / maxApplications) * 100, 4)
      : 0;
  const href = `${dashboardRelPath}/listings/${encodeURIComponent(
    String(listing.listingId)
  )}`;
  const meta = getListingMeta(listing, locale);

  return (
    <Link
      className="portal-inner-surface block px-3 py-3 transition hover:border-brand-200 hover:bg-brand-50/30"
      href={href}
    >
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-gray-900">
            {getListingTitle(listing, locale)}
          </p>
          {meta ? (
            <p className="mt-1 truncate text-xs text-gray-500">{meta}</p>
          ) : null}
        </div>
        <span className="shrink-0 text-sm font-semibold text-gray-900 tabular-nums">
          {formatNumber(listing.periodApplications, locale)}
        </span>
      </div>
      <div className="mt-2 flex min-w-0 items-center gap-2">
        <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-brand-500"
            style={{ width: `${width}%` }}
          />
        </div>
        <span className="shrink-0 text-xs font-semibold text-gray-500 tabular-nums">
          {formatRate(listing.periodApplicationConversionRate, locale)}
        </span>
      </div>
    </Link>
  );
}

function LoadingState() {
  const block = usePortalGridItem();
  const isWideBlock = (block?.columns ?? 2) >= 3;

  return (
    <div
      className={cn(
        "grid h-full min-h-0 gap-4",
        isWideBlock ? "lg:grid-cols-[1.1fr_0.9fr]" : "grid-cols-1"
      )}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div className="portal-inner-surface px-3 py-3" key={index}>
            <div className="flex justify-between gap-3">
              <div className="space-y-2">
                <Skeleton className="h-3.5 w-28" />
                <Skeleton className="h-8 w-20" />
              </div>
              <Skeleton className="h-9 w-9 rounded-lg" />
            </div>
            <Skeleton className="mt-3 h-4 w-full" />
          </div>
        ))}
      </div>
      <div className="space-y-3">
        <Skeleton className="h-4 w-36" />
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton className="h-[74px] rounded-lg" key={index} />
        ))}
      </div>
    </div>
  );
}

function InsightContent({
  data,
  locale,
}: {
  data: CompanyPortalAnalyticsDashboard;
  locale: Locale;
}) {
  const block = usePortalGridItem();
  const isWideBlock = (block?.columns ?? 2) >= 3;
  const metrics = buildMetrics(data, locale);
  const topListings = data.topListings.slice(0, 4);
  const maxApplications = Math.max(
    ...topListings.map((listing) => listing.periodApplications),
    1
  );
  const activeListings = getBucketCount(data.listingStatuses, ["AVAILABLE"]);
  const totalListings = sumBuckets(data.listingStatuses);

  return (
    <div
      className={cn(
        "grid h-full min-h-0 gap-4",
        isWideBlock ? "lg:grid-cols-[1.1fr_0.9fr]" : "grid-cols-1"
      )}
    >
      <div className="grid min-h-0 gap-3 min-[520px]:grid-cols-2">
        {metrics.map((metric) => (
          <MetricTile key={metric.label} metric={metric} />
        ))}
      </div>

      <div className="flex min-h-0 min-w-0 flex-col gap-3">
        <div className="flex min-w-0 items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-brand-600">
              <TrendingUp className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold text-gray-900">
                {localizedText(locale, "Starkast respons", "Strongest response")}
              </h3>
              <p className="truncate text-xs text-gray-500">
                {localizedText(
                  locale,
                  `${formatNumber(activeListings, locale)} aktiva av ${formatNumber(totalListings, locale)} annonser`,
                  `${formatNumber(activeListings, locale)} active of ${formatNumber(totalListings, locale)} listings`
                )}
              </p>
            </div>
          </div>
          <Link
            className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-brand-600 transition hover:text-brand-700"
            href={`${dashboardRelPath}/analytics`}
          >
            {localizedText(locale, "Analys", "Analytics")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {topListings.length > 0 ? (
          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
            {topListings.map((listing) => (
              <ListingRow
                key={listing.listingId}
                listing={listing}
                locale={locale}
                maxApplications={maxApplications}
              />
            ))}
          </div>
        ) : (
          <div className="flex min-h-[160px] flex-1 items-center justify-center rounded-lg border border-dashed border-gray-200 px-4 text-center text-sm text-gray-500">
            {localizedText(
              locale,
              "Ingen annonsdata att visa \u00e4nnu.",
              "No listing data to show yet."
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function OverviewInsightSummary({
  className,
  size = "2x4",
}: OverviewInsightSummaryProps = {}) {
  const { locale } = useI18n();
  const { user, isLoading: authLoading } = useAuth();
  const companyId = getActiveCompanyId(user);
  const range = React.useMemo(() => getDefaultRange(), []);
  const dashboardQuery = useCompanyAnalyticsDashboard(companyId, {
    enabled: !authLoading,
    from: range.from,
    granularity: "month",
    limit: 4,
    to: range.to,
  });
  const error =
    !authLoading && !companyId
      ? localizedText(
          locale,
          "Kunde inte hitta ett aktivt f\u00f6retag f\u00f6r statistiken.",
          "Could not find an active company for the statistics."
        )
      : dashboardQuery.isError
        ? dashboardQuery.error instanceof Error
          ? dashboardQuery.error.message
          : localizedText(
              locale,
              "Kunde inte h\u00e4mta \u00f6versikten.",
              "Could not load the overview."
            )
        : null;

  return (
    <PortalGridItem
      className={className}
      contentClassName="overflow-hidden"
      description={localizedText(locale, "Senaste 12 m\u00e5naderna", "Last 12 months")}
      size={size}
      title={localizedText(locale, "Aff\u00e4rsl\u00e4ge", "Business position")}
    >
      {authLoading || dashboardQuery.isLoading ? (
        <LoadingState />
      ) : error ? (
        <div className="flex h-full items-center rounded-md border border-error-500/20 bg-error-50 px-4 text-theme-sm text-error-700">
          {error}
        </div>
      ) : dashboardQuery.data ? (
        <InsightContent data={dashboardQuery.data} locale={locale} />
      ) : (
        <div className="flex h-full items-center justify-center rounded-md border border-dashed border-gray-200 px-4 text-center text-theme-sm text-gray-500">
          {localizedText(
            locale,
            "Det finns ingen \u00f6versiktsdata att visa \u00e4nnu.",
            "There is no overview data to show yet."
          )}
        </div>
      )}
    </PortalGridItem>
  );
}
