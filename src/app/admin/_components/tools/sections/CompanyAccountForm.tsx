"use client";

import { useEffect, useState } from "react";
import { CheckCircle2Icon, RefreshCwIcon, Trash2Icon, XCircleIcon } from "@/components/icons";
import { useConfirmDialog } from "@/components/ui/confirm-dialog";
import { adminService } from "@/features/admin/services/admin-service";
import { useAdminCitySummaries, useAdminCompanies, useAdminCompanyRoles, useAdminCreateCompanyAdmin, useAdminDeleteCompanyAccount, useAdminManageCompanyAccount, useAdminVerifyCompanyAccount } from "@/features/admin/hooks/useAdmin";
import { normalizeCityCode } from "@/features/cities/services/city-service";
import type { AdminCompanyRole, AdminCompanyUserDTO, AdminCreateCompanyUserRequest, AdminCompanyPublicDTO, CityDTO } from "@/types";
import {
  type AdminActionState,
  toInputValue,
  parseRequiredNumber,
  parseOptionalNumber,
  useResourceList,
  ResultBlock,
  ActionShell,
  FormInput,
  FormSelect,
  SubmitButton,
  cityCode,
  cityOptionLabel,
} from "../shared";

function createEmptyCompanyAccountForm(companyId = "") {
  return {
    id: "",
    companyId,
    roleName: "",
    roleDescription: "",
    roleAccessLevel: "",
    firstName: "",
    surname: "",
    email: "",
    password: "",
    phone: "",
    city: "",
    bannerUrl: "",
    logoUrl: "",
  };
}

type CompanyAccountFormState = ReturnType<typeof createEmptyCompanyAccountForm>;

function companyAccountToForm(
  account: AdminCompanyUserDTO,
  fallbackCompanyId: string
): CompanyAccountFormState {
  return {
    id: toInputValue(account.id),
    companyId: toInputValue(account.companyId ?? fallbackCompanyId),
    roleName: account.role?.name ?? "",
    roleDescription: account.role?.description ?? "",
    roleAccessLevel: toInputValue(account.role?.accessLevel),
    firstName: account.firstName ?? "",
    surname: account.surname ?? "",
    email: account.email ?? "",
    password: "",
    phone: account.phone ?? "",
    city: "",
    bannerUrl: account.bannerUrl ?? "",
    logoUrl: account.logoUrl ?? "",
  };
}

function companyAccountName(account: AdminCompanyUserDTO) {
  const name = [account.firstName, account.surname]
    .filter((value): value is string => Boolean(value?.trim()))
    .join(" ")
    .trim();

  return name || account.email?.trim() || `Konto ${account.id ?? ""}`.trim() || "Namnlöst konto";
}

function companyRoleDisplayName(roleName: string) {
  const normalizedRoleName = roleName.trim().toUpperCase();
  if (normalizedRoleName === "ADMIN") return "Admin";
  if (normalizedRoleName === "MANAGER") return "Manager";
  if (normalizedRoleName === "AGENT") return "Agent";
  return roleName;
}

function companyAccountRoleLabel(account: AdminCompanyUserDTO) {
  const roleName = account.role?.name?.trim();
  const accessLevel = account.role?.accessLevel;
  return [
    roleName ? companyRoleDisplayName(roleName) : undefined,
    typeof accessLevel === "number" ? `Access ${accessLevel}` : undefined,
  ]
    .filter(Boolean)
    .join(" · ");
}

function companyRoleOptionLabel(role: AdminCompanyRole) {
  const roleName = role.name?.trim() || "Namnlös roll";
  return typeof role.accessLevel === "number"
    ? `${companyRoleDisplayName(roleName)} · Access ${role.accessLevel}`
    : companyRoleDisplayName(roleName);
}

function getPreferredCompanyAdminRoleName(roles: AdminCompanyRole[]) {
  return (
    roles.find((role) => role.name?.trim().toUpperCase() === "ADMIN")?.name ??
    roles[0]?.name ??
    ""
  );
}

function buildCreateCompanyAdminPayload(
  form: CompanyAccountFormState,
  companyId: number
): AdminCreateCompanyUserRequest {
  const firstName = form.firstName.trim();
  const lastName = form.surname.trim();
  const email = form.email.trim();
  const password = form.password.trim();
  const roleName = form.roleName.trim();
  const city = normalizeCityCode(form.city);

  if (!firstName) {
    throw new Error("Ange förnamn.");
  }
  if (!lastName) {
    throw new Error("Ange efternamn.");
  }
  if (!email) {
    throw new Error("Ange e-post.");
  }
  if (!roleName) {
    throw new Error("Välj roll.");
  }
  if (!password) {
    throw new Error("Ange ett lösenord.");
  }
  if (password.length < 6) {
    throw new Error("Lösenordet måste vara minst 6 tecken.");
  }

  return {
    companyId,
    firstName,
    lastName,
    plainTextPassword: password,
    email,
    roleName,
    ...(city ? { city } : {}),
  };
}

function CompanyAccountVerificationBadge({ verified }: { verified?: boolean }) {
  const isVerified = verified === true;
  const Icon = isVerified ? CheckCircle2Icon : XCircleIcon;

  return (
    <span
      className={[
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        isVerified
          ? "bg-emerald-50 text-emerald-700"
          : "bg-amber-50 text-amber-700",
      ].join(" ")}
    >
      <Icon className="h-3.5 w-3.5" />
      {isVerified ? "Verifierad" : "Ej verifierad"}
    </span>
  );
}

function CompanyAccountForm() {
  const { confirm, confirmDialog } = useConfirmDialog();
  const { items: companies, state: companiesState } = useResourceList(useAdminCompanies());
  const { items: roles, state: rolesState } = useResourceList(useAdminCompanyRoles());
  const { items: cities, state: citiesState } = useResourceList(useAdminCitySummaries());
  const createCompanyAdmin = useAdminCreateCompanyAdmin();
  const manageCompanyAccount = useAdminManageCompanyAccount();
  const deleteCompanyAccount = useAdminDeleteCompanyAccount();
  const verifyCompanyAccount = useAdminVerifyCompanyAccount();
  const [createState, setCreateState] = useState<AdminActionState>({ status: "idle" });
  const [saveState, setSaveState] = useState<AdminActionState>({ status: "idle" });
  const [accountsState, setAccountsState] = useState<AdminActionState>({ status: "idle" });
  const [verifyState, setVerifyState] = useState<AdminActionState>({ status: "idle" });
  const [deleteAccountState, setDeleteAccountState] = useState<AdminActionState>({ status: "idle" });
  const [accounts, setAccounts] = useState<AdminCompanyUserDTO[]>([]);
  const [verifyingAccountId, setVerifyingAccountId] = useState<number | null>(null);
  const [deletingAccountId, setDeletingAccountId] = useState<number | null>(null);
  const [createForm, setCreateForm] = useState<CompanyAccountFormState>(() => createEmptyCompanyAccountForm());
  const [form, setForm] = useState<CompanyAccountFormState>(() => createEmptyCompanyAccountForm());

  function patchCreateForm(patch: Partial<CompanyAccountFormState>) {
    setCreateForm((current) => ({ ...current, ...patch }));
  }

  function patchForm(patch: Partial<CompanyAccountFormState>) {
    setForm((current) => ({ ...current, ...patch }));
  }

  function setLoadedAccounts(result: AdminCompanyUserDTO[]) {
    setAccounts(result);
    setAccountsState({
      status: "success",
      message:
        result.length === 1
          ? "1 konto hämtades för valt företag."
          : `${result.length} konton hämtades för valt företag.`,
    });
  }

  const companiesLoading = companiesState.status === "loading";
  const companyOptions = companies.filter(
    (company): company is AdminCompanyPublicDTO & { id: number } =>
      typeof company.id === "number"
  );
  const roleOptions = roles.filter((role) => Boolean(role.name?.trim()));
  const rolesLoading = rolesState.status === "loading";
  const citiesLoading = citiesState.status === "loading";
  const defaultCreateRoleName = getPreferredCompanyAdminRoleName(roleOptions);
  const cityOptions = cities
    .map((city) => ({ city, code: cityCode(city) }))
    .filter((item): item is { city: CityDTO; code: string } => Boolean(item.code));
  const createCityOptions = createForm.city.trim() && !cityOptions.some((item) => item.code === createForm.city.trim())
    ? [
        {
          city: {
            nameSv: createForm.city.trim(),
            nameEn: createForm.city.trim(),
            code: createForm.city.trim(),
          },
          code: createForm.city.trim(),
        },
        ...cityOptions,
      ]
    : cityOptions;

  function getDefaultCompanyCity(companyId: string) {
    const selectedCompany = companyOptions.find(
      (company) => String(company.id) === companyId
    );
    return selectedCompany?.cities?.[0]?.code ?? "GOTHENBURG";
  }

  function createNewCompanyAdminForm(companyId = createForm.companyId) {
    return {
      ...createEmptyCompanyAccountForm(companyId),
      roleName: defaultCreateRoleName,
      city: getDefaultCompanyCity(companyId),
    };
  }

  useEffect(() => {
    if (createForm.roleName.trim() || !defaultCreateRoleName) {
      return;
    }

    setCreateForm((current) =>
      current.roleName.trim()
        ? current
        : { ...current, roleName: defaultCreateRoleName }
    );
  }, [createForm.roleName, defaultCreateRoleName]);

  useEffect(() => {
    const companyIdValue = form.companyId.trim();
    if (!companyIdValue) {
      setAccounts([]);
      setAccountsState({ status: "idle" });
      return;
    }

    const companyId = Number(companyIdValue);
    if (!Number.isFinite(companyId)) {
      setAccounts([]);
      setAccountsState({
        status: "error",
        message: "CompanyId måste vara ett nummer.",
      });
      return;
    }

    let active = true;
    setAccounts([]);
    setAccountsState({ status: "loading", message: "Hämtar konton för valt företag..." });

    adminService
      .getCompanyUsers(companyId)
      .then((result) => {
        if (!active) return;
        setLoadedAccounts(result);
      })
      .catch((error) => {
        if (!active) return;
        setAccounts([]);
        setAccountsState({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "Kunde inte hämta konton för valt företag.",
        });
      });

    return () => {
      active = false;
    };
  }, [form.companyId]);

  function selectCompany(companyId: string) {
    setSaveState({ status: "idle" });
    setVerifyState({ status: "idle" });
    setDeleteAccountState({ status: "idle" });
    setForm(createEmptyCompanyAccountForm(companyId));
  }

  function selectCreateCompany(companyId: string) {
    setCreateState({ status: "idle" });
    setCreateForm(createNewCompanyAdminForm(companyId));
  }

  function selectAccount(account: AdminCompanyUserDTO) {
    setSaveState({ status: "idle" });
    setVerifyState({ status: "idle" });
    setDeleteAccountState({ status: "idle" });
    setForm(companyAccountToForm(account, form.companyId));
  }

  function startNewAccount() {
    setSaveState({ status: "idle" });
    setVerifyState({ status: "idle" });
    setDeleteAccountState({ status: "idle" });
    setForm(createEmptyCompanyAccountForm(form.companyId));
  }

  function selectCreateRole(roleName: string) {
    const normalizedRoleName = roleName.trim();
    const selectedRole = roleOptions.find((role) => role.name?.trim() === normalizedRoleName);
    patchCreateForm({
      roleName: normalizedRoleName,
      roleDescription: selectedRole?.description ?? "",
      roleAccessLevel: toInputValue(selectedRole?.accessLevel),
    });
  }

  function selectRole(roleName: string) {
    const normalizedRoleName = roleName.trim();
    const selectedRole = roleOptions.find((role) => role.name?.trim() === normalizedRoleName);
    patchForm({
      roleName: normalizedRoleName,
      roleDescription: selectedRole?.description ?? "",
      roleAccessLevel: toInputValue(selectedRole?.accessLevel),
    });
  }

  async function refreshAccounts() {
    const companyId = parseRequiredNumber(form.companyId, "CompanyId");
    setAccountsState({ status: "loading", message: "Hämtar konton för valt företag..." });
    try {
      const result = await adminService.getCompanyUsers(companyId);
      setLoadedAccounts(result);
    } catch (error) {
      setAccounts([]);
      setAccountsState({
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "Kunde inte hämta konton för valt företag.",
      });
    }
  }

  async function createAccount() {
    setCreateState({ status: "loading", message: "Skapar företagskonto..." });
    try {
      const companyId = parseRequiredNumber(createForm.companyId, "CompanyId");
      const payload = buildCreateCompanyAdminPayload(createForm, companyId);

      await createCompanyAdmin.mutateAsync({ companyId, payload });
      setCreateForm(createNewCompanyAdminForm(createForm.companyId));
      setCreateState({ status: "success", message: "Företagskontot skapades." });

      if (form.companyId.trim() === String(companyId)) {
        try {
          const refreshedAccounts = await adminService.getCompanyUsers(companyId);
          setLoadedAccounts(refreshedAccounts);
        } catch (refreshError) {
          setAccountsState({
            status: "error",
            message:
              refreshError instanceof Error
                ? refreshError.message
                : "Kontot skapades, men listan kunde inte hämtas om.",
          });
        }
      }
    } catch (error) {
      setCreateState({
        status: "error",
        message: error instanceof Error ? error.message : "Kunde inte skapa kontot.",
      });
    }
  }

  async function run() {
    setSaveState({ status: "loading", message: "Sparar företagskonto..." });
    try {
      const companyId = parseRequiredNumber(form.companyId, "CompanyId");
      const accountId = parseOptionalNumber(form.id);
      if (!accountId) {
        throw new Error("Välj ett konto i listan innan du uppdaterar.");
      }

      const payload: AdminCompanyUserDTO = {
        id: accountId,
        companyId,
        role: {
          name: form.roleName.trim(),
          description: form.roleDescription.trim(),
          accessLevel: parseOptionalNumber(form.roleAccessLevel),
        },
        firstName: form.firstName.trim(),
        surname: form.surname.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        bannerUrl: form.bannerUrl.trim(),
        logoUrl: form.logoUrl.trim(),
      };

      await manageCompanyAccount.mutateAsync({ companyId, payload });
      setSaveState({ status: "success", message: "Företagskontot sparades." });

      try {
        const refreshedAccounts = await adminService.getCompanyUsers(companyId);
        setLoadedAccounts(refreshedAccounts);
      } catch (refreshError) {
        setAccountsState({
          status: "error",
          message:
            refreshError instanceof Error
              ? refreshError.message
              : "Kontot sparades, men listan kunde inte hämtas om.",
        });
      }
    } catch (error) {
      setSaveState({
        status: "error",
        message: error instanceof Error ? error.message : "Kunde inte spara kontot.",
      });
    }
  }

  async function verifyAccount(account: AdminCompanyUserDTO) {
    const companyId = parseRequiredNumber(form.companyId, "CompanyId");
    const accountId = account.id;

    if (typeof accountId !== "number") {
      setVerifyState({
        status: "error",
        message: "Kontot saknar id och kan inte verifieras.",
      });
      return;
    }

    setVerifyingAccountId(accountId);
    setVerifyState({ status: "loading", message: "Verifierar företagskonto..." });

    try {
      await verifyCompanyAccount.mutateAsync({ companyId, accountId });
      setAccounts((current) =>
        current.map((entry) =>
          entry.id === accountId ? { ...entry, verified: true } : entry
        )
      );
      setVerifyState({
        status: "success",
        message: `${companyAccountName(account)} är verifierad.`,
      });
    } catch (error) {
      setVerifyState({
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "Kunde inte verifiera företagskontot.",
      });
    } finally {
      setVerifyingAccountId(null);
    }
  }

  async function deleteAccount(account: AdminCompanyUserDTO) {
    const companyId = parseRequiredNumber(form.companyId, "CompanyId");
    const accountId = account.id;

    if (typeof accountId !== "number") {
      setDeleteAccountState({
        status: "error",
        message: "Kontot saknar id och kan inte tas bort.",
      });
      return;
    }

    const accountName = companyAccountName(account);
    const confirmed = await confirm({
      title: "Ta bort företagskonto?",
      description: `${accountName} tas bort permanent och kan inte återställas.`,
      confirmLabel: "Ta bort",
      destructive: true,
    });
    if (!confirmed) {
      return;
    }

    setDeletingAccountId(accountId);
    setDeleteAccountState({ status: "loading", message: "Tar bort företagskonto..." });

    try {
      await deleteCompanyAccount.mutateAsync({ companyId, accountId });
      setAccounts((current) => current.filter((entry) => entry.id !== accountId));
      if (form.id.trim() === String(accountId)) {
        setForm(createEmptyCompanyAccountForm(form.companyId));
      }
      setDeleteAccountState({
        status: "success",
        message: `${accountName} togs bort.`,
      });
    } catch (error) {
      setDeleteAccountState({
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "Kunde inte ta bort företagskontot.",
      });
    } finally {
      setDeletingAccountId(null);
    }
  }

  return (
    <div className="grid gap-4">
      <ActionShell
        title="Skapa företagskonto"
        description="POST skapar ett nytt konto för valt företag. Konto-id sätts av backend."
        method="POST"
        endpoint="/api/admin/company/{id}/create-admin"
      >
        <ResultBlock state={companiesState} />
        <ResultBlock state={rolesState} />
        <ResultBlock state={citiesState} />
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <FormSelect
            label="Företag"
            value={createForm.companyId}
            onChange={selectCreateCompany}
            disabled={companiesLoading || companyOptions.length === 0}
          >
            <option value="">
              {companiesLoading ? "Hämtar företag..." : "Välj företag"}
            </option>
            {companyOptions.map((company) => (
              <option key={company.id} value={String(company.id)}>
                {[company.name, company.id].filter(Boolean).join(" - ")}
              </option>
            ))}
          </FormSelect>
          <FormSelect
            label="Roll"
            value={createForm.roleName}
            onChange={selectCreateRole}
            disabled={rolesLoading || roleOptions.length === 0}
          >
            <option value="">
              {rolesLoading ? "Hämtar roller..." : "Välj roll"}
            </option>
            {roleOptions.map((role) => {
              const roleName = role.name?.trim();
              if (!roleName) return null;

              return (
                <option key={roleName} value={roleName}>
                  {companyRoleOptionLabel(role)}
                </option>
              );
            })}
          </FormSelect>
          <FormInput label="Förnamn" value={createForm.firstName} onChange={(firstName) => patchCreateForm({ firstName })} />
          <FormInput label="Efternamn" value={createForm.surname} onChange={(surname) => patchCreateForm({ surname })} />
          <FormInput label="E-post" value={createForm.email} onChange={(email) => patchCreateForm({ email })} type="email" />
          <FormInput label="Lösenord" value={createForm.password} onChange={(password) => patchCreateForm({ password })} type="password" />
          <FormSelect
            label="Stad"
            value={createForm.city}
            onChange={(city) => patchCreateForm({ city })}
            disabled={citiesLoading || createCityOptions.length === 0}
          >
            <option value="">
              {citiesLoading ? "Hämtar städer..." : "Välj stad"}
            </option>
            {createCityOptions.map(({ city, code }) => (
              <option key={code} value={code}>
                {cityOptionLabel(city)}
              </option>
            ))}
          </FormSelect>
        </div>
        <SubmitButton isLoading={createState.status === "loading"} onPress={() => void createAccount()} disabled={!createForm.companyId.trim()}>
          Skapa konto
        </SubmitButton>
        <ResultBlock state={createState} />
      </ActionShell>

    <ActionShell
      title="Hämta och uppdatera företagskonto"
      description="GET hämtar kopplade konton för valt företag. PUT uppdaterar och DELETE tar bort kontot du väljer i listan."
      method="GET/PUT/DELETE"
      endpoint="/api/companies/roles, /api/companies/{id}/users, /api/companies/{id}/users/{userId}"
    >
      <ResultBlock state={companiesState} />
      <ResultBlock state={rolesState} />
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <FormInput label="Konto-id" value={form.id} onChange={(id) => patchForm({ id })} placeholder="Välj ett konto i listan" />
        <FormSelect
          label="Företag"
          value={form.companyId}
          onChange={selectCompany}
          disabled={companiesLoading || companyOptions.length === 0}
        >
          <option value="">
            {companiesLoading ? "Hämtar företag..." : "Välj företag"}
          </option>
          {companyOptions.map((company) => (
            <option key={company.id} value={String(company.id)}>
              {[company.name, company.id].filter(Boolean).join(" - ")}
            </option>
          ))}
        </FormSelect>
        <FormSelect
          label="Roll"
          value={form.roleName}
          onChange={selectRole}
          disabled={rolesLoading || roleOptions.length === 0}
        >
          <option value="">
            {rolesLoading ? "Hämtar roller..." : "Välj roll"}
          </option>
          {roleOptions.map((role) => {
            const roleName = role.name?.trim();
            if (!roleName) return null;

            return (
              <option key={roleName} value={roleName}>
                {companyRoleOptionLabel(role)}
              </option>
            );
          })}
        </FormSelect>
        <FormInput label="Rollbeskrivning" value={form.roleDescription} onChange={(roleDescription) => patchForm({ roleDescription })} disabled />
        <FormInput label="Access level" value={form.roleAccessLevel} onChange={(roleAccessLevel) => patchForm({ roleAccessLevel })} disabled />
        <FormInput label="Förnamn" value={form.firstName} onChange={(firstName) => patchForm({ firstName })} />
        <FormInput label="Efternamn" value={form.surname} onChange={(surname) => patchForm({ surname })} />
        <FormInput label="E-post" value={form.email} onChange={(email) => patchForm({ email })} type="email" />
        <FormInput label="Telefon" value={form.phone} onChange={(phone) => patchForm({ phone })} />
        <FormInput label="Banner URL" value={form.bannerUrl} onChange={(bannerUrl) => patchForm({ bannerUrl })} />
        <FormInput label="Logo URL" value={form.logoUrl} onChange={(logoUrl) => patchForm({ logoUrl })} />
      </div>
      <div className="mt-4 rounded-[8px] border border-[#dfe7e3] bg-[#f8fbfa]">
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h4 className="text-sm font-semibold text-[#111827]">Kopplade konton</h4>
            <p className="mt-1 text-xs text-[#66716f]">
              Listan uppdateras från GET /api/companies/{form.companyId || "{id}"}/users.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              title="Hämta om konton"
              onClick={() => void refreshAccounts()}
              disabled={!form.companyId.trim() || accountsState.status === "loading"}
              className="inline-flex h-9 w-9 items-center justify-center rounded-[8px] border border-[#dfe7e3] bg-white text-[#36534d] hover:bg-[#edf5f1] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCwIcon
                className={[
                  "h-4 w-4",
                  accountsState.status === "loading" ? "animate-spin" : "",
                ].join(" ")}
              />
            </button>
            <button
              type="button"
              onClick={startNewAccount}
              disabled={!form.companyId.trim()}
              className="inline-flex h-9 items-center gap-2 rounded-[8px] border border-[#dfe7e3] bg-white px-3 text-sm font-medium text-[#36534d] hover:bg-[#edf5f1] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Rensa val
            </button>
          </div>
        </div>
        <div className="border-t border-[#dfe7e3] p-4">
          <ResultBlock state={accountsState} />
          <ResultBlock state={verifyState} />
          <ResultBlock state={deleteAccountState} />
          {!form.companyId.trim() ? (
            <p className="text-sm text-[#66716f]">
              Välj ett företag för att hämta kopplade konton.
            </p>
          ) : accountsState.status === "loading" ? (
            <p className="text-sm text-[#66716f]">Hämtar konton...</p>
          ) : accountsState.status === "error" ? null : accounts.length === 0 ? (
            <p className="text-sm text-[#66716f]">
              Inga konton hittades för valt företag.
            </p>
          ) : (
            <div className="grid gap-2">
              {accounts.map((account, index) => {
                const accountId = toInputValue(account.id);
                const isSelected = Boolean(accountId && accountId === form.id);
                const numericAccountId =
                  typeof account.id === "number" ? account.id : undefined;
                const isVerifying =
                  numericAccountId != null && verifyingAccountId === numericAccountId;
                const isDeleting =
                  numericAccountId != null && deletingAccountId === numericAccountId;

                return (
                  <article
                    key={account.id ?? account.email ?? index}
                    className={[
                      "grid gap-3 rounded-[8px] border px-3 py-2 text-sm transition sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center",
                      isSelected
                        ? "border-brand bg-white text-[#111827]"
                        : "border-[#dfe7e3] bg-white/70 text-[#36534d] hover:bg-white",
                    ].join(" ")}
                  >
                    <button
                      type="button"
                      onClick={() => selectAccount(account)}
                      className="min-w-0 text-left"
                    >
                      <span className="flex flex-wrap items-center gap-x-2 gap-y-1 font-medium">
                        <span>{companyAccountName(account)}</span>
                        {accountId && (
                          <span className="font-mono text-xs text-[#66716f]">#{accountId}</span>
                        )}
                        <CompanyAccountVerificationBadge verified={account.verified} />
                      </span>
                      <span className="mt-1 block text-xs text-[#66716f]">
                        {[account.email?.trim(), account.phone?.trim(), companyAccountRoleLabel(account)]
                          .filter(Boolean)
                          .join(" · ") || "Saknar kontaktuppgifter"}
                      </span>
                    </button>
                    <div className="flex flex-wrap justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => void verifyAccount(account)}
                        disabled={
                          account.verified === true ||
                          numericAccountId == null ||
                          verifyingAccountId !== null ||
                          deletingAccountId !== null
                        }
                        className="inline-flex h-8 items-center justify-center gap-2 rounded-[8px] border border-brand bg-white px-3 text-xs font-semibold text-brand hover:bg-[#edf5f1] disabled:cursor-not-allowed disabled:border-[#dfe7e3] disabled:text-[#9aa7a4] disabled:opacity-70"
                      >
                        <CheckCircle2Icon
                          className={[
                            "h-4 w-4",
                            isVerifying ? "animate-spin" : "",
                          ].join(" ")}
                        />
                        {account.verified === true ? "Verifierad" : "Verifiera"}
                      </button>
                      <button
                        type="button"
                        onClick={() => void deleteAccount(account)}
                        disabled={numericAccountId == null || deletingAccountId !== null}
                        className="inline-flex h-8 items-center justify-center gap-2 rounded-[8px] border border-red-200 bg-white px-3 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:border-[#dfe7e3] disabled:text-[#9aa7a4] disabled:opacity-70"
                      >
                        <Trash2Icon
                          className={[
                            "h-4 w-4",
                            isDeleting ? "animate-spin" : "",
                          ].join(" ")}
                        />
                        Ta bort
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <SubmitButton isLoading={saveState.status === "loading"} onPress={run} disabled={!form.companyId.trim() || !form.id.trim()}>
        Spara konto
      </SubmitButton>
      <ResultBlock state={saveState} />
    </ActionShell>
    {confirmDialog}
    </div>
  );
}

export default CompanyAccountForm;
