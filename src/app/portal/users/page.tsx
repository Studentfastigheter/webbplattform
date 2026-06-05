"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Loader2, Pencil, Plus, ShieldCheck, UserCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { getActiveCompanyId } from "@/lib/company-access";
import {
  type CompanyRole,
  type CompanyUserDTO,
} from "@/features/companies/services/company-service";
import {
  useCompanyRoles,
  useCompanyUsers,
  useCreateCompanyUser,
  useUpdateCompanyUser,
  useVerifyCompanyUser,
} from "@/features/companies/hooks/useCompanies";
import { PortalControlSelectTrigger } from "../_components/shared/PortalControlSelectTrigger";

type UserRole = "admin" | "manager" | "agent";
type RoleSource = CompanyUserDTO["role"] | string | null | undefined;

type CompanyPortalUser = {
  id: string;
  backendId: number;
  companyId: number;
  firstName: string;
  surname: string;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  roleDetails: CompanyUserDTO["role"] | null;
  verified: boolean;
};

type UserAccountFormState = {
  firstName: string;
  surname: string;
  email: string;
  phone: string;
  password: string;
  roleName: string;
};

const roleLabels: Record<UserRole, string> = {
  admin: "Admin",
  manager: "Manager",
  agent: "Agent",
};

function createEmptyUserAccountForm(roleName = ""): UserAccountFormState {
  return {
    firstName: "",
    surname: "",
    email: "",
    phone: "",
    password: "",
    roleName,
  };
}

function getRoleName(role?: RoleSource) {
  if (typeof role === "string") {
    return role.trim().toUpperCase();
  }

  return role?.name?.trim().toUpperCase() ?? "";
}

function canRoleVerifyUsers(role?: RoleSource) {
  const roleName = getRoleName(role);
  return roleName === "ADMIN" || roleName === "MANAGER";
}

function canRoleManageUsers(role?: RoleSource) {
  return getRoleName(role) === "ADMIN";
}

function getPreferredCreateRoleName(roles: CompanyRole[]) {
  return (
    roles.find((role) => getRoleName(role) === "AGENT")?.name ??
    roles.find((role) => getRoleName(role) !== "ADMIN")?.name ??
    roles[0]?.name ??
    ""
  );
}

function getRoleDisplayName(roleName: string) {
  const normalizedRoleName = roleName.trim().toUpperCase();
  if (normalizedRoleName === "ADMIN") return "Admin";
  if (normalizedRoleName === "MANAGER") return "Manager";
  if (normalizedRoleName === "AGENT") return "Agent";
  return roleName;
}

function getRoleOptionLabel(role: CompanyRole) {
  const roleName = role.name?.trim() || "Okänd roll";
  return getRoleDisplayName(roleName);
}

function mapBackendRole(role?: CompanyUserDTO["role"] | null): UserRole {
  const roleName = getRoleName(role);

  if (roleName === "ADMIN") {
    return "admin";
  }

  if (roleName === "MANAGER") {
    return "manager";
  }

  return "agent";
}

function mapBackendUser(dto: CompanyUserDTO): CompanyPortalUser | null {
  const backendId = Number(dto.id);
  const email = dto.email?.trim();
  const phone = dto.phone?.trim() || null;
  if (!Number.isFinite(backendId) || !email) {
    return null;
  }

  const name = [dto.firstName, dto.surname]
    .filter((value): value is string => Boolean(value?.trim()))
    .join(" ")
    .trim();
  const role = mapBackendRole(dto.role);

  return {
    id: `backend-${backendId}`,
    backendId,
    companyId: dto.companyId,
    firstName: dto.firstName?.trim() ?? "",
    surname: dto.surname?.trim() ?? "",
    name: name || email,
    email,
    phone,
    role,
    roleDetails: dto.role ?? null,
    verified: dto.verified === true,
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

function VerificationBadge({ verified }: { verified: boolean }) {
  return (
    <span
      className={[
        "inline-flex h-7 items-center rounded-full px-3 text-xs font-semibold",
        verified
          ? "bg-emerald-50 text-emerald-700"
          : "bg-amber-50 text-amber-700",
      ].join(" ")}
    >
      {verified ? "Verifierad" : "Ej verifierad"}
    </span>
  );
}

export default function UsersPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [roleFilter, setRoleFilter] = useState<"all" | UserRole>("all");
  const [verifyingUserId, setVerifyingUserId] = useState<number | null>(null);
  const createUserMutation = useCreateCompanyUser();
  const updateUserMutation = useUpdateCompanyUser();
  const verifyUserMutation = useVerifyCompanyUser();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingUser, setEditingUser] = useState<CompanyPortalUser | null>(null);
  const [accountForm, setAccountForm] = useState<UserAccountFormState>(() =>
    createEmptyUserAccountForm()
  );
  const [savingAccount, setSavingAccount] = useState(false);

  const hasActiveFilters = roleFilter !== "all";
  const companyId = getActiveCompanyId(user);

  // Reference data — roles list. Long staleTime; shared between this page
  // and any other admin/portal surface that lists role names.
  const {
    data: roles = [],
    isLoading: rolesLoading,
    isError: isRolesError,
    error: rolesErr,
  } = useCompanyRoles();
  const rolesError = isRolesError && rolesErr
    ? rolesErr instanceof Error
      ? rolesErr.message
      : "Kunde inte hämta roller från backend."
    : null;

  // Company users list. Returns raw DTOs; we adapt to CompanyPortalUser via
  // a memo so re-mounts share both the network result and the adapted shape.
  const {
    data: backendUsersDTOs = [],
    isLoading: loadingUsers,
    isError: isUsersError,
    error: usersErr,
  } = useCompanyUsers(companyId);
  const usersError = isUsersError && usersErr
    ? usersErr instanceof Error
      ? usersErr.message
      : "Kunde inte hämta användare från backend."
    : null;
  const users = useMemo<CompanyPortalUser[]>(
    () =>
      dedupeUsers(
        backendUsersDTOs
          .map(mapBackendUser)
          .filter((entry): entry is CompanyPortalUser => Boolean(entry)),
      ),
    [backendUsersDTOs],
  );

  const defaultCreateRoleName = useMemo(() => getPreferredCreateRoleName(roles), [roles]);

  // No-op refresh hook for callers that previously triggered a manual
  // refetch. Each mutation hook owns its own invalidation, so this just
  // exists for backwards compatibility with the closure deps below.
  const loadUsers = useCallback(async () => {
    // Mutation hooks invalidate qk.companies.users on settle; nothing to do.
  }, []);

  useEffect(() => {
    if (dialogOpen && !accountForm.roleName && defaultCreateRoleName) {
      setAccountForm((current) => ({ ...current, roleName: defaultCreateRoleName }));
    }
  }, [accountForm.roleName, defaultCreateRoleName, dialogOpen]);

  const filteredUsers = useMemo(() => {
    return users.filter((entry) => {
      const matchesRole = roleFilter === "all" || entry.role === roleFilter;

      return matchesRole;
    });
  }, [roleFilter, users]);

  const currentCompanyUser = useMemo(() => {
    const currentEmail = user?.email?.trim().toLowerCase();
    const currentUserId =
      typeof user?.id === "number" && Number.isFinite(user.id) ? user.id : null;

    return (
      users.find((entry) => {
        if (entry.companyId !== companyId) {
          return false;
        }

        if (currentUserId != null && entry.backendId === currentUserId) {
          return true;
        }

        return Boolean(currentEmail && entry.email.trim().toLowerCase() === currentEmail);
      }) ?? null
    );
  }, [companyId, user?.email, user?.id, users]);

  const canVerifyUsers =
    currentCompanyUser?.verified === true &&
    canRoleVerifyUsers(currentCompanyUser.roleDetails);

  const canManageUsers =
    currentCompanyUser?.verified === true &&
    canRoleManageUsers(currentCompanyUser.roleDetails);

  const patchAccountForm = useCallback((patch: Partial<UserAccountFormState>) => {
    setAccountForm((current) => ({ ...current, ...patch }));
  }, []);

  const openCreateDialog = useCallback(() => {
    if (!canManageUsers) {
      toast.error("Endast verifierad ADMIN kan skapa företagskonton.");
      return;
    }

    setFormMode("create");
    setEditingUser(null);
    setAccountForm(createEmptyUserAccountForm(defaultCreateRoleName));
    setDialogOpen(true);
  }, [canManageUsers, defaultCreateRoleName]);

  const openEditDialog = useCallback(
    (entry: CompanyPortalUser) => {
      if (!canManageUsers) {
        toast.error("Endast verifierad ADMIN kan uppdatera företagskonton.");
        return;
      }

      setFormMode("edit");
      setEditingUser(entry);
      setAccountForm({
        firstName: entry.firstName,
        surname: entry.surname,
        email: entry.email,
        phone: entry.phone ?? "",
        password: "",
        roleName: getRoleName(entry.roleDetails) || defaultCreateRoleName,
      });
      setDialogOpen(true);
    },
    [canManageUsers, defaultCreateRoleName]
  );

  const handleSaveAccount = useCallback(async () => {
    if (!companyId || !canManageUsers) {
      return;
    }

    const roleName = accountForm.roleName.trim();
    const email = accountForm.email.trim();
    const password = accountForm.password.trim();

    if (!roleName) {
      toast.error("Välj roll.");
      return;
    }

    if (formMode === "create") {
      if (!email || !password) {
        toast.error("E-post och lösenord krävs.");
        return;
      }
      if (password.length < 6) {
        toast.error("Lösenordet måste vara minst 6 tecken.");
        return;
      }
    }

    if (formMode === "edit" && !editingUser) {
      toast.error("Välj ett konto att uppdatera.");
      return;
    }

    setSavingAccount(true);

    try {
      if (formMode === "create") {
        await createUserMutation.mutateAsync({
          companyId,
          payload: {
            email,
            password,
            firstName: accountForm.firstName.trim(),
            surname: accountForm.surname.trim(),
            phone: accountForm.phone.trim(),
            roleName,
          },
        });
        toast.success("Företagskontot skapades.");
      } else if (editingUser) {
        await updateUserMutation.mutateAsync({
          companyId,
          userId: editingUser.backendId,
          payload: {
            firstName: accountForm.firstName.trim(),
            surname: accountForm.surname.trim(),
            phone: accountForm.phone.trim(),
            roleName,
          },
        });
        toast.success("Företagskontot uppdaterades.");
      }

      setDialogOpen(false);
      setEditingUser(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Kunde inte spara företagskontot."
      );
    } finally {
      setSavingAccount(false);
    }
  }, [
    accountForm,
    canManageUsers,
    companyId,
    createUserMutation,
    editingUser,
    formMode,
    updateUserMutation,
  ]);

  const handleVerifyUser = useCallback(
    async (entry: CompanyPortalUser) => {
      if (!companyId || !canVerifyUsers || entry.verified) {
        return;
      }

      setVerifyingUserId(entry.backendId);

      try {
        // The mutation owns the optimistic patch (verified badge flips
        // immediately) and the rollback if the request fails.
        await verifyUserMutation.mutateAsync({
          companyId,
          userId: entry.backendId,
        });
        toast.success(`${entry.name} är verifierad.`);
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Kunde inte verifiera användaren."
        );
      } finally {
        setVerifyingUserId(null);
      }
    },
    [canVerifyUsers, companyId, verifyUserMutation]
  );

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
          {canManageUsers ? (
            <Button type="button" size="sm" onPress={openCreateDialog}>
              <Plus className="h-4 w-4" />
              Nytt konto
            </Button>
          ) : null}
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
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Managers</SelectItem>
                    <SelectItem value="agent">Agents</SelectItem>
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

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!savingAccount) {
            setDialogOpen(open);
          }
        }}
      >
        <DialogContent className="bg-white sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {formMode === "create" ? "Nytt företagskonto" : "Uppdatera företagskonto"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="company-user-first-name">Förnamn</Label>
                <Input
                  id="company-user-first-name"
                  value={accountForm.firstName}
                  onChange={(event) => patchAccountForm({ firstName: event.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="company-user-surname">Efternamn</Label>
                <Input
                  id="company-user-surname"
                  value={accountForm.surname}
                  onChange={(event) => patchAccountForm({ surname: event.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="company-user-email">E-post</Label>
                <Input
                  id="company-user-email"
                  type="email"
                  value={accountForm.email}
                  disabled={formMode === "edit"}
                  onChange={(event) => patchAccountForm({ email: event.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="company-user-phone">Telefon</Label>
                <Input
                  id="company-user-phone"
                  value={accountForm.phone}
                  onChange={(event) => patchAccountForm({ phone: event.target.value })}
                />
              </div>
            </div>

            {formMode === "create" ? (
              <div className="grid gap-2">
                <Label htmlFor="company-user-password">Lösenord</Label>
                <Input
                  id="company-user-password"
                  type="password"
                  value={accountForm.password}
                  onChange={(event) => patchAccountForm({ password: event.target.value })}
                />
              </div>
            ) : null}

            <div className="grid gap-2">
              <Label>Roll</Label>
              <Select
                value={accountForm.roleName}
                disabled={rolesLoading || roles.length === 0}
                onValueChange={(roleName) => patchAccountForm({ roleName })}
              >
                <PortalControlSelectTrigger aria-label="Välj roll">
                  <SelectValue
                    placeholder={rolesLoading ? "Hämtar roller..." : "Välj roll"}
                  />
                </PortalControlSelectTrigger>
                <SelectContent>
                  {roles.map((role) => {
                    const roleName = role.name?.trim();
                    if (!roleName) return null;

                    return (
                      <SelectItem key={roleName} value={roleName}>
                        {getRoleOptionLabel(role)}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {rolesError ? (
              <div className="rounded-md border border-amber-100 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                {rolesError}
              </div>
            ) : null}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              isDisabled={savingAccount}
              onPress={() => setDialogOpen(false)}
            >
              Avbryt
            </Button>
            <Button
              type="button"
              isLoading={savingAccount}
              isDisabled={rolesLoading || roles.length === 0}
              onPress={handleSaveAccount}
            >
              {formMode === "create" ? "Skapa konto" : "Spara ändringar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="border-gray-200 bg-white shadow-sm">
        <CardContent className="px-0">
          {!loadingUsers && users.length > 0 && !canVerifyUsers ? (
            <div className="border-b border-gray-100 bg-gray-50 px-6 py-3 text-sm text-gray-600">
              Endast verifierade ADMIN och MANAGER kan verifiera användare.
            </div>
          ) : null}
          {!loadingUsers && users.length > 0 && !canManageUsers ? (
            <div className="border-b border-gray-100 bg-gray-50 px-6 py-3 text-sm text-gray-600">
              Endast verifierad ADMIN kan skapa och uppdatera användare.
            </div>
          ) : null}

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
              <div className="hidden grid-cols-[minmax(0,1.2fr)_minmax(0,1.3fr)_130px_140px_220px] gap-4 border-b border-gray-100 px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500 md:grid">
                <span>Namn</span>
                <span>Kontaktuppgifter</span>
                <span>Roll</span>
                <span>Status</span>
                <span>Åtgärd</span>
              </div>

              <div className="divide-y divide-gray-100">
                {filteredUsers.map((entry) => {
                  const isCurrentUser = currentCompanyUser?.backendId === entry.backendId;
                  const isVerifying = verifyingUserId === entry.backendId;

                  return (
                    <article
                      key={entry.id}
                      className="grid gap-4 px-6 py-4 transition-colors hover:bg-gray-50/80 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1.3fr)_130px_140px_220px] md:items-center"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium text-gray-900">{entry.name}</p>
                        {isCurrentUser ? (
                          <p className="mt-1 text-xs font-medium text-[#004225]">
                            Inloggat konto
                          </p>
                        ) : null}
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

                      <div>
                        <VerificationBadge verified={entry.verified} />
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {canManageUsers ? (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="min-w-[90px]"
                            isDisabled={savingAccount}
                            onPress={() => openEditDialog(entry)}
                          >
                            <Pencil className="h-4 w-4" />
                            Ändra
                          </Button>
                        ) : null}
                        {canVerifyUsers && !entry.verified && !isCurrentUser ? (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="min-w-[126px]"
                            isLoading={isVerifying}
                            isDisabled={verifyingUserId !== null}
                            onPress={() => handleVerifyUser(entry)}
                          >
                            <UserCheck className="h-4 w-4" />
                            Verifiera
                          </Button>
                        ) : !canManageUsers ? (
                          <span className="text-sm text-gray-400">-</span>
                        ) : null}
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
