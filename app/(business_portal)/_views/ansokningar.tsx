"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  FileUser,
  Home,
  TrendingUp,
} from "lucide-react";
import { AnalyticsBlock, AnalyticsGrid } from "@/components/analytics/AnalyticsBlocks";
import {
  TrendBarChart,
  type TrendBarChartPoint,
} from "@/components/analytics/TrendBarChart";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";
import { getActiveCompanyId } from "@/lib/company-access";
import { cn } from "@/lib/utils";
import { companyService, type NewApplication } from "@/services/company";
import { dashboardRelPath } from "../_statics/variables";

export type ApplicationsMode = "interest" | "queue";

type AnsokningarProps = {
  listingId?: string | null;
  mode?: ApplicationsMode;
};

type PortalApplication = NewApplication & {
  rowId: string;
  listingName: string;
  submittedAtLabel: string;
  submittedAtTime: number;
  statusLabel: string;
  statusTone: "neutral" | "success" | "warning" | "danger" | "info";
};

type ListingApplicationGroup = {
  key: string;
  listingId?: string | number;
  title: string;
  address: string;
  city?: string;
  rent?: number;
  imageUrl?: string;
  applications: PortalApplication[];
  total: number;
  firstSubmittedAt: number;
  lastSubmittedAt: number;
  trend: TrendBarChartPoint[];
};

const dayFormatter = new Intl.DateTimeFormat("sv-SE", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const monthFormatter = new Intl.DateTimeFormat("sv-SE", {
  month: "short",
});

function formatDate(value?: string) {
  if (!value) return "-";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";

  return dayFormatter.format(parsed);
}

function formatTimestamp(value: number) {
  if (!Number.isFinite(value) || value <= 0) return "-";
  return dayFormatter.format(new Date(value));
}

function parseDate(value?: string) {
  if (!value) return 0;

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
}

function parseApplicationDate(application: NewApplication) {
  const timestamp = parseDate(application.submittedAt ?? application.createdAt);
  return timestamp > 0 ? new Date(timestamp) : null;
}

function normalizeStatus(status?: string): {
  label: string;
  tone: PortalApplication["statusTone"];
} {
  const normalized = status?.trim().toLowerCase() ?? "";

  if (["accepted", "approved", "antagen", "offer_accepted"].includes(normalized)) {
    return { label: "Antagen", tone: "success" };
  }

  if (["rejected", "denied", "declined", "nekad", "offer_rejected"].includes(normalized)) {
    return { label: "Nekad", tone: "danger" };
  }

  if (["offer", "offered", "erbjudande", "pending_offer"].includes(normalized)) {
    return { label: "Erbjudande", tone: "info" };
  }

  if (["processing", "in_progress", "bearbetas"].includes(normalized)) {
    return { label: "Bearbetas", tone: "warning" };
  }

  return { label: "Under granskning", tone: "neutral" };
}

function toPortalApplication(
  application: NewApplication,
  index: number
): PortalApplication {
  const submittedAt = application.submittedAt ?? application.createdAt;
  const status = normalizeStatus(application.status);

  return {
    ...application,
    rowId: String(
      application.applicationId ??
        application.id ??
        `${application.listingId ?? "application"}-${submittedAt ?? index}`
    ),
    listingName: application.listingTitle || application.address || "Okänd annons",
    submittedAtLabel: formatDate(submittedAt),
    submittedAtTime: parseDate(submittedAt),
    statusLabel: status.label,
    statusTone: status.tone,
  };
}

function statusClassName(tone: PortalApplication["statusTone"]) {
  switch (tone) {
    case "success":
      return "bg-emerald-50 text-emerald-700 ring-emerald-200";
    case "warning":
      return "bg-amber-50 text-amber-700 ring-amber-200";
    case "danger":
      return "bg-red-50 text-red-700 ring-red-200";
    case "info":
      return "bg-blue-50 text-blue-700 ring-blue-200";
    default:
      return "bg-gray-50 text-gray-700 ring-gray-200";
  }
}

function getMonthStart(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function getMonthKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}`;
}

function buildMonthlyTrend(
  applications: PortalApplication[],
  minimumMonths: number
): TrendBarChartPoint[] {
  const countsByMonth = new Map<string, number>();
  const dates = applications
    .map(parseApplicationDate)
    .filter((date): date is Date => date !== null)
    .sort((a, b) => a.getTime() - b.getTime());

  if (dates.length === 0) {
    return [];
  }

  dates.forEach((date) => {
    const key = getMonthKey(date);
    countsByMonth.set(key, (countsByMonth.get(key) ?? 0) + 1);
  });

  const earliestMonth = getMonthStart(dates[0]);
  const latestMonth = getMonthStart(new Date());
  const defaultStart = new Date(
    latestMonth.getFullYear(),
    latestMonth.getMonth() - minimumMonths + 1,
    1
  );
  const startMonth =
    earliestMonth.getTime() < defaultStart.getTime() ? earliestMonth : defaultStart;
  const points: TrendBarChartPoint[] = [];

  for (
    let cursor = new Date(startMonth);
    cursor.getTime() <= latestMonth.getTime();
    cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1)
  ) {
    points.push({
      timestamp: new Date(cursor),
      value: countsByMonth.get(getMonthKey(cursor)) ?? 0,
    });
  }

  return points;
}

function getListingGroupKey(application: PortalApplication) {
  if (application.listingId != null) {
    return String(application.listingId);
  }

  return [
    application.listingTitle,
    application.address,
    application.listingCity,
  ]
    .filter(Boolean)
    .join("|") || application.listingName;
}

function buildListingGroups(
  applications: PortalApplication[]
): ListingApplicationGroup[] {
  const grouped = new Map<string, PortalApplication[]>();

  applications.forEach((application) => {
    const key = getListingGroupKey(application);
    grouped.set(key, [...(grouped.get(key) ?? []), application]);
  });

  return Array.from(grouped.entries())
    .map(([key, rows]) => {
      const sortedRows = [...rows].sort(
        (a, b) => b.submittedAtTime - a.submittedAtTime
      );
      const first = sortedRows[sortedRows.length - 1];
      const latest = sortedRows[0];

      return {
        key,
        listingId: latest.listingId,
        title: latest.listingTitle || latest.address || "Okänd annons",
        address: latest.address || latest.listingCity || "Ingen adress",
        city: latest.listingCity,
        rent: latest.listingRent,
        imageUrl: latest.listingImage,
        applications: sortedRows,
        total: sortedRows.length,
        firstSubmittedAt: first?.submittedAtTime ?? 0,
        lastSubmittedAt: latest?.submittedAtTime ?? 0,
        trend: buildMonthlyTrend(sortedRows, 6),
      };
    })
    .sort((a, b) => {
      if (b.total !== a.total) return b.total - a.total;
      return b.lastSubmittedAt - a.lastSubmittedAt;
    });
}

function getRecentCount(applications: PortalApplication[], start: Date, end: Date) {
  return applications.filter((application) => {
    const timestamp = application.submittedAtTime;
    return timestamp >= start.getTime() && timestamp < end.getTime();
  }).length;
}

function formatPercentChange(current: number, previous: number) {
  if (previous === 0) {
    return current > 0 ? "+100%" : null;
  }

  const change = ((current - previous) / previous) * 100;
  const prefix = change > 0 ? "+" : "";

  return `${prefix}${change.toLocaleString("sv-SE", {
    maximumFractionDigits: 1,
  })}%`;
}

function formatRent(value?: number) {
  return typeof value === "number" && Number.isFinite(value)
    ? `${value.toLocaleString("sv-SE")} kr/mån`
    : null;
}

function buildApplicationDateCounts(applications: PortalApplication[]) {
  const countsByDate = new Map<
    string,
    { label: string; count: number; timestamp: number }
  >();

  applications.forEach((application) => {
    const timestamp = application.submittedAtTime;
    if (!Number.isFinite(timestamp) || timestamp <= 0) return;

    const date = new Date(timestamp);
    const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    const existing = countsByDate.get(key);

    countsByDate.set(key, {
      label: application.submittedAtLabel,
      count: (existing?.count ?? 0) + 1,
      timestamp: Math.max(existing?.timestamp ?? 0, timestamp),
    });
  });

  return Array.from(countsByDate.values()).sort(
    (a, b) => b.timestamp - a.timestamp
  );
}

function StatTile({
  label,
  value,
  detail,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  detail?: string | null;
  icon: React.ComponentType<{ className?: string }>;
  tone: "brand" | "blue" | "rose" | "amber";
}) {
  const toneClass = {
    brand: "border-brand-100 bg-brand-25/70 text-brand-600",
    blue: "border-sky-100 bg-sky-50/70 text-sky-600",
    rose: "border-rose-100 bg-rose-50/70 text-rose-600",
    amber: "border-amber-100 bg-amber-50/70 text-amber-600",
  }[tone];

  return (
    <div className={cn("min-w-0 rounded-xl border p-4", toneClass)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/70 bg-white shadow-[0_8px_20px_rgba(16,24,40,0.06)]">
          <Icon className="h-5 w-5" />
        </div>
        {detail ? (
          <span className="truncate rounded-full border border-white/80 bg-white/80 px-2 py-1 text-[11px] font-semibold text-gray-600">
            {detail}
          </span>
        ) : null}
      </div>
      <p className="mt-4 truncate text-[13px] font-medium leading-5 text-gray-500">
        {label}
      </p>
      <p className="mt-1 truncate text-[28px] font-semibold leading-8 tracking-normal text-gray-950 tabular-nums">
        {value}
      </p>
    </div>
  );
}

function ApplicationStatsGrid({
  applications,
  groups,
}: {
  applications: PortalApplication[];
  groups: ListingApplicationGroup[];
}) {
  const now = new Date();
  const currentStart = new Date(now);
  currentStart.setDate(currentStart.getDate() - 30);
  const previousStart = new Date(now);
  previousStart.setDate(previousStart.getDate() - 60);
  const current30 = getRecentCount(applications, currentStart, now);
  const previous30 = getRecentCount(applications, previousStart, currentStart);
  const average = groups.length > 0 ? applications.length / groups.length : 0;

  return (
    <div className="grid h-full min-w-0 grid-cols-1 gap-3 min-[520px]:grid-cols-2 xl:grid-cols-4">
      <StatTile
        detail="alla öppna"
        icon={FileUser}
        label="Totalt antal ansökningar"
        tone="brand"
        value={applications.length.toLocaleString("sv-SE")}
      />
      <StatTile
        detail="med ansökningar"
        icon={Home}
        label="Annonser"
        tone="blue"
        value={groups.length.toLocaleString("sv-SE")}
      />
      <StatTile
        detail={formatPercentChange(current30, previous30) ?? "oför."}
        icon={CalendarDays}
        label="Senaste 30 dagar"
        tone="rose"
        value={current30.toLocaleString("sv-SE")}
      />
      <StatTile
        detail="per annons"
        icon={BarChart3}
        label="Snittansökningar"
        tone="amber"
        value={average.toLocaleString("sv-SE", {
          maximumFractionDigits: 1,
        })}
      />
    </div>
  );
}

function LoadingDashboard() {
  return (
    <AnalyticsGrid>
      <AnalyticsBlock size="1x4">
        <div className="grid h-full min-w-0 grid-cols-1 gap-3 min-[520px]:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton className="h-full min-h-[120px] rounded-xl" key={index} />
          ))}
        </div>
      </AnalyticsBlock>
      <AnalyticsBlock size="2x2" title="Ansökningar över tid">
        <Skeleton className="h-full min-h-[220px] rounded-md" />
      </AnalyticsBlock>
      <AnalyticsBlock size="2x2" title="Trending annonser">
        <Skeleton className="h-full min-h-[220px] rounded-md" />
      </AnalyticsBlock>
    </AnalyticsGrid>
  );
}

function MiniTrendBars({ data }: { data: TrendBarChartPoint[] }) {
  const visibleData = data.slice(-6);
  const maxValue = Math.max(1, ...visibleData.map((point) => point.value));

  if (visibleData.length === 0) {
    return (
      <div className="flex h-16 items-center justify-center rounded-md border border-dashed border-gray-200 text-xs text-gray-400">
        Ingen tidsdata
      </div>
    );
  }

  return (
    <div className="grid h-16 grid-cols-6 items-end gap-1">
      {visibleData.map((point) => {
        const date =
          point.timestamp instanceof Date
            ? point.timestamp
            : new Date(point.timestamp);
        const height = Math.max(8, (point.value / maxValue) * 56);

        return (
          <div
            className="flex h-16 min-w-0 flex-col justify-end gap-1"
            key={String(point.timestamp)}
          >
            <div
              className="rounded-t bg-brand-500/80"
              style={{ height }}
              title={`${monthFormatter.format(date)}: ${point.value} ansökningar`}
            />
            <span className="truncate text-center text-[10px] leading-none text-gray-400">
              {monthFormatter.format(date).replace(".", "")}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function TrendingListings({ groups }: { groups: ListingApplicationGroup[] }) {
  const topGroups = groups.slice(0, 5);

  if (topGroups.length === 0) {
    return (
      <div className="flex h-full items-center justify-center rounded-md border border-dashed border-gray-200 px-4 text-center text-sm text-gray-500">
        Det finns inga annonser med ansökningar ännu.
      </div>
    );
  }

  return (
    <div className="space-y-3 overflow-y-auto pr-1">
      {topGroups.map((group, index) => (
        <ListingRankingRow group={group} index={index} key={group.key} />
      ))}
    </div>
  );
}

function ListingRankingRow({
  group,
  index,
}: {
  group: ListingApplicationGroup;
  index: number;
}) {
  const href =
    group.listingId != null
      ? `${dashboardRelPath}/annonser/${encodeURIComponent(String(group.listingId))}`
      : null;
  const content = (
    <div className="flex min-w-0 items-center gap-3 rounded-xl border border-gray-100 bg-white p-3 shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition hover:border-brand-100 hover:bg-brand-25/40">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-50 text-sm font-semibold text-gray-700">
        {index + 1}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-gray-950">{group.title}</p>
        <p className="mt-0.5 truncate text-xs text-gray-500">{group.address}</p>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-lg font-semibold leading-6 text-gray-950 tabular-nums">
          {group.total.toLocaleString("sv-SE")}
        </p>
        <p className="text-xs text-gray-500">ans.</p>
      </div>
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}

function ListingApplicationsBlock({
  groups,
  expandedKey,
  onToggle,
}: {
  groups: ListingApplicationGroup[];
  expandedKey: string | null;
  onToggle: (key: string) => void;
}) {
  if (groups.length === 0) {
    return (
      <div className="flex h-full items-center justify-center rounded-md border border-dashed border-gray-200 px-4 text-center text-sm text-gray-500">
        Det finns inga annonser med ansökningar att visa ännu.
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto pr-1">
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
        {groups.map((group) => (
          <ListingApplicationListRow
            expanded={expandedKey === group.key}
            group={group}
            key={group.key}
            onToggle={() => onToggle(group.key)}
          />
        ))}
      </div>
    </div>
  );
}

function ListingApplicationListRow({
  group,
  expanded,
  onToggle,
}: {
  group: ListingApplicationGroup;
  expanded: boolean;
  onToggle: () => void;
}) {
  const href =
    group.listingId != null
      ? `${dashboardRelPath}/annonser/${encodeURIComponent(String(group.listingId))}`
      : null;
  const rent = formatRent(group.rent);
  const facts = [group.city, rent].filter(Boolean).join(" · ") || "Ingen extra annonsdata";
  const dateCounts = buildApplicationDateCounts(group.applications).slice(0, 5);

  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        type="button"
        aria-expanded={expanded}
        className="grid w-full grid-cols-[64px_minmax(0,1fr)_auto] items-center gap-4 px-4 py-3 text-left transition hover:bg-brand-25/40 md:grid-cols-[76px_minmax(0,1.5fr)_minmax(0,1fr)_120px_28px]"
        onClick={onToggle}
      >
        <div className="relative h-14 w-16 overflow-hidden rounded-md bg-gray-100 md:h-16 md:w-20">
          {group.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              src={group.imageUrl}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-brand-50 text-[10px] font-semibold text-brand-500">
              Ingen bild
            </div>
          )}
        </div>

        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-gray-950">
            {group.title}
          </h3>
          <p className="mt-1 truncate text-xs text-gray-500">{group.address}</p>
          <p className="mt-1 truncate text-xs text-gray-400 md:hidden">{facts}</p>
        </div>

        <div className="hidden min-w-0 md:block">
          <p className="truncate text-sm text-gray-700">{facts}</p>
          <p className="mt-1 truncate text-xs text-gray-500">
            Senaste {formatTimestamp(group.lastSubmittedAt)}
          </p>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-lg font-semibold leading-6 text-gray-950 tabular-nums">
            {group.total.toLocaleString("sv-SE")}
          </p>
          <p className="text-xs text-gray-500">ans.</p>
        </div>

        <div className="hidden justify-end text-gray-400 md:flex">
          {expanded ? (
            <ChevronDown className="h-5 w-5" />
          ) : (
            <ChevronRight className="h-5 w-5" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="bg-gray-50 px-4 py-4">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.8fr)]">
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex min-w-0 items-start justify-between gap-3">
                <div className="min-w-0">
                  <h4 className="truncate text-sm font-semibold text-gray-950">
                    Ansökningar över tid
                  </h4>
                  <p className="mt-1 text-xs text-gray-500">
                    {formatTimestamp(group.firstSubmittedAt)} till {formatTimestamp(group.lastSubmittedAt)}
                  </p>
                </div>
                {href ? (
                  <Link
                    className="inline-flex h-8 shrink-0 items-center gap-2 rounded-md border border-gray-200 bg-white px-3 text-xs font-medium text-gray-900 transition hover:bg-gray-50"
                    href={href}
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Öppna
                  </Link>
                ) : null}
              </div>
              <div className="mt-4">
                <MiniTrendBars data={group.trend} />
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <h4 className="text-sm font-semibold text-gray-950">
                Senaste ansökningstillfällen
              </h4>
              <div className="mt-3 space-y-2">
                {dateCounts.map((entry) => (
                  <div
                    className="flex min-w-0 items-center justify-between gap-3 rounded-md bg-gray-50 px-3 py-2"
                    key={entry.label}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {entry.label}
                      </p>
                      <p className="truncate text-xs text-gray-500">
                        Ansökningar mottagna
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-700 ring-1 ring-gray-200">
                      {entry.count.toLocaleString("sv-SE")} st
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Ansokningar({
  listingId = null,
  mode = "interest",
}: AnsokningarProps) {
  const { user, isLoading: authLoading } = useAuth();
  const companyId = getActiveCompanyId(user);
  const [applications, setApplications] = useState<PortalApplication[]>([]);
  const [expandedListingKey, setExpandedListingKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || mode !== "interest") {
      return;
    }

    if (!companyId) {
      setApplications([]);
      return;
    }

    let active = true;
    setLoading(true);
    setError(null);

    companyService
      .applications(companyId)
      .then((result) => {
        if (!active) return;

        setApplications(
          result
            .map(toPortalApplication)
            .sort((a, b) => b.submittedAtTime - a.submittedAtTime)
        );
      })
      .catch((requestError) => {
        if (!active) return;

        setApplications([]);
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Kunde inte hämta ansökningar."
        );
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [authLoading, companyId, mode]);

  const visibleApplications = useMemo(() => {
    if (!listingId) {
      return applications;
    }

    return applications.filter(
      (application) => String(application.listingId ?? "") === String(listingId)
    );
  }, [applications, listingId]);
  const listingGroups = useMemo(
    () => buildListingGroups(visibleApplications),
    [visibleApplications]
  );
  const applicationTrend = useMemo(
    () => buildMonthlyTrend(visibleApplications, 12),
    [visibleApplications]
  );

  if (authLoading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 text-sm text-gray-500">
        Laddar ansökningar...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
        Logga in för att se företagets ansökningar.
      </div>
    );
  }

  if (!companyId) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
        Denna sida är bara tillgänglig för företagskonton.
      </div>
    );
  }

  if (mode === "queue") {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">Bostadskö</h1>
        <section className="rounded-lg border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-500">
          Köansökningar visas inte via /api/companies/{"{id}"}/all-applications.
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Ansökningar</h1>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <LoadingDashboard />
      ) : (
        <AnalyticsGrid>
          <AnalyticsBlock size="1x4">
            <ApplicationStatsGrid
              applications={visibleApplications}
              groups={listingGroups}
            />
          </AnalyticsBlock>

          <AnalyticsBlock size="2x2" title="Ansökningstrend">
            <TrendBarChart
              data={applicationTrend}
              defaultInterval="12m"
              embedded
              emptyMessage="Det finns inga ansökningar registrerade ännu."
              intervals={[
                { value: "6m", label: "6 mån", months: 6 },
                { value: "12m", label: "12 mån", months: 12 },
                { value: "24m", label: "24 mån", months: 24 },
                { value: "all", label: "Alla" },
              ]}
              showHeader={false}
              showSummary={false}
              title="Ansökningstrend"
              valueLabel="Ansökningar"
            />
          </AnalyticsBlock>

          <AnalyticsBlock
            action={<TrendingUp className="h-5 w-5 text-brand-500" />}
            contentClassName="overflow-hidden"
            size="2x2"
            title="Trending annonser"
          >
            <TrendingListings groups={listingGroups} />
          </AnalyticsBlock>

          <AnalyticsBlock
            contentClassName="overflow-hidden"
            description="Alla annonser som har minst en ansökan, grupperade från /all-applications."
            size="4x4"
            title="Annonser med ansökningar"
          >
            <ListingApplicationsBlock
              expandedKey={expandedListingKey}
              groups={listingGroups}
              onToggle={(key) =>
                setExpandedListingKey((current) => (current === key ? null : key))
              }
            />
          </AnalyticsBlock>

        </AnalyticsGrid>
      )}
    </div>
  );
}
