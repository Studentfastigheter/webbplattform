"use client";

import { useEffect, useState } from "react";
import { SearchIcon } from "@/components/icons";
import { Input } from "@/components/ui/input";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { useAdminApplicationList } from "@/features/admin/hooks/useAdmin";
import type { AdminApplicationListParams } from "@/types";
import { ActionShell } from "../../shared";
import { applicationStatusLabel, errorMessage, formatCount } from "./helpers";

const PAGE_SIZE = 25;
const SEARCH_DEBOUNCE_MS = 350;

const STATUS_OPTIONS = ["SUBMITTED", "UNDER_REVIEW", "OFFERED", "ACCEPTED", "REJECTED"] as const;

const SELECT_CLASSES =
  "h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 shadow-theme-xs focus:outline-none focus:ring-2 focus:ring-brand/30";

function formatAppliedAt(row: { appliedAt: string; source: string }) {
  const date = new Date(row.appliedAt);
  // Archived rows only carry a date (stamped midnight UTC) — showing a
  // clock time for them would be an invention.
  return row.source === "archived"
    ? date.toLocaleDateString("sv-SE")
    : date.toLocaleString("sv-SE", { dateStyle: "short", timeStyle: "short" });
}

export function ApplicationListBlock() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [source, setSource] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(0);

  useEffect(() => {
    const handle = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(0);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [searchInput]);

  const params: AdminApplicationListParams = {
    search: search || undefined,
    source: (source || undefined) as AdminApplicationListParams["source"],
    status: status || undefined,
    page,
    size: PAGE_SIZE,
  };
  const query = useAdminApplicationList(params);
  const list = query.data;
  const totalPages = list ? Math.max(1, Math.ceil(list.total / list.size)) : 1;

  return (
    <ActionShell
      title="Ansökningar per student och annons"
      description="Vem som sökt vilken annons, hos vilket bolag eller privat hyresvärd — både pågående och avgjorda ansökningar."
      method="GET"
      endpoint="/api/admin/insights/applications"
    >
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[240px] flex-1">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            className="pl-9"
            placeholder="Sök på student, annons eller bolag..."
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />
        </div>
        <select
          aria-label="Filtrera på källa"
          className={SELECT_CLASSES}
          value={source}
          onChange={(event) => {
            setSource(event.target.value);
            setPage(0);
          }}
        >
          <option value="">Pågående + avgjorda</option>
          <option value="active">Endast pågående</option>
          <option value="archived">Endast avgjorda</option>
        </select>
        <select
          aria-label="Filtrera på status"
          className={SELECT_CLASSES}
          value={status}
          onChange={(event) => {
            setStatus(event.target.value);
            setPage(0);
          }}
        >
          <option value="">Alla statusar</option>
          {STATUS_OPTIONS.map((key) => (
            <option key={key} value={key}>
              {applicationStatusLabel(key)}
            </option>
          ))}
        </select>
        <span className="text-sm text-gray-500">
          {formatCount(list?.total)} träffar
        </span>
      </div>

      <div className="mt-4 overflow-hidden rounded-[8px] border border-gray-200 bg-white shadow-theme-xs">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100 text-left text-sm">
            <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
              <tr>
                <th className="min-w-[220px] px-4 py-3">Student</th>
                <th className="min-w-[220px] px-4 py-3">Annons</th>
                <th className="min-w-[180px] px-4 py-3">Bolag / hyresvärd</th>
                <th className="w-[130px] px-4 py-3">Status</th>
                <th className="w-[110px] px-4 py-3">Källa</th>
                <th className="w-[150px] px-4 py-3">Sökt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {query.isLoading ? (
                <tr>
                  <td className="px-4 py-8 text-center text-sm text-gray-500" colSpan={6}>
                    Hämtar ansökningar...
                  </td>
                </tr>
              ) : query.isError ? (
                <tr>
                  <td className="px-4 py-8 text-center text-sm text-red-600" colSpan={6}>
                    {errorMessage(query.error, "Kunde inte hämta ansökningarna.")}
                  </td>
                </tr>
              ) : !list || list.applications.length === 0 ? (
                <tr>
                  <td className="px-4 py-8 text-center text-sm text-gray-500" colSpan={6}>
                    Inga ansökningar matchar filtret.
                  </td>
                </tr>
              ) : (
                list.applications.map((row) => (
                  <tr className="align-middle hover:bg-gray-50/70" key={`${row.source}-${row.id}`}>
                    <td className="px-4 py-3">
                      <p className="truncate font-medium text-gray-950">
                        {row.studentFirstName || row.studentSurname
                          ? `${row.studentFirstName ?? ""} ${row.studentSurname ?? ""}`.trim()
                          : row.studentEmail ?? "Raderad student"}
                      </p>
                      {row.studentEmail ? (
                        <p className="truncate text-xs text-gray-500">{row.studentEmail}</p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      <p className="truncate font-medium text-gray-950">
                        {row.listingTitle ?? "Raderad annons"}
                      </p>
                      {row.listingCity ? (
                        <p className="truncate text-xs text-gray-500">{row.listingCity}</p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      <p className="truncate text-gray-950">{row.ownerName ?? "–"}</p>
                      <p className="truncate text-xs text-gray-500">
                        {row.ownerType === "COMPANY"
                          ? "Bolag"
                          : row.ownerType === "PRIVATE"
                            ? "Privat hyresvärd"
                            : ""}
                      </p>
                    </td>
                    <td className="px-4 py-3">{applicationStatusLabel(row.status)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          row.source === "active"
                            ? "rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700"
                            : "rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600"
                        }
                      >
                        {row.source === "active" ? "Pågående" : "Avgjord"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{formatAppliedAt(row)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4">
        <PaginationControls
          currentPage={page + 1}
          totalPages={totalPages}
          onPageChange={(nextPage) => setPage(nextPage - 1)}
          ariaLabel="Bläddra bland ansökningar"
          previousLabel="Föregående"
          nextLabel="Nästa"
          isDisabled={query.isFetching}
        />
      </div>
    </ActionShell>
  );
}
