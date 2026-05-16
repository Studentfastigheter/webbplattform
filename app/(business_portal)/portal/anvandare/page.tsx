"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { getActiveCompanyId } from "@/lib/company-access";
import {
  companyService,
  type CompanyUserDTO,
} from "@/services/company";
import { PortalControlSelectTrigger } from "../../_components/shared/PortalControlSelectTrigger";

type UserRole = "admin" | "editor" | "reviewer";

type CompanyPortalUser = {
  id: string;
  companyId: number;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
};

const roleLabels: Record<UserRole, string> = {
  admin: "Administratör",
  editor: "Redaktör",
  reviewer: "Granskare",
};

function mapBackendRole(role?: CompanyUserDTO["role"] | null): UserRole {
  const roleName = role?.name?.trim().toLowerCase() ?? "";
  const accessLevel = role?.accessLevel ?? 0;

  if (
    roleName.includes("admin") ||
    roleName.includes("manager") ||
    roleName.includes("owner") ||
    accessLevel >= 80
  ) {
    return "admin";
  }

  if (
    roleName.includes("review") ||
    roleName.includes("viewer") ||
    roleName.includes("read") ||
    accessLevel <= 20
  ) {
    return "reviewer";
  }

  return "editor";
}

function mapBackendUser(dto: CompanyUserDTO): CompanyPortalUser | null {
  const email = dto.email?.trim();
  const phone = dto.phone?.trim() || null;
  if (!dto.id || !email) {
    return null;
  }

  const name = [dto.firstName, dto.surname]
    .filter((value): value is string => Boolean(value?.trim()))
    .join(" ")
    .trim();
  const role = mapBackendRole(dto.role);

  return {
    id: `backend-${dto.id}`,
    companyId: dto.companyId,
    name: name || email,
    email,
    phone,
    role,
  };
}

function dedupeUsers(users: CompanyPortalUser[]) {
  const byId = new Map<string, CompanyPortalUser>();
  const byEmail = new Map<string, CompanyPortalUser>();

  for (const user of users) {
    byId.set(user.id, user);
  }

  for (const user of byId.values()) {
    byEmail.set(user.email.trim().toLowerCase(), user);
  }

  return Array.from(byEmail.values()).sort((left, right) =>
    left.name.localeCompare(right.name, "sv")
  );
}

export default function UsersPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [users, setUsers] = useState<CompanyPortalUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<"all" | UserRole>("all");

  const hasActiveFilters = roleFilter !== "all";
  const companyId = getActiveCompanyId(user);

  useEffect(() => {
    if (!companyId) {
      setUsers([]);
      setLoadingUsers(false);
      setUsersError(null);
      return;
    }

    let active = true;
    setLoadingUsers(true);
    setUsersError(null);

    companyService
      .users(companyId)
      .then((result) => {
        if (!active) return;
        const backendUsers = result
          .map(mapBackendUser)
          .filter((entry): entry is CompanyPortalUser => Boolean(entry));
        setUsers(dedupeUsers(backendUsers));
        setLoadingUsers(false);
      })
      .catch((error) => {
        if (!active) return;
        setUsers([]);
        setUsersError(
          error instanceof Error
            ? error.message
            : "Kunde inte hämta användare från backend."
        );
        setLoadingUsers(false);
      });

    return () => {
      active = false;
    };
  }, [companyId]);

  const filteredUsers = useMemo(() => {
    return users.filter((entry) => {
      const matchesRole = roleFilter === "all" || entry.role === roleFilter;

      return matchesRole;
    });
  }, [roleFilter, users]);

  if (authLoading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-500">
        Laddar användare...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
        Logga in för att visa användare i företagsportalen.
      </div>
    );
  }

  if (!companyId) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
        Denna sida är bara tillgänglig för företagskonton.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Användare</h1>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-b border-gray-200 pb-3">
          <div className="w-full sm:max-w-xs">
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
              <div className="min-w-0 flex-1">
                <Select
                  value={roleFilter}
                  onValueChange={(value) =>
                    setRoleFilter(value as "all" | UserRole)
                  }
                >
                  <PortalControlSelectTrigger
                    aria-label="Filtrera på roll"
                  >
                    <SelectValue />
                  </PortalControlSelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alla roller</SelectItem>
                    <SelectItem value="admin">Administratörer</SelectItem>
                    <SelectItem value="editor">Redaktörer</SelectItem>
                    <SelectItem value="reviewer">Granskare</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={() => {
                    setRoleFilter("all");
                  }}
                  className="h-8 shrink-0 px-1 text-xs font-medium text-gray-500 transition-colors hover:text-[#004225]"
                >
                  Rensa filter
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <Card className="border-gray-200 bg-white shadow-sm">
        <CardContent className="px-0">
          {loadingUsers ? (
            <div className="flex items-center gap-2 px-6 py-10 text-sm text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Hämtar användarlista...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#004225]/8 text-[#004225]">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <p className="mt-4 font-medium text-gray-900">Inga användare hittades</p>
              <p className="mt-1 text-sm text-gray-500">
                {usersError ??
                  (users.length > 0
                    ? "Inga användare matchar valt filter."
                    : "Endpointen returnerade inga användare.")}
              </p>
            </div>
          ) : (
            <>
              {usersError ? (
                <div className="border-b border-amber-100 bg-amber-50 px-6 py-3 text-sm text-amber-800">
                  {usersError}
                </div>
              ) : null}
              <div className="hidden grid-cols-[minmax(0,1.25fr)_minmax(0,1.3fr)_160px] gap-4 border-b border-gray-100 px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500 md:grid">
                <span>Namn</span>
                <span>Kontaktuppgifter</span>
                <span>Roll</span>
              </div>

              <div className="divide-y divide-gray-100">
                {filteredUsers.map((entry) => (
                  <article
                    key={entry.id}
                    className="grid gap-4 px-6 py-4 transition-colors hover:bg-gray-50/80 md:grid-cols-[minmax(0,1.25fr)_minmax(0,1.3fr)_160px] md:items-center"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-gray-900">{entry.name}</p>
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm text-gray-600">{entry.email}</p>
                      {entry.phone ? (
                        <p className="mt-1 truncate text-sm text-gray-500">
                          {entry.phone}
                        </p>
                      ) : null}
                    </div>

                    <div>
                      <span className="text-sm text-gray-700">
                        {roleLabels[entry.role]}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
