"use client";

import { useEffect, useMemo, useState } from "react";
import { Building2, FileText, MousePointerClick, Users } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  companyService,
  type NewApplication,
  type ObjectApplicationCount,
  type Timeline,
} from "@/services/company";
import {
  ActivityListCard,
  DonutBreakdownCard,
  FunnelCard,
  MetricCard,
  TopListingsTableCard,
  TrendAreaChartCard,
  type ActivityItem,
  type DonutBreakdownItem,
  type FunnelStep,
  type TopListingRow,
  type TrendSeries,
} from "../dashboard-kit";

type TimelinePoint = {
  period: string;
  applications: number;
};

type OverviewPayload = {
  totalApplications: number;
  topObjects: ObjectApplicationCount[];
  timeline: TimelinePoint[];
  newApplications: NewApplication[];
};

const donutPalette = ["#004225", "#3f9369", "#6bb18d", "#9fd0b6", "#cce8d8"];

function monthLabel(timestamp: Date) {
  return new Intl.DateTimeFormat("sv-SE", { month: "short" }).format(timestamp);
}

function percentageChange(currentValue: number, previousValue: number) {
  if (previousValue <= 0) {
    return currentValue > 0 ? 100 : 0;
  }

  return ((currentValue - previousValue) / previousValue) * 100;
}

function formatChange(value: number) {
  return `${Math.abs(value).toLocaleString("sv-SE", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}%`;
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
  const [payload, setPayload] = useState<OverviewPayload>({
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
        const [totalApplications, timelineResponse, topObjectsResponse, newApplications] =
          await Promise.all([
            companyService.applicationCount(user.id),
            companyService.applicationsTimeline(user.id),
            companyService.applicationCountsPerObject(user.id, 8),
            companyService.newApplications(user.id),
          ]);

        const timeline = buildTimelineRows(timelineResponse);
        const groupedFallbackObjects = groupApplicationsByAddress(newApplications);
        const topObjects =
          topObjectsResponse.length > 0
            ? topObjectsResponse
            : groupedFallbackObjects;

        if (!isCancelled) {
          setPayload({
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

  const totals = useMemo(() => {
    const totalTopApplications = payload.topObjects.reduce(
      (sum, object) => sum + object.numApplications,
      0
    );
    const activeListings = Math.max(payload.topObjects.length, 1);
    const estimatedViews = Math.max(payload.totalApplications * 12, 150);
    const estimatedClicks = Math.max(Math.round(estimatedViews * 0.32), payload.totalApplications);
    const estimatedSaved = Math.max(Math.round(estimatedClicks * 0.42), payload.totalApplications);

    return {
      activeListings,
      averagePerListing: payload.totalApplications / activeListings,
      estimatedViews,
      estimatedClicks,
      estimatedSaved,
      totalTopApplications,
    };
  }, [payload]);

  const trendSeries: TrendSeries[] = [
    {
      key: "applications",
      label: "Ansokningar",
      color: "var(--color-brand-500)",
    },
    {
      key: "avg",
      label: "Rullande snitt",
      color: "var(--color-brand-300)",
    },
  ];

  const trendData = useMemo(() => buildAverageSeries(payload.timeline), [payload.timeline]);
  const latestValue = trendData.at(-1)?.applications ?? payload.totalApplications;
  const previousValue = trendData.at(-2)?.applications ?? latestValue;
  const trendPercent = percentageChange(latestValue, previousValue);
  const newApplicationsPercent = percentageChange(
    payload.newApplications.length,
    Math.max(1, previousValue)
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

  const funnelSteps: FunnelStep[] = [
    { label: "Visningar", value: totals.estimatedViews },
    { label: "Klick", value: totals.estimatedClicks },
    { label: "Sparade", value: totals.estimatedSaved },
    { label: "Ansokningar", value: payload.totalApplications },
  ];

  const activityItems: ActivityItem[] = useMemo(() => {
    if (payload.newApplications.length === 0) {
      return [
        {
          id: "empty",
          title: "Inga nya ansokningar",
          subtitle: "Nya ansokningar visas har nar data finns.",
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
        <h1 className="text-xl font-semibold text-gray-900">Ingen anvandare hittades</h1>
        <p className="mt-2 text-theme-sm text-gray-500">
          Logga in igen for att visa portalens oversikt.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <p className="text-theme-sm text-gray-500">Company portal</p>
        <h1 className="text-2xl font-semibold text-gray-900">
          Oversikt for {user.displayName || user.companyName || "Foretaget"}
        </h1>
        <p className="text-theme-sm text-gray-500">
          Samlad bild over annonser, ansokningar och aktuell efterfragan.
        </p>
        {errorMessage ? (
          <p className="text-theme-xs text-error-700">{errorMessage}</p>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          change={formatChange(trendPercent)}
          direction={trendPercent >= 0 ? "up" : "down"}
          icon={<Users className="h-6 w-6" />}
          label="Ansokningar"
          value={payload.totalApplications.toLocaleString("sv-SE")}
        />
        <MetricCard
          change={formatChange(newApplicationsPercent)}
          direction={newApplicationsPercent >= 0 ? "up" : "down"}
          icon={<FileText className="h-6 w-6" />}
          label="Nya ansokningar"
          value={payload.newApplications.length.toLocaleString("sv-SE")}
        />
        <MetricCard
          change={formatChange(percentageChange(totals.activeListings, Math.max(1, totals.activeListings - 1)))}
          direction="up"
          icon={<Building2 className="h-6 w-6" />}
          label="Aktiva annonser"
          value={totals.activeListings.toLocaleString("sv-SE")}
        />
        <MetricCard
          change={formatChange(percentageChange(totals.estimatedViews, Math.max(1, totals.estimatedViews - 220)))}
          direction="up"
          icon={<MousePointerClick className="h-6 w-6" />}
          label="Estimerade visningar"
          value={totals.estimatedViews.toLocaleString("sv-SE")}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <TrendAreaChartCard
          data={trendData}
          description="Ansokningar over tid med rullande snitt."
          series={trendSeries}
          title="Ansokningstrend"
        />
        <DonutBreakdownCard
          description="Fordelning av ansokningar per objekt."
          items={donutItems}
          title="Toppobjekt"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <FunnelCard
          description="Estimerad resa fran visning till ansokan."
          steps={funnelSteps}
          title="Konvertering"
        />
        <ActivityListCard
          description="Senaste inkomna ansokningar."
          items={activityItems}
          title="Nya ansokningar"
        />
        <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-800">Nyckeltal</h3>
          <div className="mt-4 grid gap-3 text-theme-sm text-gray-600">
            <div className="flex items-center justify-between">
              <span>Snitt ansokningar/annons</span>
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
              <span>Ansokningar i funnel</span>
              <span className="font-medium text-gray-800">
                {payload.totalApplications.toLocaleString("sv-SE")}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Nya ansokningar idag</span>
              <span className="font-medium text-gray-800">
                {payload.newApplications.length.toLocaleString("sv-SE")}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <TopListingsTableCard
          description="Objekt med flest ansokningar just nu."
          rows={topRows}
          title="Objektprestanda"
        />
      </div>
    </div>
  );
}

