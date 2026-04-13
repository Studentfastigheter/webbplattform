"use client";

import { useEffect, useMemo, useState } from "react";
import { Building2, Eye, MousePointerClick, Users } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  companyService,
  type AnalyticalQuantities,
  type AnalyticalQuantity,
  type NewApplication,
  type ObjectApplicationCount,
  type Timeline,
} from "@/services/company";
import {
  ActivityListCard,
  DonutBreakdownCard,
  FunnelCard,
  MetricCard,
  MetricPeriodChangeChartCard,
  MetricPeriodVolumeChartCard,
  TopListingsTableCard,
  TrendAreaChartCard,
  type ActivityItem,
  type DonutBreakdownItem,
  type FunnelStep,
  type MetricPeriodChangeRow,
  type MetricPeriodChartRow,
  type TopListingRow,
  type TrendSeries,
} from "../dashboard-kit";

type TimelinePoint = {
  period: string;
  applications: number;
};

type OverviewPayload = {
  generalAnalytics: AnalyticalQuantities | null;
  totalApplications: number;
  topObjects: ObjectApplicationCount[];
  timeline: TimelinePoint[];
  newApplications: NewApplication[];
};

const donutPalette = ["#004225", "#3f9369", "#6bb18d", "#9fd0b6", "#cce8d8"];
const selectedAnalyticsPeriod = "P1M";
const defaultAnalyticsPeriods = ["P7D", "P1M", "P3M", "P1Y"];
const metricPalette = {
  applications: "#004225",
  viewings: "#2563eb",
  interactions: "#c2410c",
  activeListings: "#64748b",
};
const periodLabels: Record<string, string> = {
  P7D: "7 dagar",
  P1M: "1 månad",
  P3M: "3 manader",
  P1Y: "1 ar",
};

function monthLabel(timestamp: Date) {
  return new Intl.DateTimeFormat("sv-SE", { month: "short" }).format(timestamp);
}

function formatChange(value: number) {
  return `${Math.abs(value).toLocaleString("sv-SE", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}%`;
}

function periodLabel(period: string) {
  return periodLabels[period] ?? period;
}

function getQuantityCount(quantity: AnalyticalQuantity | undefined, fallback = 0) {
  if (!quantity) {
    return fallback;
  }

  return (
    quantity.count ??
    quantity.absoluteCount ??
    quantity.quantity ??
    quantity.value ??
    quantity.amount ??
    fallback
  );
}

function getQuantityChange(quantity: AnalyticalQuantity | undefined) {
  if (!quantity) {
    return 0;
  }

  return (
    quantity.percentageChange ??
    quantity.changePercentage ??
    quantity.percentChange ??
    quantity.rateOfChangePercentage ??
    quantity.rateOfChange ??
    quantity.relativeChange ??
    quantity.changeRate ??
    quantity.change ??
    0
  );
}

function findQuantityForPeriod(
  quantities: AnalyticalQuantity[] | undefined,
  period = selectedAnalyticsPeriod
) {
  if (!quantities || quantities.length === 0) {
    return undefined;
  }

  return quantities.find((quantity) => quantity.period === period) ?? quantities[0];
}

function metricFromQuantities(
  quantities: AnalyticalQuantity[] | undefined,
  fallbackCount = 0,
  period = selectedAnalyticsPeriod
) {
  const quantity = findQuantityForPeriod(quantities, period);

  return {
    count: getQuantityCount(quantity, fallbackCount),
    percentageChange: getQuantityChange(quantity),
  };
}

function getActiveListingQuantities(analytics: AnalyticalQuantities | null) {
  return (
    analytics?.activeListings ??
    analytics?.active_listings ??
    analytics?.activePosts ??
    analytics?.active_posts
  );
}

function getViewingQuantities(analytics: AnalyticalQuantities | null) {
  return analytics?.viewings ?? analytics?.views;
}

function getFulfilledValue<T>(result: PromiseSettledResult<T>, fallback: T) {
  return result.status === "fulfilled" ? result.value : fallback;
}

function getAvailablePeriods(analytics: AnalyticalQuantities | null) {
  if (!analytics) {
    return defaultAnalyticsPeriods;
  }

  const periods = new Set<string>();
  [
    analytics.applications,
    getViewingQuantities(analytics),
    analytics.interactions,
    getActiveListingQuantities(analytics),
  ].forEach((quantities) => {
    quantities?.forEach((quantity) => {
      if (quantity.period) {
        periods.add(quantity.period);
      }
    });
  });

  if (periods.size === 0) {
    return defaultAnalyticsPeriods;
  }

  return defaultAnalyticsPeriods
    .filter((period) => periods.has(period))
    .concat(Array.from(periods).filter((period) => !defaultAnalyticsPeriods.includes(period)));
}

function buildPeriodVolumeRows(
  analytics: AnalyticalQuantities | null,
  periods: string[],
  fallbackApplications = 0,
  fallbackPeriod = selectedAnalyticsPeriod
): MetricPeriodChartRow[] {
  return periods.map((period) => ({
    period: periodLabel(period),
    applications: metricFromQuantities(
      analytics?.applications,
      period === fallbackPeriod ? fallbackApplications : 0,
      period
    ).count,
    viewings: metricFromQuantities(getViewingQuantities(analytics), 0, period).count,
    interactions: metricFromQuantities(analytics?.interactions, 0, period).count,
    activeListings: metricFromQuantities(getActiveListingQuantities(analytics), 0, period).count,
  }));
}

function buildPeriodChangeRows(
  analytics: AnalyticalQuantities | null,
  periods: string[]
): MetricPeriodChangeRow[] {
  return periods.map((period) => ({
    period: periodLabel(period),
    applications: metricFromQuantities(analytics?.applications, 0, period).percentageChange,
    viewings: metricFromQuantities(getViewingQuantities(analytics), 0, period).percentageChange,
    interactions: metricFromQuantities(analytics?.interactions, 0, period).percentageChange,
    activeListings: metricFromQuantities(getActiveListingQuantities(analytics), 0, period)
      .percentageChange,
  }));
}

function fallbackTimeline(totalApplications: number): TimelinePoint[] {
  const baseline = Math.max(4, Math.round(totalApplications / 6));
  return ["Jan", "Feb", "Mar", "Apr", "Maj", "Jun"].map((period, index) => ({
    period,
    applications: baseline + index * Math.max(1, Math.round(baseline * 0.15)),
  }));
}

function buildTimelineRows(timeline: Timeline): TimelinePoint[] {
  const sorted = [...timeline].sort(
    (left, right) => left.timestamp.getTime() - right.timestamp.getTime()
  );
  const sliced = sorted.slice(-8);

  return sliced.map((entry) => ({
    period: monthLabel(entry.timestamp),
    applications: entry.value,
  }));
}

function groupApplicationsByAddress(
  applications: NewApplication[]
): ObjectApplicationCount[] {
  const grouped = new Map<string, number>();

  applications.forEach((application) => {
    const key = application.address?.trim() || "Okand adress";
    grouped.set(key, (grouped.get(key) ?? 0) + 1);
  });

  return Array.from(grouped.entries()).map(([address, count], index) => ({
    listingId: index + 1,
    address,
    numApplications: count,
  }));
}

function shortAddress(address: string) {
  if (address.length <= 32) {
    return address;
  }

  return `${address.slice(0, 29)}...`;
}

function buildAverageSeries(points: TimelinePoint[]) {
  return points.map((point, index, allPoints) => {
    const windowStart = Math.max(0, index - 2);
    const windowSlice = allPoints.slice(windowStart, index + 1);
    const average =
      windowSlice.reduce((sum, item) => sum + item.applications, 0) /
      windowSlice.length;

    return {
      period: point.period,
      applications: point.applications,
      avg: Math.round(average),
    };
  });
}

function SkeletonOverview() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-4 w-36 animate-pulse rounded bg-gray-200" />
        <div className="h-8 w-72 animate-pulse rounded bg-gray-200" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div className="h-36 animate-pulse rounded-2xl border border-gray-200 bg-white" key={index} />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="h-[430px] animate-pulse rounded-2xl border border-gray-200 bg-white xl:col-span-2" />
        <div className="h-[430px] animate-pulse rounded-2xl border border-gray-200 bg-white" />
      </div>
    </div>
  );
}

export default function PortalOverview() {
  const { user, isLoading: authLoading, refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState(selectedAnalyticsPeriod);
  const [payload, setPayload] = useState<OverviewPayload>({
    generalAnalytics: null,
    totalApplications: 0,
    topObjects: [],
    timeline: fallbackTimeline(0),
    newApplications: [],
  });

  useEffect(() => {
    let isCancelled = false;

    const load = async () => {
      if (!user) {
        try {
          await refreshUser();
        } catch {
          if (!isCancelled) {
            setErrorMessage("Kunde inte ladda anvandaren.");
          }
        } finally {
          if (!isCancelled) {
            setIsLoading(false);
          }
        }
        return;
      }

      setIsLoading(true);
      setErrorMessage(null);

      try {
        const [
          generalAnalyticsResult,
          totalApplicationsResult,
          timelineResult,
          topObjectsResult,
          newApplicationsResult,
        ] = await Promise.allSettled([
          companyService.generalAnalytics(user.id),
          companyService.applicationCount(user.id),
          companyService.applicationsTimeline(user.id),
          companyService.applicationCountsPerObject(user.id, 8),
          companyService.newApplications(user.id),
        ]);

        const generalAnalytics = getFulfilledValue<AnalyticalQuantities | null>(
          generalAnalyticsResult,
          null
        );
        const fallbackApplicationCount = getFulfilledValue(totalApplicationsResult, 0);
        const totalApplications = metricFromQuantities(
          generalAnalytics?.applications,
          fallbackApplicationCount
        ).count;
        const timelineResponse = getFulfilledValue<Timeline>(timelineResult, []);
        const topObjectsResponse = getFulfilledValue<ObjectApplicationCount[]>(topObjectsResult, []);
        const newApplications = getFulfilledValue<NewApplication[]>(newApplicationsResult, []);
        const timeline = buildTimelineRows(timelineResponse);
        const groupedFallbackObjects = groupApplicationsByAddress(newApplications);
        const topObjects =
          topObjectsResponse.length > 0
            ? topObjectsResponse
            : groupedFallbackObjects;

        if (!isCancelled) {
          const hasRejectedRequest = [
            generalAnalyticsResult,
            totalApplicationsResult,
            timelineResult,
            topObjectsResult,
            newApplicationsResult,
          ].some((result) => result.status === "rejected");

          setErrorMessage(
            hasRejectedRequest
              ? "Kunde inte hamta all statistik just nu."
              : null
          );
          setPayload({
            generalAnalytics,
            totalApplications,
            topObjects,
            timeline:
              timeline.length > 0
                ? timeline
                : fallbackTimeline(totalApplications),
            newApplications,
          });
        }
      } catch (error) {
        if (!isCancelled) {
          setErrorMessage("Kunde inte hamta statistik just nu.");
          setPayload((previous) => ({
            ...previous,
            timeline:
              previous.timeline.length > 0
                ? previous.timeline
                : fallbackTimeline(previous.totalApplications),
          }));
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    load();

    return () => {
      isCancelled = true;
    };
  }, [refreshUser, user]);

  const availablePeriods = useMemo(
    () => getAvailablePeriods(payload.generalAnalytics),
    [payload.generalAnalytics]
  );

  useEffect(() => {
    if (!availablePeriods.includes(selectedPeriod)) {
      setSelectedPeriod(availablePeriods[0] ?? selectedAnalyticsPeriod);
    }
  }, [availablePeriods, selectedPeriod]);

  const totals = useMemo(() => {
    const totalTopApplications = payload.topObjects.reduce(
      (sum, object) => sum + object.numApplications,
      0
    );
    const applications = metricFromQuantities(
      payload.generalAnalytics?.applications,
      payload.totalApplications,
      selectedPeriod
    );
    const viewings = metricFromQuantities(
      getViewingQuantities(payload.generalAnalytics),
      0,
      selectedPeriod
    );
    const interactions = metricFromQuantities(
      payload.generalAnalytics?.interactions,
      0,
      selectedPeriod
    );
    const activeListings = metricFromQuantities(
      getActiveListingQuantities(payload.generalAnalytics),
      payload.topObjects.length,
      selectedPeriod
    );
    const activeListingsForAverage = Math.max(activeListings.count, payload.topObjects.length, 1);

    return {
      activeListings,
      applications,
      averagePerListing: applications.count / activeListingsForAverage,
      interactions,
      totalTopApplications,
      viewings,
    };
  }, [payload, selectedPeriod]);

  const trendSeries: TrendSeries[] = [
    {
      key: "applications",
      label: "Ansökningar",
      color: "var(--color-brand-500)",
    },
    {
      key: "avg",
      label: "Rullande snitt",
      color: "var(--color-brand-300)",
    },
  ];

  const trendData = useMemo(() => buildAverageSeries(payload.timeline), [payload.timeline]);
  const periodVolumeRows = useMemo(
    () =>
      buildPeriodVolumeRows(
        payload.generalAnalytics,
        availablePeriods,
        payload.totalApplications,
        selectedPeriod
      ),
    [availablePeriods, payload.generalAnalytics, payload.totalApplications, selectedPeriod]
  );
  const periodChangeRows = useMemo(
    () => buildPeriodChangeRows(payload.generalAnalytics, availablePeriods),
    [availablePeriods, payload.generalAnalytics]
  );

  const donutItems: DonutBreakdownItem[] = useMemo(() => {
    if (payload.topObjects.length === 0) {
      return [
        { label: "Inga objekt", value: 1, color: donutPalette[0] },
      ];
    }

    return payload.topObjects.slice(0, 5).map((item, index) => ({
      label: shortAddress(item.address),
      value: item.numApplications,
      color: donutPalette[index] ?? donutPalette[donutPalette.length - 1],
    }));
  }, [payload.topObjects]);

  const metricDonutItems: DonutBreakdownItem[] = useMemo(() => {
    const items = [
      {
        label: "Visningar",
        value: totals.viewings.count,
        color: metricPalette.viewings,
      },
      {
        label: "Interaktioner",
        value: totals.interactions.count,
        color: metricPalette.interactions,
      },
      {
        label: "Ansökningar",
        value: totals.applications.count,
        color: metricPalette.applications,
      },
      {
        label: "Aktiva annonser",
        value: totals.activeListings.count,
        color: metricPalette.activeListings,
      },
    ].filter((item) => item.value > 0);

    return items.length > 0
      ? items
      : [{ label: "Ingen data", value: 1, color: metricPalette.activeListings }];
  }, [totals]);

  const funnelSteps: FunnelStep[] = [
    { label: "Visningar", value: totals.viewings.count },
    { label: "Interaktioner", value: totals.interactions.count },
    { label: "Ansökningar", value: totals.applications.count },
  ];

  const applicationRate =
    totals.viewings.count > 0 ? (totals.applications.count / totals.viewings.count) * 100 : 0;
  const interactionRate =
    totals.viewings.count > 0 ? (totals.interactions.count / totals.viewings.count) * 100 : 0;

  const activityItems: ActivityItem[] = useMemo(() => {
    if (payload.newApplications.length === 0) {
      return [
        {
          id: "empty",
          title: "Inga nya ansökningar",
          subtitle: "Nya ansokningar visas här när data finns.",
          meta: "Uppdatera sidan om en stund",
        },
      ];
    }

    return payload.newApplications.slice(0, 6).map((application) => ({
      id: String(application.studentId),
      title: `${application.firstName} ${application.surname}`,
      subtitle: shortAddress(application.address),
      meta: "Ny ansokan",
    }));
  }, [payload.newApplications]);

  const topRows: TopListingRow[] = useMemo(() => {
    if (payload.topObjects.length === 0) {
      return [];
    }

    const denominator = Math.max(totals.totalTopApplications, 1);

    return payload.topObjects.slice(0, 6).map((object) => {
      const sharePercent = (object.numApplications / denominator) * 100;
      const status =
        sharePercent >= 30
          ? { label: "Hog efterfragan", tone: "success" as const }
          : sharePercent >= 15
            ? { label: "Aktiv", tone: "info" as const }
            : { label: "Lag trafik", tone: "warning" as const };

      return {
        id: object.listingId,
        name: shortAddress(object.address),
        meta: "Objekt i portalen",
        applications: object.numApplications,
        share: `${sharePercent.toLocaleString("sv-SE", {
          minimumFractionDigits: 1,
          maximumFractionDigits: 1,
        })}%`,
        statusLabel: status.label,
        statusTone: status.tone,
      };
    });
  }, [payload.topObjects, totals.totalTopApplications]);

  if (authLoading || isLoading) {
    return <SkeletonOverview />;
  }

  if (!user) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <h1 className="text-xl font-semibold text-gray-900">Ingen användare hittades</h1>
        <p className="mt-2 text-theme-sm text-gray-500">
          Logga in igen för att visa portalens oversikt.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-2">
          <p className="text-theme-sm text-gray-500">Company portal</p>
          <h1 className="text-2xl font-semibold text-gray-900">
            Översikt för {user.displayName || user.companyName || "Företaget"}
          </h1>
          <p className="text-theme-sm text-gray-500">
            Samlad bild över annonser, ansökningar och aktuell efterfrågan.
          </p>
          {errorMessage ? (
            <p className="text-theme-xs text-error-700">{errorMessage}</p>
          ) : null}
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-theme-xs font-medium text-gray-500">Period</span>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[180px] bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availablePeriods.map((period) => (
                <SelectItem key={period} value={period}>
                  {periodLabel(period)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          change={formatChange(totals.applications.percentageChange)}
          direction={totals.applications.percentageChange >= 0 ? "up" : "down"}
          icon={<Users className="h-6 w-6" />}
          label="Ansökningar"
          value={totals.applications.count.toLocaleString("sv-SE")}
        />
        <MetricCard
          change={formatChange(totals.viewings.percentageChange)}
          direction={totals.viewings.percentageChange >= 0 ? "up" : "down"}
          icon={<Eye className="h-6 w-6" />}
          label="Visningar"
          value={totals.viewings.count.toLocaleString("sv-SE")}
        />
        <MetricCard
          change={formatChange(totals.interactions.percentageChange)}
          direction={totals.interactions.percentageChange >= 0 ? "up" : "down"}
          icon={<MousePointerClick className="h-6 w-6" />}
          label="Interaktioner"
          value={totals.interactions.count.toLocaleString("sv-SE")}
        />
        <MetricCard
          change={formatChange(totals.activeListings.percentageChange)}
          direction={totals.activeListings.percentageChange >= 0 ? "up" : "down"}
          icon={<Building2 className="h-6 w-6" />}
          label="Aktiva annonser"
          value={totals.activeListings.count.toLocaleString("sv-SE")}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <MetricPeriodVolumeChartCard data={periodVolumeRows} />
        <MetricPeriodChangeChartCard data={periodChangeRows} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <TrendAreaChartCard
          data={trendData}
          description="Ansökningar över tid med rullande snitt."
          series={trendSeries}
          title="Ansokningstrend"
        />
        <DonutBreakdownCard
          description="Fördelning av ansokningar per objekt."
          items={donutItems}
          title="Toppobjekt"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-4">
        <FunnelCard
          description={`Fran visning till ansokan under ${periodLabel(selectedPeriod).toLowerCase()}.`}
          steps={funnelSteps}
          title="Konvertering"
        />
        <DonutBreakdownCard
          description={`Fordelning av volymer under ${periodLabel(selectedPeriod).toLowerCase()}.`}
          items={metricDonutItems}
          title="Datamix"
        />
        <ActivityListCard
          description="Senast inkomna ansökningar."
          items={activityItems}
          title="Nya ansökningar"
        />
        <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-800">Nyckeltal</h3>
          <div className="mt-4 grid gap-3 text-theme-sm text-gray-600">
            <div className="flex items-center justify-between">
              <span>Vald period</span>
              <span className="font-medium text-gray-800">{periodLabel(selectedPeriod)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Ansokningsgrad</span>
              <span className="font-medium text-gray-800">
                {applicationRate.toLocaleString("sv-SE", {
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 1,
                })}
                %
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Interaktionsgrad</span>
              <span className="font-medium text-gray-800">
                {interactionRate.toLocaleString("sv-SE", {
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 1,
                })}
                %
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Snitt ansökningar/annons</span>
              <span className="font-medium text-gray-800">
                {totals.averagePerListing.toLocaleString("sv-SE", {
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 1,
                })}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Objekt i tabellen</span>
              <span className="font-medium text-gray-800">
                {payload.topObjects.length.toLocaleString("sv-SE")}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Ansökningar i funnel</span>
              <span className="font-medium text-gray-800">
                {totals.applications.count.toLocaleString("sv-SE")}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Nya ansökningar idag</span>
              <span className="font-medium text-gray-800">
                {payload.newApplications.length.toLocaleString("sv-SE")}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <TopListingsTableCard
          description="Objekt med flest ansökningar just nu."
          rows={topRows}
          title="Objektprestanda"
        />
      </div>
    </div>
  );
}
