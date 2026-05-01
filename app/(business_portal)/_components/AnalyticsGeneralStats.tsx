"use client";

import * as React from "react";
import { BarChart3, FileUser, Heart, Home } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";
import { getActiveCompanyId } from "@/lib/company-access";
import { cn } from "@/lib/utils";
import {
  companyService,
  type AnalyticalQuantity,
  type AnalyticalQuantities,
} from "@/services/company";

type MetricConfig = {
  key: keyof AnalyticalQuantities;
  fallbackKeys?: Array<keyof AnalyticalQuantities>;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

type MetricItem = {
  label: string;
  value: number;
  change: number | null;
  icon: React.ComponentType<{ className?: string }>;
};

const metrics: MetricConfig[] = [
  {
    key: "applications",
    label: "Ansökningar",
    icon: FileUser,
  },
  {
    key: "views",
    fallbackKeys: ["viewings"],
    label: "Visningar",
    icon: BarChart3,
  },
  {
    key: "interactions",
    fallbackKeys: ["likes"],
    label: "Interaktioner",
    icon: Heart,
  },
  {
    key: "activeListings",
    fallbackKeys: ["active_listings", "activePosts", "active_posts"],
    label: "Aktiva annonser",
    icon: Home,
  },
];

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
      <div className="grid h-full grid-cols-2 gap-0 divide-x divide-gray-100 xl:grid-cols-4">
        {metrics.map((metric) => (
          <div
            className="flex min-h-0 items-center gap-3 px-4 first:pl-0 last:pr-0"
            key={metric.key}
          >
            <Skeleton className="h-9 w-9 shrink-0 rounded-lg" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-6 w-14" />
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
    <div className="grid h-full grid-cols-2 gap-0 divide-x divide-gray-100 xl:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon;
        const change = formatChange(item.change);

        return (
          <div
            className="flex min-h-0 min-w-0 items-center gap-3 px-4 py-1 first:pl-0 last:pr-0"
            key={item.label}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-brand-100 bg-white text-brand-500">
              <Icon className="h-5 w-5" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-medium text-gray-500">
                  {item.label}
                </p>
                {change ? (
                  <span
                    className={cn(
                      "shrink-0 text-[11px] font-semibold leading-4",
                      (item.change ?? 0) >= 0
                        ? "text-success-700"
                        : "text-error-700"
                    )}
                  >
                    {change}
                  </span>
                ) : null}
              </div>

              <p className="mt-1 truncate text-2xl font-semibold leading-7 tracking-normal text-gray-900 tabular-nums">
                {item.value.toLocaleString("sv-SE")}
              </p>

              {!change ? (
                <p className="mt-0.5 truncate text-[11px] leading-4 text-gray-400">
                  Ingen förändring
                </p>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
