"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import {
  CheckCircle2Icon,
  RefreshCwIcon,
  Trash2Icon,
  XCircleIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
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
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <FieldRow label={label}>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
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
}: {
  form: TagFormState;
  onChange: (patch: Partial<TagFormState>) => void;
  includeValues: boolean;
}) {
  return (
    <>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <FormInput label="Tagg" value={form.tag} onChange={(tag) => onChange({ tag })} />
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
        <TagsFormFields form={updateForm} onChange={(patch) => setUpdateForm((current) => ({ ...current, ...patch }))} includeValues />
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

  return {
    ...(schoolId ? { schoolId } : {}),
    schoolName: form.schoolName.trim(),
    city: form.city.trim(),
    lat: parseRequiredNumber(form.lat, "Latitud"),
    lng: parseRequiredNumber(form.lng, "Longitud"),
  };
}

function SchoolFields({
  form,
  onChange,
  includeId,
}: {
  form: SchoolFormState;
  onChange: (patch: Partial<SchoolFormState>) => void;
  includeId: boolean;
}) {
  return (
    <div className="mt-4 grid gap-3 md:grid-cols-2">
      {includeId && (
        <FormInput label="SchoolId" value={form.schoolId ?? ""} onChange={(schoolId) => onChange({ schoolId })} />
      )}
      <FormInput label="Skolnamn" value={form.schoolName} onChange={(schoolName) => onChange({ schoolName })} />
      <FormInput label="Stad" value={form.city} onChange={(city) => onChange({ city })} />
      <FormInput label="Latitud" value={form.lat} onChange={(lat) => onChange({ lat })} />
      <FormInput label="Longitud" value={form.lng} onChange={(lng) => onChange({ lng })} />
    </div>
  );
}

function SchoolsForm() {
  const { items, state: listState, refresh } = useResourceList<School>(adminService.getSchools);
  const [selectedId, setSelectedId] = useState("");
  const [updateState, setUpdateState] = useState<AdminActionState>({ status: "idle" });
  const [createState, setCreateState] = useState<AdminActionState>({ status: "idle" });
  const [updateForm, setUpdateForm] = useState<SchoolFormState>(emptySchoolForm);
  const [createForm, setCreateForm] = useState<SchoolFormState>(emptySchoolForm);

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
        description="GET hämtar alla skolor. Välj en skola och uppdatera den med PUT."
        method="GET/PUT"
        endpoint="/api/schools, /api/admin/school"
      >
        <ResultBlock state={listState} />
        <FormSelect label="Välj befintlig skola" value={selectedId} onChange={selectSchool}>
          <option value="">Välj skola</option>
          {items.map((school) => (
            <option key={school.id} value={school.id}>
              {[school.name, school.city].filter(Boolean).join(" - ")}
            </option>
          ))}
        </FormSelect>
        <SchoolFields form={updateForm} onChange={(patch) => setUpdateForm((current) => ({ ...current, ...patch }))} includeId />
        <SubmitButton isLoading={updateState.status === "loading"} onPress={updateSchool} disabled={!updateForm.schoolId?.trim()}>
          Uppdatera vald
        </SubmitButton>
        <ResultBlock state={updateState} />
      </ActionShell>

      <ActionShell
        title="Skapa ny skola"
        description="POST är separat och skapar en ny skola."
        method="POST"
        endpoint="/api/admin/school"
      >
        <SchoolFields form={createForm} onChange={(patch) => setCreateForm((current) => ({ ...current, ...patch }))} includeId={false} />
        <SubmitButton isLoading={createState.status === "loading"} onPress={createSchool}>
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

  return {
    ...(id ? { id } : {}),
    category: form.category.trim(),
    name: form.name.trim(),
    lat: parseRequiredNumber(form.lat, "Latitud"),
    lng: parseRequiredNumber(form.lng, "Longitud"),
  };
}

function ActivityFields({
  form,
  onChange,
  includeId,
}: {
  form: ActivityFormState;
  onChange: (patch: Partial<ActivityFormState>) => void;
  includeId: boolean;
}) {
  return (
    <div className="mt-4 grid gap-3 md:grid-cols-2">
      {includeId && <FormInput label="Id" value={form.id ?? ""} onChange={(id) => onChange({ id })} />}
      <FormInput label="Kategori" value={form.category} onChange={(category) => onChange({ category })} />
      <FormInput label="Namn" value={form.name} onChange={(name) => onChange({ name })} />
      <FormInput label="Latitud" value={form.lat} onChange={(lat) => onChange({ lat })} />
      <FormInput label="Longitud" value={form.lng} onChange={(lng) => onChange({ lng })} />
    </div>
  );
}

function ActivitiesForm() {
  const { items, state: listState, refresh } = useResourceList<AdminPointOfInterestDTO>(adminService.getActivities);
  const [selectedId, setSelectedId] = useState("");
  const [deleteId, setDeleteId] = useState("");
  const [updateState, setUpdateState] = useState<AdminActionState>({ status: "idle" });
  const [createState, setCreateState] = useState<AdminActionState>({ status: "idle" });
  const [deleteState, setDeleteState] = useState<AdminActionState>({ status: "idle" });
  const [updateForm, setUpdateForm] = useState<ActivityFormState>(emptyActivityForm);
  const [createForm, setCreateForm] = useState<ActivityFormState>(emptyActivityForm);

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
        <FormSelect label="Välj befintlig aktivitet" value={selectedId} onChange={selectActivity}>
          <option value="">Välj aktivitet</option>
          {items.map((item) => (
            <option key={item.id} value={item.id}>
              {[item.name, item.category, item.id].filter(Boolean).join(" - ")}
            </option>
          ))}
        </FormSelect>
        <ActivityFields form={updateForm} onChange={(patch) => setUpdateForm((current) => ({ ...current, ...patch }))} includeId />
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
        <ActivityFields form={createForm} onChange={(patch) => setCreateForm((current) => ({ ...current, ...patch }))} includeId={false} />
        <SubmitButton isLoading={createState.status === "loading"} onPress={() => void save("create")}>
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
        {includeId && <FormInput label="CompanyId" value={form.companyId ?? ""} onChange={(companyId) => onChange({ companyId })} />}
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

function CompanyAccountForm() {
  const [state, setState] = useState<AdminActionState>({ status: "idle" });
  const [form, setForm] = useState({
    id: "",
    companyId: "",
    roleName: "",
    roleDescription: "",
    roleAccessLevel: "",
    firstName: "",
    surname: "",
    email: "",
    phone: "",
    bannerUrl: "",
    logoUrl: "",
  });

  function patchForm(patch: Partial<typeof form>) {
    setForm((current) => ({ ...current, ...patch }));
  }

  async function run() {
    setState({ status: "loading", message: "Sparar företagskonto..." });
    try {
      const payload: AdminCompanyUserDTO = {
        id: parseOptionalNumber(form.id),
        companyId: parseRequiredNumber(form.companyId, "CompanyId"),
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
      setState({ status: "success", message: "Företagskontot sparades." });
    } catch (error) {
      setState({
        status: "error",
        message: error instanceof Error ? error.message : "Kunde inte spara kontot.",
      });
    }
  }

  return (
    <ActionShell
      title="Företagskonto"
      description="Backend saknar GET-listning för konton här, så den här delen är ett fältbaserat PUT-flöde."
      method="PUT"
      endpoint="/api/admin/company/account"
    >
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <FormInput label="Konto-id" value={form.id} onChange={(id) => patchForm({ id })} placeholder="Tomt vid nytt konto" />
        <FormInput label="CompanyId" value={form.companyId} onChange={(companyId) => patchForm({ companyId })} />
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
      <SubmitButton isLoading={state.status === "loading"} onPress={run}>
        Spara konto
      </SubmitButton>
      <ResultBlock state={state} />
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
