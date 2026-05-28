"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  Building2,
  Clock3,
  FileText,
  Home,
  ListChecks,
  MapPin,
  MousePointerClick,
  Users,
} from "lucide-react";
import { AnalyticsBlock, AnalyticsGrid } from "@/features/analytics/components/AnalyticsBlocks";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";
import { getActiveCompanyId } from "@/lib/company-access";
import { cn } from "@/lib/utils";
import {
  demographicsService,
  type ApplicationDemography,
  type DemographyCategory,
  type ListingDemography,
} from "@/features/analytics/services/demographics-service";
import { listingService } from "@/features/listings/services/listing-service";
import {
  queueService,
  getQueueApplicationQueueId,
  type QueueApplicationDTO,
} from "@/features/queues/services/queue-service";
import type { ListingCardDTO } from "@/types/listing";
import type { HousingQueueDTO } from "@/types/queue";
import {
  ApplicationIntervalToggle,
  getApplicationIntervalRange,
  type ApplicationIntervalValue,
} from "../_components/analytics/ApplicationIntervalStats";
import { dashboardRelPath } from "../_statics/variables";

type QueueAnalytics = {
  totalViews: number;
  quickViews: number;
  detailedViews: number;
  likes: number;
  totalApplications: number;
  topCity: string;
  topSchool: string;
};

function formatNumber(value: number) {
  return value.toLocaleString("sv-SE");
}

function formatWaitDays(value?: number | null) {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    return "-";
  }

  if (value < 31) return `${value} dagar`;
  const months = value / 30;
  if (months < 18) {
    return `${months.toLocaleString("sv-SE", { maximumFractionDigits: 1 })} mån`;
  }
  return `${(value / 365).toLocaleString("sv-SE", { maximumFractionDigits: 1 })} år`;
}

function totalViews(value?: ListingDemography | null) {
  if (!value) return 0;
  return (
    value.totalViews ??
    value.buckets?.reduce((sum, bucket) => sum + Number(bucket.totalViews ?? 0), 0) ??
    0
  );
}

function bucketValue(value: ListingDemography | null | undefined, key: unknown) {
  return (
    value?.buckets
      ?.filter((bucket) => String(bucket.key) === String(key))
      .reduce((sum, bucket) => sum + Number(bucket.totalViews ?? 0), 0) ?? 0
  );
}

function totalApplications(value?: ApplicationDemography | null) {
  if (!value) return 0;
  return (
    value.totalApplications ??
    value.buckets?.reduce(
      (sum, bucket) => sum + Number(bucket.totalApplications ?? 0),
      0
    ) ??
    0
  );
}

function topBucketLabel(values: Array<ListingDemography | null | undefined>) {
  const counts = new Map<string, number>();

  values.forEach((value) => {
    value?.buckets?.forEach((bucket) => {
      const key = String(bucket.key ?? "Okänt");
      counts.set(key, (counts.get(key) ?? 0) + Number(bucket.totalViews ?? 0));
    });
  });

  const top = Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0];
  return top ? top[0] : "-";
}

function buildQueueAnalytics(
  viewData: Record<DemographyCategory, Record<string, ListingDemography>>,
  applicationData: Record<string, ApplicationDemography>
): QueueAnalytics {
  const viewTypeValues = Object.values(viewData.VIEW_TYPE ?? {});
  const likeValues = Object.values(viewData.RESULTED_IN_LIKE ?? {});
  const appValues = Object.values(applicationData ?? {});

  return {
    totalViews: viewTypeValues.reduce((sum, item) => sum + totalViews(item), 0),
    quickViews: viewTypeValues.reduce((sum, item) => sum + bucketValue(item, "QUICK"), 0),
    detailedViews: viewTypeValues.reduce(
      (sum, item) => sum + bucketValue(item, "DETAILED"),
      0
    ),
    likes: likeValues.reduce((sum, item) => sum + bucketValue(item, true), 0),
    totalApplications: appValues.reduce(
      (sum, item) => sum + totalApplications(item),
      0
    ),
    topCity: topBucketLabel(Object.values(viewData.CITY ?? {})),
    topSchool: topBucketLabel(Object.values(viewData.SCHOOL ?? {})),
  };
}

function MetricTile({
  label,
  value,
  detail,
  icon,
}: {
  label: string;
  value: string;
  detail?: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
          {icon}
        </span>
        {detail ? (
          <span className="truncate rounded-full border border-gray-200 bg-gray-50 px-2 py-1 text-xs font-semibold text-gray-500">
            {detail}
          </span>
        ) : null}
      </div>
      <p className="mt-4 text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-gray-950 tabular-nums">
        {value}
      </p>
    </div>
  );
}

function QueueListItem({
  queue,
  selected,
  onSelect,
}: {
  queue: HousingQueueDTO;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      className={cn(
        "w-full rounded-lg px-3 py-3 text-left transition-colors",
        selected ? "bg-brand-50 text-brand-700" : "text-gray-700 hover:bg-gray-50"
      )}
      onClick={onSelect}
    >
      <span className="block truncate text-sm font-semibold">{queue.name}</span>
      <span className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
        <MapPin className="h-3.5 w-3.5" />
        {queue.city || "Stad saknas"}
      </span>
    </button>
  );
}

function QueueListings({ listings }: { listings: ListingCardDTO[] }) {
  if (listings.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/70 p-8 text-center text-sm text-gray-500">
        Inga annonser är kopplade till den här kön.
      </div>
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {listings.map((listing) => (
        <Link
          className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition hover:border-brand-200 hover:shadow-[0_8px_24px_rgba(16,24,40,0.08)]"
          href={`${dashboardRelPath}/annonser/${encodeURIComponent(listing.id)}`}
          key={listing.id}
        >
          <div className="relative h-32 bg-gray-100">
            {listing.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img alt="" className="h-full w-full object-cover" src={listing.imageUrl} />
            ) : (
              <div className="flex h-full items-center justify-center text-xs font-semibold text-gray-400">
                Ingen bild
              </div>
            )}
          </div>
          <div className="p-4">
            <p className="truncate text-sm font-semibold text-gray-950 group-hover:text-brand-700">
              {listing.title}
            </p>
            <p className="mt-1 truncate text-xs text-gray-500">{listing.location}</p>
            <p className="mt-3 text-sm font-semibold text-gray-900">
              {listing.rent.toLocaleString("sv-SE")} kr/mån
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}

function QueueApplications({ applications }: { applications: QueueApplicationDTO[] }) {
  if (applications.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/70 p-8 text-center text-sm text-gray-500">
        Inga kömedlemskap finns i kösvaret.
      </div>
    );
  }

  return (
    <div className="grid gap-2">
      {applications.slice(0, 12).map((application, index) => (
        <div
          className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 bg-white px-4 py-3"
          key={`${application.id ?? application.queueId ?? "application"}-${index}`}
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-900">
              {[application.firstName, application.surname].filter(Boolean).join(" ") ||
                application.email ||
                "Kömedlem"}
            </p>
            <p className="mt-0.5 truncate text-xs text-gray-500">
              {application.status ?? "Status saknas"}
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-gray-50 px-2 py-1 text-xs font-semibold text-gray-600">
            {application.queueDays ?? application.daysInQueue ?? 0} dagar
          </span>
        </div>
      ))}
    </div>
  );
}

export default function Bostadsko() {
  const { user, isLoading: authLoading } = useAuth();
  const companyId = getActiveCompanyId(user);
  const [queues, setQueues] = useState<HousingQueueDTO[]>([]);
  const [selectedQueueId, setSelectedQueueId] = useState<string>("");
  const [queueApplications, setQueueApplications] = useState<QueueApplicationDTO[]>([]);
  const [listings, setListings] = useState<ListingCardDTO[]>([]);
  const [range, setRange] = useState<ApplicationIntervalValue>("1m");
  const [analytics, setAnalytics] = useState<QueueAnalytics | null>(null);
  const [loadingQueues, setLoadingQueues] = useState(false);
  const [loadingListings, setLoadingListings] = useState(false);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || !companyId) return;

    let active = true;
    setLoadingQueues(true);
    setError(null);

    Promise.all([
      queueService.getByCompany(companyId),
      queueService.getCompanyQueueApplications(companyId).catch(() => []),
    ])
      .then(([queueRows, applications]) => {
        if (!active) return;
        setQueues(queueRows);
        setQueueApplications(applications);
        setSelectedQueueId((current) => current || queueRows[0]?.id || "");
      })
      .catch((requestError) => {
        if (!active) return;
        setQueues([]);
        setQueueApplications([]);
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Kunde inte hämta bostadsköer."
        );
      })
      .finally(() => {
        if (active) setLoadingQueues(false);
      });

    return () => {
      active = false;
    };
  }, [authLoading, companyId]);

  const selectedQueue = useMemo(
    () => queues.find((queue) => queue.id === selectedQueueId) ?? queues[0] ?? null,
    [queues, selectedQueueId]
  );

  const selectedQueueApplications = useMemo(() => {
    if (!selectedQueue) return [];
    return queueApplications.filter(
      (application) => getQueueApplicationQueueId(application) === selectedQueue.id
    );
  }, [queueApplications, selectedQueue]);

  useEffect(() => {
    if (!selectedQueue) {
      setListings([]);
      return;
    }

    let active = true;
    setLoadingListings(true);

    listingService
      .getQueueListings(selectedQueue.id, 0, 200)
      .then((page) => {
        if (active) setListings(page.content ?? []);
      })
      .catch(() => {
        if (active) setListings([]);
      })
      .finally(() => {
        if (active) setLoadingListings(false);
      });

    return () => {
      active = false;
    };
  }, [selectedQueue]);

  useEffect(() => {
    if (!companyId || !selectedQueue || listings.length === 0) {
      setAnalytics(null);
      return;
    }

    const listingIds = listings.map((listing) => listing.id);
    const { from, to } = getApplicationIntervalRange(range);
    let active = true;

    setLoadingAnalytics(true);

    Promise.all([
      demographicsService.getListingsBatchByAllCategories(
        companyId,
        listingIds,
        from,
        to
      ),
      demographicsService.getApplicationsBatch(
        companyId,
        listingIds,
        from,
        to,
        "GOT_LISTING",
        "BOTH"
      ),
    ])
      .then(([viewData, applicationData]) => {
        if (active) setAnalytics(buildQueueAnalytics(viewData, applicationData));
      })
      .catch(() => {
        if (active) setAnalytics(null);
      })
      .finally(() => {
        if (active) setLoadingAnalytics(false);
      });

    return () => {
      active = false;
    };
  }, [companyId, listings, range, selectedQueue]);

  const totals = useMemo(() => {
    const totalUnits = queues.reduce((sum, queue) => sum + (queue.totalUnits ?? 0), 0);
    const activeListings = queues.reduce(
      (sum, queue) => sum + (queue.activeListings ?? 0),
      0
    );
    const waitValues = queues
      .map((queue) => queue.waitDays)
      .filter((value): value is number => typeof value === "number");
    const averageWait =
      waitValues.length > 0
        ? Math.round(waitValues.reduce((sum, value) => sum + value, 0) / waitValues.length)
        : null;

    return { totalUnits, activeListings, averageWait };
  }, [queues]);

  if (authLoading || loadingQueues) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-44" />
        <div className="grid gap-4 md:grid-cols-4">
          {[0, 1, 2, 3].map((item) => (
            <Skeleton className="h-32 rounded-xl" key={item} />
          ))}
        </div>
        <Skeleton className="h-[520px] rounded-xl" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
        Logga in för att se företagets bostadsköer.
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
        <h1 className="text-2xl font-semibold text-gray-900">Bostadskö</h1>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-4">
        <MetricTile
          icon={<Building2 className="h-5 w-5" />}
          label="Köer"
          value={formatNumber(queues.length)}
        />
        <MetricTile
          detail="registrerat"
          icon={<Home className="h-5 w-5" />}
          label="Bostäder"
          value={formatNumber(totals.totalUnits)}
        />
        <MetricTile
          icon={<FileText className="h-5 w-5" />}
          label="Aktiva annonser"
          value={formatNumber(totals.activeListings)}
        />
        <MetricTile
          icon={<Clock3 className="h-5 w-5" />}
          label="Snittkö"
          value={formatWaitDays(totals.averageWait)}
        />
      </div>

      {queues.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-500">
          Inga bostadsköer hittades för företaget.
        </div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="rounded-xl border border-gray-200 bg-white p-2 shadow-theme-xs xl:sticky xl:top-6 xl:self-start">
            {queues.map((queue) => (
              <QueueListItem
                key={queue.id}
                queue={queue}
                selected={selectedQueue?.id === queue.id}
                onSelect={() => setSelectedQueueId(queue.id)}
              />
            ))}
          </aside>

          <main className="min-w-0 space-y-5">
            {selectedQueue ? (
              <>
                <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-theme-xs">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <p className="flex items-center gap-1.5 text-sm font-medium text-gray-500">
                        <MapPin className="h-4 w-4" />
                        {selectedQueue.city || "Stad saknas"}
                      </p>
                      <h2 className="mt-2 text-xl font-semibold text-gray-950">
                        {selectedQueue.name}
                      </h2>
                      {selectedQueue.description ? (
                        <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-600">
                          {selectedQueue.description}
                        </p>
                      ) : null}
                      {selectedQueue.tags?.length ? (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {selectedQueue.tags.map((tag) => (
                            <span
                              className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-600"
                              key={tag}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>
                    <div className="grid min-w-[260px] grid-cols-2 gap-3">
                      <MetricTile
                        icon={<Home className="h-4 w-4" />}
                        label="Bostäder"
                        value={formatNumber(selectedQueue.totalUnits ?? 0)}
                      />
                      <MetricTile
                        icon={<Clock3 className="h-4 w-4" />}
                        label="Kötid"
                        value={formatWaitDays(selectedQueue.waitDays)}
                      />
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-950">
                        Analys för kön
                      </h2>
                    </div>
                    <ApplicationIntervalToggle onChange={setRange} value={range} />
                  </div>

                  <AnalyticsGrid rowHeightClassName="xl:auto-rows-[132px]">
                    <AnalyticsBlock size="1x1" title="Visningar">
                      {loadingAnalytics ? (
                        <Skeleton className="h-full rounded-lg" />
                      ) : (
                        <div className="flex h-full flex-col justify-between">
                          <MousePointerClick className="h-5 w-5 text-brand-500" />
                          <p className="text-3xl font-semibold text-gray-950 tabular-nums">
                            {formatNumber(analytics?.totalViews ?? 0)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatNumber(analytics?.detailedViews ?? 0)} detaljerade
                          </p>
                        </div>
                      )}
                    </AnalyticsBlock>
                    <AnalyticsBlock size="1x1" title="Favoriter">
                      {loadingAnalytics ? (
                        <Skeleton className="h-full rounded-lg" />
                      ) : (
                        <div className="flex h-full flex-col justify-between">
                          <ListChecks className="h-5 w-5 text-brand-500" />
                          <p className="text-3xl font-semibold text-gray-950 tabular-nums">
                            {formatNumber(analytics?.likes ?? 0)}
                          </p>
                          <p className="text-xs text-gray-500">från köannonser</p>
                        </div>
                      )}
                    </AnalyticsBlock>
                    <AnalyticsBlock size="1x1" title="Ansökningsutfall">
                      {loadingAnalytics ? (
                        <Skeleton className="h-full rounded-lg" />
                      ) : (
                        <div className="flex h-full flex-col justify-between">
                          <Users className="h-5 w-5 text-brand-500" />
                          <p className="text-3xl font-semibold text-gray-950 tabular-nums">
                            {formatNumber(analytics?.totalApplications ?? 0)}
                          </p>
                          <p className="text-xs text-gray-500">terminala ärenden</p>
                        </div>
                      )}
                    </AnalyticsBlock>
                    <AnalyticsBlock size="1x1" title="Toppsegment">
                      {loadingAnalytics ? (
                        <Skeleton className="h-full rounded-lg" />
                      ) : (
                        <div className="flex h-full flex-col justify-between">
                          <BarChart3 className="h-5 w-5 text-brand-500" />
                          <p className="truncate text-lg font-semibold text-gray-950">
                            {analytics?.topCity ?? "-"}
                          </p>
                          <p className="truncate text-xs text-gray-500">
                            {analytics?.topSchool ?? "-"}
                          </p>
                        </div>
                      )}
                    </AnalyticsBlock>
                  </AnalyticsGrid>
                </section>

                <section className="space-y-3">
                  <h2 className="text-lg font-semibold text-gray-950">
                    Annonser i kön
                  </h2>
                  {loadingListings ? (
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                      {[0, 1, 2].map((item) => (
                        <Skeleton className="h-56 rounded-xl" key={item} />
                      ))}
                    </div>
                  ) : (
                    <QueueListings listings={listings} />
                  )}
                </section>

                <section className="space-y-3">
                  <h2 className="text-lg font-semibold text-gray-950">
                    Kömedlemskap
                  </h2>
                  <QueueApplications applications={selectedQueueApplications} />
                </section>
              </>
            ) : null}
          </main>
        </div>
      )}
    </div>
  );
}
