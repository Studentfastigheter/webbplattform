"use client";

import { useEffect, useState } from "react";
import { SearchIcon } from "@/components/icons";
import { Input } from "@/components/ui/input";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { useAdminUserList } from "@/features/admin/hooks/useAdmin";
import type { AdminUserListParams } from "@/types";
import { ActionShell } from "../../shared";
import { errorMessage, formatCount } from "../statistics/helpers";
import { methodLabel } from "./UserInsightsBlocks";

const PAGE_SIZE = 25;
const SEARCH_DEBOUNCE_MS = 350;

const SELECT_CLASSES =
  "h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 shadow-theme-xs focus:outline-none focus:ring-2 focus:ring-brand/30";

function formatDateTime(value: string | null) {
  if (!value) return "–";
  return new Date(value).toLocaleString("sv-SE", { dateStyle: "short", timeStyle: "short" });
}

export function UserListBlock() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [accountType, setAccountType] = useState("");
  const [method, setMethod] = useState("");
  const [verified, setVerified] = useState("");
  const [page, setPage] = useState(0);

  useEffect(() => {
    const handle = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(0);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [searchInput]);

  const params: AdminUserListParams = {
    search: search || undefined,
    accountType: (accountType || undefined) as AdminUserListParams["accountType"],
    method: method || undefined,
    verified: verified === "" ? undefined : verified === "true",
    page,
    size: PAGE_SIZE,
  };
  const query = useAdminUserList(params);
  const list = query.data;
  const totalPages = list ? Math.max(1, Math.ceil(list.total / list.size)) : 1;

  return (
    <ActionShell
      title="Alla användarkonton"
      description="Studenter och pågående snabbregistreringar — sök på namn eller e-post, filtrera på kontotyp, registreringsmetod och verifiering."
      method="GET"
      endpoint="/api/admin/users"
    >
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[240px] flex-1">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            className="pl-9"
            placeholder="Sök på namn eller e-post..."
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />
        </div>
        <select
          aria-label="Filtrera på kontotyp"
          className={SELECT_CLASSES}
          value={accountType}
          onChange={(event) => {
            setAccountType(event.target.value);
            setPage(0);
          }}
        >
          <option value="">Alla kontotyper</option>
          <option value="student">Studenter</option>
          <option value="quick_register">Snabbregistreringar</option>
        </select>
        <select
          aria-label="Filtrera på registreringsmetod"
          className={SELECT_CLASSES}
          value={method}
          onChange={(event) => {
            setMethod(event.target.value);
            setPage(0);
          }}
        >
          <option value="">Alla metoder</option>
          <option value="EMAIL">E-post</option>
          <option value="GOOGLE">Google</option>
          <option value="FREJA">Freja</option>
          <option value="UNKNOWN">Okänd</option>
        </select>
        <select
          aria-label="Filtrera på verifiering"
          className={SELECT_CLASSES}
          value={verified}
          onChange={(event) => {
            setVerified(event.target.value);
            setPage(0);
          }}
        >
          <option value="">Verifierade + overifierade</option>
          <option value="true">Endast verifierade</option>
          <option value="false">Endast overifierade</option>
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
                <th className="min-w-[240px] px-4 py-3">Användare</th>
                <th className="w-[160px] px-4 py-3">Kontotyp</th>
                <th className="w-[120px] px-4 py-3">Metod</th>
                <th className="w-[140px] px-4 py-3">Verifiering</th>
                <th className="w-[150px] px-4 py-3">Skapad</th>
                <th className="w-[150px] px-4 py-3">Senast inloggad</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {query.isLoading ? (
                <tr>
                  <td className="px-4 py-8 text-center text-sm text-gray-500" colSpan={6}>
                    Hämtar användare...
                  </td>
                </tr>
              ) : query.isError ? (
                <tr>
                  <td className="px-4 py-8 text-center text-sm text-red-600" colSpan={6}>
                    {errorMessage(query.error, "Kunde inte hämta användarlistan.")}
                  </td>
                </tr>
              ) : !list || list.users.length === 0 ? (
                <tr>
                  <td className="px-4 py-8 text-center text-sm text-gray-500" colSpan={6}>
                    Inga användare matchar filtret.
                  </td>
                </tr>
              ) : (
                list.users.map((row) => (
                  <tr className="align-middle hover:bg-gray-50/70" key={`${row.accountType}-${row.id}`}>
                    <td className="px-4 py-3">
                      <p className="truncate font-medium text-gray-950">
                        {row.firstName || row.surname
                          ? `${row.firstName ?? ""} ${row.surname ?? ""}`.trim()
                          : row.email}
                      </p>
                      <p className="truncate text-xs text-gray-500">{row.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          row.accountType === "student"
                            ? "rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700"
                            : "rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700"
                        }
                      >
                        {row.accountType === "student" ? "Student" : "Snabbregistrering"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{methodLabel(row.registrationMethod)}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {row.verifiedIdentity
                        ? "Freja-verifierad"
                        : row.verifiedEmail
                          ? "E-post verifierad"
                          : "Overifierad"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{formatDateTime(row.createdAt)}</td>
                    <td className="px-4 py-3 text-gray-600">{formatDateTime(row.lastLoginAt)}</td>
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
          ariaLabel="Bläddra bland användare"
          previousLabel="Föregående"
          nextLabel="Nästa"
          isDisabled={query.isFetching}
        />
      </div>
    </ActionShell>
  );
}
