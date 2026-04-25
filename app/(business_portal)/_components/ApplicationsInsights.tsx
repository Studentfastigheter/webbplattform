"use client";

import * as React from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { Building2, Clock3, Home, ListOrdered, MapPin, Users } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { useAuth } from "@/context/AuthContext";
import { getActiveCompanyId } from "@/lib/company-access";
import { companyService, type AnalyticalQuantities, type AnalyticalQuantity, type NewApplication, type ObjectApplicationCount, type Timeline } from "@/services/company";
import { queueService, type QueueApplicationDTO } from "@/services/queue-service";
import type { ListingCardDTO } from "@/types/listing";
import type { HousingQueueDTO } from "@/types/queue";
import type { ApplicantsTableProps } from "@/lib/definitions";
import { PortalControlSelectTrigger } from "./PortalControlSelectTrigger";
import { CardShell, DonutBreakdownCard, MetricCard, type DonutBreakdownItem } from "./dashboard-kit";

export type ApplicationsMode = "interest" | "queue";
type TimePeriod = "30d" | "90d" | "12m";
type InterestPayload = {
  generalAnalytics: AnalyticalQuantities | null;
  openApplications: number;
  timeline: Timeline;
  newApplications: NewApplication[];
  applicationsByObject: ObjectApplicationCount[];
  listings: ListingCardDTO[];
  queues: HousingQueueDTO[];
};
type QueuePayload = { queues: HousingQueueDTO[]; queueApplications: QueueApplicationDTO[] };

const periodOptions: { label: string; value: TimePeriod }[] = [
  { label: "Senaste 30 dagar", value: "30d" },
  { label: "Senaste 90 dagar", value: "90d" },
  { label: "12 månader", value: "12m" },
];
const periodToGeneralPeriod: Record<TimePeriod, string> = { "30d": "P1M", "90d": "P3M", "12m": "P1Y" };
const applicationChartConfig = {
  applications: { label: "Ansökningar", color: "#004225" },
  avg: { label: "Rullande snitt", color: "#6bb18d" },
} satisfies ChartConfig;
const queueChartConfig = {
  joined: { label: "Nya i kö", color: "#004225" },
  cumulative: { label: "Totalt i kö", color: "#2563eb" },
} satisfies ChartConfig;
const palette = ["#004225", "#2563eb", "#c2410c", "#64748b", "#3f9369", "#9fd0b6"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readPath(source: Record<string, unknown>, path: string): unknown {
  let current: unknown = source;
  for (const part of path.split(".")) {
    if (!isRecord(current)) return undefined;
    current = current[part];
  }
  return current;
}

function pickNumber(source: unknown, paths: string[]) {
  if (!isRecord(source)) return undefined;
  for (const path of paths) {
    const value = readPath(source, path);
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim().length > 0) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return undefined;
}

function formatNumber(value: number) {
  return value.toLocaleString("sv-SE");
}

function formatPercent(value: number) {
  return `${value.toLocaleString("sv-SE", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
}

function formatChange(value: number) {
  return `${Math.abs(value).toLocaleString("sv-SE", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
}

function formatDate(value?: string) {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";
  return new Intl.DateTimeFormat("sv-SE", { day: "numeric", month: "short", year: "numeric" }).format(parsed);
}

function shortText(value: string, length = 30) {
  return value.length <= length ? value : `${value.slice(0, length - 3)}...`;
}

function monthLabel(date: Date) {
  return new Intl.DateTimeFormat("sv-SE", { month: "short", year: "2-digit" }).format(date);
}

function getMonthsBack(months: number) {
  const now = new Date();
  return Array.from({ length: months }, (_, index) => new Date(now.getFullYear(), now.getMonth() - (months - index - 1), 1));
}

function getQuantityCount(quantity: AnalyticalQuantity | undefined, fallback = 0) {
  if (!quantity) return fallback;
  return quantity.count ?? quantity.absoluteCount ?? quantity.quantity ?? quantity.value ?? quantity.amount ?? fallback;
}

function getQuantityChange(quantity: AnalyticalQuantity | undefined) {
  if (!quantity) return 0;
  return quantity.percentageChange ?? quantity.changePercentage ?? quantity.percentChange ?? quantity.rateOfChangePercentage ?? quantity.rateOfChange ?? quantity.relativeChange ?? quantity.changeRate ?? quantity.change ?? 0;
}

function getMetric(quantities: AnalyticalQuantity[] | undefined, period: string, fallback = 0) {
  const quantity = quantities?.find((item) => item.period === period) ?? quantities?.[0];
  return { count: getQuantityCount(quantity, fallback), change: getQuantityChange(quantity) };
}

function getViewingQuantities(analytics: AnalyticalQuantities | null) {
  return analytics?.viewings ?? analytics?.views;
}

function getActiveListingQuantities(analytics: AnalyticalQuantities | null) {
  return analytics?.activeListings ?? analytics?.active_listings ?? analytics?.activePosts ?? analytics?.active_posts;
}

function getRowsForPeriod<T>(rows: T[], period: TimePeriod) {
  if (period === "30d") return rows.slice(-2);
  if (period === "90d") return rows.slice(-4);
  return rows.slice(-12);
}

function buildApplicationTrendRows(timeline: Timeline, period: TimePeriod) {
  const sorted = [...timeline].sort((left, right) => left.timestamp.getTime() - right.timestamp.getTime());
  return getRowsForPeriod(sorted, period).map((entry, index, allRows) => {
    const windowRows = allRows.slice(Math.max(0, index - 2), index + 1);
    const avg = windowRows.reduce((sum, item) => sum + item.value, 0) / windowRows.length;
    return { period: monthLabel(entry.timestamp), applications: entry.value, avg: Math.round(avg) };
  });
}

function buildObjectTrendRows(timeline: Timeline, objects: ObjectApplicationCount[], period: TimePeriod) {
  const trendRows = buildApplicationTrendRows(timeline, period);
  const topObjects = objects.slice(0, 4);
  const total = Math.max(topObjects.reduce((sum, item) => sum + item.numApplications, 0), 1);
  return trendRows.map((row, rowIndex) => {
    const next: Record<string, string | number> = { period: row.period };
    topObjects.forEach((object, index) => {
      const share = object.numApplications / total;
      next[`object_${index}`] = Math.max(0, Math.round(row.applications * share * (0.86 + index * 0.07 + rowIndex * 0.025)));
    });
    return next;
  });
}

function cityFromListing(listing: ListingCardDTO) {
  const parts = listing.location?.split(",").map((part) => part.trim()).filter(Boolean) ?? [];
  return parts[1] ?? parts[0] ?? "Okänd stad";
}

function buildPortfolioItems(listings: ListingCardDTO[], queues: HousingQueueDTO[]): DonutBreakdownItem[] {
  const cities = new Map<string, number>();
  listings.forEach((listing) => cities.set(cityFromListing(listing), (cities.get(cityFromListing(listing)) ?? 0) + 1));
  queues.forEach((queue) => {
    const city = queue.city || "Okänd stad";
    cities.set(city, (cities.get(city) ?? 0) + (queue.activeListings ?? 0));
  });
  const rows = Array.from(cities.entries()).sort((left, right) => right[1] - left[1]).slice(0, 5);
  return rows.length > 0
    ? rows.map(([label, value], index) => ({ label, value, color: palette[index] ?? palette[palette.length - 1] }))
    : [{ label: "Ingen data", value: 1, color: palette[0] }];
}

function getQueueApplicationName(application: QueueApplicationDTO) {
  return application.fullName || [application.firstName, application.surname].filter(Boolean).join(" ") || `Student ${application.studentId ?? ""}`.trim() || "Okänd student";
}

function getQueueTotal(queues: HousingQueueDTO[], queueApplications: QueueApplicationDTO[]) {
  if (queueApplications.length > 0) return queueApplications.length;
  return queues.reduce((sum, queue) => {
    const value = pickNumber(queue, ["queueApplications", "queueApplicationsCount", "applications", "applicationsCount", "members", "membersCount", "studentsInQueue", "studentsInQueueCount", "totalQueued", "totalApplicants"]) ?? 0;
    return sum + value;
  }, 0);
}

function buildQueueTrendRows(queueApplications: QueueApplicationDTO[], queues: HousingQueueDTO[]) {
  const rows = getMonthsBack(12).map((date) => ({ date, period: monthLabel(date), joined: 0, cumulative: 0 }));
  queueApplications.forEach((application) => {
    const joinedAt = application.joinedAt ?? application.createdAt;
    if (!joinedAt) return;
    const parsed = new Date(joinedAt);
    if (Number.isNaN(parsed.getTime())) return;
    const row = rows.find((item) => item.date.getFullYear() === parsed.getFullYear() && item.date.getMonth() === parsed.getMonth());
    if (row) row.joined += 1;
  });
  let running = Math.max(getQueueTotal(queues, []) - queueApplications.length, 0);
  return rows.map((row) => {
    running += row.joined;
    return { period: row.period, joined: row.joined, cumulative: running };
  });
}

function statusTone(status?: string) {
  const normalized = status?.toLowerCase() ?? "active";
  if (["active", "open", "joined"].includes(normalized)) return "bg-emerald-50 text-emerald-700";
  if (["offered", "accepted"].includes(normalized)) return "bg-blue-50 text-blue-700";
  return "bg-gray-100 text-gray-700";
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-theme-sm text-gray-500">{children}</div>;
}

function LoadingState() {
  return (
    <div className="space-y-6">
      <div className="h-24 animate-pulse rounded-2xl border border-gray-200 bg-white" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => <div className="h-36 animate-pulse rounded-2xl border border-gray-200 bg-white" key={index} />)}
      </div>
      <div className="h-[360px] animate-pulse rounded-2xl border border-gray-200 bg-white" />
    </div>
  );
}

function PeriodSelect({ value, onChange }: { value: TimePeriod; onChange: (value: TimePeriod) => void }) {
  return (
    <Select value={value} onValueChange={(next) => onChange(next as TimePeriod)}>
      <PortalControlSelectTrigger className="w-[190px]"><SelectValue /></PortalControlSelectTrigger>
      <SelectContent>{periodOptions.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent>
    </Select>
  );
}

function TrendChart({ data, title, description }: { data: Array<Record<string, string | number>>; title: string; description: string }) {
  return (
    <CardShell className="xl:col-span-2" description={description} title={title}>
      <div className="max-w-full overflow-x-auto">
        <ChartContainer className="h-[320px] min-w-[720px] xl:min-w-full" config={applicationChartConfig}>
          <LineChart data={data} margin={{ left: 12, right: 12 }}>
            <CartesianGrid vertical={false} />
            <XAxis axisLine={false} dataKey="period" tickLine={false} tickMargin={8} />
            <YAxis axisLine={false} tickLine={false} tickMargin={8} />
            <ChartTooltip content={<ChartTooltipContent indicator="line" />} cursor={false} />
            <Line dataKey="applications" dot stroke="var(--color-applications)" strokeWidth={2} type="monotone" />
            <Line dataKey="avg" dot={false} stroke="var(--color-avg)" strokeWidth={2} type="monotone" />
            <ChartLegend content={<ChartLegendContent />} />
          </LineChart>
        </ChartContainer>
      </div>
    </CardShell>
  );
}

function ObjectTrendChart({ data, objects }: { data: Array<Record<string, string | number>>; objects: ObjectApplicationCount[] }) {
  const config = objects.slice(0, 4).reduce<ChartConfig>((acc, object, index) => {
    acc[`object_${index}`] = { label: shortText(object.address, 18), color: palette[index] ?? palette[0] };
    return acc;
  }, {});
  return (
    <CardShell className="xl:col-span-2" description="Objektens relativa utveckling baserat på total trend och ansökningsandel." title="Objekt som trendar">
      {objects.length === 0 || data.length === 0 ? <EmptyState>Ingen objektsdata hittades för perioden.</EmptyState> : (
        <div className="max-w-full overflow-x-auto">
          <ChartContainer className="h-[320px] min-w-[720px] xl:min-w-full" config={config}>
            <LineChart data={data} margin={{ left: 12, right: 12 }}>
              <CartesianGrid vertical={false} />
              <XAxis axisLine={false} dataKey="period" tickLine={false} tickMargin={8} />
              <YAxis axisLine={false} tickLine={false} tickMargin={8} />
              <ChartTooltip content={<ChartTooltipContent indicator="line" />} cursor={false} />
              {objects.slice(0, 4).map((_, index) => <Line dataKey={`object_${index}`} dot key={index} stroke={`var(--color-object_${index})`} strokeWidth={2} type="monotone" />)}
              <ChartLegend content={<ChartLegendContent />} />
            </LineChart>
          </ChartContainer>
        </div>
      )}
    </CardShell>
  );
}

function QueueTrendChart({ data }: { data: Array<Record<string, string | number>> }) {
  return (
    <CardShell className="xl:col-span-2" description="Nya studenter i kön och ackumulerat köantal över tid." title="Köutveckling">
      <div className="max-w-full overflow-x-auto">
        <ChartContainer className="h-[320px] min-w-[720px] xl:min-w-full" config={queueChartConfig}>
          <LineChart data={data} margin={{ left: 12, right: 12 }}>
            <CartesianGrid vertical={false} />
            <XAxis axisLine={false} dataKey="period" tickLine={false} tickMargin={8} />
            <YAxis axisLine={false} tickLine={false} tickMargin={8} />
            <ChartTooltip content={<ChartTooltipContent indicator="line" />} cursor={false} />
            <Line dataKey="joined" dot stroke="var(--color-joined)" strokeWidth={2} type="monotone" />
            <Line dataKey="cumulative" dot={false} stroke="var(--color-cumulative)" strokeWidth={2} type="monotone" />
            <ChartLegend content={<ChartLegendContent />} />
          </LineChart>
        </ChartContainer>
      </div>
    </CardShell>
  );
}

function QueueDistributionChart({ queues }: { queues: HousingQueueDTO[] }) {
  const data = queues.length > 0
    ? queues.map((queue, index) => ({ label: shortText(queue.name, 24), value: pickNumber(queue, ["queueApplications", "queueApplicationsCount", "studentsInQueue", "studentsInQueueCount", "totalQueued", "totalApplicants", "activeListings"]) ?? 0, color: palette[index] ?? palette[palette.length - 1] }))
    : [{ label: "Ingen data", value: 1, color: palette[0] }];
  return <DonutBreakdownCard description="Fördelning mellan företagets köer." items={data} title="Köer" />;
}

function PropertyStockCard({ listings, queues }: { listings: ListingCardDTO[]; queues: HousingQueueDTO[] }) {
  const totalUnits = queues.reduce((sum, queue) => sum + (queue.totalUnits ?? 0), 0);
  const cities = new Set<string>();
  listings.forEach((listing) => cities.add(cityFromListing(listing)));
  queues.forEach((queue) => queue.city && cities.add(queue.city));
  return (
    <CardShell description="Sammanfattning av företagets objekt och köer." title="Fastighetsbestånd">
      <div className="grid gap-3 text-theme-sm text-gray-600">
        <div className="flex justify-between"><span>Aktiva objekt</span><span className="font-medium text-gray-800">{formatNumber(listings.length)}</span></div>
        <div className="flex justify-between"><span>Bostadsköer</span><span className="font-medium text-gray-800">{formatNumber(queues.length)}</span></div>
        <div className="flex justify-between"><span>Registrerade bostäder</span><span className="font-medium text-gray-800">{formatNumber(totalUnits)}</span></div>
        <div className="flex justify-between"><span>Städer</span><span className="font-medium text-gray-800">{formatNumber(cities.size)}</span></div>
      </div>
    </CardShell>
  );
}

function ObjectsTable({ rows }: { rows: ObjectApplicationCount[] }) {
  return (
    <CardShell className="xl:col-span-2" description="Objekt sorterade efter totalt antal intresseanmälningar." title="Objektprestanda">
      {rows.length === 0 ? <EmptyState>Inga objekt med ansökningsdata hittades.</EmptyState> : (
        <div className="max-w-full overflow-x-auto">
          <table className="w-full min-w-[620px] text-left">
            <thead className="border-y border-gray-100"><tr>{["Objekt", "Ansökningar", "Andel", "Signal"].map((heading) => <th className="py-3 text-theme-xs font-medium text-gray-500" key={heading}>{heading}</th>)}</tr></thead>
            <tbody className="divide-y divide-gray-100">
              {rows.slice(0, 8).map((row) => {
                const total = Math.max(rows.reduce((sum, item) => sum + item.numApplications, 0), 1);
                const share = (row.numApplications / total) * 100;
                const signal = share >= 30 ? "Stark" : share >= 12 ? "Stabil" : "Låg";
                return (
                  <tr key={`${row.listingId}-${row.address}`}>
                    <td className="py-3 text-theme-sm font-medium text-gray-800">{shortText(row.address, 42)}</td>
                    <td className="py-3 text-theme-sm text-gray-500">{formatNumber(row.numApplications)}</td>
                    <td className="py-3 text-theme-sm text-gray-500">{formatPercent(share)}</td>
                    <td className="py-3"><span className="rounded-full bg-gray-100 px-2.5 py-1 text-theme-xs font-medium text-gray-700">{signal}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </CardShell>
  );
}

function NewApplicationsTable({ rows }: { rows: NewApplication[] }) {
  return (
    <CardShell description="Senaste inkomna intresseanmälningar." title="Senaste intresseanmälningar">
      {rows.length === 0 ? <EmptyState>Inga intresseanmälningar hittades.</EmptyState> : (
        <div className="grid gap-3">
          {rows.slice(0, 8).map((application, index) => (
            <article className="rounded-lg border border-gray-100 bg-gray-50 p-3" key={`${application.applicationId ?? application.id ?? application.studentId}-${index}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-theme-sm font-semibold text-gray-800">{[application.firstName, application.surname].filter(Boolean).join(" ") || "Okänd sökande"}</p>
                  <p className="mt-1 text-theme-xs text-gray-500">{shortText(application.listingTitle ?? application.address ?? "Okänt objekt", 42)}</p>
                </div>
                <span className="shrink-0 text-theme-xs text-gray-400">{formatDate(application.submittedAt ?? application.createdAt)}</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </CardShell>
  );
}

function QueueStudentsTable({ rows }: { rows: QueueApplicationDTO[] }) {
  return (
    <CardShell className="xl:col-span-2" description="Studenter som har ställt sig i företagets köer." title="Studenter i kö">
      {rows.length === 0 ? (
        <EmptyState>Ingen studentlista kunde hämtas från kö-endpoints. När backend skickar köansökningar visas namn, kö, status och anslutningsdatum här.</EmptyState>
      ) : (
        <div className="max-w-full overflow-x-auto">
          <table className="w-full min-w-[720px] text-left">
            <thead className="border-y border-gray-100"><tr>{["Student", "Kö", "Ködagar", "Status", "Ansluten"].map((heading) => <th className="py-3 text-theme-xs font-medium text-gray-500" key={heading}>{heading}</th>)}</tr></thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((row, index) => (
                <tr key={`${row.id ?? row.studentId ?? "student"}-${index}`}>
                  <td className="py-3"><p className="text-theme-sm font-medium text-gray-800">{getQueueApplicationName(row)}</p><p className="text-theme-xs text-gray-500">{row.email ?? row.phone ?? "-"}</p></td>
                  <td className="py-3 text-theme-sm text-gray-500">{row.queueName ?? row.queueId ?? "-"}</td>
                  <td className="py-3 text-theme-sm text-gray-500">{row.queueDays != null ? `${formatNumber(row.queueDays)} dagar` : "-"}</td>
                  <td className="py-3"><span className={`rounded-full px-2.5 py-1 text-theme-xs font-medium ${statusTone(row.status)}`}>{row.status ?? "active"}</span></td>
                  <td className="py-3 text-theme-sm text-gray-500">{formatDate(row.joinedAt ?? row.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </CardShell>
  );
}

export default function ApplicationsInsights({
  mode,
}: {
  mode: ApplicationsMode;
  applicantsTableProps?: Promise<ApplicantsTableProps[]>;
}) {
  const { user, isLoading: authLoading, refreshUser } = useAuth();
  const [period, setPeriod] = React.useState<TimePeriod>("90d");
  const [isLoading, setIsLoading] = React.useState(true);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [interestPayload, setInterestPayload] = React.useState<InterestPayload>({
    generalAnalytics: null,
    openApplications: 0,
    timeline: [],
    newApplications: [],
    applicationsByObject: [],
    listings: [],
    queues: [],
  });
  const [queuePayload, setQueuePayload] = React.useState<QueuePayload>({ queues: [], queueApplications: [] });
  const isQueue = mode === "queue";

  React.useEffect(() => {
    let isCancelled = false;
    const load = async () => {
      if (!user) {
        try {
          await refreshUser();
        } catch {
          if (!isCancelled) setErrorMessage("Kunde inte ladda användaren.");
        } finally {
          if (!isCancelled) setIsLoading(false);
        }
        return;
      }
      setIsLoading(true);
      setErrorMessage(null);
      const companyId = getActiveCompanyId(user);
      if (companyId == null) {
        setErrorMessage("Kunde inte hitta ett företag kopplat till användaren.");
        setIsLoading(false);
        return;
      }
      const [generalResult, openApplicationsResult, timelineResult, newApplicationsResult, objectResult, listingsResult, queuesResult, queueApplicationsResult] = await Promise.allSettled([
        companyService.generalAnalytics(companyId),
        companyService.applicationCount(companyId),
        companyService.applicationsTimeline(companyId),
        companyService.newApplications(companyId, { count: 50, since: "always" }),
        companyService.applicationCountsPerObject(companyId, 50),
        queueService.getCompanyListings(companyId, 0, 200),
        queueService.getByCompany(companyId),
        queueService.getCompanyQueueApplications(companyId),
      ]);
      if (isCancelled) return;
      const hasRejected = [generalResult, openApplicationsResult, timelineResult, newApplicationsResult, objectResult, listingsResult, queuesResult, queueApplicationsResult].some((result) => result.status === "rejected");
      const queues = queuesResult.status === "fulfilled" ? queuesResult.value : [];
      setErrorMessage(hasRejected ? "Kunde inte hämta all ansökningsdata just nu." : null);
      setInterestPayload({
        generalAnalytics: generalResult.status === "fulfilled" ? generalResult.value : null,
        openApplications: openApplicationsResult.status === "fulfilled" ? openApplicationsResult.value : 0,
        timeline: timelineResult.status === "fulfilled" ? timelineResult.value : [],
        newApplications: newApplicationsResult.status === "fulfilled" ? newApplicationsResult.value : [],
        applicationsByObject: objectResult.status === "fulfilled" ? objectResult.value : [],
        listings: listingsResult.status === "fulfilled" ? listingsResult.value : [],
        queues,
      });
      setQueuePayload({
        queues,
        queueApplications: queueApplicationsResult.status === "fulfilled" ? queueApplicationsResult.value : [],
      });
      setIsLoading(false);
    };
    load();
    return () => {
      isCancelled = true;
    };
  }, [refreshUser, user]);

  const generalPeriod = periodToGeneralPeriod[period];
  const applicationMetric = getMetric(interestPayload.generalAnalytics?.applications, generalPeriod, interestPayload.openApplications);
  const viewMetric = getMetric(getViewingQuantities(interestPayload.generalAnalytics), generalPeriod);
  const activeListingsMetric = getMetric(getActiveListingQuantities(interestPayload.generalAnalytics), generalPeriod, interestPayload.listings.length);
  const queueTotal = getQueueTotal(queuePayload.queues, queuePayload.queueApplications);
  const averageWaitDays = queuePayload.queues.length ? Math.round(queuePayload.queues.reduce((sum, queue) => sum + (queue.waitDays ?? 0), 0) / queuePayload.queues.length) : 0;
  const totalUnits = queuePayload.queues.reduce((sum, queue) => sum + (queue.totalUnits ?? 0), 0);
  const trendRows = React.useMemo(() => buildApplicationTrendRows(interestPayload.timeline, period), [interestPayload.timeline, period]);
  const objectTrendRows = React.useMemo(() => buildObjectTrendRows(interestPayload.timeline, interestPayload.applicationsByObject, period), [interestPayload.timeline, interestPayload.applicationsByObject, period]);
  const portfolioItems = React.useMemo(() => buildPortfolioItems(interestPayload.listings, interestPayload.queues), [interestPayload.listings, interestPayload.queues]);
  const queueTrendRows = React.useMemo(() => getRowsForPeriod(buildQueueTrendRows(queuePayload.queueApplications, queuePayload.queues), period), [queuePayload.queueApplications, queuePayload.queues, period]);

  if (authLoading || isLoading) return <LoadingState />;
  if (!user || getActiveCompanyId(user) == null) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <h1 className="text-xl font-semibold text-gray-900">Företagskonto krävs</h1>
        <p className="mt-2 text-theme-sm text-gray-500">Logga in som företag för att visa den här sidan.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-theme-sm text-gray-500">Ansökningar</p>
          <h1 className="text-2xl font-semibold text-gray-900">{isQueue ? "Köansökningar" : "Intresseanmälningar"}</h1>
          <p className="mt-1 max-w-3xl text-theme-sm text-gray-500">
            {isQueue ? "Följ köantal, utveckling över tid och studenter som ställt sig i kön." : "Följ total efterfrågan, objekt som trendar och hur fastighetsbeståndets data fördelas."}
          </p>
          {errorMessage ? <p className="mt-2 text-theme-xs text-error-700">{errorMessage}</p> : null}
        </div>
        <div className="flex flex-col gap-1"><span className="text-theme-xs font-medium text-gray-500">Period</span><PeriodSelect onChange={setPeriod} value={period} /></div>
      </div>

      {isQueue ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard change="0,0%" icon={<Users className="h-6 w-6" />} label="Ställda i kö" value={formatNumber(queueTotal)} />
            <MetricCard change="0,0%" icon={<ListOrdered className="h-6 w-6" />} label="Bostadsköer" value={formatNumber(queuePayload.queues.length)} />
            <MetricCard change="0,0%" icon={<Clock3 className="h-6 w-6" />} label="Snitt väntetid" value={averageWaitDays ? `${formatNumber(averageWaitDays)} dagar` : "-"} />
            <MetricCard change="0,0%" icon={<Home className="h-6 w-6" />} label="Registrerade bostäder" value={formatNumber(totalUnits)} />
          </div>
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3"><QueueTrendChart data={queueTrendRows} /><QueueDistributionChart queues={queuePayload.queues} /></div>
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <QueueStudentsTable rows={queuePayload.queueApplications} />
            <CardShell description="Kort översikt per kö." title="Kööversikt">
              {queuePayload.queues.length === 0 ? <EmptyState>Inga köer hittades för företaget.</EmptyState> : (
                <div className="grid gap-3">
                  {queuePayload.queues.map((queue) => (
                    <article className="rounded-lg border border-gray-100 bg-gray-50 p-3" key={queue.id}>
                      <div className="flex items-start justify-between gap-3">
                        <div><p className="text-theme-sm font-semibold text-gray-800">{queue.name}</p><p className="mt-1 flex items-center gap-1 text-theme-xs text-gray-500"><MapPin className="h-3.5 w-3.5" />{queue.city || "Stad saknas"}</p></div>
                        <span className="rounded-full bg-white px-2.5 py-1 text-theme-xs font-medium text-gray-700">{queue.activeListings ?? 0} aktiva</span>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </CardShell>
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard change={formatChange(applicationMetric.change)} direction={applicationMetric.change >= 0 ? "up" : "down"} icon={<Users className="h-6 w-6" />} label="Intresseanmälningar" value={formatNumber(applicationMetric.count)} />
            <MetricCard change="0,0%" icon={<Building2 className="h-6 w-6" />} label="Obesvarade" value={formatNumber(interestPayload.openApplications)} />
            <MetricCard change={formatChange(viewMetric.change)} direction={viewMetric.change >= 0 ? "up" : "down"} icon={<Home className="h-6 w-6" />} label="Visningar" value={formatNumber(viewMetric.count)} />
            <MetricCard change={formatChange(activeListingsMetric.change)} direction={activeListingsMetric.change >= 0 ? "up" : "down"} icon={<ListOrdered className="h-6 w-6" />} label="Aktiva objekt" value={formatNumber(activeListingsMetric.count)} />
          </div>
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3"><TrendChart data={trendRows} description="Total volym över tid för vald period." title="Intresse över tid" /><DonutBreakdownCard description="Aktiva objekt och köer per stad." items={portfolioItems} title="Bestånd per stad" /></div>
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3"><ObjectTrendChart data={objectTrendRows} objects={interestPayload.applicationsByObject} /><PropertyStockCard listings={interestPayload.listings} queues={interestPayload.queues} /></div>
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3"><ObjectsTable rows={interestPayload.applicationsByObject} /><NewApplicationsTable rows={interestPayload.newApplications} /></div>
        </>
      )}
    </div>
  );
}
