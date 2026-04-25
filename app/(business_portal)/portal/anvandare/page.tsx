"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, PencilLine, Plus, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { getActiveCompanyId } from "@/lib/company-access";
import { cn } from "@/lib/utils";
import { queueService } from "@/services/queue-service";
import { PortalControlSelectTrigger } from "../../_components/PortalControlSelectTrigger";

type UserRole = "admin" | "editor" | "reviewer";
type UserStatus = "active" | "invited" | "paused";
type PermissionKey =
  | "manage_users"
  | "manage_profile"
  | "manage_listings"
  | "view_applications"
  | "view_analytics";

type CompanyPortalUser = {
  id: string;
  companyId: number;
  name: string;
  email: string;
  status: UserStatus;
  role: UserRole;
  permissions: PermissionKey[];
  source: "seed" | "local";
};

type UserForm = {
  id?: string;
  name: string;
  email: string;
  status: UserStatus;
  role: UserRole;
  permissions: PermissionKey[];
  sendWelcomeEmail: boolean;
};

type DialogMode = "add" | "manage";

const STORAGE_PREFIX = "portal-company-users-v1";

const roleLabels: Record<UserRole, string> = {
  admin: "Administratör",
  editor: "Redaktör",
  reviewer: "Granskare",
};

const statusLabels: Record<UserStatus, string> = {
  active: "Aktiv",
  invited: "Inbjuden",
  paused: "Pausad",
};

const statusClasses: Record<UserStatus, string> = {
  active: "border-emerald-200 bg-emerald-50 text-emerald-700",
  invited: "border-sky-200 bg-sky-50 text-sky-700",
  paused: "border-slate-200 bg-slate-100 text-slate-700",
};

const permissionLabels: Record<PermissionKey, string> = {
  manage_users: "Hantera användare",
  manage_profile: "Redigera profil",
  manage_listings: "Hantera annonser",
  view_applications: "Se ansökningar",
  view_analytics: "Se data och analys",
};

const rolePermissions: Record<UserRole, PermissionKey[]> = {
  admin: [
    "manage_users",
    "manage_profile",
    "manage_listings",
    "view_applications",
    "view_analytics",
  ],
  editor: [
    "manage_profile",
    "manage_listings",
    "view_applications",
    "view_analytics",
  ],
  reviewer: ["view_applications", "view_analytics"],
};

const defaultForm: UserForm = {
  name: "",
  email: "",
  status: "active",
  role: "editor",
  permissions: [...rolePermissions.editor],
  sendWelcomeEmail: true,
};

function storageKey(companyId: number) {
  return `${STORAGE_PREFIX}-${companyId}`;
}

function sanitizeUser(
  entry: Partial<CompanyPortalUser>,
  fallbackCompanyId: number
): CompanyPortalUser | null {
  if (!entry.name || !entry.email || !entry.role || !entry.status || !entry.id) {
    return null;
  }

  const role = entry.role as UserRole;
  const status = entry.status as UserStatus;
  const fallbackPermissions = rolePermissions[role] ?? rolePermissions.editor;
  const permissions = Array.isArray(entry.permissions)
    ? entry.permissions.filter((value): value is PermissionKey =>
        Object.prototype.hasOwnProperty.call(permissionLabels, value)
      )
    : fallbackPermissions;

  return {
    id: String(entry.id),
    companyId:
      typeof entry.companyId === "number" ? entry.companyId : fallbackCompanyId,
    name: String(entry.name),
    email: String(entry.email),
    role,
    status,
    permissions: permissions.length > 0 ? permissions : fallbackPermissions,
    source: entry.source === "seed" ? "seed" : "local",
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

function buildSeedUser(
  companyId: number,
  fallbackName: string,
  fallbackEmail: string
): CompanyPortalUser {
  return {
    id: `seed-${companyId}`,
    companyId,
    name: fallbackName,
    email: fallbackEmail,
    status: "active",
    role: "admin",
    permissions: [...rolePermissions.admin],
    source: "seed",
  };
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function openWelcomeEmail(email: string, name: string, companyName: string) {
  if (typeof window === "undefined") {
    return;
  }

  const subject = encodeURIComponent(`Välkommen till ${companyName}`);
  const body = encodeURIComponent(
    `Hej ${name},\n\nVälkommen till ${companyName}. Du har lagts till som användare i portalen.\n\nLogga in med din e-postadress för att komma igång.\n`
  );

  window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
}

export default function UsersPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [companyName, setCompanyName] = useState("Företaget");
  const [users, setUsers] = useState<CompanyPortalUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [usersHydrated, setUsersHydrated] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"all" | UserStatus>("all");
  const [roleFilter, setRoleFilter] = useState<"all" | UserRole>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<DialogMode>("add");
  const [form, setForm] = useState<UserForm>(defaultForm);
  const [formError, setFormError] = useState<string | null>(null);

  const hasActiveFilters = statusFilter !== "all" || roleFilter !== "all";
  const companyId = getActiveCompanyId(user);

  useEffect(() => {
    if (!companyId) {
      setUsers([]);
      setUsersHydrated(false);
      return;
    }

    let active = true;
    setLoadingUsers(true);
    setUsersHydrated(false);

    const fallbackName =
      user?.displayName?.trim() ||
      user?.companyName?.trim() ||
      "Företagsadmin";
    const fallbackEmail = user?.email?.trim() || "kontakt@foretag.se";

    queueService
      .getCompany(companyId)
      .then((company) => {
        if (!active) return;
        setCompanyName(company.name || user?.companyName || "Företaget");
      })
      .catch(() => {
        if (!active) return;
        setCompanyName(user?.companyName || "Företaget");
      })
      .finally(() => {
        if (!active) return;

        const seedUser = buildSeedUser(companyId, fallbackName, fallbackEmail);
        let localUsers: CompanyPortalUser[] = [];

        if (typeof window !== "undefined") {
          const raw = window.localStorage.getItem(storageKey(companyId));
          if (raw) {
            try {
              const parsed = JSON.parse(raw) as Partial<CompanyPortalUser>[];
              if (Array.isArray(parsed)) {
                localUsers = parsed
                  .map((entry) => sanitizeUser(entry, companyId))
                  .filter((entry): entry is CompanyPortalUser => Boolean(entry));
              }
            } catch {
              localUsers = [];
            }
          }
        }

        setUsers(dedupeUsers([seedUser, ...localUsers]));
        setUsersHydrated(true);
        setLoadingUsers(false);
      });

    return () => {
      active = false;
    };
  }, [companyId, user?.companyName, user?.displayName, user?.email]);

  useEffect(() => {
    if (!companyId || !usersHydrated || typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(
      storageKey(companyId),
      JSON.stringify(users.filter((entry) => entry.source === "local"))
    );
  }, [companyId, users, usersHydrated]);

  const filteredUsers = useMemo(() => {
    return users.filter((entry) => {
      const matchesStatus =
        statusFilter === "all" || entry.status === statusFilter;
      const matchesRole = roleFilter === "all" || entry.role === roleFilter;

      return matchesStatus && matchesRole;
    });
  }, [roleFilter, statusFilter, users]);

  const openDialog = (mode: DialogMode) => {
    setDialogMode(mode);
    setForm({
      ...defaultForm,
      status: "active",
      permissions: [...rolePermissions.editor],
      sendWelcomeEmail: true,
    });
    setFormError(null);
    setIsDialogOpen(true);
  };

  const openManageDialog = (entry: CompanyPortalUser) => {
    setDialogMode("manage");
    setForm({
      id: entry.id,
      name: entry.name,
      email: entry.email,
      role: entry.role,
      status: entry.status,
      permissions: [...entry.permissions],
      sendWelcomeEmail: false,
    });
    setFormError(null);
    setIsDialogOpen(true);
  };

  const handleRoleChange = (role: UserRole) => {
    setForm((current) => ({
      ...current,
      role,
      permissions: [...rolePermissions[role]],
    }));
  };

  const togglePermission = (permission: PermissionKey, checked: boolean) => {
    setForm((current) => ({
      ...current,
      permissions: checked
        ? Array.from(new Set([...current.permissions, permission]))
        : current.permissions.filter((entry) => entry !== permission),
    }));
  };

  const handleSaveUser = () => {
    if (!companyId) {
      setFormError("Ogiltigt företags-ID.");
      return;
    }

    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();

    if (!name || !email) {
      setFormError("Namn och e-post måste fyllas i.");
      return;
    }

    if (!email.includes("@")) {
      setFormError("Ange en giltig e-postadress.");
      return;
    }

    if (form.permissions.length === 0) {
      setFormError("Välj minst en behörighet.");
      return;
    }

    const duplicate = users.some(
      (entry) =>
        entry.email.trim().toLowerCase() === email && entry.id !== form.id
    );

    if (duplicate) {
      setFormError("Det finns redan en användare med den e-postadressen.");
      return;
    }

    const nextUser: CompanyPortalUser = {
      id: form.id ?? `local-${Date.now()}`,
      companyId,
      name,
      email,
      status: form.status,
      role: form.role,
      permissions: [...form.permissions],
      source: "local",
    };

    setUsers((current) => {
      if (dialogMode === "manage" && form.id) {
        return dedupeUsers(
          current.map((entry) => (entry.id === form.id ? nextUser : entry))
        );
      }

      return dedupeUsers([...current, nextUser]);
    });

    if (dialogMode === "add" && form.sendWelcomeEmail) {
      openWelcomeEmail(email, name, companyName);
    }

    setIsDialogOpen(false);
    setForm(defaultForm);
    setFormError(null);
  };

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
        Logga in för att hantera användare i företagsportalen.
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
    <>
      <div className="space-y-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-theme-sm text-gray-500">Team</p>
              <h1 className="text-2xl font-semibold text-gray-900">Användare</h1>
            </div>
          </div>

          <div className="flex flex-col gap-3 border-b border-gray-200 pb-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="w-full sm:max-w-md">
                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                  <div className="grid min-w-0 flex-1 grid-cols-1 gap-2 sm:grid-cols-2">
                    <div className="min-w-0">
                      <Select
                        value={statusFilter}
                        onValueChange={(value) =>
                          setStatusFilter(value as "all" | UserStatus)
                        }
                      >
                        <PortalControlSelectTrigger
                          aria-label="Filtrera på status"
                        >
                          <SelectValue />
                        </PortalControlSelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Alla statusar</SelectItem>
                          <SelectItem value="active">Aktiva</SelectItem>
                          <SelectItem value="invited">Inbjudna</SelectItem>
                          <SelectItem value="paused">Pausade</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="min-w-0">
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
                  </div>

                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={() => {
                        setStatusFilter("all");
                        setRoleFilter("all");
                      }}
                      className="h-8 shrink-0 px-1 text-xs font-medium text-gray-500 transition-colors hover:text-[#004225]"
                    >
                      Rensa filter
                    </button>
                  )}
                </div>
              </div>

              <Button
                onPress={() => openDialog("add")}
                className="w-full sm:w-auto"
              >
                <Plus className="h-4 w-4" />
                Add User
              </Button>
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
                <p className="mt-1 text-sm text-gray-500">Ändra filter eller lägg till en ny.</p>
              </div>
            ) : (
              <>
                <div className="hidden grid-cols-[minmax(0,1.25fr)_minmax(0,1.3fr)_150px_160px_120px] gap-4 border-b border-gray-100 px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500 md:grid">
                  <span>Namn</span>
                  <span>E-post</span>
                  <span>Status</span>
                  <span>Roll</span>
                  <span />
                </div>

                <div className="divide-y divide-gray-100">
                  {filteredUsers.map((entry) => (
                    <article
                      key={entry.id}
                      className="grid gap-4 px-6 py-4 transition-colors hover:bg-gray-50/80 md:grid-cols-[minmax(0,1.25fr)_minmax(0,1.3fr)_150px_160px_120px] md:items-center"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#004225]/8 text-sm font-semibold text-[#004225]">
                          {initials(entry.name)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-gray-900">{entry.name}</p>
                          <p className="mt-1 text-xs text-gray-500">
                            {entry.permissions.length} behörigheter
                          </p>
                        </div>
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm text-gray-600">{entry.email}</p>
                      </div>

                      <div>
                        <Badge
                          className={cn(
                            "rounded-full px-2.5 py-1 text-xs font-medium",
                            statusClasses[entry.status]
                          )}
                        >
                          {statusLabels[entry.status]}
                        </Badge>
                      </div>

                      <div>
                        <span className="text-sm text-gray-700">
                          {roleLabels[entry.role]}
                        </span>
                      </div>

                      <div className="md:justify-self-end">
                        <Button
                          variant="secondary"
                          size="sm"
                          onPress={() => openManageDialog(entry)}
                        >
                          <PencilLine className="h-4 w-4" />
                          Hantera
                        </Button>
                      </div>
                    </article>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setFormError(null);
            setForm(defaultForm);
          }
        }}
      >
        <DialogContent className="max-w-2xl border-gray-200 bg-white">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "manage" ? "Hantera användare" : "Add User"}
            </DialogTitle>
            <DialogDescription>
              Redigera namn, roll, status och behörigheter för användaren.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="user-name">Namn</Label>
                <Input
                  id="user-name"
                  placeholder="För- och efternamn"
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, name: event.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="user-email">E-post</Label>
                <Input
                  id="user-email"
                  type="email"
                  placeholder="namn@foretag.se"
                  value={form.email}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, email: event.target.value }))
                  }
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="user-role">Roll</Label>
                <select
                  id="user-role"
                  className="h-10 w-full rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-900 shadow-xs outline-none transition focus:border-[#004225] focus:ring-4 focus:ring-[#004225]/10"
                  value={form.role}
                  onChange={(event) => handleRoleChange(event.target.value as UserRole)}
                >
                  <option value="admin">Administratör</option>
                  <option value="editor">Redaktör</option>
                  <option value="reviewer">Granskare</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="user-status">Status</Label>
                <select
                  id="user-status"
                  className="h-10 w-full rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-900 shadow-xs outline-none transition focus:border-[#004225] focus:ring-4 focus:ring-[#004225]/10"
                  value={form.status}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      status: event.target.value as UserStatus,
                    }))
                  }
                >
                  <option value="active">Aktiv</option>
                  <option value="invited">Inbjuden</option>
                  <option value="paused">Pausad</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Behörigheter</Label>
              <div className="grid gap-3 sm:grid-cols-2">
                {(Object.entries(permissionLabels) as [PermissionKey, string][]).map(
                  ([permission, label]) => (
                    <label
                      key={permission}
                      className="flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700"
                    >
                      <Checkbox
                        checked={form.permissions.includes(permission)}
                        className="mt-0.5"
                        onCheckedChange={(checked) =>
                          togglePermission(permission, checked === true)
                        }
                      />
                      <span>{label}</span>
                    </label>
                  )
                )}
              </div>
            </div>

            {dialogMode === "add" ? (
              <label className="flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
                <Checkbox
                  checked={form.sendWelcomeEmail}
                  className="mt-0.5"
                  onCheckedChange={(checked) =>
                    setForm((current) => ({
                      ...current,
                      sendWelcomeEmail: checked === true,
                    }))
                  }
                />
                <span>Skicka välkomstmail när användaren skapas</span>
              </label>
            ) : null}

            {formError ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {formError}
              </div>
            ) : null}
          </div>

          <DialogFooter>
            <Button variant="secondary" onPress={() => setIsDialogOpen(false)}>
              Avbryt
            </Button>
            <Button onPress={handleSaveUser}>
              {dialogMode === "manage" ? "Spara ändringar" : "Spara användare"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
