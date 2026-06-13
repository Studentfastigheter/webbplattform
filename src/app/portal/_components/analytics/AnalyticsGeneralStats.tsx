"use client";

import * as React from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Eye,
  FileUser,
  Heart,
  Home,
  Minus,
  MousePointerClick,
  Percent,
} from "@/components/icons";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/i18n/I18nProvider";
import type { Locale } from "@/i18n/config";
import { localizedText, numberLocale } from "@/i18n/text";
import { getActiveCompanyId } from "@/lib/company-access";
import { cn } from "@/lib/utils";
import { useCompanyGeneralAnalytics } from "@/features/companies/hooks/useCompanies";
import {
  type AnalyticalQuantity,
  type AnalyticalQuantities,
} from "@/features/companies/services/company-service";

type MetricTone = "brand" | "blue" | "rose" | "amber";
type AnalyticsGeneralStatsVariant = "overview" | "analytics";

type MetricConfig = {
  key: keyof AnalyticalQuantities;
  fallbackKeys?: Array<keyof AnalyticalQuantities>;
  label: string;
  labelEn: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: MetricTone;
};

type MetricItem = {
  label: string;
  value: number;
  valueLabel?: string;
  change: number | null;
  icon: React.ComponentType<{ className?: string }>;
  tone: MetricTone;
};

const metrics: MetricConfig[] = [
  {
    key: "applications",
    label: "Ansökningar",
    labelEn: "Applications",
    icon: FileUser,
    tone: "brand",
  },
  {
    key: "views",
    fallbackKeys: ["viewings", "quickViews", "detailedViews"],
    label: "Visningar",
    labelEn: "Views",
    icon: BarChart3,
    tone: "blue",
  },
  {
    key: "interactions",
    fallbackKeys: ["likes"],
    label: "Favoritiseringar",
    labelEn: "Favorites",
    icon: Heart,
    tone: "rose",
  },
  {
    key: "activeListings",
    fallbackKeys: ["active_listings", "activePosts", "active_posts"],
    label: "Aktiva annonser",
    labelEn: "Active listings",
    icon: Home,
    tone: "amber",
  },
];

const metricToneClass: Record<
  MetricTone,
  {
    tile: string;
    icon: string;
    accent: string;
  }
> = {
  brand: {
    tile: "border-brand-100 bg-brand-25/70",
    icon: "border-brand-100 bg-white text-brand-500 shadow-[0_8px_20px_rgba(0,66,37,0.08)]",
    accent: "from-brand-500/20",
  },
  blue: {
    tile: "border-sky-100 bg-sky-50/70",
    icon: "border-sky-100 bg-white text-sky-600 shadow-[0_8px_20px_rgba(2,132,199,0.08)]",
    accent: "from-sky-500/20",
  },
  rose: {
    tile: "border-rose-100 bg-rose-50/70",
    icon: "border-rose-100 bg-white text-rose-600 shadow-[0_8px_20px_rgba(225,29,72,0.08)]",
    accent: "from-rose-500/20",
  },
  amber: {
    tile: "border-amber-100 bg-amber-50/70",
    icon: "border-amber-100 bg-white text-amber-600 shadow-[0_8px_20px_rgba(217,119,6,0.08)]",
    accent: "from-amber-500/20",
  },
};

const preferredPeriods = ["P1M", "P30D", "P7D", "P3M", "P1Y"];

function firstFiniteNumber(...values: unknown[]) {
  for (const value of values) {
    const numberValue =
      typeof value === "string" ? Number(value.replace(",", ".")) : Number(value);

    if (Number.isFinite(numberValue)) {
      return numberValue;
    }
  }

  return null;
}

function pickQuantity(
  analytics: AnalyticalQuantities,
  metric: MetricConfig
): AnalyticalQuantity | null {
  return pickQuantityFromKeys(analytics, [
    metric.key,
    ...(metric.fallbackKeys ?? []),
  ]);
}

function pickQuantityFromKeys(
  analytics: AnalyticalQuantities,
  keys: Array<keyof AnalyticalQuantities>
): AnalyticalQuantity | null {
  const entries = keys
    .flatMap((key) => analytics[key] ?? [])
    .filter(Boolean);

  if (entries.length === 0) {
    return null;
  }

  return (
    preferredPeriods
      .map((period) => entries.find((entry) => entry.period === period))
      .find(Boolean) ??
    entries[0] ??
    null
  );
}

function getMetricValue(quantity: AnalyticalQuantity | null) {
  if (!quantity) {
    return 0;
  }

  return (
    firstFiniteNumber(
      quantity.absoluteCount,
      quantity.count,
      quantity.amount,
      quantity.quantity,
      quantity.value
    ) ?? 0
  );
}

function getMetricChange(quantity: AnalyticalQuantity | null) {
  if (!quantity) {
    return null;
  }

  return firstFiniteNumber(
    quantity.percentChange,
    quantity.changePercentage,
    quantity.percentageChange,
    quantity.rateOfChangePercentage,
    quantity.relativeChange,
    quantity.changeRate,
    quantity.rateOfChange,
    quantity.change
  );
}

function buildBaseMetricItem(
  analytics: AnalyticalQuantities,
  metric: MetricConfig,
  locale: Locale
): MetricItem {
  const quantity = pickQuantity(analytics, metric);

  return {
    label: localizedText(locale, metric.label, metric.labelEn),
    value: getMetricValue(quantity),
    change: getMetricChange(quantity),
    icon: metric.icon,
    tone: metric.tone,
  };
}

function buildOverviewMetricItems(
  analytics: AnalyticalQuantities,
  locale: Locale
): MetricItem[] {
  return metrics.map((metric) => {
    const quantity = pickQuantity(analytics, metric);

    if (metric.key === "views") {
      const detailedQuantity = pickQuantityFromKeys(analytics, ["detailedViews"]);
      const fallbackQuantity = pickQuantityFromKeys(analytics, ["views", "viewings"]);
      const resolvedQuantity = detailedQuantity ?? fallbackQuantity ?? quantity;

      return {
        label: localizedText(locale, metric.label, metric.labelEn),
        value: getMetricValue(resolvedQuantity),
        change: getMetricChange(resolvedQuantity),
        icon: metric.icon,
        tone: metric.tone,
      };
    }

    return buildBaseMetricItem(analytics, metric, locale);
  });
}

function buildAnalyticsMetricItems(
  analytics: AnalyticalQuantities,
  locale: Locale
): MetricItem[] {
  const applicationMetric = metrics.find((metric) => metric.key === "applications");
  const interactionMetric = metrics.find((metric) => metric.key === "interactions");
  const activeListingsMetric = metrics.find((metric) => metric.key === "activeListings");
  const quickQuantity = pickQuantityFromKeys(analytics, ["quickViews"]);
  const detailedQuantity = pickQuantityFromKeys(analytics, ["detailedViews"]);
  const fallbackViewsQuantity = pickQuantityFromKeys(analytics, ["views", "viewings"]);
  const quickValue = getMetricValue(quickQuantity);
  const detailedValue = getMetricValue(detailedQuantity ?? fallbackViewsQuantity);
  const detailRatio = quickValue > 0 ? (detailedValue / quickValue) * 100 : 0;

  return [
    applicationMetric ? buildBaseMetricItem(analytics, applicationMetric, locale) : null,
    {
      label: localizedText(locale, "Detaljvisningar", "Detailed views"),
      value: detailedValue,
      change: getMetricChange(detailedQuantity ?? fallbackViewsQuantity),
      icon: Eye,
      tone: "blue",
    },
    {
      label: localizedText(locale, "Snabbvisningar", "Quick views"),
      value: quickValue,
      change: getMetricChange(quickQuantity),
      icon: MousePointerClick,
      tone: "brand",
    },
    {
      label: localizedText(locale, "Detaljratio", "Detail ratio"),
      value: detailRatio,
      valueLabel: `${detailRatio.toLocaleString(numberLocale(locale), {
        maximumFractionDigits: 1,
      })}%`,
      change: null,
      icon: Percent,
      tone: "amber",
    },
    interactionMetric ? buildBaseMetricItem(analytics, interactionMetric, locale) : null,
    activeListingsMetric ? buildBaseMetricItem(analytics, activeListingsMetric, locale) : null,
  ].filter((item): item is MetricItem => item !== null);
}

function buildMetricItems(
  analytics: AnalyticalQuantities,
  variant: AnalyticsGeneralStatsVariant,
  locale: Locale
): MetricItem[] {
  return variant === "analytics"
    ? buildAnalyticsMetricItems(analytics, locale)
    : buildOverviewMetricItems(analytics, locale);
}

function formatMetricValue(item: MetricItem, locale: Locale) {
  return item.valueLabel ?? item.value.toLocaleString(numberLocale(locale));
}

function formatChange(change: number | null, locale: Locale) {
  if (change === null) {
    return null;
  }

  const prefix = change > 0 ? "+" : "";

  return `${prefix}${change.toLocaleString(numberLocale(locale), {
    maximumFractionDigits: 1,
  })}%`;
}

function TrendBadge({ change, locale }: { change: number | null; locale: Locale }) {
  const formattedChange = formatChange(change, locale);

  if (!formattedChange) {
    return (
      <span className="inline-flex h-6 items-center gap-1 rounded-full border border-gray-200 bg-white px-2 text-[11px] font-semibold leading-none text-gray-500 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        <Minus className="h-3 w-3" />
        {localizedText(locale, "Oför.", "Unch.")}
      </span>
    );
  }

  const isPositive = (change ?? 0) >= 0;
  const TrendIcon = isPositive ? ArrowUpRight : ArrowDownRight;

  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1 rounded-full border px-2 text-[11px] font-semibold leading-none shadow-[0_1px_2px_rgba(16,24,40,0.04)]",
        isPositive
          ? "border-success-500/15 bg-success-50 text-success-700"
          : "border-error-500/15 bg-error-50 text-error-700"
      )}
    >
      <TrendIcon className="h-3 w-3" />
      {formattedChange}
    </span>
  );
}

export default function AnalyticsGeneralStats({
  variant = "overview",
}: {
  variant?: AnalyticsGeneralStatsVariant;
}) {
  const { locale } = useI18n();
  const { user, isLoading: authLoading } = useAuth();
  const companyId = getActiveCompanyId(user);
  const generalAnalyticsQuery = useCompanyGeneralAnalytics(companyId);
  const items = React.useMemo(
    () => buildMetricItems(generalAnalyticsQuery.data ?? {}, variant, locale),
    [generalAnalyticsQuery.data, locale, variant]
  );
  const error =
    !authLoading && !companyId
      ? localizedText(
          locale,
          "Kunde inte hitta ett aktivt företag för statistiken.",
          "Could not find an active company for the statistics."
        )
      : generalAnalyticsQuery.isError
        ? generalAnalyticsQuery.error instanceof Error
          ? generalAnalyticsQuery.error.message
          : localizedText(
              locale,
              "Kunde inte hämta generell statistik.",
              "Could not load general statistics."
            )
        : null;
  const skeletonCount = variant === "analytics" ? 6 : metrics.length;
  const gridClassName =
    variant === "analytics"
      ? "grid h-full min-w-0 grid-cols-2 gap-3 sm:grid-cols-3"
      : "grid h-full min-w-0 grid-cols-1 gap-3 min-[520px]:grid-cols-2 xl:grid-cols-4";

  if (authLoading || generalAnalyticsQuery.isLoading) {
    return (
      <div className={gridClassName}>
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <div
            className="relative min-h-[116px] min-w-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-50/70 p-4"
            key={index}
          >
            <div className="flex items-start justify-between gap-3">
              <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
              <Skeleton className="h-6 w-14 rounded-full" />
            </div>
            <div className="mt-4 space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-7 w-16" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center rounded-md border border-error-500/20 bg-error-50 px-4 text-theme-sm text-error-700">
        {error}
      </div>
    );
  }

  return (
    <div className={gridClassName}>
      {items.map((item) => {
        const Icon = item.icon;
        const tone = metricToneClass[item.tone];

        return (
          <div
            className={cn(
              "relative min-h-[100px] min-w-0 overflow-hidden rounded-xl border p-3 transition-colors sm:p-4",
              tone.tile
            )}
            key={item.label}
          >
            <div
              className={cn(
                "pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r to-transparent",
                tone.accent
              )}
            />

            <div className="flex min-w-0 items-start justify-between gap-2">
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border sm:h-10 sm:w-10",
                  tone.icon
                )}
              >
                <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>

              <TrendBadge change={item.change} locale={locale} />
            </div>

            <div className="mt-3 min-w-0">
              <p className="truncate text-[12px] font-medium leading-4 text-gray-500 sm:text-[13px] sm:leading-5">
                {item.label}
              </p>
              <p className="mt-0.5 truncate text-xl font-semibold leading-7 tracking-normal text-gray-950 tabular-nums sm:mt-1 sm:text-[28px] sm:leading-8">
                {formatMetricValue(item, locale)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
