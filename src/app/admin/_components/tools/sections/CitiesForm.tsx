"use client";

import { useState } from "react";
import { Trash2Icon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { adminService } from "@/features/admin/services/admin-service";
import { useAdminCitySummaries, useAdminCreateCity, useAdminDeleteCity, useAdminModifyCity } from "@/features/admin/hooks/useAdmin";
import { normalizeCityCode } from "@/features/cities/services/city-service";
import type { CityAdminDTO, CityDTO, CityDetailedDTO, CreateCityRequest, ModifyCityRequest } from "@/types";
import {
  type AdminActionState,
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

type CityFormState = {
  code: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  bannerUrl: string;
};

const emptyCityForm: CityFormState = {
  code: "",
  name: "",
  nameEn: "",
  description: "",
  descriptionEn: "",
  bannerUrl: "",
};

function cityAdminToForm(city: CityAdminDTO): CityFormState {
  return {
    code: normalizeCityCode(city.code),
    name: city.nameSv ?? "",
    nameEn: city.nameEn ?? "",
    description: city.descriptionSv ?? "",
    descriptionEn: city.descriptionEn ?? "",
    bannerUrl: city.bannerUrl ?? "",
  };
}

/** Fallback prefill from the localized list row when the admin view fails. */
function cityToForm(city: CityDTO | CityDetailedDTO): CityFormState {
  return {
    code: cityCode(city),
    name: city.name ?? "",
    nameEn: "",
    description: city.description ?? "",
    descriptionEn: "",
    bannerUrl: city.bannerUrl ?? "",
  };
}

function buildCreateCityPayload(form: CityFormState): CreateCityRequest {
  const code = normalizeCityCode(form.code);
  const name = form.name.trim();

  if (!code) {
    throw new Error("Ange en stadskod.");
  }
  if (!name) {
    throw new Error("Ange ett stadsnamn.");
  }

  return {
    code,
    name,
    nameEn: form.nameEn.trim(),
    description: form.description.trim() || null,
    descriptionEn: form.descriptionEn.trim(),
    bannerUrl: form.bannerUrl.trim() || null,
  };
}

function buildModifyCityPayload(form: CityFormState): ModifyCityRequest {
  const name = form.name.trim();
  if (!name) {
    throw new Error("Ange ett stadsnamn.");
  }

  return {
    name,
    nameEn: form.nameEn.trim(),
    description: form.description.trim() || null,
    descriptionEn: form.descriptionEn.trim(),
    bannerUrl: form.bannerUrl.trim() || null,
  };
}

function CityFields({
  form,
  onChange,
  lockCode = false,
}: {
  form: CityFormState;
  onChange: (patch: Partial<CityFormState>) => void;
  lockCode?: boolean;
}) {
  return (
    <>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <FormInput
          label="Kod (engelskt namn, används i URL:en)"
          value={form.code}
          onChange={(code) => onChange({ code })}
          placeholder="GOTHENBURG"
          disabled={lockCode}
        />
        <FormInput
          label="Namn (svenska)"
          value={form.name}
          onChange={(name) => onChange({ name })}
          placeholder="Göteborg"
        />
        <FormInput
          label="Namn (engelska, lämna tomt om samma som svenska)"
          value={form.nameEn}
          onChange={(nameEn) => onChange({ nameEn })}
          placeholder="Gothenburg"
        />
        <FormInput
          label="Banner URL"
          value={form.bannerUrl}
          onChange={(bannerUrl) => onChange({ bannerUrl })}
          placeholder="https://..."
        />
      </div>
      <div className="mt-3">
        <FormTextarea
          label="Beskrivning (svenska)"
          value={form.description}
          onChange={(description) => onChange({ description })}
        />
      </div>
      <div className="mt-3">
        <FormTextarea
          label="Beskrivning (engelska, lämna tomt om samma som svenska)"
          value={form.descriptionEn}
          onChange={(descriptionEn) => onChange({ descriptionEn })}
        />
      </div>
    </>
  );
}

function CitiesForm() {
  const { items, state: listState, refresh } = useResourceList(useAdminCitySummaries());
  const createCityMutation = useAdminCreateCity();
  const modifyCity = useAdminModifyCity();
  const deleteCityMutation = useAdminDeleteCity();
  const [selectedCode, setSelectedCode] = useState("");
  const [deleteCodes, setDeleteCodes] = useState<string[]>([]);
  const [cityDetail, setCityDetail] = useState<CityDetailedDTO | null>(null);
  const [createState, setCreateState] = useState<AdminActionState>({ status: "idle" });
  const [updateState, setUpdateState] = useState<AdminActionState>({ status: "idle" });
  const [deleteState, setDeleteState] = useState<AdminActionState>({ status: "idle" });
  const [createForm, setCreateForm] = useState<CityFormState>(emptyCityForm);
  const [updateForm, setUpdateForm] = useState<CityFormState>(emptyCityForm);
  const deletableCities = items
    .map((city) => ({ city, code: cityCode(city) }))
    .filter((item): item is { city: CityDTO; code: string } => Boolean(item.code));

  function setCityDeleteSelection(code: string, checked: boolean) {
    const normalizedCode = normalizeCityCode(code);
    if (!normalizedCode) return;

    setDeleteCodes((current) => {
      if (checked) {
        return Array.from(new Set([...current, normalizedCode]));
      }

      return current.filter((item) => item !== normalizedCode);
    });
  }

  function selectAllDeleteCities() {
    setDeleteCodes(Array.from(new Set(deletableCities.map((city) => city.code))));
  }

  async function selectCity(code: string) {
    setSelectedCode(code);
    setCityDetail(null);
    if (!code) {
      setUpdateForm(emptyCityForm);
      return;
    }

    setUpdateState({ status: "loading", message: "Hämtar stadsdetaljer..." });
    try {
      const [detail, adminView] = await Promise.all([
        adminService.getCity(code),
        adminService.getCityAdmin(code),
      ]);
      setCityDetail(detail);
      setUpdateForm(cityAdminToForm(adminView));
      setUpdateState({ status: "idle" });
    } catch (error) {
      const fallback = items.find((city) => cityCode(city) === code);
      if (fallback) {
        setUpdateForm(cityToForm(fallback));
      }
      setUpdateState({
        status: "error",
        message: error instanceof Error ? error.message : "Kunde inte hämta staden.",
      });
    }
  }

  async function createCity() {
    setCreateState({ status: "loading", message: "Skapar stad..." });
    try {
      const payload = buildCreateCityPayload(createForm);
      await createCityMutation.mutateAsync(payload);
      setCreateForm(emptyCityForm);
      setSelectedCode(payload.code);
      setUpdateForm({
        code: payload.code,
        name: payload.name ?? "",
        nameEn: payload.nameEn ?? "",
        description: payload.description ?? "",
        descriptionEn: payload.descriptionEn ?? "",
        bannerUrl: payload.bannerUrl ?? "",
      });
      setCreateState({ status: "success", message: "Staden sparades." });
      await refresh();
    } catch (error) {
      setCreateState({
        status: "error",
        message: error instanceof Error ? error.message : "Staden kunde inte sparas.",
      });
    }
  }

  async function updateCity() {
    const code = normalizeCityCode(updateForm.code || selectedCode);
    if (!code) {
      setUpdateState({ status: "error", message: "Välj en stad att uppdatera." });
      return;
    }

    setUpdateState({ status: "loading", message: "Uppdaterar stad..." });
    try {
      await modifyCity.mutateAsync({
        code,
        payload: buildModifyCityPayload(updateForm),
      });
      setUpdateState({ status: "success", message: "Staden uppdaterades." });
      await refresh();
    } catch (error) {
      setUpdateState({
        status: "error",
        message: error instanceof Error ? error.message : "Staden kunde inte uppdateras.",
      });
    }
  }

  async function deleteCities() {
    const codes = Array.from(
      new Set(deleteCodes.map((code) => normalizeCityCode(code)).filter(Boolean))
    );
    if (codes.length === 0) {
      setDeleteState({ status: "error", message: "Välj minst en stad att ta bort." });
      return;
    }

    setDeleteState({
      status: "loading",
      message:
        codes.length === 1
          ? "Tar bort stad..."
          : `Tar bort ${codes.length} städer...`,
    });

    const failures: Array<{ code: string; message: string }> = [];

    for (const code of codes) {
      try {
        await deleteCityMutation.mutateAsync(code);
      } catch (error) {
        failures.push({
          code,
          message: error instanceof Error ? error.message : "Okänt fel.",
        });
      }
    }

    const failedCodes = new Set(failures.map((failure) => failure.code));
    const deletedCodes = codes.filter((code) => !failedCodes.has(code));

    if (deletedCodes.includes(selectedCode)) {
      setSelectedCode("");
      setUpdateForm(emptyCityForm);
      setCityDetail(null);
    }

    const refreshedItems = await refresh();
    const refreshedCodes = new Set(refreshedItems.map(cityCode).filter(Boolean));
    setDeleteCodes(codes.filter((code) => failedCodes.has(code) && refreshedCodes.has(code)));

    if (failures.length > 0) {
      const failedSummary = failures
        .slice(0, 3)
        .map((failure) => `${failure.code}: ${failure.message}`)
        .join(" ");
      setDeleteState({
        status: "error",
        message:
          deletedCodes.length > 0
            ? `${deletedCodes.length} av ${codes.length} städer togs bort. Kunde inte ta bort: ${failedSummary}`
            : `Kunde inte ta bort valda städer: ${failedSummary}`,
      });
      return;
    }

    setDeleteState({
      status: "success",
      message: codes.length === 1 ? "Staden togs bort." : `${codes.length} städer togs bort.`,
    });
  }

  return (
    <div className="grid gap-4">
      <ActionShell
        title="Hämta och uppdatera stad"
        description="GET hämtar alla städer. Välj en stad och spara namn, beskrivning och bannerbild med PUT."
        method="GET/PUT"
        endpoint="/api/cities, /api/cities/{code}"
      >
        <ResultBlock state={listState} />
        <FormSelect label="Välj befintlig stad" value={selectedCode} onChange={(code) => void selectCity(code)}>
          <option value="">Välj stad</option>
          {items.map((city) => {
            const code = cityCode(city);
            if (!code) return null;

            return (
              <option key={code} value={code}>
                {cityOptionLabel(city)}
              </option>
            );
          })}
        </FormSelect>
        <CityFields
          form={updateForm}
          onChange={(patch) => setUpdateForm((current) => ({ ...current, ...patch }))}
          lockCode
        />
        {cityDetail && (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[8px] border border-[#edf2ef] bg-[#fbfcfb] px-3 py-2">
              <span className="block text-xs font-semibold uppercase tracking-wide text-[#476e66]">Företag</span>
              <span className="mt-1 block text-lg font-semibold text-[#111827]">{cityDetail.companies?.length ?? 0}</span>
            </div>
            <div className="rounded-[8px] border border-[#edf2ef] bg-[#fbfcfb] px-3 py-2">
              <span className="block text-xs font-semibold uppercase tracking-wide text-[#476e66]">Externa företag</span>
              <span className="mt-1 block text-lg font-semibold text-[#111827]">{cityDetail.externalCompanies?.length ?? 0}</span>
            </div>
          </div>
        )}
        <SubmitButton isLoading={updateState.status === "loading"} onPress={() => void updateCity()} disabled={!updateForm.code.trim()}>
          Uppdatera vald
        </SubmitButton>
        <ResultBlock state={updateState} />
      </ActionShell>

      <ActionShell
        title="Skapa ny stad"
        description="POST skapar eller uppdaterar staden via den nya cities-endpointen."
        method="POST"
        endpoint="/api/cities"
      >
        <CityFields
          form={createForm}
          onChange={(patch) => setCreateForm((current) => ({ ...current, ...patch }))}
        />
        <SubmitButton isLoading={createState.status === "loading"} onPress={() => void createCity()} disabled={!createForm.code.trim() || !createForm.name.trim()}>
          Spara stad
        </SubmitButton>
        <ResultBlock state={createState} />
      </ActionShell>

      <ActionShell
        title="Ta bort stad"
        description="DELETE tar bort valda städer via kod, en stad i taget."
        method="DELETE"
        endpoint="/api/cities/{code}"
      >
        <div className="mt-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-[#476e66]">
              Välj städer
            </span>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                isDisabled={deletableCities.length === 0 || deleteState.status === "loading"}
                onPress={selectAllDeleteCities}
                className="min-w-0 rounded-[8px] px-3 text-brand"
              >
                Markera alla
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                isDisabled={deleteCodes.length === 0 || deleteState.status === "loading"}
                onPress={() => setDeleteCodes([])}
                className="min-w-0 rounded-[8px] px-3 text-brand"
              >
                Rensa
              </Button>
            </div>
          </div>
          <div className="mt-2 grid max-h-72 gap-2 overflow-auto rounded-[8px] border border-[#dfe7e3] bg-[#fbfcfb] p-3 sm:grid-cols-2">
            {deletableCities.length === 0 ? (
              <p className="text-sm text-[#66716f]">Inga städer att visa.</p>
            ) : (
              deletableCities.map(({ city, code }) => (
                <label
                  key={code}
                  className="flex cursor-pointer items-start gap-2 rounded-[8px] border border-[#dfe7e3] bg-white px-3 py-2 text-sm text-[#111827] transition hover:bg-[#f3f8f5]"
                >
                  <Checkbox
                    checked={deleteCodes.includes(code)}
                    disabled={deleteState.status === "loading"}
                    onCheckedChange={(checked) => setCityDeleteSelection(code, checked === true)}
                    className="mt-0.5 border-[#9fb4ad] data-[state=checked]:border-brand data-[state=checked]:bg-brand"
                  />
                  <span>{cityOptionLabel(city)}</span>
                </label>
              ))
            )}
          </div>
          <p className="mt-2 text-sm text-[#66716f]">
            {deleteCodes.length} valda
          </p>
        </div>
        <Button
          type="button"
          isLoading={deleteState.status === "loading"}
          isDisabled={deleteCodes.length === 0}
          onPress={() => void deleteCities()}
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

export default CitiesForm;
