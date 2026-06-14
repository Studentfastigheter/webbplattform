"use client";

import * as React from "react";
import {
  Eye,
  FileUser,
  Heart,
  MousePointerClick,
  Percent,
} from "@/components/icons";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AnalyticsBlock,
  type AnalyticsBlockSize,
} from "@/features/analytics/components/AnalyticsBlocks";
import { useCompanyAnalyticsFunnel } from "@/features/companies/hooks/useCompanies";
import type { CompanyAnalyticsFunnel } from "@/features/companies/services/company-service";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/i18n/I18nProvider";
import type { Locale } from "@/i18n/config";
import { localizedText, numberLocale } from "@/i18n/text";
import { getActiveCompanyId } from "@/lib/company-access";

type FunnelStep = {
  label: string;
  value: number;
  rate?: number;
  icon: React.ComponentType<{ className?: string }>;
};

type AnalyticsFunnelBlockProps = {
  className?: string;
  size?: AnalyticsBlockSize;
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

function formatPercent(value: number, locale: Locale) {
  return `${(value * 100).toLocaleString(numberLocale(locale), {
    maximumFractionDigits: 1,
  })}%`;
}

function buildSteps(data: CompanyAnalyticsFunnel, locale: Locale): FunnelStep[] {
  return [
    {
      label: localizedText(locale, "F\u00f6retagsprofil", "Company profile"),
      value: data.companyProfileViews,
      icon: Eye,
    },
    {
      label: localizedText(locale, "Annonsvisningar", "Listing views"),
      value: data.listingTotalViews,
      icon: MousePointerClick,
    },
    {
      label: localizedText(locale, "Detaljvisningar", "Detailed views"),
      value: data.listingDetailedViews,
      rate: data.detailedViewRate,
      icon: Percent,
    },
    {
      label: localizedText(locale, "Ans\u00f6kningar", "Applications"),
      value: data.listingApplications,
      rate: data.applicationConversionRate,
      icon: FileUser,
    },
    {
      label: localizedText(locale, "Accepterade utfall", "Accepted outcomes"),
      value: data.acceptedApplications,
      rate: data.acceptanceRate,
      icon: Heart,
    },
  ];
}

function LoadingState() {
  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          className="portal-inner-surface flex items-center gap-3 px-3 py-3"
          key={index}
        >
          <Skeleton className="h-9 w-9 rounded-lg" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-2 w-full" />
          </div>
          <Skeleton className="h-6 w-14" />
        </div>
      ))}
    </div>
  );
}

function FunnelContent({
  data,
  locale,
}: {
  data: CompanyAnalyticsFunnel;
  locale: Locale;
}) {
  const steps = buildSteps(data, locale);
  const maxValue = Math.max(...steps.map((step) => step.value), 1);

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="portal-inner-surface px-3 py-2">
          <p className="text-xs font-medium text-gray-500">
            {localizedText(locale, "Favoritering", "Favorite rate")}
          </p>
          <p className="mt-1 text-lg font-semibold leading-7 text-gray-900 tabular-nums">
            {formatPercent(data.likeRate, locale)}
          </p>
        </div>
        <div className="portal-inner-surface px-3 py-2">
          <p className="text-xs font-medium text-gray-500">
            {localizedText(locale, "K\u00f6ans\u00f6kningar", "Queue applications")}
          </p>
          <p className="mt-1 text-lg font-semibold leading-7 text-gray-900 tabular-nums">
            {formatNumber(data.queueApplications, locale)}
          </p>
        </div>
        <div className="portal-inner-surface px-3 py-2">
          <p className="text-xs font-medium text-gray-500">
            {localizedText(locale, "L\u00f6sta utfall", "Resolved outcomes")}
          </p>
          <p className="mt-1 text-lg font-semibold leading-7 text-gray-900 tabular-nums">
            {formatNumber(data.resolvedApplications, locale)}
          </p>
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
        {steps.map((step) => {
          const Icon = step.icon;
          const width = Math.max((step.value / maxValue) * 100, step.value > 0 ? 4 : 0);

          return (
            <div
              className="portal-inner-surface px-3 py-3"
              key={step.label}
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-brand-500">
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex min-w-0 items-center justify-between gap-3">
                    <p className="truncate text-theme-sm font-medium text-gray-700">
                      {step.label}
                    </p>
                    <p className="shrink-0 text-theme-sm font-semibold text-gray-900 tabular-nums">
                      {formatNumber(step.value, locale)}
                    </p>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-brand-500"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </div>
                {step.rate != null ? (
                  <span className="shrink-0 rounded-md bg-gray-50 px-2 py-1 text-xs font-semibold text-gray-600 tabular-nums">
                    {formatPercent(step.rate, locale)}
                  </span>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function AnalyticsFunnelBlock({
  className,
  size = "2x2",
}: AnalyticsFunnelBlockProps) {
  const { locale } = useI18n();
  const { user, isLoading: authLoading } = useAuth();
  const companyId = getActiveCompanyId(user);
  const range = React.useMemo(() => getDefaultRange(), []);
  const funnelQuery = useCompanyAnalyticsFunnel(companyId, {
    enabled: !authLoading,
    from: range.from,
    to: range.to,
  });
  const error =
    !authLoading && !companyId
      ? localizedText(
          locale,
          "Kunde inte hitta ett aktivt f\u00f6retag f\u00f6r statistiken.",
          "Could not find an active company for the statistics."
        )
      : funnelQuery.isError
        ? funnelQuery.error instanceof Error
          ? funnelQuery.error.message
          : localizedText(
              locale,
              "Kunde inte h\u00e4mta konverteringsdata.",
              "Could not load conversion data."
            )
        : null;

  return (
    <AnalyticsBlock
      className={className}
      contentClassName="overflow-hidden"
      description={localizedText(locale, "Senaste 12 m\u00e5naderna", "Last 12 months")}
      size={size}
      title={localizedText(locale, "Konvertering", "Conversion")}
    >
      {authLoading || funnelQuery.isLoading ? (
        <LoadingState />
      ) : error ? (
        <div className="flex h-full items-center rounded-md border border-error-500/20 bg-error-50 px-4 text-theme-sm text-error-700">
          {error}
        </div>
      ) : funnelQuery.data ? (
        <FunnelContent data={funnelQuery.data} locale={locale} />
      ) : (
        <div className="flex h-full items-center justify-center rounded-md border border-dashed border-gray-200 px-4 text-center text-theme-sm text-gray-500">
          {localizedText(
            locale,
            "Det finns ingen konverteringsdata att visa \u00e4nnu.",
            "There is no conversion data to show yet."
          )}
        </div>
      )}
    </AnalyticsBlock>
  );
}
