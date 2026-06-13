"use client";

import * as React from "react";
import { UsersRound } from "@/components/icons";
import { AnalyticsBlock, AnalyticsGrid } from "@/features/analytics/components/AnalyticsBlocks";
import {
  TrendBarChart,
  type TrendBarChartPoint,
} from "@/features/analytics/components/TrendBarChart";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/i18n/I18nProvider";
import type { Locale } from "@/i18n/config";
import { localizedText, numberLocale } from "@/i18n/text";
import { getActiveCompanyId } from "@/lib/company-access";
import { useQueuesByCompany } from "@/features/queues/hooks/useQueues";
import {
  useCompanyQueueApplicationCount,
  useCompanyQueueApplicationsTrend,
} from "@/features/companies/hooks/useCompanies";
import type {
  QueueApplicationTrendEntry,
  QueueApplicationTrendGranularity,
} from "@/features/companies/services/company-service";
import {
  CompanyDemographyBlock,
} from "../_components/analytics/DemographicsEndpointBlocks";
import PortalPageHeader from "../_components/shared/PortalPageHeader";

const trendGranularities: Array<{
  value: QueueApplicationTrendGranularity;
  labelSv: string;
  labelEn: string;
}> = [
  { value: "day", labelSv: "Dag", labelEn: "Day" },
  { value: "week", labelSv: "Vecka", labelEn: "Week" },
  { value: "month", labelSv: "Månad", labelEn: "Month" },
];

function getLastYearRange() {
  const to = new Date();
  const from = new Date(to);
  from.setFullYear(from.getFullYear() - 1);
  return { from, to };
}

function formatPeriodLabel(
  entry: QueueApplicationTrendEntry,
  granularity: QueueApplicationTrendGranularity,
  locale: Locale
) {
  const start = new Date(entry.periodStart);
  const end = new Date(entry.periodEnd);
  const formatter = new Intl.DateTimeFormat(numberLocale(locale), {
    day: granularity === "month" ? undefined : "numeric",
    month: "short",
    year: "2-digit",
  });

  if (Number.isNaN(start.getTime())) {
    return "";
  }

  if (granularity === "week" && !Number.isNaN(end.getTime())) {
    return `${formatter.format(start)}-${formatter.format(end)}`;
  }

  return formatter.format(start).replace(".", "");
}

function toTrendPoints(
  entries: QueueApplicationTrendEntry[],
  granularity: QueueApplicationTrendGranularity,
  locale: Locale
): TrendBarChartPoint[] {
  return entries.map((entry) => ({
    timestamp: entry.periodStart,
    value: entry.numApplications,
    label: formatPeriodLabel(entry, granularity, locale),
  }));
}

function QueueApplicationCountBlock({
  count,
  error,
  loading,
  locale,
  queueCount,
}: {
  count: number;
  error: string | null;
  loading: boolean;
  locale: Locale;
  queueCount: number;
}) {
  return (
    <AnalyticsBlock
      contentClassName="flex"
      size="1x2"
      title={localizedText(locale, "Studenter i bostadskö", "Students in housing queue")}
    >
      {loading ? (
        <div className="flex w-full items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
      ) : error ? (
        <div className="flex w-full items-center rounded-lg border border-error-500/20 bg-error-50 px-4 text-sm text-error-700">
          {error}
        </div>
      ) : (
        <div className="flex w-full items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="text-theme-sm font-medium text-gray-500">
              {localizedText(
                locale,
                queueCount === 1 ? "1 aktiv bostadskö" : `${queueCount} aktiva bostadsköer`,
                queueCount === 1 ? "1 active housing queue" : `${queueCount} active housing queues`
              )}
            </p>
            <p className="mt-2 text-3xl font-bold leading-10 tracking-normal text-gray-800 tabular-nums">
              {count.toLocaleString(numberLocale(locale))}
            </p>
          </div>
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-brand-100 bg-brand-50 text-brand-500">
            <UsersRound className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
        </div>
      )}
    </AnalyticsBlock>
  );
}

function QueueTrendGranularityToggle({
  locale,
  onChange,
  value,
}: {
  locale: Locale;
  onChange: (value: QueueApplicationTrendGranularity) => void;
  value: QueueApplicationTrendGranularity;
}) {
  return (
    <ToggleGroup
      className="w-full max-w-full justify-start overflow-x-auto rounded-lg bg-gray-100 p-0.5 sm:w-auto"
      onValueChange={(nextValue) => {
        if (trendGranularities.some((item) => item.value === nextValue)) {
          onChange(nextValue as QueueApplicationTrendGranularity);
        }
      }}
      type="single"
      value={value}
      variant="outline"
    >
      {trendGranularities.map((item) => (
        <ToggleGroupItem
          aria-label={localizedText(locale, item.labelSv, item.labelEn)}
          className="h-8 shrink-0 rounded-md border-0 px-3 text-theme-xs font-medium text-gray-500 hover:bg-white hover:text-gray-900 data-[state=on]:bg-white data-[state=on]:text-gray-900 data-[state=on]:shadow-theme-xs"
          key={item.value}
          value={item.value}
        >
          {localizedText(locale, item.labelSv, item.labelEn)}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}

export default function Bostadsko() {
  const { locale } = useI18n();
  const { user, isLoading: authLoading } = useAuth();
  const companyId = getActiveCompanyId(user);
  const [granularity, setGranularity] =
    React.useState<QueueApplicationTrendGranularity>("month");
  const trendRange = React.useMemo(getLastYearRange, []);

  // Company queues. Hook is enabled only when companyId is present, so the
  // auth-loading window doesn't fire requests we'll discard.
  const {
    data: queues = [],
    isLoading: queuesLoading,
    isError: isQueuesError,
    error: queuesErr,
  } = useQueuesByCompany(companyId);
  const queueApplicationCountQuery = useCompanyQueueApplicationCount(companyId);
  const queueApplicationsTrendQuery = useCompanyQueueApplicationsTrend(companyId, {
    enabled: !authLoading,
    from: trendRange.from,
    granularity,
    to: trendRange.to,
  });
  const trendPoints = React.useMemo(
    () => toTrendPoints(queueApplicationsTrendQuery.data ?? [], granularity, locale),
    [granularity, locale, queueApplicationsTrendQuery.data]
  );

  const error = isQueuesError && queuesErr
    ? queuesErr instanceof Error
      ? queuesErr.message
      : "Kunde inte hämta bostadsköer."
    : null;
  const countError = queueApplicationCountQuery.isError
    ? queueApplicationCountQuery.error instanceof Error
      ? queueApplicationCountQuery.error.message
      : localizedText(locale, "Kunde inte hämta antal i bostadskö.", "Could not load housing queue count.")
    : null;
  const trendError = queueApplicationsTrendQuery.isError
    ? queueApplicationsTrendQuery.error instanceof Error
      ? queueApplicationsTrendQuery.error.message
      : localizedText(locale, "Kunde inte hämta bostadskötrenden.", "Could not load housing queue trend.")
    : null;

  if (authLoading || queuesLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-[520px] rounded-xl" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="portal-surface border-dashed p-8 text-center text-sm text-gray-500">
        {localizedText(locale, "Logga in för att se företagets bostadsköer.", "Log in to view the company's housing queues.")}
      </div>
    );
  }

  if (!companyId) {
    return (
      <div className="portal-surface border-dashed p-8 text-center text-sm text-gray-500">
        {localizedText(locale, "Denna sida är bara tillgänglig för företagskonton.", "This page is only available for company accounts.")}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PortalPageHeader
        title={localizedText(locale, "Bostadsk\u00f6", "Housing queue")}
        description={localizedText(
          locale,
          "F\u00f6lj k\u00f6ans\u00f6kningar, studentvolym och bes\u00f6kardemografi.",
          "Track queue applications, student volume and visitor demographics."
        )}
      />

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {queues.length === 0 ? (
        <div className="portal-surface border-dashed p-10 text-center text-sm text-gray-500">
          {localizedText(locale, "Inga bostadsköer hittades för företaget.", "No housing queues were found for the company.")}
        </div>
      ) : (
        <main className="min-w-0 space-y-5">
            <AnalyticsGrid>
              <QueueApplicationCountBlock
                count={queueApplicationCountQuery.data ?? 0}
                error={countError}
                loading={queueApplicationCountQuery.isLoading}
                locale={locale}
                queueCount={queues.length}
              />

              <AnalyticsBlock
                action={
                  <QueueTrendGranularityToggle
                    locale={locale}
                    onChange={setGranularity}
                    value={granularity}
                  />
                }
                size="2x2"
                title={localizedText(locale, "Köansökningar över tid", "Queue applications over time")}
              >
                <TrendBarChart
                  data={trendPoints}
                  defaultInterval="all"
                  embedded
                  emptyMessage={localizedText(locale, "Det finns inga köansökningar registrerade för perioden ännu.", "There are no queue applications registered for this period yet.")}
                  error={trendError}
                  intervals={[{ value: "all", label: localizedText(locale, "Hela perioden", "Full period") }]}
                  loading={queueApplicationsTrendQuery.isLoading}
                  showHeader={false}
                  showSummary={false}
                  title={localizedText(locale, "Köansökningar över tid", "Queue applications over time")}
                  valueLabel={localizedText(locale, "Köansökningar", "Queue applications")}
                />
              </AnalyticsBlock>

              <CompanyDemographyBlock
                deferUntilSelection
                description={null}
                title={localizedText(locale, "Besökardemografi", "Visitor demographics")}
                useCompaniesQuery
              />
            </AnalyticsGrid>
        </main>
      )}
    </div>
  );
}
