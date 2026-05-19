"use client";

import * as React from "react";
import { FileUser } from "lucide-react";
import { AnalyticsBlock } from "@/components/analytics/AnalyticsBlocks";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useAuth } from "@/context/AuthContext";
import { getActiveCompanyId } from "@/lib/company-access";
import { companyService, type ApplicationStatisticEntry } from "@/services/company";

export type ApplicationIntervalValue = "1d" | "1w" | "1m" | "3m" | "6m" | "1y";

export type ApplicationInterval = {
  value: ApplicationIntervalValue;
  label: string;
  detailLabel: string;
  subtract: (date: Date) => Date;
};

export const applicationIntervals: ApplicationInterval[] = [
  {
    value: "1d",
    label: "1 dag",
    detailLabel: "senaste dygnet",
    subtract: (date) => new Date(date.getTime() - 24 * 60 * 60 * 1000),
  },
  {
    value: "1w",
    label: "1 vecka",
    detailLabel: "senaste veckan",
    subtract: (date) => {
      const next = new Date(date);
      next.setDate(next.getDate() - 7);
      return next;
    },
  },
  {
    value: "1m",
    label: "1 månad",
    detailLabel: "senaste månaden",
    subtract: (date) => {
      const next = new Date(date);
      next.setMonth(next.getMonth() - 1);
      return next;
    },
  },
  {
    value: "3m",
    label: "3 månader",
    detailLabel: "senaste 3 månaderna",
    subtract: (date) => {
      const next = new Date(date);
      next.setMonth(next.getMonth() - 3);
      return next;
    },
  },
  {
    value: "6m",
    label: "6 månader",
    detailLabel: "senaste 6 månaderna",
    subtract: (date) => {
      const next = new Date(date);
      next.setMonth(next.getMonth() - 6);
      return next;
    },
  },
  {
    value: "1y",
    label: "1 år",
    detailLabel: "senaste året",
    subtract: (date) => {
      const next = new Date(date);
      next.setFullYear(next.getFullYear() - 1);
      return next;
    },
  },
];

export function getApplicationInterval(value: ApplicationIntervalValue) {
  return (
    applicationIntervals.find((interval) => interval.value === value) ??
    applicationIntervals[2]
  );
}

export function getApplicationIntervalRange(value: ApplicationIntervalValue) {
  const to = new Date();
  const from = getApplicationInterval(value).subtract(to);
  return { from, to };
}

export function sumApplicationStatistics(entries: ApplicationStatisticEntry[]) {
  return entries.reduce((sum, entry) => {
    return Number.isFinite(entry.numApplications)
      ? sum + entry.numApplications
      : sum;
  }, 0);
}

export function ApplicationIntervalToggle({
  value,
  onChange,
}: {
  value: ApplicationIntervalValue;
  onChange: (value: ApplicationIntervalValue) => void;
}) {
  return (
    <ToggleGroup
      className="w-full max-w-full justify-start overflow-x-auto rounded-md bg-gray-50 p-0.5 sm:w-auto"
      onValueChange={(nextValue) => {
        if (applicationIntervals.some((interval) => interval.value === nextValue)) {
          onChange(nextValue as ApplicationIntervalValue);
        }
      }}
      type="single"
      value={value}
      variant="outline"
    >
      {applicationIntervals.map((interval) => (
        <ToggleGroupItem
          aria-label={interval.label}
          className="h-7 shrink-0 border-0 px-2 text-[11px] font-medium text-gray-500 hover:bg-white hover:text-gray-900 data-[state=on]:bg-white data-[state=on]:text-gray-900 data-[state=on]:shadow-theme-xs"
          key={interval.value}
          value={interval.value}
        >
          {interval.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}

export default function ApplicationIntervalStats() {
  const { user, isLoading: authLoading } = useAuth();
  const companyId = getActiveCompanyId(user);
  const [interval, setInterval] =
    React.useState<ApplicationIntervalValue>("1m");
  const [count, setCount] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!companyId) {
      setCount(0);
      setError("Kunde inte hitta ett aktivt företag för statistiken.");
      setIsLoading(false);
      return;
    }

    const { from, to } = getApplicationIntervalRange(interval);
    let cancelled = false;

    setIsLoading(true);
    setError(null);

    companyService
      .timedApplications(companyId, from, to)
      .then((entries) => {
        if (!cancelled) {
          setCount(sumApplicationStatistics(entries));
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setCount(0);
          setError(
            err instanceof Error
              ? err.message
              : "Kunde inte hämta ansökningar för perioden."
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
  }, [authLoading, companyId, interval]);

  const selectedInterval = getApplicationInterval(interval);

  return (
    <AnalyticsBlock
      action={<ApplicationIntervalToggle onChange={setInterval} value={interval} />}
      size="2x1"
      title="Ansökningar totalt"
    >
      {authLoading || isLoading ? (
        <div className="flex h-full min-h-[96px] items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-4 w-44" />
          </div>
        </div>
      ) : error ? (
        <div className="flex h-full min-h-[96px] items-center rounded-md border border-error-500/20 bg-error-50 px-4 text-theme-sm text-error-700">
          {error}
        </div>
      ) : (
        <div className="flex h-full min-h-[96px] items-center justify-between gap-4 rounded-xl border border-brand-100 bg-brand-25/70 px-4 py-4">
          <div className="min-w-0">
            <p className="text-[13px] font-medium leading-5 text-gray-500">
              {selectedInterval.detailLabel}
            </p>
            <p className="mt-1 text-[34px] font-semibold leading-9 tracking-normal text-gray-950 tabular-nums">
              {count.toLocaleString("sv-SE")}
            </p>
          </div>
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-brand-100 bg-white text-brand-500 shadow-[0_8px_20px_rgba(0,66,37,0.08)]">
            <FileUser className="h-6 w-6" />
          </div>
        </div>
      )}
    </AnalyticsBlock>
  );
}
