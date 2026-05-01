"use client";

import * as React from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  FileUser,
  Heart,
  Home,
  Minus,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";
import { getActiveCompanyId } from "@/lib/company-access";
import { cn } from "@/lib/utils";
import {
  companyService,
  type AnalyticalQuantity,
  type AnalyticalQuantities,
} from "@/services/company";

type MetricTone = "brand" | "blue" | "rose" | "amber";

type MetricConfig = {
  key: keyof AnalyticalQuantities;
  fallbackKeys?: Array<keyof AnalyticalQuantities>;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: MetricTone;
};

type MetricItem = {
  label: string;
  value: number;
  change: number | null;
  icon: React.ComponentType<{ className?: string }>;
  tone: MetricTone;
};

const metrics: MetricConfig[] = [
  {
    key: "applications",
    label: "Ansökningar",
    icon: FileUser,
    tone: "brand",
  },
  {
    key: "views",
    fallbackKeys: ["viewings"],
    label: "Visningar",
    icon: BarChart3,
    tone: "blue",
  },
  {
    key: "interactions",
    fallbackKeys: ["likes"],
    label: "Interaktioner",
    icon: Heart,
    tone: "rose",
  },
  {
    key: "activeListings",
    fallbackKeys: ["active_listings", "activePosts", "active_posts"],
    label: "Aktiva annonser",
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
  const entries = [metric.key, ...(metric.fallbackKeys ?? [])]
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

function buildMetricItems(analytics: AnalyticalQuantities): MetricItem[] {
  return metrics.map((metric) => {
    const quantity = pickQuantity(analytics, metric);

    return {
      label: metric.label,
      value: getMetricValue(quantity),
      change: getMetricChange(quantity),
      icon: metric.icon,
      tone: metric.tone,
    };
  });
}

function formatChange(change: number | null) {
  if (change === null) {
    return null;
  }

  const prefix = change > 0 ? "+" : "";

  return `${prefix}${change.toLocaleString("sv-SE", {
    maximumFractionDigits: 1,
  })}%`;
}

function TrendBadge({ change }: { change: number | null }) {
  const formattedChange = formatChange(change);

  if (!formattedChange) {
    return (
      <span className="inline-flex h-6 items-center gap-1 rounded-full border border-gray-200 bg-white px-2 text-[11px] font-semibold leading-none text-gray-500 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        <Minus className="h-3 w-3" />
        Oför.
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

export default function AnalyticsGeneralStats() {
  const { user, isLoading: authLoading } = useAuth();
  const companyId = getActiveCompanyId(user);
  const [items, setItems] = React.useState<MetricItem[]>([]);
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
      .generalAnalytics(companyId)
      .then((analytics) => {
        if (!cancelled) {
          setItems(buildMetricItems(analytics));
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setItems([]);
          setError(
            err instanceof Error
              ? err.message
              : "Kunde inte hämta generell statistik."
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
  }, [authLoading, companyId]);

  if (authLoading || isLoading) {
    return (
      <div className="grid h-full grid-cols-2 gap-3 xl:grid-cols-4">
        {metrics.map((metric) => (
          <div
            className="relative min-h-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-50/70 p-4"
            key={metric.key}
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
    <div className="grid h-full grid-cols-2 gap-3 xl:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon;
        const tone = metricToneClass[item.tone];

        return (
          <div
            className={cn(
              "relative min-h-0 min-w-0 overflow-hidden rounded-xl border p-4 transition-colors",
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

            <div className="flex min-w-0 items-start justify-between gap-3">
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border",
                  tone.icon
                )}
              >
                <Icon className="h-5 w-5" />
              </div>

              <TrendBadge change={item.change} />
            </div>

            <div className="mt-4 min-w-0">
              <p className="truncate text-[13px] font-medium leading-5 text-gray-500">
                {item.label}
              </p>
              <p className="mt-1 truncate text-[28px] font-semibold leading-8 tracking-normal text-gray-950 tabular-nums">
                {item.value.toLocaleString("sv-SE")}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
