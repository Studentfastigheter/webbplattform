"use client";

import type { ChangeEvent } from "react";
import { useState } from "react";
import { CheckIcon, ExternalLink, Trash2Icon, UploadIcon, XIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useAdminCitySummaries, useAdminCreateExternalCompany, useAdminDeleteExternalCompany, useAdminExternalCompanies, useAdminSchools, useAdminUpdateExternalCompany } from "@/features/admin/hooks/useAdmin";
import { normalizeCityCode } from "@/features/cities/services/city-service";
import type { CreateExternalCompanyPayload, ModifyExternalCompanyRequest } from "@/features/companies/services/company-service";
import type { CityDTO, School } from "@/types";
import { cn } from "@/lib/utils";
import {
  type AdminActionState,
  parseRequiredNumber,
  parseOptionalNumber,
  useResourceList,
  ResultBlock,
  ActionShell,
  FieldGroup,
  FormInput,
  FormTextarea,
  FormSelect,
  SubmitButton,
  schoolId,
  schoolOptionLabel,
  externalCompanyOptionLabel,
  cityCode,
  cityOptionLabel,
} from "../shared";

type ExternalCompanyLogoSource = "upload" | "url";

type ExternalCompanyFormState = {
  name: string;
  description: string;
  logoSource: ExternalCompanyLogoSource;
  logoUrl: string;
  logoFile: File | null;
  websiteUrl: string;
  cityCodes: string[];
  schoolIds: number[];
};

const emptyExternalCompanyForm: ExternalCompanyFormState = {
  name: "",
  description: "",
  logoSource: "upload",
  logoUrl: "",
  logoFile: null,
  websiteUrl: "",
  cityCodes: [],
  schoolIds: [],
};

type ExternalCompanyUpdateFormState = {
  id: string;
  name: string;
  description: string;
  logoUrl: string;
  websiteUrl: string;
  cityCodes: string[];
  replaceCities: boolean;
};

const emptyExternalCompanyUpdateForm: ExternalCompanyUpdateFormState = {
  id: "",
  name: "",
  description: "",
  logoUrl: "",
  websiteUrl: "",
  cityCodes: [],
  replaceCities: false,
};

function buildExternalCompanyPayload(
  form: ExternalCompanyFormState
): CreateExternalCompanyPayload {
  const name = form.name.trim();
  const description = form.description.trim();
  const websiteUrl = form.websiteUrl.trim();
  const logoUrl = form.logoUrl.trim();
  const logoFile = form.logoFile;

  if (!name) {
    throw new Error("Ange ett företagsnamn.");
  }
  if (!description) {
    throw new Error("Ange en beskrivning.");
  }
  if (!websiteUrl) {
    throw new Error("Ange en webbplats.");
  }

  const payload = {
    name,
    description,
    websiteUrl,
    cityCodes: Array.from(
      new Set(form.cityCodes.map((code) => normalizeCityCode(code)).filter(Boolean))
    ),
    schoolIds: Array.from(
      new Set(form.schoolIds.filter((id) => Number.isFinite(id)))
    ),
  };

  if (form.logoSource === "upload") {
    if (!logoFile) {
      throw new Error("Välj en logofil.");
    }

    return {
      ...payload,
      logoFile,
      logoMediaType: logoFile.type || null,
    };
  }

  if (!logoUrl) {
    throw new Error("Ange en logo-URL.");
  }

  return {
    ...payload,
    logoUrl,
  };
}

function buildExternalCompanyUpdatePayload(
  form: ExternalCompanyUpdateFormState
): ModifyExternalCompanyRequest {
  const payload: {
    id: number;
    name?: string;
    description?: string;
    logoUrl?: string;
    websiteUrl?: string;
    cities?: string[];
  } = {
    id: parseRequiredNumber(form.id, "External company id"),
  };

  if (form.name.trim()) {
    payload.name = form.name.trim();
  }
  if (form.description.trim()) {
    payload.description = form.description.trim();
  }
  if (form.logoUrl.trim()) {
    payload.logoUrl = form.logoUrl.trim();
  }
  if (form.websiteUrl.trim()) {
    payload.websiteUrl = form.websiteUrl.trim();
  }
  if (form.replaceCities) {
    payload.cities = Array.from(
      new Set(form.cityCodes.map((code) => normalizeCityCode(code)).filter(Boolean))
    );
  }

  return payload;
}

function ExternalCompanyLogoField({
  source,
  logoUrl,
  logoFile,
  inputId,
  inputKey,
  className,
  onSourceChange,
  onUrlChange,
  onFileChange,
  onClearFile,
}: {
  source: ExternalCompanyLogoSource;
  logoUrl: string;
  logoFile: File | null;
  inputId: string;
  inputKey: number;
  className?: string;
  onSourceChange: (source: ExternalCompanyLogoSource) => void;
  onUrlChange: (logoUrl: string) => void;
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onClearFile: () => void;
}) {
  return (
    <FieldGroup label="Logga" className={className}>
      <div className="rounded-[8px] border border-[#dfe7e3] bg-[#fbfcfb] p-2">
        <div className="grid grid-cols-2 gap-1 rounded-[8px] bg-[#edf4f0] p-1">
          <button
            type="button"
            onClick={() => onSourceChange("upload")}
            className={cn(
              "flex h-9 min-w-0 items-center justify-center gap-2 rounded-[7px] px-3 text-sm font-semibold normal-case tracking-normal transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
              source === "upload"
                ? "bg-white text-brand shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
                : "text-[#476e66] hover:bg-white/60 hover:text-brand"
            )}
          >
            <UploadIcon className="h-4 w-4 shrink-0" />
            <span className="truncate">Ladda upp</span>
          </button>
          <button
            type="button"
            onClick={() => onSourceChange("url")}
            className={cn(
              "flex h-9 min-w-0 items-center justify-center gap-2 rounded-[7px] px-3 text-sm font-semibold normal-case tracking-normal transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
              source === "url"
                ? "bg-white text-brand shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
                : "text-[#476e66] hover:bg-white/60 hover:text-brand"
            )}
          >
            <ExternalLink className="h-4 w-4 shrink-0" />
            <span className="truncate">Extern URL</span>
          </button>
        </div>

        {source === "upload" ? (
          <div className="mt-3">
            <label
              htmlFor={inputId}
              className={cn(
                "flex min-h-[92px] cursor-pointer items-center gap-3 rounded-[8px] border bg-white px-4 py-3 normal-case tracking-normal transition has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand",
                logoFile
                  ? "border-[#8db2a3]"
                  : "border-dashed border-[#b7c8c0] hover:border-brand hover:bg-[#f7fbf8]"
              )}
            >
              <Input
                id={inputId}
                key={inputKey}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                onChange={onFileChange}
                className="sr-only"
              />
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[8px] bg-[#eef5f1] text-brand">
                <UploadIcon className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-[#111827]">
                  {logoFile ? logoFile.name : "Välj logotyp"}
                </span>
                <span className="mt-0.5 block text-xs font-medium text-[#66716f]">
                  PNG, JPG, WEBP, GIF eller SVG
                </span>
              </span>
              {logoFile ? (
                <span className="hidden shrink-0 items-center gap-1 rounded-full bg-[#eef5f1] px-2.5 py-1 text-xs font-semibold text-brand sm:flex">
                  <CheckIcon className="h-3.5 w-3.5" />
                  Vald
                </span>
              ) : null}
            </label>
            {logoFile ? (
              <div className="mt-2 flex min-w-0 items-center justify-between gap-3 rounded-[8px] border border-[#dfe7e3] bg-white px-3 py-2 normal-case tracking-normal">
                <span className="min-w-0 truncate text-sm font-medium text-[#36534d]">
                  {logoFile.name}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onPress={onClearFile}
                  className="h-8 min-w-0 shrink-0 rounded-[8px] px-2 text-brand"
                >
                  <XIcon className="h-4 w-4" />
                  Rensa
                </Button>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="mt-3 normal-case tracking-normal">
            <div className="relative">
              <ExternalLink className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#66716f]" />
              <Input
                type="url"
                value={logoUrl}
                onChange={(event) => onUrlChange(event.target.value)}
                placeholder="https://..."
                className="h-10 rounded-[8px] border-[#dfe7e3] bg-white pl-9 text-[#111827] shadow-theme-xs transition focus-visible:border-brand-500 focus-visible:ring-brand-500/15"
              />
            </div>
            <p className="mt-2 text-xs font-medium text-[#66716f]">
              Extern logga används via URL och laddas inte upp till Campuslyan.
            </p>
          </div>
        )}
      </div>
    </FieldGroup>
  );
}

function ExternalCompaniesForm() {
  const { items: cities, state: citiesState } = useResourceList(useAdminCitySummaries());
  const { items: schools, state: schoolsState } = useResourceList(useAdminSchools());
  const {
    items: externalCompanies,
    state: externalCompaniesState,
    refresh: refreshExternalCompanies,
  } = useResourceList(useAdminExternalCompanies());
  const createExternalCompanyMutation = useAdminCreateExternalCompany();
  const updateExternalCompanyMutation = useAdminUpdateExternalCompany();
  const deleteExternalCompanyMutation = useAdminDeleteExternalCompany();
  const [form, setForm] = useState<ExternalCompanyFormState>(
    emptyExternalCompanyForm
  );
  const [logoFileInputKey, setLogoFileInputKey] = useState(0);
  const [updateForm, setUpdateForm] = useState<ExternalCompanyUpdateFormState>(
    emptyExternalCompanyUpdateForm
  );
  const [deleteId, setDeleteId] = useState("");
  const [state, setState] = useState<AdminActionState>({ status: "idle" });
  const [updateState, setUpdateState] = useState<AdminActionState>({ status: "idle" });
  const [deleteState, setDeleteState] = useState<AdminActionState>({ status: "idle" });

  const cityOptions = cities
    .map((city) => ({ city, code: cityCode(city) }))
    .filter((item): item is { city: CityDTO; code: string } => Boolean(item.code));
  const schoolOptions = schools
    .map((school) => ({ school, id: schoolId(school) }))
    .filter((item): item is { school: School; id: number } => Number.isFinite(item.id));

  function patchForm(patch: Partial<ExternalCompanyFormState>) {
    setForm((current) => ({ ...current, ...patch }));
  }

  function handleLogoFileChange(event: ChangeEvent<HTMLInputElement>) {
    patchForm({ logoFile: event.currentTarget.files?.[0] ?? null });
  }

  function clearLogoFile() {
    patchForm({ logoFile: null });
    setLogoFileInputKey((key) => key + 1);
  }

  function setLogoSource(logoSource: ExternalCompanyLogoSource) {
    setForm((current) => ({
      ...current,
      logoSource,
      logoUrl: logoSource === "upload" ? "" : current.logoUrl,
      logoFile: logoSource === "url" ? null : current.logoFile,
    }));
    if (logoSource === "url") {
      setLogoFileInputKey((key) => key + 1);
    }
  }

  function patchUpdateForm(patch: Partial<ExternalCompanyUpdateFormState>) {
    setUpdateForm((current) => ({ ...current, ...patch }));
  }

  function selectExternalCompany(id: string) {
    const selected = externalCompanies.find((company) => String(company.id) === id);
    if (!selected) {
      setUpdateForm(emptyExternalCompanyUpdateForm);
      return;
    }

    setUpdateForm({
      id,
      name: selected.name,
      description: selected.description ?? "",
      logoUrl: selected.logoUrl ?? "",
      websiteUrl: selected.websiteUrl ?? "",
      cityCodes: (selected.cityCodes ?? [])
        .map((code) => normalizeCityCode(code))
        .filter(Boolean),
      replaceCities: true,
    });
  }

  function setCitySelection(code: string, checked: boolean) {
    const normalizedCode = normalizeCityCode(code);
    if (!normalizedCode) return;

    setForm((current) => ({
      ...current,
      cityCodes: checked
        ? Array.from(new Set([...current.cityCodes, normalizedCode]))
        : current.cityCodes.filter((item) => item !== normalizedCode),
    }));
  }

  function setUpdateCitySelection(code: string, checked: boolean) {
    const normalizedCode = normalizeCityCode(code);
    if (!normalizedCode) return;

    setUpdateForm((current) => ({
      ...current,
      cityCodes: checked
        ? Array.from(new Set([...current.cityCodes, normalizedCode]))
        : current.cityCodes.filter((item) => item !== normalizedCode),
    }));
  }

  function setSchoolSelection(id: number, checked: boolean) {
    if (!Number.isFinite(id)) return;

    setForm((current) => ({
      ...current,
      schoolIds: checked
        ? Array.from(new Set([...current.schoolIds, id]))
        : current.schoolIds.filter((item) => item !== id),
    }));
  }

  async function createExternalCompany() {
    setState({ status: "loading", message: "Skapar externt företag..." });

    try {
      await createExternalCompanyMutation.mutateAsync(
        buildExternalCompanyPayload(form),
      );
      setForm(emptyExternalCompanyForm);
      setLogoFileInputKey((key) => key + 1);
      setState({ status: "success", message: "Det externa företaget skapades." });
      await refreshExternalCompanies();
    } catch (error) {
      setState({
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "Det externa företaget kunde inte skapas.",
      });
    }
  }

  async function updateExternalCompany() {
    setUpdateState({ status: "loading", message: "Uppdaterar externt företag..." });

    try {
      await updateExternalCompanyMutation.mutateAsync(
        buildExternalCompanyUpdatePayload(updateForm),
      );
      setUpdateForm(emptyExternalCompanyUpdateForm);
      setUpdateState({ status: "success", message: "Det externa företaget uppdaterades." });
      await refreshExternalCompanies();
    } catch (error) {
      setUpdateState({
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "Det externa företaget kunde inte uppdateras.",
      });
    }
  }

  async function deleteExternalCompany() {
    const id = parseOptionalNumber(deleteId);
    if (!id) {
      setDeleteState({ status: "error", message: "Ange id för externt företag." });
      return;
    }

    setDeleteState({ status: "loading", message: "Tar bort externt företag..." });
    try {
      await deleteExternalCompanyMutation.mutateAsync(id);
      setDeleteId("");
      if (updateForm.id.trim() === String(id)) {
        setUpdateForm(emptyExternalCompanyUpdateForm);
      }
      setDeleteState({ status: "success", message: "Det externa företaget togs bort." });
      await refreshExternalCompanies();
    } catch (error) {
      setDeleteState({
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "Det externa företaget kunde inte tas bort.",
      });
    }
  }

  const isCreateLogoMissing =
    form.logoSource === "upload" ? !form.logoFile : !form.logoUrl.trim();

  return (
    <div className="grid gap-4">
      <ActionShell
        title="Skapa externt företag"
        description="POST skapar ett externt företag och kopplar det till valda städer och skolor."
        method="POST"
        endpoint={
          form.logoSource === "upload"
            ? "/api/companies/external-company/with-logo"
            : "/api/companies/external-company"
        }
      >
      <ResultBlock state={citiesState} />
      <ResultBlock state={schoolsState} />
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <FormInput
          label="Företagsnamn"
          value={form.name}
          onChange={(name) => patchForm({ name })}
        />
        <FormInput
          label="Webbplats URL"
          value={form.websiteUrl}
          onChange={(websiteUrl) => patchForm({ websiteUrl })}
          placeholder="https://..."
        />
        <ExternalCompanyLogoField
          source={form.logoSource}
          logoUrl={form.logoUrl}
          logoFile={form.logoFile}
          inputId="external-company-logo-file"
          inputKey={logoFileInputKey}
          className="md:col-span-2"
          onSourceChange={setLogoSource}
          onUrlChange={(logoUrl) => patchForm({ logoUrl })}
          onFileChange={handleLogoFileChange}
          onClearFile={clearLogoFile}
        />
      </div>
      <div className="mt-3">
        <FormTextarea
          label="Beskrivning"
          value={form.description}
          onChange={(description) => patchForm({ description })}
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-[#476e66]">
              Städer
            </span>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                isDisabled={cityOptions.length === 0 || state.status === "loading"}
                onPress={() =>
                  patchForm({ cityCodes: cityOptions.map((option) => option.code) })
                }
                className="min-w-0 rounded-[8px] px-3 text-brand"
              >
                Markera alla
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                isDisabled={form.cityCodes.length === 0 || state.status === "loading"}
                onPress={() => patchForm({ cityCodes: [] })}
                className="min-w-0 rounded-[8px] px-3 text-brand"
              >
                Rensa
              </Button>
            </div>
          </div>
          <div className="mt-2 grid max-h-80 gap-2 overflow-auto rounded-[8px] border border-[#dfe7e3] bg-[#fbfcfb] p-3">
            {cityOptions.length === 0 ? (
              <p className="text-sm text-[#66716f]">Inga städer att visa.</p>
            ) : (
              cityOptions.map(({ city, code }) => (
                <label
                  key={code}
                  className="flex cursor-pointer items-start gap-2 rounded-[8px] border border-[#dfe7e3] bg-white px-3 py-2 text-sm text-[#111827] transition hover:bg-[#f3f8f5]"
                >
                  <Checkbox
                    checked={form.cityCodes.includes(code)}
                    disabled={state.status === "loading"}
                    onCheckedChange={(checked) => setCitySelection(code, checked === true)}
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

        <div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-[#476e66]">
              Skolor
            </span>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                isDisabled={schoolOptions.length === 0 || state.status === "loading"}
                onPress={() =>
                  patchForm({ schoolIds: schoolOptions.map((option) => option.id) })
                }
                className="min-w-0 rounded-[8px] px-3 text-brand"
              >
                Markera alla
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                isDisabled={form.schoolIds.length === 0 || state.status === "loading"}
                onPress={() => patchForm({ schoolIds: [] })}
                className="min-w-0 rounded-[8px] px-3 text-brand"
              >
                Rensa
              </Button>
            </div>
          </div>
          <div className="mt-2 grid max-h-80 gap-2 overflow-auto rounded-[8px] border border-[#dfe7e3] bg-[#fbfcfb] p-3">
            {schoolOptions.length === 0 ? (
              <p className="text-sm text-[#66716f]">Inga skolor att visa.</p>
            ) : (
              schoolOptions.map(({ school, id }) => (
                <label
                  key={id}
                  className="flex cursor-pointer items-start gap-2 rounded-[8px] border border-[#dfe7e3] bg-white px-3 py-2 text-sm text-[#111827] transition hover:bg-[#f3f8f5]"
                >
                  <Checkbox
                    checked={form.schoolIds.includes(id)}
                    disabled={state.status === "loading"}
                    onCheckedChange={(checked) => setSchoolSelection(id, checked === true)}
                    className="mt-0.5 border-[#9fb4ad] data-[state=checked]:border-brand data-[state=checked]:bg-brand"
                  />
                  <span>{schoolOptionLabel(school)}</span>
                </label>
              ))
            )}
          </div>
          <p className="mt-2 text-sm text-[#66716f]">
            {form.schoolIds.length} valda
          </p>
        </div>
      </div>

      <SubmitButton
        isLoading={state.status === "loading"}
        onPress={() => void createExternalCompany()}
        disabled={
          !form.name.trim() ||
          !form.description.trim() ||
          !form.websiteUrl.trim() ||
          isCreateLogoMissing
        }
      >
        Skapa externt företag
      </SubmitButton>
      <ResultBlock state={state} />
    </ActionShell>

    <ActionShell
      title="Uppdatera externt företag"
      description="PUT uppdaterar ett befintligt externt företag via id. Städer skickas bara när ersätt stadskopplingar är markerat."
      method="PUT"
      endpoint="/api/companies/external-company"
    >
      <ResultBlock state={externalCompaniesState} />
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <FormSelect
          label="Välj externt företag"
          value={updateForm.id}
          onChange={selectExternalCompany}
          disabled={
            externalCompaniesState.status === "loading" ||
            externalCompanies.length === 0
          }
        >
          <option value="">
            {externalCompaniesState.status === "loading"
              ? "Hämtar externa företag..."
              : "Välj externt företag"}
          </option>
          {externalCompanies.map((company) => (
            <option key={company.id} value={company.id}>
              {externalCompanyOptionLabel(company)}
            </option>
          ))}
        </FormSelect>
        <FormInput
          label="Företagsnamn"
          value={updateForm.name}
          onChange={(name) => patchUpdateForm({ name })}
        />
        <FormInput
          label="Webbplats URL"
          value={updateForm.websiteUrl}
          onChange={(websiteUrl) => patchUpdateForm({ websiteUrl })}
          placeholder="https://..."
        />
        <FormInput
          label="Logo URL"
          value={updateForm.logoUrl}
          onChange={(logoUrl) => patchUpdateForm({ logoUrl })}
          placeholder="https://..."
        />
      </div>
      <div className="mt-3">
        <FormTextarea
          label="Beskrivning"
          value={updateForm.description}
          onChange={(description) => patchUpdateForm({ description })}
        />
      </div>

      <div className="mt-4">
        <label className="flex w-fit cursor-pointer items-center gap-2 text-sm font-semibold text-[#111827]">
          <Checkbox
            checked={updateForm.replaceCities}
            disabled={updateState.status === "loading"}
            onCheckedChange={(checked) =>
              patchUpdateForm({ replaceCities: checked === true })
            }
            className="border-[#9fb4ad] data-[state=checked]:border-brand data-[state=checked]:bg-brand"
          />
          Ersätt stadskopplingar
        </label>

        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide text-[#476e66]">
            Städer
          </span>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              isDisabled={
                cityOptions.length === 0 ||
                updateState.status === "loading" ||
                !updateForm.replaceCities
              }
              onPress={() =>
                patchUpdateForm({ cityCodes: cityOptions.map((option) => option.code) })
              }
              className="min-w-0 rounded-[8px] px-3 text-brand"
            >
              Markera alla
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              isDisabled={
                updateForm.cityCodes.length === 0 ||
                updateState.status === "loading" ||
                !updateForm.replaceCities
              }
              onPress={() => patchUpdateForm({ cityCodes: [] })}
              className="min-w-0 rounded-[8px] px-3 text-brand"
            >
              Rensa
            </Button>
          </div>
        </div>
        <div className="mt-2 grid max-h-80 gap-2 overflow-auto rounded-[8px] border border-[#dfe7e3] bg-[#fbfcfb] p-3 sm:grid-cols-2">
          {cityOptions.length === 0 ? (
            <p className="text-sm text-[#66716f]">Inga städer att visa.</p>
          ) : (
            cityOptions.map(({ city, code }) => (
              <label
                key={code}
                className="flex cursor-pointer items-start gap-2 rounded-[8px] border border-[#dfe7e3] bg-white px-3 py-2 text-sm text-[#111827] transition hover:bg-[#f3f8f5]"
              >
                <Checkbox
                  checked={updateForm.cityCodes.includes(code)}
                  disabled={
                    updateState.status === "loading" || !updateForm.replaceCities
                  }
                  onCheckedChange={(checked) =>
                    setUpdateCitySelection(code, checked === true)
                  }
                  className="mt-0.5 border-[#9fb4ad] data-[state=checked]:border-brand data-[state=checked]:bg-brand"
                />
                <span>{cityOptionLabel(city)}</span>
              </label>
            ))
          )}
        </div>
        <p className="mt-2 text-sm text-[#66716f]">
          {updateForm.cityCodes.length} valda
        </p>
      </div>

      <SubmitButton
        isLoading={updateState.status === "loading"}
        onPress={() => void updateExternalCompany()}
        disabled={!updateForm.id.trim()}
      >
        Uppdatera externt företag
      </SubmitButton>
      <ResultBlock state={updateState} />
    </ActionShell>

    <ActionShell
      title="Ta bort externt företag"
      description="DELETE tar bort ett externt företag via id och rensar dess kopplingar till städer och skolor."
      method="DELETE"
      endpoint="/api/companies/external-company?id={id}"
    >
      <ResultBlock state={externalCompaniesState} />
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <FormSelect
          label="Välj externt företag"
          value={deleteId}
          onChange={setDeleteId}
          disabled={
            externalCompaniesState.status === "loading" ||
            externalCompanies.length === 0
          }
        >
          <option value="">
            {externalCompaniesState.status === "loading"
              ? "Hämtar externa företag..."
              : "Välj externt företag"}
          </option>
          {externalCompanies.map((company) => (
            <option key={company.id} value={company.id}>
              {externalCompanyOptionLabel(company)}
            </option>
          ))}
        </FormSelect>
      </div>
      <Button
        type="button"
        isLoading={deleteState.status === "loading"}
        isDisabled={!deleteId.trim()}
        onPress={() => void deleteExternalCompany()}
        variant="destructive"
        className="mt-4 bg-red-700 text-white hover:bg-red-800"
      >
        <Trash2Icon className="h-4 w-4" />
        Ta bort externt företag
      </Button>
      <ResultBlock state={deleteState} />
    </ActionShell>
  </div>
  );
}

export default ExternalCompaniesForm;
