"use client";

import { useEffect, useMemo, useState, type ComponentType } from "react";
import Link from "next/link";
import {
  BarChart3,
  CalendarDays,
  ExternalLink,
  FileUser,
  Home,
  MapPin,
  TrendingUp,
} from "lucide-react";
import { AnalyticsBlock, AnalyticsGrid } from "@/features/analytics/components/AnalyticsBlocks";
import {
  TrendBarChart,
  type TrendBarChartPoint,
} from "@/features/analytics/components/TrendBarChart";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";
import { getActiveCompanyId } from "@/lib/company-access";
import { cn } from "@/lib/utils";
import { companyService, type NewApplication } from "@/features/companies/services/company-service";
import { dashboardRelPath } from "../_statics/variables";

type AnsokningarProps = {
  listingId?: string | null;
};

type PortalApplication = NewApplication & {
  listingName: string;
  submittedAtTime: number;
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

function toPortalApplication(application: NewApplication): PortalApplication {
  const submittedAt = application.submittedAt ?? application.createdAt;

  return {
    ...application,
    listingName: application.listingTitle || application.address || "Okänd annons",
    submittedAtTime: parseDate(submittedAt),
  };
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

  return (
    [application.listingTitle, application.address, application.listingCity]
      .filter(Boolean)
      .join("|") || application.listingName
  );
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

function formatRent(value?: number) {
  return typeof value === "number" && Number.isFinite(value)
    ? `${value.toLocaleString("sv-SE")} kr/mån`
    : null;
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
  icon: ComponentType<{ className?: string }>;
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

function LoadingApplicationsLayout() {
  return (
    <div className="space-y-4">
      <AnalyticsGrid>
        <AnalyticsBlock size="1x4">
          <div className="grid h-full min-w-0 grid-cols-1 gap-3 min-[520px]:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton className="h-full min-h-[120px] rounded-xl" key={index} />
            ))}
          </div>
        </AnalyticsBlock>
        <AnalyticsBlock size="2x2" title="Ansökningstrend">
          <Skeleton className="h-full min-h-[220px] rounded-md" />
        </AnalyticsBlock>
        <AnalyticsBlock size="2x2" title="Trending annonser">
          <Skeleton className="h-full min-h-[220px] rounded-md" />
        </AnalyticsBlock>
      </AnalyticsGrid>

      <div className="grid min-h-[520px] gap-4 lg:h-[calc(100vh-220px)] lg:grid-cols-[340px_minmax(0,1fr)]">
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <Skeleton className="h-5 w-40 rounded" />
          <div className="mt-5 grid gap-3">
            {[0, 1, 2, 3, 4].map((item) => (
              <Skeleton className="h-20 rounded-xl" key={item} />
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <Skeleton className="h-7 w-64 rounded" />
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
          </div>
          <Skeleton className="mt-6 h-28 rounded-xl" />
          <div className="mt-6 grid gap-3">
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ListingApplicationsLayout({
  groups,
  selectedGroup,
  onSelect,
}: {
  groups: ListingApplicationGroup[];
  selectedGroup: ListingApplicationGroup | null;
  onSelect: (key: string) => void;
}) {
  return (
    <div className="grid min-h-[520px] gap-4 lg:h-[calc(100vh-220px)] lg:grid-cols-[340px_minmax(0,1fr)]">
      <aside className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white">
        {groups.length === 0 ? (
          <div className="flex flex-1 items-center justify-center px-5 py-10 text-center text-theme-sm text-gray-500">
            Det finns inga annonser med ansökningar att visa ännu.
          </div>
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto p-2">
            <div className="grid gap-1">
              {groups.map((group) => (
                <ListingListItem
                  group={group}
                  isSelected={selectedGroup?.key === group.key}
                  key={group.key}
                  onSelect={() => onSelect(group.key)}
                />
              ))}
            </div>
          </div>
        )}
      </aside>

      <section className="min-h-0 overflow-hidden rounded-2xl border border-gray-200 bg-white">
        {selectedGroup ? (
          <SelectedListingDetails group={selectedGroup} />
        ) : (
          <div className="flex h-full min-h-[360px] items-center justify-center px-6 py-10 text-center text-theme-sm text-gray-500">
            Välj en annons i listan för att visa ansökningarna.
          </div>
        )}
      </section>
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
        <div
          className="flex min-w-0 items-center gap-3 rounded-xl border border-gray-100 bg-white p-3 shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
          key={group.key}
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-50 text-sm font-semibold text-gray-700">
            {index + 1}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-gray-950">
              {group.title}
            </p>
            <p className="mt-0.5 truncate text-xs text-gray-500">
              {group.address}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-lg font-semibold leading-6 text-gray-950 tabular-nums">
              {group.total.toLocaleString("sv-SE")}
            </p>
            <p className="text-xs text-gray-500">ans.</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function ListingListItem({
  group,
  isSelected,
  onSelect,
}: {
  group: ListingApplicationGroup;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={isSelected}
      className={cn(
        "relative w-full rounded-lg px-3 py-3 pl-4 text-left transition-colors",
        isSelected
          ? "bg-[#004225]/5 text-[#004225]"
          : "text-gray-700 hover:bg-gray-50"
      )}
      onClick={onSelect}
    >
      {isSelected ? (
        <span className="absolute bottom-2 left-1.5 top-2 w-1 rounded-full bg-[#004225]" />
      ) : null}

      <span className="block truncate text-sm font-semibold">{group.title}</span>
      <span className="mt-1 block truncate text-xs text-gray-500">
        {group.city || "Stad saknas"}
      </span>
    </button>
  );
}

function SelectedListingDetails({ group }: { group: ListingApplicationGroup }) {
  const href =
    group.listingId != null
      ? `${dashboardRelPath}/annonser/${encodeURIComponent(String(group.listingId))}`
      : null;
  const rent = formatRent(group.rent);
  const facts = [group.city, rent].filter(Boolean).join(" · ");

  return (
    <div className="h-full min-h-0 overflow-y-auto px-5 py-5 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="flex min-w-0 flex-col gap-4 border-b border-gray-100 pb-5 md:flex-row md:items-start">
          <div className="relative h-28 w-full shrink-0 overflow-hidden rounded-xl bg-gray-100 md:w-44">
            {group.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
                src={group.imageUrl}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-brand-50 text-xs font-semibold text-brand-500">
                Ingen bild
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <h2 className="break-words text-xl font-semibold text-gray-900">
                  {group.title}
                </h2>
                <p className="mt-2 flex min-w-0 items-center gap-2 text-theme-sm text-gray-500">
                  <MapPin className="h-4 w-4 shrink-0" />
                  <span className="truncate">{group.address}</span>
                </p>
                {facts ? (
                  <p className="mt-1 text-theme-sm text-gray-500">{facts}</p>
                ) : null}
              </div>

              <div className="shrink-0 sm:text-right">
                {href ? (
                  <Link
                    className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-gray-200 bg-white px-3 text-sm font-medium text-gray-900 transition hover:bg-gray-50"
                    href={href}
                  >
                    <ExternalLink className="h-4 w-4" />
                    Öppna annons
                  </Link>
                ) : null}
                <div className="mt-3">
                  <p className="text-xs font-medium text-gray-500">
                    Totalt antal ansökningar
                  </p>
                  <p className="mt-0.5 text-xl font-semibold leading-7 text-gray-950 tabular-nums">
                    {group.total.toLocaleString("sv-SE")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-gray-950">Senaste ansökningar</h3>
          <div className="mt-3 grid gap-2">
            {group.applications.slice(0, 12).map((application) => (
              <div
                className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 bg-gray-50/70 px-4 py-3"
                key={`${application.applicationId ?? application.id}-${application.submittedAtTime}`}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-gray-900">
                    {[application.firstName, application.surname].filter(Boolean).join(" ") ||
                      application.studentEmail ||
                      "Sökande"}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-gray-500">
                    {application.message || application.studentSchool || "Ingen kommentar"}
                  </p>
                </div>
                <span className="shrink-0 text-xs font-medium text-gray-500">
                  {formatTimestamp(application.submittedAtTime)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Ansokningar({
  listingId = null,
}: AnsokningarProps) {
  const { user, isLoading: authLoading } = useAuth();
  const companyId = getActiveCompanyId(user);
  const [applications, setApplications] = useState<PortalApplication[]>([]);
  const [selectedListingKey, setSelectedListingKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!companyId) {
      setApplications([]);
      setSelectedListingKey(null);
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
        setSelectedListingKey(null);
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
  }, [authLoading, companyId]);

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
  const showOverviewAnalytics = !listingId;

  useEffect(() => {
    if (listingGroups.length === 0) {
      setSelectedListingKey(null);
      return;
    }

    setSelectedListingKey((current) => {
      if (current && listingGroups.some((group) => group.key === current)) {
        return current;
      }

      return listingGroups[0].key;
    });
  }, [listingGroups]);

  const selectedGroup = useMemo(() => {
    if (!selectedListingKey) return listingGroups[0] ?? null;
    return (
      listingGroups.find((group) => group.key === selectedListingKey) ??
      listingGroups[0] ??
      null
    );
  }, [listingGroups, selectedListingKey]);

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
        <LoadingApplicationsLayout />
      ) : (
        <>
          {showOverviewAnalytics ? (
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
                  defaultInterval="1m"
                  embedded
                  emptyMessage="Det finns inga ansökningar registrerade ännu."
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
            </AnalyticsGrid>
          ) : null}

          <ListingApplicationsLayout
            groups={listingGroups}
            selectedGroup={selectedGroup}
            onSelect={setSelectedListingKey}
          />
        </>
      )}
    </div>
  );
}
