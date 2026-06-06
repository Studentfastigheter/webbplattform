"use client";

import * as React from "react";
import { FileUser } from "lucide-react";
import { AnalyticsBlock } from "@/features/analytics/components/AnalyticsBlocks";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/i18n/I18nProvider";
import type { Locale } from "@/i18n/config";
import { localizedText, numberLocale } from "@/i18n/text";
import { getActiveCompanyId } from "@/lib/company-access";
import { companyService, type ApplicationStatisticEntry } from "@/features/companies/services/company-service";

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

const applicationIntervalCopy: Record<
  ApplicationIntervalValue,
  { labelEn: string; detailLabelEn: string }
> = {
  "1d": { labelEn: "1 day", detailLabelEn: "the last 24 hours" },
  "1w": { labelEn: "1 week", detailLabelEn: "the last week" },
  "1m": { labelEn: "1 month", detailLabelEn: "the last month" },
  "3m": { labelEn: "3 months", detailLabelEn: "the last 3 months" },
  "6m": { labelEn: "6 months", detailLabelEn: "the last 6 months" },
  "1y": { labelEn: "1 year", detailLabelEn: "the last year" },
};

export function getApplicationInterval(value: ApplicationIntervalValue) {
  return (
    applicationIntervals.find((interval) => interval.value === value) ??
    applicationIntervals[2]
  );
}

export function getLocalizedApplicationInterval(
  locale: Locale,
  value: ApplicationIntervalValue
) {
  const interval = getApplicationInterval(value);
  const copy = applicationIntervalCopy[interval.value];

  return {
    ...interval,
    label: localizedText(locale, interval.label, copy.labelEn),
    detailLabel: localizedText(locale, interval.detailLabel, copy.detailLabelEn),
  };
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
  const { locale } = useI18n();

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
      {applicationIntervals.map((interval) => {
        const localizedInterval = getLocalizedApplicationInterval(locale, interval.value);

        return (
        <ToggleGroupItem
          aria-label={localizedInterval.label}
          className="h-7 shrink-0 border-0 px-2 text-[11px] font-medium text-gray-500 hover:bg-white hover:text-gray-900 data-[state=on]:bg-white data-[state=on]:text-gray-900 data-[state=on]:shadow-theme-xs"
          key={interval.value}
          value={interval.value}
        >
          {localizedInterval.label}
        </ToggleGroupItem>
        );
      })}
    </ToggleGroup>
  );
}

export default function ApplicationIntervalStats() {
  const { locale } = useI18n();
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
      setError(localizedText(locale, "Kunde inte hitta ett aktivt företag för statistiken.", "Could not find an active company for the statistics."));
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
              : localizedText(locale, "Kunde inte hämta ansökningar för perioden.", "Could not load applications for the period.")
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
  }, [authLoading, companyId, interval, locale]);

  const selectedInterval = getLocalizedApplicationInterval(locale, interval);

  return (
    <AnalyticsBlock
      action={<ApplicationIntervalToggle onChange={setInterval} value={interval} />}
      size="2x2"
      title={localizedText(locale, "Ansökningar totalt", "Total applications")}
    >
      {authLoading || isLoading ? (
        <div className="flex h-full items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-20" />
            <Skeleton className="h-3.5 w-36" />
          </div>
        </div>
      ) : error ? (
        <div className="flex h-full items-center rounded-xl border border-error-500/20 bg-error-50 px-4 text-theme-sm text-error-700">
          {error}
        </div>
      ) : (
        <div className="flex h-full items-center justify-between gap-4 rounded-xl border border-brand-100 bg-brand-25/70 px-4 py-3">
          <div className="min-w-0">
            <p className="text-[12px] font-medium leading-4 text-gray-500 sm:text-[13px] sm:leading-5">
              {selectedInterval.detailLabel}
            </p>
            <p className="mt-0.5 text-[28px] font-semibold leading-8 tracking-normal text-gray-950 tabular-nums sm:mt-1 sm:text-[34px] sm:leading-9">
              {count.toLocaleString(numberLocale(locale))}
            </p>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-brand-100 bg-white text-brand-500 shadow-[0_8px_20px_rgba(0,66,37,0.08)] sm:h-12 sm:w-12">
            <FileUser className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
        </div>
      )}
    </AnalyticsBlock>
  );
}
