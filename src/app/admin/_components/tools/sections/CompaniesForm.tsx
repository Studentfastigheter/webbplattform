"use client";

import { useState } from "react";
import { RefreshCwIcon, Trash2Icon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { adminService } from "@/features/admin/services/admin-service";
import { useAdminCitySummaries, useAdminCompanies, useAdminCreateCompany, useAdminDeleteCompany, useAdminModifyCompany, useAdminRefreshCompanyListings, useAdminUpdateCompanyCredentials } from "@/features/admin/hooks/useAdmin";
import { normalizeCityCode } from "@/features/cities/services/city-service";
import type { AdminCompanyCredentialDTO, AdminCompanyDetailedDTO, AdminCreateCompanyRequest, CityDTO } from "@/types";
import {
  type AdminActionState,
  toInputValue,
  parseOptionalNumber,
  parseListInput,
  parseSocialLinksInput,
  formatSocialLinksInput,
  useResourceList,
  ResultBlock,
  ActionShell,
  FormInput,
  FormTextarea,
  FormSelect,
  SubmitButton,
  cityCode,
  cityOptionLabel,
} from "../shared";

type CompanyFormState = {
  companyId?: string;
  companyName: string;
  subtitle: string;
  logoUrl: string;
  privacyPolicyUrl: string;
  termsUrl: string;
  bannerUrl: string;
  description: string;
  websiteUrl: string;
  cityCodes: string[];
  socialLinks: string;
  pictureUrlList: string;
  videoUrlList: string;
  credentialCompanyName: string;
  companySystemUrlOrigin: string;
  propertySystemUsername: string;
  propertySystemPassword: string;
  propertySystem: string;
};

const emptyCompanyForm: CompanyFormState = {
  companyId: "",
  companyName: "",
  subtitle: "",
  logoUrl: "",
  privacyPolicyUrl: "",
  termsUrl: "",
  bannerUrl: "",
  description: "",
  websiteUrl: "",
  cityCodes: [],
  socialLinks: "",
  pictureUrlList: "",
  videoUrlList: "",
  credentialCompanyName: "",
  companySystemUrlOrigin: "",
  propertySystemUsername: "",
  propertySystemPassword: "",
  propertySystem: "",
};

type CompanyCredentialFormState = Pick<
  CompanyFormState,
  | "companyId"
  | "credentialCompanyName"
  | "companySystemUrlOrigin"
  | "propertySystemUsername"
  | "propertySystemPassword"
  | "propertySystem"
>;

const emptyCompanyCredentialForm: CompanyCredentialFormState = {
  companyId: "",
  credentialCompanyName: "",
  companySystemUrlOrigin: "",
  propertySystemUsername: "",
  propertySystemPassword: "",
  propertySystem: "",
};

function companyDetailsToForm(details: AdminCompanyDetailedDTO): CompanyFormState {
  return {
    ...emptyCompanyForm,
    companyId: toInputValue(details.companyId),
    companyName: details.companyName ?? "",
    subtitle: details.subtitle ?? "",
    logoUrl: details.logoUrl ?? "",
    privacyPolicyUrl: details.privacyPolicyUrl ?? "",
    termsUrl: details.termsUrl ?? "",
    bannerUrl: details.bannerUrl ?? "",
    description: details.description ?? "",
    websiteUrl: details.websiteUrl ?? "",
    cityCodes: (details.cities ?? [])
      .map((code) => normalizeCityCode(code))
      .filter(Boolean),
    socialLinks: formatSocialLinksInput(details.socialLinks),
    pictureUrlList: (details.pictureUrlList ?? []).join("\n"),
    videoUrlList: (details.videoUrlList ?? []).join("\n"),
    credentialCompanyName: details.companyName ?? "",
  };
}

function buildCompanyCredentialPayload(form: CompanyCredentialFormState): {
  companyId: number;
  credentials: AdminCompanyCredentialDTO;
} {
  const companyId = parseOptionalNumber(form.companyId ?? "");
  if (!companyId) {
    throw new Error("Välj ett företag.");
  }

  if (
    !form.companySystemUrlOrigin.trim() ||
    !form.propertySystemUsername.trim() ||
    !form.propertySystemPassword.trim() ||
    !form.propertySystem.trim()
  ) {
    throw new Error("System origin, username, password och property system krävs.");
  }

  return {
    companyId,
    credentials: {
      companyName: form.credentialCompanyName.trim(),
      companySystemUrlOrigin: form.companySystemUrlOrigin.trim(),
      propertySystemUsername: form.propertySystemUsername.trim(),
      propertySystemPassword: form.propertySystemPassword.trim(),
      propertySystem: form.propertySystem.trim() as AdminCompanyCredentialDTO["propertySystem"],
    },
  };
}

function buildCompanyPayload(form: CompanyFormState, requireId: boolean): AdminCreateCompanyRequest {
  const companyId = parseOptionalNumber(form.companyId ?? "");
  if (requireId && !companyId) {
    throw new Error("Välj ett företag eller ange companyId innan du uppdaterar.");
  }

  const credentialsTouched = [
    form.companySystemUrlOrigin,
    form.propertySystemUsername,
    form.propertySystemPassword,
    form.propertySystem,
  ].some((value) => value.trim().length > 0);

  if (!requireId && !credentialsTouched) {
    throw new Error("Systemkoppling krävs när du skapar ett företag.");
  }

  if (credentialsTouched && !form.propertySystem.trim()) {
    throw new Error("Property system krävs när systemkoppling anges.");
  }

  return {
    companylDetails: {
      ...(companyId ? { companyId } : {}),
      companyName: form.companyName.trim(),
      subtitle: form.subtitle.trim(),
      logoUrl: form.logoUrl.trim(),
      privacyPolicyUrl: form.privacyPolicyUrl.trim(),
      termsUrl: form.termsUrl.trim(),
      bannerUrl: form.bannerUrl.trim(),
      socialLinks: parseSocialLinksInput(form.socialLinks),
      description: form.description.trim(),
      pictureUrlList: parseListInput(form.pictureUrlList),
      videoUrlList: parseListInput(form.videoUrlList),
      websiteUrl: form.websiteUrl.trim(),
      cities: Array.from(
        new Set(form.cityCodes.map((code) => normalizeCityCode(code)).filter(Boolean))
      ),
    },
    ...(credentialsTouched
      ? {
          credentials: {
            companyName: form.credentialCompanyName.trim() || form.companyName.trim(),
            companySystemUrlOrigin: form.companySystemUrlOrigin.trim(),
            propertySystemUsername: form.propertySystemUsername.trim(),
            propertySystemPassword: form.propertySystemPassword.trim(),
            propertySystem: form.propertySystem.trim() as AdminCompanyCredentialDTO["propertySystem"],
          },
        }
      : {}),
  };
}

function CompanyFields({
  form,
  onChange,
  includeId,
  cityOptions,
  citiesLoading,
}: {
  form: CompanyFormState;
  onChange: (patch: Partial<CompanyFormState>) => void;
  includeId: boolean;
  cityOptions: Array<{ city: CityDTO; code: string }>;
  citiesLoading: boolean;
}) {
  function setCompanyCitySelection(code: string, checked: boolean) {
    const normalizedCode = normalizeCityCode(code);
    if (!normalizedCode) return;

    onChange({
      cityCodes: checked
        ? Array.from(new Set([...form.cityCodes, normalizedCode]))
        : form.cityCodes.filter((item) => item !== normalizedCode),
    });
  }

  return (
    <>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {includeId && <FormInput label="CompanyId" value={form.companyId ?? ""} onChange={(companyId) => onChange({ companyId })} disabled />}
        <FormInput label="Företagsnamn" value={form.companyName} onChange={(companyName) => onChange({ companyName })} />
        <FormInput label="Underrubrik" value={form.subtitle} onChange={(subtitle) => onChange({ subtitle })} />
        <FormInput label="Logo URL" value={form.logoUrl} onChange={(logoUrl) => onChange({ logoUrl })} />
        <FormInput label="Banner URL" value={form.bannerUrl} onChange={(bannerUrl) => onChange({ bannerUrl })} />
        <FormInput label="Integritetspolicy URL" value={form.privacyPolicyUrl} onChange={(privacyPolicyUrl) => onChange({ privacyPolicyUrl })} />
        <FormInput label="Villkor URL" value={form.termsUrl} onChange={(termsUrl) => onChange({ termsUrl })} />
        <FormInput label="Webbplats URL" value={form.websiteUrl} onChange={(websiteUrl) => onChange({ websiteUrl })} />
      </div>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <FormTextarea label="Beskrivning" value={form.description} onChange={(description) => onChange({ description })} />
        <FormTextarea label="Sociala länkar" value={form.socialLinks} onChange={(socialLinks) => onChange({ socialLinks })} placeholder="instagram=https://..." />
        <FormTextarea label="Bild-URL:er" value={form.pictureUrlList} onChange={(pictureUrlList) => onChange({ pictureUrlList })} placeholder="En per rad" />
        <FormTextarea label="Video-URL:er" value={form.videoUrlList} onChange={(videoUrlList) => onChange({ videoUrlList })} placeholder="En per rad" />
      </div>
      <div className="mt-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide text-[#476e66]">
            Städer
          </span>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              isDisabled={citiesLoading || cityOptions.length === 0}
              onPress={() =>
                onChange({ cityCodes: cityOptions.map((option) => option.code) })
              }
              className="min-w-0 rounded-[8px] px-3 text-brand"
            >
              Markera alla
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              isDisabled={form.cityCodes.length === 0}
              onPress={() => onChange({ cityCodes: [] })}
              className="min-w-0 rounded-[8px] px-3 text-brand"
            >
              Rensa
            </Button>
          </div>
        </div>
        <div className="mt-2 grid max-h-80 gap-2 overflow-auto rounded-[8px] border border-[#dfe7e3] bg-[#fbfcfb] p-3 sm:grid-cols-2">
          {citiesLoading ? (
            <p className="text-sm text-[#66716f]">Hämtar städer...</p>
          ) : cityOptions.length === 0 ? (
            <p className="text-sm text-[#66716f]">Inga städer att visa.</p>
          ) : (
            cityOptions.map(({ city, code }) => (
              <label
                key={code}
                className="flex cursor-pointer items-start gap-2 rounded-[8px] border border-[#dfe7e3] bg-white px-3 py-2 text-sm text-[#111827] transition hover:bg-[#f3f8f5]"
              >
                <Checkbox
                  checked={form.cityCodes.includes(code)}
                  disabled={citiesLoading}
                  onCheckedChange={(checked) =>
                    setCompanyCitySelection(code, checked === true)
                  }
                  className="mt-0.5 border-[#9fb4ad] data-[state=checked]:border-brand data-[state=checked]:bg-brand"
                />
                <span>{cityOptionLabel(city)}</span>
              </label>
            ))
          )}
        </div>
        <p className="mt-2 text-sm text-[#66716f]">
          {form.cityCodes.length} valda
        </p>
      </div>
      <div className="mt-4 rounded-[8px] border border-[#edf2ef] bg-[#fbfcfb] p-3">
        <h4 className="text-sm font-semibold text-[#111827]">Systemkoppling</h4>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <FormInput label="Credential company name" value={form.credentialCompanyName} onChange={(credentialCompanyName) => onChange({ credentialCompanyName })} />
          <FormInput label="System origin" value={form.companySystemUrlOrigin} onChange={(companySystemUrlOrigin) => onChange({ companySystemUrlOrigin })} />
          <FormInput label="System username" value={form.propertySystemUsername} onChange={(propertySystemUsername) => onChange({ propertySystemUsername })} />
          <FormInput label="System password" value={form.propertySystemPassword} onChange={(propertySystemPassword) => onChange({ propertySystemPassword })} type="password" />
          <FormInput label="Property system" value={form.propertySystem} onChange={(propertySystem) => onChange({ propertySystem })} placeholder="DEMO, HOGIA..." />
        </div>
      </div>
    </>
  );
}

function CompaniesForm() {
  const { items, state: listState, refresh } = useResourceList(useAdminCompanies());
  const { items: cities, state: citiesState } = useResourceList(useAdminCitySummaries());
  const createCompanyMutation = useAdminCreateCompany();
  const modifyCompany = useAdminModifyCompany();
  const deleteCompanyMutation = useAdminDeleteCompany();
  const refreshCompanyListingsMutation = useAdminRefreshCompanyListings();
  const updateCompanyCredentials = useAdminUpdateCompanyCredentials();
  const [selectedId, setSelectedId] = useState("");
  const [deleteId, setDeleteId] = useState("");
  const [refreshId, setRefreshId] = useState("");
  const [updateState, setUpdateState] = useState<AdminActionState>({ status: "idle" });
  const [createState, setCreateState] = useState<AdminActionState>({ status: "idle" });
  const [deleteState, setDeleteState] = useState<AdminActionState>({ status: "idle" });
  const [refreshState, setRefreshState] = useState<AdminActionState>({ status: "idle" });
  const [selectedRefreshState, setSelectedRefreshState] = useState<AdminActionState>({ status: "idle" });
  const [credentialState, setCredentialState] = useState<AdminActionState>({ status: "idle" });
  const [updateForm, setUpdateForm] = useState<CompanyFormState>(emptyCompanyForm);
  const [createForm, setCreateForm] = useState<CompanyFormState>(emptyCompanyForm);
  const [credentialForm, setCredentialForm] = useState<CompanyCredentialFormState>(emptyCompanyCredentialForm);
  const citiesLoading = citiesState.status === "loading";
  const cityOptions = cities
    .map((city) => ({ city, code: cityCode(city) }))
    .filter((item): item is { city: CityDTO; code: string } => Boolean(item.code));

  async function selectCompany(id: string) {
    setSelectedId(id);
    setSelectedRefreshState({ status: "idle" });
    if (!id) {
      setUpdateForm(emptyCompanyForm);
      return;
    }

    setUpdateState({ status: "loading", message: "Hämtar företagsdetaljer..." });
    try {
      const selected = await adminService.getCompany(Number(id));
      setUpdateForm(companyDetailsToForm(selected));
      setUpdateState({ status: "idle" });
    } catch (error) {
      setUpdateState({
        status: "error",
        message: error instanceof Error ? error.message : "Kunde inte hämta företaget.",
      });
    }
  }

  function selectCredentialCompany(companyId: string) {
    const company = items.find((item) => String(item.id) === companyId);
    setCredentialForm((current) => ({
      ...current,
      companyId,
      credentialCompanyName: company?.name ?? current.credentialCompanyName,
    }));
  }

  async function save(action: "create" | "update") {
    const source = action === "create" ? createForm : updateForm;
    const setState = action === "create" ? setCreateState : setUpdateState;
    setState({
      status: "loading",
      message: action === "create" ? "Skapar företag..." : "Uppdaterar företag...",
    });

    try {
      if (action === "create") {
        await createCompanyMutation.mutateAsync(
          buildCompanyPayload(source, false),
        );
        setCreateForm(emptyCompanyForm);
      } else {
        await modifyCompany.mutateAsync(buildCompanyPayload(source, true));
      }
      setState({
        status: "success",
        message: action === "create" ? "Företaget skapades." : "Företaget uppdaterades.",
      });
      await refresh();
    } catch (error) {
      setState({
        status: "error",
        message: error instanceof Error ? error.message : "Företaget kunde inte sparas.",
      });
    }
  }

  async function deleteCompany() {
    const id = parseOptionalNumber(deleteId);
    if (!id) {
      setDeleteState({ status: "error", message: "Välj ett företag att ta bort." });
      return;
    }

    setDeleteState({ status: "loading", message: "Tar bort företag..." });
    try {
      await deleteCompanyMutation.mutateAsync(id);
      setDeleteId("");
      setDeleteState({ status: "success", message: "Företaget togs bort." });
      await refresh();
    } catch (error) {
      setDeleteState({
        status: "error",
        message: error instanceof Error ? error.message : "Företaget kunde inte tas bort.",
      });
    }
  }

  async function refreshListings() {
    const id = parseOptionalNumber(refreshId);
    if (!id) {
      setRefreshState({ status: "error", message: "Välj ett företag att synka." });
      return;
    }

    setRefreshState({ status: "loading", message: "Startar annonssynk..." });
    try {
      await refreshCompanyListingsMutation.mutateAsync(id);
      setRefreshState({ status: "success", message: "Annonssynken startades." });
    } catch (error) {
      setRefreshState({
        status: "error",
        message: error instanceof Error ? error.message : "Annonssynken kunde inte startas.",
      });
    }
  }

  async function refreshSelectedCompanyListings() {
    const id = parseOptionalNumber(updateForm.companyId ?? "");
    if (!id) {
      setSelectedRefreshState({ status: "error", message: "Välj ett företag att synka." });
      return;
    }

    setSelectedRefreshState({ status: "loading", message: "Startar annonssynk..." });
    try {
      await refreshCompanyListingsMutation.mutateAsync(id);
      setSelectedRefreshState({ status: "success", message: "Annonssynken startades." });
    } catch (error) {
      setSelectedRefreshState({
        status: "error",
        message: error instanceof Error ? error.message : "Annonssynken kunde inte startas.",
      });
    }
  }

  async function saveCredentials() {
    setCredentialState({ status: "loading", message: "Sparar systemuppgifter..." });
    try {
      const payload = buildCompanyCredentialPayload(credentialForm);
      await updateCompanyCredentials.mutateAsync({
        companyId: payload.companyId,
        credentials: payload.credentials,
      });
      setCredentialForm(emptyCompanyCredentialForm);
      setCredentialState({ status: "success", message: "Systemuppgifterna sparades och synk startades." });
    } catch (error) {
      setCredentialState({
        status: "error",
        message: error instanceof Error ? error.message : "Systemuppgifterna kunde inte sparas.",
      });
    }
  }

  return (
    <div className="grid gap-4">
      <ActionShell
        title="Hämta och uppdatera företag"
        description="GET hämtar företag. Välj ett företag och uppdatera det med PUT."
        method="GET/PUT"
        endpoint="/api/companies, /api/companies/{id}, /api/admin/company"
      >
        <ResultBlock state={listState} />
        <FormSelect label="Välj befintligt företag" value={selectedId} onChange={(value) => void selectCompany(value)}>
          <option value="">Välj företag</option>
          {items.map((company) => (
            <option key={company.id} value={company.id}>
              {[company.name, company.id].filter(Boolean).join(" - ")}
            </option>
          ))}
        </FormSelect>
        <CompanyFields
          form={updateForm}
          onChange={(patch) => setUpdateForm((current) => ({ ...current, ...patch }))}
          includeId
          cityOptions={cityOptions}
          citiesLoading={citiesLoading}
        />
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Button
            type="button"
            isLoading={updateState.status === "loading"}
            isDisabled={!updateForm.companyId?.trim()}
            onPress={() => void save("update")}
            className="bg-brand text-white hover:bg-[#00351e]"
          >
            Uppdatera vald
          </Button>
          <Button
            type="button"
            isLoading={selectedRefreshState.status === "loading"}
            isDisabled={!updateForm.companyId?.trim()}
            onPress={() => void refreshSelectedCompanyListings()}
            variant="outline"
          >
            <RefreshCwIcon className="h-4 w-4" />
            Synka annonser via API
          </Button>
        </div>
        <ResultBlock state={updateState} />
        <ResultBlock state={selectedRefreshState} />
      </ActionShell>

      <ActionShell
        title="Skapa nytt företag"
        description="POST är separat och skapar ett nytt företag."
        method="POST"
        endpoint="/api/admin/company"
      >
        <CompanyFields
          form={createForm}
          onChange={(patch) => setCreateForm((current) => ({ ...current, ...patch }))}
          includeId={false}
          cityOptions={cityOptions}
          citiesLoading={citiesLoading}
        />
        <SubmitButton isLoading={createState.status === "loading"} onPress={() => void save("create")}>
          Skapa
        </SubmitButton>
        <ResultBlock state={createState} />
      </ActionShell>

      <ActionShell
        title="Synka företagsannonser"
        description="POST startar en ny import av företagets annonser i bakgrunden."
        method="POST"
        endpoint="/api/companies/{id}/refresh-listings"
      >
        <FormSelect label="Välj företag" value={refreshId} onChange={setRefreshId}>
          <option value="">Välj företag</option>
          {items.map((company) => (
            <option key={company.id} value={company.id}>
              {[company.name, company.id].filter(Boolean).join(" - ")}
            </option>
          ))}
        </FormSelect>
        <SubmitButton isLoading={refreshState.status === "loading"} onPress={() => void refreshListings()} disabled={!refreshId}>
          Starta synk
        </SubmitButton>
        <ResultBlock state={refreshState} />
      </ActionShell>

      <ActionShell
        title="Uppdatera systemuppgifter"
        description="POST lägger till eller roterar credentials för ett befintligt företag."
        method="POST"
        endpoint="/api/admin/company/{id}/credentials"
      >
        <FormSelect label="Välj företag" value={credentialForm.companyId ?? ""} onChange={selectCredentialCompany}>
          <option value="">Välj företag</option>
          {items.map((company) => (
            <option key={company.id} value={company.id}>
              {[company.name, company.id].filter(Boolean).join(" - ")}
            </option>
          ))}
        </FormSelect>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <FormInput label="Credential company name" value={credentialForm.credentialCompanyName} onChange={(credentialCompanyName) => setCredentialForm((current) => ({ ...current, credentialCompanyName }))} />
          <FormInput label="System origin" value={credentialForm.companySystemUrlOrigin} onChange={(companySystemUrlOrigin) => setCredentialForm((current) => ({ ...current, companySystemUrlOrigin }))} />
          <FormInput label="System username" value={credentialForm.propertySystemUsername} onChange={(propertySystemUsername) => setCredentialForm((current) => ({ ...current, propertySystemUsername }))} />
          <FormInput label="System password" value={credentialForm.propertySystemPassword} onChange={(propertySystemPassword) => setCredentialForm((current) => ({ ...current, propertySystemPassword }))} type="password" />
          <FormInput label="Property system" value={credentialForm.propertySystem} onChange={(propertySystem) => setCredentialForm((current) => ({ ...current, propertySystem }))} placeholder="DEMO, HOGIA..." />
        </div>
        <SubmitButton isLoading={credentialState.status === "loading"} onPress={() => void saveCredentials()} disabled={!credentialForm.companyId?.trim()}>
          Spara systemuppgifter
        </SubmitButton>
        <ResultBlock state={credentialState} />
      </ActionShell>

      <ActionShell
        title="Ta bort företag"
        description="Välj ett företag från GET-resultatet och ta bort det med delete-endpointen."
        method="PUT"
        endpoint="/api/admin/company/delete"
      >
        <FormSelect label="Välj företag" value={deleteId} onChange={setDeleteId}>
          <option value="">Välj företag</option>
          {items.map((company) => (
            <option key={company.id} value={company.id}>
              {[company.name, company.id].filter(Boolean).join(" - ")}
            </option>
          ))}
        </FormSelect>
        <Button
          type="button"
          isLoading={deleteState.status === "loading"}
          isDisabled={!deleteId}
          onPress={() => void deleteCompany()}
          variant="destructive"
          className="mt-4 bg-red-700 text-white hover:bg-red-800"
        >
          <Trash2Icon className="h-4 w-4" />
          Ta bort vald
        </Button>
        <ResultBlock state={deleteState} />
      </ActionShell>
    </div>
  );
}

export default CompaniesForm;
