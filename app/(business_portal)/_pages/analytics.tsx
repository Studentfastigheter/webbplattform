"use client";

import { useEffect, useMemo, useState } from "react";
import { BarChart3, Building2, Eye, MousePointerClick, Users } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { listingService, type RollingAd } from "@/services/listing-service";
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
  CardShell,
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
} from "../_components/dashboard-kit";

type AnalyticsPayload = {
  generalAnalytics: AnalyticalQuantities | null;
  openApplications: number;
  timeline: Timeline;
  newApplications: NewApplication[];
  applicationsByObject: ObjectApplicationCount[];
  currentAds: RollingAd[];
};

type MetricSummary = {
  count: number;
  percentageChange: number;
};

const defaultAnalyticsPeriods = ["P7D", "P1M", "P3M", "P1Y"];
const defaultSelectedPeriod = "P1M";
const periodLabels: Record<string, string> = {
  P7D: "7 dagar",
  P1M: "1 månad",
  P3M: "3 manader",
  P1Y: "1 ar",
};
const metricPalette = {
  applications: "#004225",
  viewings: "#2563eb",
  interactions: "#c2410c",
  activeListings: "#64748b",
};
const objectPalette = ["#004225", "#2563eb", "#c2410c", "#64748b", "#3f9369"];

function periodLabel(period: string) {
  return periodLabels[period] ?? period;
}

function formatChange(value: number) {
  return `${Math.abs(value).toLocaleString("sv-SE", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}%`;
}

function formatPercent(value: number) {
  return `${value.toLocaleString("sv-SE", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}%`;
}

function formatNumber(value: number) {
  return value.toLocaleString("sv-SE");
}

function monthLabel(timestamp: Date) {
  return new Intl.DateTimeFormat("sv-SE", { month: "short", year: "2-digit" }).format(timestamp);
}

function shortText(value: string, maxLength = 34) {
  return value.length <= maxLength ? value : `${value.slice(0, maxLength - 3)}...`;
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

function findQuantityForPeriod(
  quantities: AnalyticalQuantity[] | undefined,
  period = defaultSelectedPeriod
) {
  if (!quantities || quantities.length === 0) {
    return undefined;
  }

  return quantities.find((quantity) => quantity.period === period) ?? quantities[0];
}

function metricFromQuantities(
  quantities: AnalyticalQuantity[] | undefined,
  fallbackCount = 0,
  period = defaultSelectedPeriod
): MetricSummary {
  const quantity = findQuantityForPeriod(quantities, period);

  return {
    count: getQuantityCount(quantity, fallbackCount),
    percentageChange: getQuantityChange(quantity),
  };
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
  fallbackPeriod = defaultSelectedPeriod
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

function buildTrendRows(timeline: Timeline) {
  const sorted = [...timeline].sort(
    (left, right) => left.timestamp.getTime() - right.timestamp.getTime()
  );
  const sliced = sorted.slice(-12);

  return sliced.map((entry, index, allRows) => {
    const windowStart = Math.max(0, index - 2);
    const windowRows = allRows.slice(windowStart, index + 1);
    const average = windowRows.reduce((sum, row) => sum + row.value, 0) / windowRows.length;

    return {
      period: monthLabel(entry.timestamp),
      applications: entry.value,
      avg: Math.round(average),
    };
  });
}

function getFulfilledValue<T>(result: PromiseSettledResult<T>, fallback: T) {
  return result.status === "fulfilled" ? result.value : fallback;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getAdText(ad: RollingAd, keys: string[]) {
  if (!isRecord(ad.data)) {
    return undefined;
  }

  for (const key of keys) {
    const value = ad.data[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value;
    }
  }

  return undefined;
}

function SkeletonAnalytics() {
  return (
    <div className="space-y-6">
      <div className="h-24 animate-pulse rounded-2xl bg-white" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <div className="h-36 animate-pulse rounded-2xl border border-gray-200 bg-white" key={index} />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="h-[380px] animate-pulse rounded-2xl border border-gray-200 bg-white xl:col-span-2" />
        <div className="h-[380px] animate-pulse rounded-2xl border border-gray-200 bg-white" />
      </div>
    </div>
  );
}

function OpenApplicationsCard({ value }: { value: number }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-gray-800">
        <BarChart3 className="h-6 w-6" />
      </div>
      <div className="mt-5">
        <span className="text-sm text-gray-500">Obesvarade ansokningar</span>
        <h4 className="mt-2 text-title-sm font-bold text-gray-800">{formatNumber(value)}</h4>
        <p className="mt-2 text-theme-xs text-gray-500">Aktuellt antal som vantar pa svar.</p>
      </div>
    </div>
  );
}

function ActiveAdsCard({
  ads,
  companyName,
}: {
  ads: RollingAd[];
  companyName?: string | null;
}) {
  const normalizedCompanyName = companyName?.trim().toLowerCase();
  const ownAds = normalizedCompanyName
    ? ads.filter((ad) => ad.company?.trim().toLowerCase() === normalizedCompanyName)
    : [];
  const visibleAds = (ownAds.length > 0 ? ownAds : ads).slice(0, 4);

  return (
    <CardShell
      description="Aktiva annonskampanjer som backend markerar som giltiga idag."
      title="Aktiva kampanjer"
    >
      {visibleAds.length === 0 ? (
        <p className="text-theme-sm text-gray-500">Inga aktiva kampanjer hittades.</p>
      ) : (
        <div className="grid gap-3">
          {visibleAds.map((ad, index) => {
            const headline = getAdText(ad, ["headline", "title", "name"]) ?? ad.company ?? "Kampanj";
            const ctaText = getAdText(ad, ["ctaText", "cta", "buttonText"]) ?? "Aktiv";
            const imageUrl = getAdText(ad, ["imageUrl", "image", "image_url"]);
            const linkUrl = getAdText(ad, ["linkUrl", "url", "href"]);

            return (
              <article
                className="flex gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3"
                key={`${ad.id}-${index}`}
              >
                {imageUrl ? (
                  <img
                    alt=""
                    className="h-14 w-20 rounded-md object-cover"
                    src={imageUrl}
                  />
                ) : (
                  <div className="flex h-14 w-20 items-center justify-center rounded-md bg-gray-200 text-theme-xs text-gray-500">
                    Ads
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-theme-sm font-semibold text-gray-800">{headline}</p>
                  <p className="mt-0.5 text-theme-xs text-gray-500">{ad.company ?? "CampusLyan"}</p>
                  {linkUrl ? (
                    <a
                      className="mt-2 inline-flex text-theme-xs font-medium text-brand-600 hover:underline"
                      href={linkUrl}
                      rel="noreferrer"
                      target="_blank"
                    >
                      {ctaText}
                    </a>
                  ) : (
                    <span className="mt-2 inline-flex text-theme-xs font-medium text-brand-600">
                      {ctaText}
                    </span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </CardShell>
  );
}

export default function Analytics() {
  const { user, isLoading: authLoading, refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState(defaultSelectedPeriod);
  const [payload, setPayload] = useState<AnalyticsPayload>({
    generalAnalytics: null,
    openApplications: 0,
    timeline: [],
    newApplications: [],
    applicationsByObject: [],
    currentAds: [],
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

      if (user.accountType !== "company") {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setErrorMessage(null);

      const [
        generalAnalyticsResult,
        openApplicationsResult,
        timelineResult,
        newApplicationsResult,
        applicationsByObjectResult,
        currentAdsResult,
      ] = await Promise.allSettled([
        companyService.generalAnalytics(user.id),
        companyService.applicationCount(user.id),
        companyService.applicationsTimeline(user.id),
        companyService.newApplications(user.id, { count: 12, since: "always" }),
        companyService.applicationCountsPerObject(user.id, 12),
        listingService.getCurrentAds(),
      ]);

      if (isCancelled) {
        return;
      }

      const hasRejectedRequest = [
        generalAnalyticsResult,
        openApplicationsResult,
        timelineResult,
        newApplicationsResult,
        applicationsByObjectResult,
        currentAdsResult,
      ].some((result) => result.status === "rejected");

      setErrorMessage(hasRejectedRequest ? "Kunde inte hamta all analysdata just nu." : null);
      setPayload({
        generalAnalytics: getFulfilledValue<AnalyticalQuantities | null>(
          generalAnalyticsResult,
          null
        ),
        openApplications: getFulfilledValue(openApplicationsResult, 0),
        timeline: getFulfilledValue<Timeline>(timelineResult, []),
        newApplications: getFulfilledValue<NewApplication[]>(newApplicationsResult, []),
        applicationsByObject: getFulfilledValue<ObjectApplicationCount[]>(
          applicationsByObjectResult,
          []
        ),
        currentAds: getFulfilledValue<RollingAd[]>(currentAdsResult, []),
      });
      setIsLoading(false);
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
      setSelectedPeriod(availablePeriods[0] ?? defaultSelectedPeriod);
    }
  }, [availablePeriods, selectedPeriod]);

  const metrics = useMemo(() => {
    const applications = metricFromQuantities(
      payload.generalAnalytics?.applications,
      payload.openApplications,
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
      payload.applicationsByObject.length,
      selectedPeriod
    );

    return { activeListings, applications, interactions, viewings };
  }, [payload, selectedPeriod]);

  const periodVolumeRows = useMemo(
    () =>
      buildPeriodVolumeRows(
        payload.generalAnalytics,
        availablePeriods,
        metrics.applications.count,
        selectedPeriod
      ),
    [availablePeriods, metrics.applications.count, payload.generalAnalytics, selectedPeriod]
  );
  const periodChangeRows = useMemo(
    () => buildPeriodChangeRows(payload.generalAnalytics, availablePeriods),
    [availablePeriods, payload.generalAnalytics]
  );
  const trendData = useMemo(() => buildTrendRows(payload.timeline), [payload.timeline]);
  const trendSeries: TrendSeries[] = [
    { key: "applications", label: "Ansökningar", color: "var(--color-brand-500)" },
    { key: "avg", label: "Rullande snitt", color: "var(--color-brand-300)" },
  ];

  const funnelSteps: FunnelStep[] = [
    { label: "Visningar", value: metrics.viewings.count },
    { label: "Interaktioner", value: metrics.interactions.count },
    { label: "Ansökningar", value: metrics.applications.count },
  ];
  const applicationRate =
    metrics.viewings.count > 0 ? (metrics.applications.count / metrics.viewings.count) * 100 : 0;
  const interactionRate =
    metrics.viewings.count > 0 ? (metrics.interactions.count / metrics.viewings.count) * 100 : 0;

  const metricDonutItems: DonutBreakdownItem[] = [
    { label: "Visningar", value: metrics.viewings.count, color: metricPalette.viewings },
    {
      label: "Interaktioner",
      value: metrics.interactions.count,
      color: metricPalette.interactions,
    },
    {
      label: "Ansökningar",
      value: metrics.applications.count,
      color: metricPalette.applications,
    },
    {
      label: "Aktiva annonser",
      value: metrics.activeListings.count,
      color: metricPalette.activeListings,
    },
  ].filter((item) => item.value > 0);

  const topListingRows: TopListingRow[] = payload.applicationsByObject.slice(0, 8).map((object) => {
    const totalApplications = Math.max(
      payload.applicationsByObject.reduce((sum, item) => sum + item.numApplications, 0),
      1
    );
    const sharePercent = (object.numApplications / totalApplications) * 100;
    const status =
      sharePercent >= 30
        ? { label: "Hog efterfragan", tone: "success" as const }
        : sharePercent >= 15
          ? { label: "Aktiv", tone: "info" as const }
          : { label: "Lag trafik", tone: "warning" as const };

    return {
      id: object.listingId,
      name: shortText(object.address),
      meta: "Annons",
      applications: object.numApplications,
      share: formatPercent(sharePercent),
      statusLabel: status.label,
      statusTone: status.tone,
    };
  });

  const objectDonutItems: DonutBreakdownItem[] =
    payload.applicationsByObject.length > 0
      ? payload.applicationsByObject.slice(0, 5).map((object, index) => ({
          label: shortText(object.address, 28),
          value: object.numApplications,
          color: objectPalette[index] ?? objectPalette[objectPalette.length - 1],
        }))
      : [{ label: "Ingen data", value: 1, color: objectPalette[0] }];

  const activityItems: ActivityItem[] =
    payload.newApplications.length > 0
      ? payload.newApplications.slice(0, 8).map((application, index) => ({
          id: String(application.applicationId ?? application.id ?? application.studentId ?? index),
          title: `${application.firstName ?? ""} ${application.surname ?? ""}`.trim() || "Ny ansokan",
          subtitle: shortText(application.listingTitle ?? application.address ?? "Okänd annons"),
          meta: application.submittedAt ?? application.createdAt ?? "Ny ansokan",
        }))
      : [
          {
            id: "empty",
            title: "Inga nya ansökningar",
            subtitle: "Nya ansokningar visas här när backend skickar data.",
            meta: "Uppdatera sidan senare",
          },
        ];

  if (authLoading || isLoading) {
    return <SkeletonAnalytics />;
  }

  if (!user || user.accountType !== "company") {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <h1 className="text-xl font-semibold text-gray-900">Ingen företagsportal hittades</h1>
        <p className="mt-2 text-theme-sm text-gray-500">
          Logga in som företag för att visa analysdatan.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <p className="text-theme-sm text-gray-500">Analytics</p>
          <h1 className="text-2xl font-semibold text-gray-900">
            Analys för {user.companyName || user.displayName || "företaget"}
          </h1>
          <p className="text-theme-sm text-gray-500">
            Statistik för ansökningar, visningar, interaktioner och aktiva annonser.
          </p>
          {errorMessage ? <p className="text-theme-xs text-error-700">{errorMessage}</p> : null}
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard
          change={formatChange(metrics.applications.percentageChange)}
          direction={metrics.applications.percentageChange >= 0 ? "up" : "down"}
          icon={<Users className="h-6 w-6" />}
          label="Ansökningar"
          value={formatNumber(metrics.applications.count)}
        />
        <MetricCard
          change={formatChange(metrics.viewings.percentageChange)}
          direction={metrics.viewings.percentageChange >= 0 ? "up" : "down"}
          icon={<Eye className="h-6 w-6" />}
          label="Visningar"
          value={formatNumber(metrics.viewings.count)}
        />
        <MetricCard
          change={formatChange(metrics.interactions.percentageChange)}
          direction={metrics.interactions.percentageChange >= 0 ? "up" : "down"}
          icon={<MousePointerClick className="h-6 w-6" />}
          label="Interaktioner"
          value={formatNumber(metrics.interactions.count)}
        />
        <MetricCard
          change={formatChange(metrics.activeListings.percentageChange)}
          direction={metrics.activeListings.percentageChange >= 0 ? "up" : "down"}
          icon={<Building2 className="h-6 w-6" />}
          label="Aktiva annonser"
          value={formatNumber(metrics.activeListings.count)}
        />
        <OpenApplicationsCard value={payload.openApplications} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <MetricPeriodVolumeChartCard data={periodVolumeRows} />
        <MetricPeriodChangeChartCard data={periodChangeRows} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <TrendAreaChartCard
          data={trendData}
          description="Manadsvy för ansökningar med rullande snitt."
          series={trendSeries}
          title="Ansokningstrend"
        />
        <DonutBreakdownCard
          description={`Datamix under ${periodLabel(selectedPeriod).toLowerCase()}.`}
          items={
            metricDonutItems.length > 0
              ? metricDonutItems
              : [{ label: "Ingen data", value: 1, color: metricPalette.activeListings }]
          }
          title="Datamix"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-4">
        <FunnelCard
          description={`Fran visning till ansokan under ${periodLabel(selectedPeriod).toLowerCase()}.`}
          steps={funnelSteps}
          title="Konvertering"
        />
        <DonutBreakdownCard
          description="Fördelning av ansokningar per annons."
          items={objectDonutItems}
          title="Toppannonser"
        />
        <ActivityListCard
          description="Senaste ansokningarna från analytics-endpointen."
          items={activityItems}
          title="Nya ansökningar"
        />
        <CardShell description="Beraknade nyckeltal för vald period." title="Nyckeltal">
          <div className="grid gap-3 text-theme-sm text-gray-600">
            <div className="flex items-center justify-between">
              <span>Vald period</span>
              <span className="font-medium text-gray-800">{periodLabel(selectedPeriod)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Ansokningsgrad</span>
              <span className="font-medium text-gray-800">{formatPercent(applicationRate)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Interaktionsgrad</span>
              <span className="font-medium text-gray-800">{formatPercent(interactionRate)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Ansökningar per aktiv annons</span>
              <span className="font-medium text-gray-800">
                {(
                  metrics.applications.count / Math.max(metrics.activeListings.count, 1)
                ).toLocaleString("sv-SE", {
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 1,
                })}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Nya ansokningar i listan</span>
              <span className="font-medium text-gray-800">
                {formatNumber(payload.newApplications.length)}
              </span>
            </div>
          </div>
        </CardShell>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <TopListingsTableCard
          description="Annonser sorterade efter antal ansökningar."
          rows={topListingRows}
          title="Ansökningar per annons"
        />
        <ActiveAdsCard ads={payload.currentAds} companyName={user.companyName} />
      </div>
    </div>
  );
}
