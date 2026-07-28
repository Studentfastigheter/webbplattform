"use client";

import { useEffect, useState } from "react";
import { SearchIcon } from "@/components/icons";
import { Input } from "@/components/ui/input";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { useAdminQueueMembershipList } from "@/features/admin/hooks/useAdmin";
import type { AdminQueueMembershipListParams } from "@/types";
import { ActionShell } from "../../shared";
import { errorMessage, formatCount } from "./helpers";

const PAGE_SIZE = 25;
const SEARCH_DEBOUNCE_MS = 350;

export function QueueMembershipListBlock() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  useEffect(() => {
    const handle = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(0);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [searchInput]);

  const params: AdminQueueMembershipListParams = {
    search: search || undefined,
    page,
    size: PAGE_SIZE,
  };
  const query = useAdminQueueMembershipList(params);
  const list = query.data;
  const totalPages = list ? Math.max(1, Math.ceil(list.total / list.size)) : 1;

  return (
    <ActionShell
      title="Köställningar per student"
      description="Vilka studenter som står i vilka bostadsköer, och vilket bolag som äger kön. Externa rader är importerade från bolagets fastighetssystem."
      method="GET"
      endpoint="/api/admin/insights/queue-memberships"
    >
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[240px] flex-1">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            className="pl-9"
            placeholder="Sök på student, kö eller bolag..."
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />
        </div>
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
                <th className="min-w-[200px] px-4 py-3">Kö</th>
                <th className="min-w-[180px] px-4 py-3">Bolag</th>
                <th className="w-[110px] px-4 py-3">Status</th>
                <th className="w-[110px] px-4 py-3">Ursprung</th>
                <th className="w-[140px] px-4 py-3">Gick med</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {query.isLoading ? (
                <tr>
                  <td className="px-4 py-8 text-center text-sm text-gray-500" colSpan={6}>
                    Hämtar köställningar...
                  </td>
                </tr>
              ) : query.isError ? (
                <tr>
                  <td className="px-4 py-8 text-center text-sm text-red-600" colSpan={6}>
                    {errorMessage(query.error, "Kunde inte hämta köställningarna.")}
                  </td>
                </tr>
              ) : !list || list.memberships.length === 0 ? (
                <tr>
                  <td className="px-4 py-8 text-center text-sm text-gray-500" colSpan={6}>
                    Inga köställningar matchar filtret.
                  </td>
                </tr>
              ) : (
                list.memberships.map((row) => (
                  <tr className="align-middle hover:bg-gray-50/70" key={row.id}>
                    <td className="px-4 py-3">
                      <p className="truncate font-medium text-gray-950">
                        {row.studentFirstName || row.studentSurname
                          ? `${row.studentFirstName ?? ""} ${row.studentSurname ?? ""}`.trim()
                          : row.studentEmail}
                      </p>
                      <p className="truncate text-xs text-gray-500">{row.studentEmail}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="truncate font-medium text-gray-950">{row.queueName}</p>
                      {row.queueCity ? (
                        <p className="truncate text-xs text-gray-500">{row.queueCity}</p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-gray-950">{row.companyName}</td>
                    <td className="px-4 py-3 text-gray-600">{row.status}</td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          row.external
                            ? "rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700"
                            : "rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700"
                        }
                      >
                        {row.external ? "Extern" : "CampusLyan"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(row.joinedAt).toLocaleDateString("sv-SE")}
                    </td>
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
          ariaLabel="Bläddra bland köställningar"
          previousLabel="Föregående"
          nextLabel="Nästa"
          isDisabled={query.isFetching}
        />
      </div>
    </ActionShell>
  );
}
