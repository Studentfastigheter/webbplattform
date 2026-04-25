"use client";

import { useEffect, useMemo, useState } from "react";
import { BarChart3, Building2, Eye, Inbox, ListChecks, MousePointerClick, Users } from "lucide-react";
import {
  Area,
  AreaChart,
  AreaSeries,
  Bar,
  BarChart,
  BarSeries,
  Count,
  Gridline,
  GridlineSeries,
  LinearXAxis,
  LinearXAxisTickLabel,
  LinearXAxisTickSeries,
  LinearYAxis,
  LinearYAxisTickLabel,
  LinearYAxisTickSeries,
  Line,
  PointSeries,
  ScatterPoint,
  type ChartShallowDataShape,
} from "reaviz";
import { useAuth } from "@/context/AuthContext";
import { getActiveCompanyId } from "@/lib/company-access";
import {
  companyService,
  type AnalyticalQuantities,
  type AnalyticalQuantity,
  type NewApplication,
  type ObjectApplicationCount,
  type Timeline,
} from "@/services/company";
import { CardShell, MetricCard } from "../dashboard-kit";

type AnalyticsPayload = {
  generalAnalytics: AnalyticalQuantities | null;
  currentApplications: number | null;
  timeline: Timeline;
  newApplications: NewApplication[];
  applicationsByObject: ObjectApplicationCount[];
};

type MetricSummary = {
  count: number;
  percentageChange: number;
};

const selectedGeneralPeriod = "P1M";
const objectChartColor = "#004225";
const trendColor = "#2563eb";

function toNumber(value: unknown) {
  const numberValue =
    typeof value === "string" ? Number(value.replace(",", ".")) : Number(value);

  return Number.isFinite(numberValue) ? numberValue : 0;
}

function formatNumber(value: number) {
  return value.toLocaleString("sv-SE");
}

function formatChange(value: number) {
  return `${Math.abs(value).toLocaleString("sv-SE", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}%`;
}

function monthLabel(timestamp: Date) {
  return new Intl.DateTimeFormat("sv-SE", { month: "short", year: "2-digit" }).format(timestamp);
}

function shortText(value: string | undefined, maxLength = 34) {
  const text = value?.trim() || "Okänd annons";

  return text.length <= maxLength ? text : `${text.slice(0, maxLength - 3)}...`;
}

function getQuantityCount(quantity: AnalyticalQuantity | undefined) {
  if (!quantity) {
    return 0;
  }

  return toNumber(
    quantity.count ??
      quantity.absoluteCount ??
      quantity.quantity ??
      quantity.value ??
      quantity.amount
  );
}

function getQuantityChange(quantity: AnalyticalQuantity | undefined) {
  if (!quantity) {
    return 0;
  }

  return toNumber(
    quantity.percentageChange ??
      quantity.changePercentage ??
      quantity.percentChange ??
      quantity.rateOfChangePercentage ??
      quantity.rateOfChange ??
      quantity.relativeChange ??
      quantity.changeRate ??
      quantity.change
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

function getMetric(
  quantities: AnalyticalQuantity[] | undefined,
  period = selectedGeneralPeriod
): MetricSummary {
  const quantity = quantities?.find((item) => item.period === period) ?? quantities?.[0];

  return {
    count: getQuantityCount(quantity),
    percentageChange: getQuantityChange(quantity),
  };
}

function getFulfilledValue<T>(result: PromiseSettledResult<T>, emptyValue: T) {
  return result.status === "fulfilled" ? result.value : emptyValue;
}

function SkeletonAnalyticsDashboard() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-4 w-36 animate-pulse rounded bg-gray-200" />
        <div className="h-8 w-72 animate-pulse rounded bg-gray-200" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            className="h-36 animate-pulse rounded-2xl border border-gray-200 bg-white"
            key={index}
          />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="h-[390px] animate-pulse rounded-2xl border border-gray-200 bg-white xl:col-span-2" />
        <div className="h-[390px] animate-pulse rounded-2xl border border-gray-200 bg-white" />
      </div>
    </div>
  );
}

function EmptyState({ children }: { children: string }) {
  return (
    <div className="flex min-h-[220px] items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50 px-6 text-center text-theme-sm text-gray-500">
      {children}
    </div>
  );
}

function ApplicationsTrendCard({ timeline }: { timeline: Timeline }) {
  const chartRows: ChartShallowDataShape<number>[] = timeline
    .filter((entry) => entry.timestamp instanceof Date && !Number.isNaN(entry.timestamp.getTime()))
    .sort((left, right) => left.timestamp.getTime() - right.timestamp.getTime())
    .map((entry) => ({
      key: monthLabel(entry.timestamp),
      data: toNumber(entry.value),
    }));
  const domain = chartRows.map((row) => String(row.key));

  return (
    <CardShell
      className="xl:col-span-2"
      description="Direkt från /current_applications/trend."
      title="Ansökningstrend över tid"
    >
      {chartRows.length > 0 ? (
        <div className="h-[320px] min-w-[680px]">
          <AreaChart
            data={chartRows}
            gridlines={<GridlineSeries line={<Gridline direction="y" strokeColor="#e5e7eb" />} />}
            margins={28}
            series={
              <AreaSeries
                area={<Area gradient={null} />}
                colorScheme={[trendColor]}
                interpolation="smooth"
                line={<Line strokeWidth={2.5} />}
                symbols={<PointSeries point={<ScatterPoint size={5} />} show />}
              />
            }
            xAxis={
              <LinearXAxis
                axisLine={null}
                domain={domain}
                tickSeries={
                  <LinearXAxisTickSeries
                    label={<LinearXAxisTickLabel fill="#667085" fontSize={12} />}
                    line={null}
                  />
                }
                type="category"
              />
            }
            yAxis={
              <LinearYAxis
                axisLine={null}
                scaled
                tickSeries={
                  <LinearYAxisTickSeries
                    label={
                      <LinearYAxisTickLabel
                        fill="#667085"
                        fontSize={12}
                        format={(value) => formatNumber(toNumber(value))}
                      />
                    }
                    line={null}
                  />
                }
                type="value"
              />
            }
          />
        </div>
      ) : (
        <EmptyState>Ingen trenddata returnerades från analytics-endpointen.</EmptyState>
      )}
    </CardShell>
  );
}

function ApplicationsByObjectCard({ rows }: { rows: ObjectApplicationCount[] }) {
  const chartRows: ChartShallowDataShape<number>[] = rows.slice(0, 8).map((row) => ({
    key: shortText(row.address, 28),
    data: toNumber(row.numApplications),
  }));
  const total = rows.reduce((sum, row) => sum + toNumber(row.numApplications), 0);

  return (
    <CardShell
      description="Direkt från /current_applications/by_object."
      title="Ansökningar per objekt"
    >
      {chartRows.length > 0 ? (
        <div className="space-y-5">
          <div className="h-[260px]">
            <BarChart
              data={chartRows}
              gridlines={
                <GridlineSeries line={<Gridline direction="x" strokeColor="#e5e7eb" />} />
              }
              margins={28}
              series={
                <BarSeries
                  bar={<Bar gradient={null} rx={5} ry={5} />}
                  colorScheme={[objectChartColor]}
                  layout="horizontal"
                  padding={0.18}
                />
              }
              xAxis={
                <LinearXAxis
                  axisLine={null}
                  scaled
                  tickSeries={
                    <LinearXAxisTickSeries
                      label={
                        <LinearXAxisTickLabel
                          fill="#667085"
                          fontSize={12}
                          format={(value) => formatNumber(toNumber(value))}
                        />
                      }
                      line={null}
                    />
                  }
                  type="value"
                />
              }
              yAxis={
                <LinearYAxis
                  axisLine={null}
                  tickSeries={
                    <LinearYAxisTickSeries
                      ellipsisLength={24}
                      label={<LinearYAxisTickLabel fill="#344054" fontSize={12} />}
                      line={null}
                    />
                  }
                  type="category"
                />
              }
            />
          </div>

          <div className="divide-y divide-gray-100">
            {rows.slice(0, 8).map((row) => {
              const applications = toNumber(row.numApplications);
              const share = total > 0 ? (applications / total) * 100 : 0;

              return (
                <div
                  className="flex items-center justify-between gap-4 py-3 text-theme-sm"
                  key={row.listingId}
                >
                  <span className="min-w-0 truncate font-medium text-gray-800">
                    {shortText(row.address, 44)}
                  </span>
                  <span className="shrink-0 text-gray-500">
                    {formatNumber(applications)} ({share.toLocaleString("sv-SE", {
                      maximumFractionDigits: 1,
                    })}
                    %)
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <EmptyState>Inga objekt med ansökningar returnerades.</EmptyState>
      )}
    </CardShell>
  );
}

function NewApplicationsCard({ applications }: { applications: NewApplication[] }) {
  return (
    <CardShell
      description="Direkt från /current_applications/new_applications."
      title="Senaste ansökningar"
    >
      {applications.length > 0 ? (
        <div className="space-y-3">
          {applications.slice(0, 8).map((application, index) => {
            const title =
              `${application.firstName ?? ""} ${application.surname ?? ""}`.trim() ||
              "Ny ansökan";
            const meta = application.submittedAt ?? application.createdAt ?? "Ny ansökan";
            const id =
              application.applicationId ??
              application.id ??
              application.studentId ??
              `${title}-${index}`;

            return (
              <article
                className="rounded-lg border border-gray-100 bg-gray-50 p-3"
                key={`${id}-${index}`}
              >
                <p className="text-theme-sm font-semibold text-gray-800">{title}</p>
                <p className="mt-0.5 text-theme-xs text-gray-500">
                  {shortText(application.listingTitle ?? application.address, 52)}
                </p>
                <p className="mt-2 text-theme-xs text-gray-400">{meta}</p>
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState>Inga nya ansökningar returnerades.</EmptyState>
      )}
    </CardShell>
  );
}

export default function AnalyticsDashboard({
  title = "Analytics",
}: {
  title?: string;
}) {
  const { user, isLoading: authLoading, refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [payload, setPayload] = useState<AnalyticsPayload>({
    generalAnalytics: null,
    currentApplications: null,
    timeline: [],
    newApplications: [],
    applicationsByObject: [],
  });

  useEffect(() => {
    let isCancelled = false;

    const load = async () => {
      if (!user) {
        try {
          await refreshUser();
        } catch {
          if (!isCancelled) {
            setErrorMessage("Kunde inte ladda användaren.");
          }
        } finally {
          if (!isCancelled) {
            setIsLoading(false);
          }
        }
        return;
      }

      const companyId = getActiveCompanyId(user);
      if (companyId == null) {
        setErrorMessage("Kunde inte hitta ett företag kopplat till användaren.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setErrorMessage(null);

      const [
        generalAnalyticsResult,
        currentApplicationsResult,
        timelineResult,
        newApplicationsResult,
        applicationsByObjectResult,
      ] = await Promise.allSettled([
        companyService.generalAnalytics(companyId),
        companyService.applicationCount(companyId),
        companyService.applicationsTimeline(companyId),
        companyService.newApplications(companyId, { count: 8, since: "always" }),
        companyService.applicationCountsPerObject(companyId, 8),
      ]);

      if (isCancelled) {
        return;
      }

      const hasRejectedRequest = [
        generalAnalyticsResult,
        currentApplicationsResult,
        timelineResult,
        newApplicationsResult,
        applicationsByObjectResult,
      ].some((result) => result.status === "rejected");

      setErrorMessage(hasRejectedRequest ? "Kunde inte hämta all analytics-data just nu." : null);
      setPayload({
        generalAnalytics: getFulfilledValue<AnalyticalQuantities | null>(
          generalAnalyticsResult,
          null
        ),
        currentApplications: getFulfilledValue<number | null>(
          currentApplicationsResult,
          null
        ),
        timeline: getFulfilledValue<Timeline>(timelineResult, []),
        newApplications: getFulfilledValue<NewApplication[]>(newApplicationsResult, []),
        applicationsByObject: getFulfilledValue<ObjectApplicationCount[]>(
          applicationsByObjectResult,
          []
        ),
      });
      setIsLoading(false);
    };

    load();

    return () => {
      isCancelled = true;
    };
  }, [refreshUser, user]);

  const metricValues = useMemo(() => {
    const applications = getMetric(payload.generalAnalytics?.applications);
    const viewings = getMetric(getViewingQuantities(payload.generalAnalytics));
    const interactions = getMetric(payload.generalAnalytics?.interactions);
    const activeListings = getMetric(getActiveListingQuantities(payload.generalAnalytics));

    return { activeListings, applications, interactions, viewings };
  }, [payload.generalAnalytics]);

  if (authLoading || isLoading) {
    return <SkeletonAnalyticsDashboard />;
  }

  if (!user) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <h1 className="text-xl font-semibold text-gray-900">Ingen användare hittades</h1>
        <p className="mt-2 text-theme-sm text-gray-500">
          Logga in igen för att visa analytics.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
        {errorMessage ? <p className="text-theme-xs text-error-700">{errorMessage}</p> : null}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard
          countValue={toNumber(payload.currentApplications)}
          icon={<Inbox className="h-6 w-6" />}
          label="Aktuella ansökningar"
        />
        <MetricCard
          change={formatChange(metricValues.applications.percentageChange)}
          countValue={metricValues.applications.count}
          direction={metricValues.applications.percentageChange >= 0 ? "up" : "down"}
          icon={<Users className="h-6 w-6" />}
          label="Ansökningar"
        />
        <MetricCard
          change={formatChange(metricValues.viewings.percentageChange)}
          countValue={metricValues.viewings.count}
          direction={metricValues.viewings.percentageChange >= 0 ? "up" : "down"}
          icon={<Eye className="h-6 w-6" />}
          label="Visningar"
        />
        <MetricCard
          change={formatChange(metricValues.interactions.percentageChange)}
          countValue={metricValues.interactions.count}
          direction={metricValues.interactions.percentageChange >= 0 ? "up" : "down"}
          icon={<MousePointerClick className="h-6 w-6" />}
          label="Interaktioner"
        />
        <MetricCard
          change={formatChange(metricValues.activeListings.percentageChange)}
          countValue={metricValues.activeListings.count}
          direction={metricValues.activeListings.percentageChange >= 0 ? "up" : "down"}
          icon={<Building2 className="h-6 w-6" />}
          label="Aktiva annonser"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <ApplicationsTrendCard timeline={payload.timeline} />
        <CardShell description="Direkt från endpoint-svaren." title="Endpoint-volymer">
          <div className="grid gap-4">
            <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-4">
              <div className="flex items-center gap-3">
                <ListChecks className="h-5 w-5 text-gray-500" />
                <span className="text-theme-sm font-medium text-gray-700">Nya ansökningar</span>
              </div>
              <span className="text-lg font-semibold text-gray-900">
                <Count decimalPlaces={0} to={payload.newApplications.length} />
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-4">
              <div className="flex items-center gap-3">
                <BarChart3 className="h-5 w-5 text-gray-500" />
                <span className="text-theme-sm font-medium text-gray-700">Objekt i by_object</span>
              </div>
              <span className="text-lg font-semibold text-gray-900">
                <Count decimalPlaces={0} to={payload.applicationsByObject.length} />
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-4">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-gray-500" />
                <span className="text-theme-sm font-medium text-gray-700">
                  Ansökningar i by_object
                </span>
              </div>
              <span className="text-lg font-semibold text-gray-900">
                <Count
                  decimalPlaces={0}
                  to={payload.applicationsByObject.reduce(
                    (sum, row) => sum + toNumber(row.numApplications),
                    0
                  )}
                />
              </span>
            </div>
          </div>
        </CardShell>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <ApplicationsByObjectCard rows={payload.applicationsByObject} />
        <NewApplicationsCard applications={payload.newApplications} />
      </div>
    </div>
  );
}
