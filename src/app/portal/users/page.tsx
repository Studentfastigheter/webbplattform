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
  companyService,
  type CompanyRole,
  type CompanyUserDTO,
} from "@/features/companies/services/company-service";
import { PortalControlSelectTrigger } from "../_components/shared/PortalControlSelectTrigger";
import { useI18n } from "@/i18n/I18nProvider";
import type { Locale } from "@/i18n/config";
import { localizedText, numberLocale } from "@/i18n/text";

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

const roleLabels: Record<UserRole, { sv: string; en: string }> = {
  admin: { sv: "Admin", en: "Admin" },
  manager: { sv: "Manager", en: "Manager" },
  agent: { sv: "Agent", en: "Agent" },
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

function getRoleDisplayName(roleName: string, locale: Locale) {
  const normalizedRoleName = roleName.trim().toUpperCase();
  if (normalizedRoleName === "ADMIN") return localizedText(locale, "Admin", "Admin");
  if (normalizedRoleName === "MANAGER") return localizedText(locale, "Manager", "Manager");
  if (normalizedRoleName === "AGENT") return localizedText(locale, "Agent", "Agent");
  return roleName;
}

function getRoleOptionLabel(role: CompanyRole, locale: Locale) {
  const roleName = role.name?.trim() || localizedText(locale, "Okänd roll", "Unknown role");
  return getRoleDisplayName(roleName, locale);
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

function VerificationBadge({ verified, locale }: { verified: boolean; locale: Locale }) {
  return (
    <span
      className={[
        "inline-flex h-7 items-center rounded-full px-3 text-xs font-semibold",
        verified
          ? "bg-emerald-50 text-emerald-700"
          : "bg-amber-50 text-amber-700",
      ].join(" ")}
    >
      {verified
        ? localizedText(locale, "Verifierad", "Verified")
        : localizedText(locale, "Ej verifierad", "Not verified")}
    </span>
  );
}

export default function UsersPage() {
  const { locale } = useI18n();
  const { user, isLoading: authLoading } = useAuth();
  const [users, setUsers] = useState<CompanyPortalUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<"all" | UserRole>("all");
  const [verifyingUserId, setVerifyingUserId] = useState<number | null>(null);
  const [roles, setRoles] = useState<CompanyRole[]>([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [rolesError, setRolesError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingUser, setEditingUser] = useState<CompanyPortalUser | null>(null);
  const [accountForm, setAccountForm] = useState<UserAccountFormState>(() =>
    createEmptyUserAccountForm()
  );
  const [savingAccount, setSavingAccount] = useState(false);

  const hasActiveFilters = roleFilter !== "all";
  const companyId = getActiveCompanyId(user);
  const defaultCreateRoleName = useMemo(() => getPreferredCreateRoleName(roles), [roles]);

  const loadUsers = useCallback(async () => {
    if (!companyId) {
      setUsers([]);
      setLoadingUsers(false);
      setUsersError(null);
      return;
    }

    setLoadingUsers(true);
    setUsersError(null);

    try {
      const result = await companyService.users(companyId);
      const backendUsers = result
        .map(mapBackendUser)
        .filter((entry): entry is CompanyPortalUser => Boolean(entry));
      setUsers(dedupeUsers(backendUsers));
    } catch (error) {
      setUsers([]);
      setUsersError(
        error instanceof Error
          ? error.message
          : localizedText(locale, "Kunde inte hämta användare från backend.", "Could not load users from the backend.")
      );
    } finally {
      setLoadingUsers(false);
    }
  }, [companyId, locale]);

  useEffect(() => {
    let active = true;
    setRolesLoading(true);
    setRolesError(null);

    companyService
      .roles()
      .then((result) => {
        if (!active) return;
        setRoles(result);
        setRolesLoading(false);
      })
      .catch((error) => {
        if (!active) return;
        setRoles([]);
        setRolesError(
          error instanceof Error
            ? error.message
            : localizedText(locale, "Kunde inte hämta roller från backend.", "Could not load roles from the backend.")
        );
        setRolesLoading(false);
      });

    return () => {
      active = false;
    };
  }, [locale]);

  useEffect(() => {
    if (!companyId) {
      setUsers([]);
      setLoadingUsers(false);
      setUsersError(null);
      return;
    }

    void loadUsers();
  }, [companyId, loadUsers]);

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
      toast.error(localizedText(locale, "Endast verifierad ADMIN kan skapa företagskonton.", "Only a verified ADMIN can create company accounts."));
      return;
    }

    setFormMode("create");
    setEditingUser(null);
    setAccountForm(createEmptyUserAccountForm(defaultCreateRoleName));
    setDialogOpen(true);
  }, [canManageUsers, defaultCreateRoleName, locale]);

  const openEditDialog = useCallback(
    (entry: CompanyPortalUser) => {
      if (!canManageUsers) {
        toast.error(localizedText(locale, "Endast verifierad ADMIN kan uppdatera företagskonton.", "Only a verified ADMIN can update company accounts."));
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
    [canManageUsers, defaultCreateRoleName, locale]
  );

  const handleSaveAccount = useCallback(async () => {
    if (!companyId || !canManageUsers) {
      return;
    }

    const roleName = accountForm.roleName.trim();
    const email = accountForm.email.trim();
    const password = accountForm.password.trim();

    if (!roleName) {
      toast.error(localizedText(locale, "Välj roll.", "Choose a role."));
      return;
    }

    if (formMode === "create") {
      if (!email || !password) {
        toast.error(localizedText(locale, "E-post och lösenord krävs.", "Email and password are required."));
        return;
      }
      if (password.length < 6) {
        toast.error(localizedText(locale, "Lösenordet måste vara minst 6 tecken.", "The password must be at least 6 characters."));
        return;
      }
    }

    if (formMode === "edit" && !editingUser) {
      toast.error(localizedText(locale, "Välj ett konto att uppdatera.", "Choose an account to update."));
      return;
    }

    setSavingAccount(true);

    try {
      if (formMode === "create") {
        await companyService.createUser({
          email,
          password,
          firstName: accountForm.firstName.trim(),
          surname: accountForm.surname.trim(),
          phone: accountForm.phone.trim(),
          roleName,
        });
        toast.success(localizedText(locale, "Företagskontot skapades.", "The company account was created."));
      } else if (editingUser) {
        await companyService.updateUser(companyId, editingUser.backendId, {
          firstName: accountForm.firstName.trim(),
          surname: accountForm.surname.trim(),
          phone: accountForm.phone.trim(),
          roleName,
        });
        toast.success(localizedText(locale, "Företagskontot uppdaterades.", "The company account was updated."));
      }

      setDialogOpen(false);
      setEditingUser(null);
      await loadUsers();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : localizedText(locale, "Kunde inte spara företagskontot.", "Could not save the company account.")
      );
    } finally {
      setSavingAccount(false);
    }
  }, [
    accountForm,
    canManageUsers,
    companyId,
    editingUser,
    formMode,
    locale,
    loadUsers,
  ]);

  const handleVerifyUser = useCallback(
    async (entry: CompanyPortalUser) => {
      if (!companyId || !canVerifyUsers || entry.verified) {
        return;
      }

      setVerifyingUserId(entry.backendId);

      try {
        await companyService.verifyUser(companyId, entry.backendId);
        setUsers((current) =>
          current.map((userEntry) =>
            userEntry.backendId === entry.backendId
              ? { ...userEntry, verified: true }
              : userEntry
          )
        );
        toast.success(localizedText(locale, `${entry.name} är verifierad.`, `${entry.name} is verified.`));
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : localizedText(locale, "Kunde inte verifiera användaren.", "Could not verify the user.")
        );
      } finally {
        setVerifyingUserId(null);
      }
    },
    [canVerifyUsers, companyId, locale]
  );

  if (authLoading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-500">
        {localizedText(locale, "Laddar användare...", "Loading users...")}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
        {localizedText(locale, "Logga in för att visa användare i företagsportalen.", "Log in to view users in the company portal.")}
      </div>
    );
  }

  if (!companyId) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
        {localizedText(locale, "Denna sida är bara tillgänglig för företagskonton.", "This page is only available for company accounts.")}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              {localizedText(locale, "Användare", "Users")}
            </h1>
          </div>
          {canManageUsers ? (
            <Button type="button" size="sm" onPress={openCreateDialog}>
              <Plus className="h-4 w-4" />
              {localizedText(locale, "Nytt konto", "New account")}
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
                    aria-label={localizedText(locale, "Filtrera på roll", "Filter by role")}
                  >
                    <SelectValue />
                  </PortalControlSelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{localizedText(locale, "Alla roller", "All roles")}</SelectItem>
                    <SelectItem value="admin">{localizedText(locale, "Admin", "Admin")}</SelectItem>
                    <SelectItem value="manager">{localizedText(locale, "Managers", "Managers")}</SelectItem>
                    <SelectItem value="agent">{localizedText(locale, "Agents", "Agents")}</SelectItem>
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
                  {localizedText(locale, "Rensa filter", "Clear filters")}
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
              {formMode === "create"
                ? localizedText(locale, "Nytt företagskonto", "New company account")
                : localizedText(locale, "Uppdatera företagskonto", "Update company account")}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="company-user-first-name">{localizedText(locale, "Förnamn", "First name")}</Label>
                <Input
                  id="company-user-first-name"
                  value={accountForm.firstName}
                  onChange={(event) => patchAccountForm({ firstName: event.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="company-user-surname">{localizedText(locale, "Efternamn", "Last name")}</Label>
                <Input
                  id="company-user-surname"
                  value={accountForm.surname}
                  onChange={(event) => patchAccountForm({ surname: event.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="company-user-email">{localizedText(locale, "E-post", "Email")}</Label>
                <Input
                  id="company-user-email"
                  type="email"
                  value={accountForm.email}
                  disabled={formMode === "edit"}
                  onChange={(event) => patchAccountForm({ email: event.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="company-user-phone">{localizedText(locale, "Telefon", "Phone")}</Label>
                <Input
                  id="company-user-phone"
                  value={accountForm.phone}
                  onChange={(event) => patchAccountForm({ phone: event.target.value })}
                />
              </div>
            </div>

            {formMode === "create" ? (
              <div className="grid gap-2">
                <Label htmlFor="company-user-password">{localizedText(locale, "Lösenord", "Password")}</Label>
                <Input
                  id="company-user-password"
                  type="password"
                  value={accountForm.password}
                  onChange={(event) => patchAccountForm({ password: event.target.value })}
                />
              </div>
            ) : null}

            <div className="grid gap-2">
              <Label>{localizedText(locale, "Roll", "Role")}</Label>
              <Select
                value={accountForm.roleName}
                disabled={rolesLoading || roles.length === 0}
                onValueChange={(roleName) => patchAccountForm({ roleName })}
              >
                <PortalControlSelectTrigger aria-label={localizedText(locale, "Välj roll", "Choose role")}>
                  <SelectValue
                    placeholder={rolesLoading
                      ? localizedText(locale, "Hämtar roller...", "Loading roles...")
                      : localizedText(locale, "Välj roll", "Choose role")}
                  />
                </PortalControlSelectTrigger>
                <SelectContent>
                  {roles.map((role) => {
                    const roleName = role.name?.trim();
                    if (!roleName) return null;

                    return (
                      <SelectItem key={roleName} value={roleName}>
                        {getRoleOptionLabel(role, locale)}
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
              {localizedText(locale, "Avbryt", "Cancel")}
            </Button>
            <Button
              type="button"
              isLoading={savingAccount}
              isDisabled={rolesLoading || roles.length === 0}
              onPress={handleSaveAccount}
            >
              {formMode === "create"
                ? localizedText(locale, "Skapa konto", "Create account")
                : localizedText(locale, "Spara ändringar", "Save changes")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="border-gray-200 bg-white shadow-sm">
        <CardContent className="px-0">
          {!loadingUsers && users.length > 0 && !canVerifyUsers ? (
            <div className="border-b border-gray-100 bg-gray-50 px-6 py-3 text-sm text-gray-600">
              {localizedText(locale, "Endast verifierade ADMIN och MANAGER kan verifiera användare.", "Only verified ADMIN and MANAGER users can verify users.")}
            </div>
          ) : null}
          {!loadingUsers && users.length > 0 && !canManageUsers ? (
            <div className="border-b border-gray-100 bg-gray-50 px-6 py-3 text-sm text-gray-600">
              {localizedText(locale, "Endast verifierad ADMIN kan skapa och uppdatera användare.", "Only a verified ADMIN can create and update users.")}
            </div>
          ) : null}

          {loadingUsers ? (
            <div className="flex items-center gap-2 px-6 py-10 text-sm text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              {localizedText(locale, "Hämtar användarlista...", "Loading user list...")}
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#004225]/8 text-[#004225]">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <p className="mt-4 font-medium text-gray-900">
                {localizedText(locale, "Inga användare hittades", "No users found")}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {usersError ??
                  (users.length > 0
                    ? localizedText(locale, "Inga användare matchar valt filter.", "No users match the selected filter.")
                    : localizedText(locale, "Endpointen returnerade inga användare.", "The endpoint returned no users."))}
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
                <span>{localizedText(locale, "Namn", "Name")}</span>
                <span>{localizedText(locale, "Kontaktuppgifter", "Contact details")}</span>
                <span>{localizedText(locale, "Roll", "Role")}</span>
                <span>{localizedText(locale, "Status", "Status")}</span>
                <span>{localizedText(locale, "Åtgärd", "Action")}</span>
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
                            {localizedText(locale, "Inloggat konto", "Signed-in account")}
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
                          {localizedText(locale, roleLabels[entry.role].sv, roleLabels[entry.role].en)}
                        </span>
                      </div>

                      <div>
                        <VerificationBadge verified={entry.verified} locale={locale} />
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
                            {localizedText(locale, "Ändra", "Edit")}
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
                            {localizedText(locale, "Verifiera", "Verify")}
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
