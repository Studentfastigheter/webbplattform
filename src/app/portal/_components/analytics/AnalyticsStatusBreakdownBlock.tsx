"use client";

import * as React from "react";
import { CheckCircle, FileUser, Home } from "@/components/icons";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AnalyticsBlock,
  type AnalyticsBlockSize,
} from "@/features/analytics/components/AnalyticsBlocks";
import { useCompanyAnalyticsDashboard } from "@/features/companies/hooks/useCompanies";
import type { AnalyticsCountBucket } from "@/features/companies/services/company-service";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/i18n/I18nProvider";
import type { Locale } from "@/i18n/config";
import { localizedText, numberLocale } from "@/i18n/text";
import { getActiveCompanyId } from "@/lib/company-access";

type StatusSectionConfig = {
  title: string;
  buckets: AnalyticsCountBucket[];
  icon: React.ComponentType<{ className?: string }>;
};

type AnalyticsStatusBreakdownBlockProps = {
  size?: AnalyticsBlockSize;
};

const barColors = ["bg-brand-500", "bg-sky-500", "bg-emerald-500", "bg-amber-500", "bg-rose-500"];

const statusLabels: Record<string, { sv: string; en: string }> = {
  AVAILABLE: { sv: "Tillg\u00e4ngliga", en: "Available" },
  RENTED: { sv: "Uthyrda", en: "Rented" },
  HIDDEN: { sv: "Dolda", en: "Hidden" },
  SUBMITTED: { sv: "Inskickade", en: "Submitted" },
  UNDER_REVIEW: { sv: "Under granskning", en: "Under review" },
  OFFERED: { sv: "Erbjudna", en: "Offered" },
  ACCEPTED: { sv: "Accepterade", en: "Accepted" },
  REJECTED: { sv: "Avslagna", en: "Rejected" },
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

function fallbackLabel(key: string) {
  return key
    .replace(/[_-]+/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatBucketLabel(key: string, locale: Locale) {
  const normalizedKey = key.trim().toUpperCase();
  const label = statusLabels[normalizedKey];

  return label ? localizedText(locale, label.sv, label.en) : fallbackLabel(key);
}

function LoadingState() {
  return (
    <div className="grid h-full min-h-0 gap-4 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, sectionIndex) => (
        <div className="min-w-0 space-y-3" key={sectionIndex}>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-4 w-28" />
          </div>
          {Array.from({ length: 4 }).map((__, rowIndex) => (
            <div className="space-y-2" key={rowIndex}>
              <div className="flex justify-between gap-3">
                <Skeleton className="h-3.5 w-20" />
                <Skeleton className="h-3.5 w-10" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function StatusSection({
  section,
  locale,
}: {
  section: StatusSectionConfig;
  locale: Locale;
}) {
  const total = section.buckets.reduce((sum, bucket) => sum + bucket.count, 0);
  const Icon = section.icon;

  return (
    <div className="portal-inner-surface min-w-0 px-3 py-3">
      <div className="flex min-w-0 items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-brand-500">
            <Icon className="h-4 w-4" />
          </span>
          <h3 className="truncate text-theme-sm font-semibold text-gray-800">
            {section.title}
          </h3>
        </div>
        <span className="shrink-0 text-theme-sm font-semibold text-gray-900 tabular-nums">
          {formatNumber(total, locale)}
        </span>
      </div>

      {section.buckets.length === 0 || total === 0 ? (
        <p className="mt-4 text-theme-sm text-gray-500">
          {localizedText(locale, "Ingen data", "No data")}
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          {section.buckets.map((bucket, index) => {
            const share = total > 0 ? (bucket.count / total) * 100 : 0;
            const width = Math.max(share, bucket.count > 0 ? 4 : 0);

            return (
              <div className="min-w-0" key={bucket.key}>
                <div className="flex min-w-0 items-center justify-between gap-3">
                  <p className="truncate text-xs font-medium text-gray-600">
                    {formatBucketLabel(bucket.key, locale)}
                  </p>
                  <p className="shrink-0 text-xs font-semibold text-gray-900 tabular-nums">
                    {formatNumber(bucket.count, locale)}
                  </p>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className={`h-full rounded-full ${barColors[index % barColors.length]}`}
                    style={{ width: `${width}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function AnalyticsStatusBreakdownBlock({
  size = "2x2",
}: AnalyticsStatusBreakdownBlockProps) {
  const { locale } = useI18n();
  const { user, isLoading: authLoading } = useAuth();
  const companyId = getActiveCompanyId(user);
  const range = React.useMemo(() => getDefaultRange(), []);
  const dashboardQuery = useCompanyAnalyticsDashboard(companyId, {
    enabled: !authLoading,
    from: range.from,
    granularity: "month",
    limit: 5,
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
              "Kunde inte h\u00e4mta statusf\u00f6rdelning.",
              "Could not load status distribution."
            )
        : null;
  const sections: StatusSectionConfig[] = dashboardQuery.data
    ? [
        {
          title: localizedText(locale, "Annonser", "Listings"),
          buckets: dashboardQuery.data.listingStatuses,
          icon: Home,
        },
        {
          title: localizedText(locale, "Ans\u00f6kningsstatus", "Application status"),
          buckets: dashboardQuery.data.applicationStatuses,
          icon: FileUser,
        },
        {
          title: localizedText(locale, "Utfall", "Outcomes"),
          buckets: dashboardQuery.data.applicationOutcomes,
          icon: CheckCircle,
        },
      ]
    : [];

  return (
    <AnalyticsBlock
      contentClassName="overflow-hidden"
      description={localizedText(locale, "Senaste 12 m\u00e5naderna", "Last 12 months")}
      size={size}
      title={localizedText(locale, "Statusf\u00f6rdelning", "Status breakdown")}
    >
      {authLoading || dashboardQuery.isLoading ? (
        <LoadingState />
      ) : error ? (
        <div className="flex h-full items-center rounded-md border border-error-500/20 bg-error-50 px-4 text-theme-sm text-error-700">
          {error}
        </div>
      ) : sections.length > 0 ? (
        <div className="grid h-full min-h-0 gap-4 overflow-y-auto pr-1 lg:grid-cols-3">
          {sections.map((section) => (
            <StatusSection key={section.title} locale={locale} section={section} />
          ))}
        </div>
      ) : (
        <div className="flex h-full items-center justify-center rounded-md border border-dashed border-gray-200 px-4 text-center text-theme-sm text-gray-500">
          {localizedText(
            locale,
            "Det finns ingen statusdata att visa \u00e4nnu.",
            "There is no status data to show yet."
          )}
        </div>
      )}
    </AnalyticsBlock>
  );
}
