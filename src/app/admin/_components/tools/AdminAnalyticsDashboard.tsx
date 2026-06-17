"use client";

import { useMemo, useState } from "react";

import {
  BarChart3Icon,
  Building2Icon,
  RefreshCwIcon,
  SearchIcon,
  XCircleIcon,
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useAdminCompanies,
  useAdminCompanyListingStatuses,
} from "@/features/admin/hooks/useAdmin";
import type { AdminCompanyListingStatusStats } from "@/features/admin/services/admin-service";
import type { AnalyticsCountBucket } from "@/features/companies/services/company-service";
import type { AdminCompanyPublicDTO } from "@/types";
import { cn } from "@/lib/utils";

type CompanyWithId = AdminCompanyPublicDTO & { id: number };

type CompanyStatusRow = {
  company: CompanyWithId;
  stats: AdminCompanyListingStatusStats | null;
  counts: Record<string, number>;
  total: number;
  isLoading: boolean;
  errorMessage: string | null;
};

const PRIMARY_STATUS_KEYS = ["AVAILABLE", "RENTED", "HIDDEN"] as const;

const STATUS_LABELS: Record<string, string> = {
  AVAILABLE: "Tillgängliga",
  RENTED: "Uthyrda",
  HIDDEN: "Dolda",
};

const STATUS_STYLES: Record<string, string> = {
  AVAILABLE: "bg-emerald-500",
  RENTED: "bg-sky-500",
  HIDDEN: "bg-brand-500",
};

function formatNumber(value: number) {
  return value.toLocaleString("sv-SE");
}

function statusLabel(key: string) {
  return (
    STATUS_LABELS[key] ??
    key
      .replace(/[_-]+/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (character) => character.toUpperCase())
  );
}

function sourceLabel(source: AdminCompanyListingStatusStats["source"] | undefined) {
  if (source === "analytics-endpoint") return "Analytics";
  if (source === "all-listings") return "All listings";
  return "Väntar";
}

function toCountMap(buckets: AnalyticsCountBucket[] | undefined) {
  const counts: Record<string, number> = {};

  (buckets ?? []).forEach((bucket) => {
    const key = bucket.key.trim().toUpperCase();
    if (!key) return;
    counts[key] = (counts[key] ?? 0) + bucket.count;
  });

  return counts;
}

function sumCounts(counts: Record<string, number>) {
  return Object.values(counts).reduce((sum, count) => sum + count, 0);
}

function mergeCounts(rows: CompanyStatusRow[]) {
  const totalCounts: Record<string, number> = {};

  rows.forEach((row) => {
    Object.entries(row.counts).forEach(([key, count]) => {
      totalCounts[key] = (totalCounts[key] ?? 0) + count;
    });
  });

  return totalCounts;
}

function companyName(company: CompanyWithId) {
  return company.name?.trim() || `Bolag ${company.id}`;
}

function MetricTile({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: number;
  tone?: "neutral" | "available" | "rented" | "hidden";
}) {
  const toneClass =
    tone === "available"
      ? "border-emerald-100 bg-emerald-50/70 text-emerald-800"
      : tone === "rented"
        ? "border-sky-100 bg-sky-50/70 text-sky-800"
        : tone === "hidden"
          ? "border-brand-100 bg-brand-50/70 text-brand-800"
          : "border-gray-200 bg-white text-gray-900";

  return (
    <div className={cn("rounded-[8px] border p-4 shadow-theme-xs", toneClass)}>
      <p className="text-xs font-semibold uppercase tracking-wide text-current/70">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold leading-8">{formatNumber(value)}</p>
    </div>
  );
}

function StatusBar({
  counts,
  total,
  statusKeys,
}: {
  counts: Record<string, number>;
  total: number;
  statusKeys: string[];
}) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
      <div className="flex h-full w-full">
        {statusKeys.map((key) => {
          const count = counts[key] ?? 0;
          if (count <= 0 || total <= 0) return null;

          return (
            <div
              className={cn("h-full", STATUS_STYLES[key] ?? "bg-gray-400")}
              key={key}
              style={{ width: `${(count / total) * 100}%` }}
            />
          );
        })}
      </div>
    </div>
  );
}

function SourceBadge({ source }: { source: AdminCompanyListingStatusStats["source"] | undefined }) {
  const isFallback = source === "all-listings";

  return (
    <span
      className={cn(
        "inline-flex h-7 items-center rounded-full px-2.5 text-xs font-medium",
        isFallback ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"
      )}
    >
      {sourceLabel(source)}
    </span>
  );
}

function EndpointBadge({ endpoint }: { endpoint: string }) {
  return (
    <code className="inline-flex max-w-full items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs font-medium text-gray-600 shadow-theme-xs">
      <span className="rounded-md bg-brand-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
        GET
      </span>
      <span className="break-all">{endpoint}</span>
    </code>
  );
}

export function AdminAnalyticsDashboard() {
  const [search, setSearch] = useState("");
  const companiesQuery = useAdminCompanies();
  const companies = useMemo(
    () =>
      (companiesQuery.data ?? [])
        .filter((company): company is CompanyWithId => typeof company.id === "number")
        .sort((left, right) => companyName(left).localeCompare(companyName(right), "sv-SE")),
    [companiesQuery.data]
  );
  const companyIds = useMemo(() => companies.map((company) => company.id), [companies]);
  const statusQueries = useAdminCompanyListingStatuses(companyIds);

  const rows = useMemo<CompanyStatusRow[]>(() => {
    const queryByCompanyId = new Map(
      companyIds.map((companyId, index) => [companyId, statusQueries[index]])
    );

    return companies.map((company) => {
      const query = queryByCompanyId.get(company.id);
      const stats = query?.data ?? null;
      const counts = toCountMap(stats?.buckets);

      return {
        company,
        stats,
        counts,
        total: sumCounts(counts),
        isLoading: Boolean(query?.isLoading),
        errorMessage: query?.isError
          ? query.error instanceof Error
            ? query.error.message
            : "Kunde inte hämta statistik."
          : null,
      };
    });
  }, [companies, companyIds, statusQueries]);

  const statusKeys = useMemo(() => {
    const seen = new Set<string>(PRIMARY_STATUS_KEYS);
    rows.forEach((row) => {
      Object.keys(row.counts).forEach((key) => seen.add(key));
    });

    return Array.from(seen);
  }, [rows]);
  const totalCounts = useMemo(() => mergeCounts(rows), [rows]);
  const totalListings = sumCounts(totalCounts);
  const successfulRows = rows.filter((row) => row.stats !== null);
  const erroredRows = rows.filter((row) => row.errorMessage !== null);
  const fallbackRows = rows.filter((row) => row.stats?.source === "all-listings");
  const normalizedSearch = search.trim().toLocaleLowerCase("sv-SE");
  const visibleRows = normalizedSearch
    ? rows.filter((row) => {
        const haystack = `${companyName(row.company)} ${row.company.id} ${(row.company.cities ?? []).join(" ")}`.toLocaleLowerCase("sv-SE");
        return haystack.includes(normalizedSearch);
      })
    : rows;
  const isLoadingCompanies = companiesQuery.isLoading;
  const isFetchingStatuses = statusQueries.some((query) => query.isFetching);
  const isRefreshing = companiesQuery.isFetching || isFetchingStatuses;
  const companiesError =
    companiesQuery.isError && companiesQuery.error instanceof Error
      ? companiesQuery.error.message
      : companiesQuery.isError
        ? "Kunde inte hämta företag."
        : null;

  function refresh() {
    void companiesQuery.refetch();
    statusQueries.forEach((query) => {
      void query.refetch();
    });
  }

  return (
    <section className="portal-surface-hoverable min-w-0 p-5 sm:p-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
              <BarChart3Icon className="h-5 w-5" />
            </span>
            <h3 className="text-base font-semibold text-gray-950">Bolagsstatistik</h3>
          </div>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-500">
            Annonsstatus per bolag och aggregerat över alla tillgängliga bolag.
          </p>
        </div>
        <div className="flex min-w-0 flex-col gap-2">
          <EndpointBadge endpoint="/api/companies/{companyId}/analytics/listings/statuses" />
          {fallbackRows.length > 0 ? (
            <EndpointBadge endpoint="/api/companies/{companyId}/all-listings" />
          ) : null}
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <MetricTile label="Bolag" value={companies.length} />
        <MetricTile label="Annonser" value={totalListings} />
        <MetricTile
          label="Tillgängliga"
          value={totalCounts.AVAILABLE ?? 0}
          tone="available"
        />
        <MetricTile label="Uthyrda" value={totalCounts.RENTED ?? 0} tone="rented" />
        <MetricTile label="Dolda" value={totalCounts.HIDDEN ?? 0} tone="hidden" />
      </div>

      <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-sm">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            className="portal-control h-10 pl-9 text-sm"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Sök bolag eller stad"
            value={search}
          />
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="portal-control flex h-10 w-fit items-center gap-2 px-3 text-xs font-semibold text-gray-600">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            {formatNumber(successfulRows.length)} hämtade
            {fallbackRows.length > 0 ? ` · ${formatNumber(fallbackRows.length)} fallback` : ""}
            {erroredRows.length > 0 ? ` · ${formatNumber(erroredRows.length)} fel` : ""}
          </div>
          <Button
            className="bg-[#004225] text-white hover:bg-[#00351e]"
            isLoading={isRefreshing}
            onPress={refresh}
            type="button"
          >
            <RefreshCwIcon className="h-4 w-4" />
            Uppdatera
          </Button>
        </div>
      </div>

      {companiesError ? (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 shadow-theme-xs">
          <div className="flex items-start gap-2">
            <XCircleIcon className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{companiesError}</span>
          </div>
        </div>
      ) : null}

      <div className="mt-5 overflow-hidden rounded-[8px] border border-gray-200 bg-white shadow-theme-xs">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100 text-left text-sm">
            <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
              <tr>
                <th className="min-w-[240px] px-4 py-3">Bolag</th>
                <th className="w-[120px] px-4 py-3 text-right">Annonser</th>
                {statusKeys.map((key) => (
                  <th className="w-[130px] px-4 py-3 text-right" key={key}>
                    {statusLabel(key)}
                  </th>
                ))}
                <th className="min-w-[160px] px-4 py-3">Fördelning</th>
                <th className="w-[130px] px-4 py-3">Källa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoadingCompanies ? (
                <tr>
                  <td className="px-4 py-8 text-center text-sm text-gray-500" colSpan={statusKeys.length + 4}>
                    Hämtar företag...
                  </td>
                </tr>
              ) : visibleRows.length === 0 ? (
                <tr>
                  <td className="px-4 py-8 text-center text-sm text-gray-500" colSpan={statusKeys.length + 4}>
                    Inga bolag matchar filtret.
                  </td>
                </tr>
              ) : (
                visibleRows.map((row) => (
                  <tr className="align-middle hover:bg-gray-50/70" key={row.company.id}>
                    <td className="px-4 py-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
                          <Building2Icon className="h-5 w-5" />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-gray-950">
                            {companyName(row.company)}
                          </p>
                          <p className="mt-0.5 truncate text-xs text-gray-500">
                            ID {row.company.id}
                            {row.company.cities?.length ? ` · ${row.company.cities.join(", ")}` : ""}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-950">
                      {row.isLoading ? "..." : formatNumber(row.total)}
                    </td>
                    {statusKeys.map((key) => (
                      <td className="px-4 py-3 text-right text-gray-700" key={key}>
                        {row.isLoading ? "..." : formatNumber(row.counts[key] ?? 0)}
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      {row.errorMessage ? (
                        <span className="text-xs font-medium text-red-700">
                          {row.errorMessage}
                        </span>
                      ) : row.isLoading ? (
                        <span className="text-xs text-gray-500">Hämtar...</span>
                      ) : (
                        <StatusBar counts={row.counts} statusKeys={statusKeys} total={row.total} />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <SourceBadge source={row.stats?.source} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
