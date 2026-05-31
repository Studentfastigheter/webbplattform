"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import {
  CheckCircle2Icon,
  RefreshCwIcon,
  Trash2Icon,
  UserPlusIcon,
  XCircleIcon,
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { Button } from "@/components/ui/button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { adminService } from "@/features/admin/services/admin-service";
import type {
  AdminAddSchoolRequest,
  AdminCityPayload,
  AdminCompanyCredentialDTO,
  AdminCompanyDetailedDTO,
  AdminCompanyUserDTO,
  AdminCreateCompanyRequest,
  AdminCreatePOIRequest,
  AdminListingTagDetailDTO,
  AdminLocationCategoryDTO,
  AdminModifyPOIRequest,
  AdminPointOfInterestDTO,
  AdminCompanyPublicDTO,
  AdminWaitlistEntryDTO,
  AdminWaitlistStatsDTO,
  School,
} from "@/types";

type AdminActionState = {
  status: "idle" | "loading" | "success" | "error";
  message?: string;
};

const ADMIN_TABS = [
  "tags",
  "schools",
  "locations",
  "companies",
  "accounts",
  "activities",
  "waitlist",
  "statistics",
  "legacy",
] as const;

export type AdminSection = (typeof ADMIN_TABS)[number];

function toInputValue(value: unknown) {
  return value === undefined || value === null ? "" : String(value);
}

function parseRequiredNumber(value: string, label: string) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw new Error(`${label} måste vara ett nummer.`);
  }
  return parsed;
}

function parseOptionalNumber(value: string) {
  if (!value.trim()) return undefined;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw new Error("Ett numeriskt fält innehåller ett ogiltigt värde.");
  }
  return parsed;
}

function parseListInput(value: string) {
  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function getStringOptions(values: Array<string | null | undefined>, selectedValue = "") {
  const options = new Set(
    values
      .map((value) => value?.trim())
      .filter((value): value is string => Boolean(value))
  );
  const selected = selectedValue.trim();
  if (selected) {
    options.add(selected);
  }

  return Array.from(options).sort((left, right) => left.localeCompare(right, "sv"));
}

function parseSocialLinksInput(value: string) {
  const entries = value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const separatorIndex = line.indexOf("=");
      if (separatorIndex < 1) {
        throw new Error("Sociala länkar ska skrivas som platform=url, en per rad.");
      }

      return [
        line.slice(0, separatorIndex).trim(),
        line.slice(separatorIndex + 1).trim(),
      ] as const;
    })
    .filter(([, url]) => url.length > 0);

  return entries.length ? Object.fromEntries(entries) : undefined;
}

function formatSocialLinksInput(value: Record<string, string> | undefined) {
  return Object.entries(value ?? {})
    .map(([platform, url]) => `${platform}=${url}`)
    .join("\n");
}

function normalizeDateTimeInput(value: string) {
  return value ? new Date(value).toISOString() : undefined;
}

function useResourceList<TItem>(onFetch: () => Promise<TItem[]>) {
  const [items, setItems] = useState<TItem[]>([]);
  const [state, setState] = useState<AdminActionState>({
    status: "loading",
    message: "Hämtar data...",
  });

  async function refresh() {
    setState({ status: "loading", message: "Hämtar data..." });
    try {
      const result = await onFetch();
      setItems(result);
      setState({ status: "idle" });
      return result;
    } catch (error) {
      setItems([]);
      setState({
        status: "error",
        message: error instanceof Error ? error.message : "Kunde inte hämta data.",
      });
      return [];
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  return { items, state, refresh };
}

function ResultBlock({ state }: { state: AdminActionState }) {
  if (state.status === "idle") return null;

  const isError = state.status === "error";
  const isLoading = state.status === "loading";

  return (
    <div
      className={[
        "mt-4 rounded-[8px] border px-4 py-3 text-sm",
        isError
          ? "border-red-200 bg-red-50 text-red-800"
          : isLoading
            ? "border-[#dfe7e3] bg-white text-[#36534d]"
            : "border-emerald-200 bg-emerald-50 text-emerald-800",
      ].join(" ")}
    >
      <div className="flex items-start gap-2">
        {isError ? (
          <XCircleIcon className="mt-0.5 h-4 w-4 shrink-0" />
        ) : isLoading ? (
          <RefreshCwIcon className="mt-0.5 h-4 w-4 shrink-0 animate-spin" />
        ) : (
          <CheckCircle2Icon className="mt-0.5 h-4 w-4 shrink-0" />
        )}
        <span>{state.message}</span>
      </div>
    </div>
  );
}

function EndpointBadge({ method, endpoint }: { method: string; endpoint: string }) {
  return (
    <code className="inline-flex max-w-full items-center gap-2 rounded-[8px] border border-[#dfe7e3] bg-white px-2.5 py-1.5 text-xs font-medium text-[#36534d] shadow-sm">
      <span className="rounded-[6px] bg-[#004225] px-1.5 py-0.5 text-[10px] font-semibold text-white">
        {method}
      </span>
      <span className="break-all">{endpoint}</span>
    </code>
  );
}

function SectionContent({
  active,
  value,
  children,
}: {
  active: AdminSection;
  value: AdminSection;
  children: ReactNode;
}) {
  return active === value ? <>{children}</> : null;
}

function ActionShell({
  title,
  endpoint,
  method,
  description,
  children,
}: {
  title: string;
  endpoint: string;
  method: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[8px] border border-[#dfe7e3] bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-[#111827]">{title}</h3>
          {description && (
            <p className="mt-1 text-sm leading-6 text-[#66716f]">{description}</p>
          )}
        </div>
        <EndpointBadge method={method} endpoint={endpoint} />
      </div>
      {children}
    </section>
  );
}

function FieldRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-2 text-xs font-semibold uppercase tracking-wide text-[#476e66]">
      {label}
      {children}
    </label>
  );
}

function FormInput({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <FieldRow label={label}>
      <Input
        type={type}
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 rounded-[8px] border-[#dfe7e3] bg-white normal-case tracking-normal text-[#111827]"
      />
    </FieldRow>
  );
}

function FormTextarea({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <FieldRow label={label}>
      <Textarea
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-24 rounded-[8px] border-[#dfe7e3] bg-white normal-case tracking-normal text-[#111827]"
      />
    </FieldRow>
  );
}

function FormSelect({
  label,
  value,
  onChange,
  children,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
  disabled?: boolean;
}) {
  return (
    <FieldRow label={label}>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className="h-10 rounded-[8px] border border-[#dfe7e3] bg-white px-3 text-sm normal-case tracking-normal text-[#111827] outline-none focus-visible:ring-2 focus-visible:ring-[#004225]/20"
      >
        {children}
      </select>
    </FieldRow>
  );
}

function SubmitButton({
  children,
  isLoading,
  onPress,
  disabled,
}: {
  children: ReactNode;
  isLoading: boolean;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Button
      type="button"
      isLoading={isLoading}
      isDisabled={disabled}
      onPress={onPress}
      className="mt-4 bg-[#004225] text-white hover:bg-[#00351e]"
    >
      {children}
    </Button>
  );
}

function DeleteIdAction({
  title,
  description,
  endpoint,
  label,
  onSubmit,
}: {
  title: string;
  description: string;
  endpoint: string;
  label: string;
  onSubmit: (id: number) => Promise<unknown>;
}) {
  const [id, setId] = useState("");
  const [state, setState] = useState<AdminActionState>({ status: "idle" });

  async function run() {
    const numericId = Number(id);
    if (!Number.isInteger(numericId) || numericId <= 0) {
      setState({ status: "error", message: "Ange ett numeriskt id." });
      return;
    }

    setState({ status: "loading", message: "Tar bort..." });
    try {
      await onSubmit(numericId);
      setState({ status: "success", message: "Delete-anropet gick igenom." });
    } catch (error) {
      setState({
        status: "error",
        message: error instanceof Error ? error.message : "Anropet misslyckades.",
      });
    }
  }

  return (
    <ActionShell title={title} description={description} method="PUT" endpoint={endpoint}>
      <div className="mt-4 rounded-[8px] border border-red-100 bg-red-50/60 p-3">
        <FormInput label={label} value={id} onChange={setId} placeholder="Ange numeriskt id" />
        <Button
          type="button"
          isLoading={state.status === "loading"}
          onPress={run}
          variant="destructive"
          className="mt-3 bg-red-700 text-white hover:bg-red-800"
        >
          <Trash2Icon className="h-4 w-4" />
          Ta bort
        </Button>
      </div>
      <ResultBlock state={state} />
    </ActionShell>
  );
}

type TagFormState = {
  tag: string;
  displayName: string;
  icon: string;
  tagValues: string;
};

function TagsFormFields({
  form,
  onChange,
  includeValues,
  lockTag = false,
}: {
  form: TagFormState;
  onChange: (patch: Partial<TagFormState>) => void;
  includeValues: boolean;
  lockTag?: boolean;
}) {
  return (
    <>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <FormInput label="Tagg" value={form.tag} onChange={(tag) => onChange({ tag })} disabled={lockTag} />
        <FormInput
          label="Visningsnamn"
          value={form.displayName}
          onChange={(displayName) => onChange({ displayName })}
        />
        <FormInput label="Ikon" value={form.icon} onChange={(icon) => onChange({ icon })} />
      </div>
      {includeValues && (
        <div className="mt-3">
          <FormTextarea
            label="Tillåtna värden"
            value={form.tagValues}
            onChange={(tagValues) => onChange({ tagValues })}
            placeholder="En per rad, eller kommaseparerat"
          />
        </div>
      )}
    </>
  );
}

function TagsForm() {
  const { items, state: listState, refresh } = useResourceList(adminService.getTags);
  const [selectedTag, setSelectedTag] = useState("");
  const [updateState, setUpdateState] = useState<AdminActionState>({ status: "idle" });
  const [createState, setCreateState] = useState<AdminActionState>({ status: "idle" });
  const [updateForm, setUpdateForm] = useState<TagFormState>({
    tag: "",
    displayName: "",
    icon: "",
    tagValues: "",
  });
  const [createForm, setCreateForm] = useState<TagFormState>({
    tag: "",
    displayName: "",
    icon: "",
    tagValues: "",
  });

  function selectTag(tag: string) {
    setSelectedTag(tag);
    const selected = items.find((item) => item.tag === tag);
    if (!selected) return;
    setUpdateForm({
      tag: selected.tag ?? "",
      displayName: selected.displayName ?? "",
      icon: selected.icon ?? "",
      tagValues: (selected.tagValues ?? []).join("\n"),
    });
  }

  async function updateTag() {
    setUpdateState({ status: "loading", message: "Uppdaterar tagg..." });
    try {
      await adminService.modifyTag({
        tag: updateForm.tag.trim(),
        displayName: updateForm.displayName.trim(),
        icon: updateForm.icon.trim(),
        tagValues: parseListInput(updateForm.tagValues),
      });
      setUpdateState({ status: "success", message: "Taggen uppdaterades." });
      await refresh();
    } catch (error) {
      setUpdateState({
        status: "error",
        message: error instanceof Error ? error.message : "Kunde inte uppdatera taggen.",
      });
    }
  }

  async function createTag() {
    setCreateState({ status: "loading", message: "Skapar tagg..." });
    try {
      await adminService.createTag({
        tag: createForm.tag.trim(),
        displayName: createForm.displayName.trim(),
        icon: createForm.icon.trim(),
        tagValues: parseListInput(createForm.tagValues),
      });
      setCreateForm({ tag: "", displayName: "", icon: "", tagValues: "" });
      setCreateState({ status: "success", message: "Taggen skapades." });
      await refresh();
    } catch (error) {
      setCreateState({
        status: "error",
        message: error instanceof Error ? error.message : "Kunde inte skapa taggen.",
      });
    }
  }

  return (
    <div className="grid gap-4">
      <ActionShell
        title="Hämta och uppdatera tagg"
        description="Välj en tagg från GET-resultatet. PUT uppdaterar bara den valda posten."
        method="GET/PUT"
        endpoint="/api/admin/tags, /api/admin/tag"
      >
        <ResultBlock state={listState} />
        <FormSelect label="Välj befintlig tagg" value={selectedTag} onChange={selectTag}>
          <option value="">Välj tagg</option>
          {items.map((item) => (
            <option key={item.tag} value={item.tag}>
              {[item.displayName, item.tag].filter(Boolean).join(" - ")}
            </option>
          ))}
        </FormSelect>
        <TagsFormFields form={updateForm} onChange={(patch) => setUpdateForm((current) => ({ ...current, ...patch }))} includeValues lockTag />
        <SubmitButton isLoading={updateState.status === "loading"} onPress={updateTag} disabled={!updateForm.tag.trim()}>
          Uppdatera vald
        </SubmitButton>
        <ResultBlock state={updateState} />
      </ActionShell>

      <ActionShell
        title="Skapa ny tagg"
        description="POST är separat och skapar en ny post."
        method="POST"
        endpoint="/api/admin/tag"
      >
        <TagsFormFields form={createForm} onChange={(patch) => setCreateForm((current) => ({ ...current, ...patch }))} includeValues />
        <SubmitButton isLoading={createState.status === "loading"} onPress={createTag} disabled={!createForm.tag.trim()}>
          Skapa
        </SubmitButton>
        <ResultBlock state={createState} />
      </ActionShell>
    </div>
  );
}

type SchoolFormState = {
  schoolId?: string;
  schoolName: string;
  city: string;
  lat: string;
  lng: string;
};

const emptySchoolForm: SchoolFormState = {
  schoolId: "",
  schoolName: "",
  city: "",
  lat: "",
  lng: "",
};

function buildSchoolPayload(form: SchoolFormState, requireId: boolean): AdminAddSchoolRequest {
  const schoolId = parseOptionalNumber(form.schoolId ?? "");
  if (requireId && !schoolId) {
    throw new Error("Välj en skola eller ange schoolId innan du uppdaterar.");
  }
  const city = form.city.trim();
  if (!city) {
    throw new Error("Välj en stad.");
  }

  return {
    ...(schoolId ? { schoolId } : {}),
    schoolName: form.schoolName.trim(),
    city,
    lat: parseRequiredNumber(form.lat, "Latitud"),
    lng: parseRequiredNumber(form.lng, "Longitud"),
  };
}

function SchoolFields({
  form,
  onChange,
  includeId,
  cityOptions,
  citiesLoading,
}: {
  form: SchoolFormState;
  onChange: (patch: Partial<SchoolFormState>) => void;
  includeId: boolean;
  cityOptions: string[];
  citiesLoading: boolean;
}) {
  return (
    <div className="mt-4 grid gap-3 md:grid-cols-2">
      {includeId && (
        <FormInput label="SchoolId" value={form.schoolId ?? ""} onChange={(schoolId) => onChange({ schoolId })} disabled />
      )}
      <FormInput label="Skolnamn" value={form.schoolName} onChange={(schoolName) => onChange({ schoolName })} />
      <FormSelect
        label="Stad"
        value={form.city}
        onChange={(city) => onChange({ city })}
        disabled={citiesLoading || cityOptions.length === 0}
      >
        <option value="">
          {citiesLoading ? "Hämtar städer..." : "Välj stad"}
        </option>
        {cityOptions.map((city) => (
          <option key={city} value={city}>
            {city}
          </option>
        ))}
      </FormSelect>
      <FormInput label="Latitud" value={form.lat} onChange={(lat) => onChange({ lat })} />
      <FormInput label="Longitud" value={form.lng} onChange={(lng) => onChange({ lng })} />
    </div>
  );
}

function SchoolsForm() {
  const { items, state: listState, refresh } = useResourceList<School>(adminService.getSchools);
  const { items: cities, state: cityState } = useResourceList<string>(adminService.getCities);
  const [selectedId, setSelectedId] = useState("");
  const [updateState, setUpdateState] = useState<AdminActionState>({ status: "idle" });
  const [createState, setCreateState] = useState<AdminActionState>({ status: "idle" });
  const [updateForm, setUpdateForm] = useState<SchoolFormState>(emptySchoolForm);
  const [createForm, setCreateForm] = useState<SchoolFormState>(emptySchoolForm);
  const citiesLoading = cityState.status === "loading";
  const updateCityOptions = getStringOptions(cities, updateForm.city);
  const createCityOptions = getStringOptions(cities, createForm.city);

  function selectSchool(id: string) {
    setSelectedId(id);
    const selected = items.find((school) => String(school.id) === id);
    if (!selected) return;
    setUpdateForm({
      schoolId: String(selected.id),
      schoolName: selected.name ?? "",
      city: toInputValue(selected.city),
      lat: toInputValue(selected.lat),
      lng: toInputValue(selected.lng),
    });
  }

  async function updateSchool() {
    setUpdateState({ status: "loading", message: "Uppdaterar skola..." });
    try {
      await adminService.modifySchool(buildSchoolPayload(updateForm, true));
      setUpdateState({ status: "success", message: "Skolan uppdaterades." });
      await refresh();
    } catch (error) {
      setUpdateState({
        status: "error",
        message: error instanceof Error ? error.message : "Skolan kunde inte sparas.",
      });
    }
  }

  async function createSchool() {
    setCreateState({ status: "loading", message: "Skapar skola..." });
    try {
      await adminService.createSchool(buildSchoolPayload(createForm, false));
      setCreateForm(emptySchoolForm);
      setCreateState({ status: "success", message: "Skolan skapades." });
      await refresh();
    } catch (error) {
      setCreateState({
        status: "error",
        message: error instanceof Error ? error.message : "Skolan kunde inte sparas.",
      });
    }
  }

  return (
    <div className="grid gap-4">
      <ActionShell
        title="Hämta och uppdatera skola"
        description="GET hämtar alla skolor och städer. Välj en skola och uppdatera den med PUT."
        method="GET/PUT"
        endpoint="/api/schools, /api/listings/cities, /api/admin/school"
      >
        <ResultBlock state={listState} />
        <ResultBlock state={cityState} />
        <FormSelect label="Välj befintlig skola" value={selectedId} onChange={selectSchool}>
          <option value="">Välj skola</option>
          {items.map((school) => (
            <option key={school.id} value={school.id}>
              {[school.name, school.city].filter(Boolean).join(" - ")}
            </option>
          ))}
        </FormSelect>
        <SchoolFields
          form={updateForm}
          onChange={(patch) => setUpdateForm((current) => ({ ...current, ...patch }))}
          includeId
          cityOptions={updateCityOptions}
          citiesLoading={citiesLoading}
        />
        <SubmitButton isLoading={updateState.status === "loading"} onPress={updateSchool} disabled={!updateForm.schoolId?.trim()}>
          Uppdatera vald
        </SubmitButton>
        <ResultBlock state={updateState} />
      </ActionShell>

      <ActionShell
        title="Skapa ny skola"
        description="POST är separat och skapar en ny skola. Stad väljs från GET-listan."
        method="POST"
        endpoint="/api/admin/school"
      >
        <ResultBlock state={cityState} />
        <SchoolFields
          form={createForm}
          onChange={(patch) => setCreateForm((current) => ({ ...current, ...patch }))}
          includeId={false}
          cityOptions={createCityOptions}
          citiesLoading={citiesLoading}
        />
        <SubmitButton isLoading={createState.status === "loading"} onPress={createSchool} disabled={!createForm.city.trim()}>
          Skapa
        </SubmitButton>
        <ResultBlock state={createState} />
      </ActionShell>
    </div>
  );
}

function LocationCategoriesForm() {
  const { items, state: listState, refresh } = useResourceList(adminService.getLocationCategories);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [updateState, setUpdateState] = useState<AdminActionState>({ status: "idle" });
  const [createState, setCreateState] = useState<AdminActionState>({ status: "idle" });
  const [updateForm, setUpdateForm] = useState({ category: "", googleType: "" });
  const [createForm, setCreateForm] = useState({ category: "", googleType: "" });

  function selectCategory(category: string) {
    setSelectedCategory(category);
    const selected = items.find((item) => item.category === category);
    if (!selected) return;
    setUpdateForm({
      category: selected.category ?? "",
      googleType: selected.googleType ?? "",
    });
  }

  async function save(action: "create" | "update") {
    const source = action === "create" ? createForm : updateForm;
    const setState = action === "create" ? setCreateState : setUpdateState;
    setState({
      status: "loading",
      message: action === "create" ? "Skapar kategori..." : "Uppdaterar kategori...",
    });

    try {
      const payload: AdminLocationCategoryDTO = {
        category: source.category.trim(),
        googleType: source.googleType.trim(),
      };
      if (action === "create") {
        await adminService.addLocationCategory(payload);
        setCreateForm({ category: "", googleType: "" });
      } else {
        await adminService.modifyLocationCategory(payload);
      }
      setState({
        status: "success",
        message: action === "create" ? "Kategorin skapades." : "Kategorin uppdaterades.",
      });
      await refresh();
    } catch (error) {
      setState({
        status: "error",
        message: error instanceof Error ? error.message : "Kategorin kunde inte sparas.",
      });
    }
  }

  return (
    <div className="grid gap-4">
      <ActionShell
        title="Hämta och uppdatera platskategori"
        description="GET hämtar alla kategorier. Välj en kategori och uppdatera den med PUT."
        method="GET/PUT"
        endpoint="/api/admin/location-categories, /api/admin/location-category"
      >
        <ResultBlock state={listState} />
        <FormSelect label="Välj befintlig kategori" value={selectedCategory} onChange={selectCategory}>
          <option value="">Välj kategori</option>
          {items.map((item) => (
            <option key={item.category} value={item.category}>
              {[item.category, item.googleType].filter(Boolean).join(" - ")}
            </option>
          ))}
        </FormSelect>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <FormInput
            label="Kategori"
            value={updateForm.category}
            onChange={() => undefined}
            disabled
          />
          <FormInput label="Google type" value={updateForm.googleType} onChange={(googleType) => setUpdateForm((current) => ({ ...current, googleType }))} />
        </div>
        <SubmitButton isLoading={updateState.status === "loading"} onPress={() => void save("update")} disabled={!updateForm.category.trim()}>
          Uppdatera vald
        </SubmitButton>
        <ResultBlock state={updateState} />
      </ActionShell>

      <ActionShell
        title="Skapa ny platskategori"
        description="POST är separat och skapar en ny kategori."
        method="POST"
        endpoint="/api/admin/location-category"
      >
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <FormInput label="Kategori" value={createForm.category} onChange={(category) => setCreateForm((current) => ({ ...current, category }))} />
          <FormInput label="Google type" value={createForm.googleType} onChange={(googleType) => setCreateForm((current) => ({ ...current, googleType }))} />
        </div>
        <SubmitButton isLoading={createState.status === "loading"} onPress={() => void save("create")}>
          Skapa
        </SubmitButton>
        <ResultBlock state={createState} />
      </ActionShell>
    </div>
  );
}

type ActivityFormState = {
  id?: string;
  category: string;
  name: string;
  lat: string;
  lng: string;
};

const emptyActivityForm: ActivityFormState = {
  id: "",
  category: "",
  name: "",
  lat: "",
  lng: "",
};

function buildActivityPayload(form: ActivityFormState, requireId: boolean): AdminModifyPOIRequest {
  const id = parseOptionalNumber(form.id ?? "");
  if (requireId && !id) {
    throw new Error("Välj en aktivitet eller ange id innan du uppdaterar.");
  }
  const category = form.category.trim();
  if (!category) {
    throw new Error("Välj en kategori.");
  }

  return {
    ...(id ? { id } : {}),
    category,
    name: form.name.trim(),
    lat: parseRequiredNumber(form.lat, "Latitud"),
    lng: parseRequiredNumber(form.lng, "Longitud"),
  };
}

function getActivityCategoryOptions(
  categories: AdminLocationCategoryDTO[],
  selectedCategory: string
) {
  const values = new Set(
    categories
      .map((category) => category.category?.trim())
      .filter((category): category is string => Boolean(category))
  );
  const selected = selectedCategory.trim();
  if (selected) {
    values.add(selected);
  }
  return Array.from(values).sort((left, right) => left.localeCompare(right, "sv"));
}

function ActivityFields({
  form,
  onChange,
  includeId,
  categoryOptions,
  categoriesLoading,
}: {
  form: ActivityFormState;
  onChange: (patch: Partial<ActivityFormState>) => void;
  includeId: boolean;
  categoryOptions: string[];
  categoriesLoading: boolean;
}) {
  return (
    <div className="mt-4 grid gap-3 md:grid-cols-2">
      {includeId && <FormInput label="Id" value={form.id ?? ""} onChange={(id) => onChange({ id })} disabled />}
      <FormSelect
        label="Kategori"
        value={form.category}
        onChange={(category) => onChange({ category })}
        disabled={categoriesLoading || categoryOptions.length === 0}
      >
        <option value="">
          {categoriesLoading ? "Hämtar kategorier..." : "Välj kategori"}
        </option>
        {categoryOptions.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </FormSelect>
      <FormInput label="Namn" value={form.name} onChange={(name) => onChange({ name })} />
      <FormInput label="Latitud" value={form.lat} onChange={(lat) => onChange({ lat })} />
      <FormInput label="Longitud" value={form.lng} onChange={(lng) => onChange({ lng })} />
    </div>
  );
}

function ActivitiesForm() {
  const { items, state: listState, refresh } = useResourceList<AdminPointOfInterestDTO>(adminService.getActivities);
  const { items: categories, state: categoryState } = useResourceList<AdminLocationCategoryDTO>(adminService.getLocationCategories);
  const [selectedId, setSelectedId] = useState("");
  const [deleteId, setDeleteId] = useState("");
  const [updateState, setUpdateState] = useState<AdminActionState>({ status: "idle" });
  const [createState, setCreateState] = useState<AdminActionState>({ status: "idle" });
  const [deleteState, setDeleteState] = useState<AdminActionState>({ status: "idle" });
  const [updateForm, setUpdateForm] = useState<ActivityFormState>(emptyActivityForm);
  const [createForm, setCreateForm] = useState<ActivityFormState>(emptyActivityForm);
  const categoriesLoading = categoryState.status === "loading";
  const updateCategoryOptions = getActivityCategoryOptions(categories, updateForm.category);
  const createCategoryOptions = getActivityCategoryOptions(categories, createForm.category);

  function selectActivity(id: string) {
    setSelectedId(id);
    const selected = items.find((item) => String(item.id) === id);
    if (!selected) return;
    setUpdateForm({
      id: toInputValue(selected.id),
      category: selected.category ?? "",
      name: selected.name ?? "",
      lat: toInputValue(selected.lat),
      lng: toInputValue(selected.lng),
    });
  }

  async function save(action: "create" | "update") {
    const source = action === "create" ? createForm : updateForm;
    const setState = action === "create" ? setCreateState : setUpdateState;
    setState({
      status: "loading",
      message: action === "create" ? "Skapar aktivitet..." : "Uppdaterar aktivitet...",
    });

    try {
      if (action === "create") {
        await adminService.createActivity(buildActivityPayload(source, false) as AdminCreatePOIRequest);
        setCreateForm(emptyActivityForm);
      } else {
        await adminService.modifyActivity(buildActivityPayload(source, true));
      }
      setState({
        status: "success",
        message: action === "create" ? "Aktiviteten skapades." : "Aktiviteten uppdaterades.",
      });
      await refresh();
    } catch (error) {
      setState({
        status: "error",
        message: error instanceof Error ? error.message : "Aktiviteten kunde inte sparas.",
      });
    }
  }

  async function deleteActivity() {
    const id = parseOptionalNumber(deleteId);
    if (!id) {
      setDeleteState({ status: "error", message: "Välj en aktivitet att ta bort." });
      return;
    }

    setDeleteState({ status: "loading", message: "Tar bort aktivitet..." });
    try {
      await adminService.deleteActivity(id);
      setDeleteId("");
      setDeleteState({ status: "success", message: "Aktiviteten togs bort." });
      await refresh();
    } catch (error) {
      setDeleteState({
        status: "error",
        message: error instanceof Error ? error.message : "Aktiviteten kunde inte tas bort.",
      });
    }
  }

  return (
    <div className="grid gap-4">
      <ActionShell
        title="Hämta och uppdatera aktivitet"
        description="GET hämtar alla aktiviteter. Välj en aktivitet och uppdatera den med PUT."
        method="GET/PUT"
        endpoint="/api/admin/activities, /api/admin/activity"
      >
        <ResultBlock state={listState} />
        <ResultBlock state={categoryState} />
        <FormSelect label="Välj befintlig aktivitet" value={selectedId} onChange={selectActivity}>
          <option value="">Välj aktivitet</option>
          {items.map((item) => (
            <option key={item.id} value={item.id}>
              {[item.name, item.category, item.id].filter(Boolean).join(" - ")}
            </option>
          ))}
        </FormSelect>
        <ActivityFields
          form={updateForm}
          onChange={(patch) => setUpdateForm((current) => ({ ...current, ...patch }))}
          includeId
          categoryOptions={updateCategoryOptions}
          categoriesLoading={categoriesLoading}
        />
        <SubmitButton isLoading={updateState.status === "loading"} onPress={() => void save("update")} disabled={!updateForm.id?.trim()}>
          Uppdatera vald
        </SubmitButton>
        <ResultBlock state={updateState} />
      </ActionShell>

      <ActionShell
        title="Skapa ny aktivitet"
        description="POST är separat och skapar en ny aktivitet."
        method="POST"
        endpoint="/api/admin/activity"
      >
        <ResultBlock state={categoryState} />
        <ActivityFields
          form={createForm}
          onChange={(patch) => setCreateForm((current) => ({ ...current, ...patch }))}
          includeId={false}
          categoryOptions={createCategoryOptions}
          categoriesLoading={categoriesLoading}
        />
        <SubmitButton isLoading={createState.status === "loading"} onPress={() => void save("create")} disabled={!createForm.category.trim()}>
          Skapa
        </SubmitButton>
        <ResultBlock state={createState} />
      </ActionShell>

      <ActionShell
        title="Ta bort aktivitet"
        description="Välj en aktivitet från GET-resultatet och ta bort den med delete-endpointen."
        method="PUT"
        endpoint="/api/admin/activity/delete"
      >
        <FormSelect label="Välj aktivitet" value={deleteId} onChange={setDeleteId}>
          <option value="">Välj aktivitet</option>
          {items.map((item) => (
            <option key={item.id} value={item.id}>
              {[item.name, item.category, item.id].filter(Boolean).join(" - ")}
            </option>
          ))}
        </FormSelect>
        <Button
          type="button"
          isLoading={deleteState.status === "loading"}
          isDisabled={!deleteId}
          onPress={() => void deleteActivity()}
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
  socialLinks: "",
  pictureUrlList: "",
  videoUrlList: "",
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
    socialLinks: formatSocialLinksInput(details.socialLinks),
    pictureUrlList: (details.pictureUrlList ?? []).join("\n"),
    videoUrlList: (details.videoUrlList ?? []).join("\n"),
    credentialCompanyName: details.companyName ?? "",
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
}: {
  form: CompanyFormState;
  onChange: (patch: Partial<CompanyFormState>) => void;
  includeId: boolean;
}) {
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
  const { items, state: listState, refresh } = useResourceList<AdminCompanyPublicDTO>(adminService.getCompanies);
  const [selectedId, setSelectedId] = useState("");
  const [deleteId, setDeleteId] = useState("");
  const [updateState, setUpdateState] = useState<AdminActionState>({ status: "idle" });
  const [createState, setCreateState] = useState<AdminActionState>({ status: "idle" });
  const [deleteState, setDeleteState] = useState<AdminActionState>({ status: "idle" });
  const [updateForm, setUpdateForm] = useState<CompanyFormState>(emptyCompanyForm);
  const [createForm, setCreateForm] = useState<CompanyFormState>(emptyCompanyForm);

  async function selectCompany(id: string) {
    setSelectedId(id);
    if (!id) return;

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

  async function save(action: "create" | "update") {
    const source = action === "create" ? createForm : updateForm;
    const setState = action === "create" ? setCreateState : setUpdateState;
    setState({
      status: "loading",
      message: action === "create" ? "Skapar företag..." : "Uppdaterar företag...",
    });

    try {
      if (action === "create") {
        await adminService.createCompany(buildCompanyPayload(source, false));
        setCreateForm(emptyCompanyForm);
      } else {
        await adminService.modifyCompany(buildCompanyPayload(source, true));
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
      await adminService.deleteCompany(id);
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
        <CompanyFields form={updateForm} onChange={(patch) => setUpdateForm((current) => ({ ...current, ...patch }))} includeId />
        <SubmitButton isLoading={updateState.status === "loading"} onPress={() => void save("update")} disabled={!updateForm.companyId?.trim()}>
          Uppdatera vald
        </SubmitButton>
        <ResultBlock state={updateState} />
      </ActionShell>

      <ActionShell
        title="Skapa nytt företag"
        description="POST är separat och skapar ett nytt företag."
        method="POST"
        endpoint="/api/admin/company"
      >
        <CompanyFields form={createForm} onChange={(patch) => setCreateForm((current) => ({ ...current, ...patch }))} includeId={false} />
        <SubmitButton isLoading={createState.status === "loading"} onPress={() => void save("create")}>
          Skapa
        </SubmitButton>
        <ResultBlock state={createState} />
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
    phone: "",
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
    phone: account.phone ?? "",
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

function companyAccountRoleLabel(account: AdminCompanyUserDTO) {
  const roleName = account.role?.name?.trim();
  const accessLevel = account.role?.accessLevel;
  return [
    roleName,
    typeof accessLevel === "number" ? `Access ${accessLevel}` : undefined,
  ]
    .filter(Boolean)
    .join(" · ");
}

function CompanyAccountForm() {
  const { items: companies, state: companiesState } = useResourceList<AdminCompanyPublicDTO>(adminService.getCompanies);
  const [saveState, setSaveState] = useState<AdminActionState>({ status: "idle" });
  const [accountsState, setAccountsState] = useState<AdminActionState>({ status: "idle" });
  const [accounts, setAccounts] = useState<AdminCompanyUserDTO[]>([]);
  const [form, setForm] = useState<CompanyAccountFormState>(() => createEmptyCompanyAccountForm());

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
    setForm(createEmptyCompanyAccountForm(companyId));
  }

  function selectAccount(account: AdminCompanyUserDTO) {
    setSaveState({ status: "idle" });
    setForm(companyAccountToForm(account, form.companyId));
  }

  function startNewAccount() {
    setSaveState({ status: "idle" });
    setForm(createEmptyCompanyAccountForm(form.companyId));
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

  async function run() {
    setSaveState({ status: "loading", message: "Sparar företagskonto..." });
    try {
      const companyId = parseRequiredNumber(form.companyId, "CompanyId");
      const payload: AdminCompanyUserDTO = {
        id: parseOptionalNumber(form.id),
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

      await adminService.manageCompanyAccount(payload);
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

  return (
    <ActionShell
      title="Företagskonto"
      description="Välj företag för att hämta kopplade konton med GET innan du skapar eller uppdaterar ett konto."
      method="GET/PUT"
      endpoint="/api/companies/{id}/users, /api/admin/company/account"
    >
      <ResultBlock state={companiesState} />
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <FormInput label="Konto-id" value={form.id} onChange={(id) => patchForm({ id })} placeholder="Tomt vid nytt konto" />
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
        <FormInput label="Rollnamn" value={form.roleName} onChange={(roleName) => patchForm({ roleName })} placeholder="MANAGER" />
        <FormInput label="Rollbeskrivning" value={form.roleDescription} onChange={(roleDescription) => patchForm({ roleDescription })} />
        <FormInput label="Access level" value={form.roleAccessLevel} onChange={(roleAccessLevel) => patchForm({ roleAccessLevel })} />
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
              <UserPlusIcon className="h-4 w-4" />
              Nytt konto
            </button>
          </div>
        </div>
        <div className="border-t border-[#dfe7e3] p-4">
          <ResultBlock state={accountsState} />
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

                return (
                  <button
                    key={account.id ?? account.email ?? index}
                    type="button"
                    onClick={() => selectAccount(account)}
                    className={[
                      "grid gap-1 rounded-[8px] border px-3 py-2 text-left text-sm transition",
                      isSelected
                        ? "border-[#004225] bg-white text-[#111827]"
                        : "border-[#dfe7e3] bg-white/70 text-[#36534d] hover:bg-white",
                    ].join(" ")}
                  >
                    <span className="flex flex-wrap items-center gap-x-2 gap-y-1 font-medium">
                      <span>{companyAccountName(account)}</span>
                      {accountId && (
                        <span className="font-mono text-xs text-[#66716f]">#{accountId}</span>
                      )}
                    </span>
                    <span className="text-xs text-[#66716f]">
                      {[account.email?.trim(), account.phone?.trim(), companyAccountRoleLabel(account)]
                        .filter(Boolean)
                        .join(" · ") || "Saknar kontaktuppgifter"}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <SubmitButton isLoading={saveState.status === "loading"} onPress={run} disabled={!form.companyId.trim()}>
        Spara konto
      </SubmitButton>
      <ResultBlock state={saveState} />
    </ActionShell>
  );
}

function CityForm() {
  const [createState, setCreateState] = useState<AdminActionState>({ status: "idle" });
  const [updateState, setUpdateState] = useState<AdminActionState>({ status: "idle" });
  const [createForm, setCreateForm] = useState({ id: "", name: "" });
  const [updateForm, setUpdateForm] = useState({ id: "", name: "" });

  function buildPayload(form: typeof createForm): AdminCityPayload {
    return {
      id: parseOptionalNumber(form.id),
      name: form.name.trim(),
    };
  }

  async function run(action: "create" | "update") {
    const source = action === "create" ? createForm : updateForm;
    const setState = action === "create" ? setCreateState : setUpdateState;
    setState({
      status: "loading",
      message: action === "create" ? "Skapar stad..." : "Uppdaterar stad...",
    });
    try {
      if (action === "create") {
        await adminService.createCity(buildPayload(source));
        setCreateForm({ id: "", name: "" });
      } else {
        await adminService.modifyCity(buildPayload(source));
      }
      setState({
        status: "success",
        message: action === "create" ? "Staden skapades." : "Staden uppdaterades.",
      });
    } catch (error) {
      setState({
        status: "error",
        message: error instanceof Error ? error.message : "Staden kunde inte sparas.",
      });
    }
  }

  return (
    <div className="grid gap-4">
      <ActionShell
        title="Uppdatera stad"
        description="Legacy-flödet saknar GET-listning, så ange id och uppdatera med PUT."
        method="PUT"
        endpoint="/api/admin/city"
      >
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <FormInput label="Id" value={updateForm.id} onChange={(id) => setUpdateForm((current) => ({ ...current, id }))} />
          <FormInput label="Namn" value={updateForm.name} onChange={(name) => setUpdateForm((current) => ({ ...current, name }))} />
        </div>
        <SubmitButton isLoading={updateState.status === "loading"} onPress={() => void run("update")} disabled={!updateForm.id.trim()}>
          Uppdatera
        </SubmitButton>
        <ResultBlock state={updateState} />
      </ActionShell>

      <ActionShell
        title="Skapa ny stad"
        description="POST är separat och skapar en ny stad."
        method="POST"
        endpoint="/api/admin/city"
      >
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <FormInput label="Id" value={createForm.id} onChange={(id) => setCreateForm((current) => ({ ...current, id }))} />
          <FormInput label="Namn" value={createForm.name} onChange={(name) => setCreateForm((current) => ({ ...current, name }))} />
        </div>
        <SubmitButton isLoading={createState.status === "loading"} onPress={() => void run("create")}>
          Skapa
        </SubmitButton>
        <ResultBlock state={createState} />
      </ActionShell>
    </div>
  );
}

const waitlistChartConfig = {
  count: {
    label: "Nya anmälningar",
    color: "#004225",
  },
} satisfies ChartConfig;

const waitlistDateFormatter = new Intl.DateTimeFormat("sv-SE", {
  day: "numeric",
  month: "short",
});

const waitlistFullDateFormatter = new Intl.DateTimeFormat("sv-SE", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const waitlistTimestampFormatter = new Intl.DateTimeFormat("sv-SE", {
  dateStyle: "medium",
  timeStyle: "short",
});

type WaitlistChartDatum = {
  date: string;
  label: string;
  fullLabel: string;
  count: number;
  cumulative: number;
};

function parseDateOnly(value: string) {
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatWaitlistTimestamp(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Tidpunkt saknas"
    : waitlistTimestampFormatter.format(date);
}

function toWaitlistChartData(stats: AdminWaitlistStatsDTO | null): WaitlistChartDatum[] {
  return (stats?.daily ?? [])
    .map((point) => {
      const date = parseDateOnly(point.date);
      if (!date) return null;

      return {
        date: point.date,
        label: waitlistDateFormatter.format(date).replace(".", ""),
        fullLabel: waitlistFullDateFormatter.format(date),
        count: point.count,
        cumulative: point.cumulative,
      };
    })
    .filter((point): point is WaitlistChartDatum => point !== null);
}

function WaitlistTrendChart({ data }: { data: WaitlistChartDatum[] }) {
  if (data.length === 0) {
    return (
      <div className="mt-5 flex min-h-[240px] items-center justify-center rounded-[8px] border border-dashed border-[#dfe7e3] px-4 text-center text-sm text-[#66716f]">
        Ingen trenddata att visa ännu.
      </div>
    );
  }

  return (
    <div className="mt-5 min-h-[280px] min-w-0">
      <ChartContainer
        className="h-[clamp(260px,32vw,360px)] w-full"
        config={waitlistChartConfig}
      >
        <BarChart
          barCategoryGap={data.length > 18 ? "20%" : "32%"}
          data={data}
          margin={{ bottom: 0, left: 0, right: 8, top: 16 }}
        >
          <CartesianGrid stroke="#edf2ef" vertical={false} />
          <XAxis
            axisLine={false}
            dataKey="label"
            interval={data.length > 14 ? "preserveStartEnd" : 0}
            minTickGap={8}
            tick={{ fill: "#6b7280", fontSize: 11 }}
            tickLine={false}
            tickMargin={12}
          />
          <YAxis
            allowDecimals={false}
            axisLine={false}
            tick={{ fill: "#6b7280", fontSize: 11 }}
            tickLine={false}
            tickMargin={8}
            width={38}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                labelFormatter={(_, payload) => {
                  const row = payload?.[0]?.payload as WaitlistChartDatum | undefined;
                  return row?.fullLabel ?? "";
                }}
              />
            }
            cursor={false}
          />
          <Bar
            dataKey="count"
            fill="var(--color-count)"
            maxBarSize={20}
            name="Nya anmälningar"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ChartContainer>
    </div>
  );
}

function storageLabel(storage: AdminWaitlistStatsDTO["storage"]) {
  if (storage === "firestore") return "Firestore";
  if (storage === "local") return "Lokal dev-fil";
  return "Okänd källa";
}

function WaitlistEntriesList({ entries }: { entries: AdminWaitlistEntryDTO[] }) {
  return (
    <div className="mt-6 min-w-0">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-[#111827]">Alla registrerade</h3>
          <p className="text-sm text-[#66716f]">
            E-post och registreringstid för alla poster som hämtades från databasen.
          </p>
        </div>
        <span className="text-xs font-semibold uppercase tracking-wide text-[#476e66]">
          {entries.length.toLocaleString("sv-SE")} poster
        </span>
      </div>

      {entries.length === 0 ? (
        <div className="mt-3 rounded-[8px] border border-dashed border-[#dfe7e3] px-4 py-8 text-center text-sm text-[#66716f]">
          Inga e-postadresser finns i waitlisten ännu.
        </div>
      ) : (
        <div className="mt-3 max-h-[440px] overflow-auto rounded-[8px] border border-[#dfe7e3]">
          <table className="min-w-full divide-y divide-[#edf2ef] text-left text-sm">
            <thead className="sticky top-0 bg-[#fbfcfb] text-xs font-semibold uppercase tracking-wide text-[#476e66]">
              <tr>
                <th className="px-4 py-3">E-post</th>
                <th className="px-4 py-3">Registrerad</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#edf2ef] bg-white">
              {entries.map((entry) => (
                <tr key={`${entry.email}-${entry.createdAt}`}>
                  <td className="break-all px-4 py-3 font-medium text-[#111827]">
                    {entry.email}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-[#36534d]">
                    {formatWaitlistTimestamp(entry.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function WaitlistDashboard() {
  const [stats, setStats] = useState<AdminWaitlistStatsDTO | null>(null);
  const [state, setState] = useState<AdminActionState>({
    status: "loading",
    message: "Hämtar waitlist...",
  });

  async function refresh() {
    setState({ status: "loading", message: "Hämtar waitlist..." });

    try {
      const result = await adminService.getWaitlistStats();
      setStats(result);
      setState({ status: "idle" });
    } catch (error) {
      setStats(null);
      setState({
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "Kunde inte hämta waitlist-statistik.",
      });
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  const chartData = toWaitlistChartData(stats);
  const lastSevenDays = (stats?.daily ?? [])
    .slice(-7)
    .reduce((sum, point) => sum + point.count, 0);
  const latestDay = stats?.daily.at(-1);

  return (
    <ActionShell
      title="Waitlist"
      description="Översikt, daglig graf och alla registrerade e-postadresser i waitlisten."
      method="GET"
      endpoint="/api/admin/waitlist"
    >
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <ResultBlock state={state} />
        <Button
          type="button"
          isLoading={state.status === "loading"}
          onPress={() => void refresh()}
          className="bg-[#004225] text-white hover:bg-[#00351e]"
        >
          <RefreshCwIcon className="h-4 w-4" />
          Uppdatera
        </Button>
      </div>

      {stats ? (
        <>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <div className="rounded-[8px] border border-[#dfe7e3] bg-[#fbfcfb] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#476e66]">
                Totalt
              </p>
              <p className="mt-2 text-3xl font-semibold text-[#111827]">
                {stats.total.toLocaleString("sv-SE")}
              </p>
            </div>
            <div className="rounded-[8px] border border-[#dfe7e3] bg-[#fbfcfb] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#476e66]">
                Senaste 7 dagarna
              </p>
              <p className="mt-2 text-3xl font-semibold text-[#111827]">
                {lastSevenDays.toLocaleString("sv-SE")}
              </p>
            </div>
            <div className="rounded-[8px] border border-[#dfe7e3] bg-[#fbfcfb] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#476e66]">
                Källa
              </p>
              <p className="mt-2 text-lg font-semibold text-[#111827]">
                {storageLabel(stats.storage)}
              </p>
              {latestDay ? (
                <p className="mt-1 text-xs text-[#66716f]">
                  Senaste datum: {latestDay.date}
                </p>
              ) : null}
            </div>
          </div>

          <WaitlistTrendChart data={chartData} />

          <WaitlistEntriesList entries={stats.entries} />

          {stats.unknownCreatedAtCount ? (
            <p className="mt-3 text-xs text-[#66716f]">
              {stats.unknownCreatedAtCount.toLocaleString("sv-SE")} poster saknar
              giltigt datum och visas inte i diagrammet.
            </p>
          ) : null}
        </>
      ) : null}
    </ActionShell>
  );
}

function UserStatisticsAction() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [state, setState] = useState<AdminActionState>({ status: "idle" });

  async function run() {
    setState({ status: "loading", message: "Hämtar statistik..." });
    try {
      await adminService.getUserStatistics({
        from: normalizeDateTimeInput(from),
        to: normalizeDateTimeInput(to),
      });
      setState({ status: "success", message: "Statistik hämtad." });
    } catch (error) {
      setState({
        status: "error",
        message: error instanceof Error ? error.message : "Anropet misslyckades.",
      });
    }
  }

  return (
    <ActionShell
      title="Registrerade användare"
      description="Välj start- och slutdatum för att hämta registreringar som tidsserie."
      method="GET"
      endpoint="/api/admin/statistics/users"
    >
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <FormInput label="Från" type="datetime-local" value={from} onChange={setFrom} />
        <FormInput label="Till" type="datetime-local" value={to} onChange={setTo} />
      </div>
      <SubmitButton isLoading={state.status === "loading"} onPress={run}>
        Hämta statistik
      </SubmitButton>
      <ResultBlock state={state} />
    </ActionShell>
  );
}

export function AdminToolPage({ section }: { section: AdminSection }) {
  return (
    <main className="flex flex-col gap-6 text-[#1f2937]">
      <div className="flex flex-col gap-5">
        <SectionContent active={section} value="tags">
          <TagsForm />
        </SectionContent>

        <SectionContent active={section} value="schools">
          <SchoolsForm />
        </SectionContent>

        <SectionContent active={section} value="locations">
          <LocationCategoriesForm />
        </SectionContent>

        <SectionContent active={section} value="companies">
          <CompaniesForm />
        </SectionContent>

        <SectionContent active={section} value="accounts">
          <CompanyAccountForm />
        </SectionContent>

        <SectionContent active={section} value="activities">
          <ActivitiesForm />
        </SectionContent>

        <SectionContent active={section} value="waitlist">
          <WaitlistDashboard />
        </SectionContent>

        <SectionContent active={section} value="statistics">
          <div className="grid gap-4 xl:grid-cols-2">
            <UserStatisticsAction />
          </div>
        </SectionContent>

        <SectionContent active={section} value="legacy">
          <div className="grid gap-4">
            <CityForm />
            <DeleteIdAction title="Ta bort stad" description="Ta bort eller avaktivera en stad med numeriskt id." endpoint="/api/admin/city/delete" label="Stads-id" onSubmit={adminService.deleteCity} />
          </div>
        </SectionContent>
      </div>
    </main>
  );
}
