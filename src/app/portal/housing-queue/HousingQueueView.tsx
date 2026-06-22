"use client";

import * as React from "react";
import { Save, UsersRound } from "@/components/icons";
import { toast } from "sonner";
import {
  TrendBarChart,
  type TrendBarChartPoint,
} from "@/features/analytics/components/TrendBarChart";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/i18n/I18nProvider";
import type { Locale } from "@/i18n/config";
import { localizedText, numberLocale } from "@/i18n/text";
import { getActiveCompanyId } from "@/lib/company-access";
import {
  useQueue,
  useQueuesByCompany,
  useUpsertQueueRequirement,
} from "@/features/queues/hooks/useQueues";
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
import {
  PortalGrid,
  PortalGridItem,
  PortalPage,
  PortalSurface,
} from "../_components/shared/PortalGrid";
import type { HousingQueueDTO } from "@/types/queue";

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

function getQueueRequirementText(queue: HousingQueueDTO | null | undefined) {
  const requirement = queue?.requirements;

  return typeof requirement?.requirements === "string"
    ? requirement.requirements
    : "";
}

function QueueApplicationCountBlock({
  count,
  error,
  loading,
  locale,
}: {
  count: number;
  error: string | null;
  loading: boolean;
  locale: Locale;
}) {
  return (
    <PortalGridItem
      contentClassName="flex"
      size="1x1"
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
            <p className="text-3xl font-bold leading-10 tracking-normal text-gray-800 tabular-nums">
              {count.toLocaleString(numberLocale(locale))}
            </p>
          </div>
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-brand-100 bg-brand-50 text-brand-500">
            <UsersRound className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
        </div>
      )}
    </PortalGridItem>
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

export default function HousingQueueView() {
  const { locale } = useI18n();
  const { user, isLoading: authLoading } = useAuth();
  const companyId = getActiveCompanyId(user);
  const [granularity, setGranularity] =
    React.useState<QueueApplicationTrendGranularity>("month");
  const [selectedQueueId, setSelectedQueueId] = React.useState<string | null>(null);
  const [requirementDraft, setRequirementDraft] = React.useState("");
  const trendRange = React.useMemo(getLastYearRange, []);

  // Company queues. Hook is enabled only when companyId is present, so the
  // auth-loading window doesn't fire requests we'll discard.
  const {
    data: queues = [],
    isLoading: queuesLoading,
    isError: isQueuesError,
    error: queuesErr,
  } = useQueuesByCompany(companyId);
  const selectedQueueFromList = React.useMemo(
    () => queues.find((queue) => queue.id === selectedQueueId) ?? queues[0] ?? null,
    [queues, selectedQueueId]
  );
  const resolvedSelectedQueueId = selectedQueueFromList?.id ?? null;
  const queueDetailQuery = useQueue(resolvedSelectedQueueId);
  const selectedQueueDetail = queueDetailQuery.data ?? selectedQueueFromList;
  const savedRequirement = getQueueRequirementText(selectedQueueDetail);
  const upsertRequirement = useUpsertQueueRequirement();
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
  const requirementLoadError = queueDetailQuery.isError
    ? queueDetailQuery.error instanceof Error
      ? queueDetailQuery.error.message
      : localizedText(locale, "Kunde inte hämta kraven.", "Could not load requirements.")
    : null;
  const isRequirementDirty = requirementDraft !== savedRequirement;
  const queueSelector = queues.length > 1 ? (
    <div className="flex max-w-full flex-wrap gap-2">
      {queues.map((queue) => {
        const isSelected = queue.id === resolvedSelectedQueueId;

        return (
          <button
            aria-pressed={isSelected}
            className={`min-h-9 min-w-0 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
              isSelected
                ? "border-[#004225] bg-[#004225] text-white"
                : "border-gray-200 bg-white text-gray-700 hover:border-[#004225]/40 hover:text-[#004225]"
            }`}
            key={queue.id}
            onClick={() => setSelectedQueueId(queue.id)}
            type="button"
          >
            <span className="block max-w-[220px] truncate">{queue.name}</span>
          </button>
        );
      })}
    </div>
  ) : null;

  React.useEffect(() => {
    if (queues.length === 0) {
      setSelectedQueueId(null);
      return;
    }

    if (!selectedQueueId || !queues.some((queue) => queue.id === selectedQueueId)) {
      setSelectedQueueId(queues[0].id);
    }
  }, [queues, selectedQueueId]);

  React.useEffect(() => {
    setRequirementDraft(savedRequirement);
  }, [resolvedSelectedQueueId, savedRequirement]);

  const handleSaveRequirement = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!resolvedSelectedQueueId) {
      return;
    }

    try {
      await upsertRequirement.mutateAsync({
        queueId: resolvedSelectedQueueId,
        request: { requirement: requirementDraft },
      });
      toast.success(localizedText(locale, "Kraven har sparats.", "Requirements saved."));
      await queueDetailQuery.refetch();
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : localizedText(locale, "Kunde inte spara kraven.", "Could not save requirements.")
      );
    }
  };

  if (authLoading || queuesLoading) {
    return (
      <PortalPage>
        <Skeleton className="h-[520px] rounded-xl" />
      </PortalPage>
    );
  }

  if (!user) {
    return (
      <PortalSurface dashed className="text-center text-sm text-gray-500" padding="lg">
        {localizedText(locale, "Logga in för att se företagets bostadsköer.", "Log in to view the company's housing queues.")}
      </PortalSurface>
    );
  }

  if (!companyId) {
    return (
      <PortalSurface dashed className="text-center text-sm text-gray-500" padding="lg">
        {localizedText(locale, "Denna sida är bara tillgänglig för företagskonton.", "This page is only available for company accounts.")}
      </PortalSurface>
    );
  }

  return (
    <PortalPage>
      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {queues.length === 0 ? (
        <PortalSurface dashed className="text-center text-sm text-gray-500" padding="lg">
          {localizedText(locale, "Inga bostadsköer hittades för företaget.", "No housing queues were found for the company.")}
        </PortalSurface>
      ) : (
        <main className="min-w-0 space-y-5">
          <PortalGrid>
            <QueueApplicationCountBlock
              count={queueApplicationCountQuery.data ?? 0}
              error={countError}
              loading={queueApplicationCountQuery.isLoading}
              locale={locale}
            />

            <PortalGridItem
              contentClassName="p-4 sm:p-5"
              size="1x3"
            >
              <form
                className="grid h-full min-w-0 gap-4 lg:grid-cols-[minmax(190px,0.55fr)_minmax(0,1.45fr)]"
                onSubmit={handleSaveRequirement}
              >
                <div className="flex h-full min-w-0 flex-col justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="text-base font-semibold leading-6 text-gray-900">
                      {localizedText(locale, "Krav för bostadskön", "Housing queue requirements")}
                    </h2>
                    <p className="mt-2 max-w-sm text-sm leading-6 text-gray-500">
                      {localizedText(
                        locale,
                        "Skriv den information studenter behöver för att förstå vilka villkor de måste uppfylla för att stå i er bostadskö.",
                        "Write the information students need to understand which conditions they must meet to join your housing queue."
                      )}
                    </p>
                  </div>

                  {queueSelector ? (
                    <div className="max-w-full overflow-x-auto pb-1">
                      {queueSelector}
                    </div>
                  ) : null}

                  <Button
                    className="w-full shrink-0 shadow-none sm:w-auto sm:self-start"
                    isDisabled={
                      !resolvedSelectedQueueId ||
                      !isRequirementDirty ||
                      queueDetailQuery.isLoading ||
                      upsertRequirement.isPending
                    }
                    isLoading={upsertRequirement.isPending}
                    size="sm"
                    type="submit"
                  >
                    <Save className="h-4 w-4" />
                    {localizedText(locale, "Spara", "Save")}
                  </Button>
                </div>

                <div className="h-full min-h-[172px] min-w-0">
                  {requirementLoadError ? (
                    <div className="flex h-full min-h-[172px] items-center rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {requirementLoadError}
                    </div>
                  ) : (
                    <div className="h-full min-w-0">
                      <Textarea
                        aria-label={localizedText(locale, "Krav för att stå i bostadskön", "Requirements for joining the queue")}
                        className="h-full min-h-[148px] resize-none rounded-lg border-gray-200 bg-white text-sm leading-6 shadow-none focus:border-[#004225] focus:ring-[#004225]/20"
                        disabled={
                          !resolvedSelectedQueueId ||
                          queueDetailQuery.isLoading ||
                          upsertRequirement.isPending
                        }
                        id="housing-queue-requirements"
                        onChange={(event) => setRequirementDraft(event.currentTarget.value)}
                        placeholder={localizedText(
                          locale,
                          "Ex. Du behöver vara aktiv student, kunna visa studieintyg och uppfylla våra ålders- eller inkomstkrav.",
                          "E.g. You must be an active student, be able to provide an enrollment certificate, and meet our age or income requirements."
                        )}
                        value={requirementDraft}
                      />
                    </div>
                  )}
                </div>
              </form>
            </PortalGridItem>

            <PortalGridItem
              action={
                <QueueTrendGranularityToggle
                  locale={locale}
                  onChange={setGranularity}
                  value={granularity}
                />
              }
              size="2x4"
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
            </PortalGridItem>

            <CompanyDemographyBlock
              deferUntilSelection
              description={null}
              size="4x4"
              title={localizedText(locale, "Besökardemografi", "Visitor demographics")}
              useCompaniesQuery
            />
          </PortalGrid>
        </main>
      )}
    </PortalPage>
  );
}
