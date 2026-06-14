"use client";

import type { ChangeEvent, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2Icon,
  CheckIcon,
  ChevronDownIcon,
  FileSpreadsheetIcon,
  RefreshCwIcon,
  SearchIcon,
  Trash2Icon,
  UploadIcon,
  XIcon,
  XCircleIcon,
} from "@/components/icons";
import {
  APP_ICON_CATEGORIES,
  filterAppIconOptions,
  getAppIconOption,
  type AppIconCategory,
} from "@/components/icons/catalog";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { Button } from "@/components/ui/button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { adminService } from "@/features/admin/services/admin-service";
import {
  useAdminActivities,
  useAdminCityDetail,
  useAdminCitySummaries,
  useAdminCompanies,
  useAdminCompanyDetail,
  useAdminCompanyRoles,
  useAdminCompanyUsers,
  useAdminCreateActivity,
  useAdminCreateCity,
  useAdminCreateCompany,
  useAdminCreateCompanyAdmin,
  useAdminCreateExternalCompany,
  useAdminCreateSchool,
  useAdminCreateSchools,
  useAdminCreateTag,
  useAdminDeleteActivity,
  useAdminDeleteCity,
  useAdminDeleteCompany,
  useAdminDeleteCompanyAccount,
  useAdminDeleteExternalCompany,
  useAdminExternalCompanies,
  useAdminLocationCategories,
  useAdminManageCompanyAccount,
  useAdminModifyActivity,
  useAdminModifyCity,
  useAdminModifyCompany,
  useAdminModifyLocationCategory,
  useAdminAddLocationCategory,
  useAdminModifySchool,
  useAdminModifyTag,
  useAdminRefreshCompanyListings,
  useAdminSchools,
  useAdminTags,
  useAdminUpdateCompanyCredentials,
  useAdminUpdateExternalCompany,
  useAdminUserStatistics,
  useAdminVerifyCompanyAccount,
  useAdminWaitlistStats,
} from "@/features/admin/hooks/useAdmin";
import { normalizeCityCode } from "@/features/cities/services/city-service";
import type { ExternalCompanyDTO } from "@/features/companies/services/company-service";
import type {
  AdminAddSchoolRequest,
  AdminCompanyCredentialDTO,
  AdminCompanyDetailedDTO,
  AdminCompanyRole,
  AdminCompanyUserDTO,
  AdminCreateCompanyRequest,
  AdminCreateCompanyUserRequest,
  AdminCreatePOIRequest,
  AdminListingTagDetailDTO,
  AdminLocationCategoryDTO,
  AdminModifyPOIRequest,
  AdminPointOfInterestDTO,
  AdminCompanyPublicDTO,
  AdminWaitlistEntryDTO,
  AdminWaitlistStatsDTO,
  CityDTO,
  CityDetailedDTO,
  CreateCityRequest,
  ModifyCityRequest,
  School,
} from "@/types";
import { cn } from "@/lib/utils";

type AdminActionState = {
  status: "idle" | "loading" | "success" | "error";
  message?: string;
};

const ADMIN_TABS = [
  "tags",
  "schools",
  "cities",
  "locations",
  "companies",
  "external-companies",
  "accounts",
  "activities",
  "waitlist",
  "statistics",
] as const;

export type AdminSection = (typeof ADMIN_TABS)[number];

const ADMIN_SECTION_DETAILS = {
  tags: {
    title: "Tags",
    description: "Manage listing tags, labels, icons, and selectable values.",
    badge: "Content taxonomy",
  },
  schools: {
    title: "Schools",
    description: "Create, update, import, and connect schools to cities.",
    badge: "Campus data",
  },
  cities: {
    title: "Cities",
    description: "Maintain city records, descriptions, banners, and linked companies.",
    badge: "Market data",
  },
  locations: {
    title: "Locations",
    description: "Manage location categories used by maps and nearby points of interest.",
    badge: "Map metadata",
  },
  companies: {
    title: "Companies",
    description: "Create, update, verify, refresh, and remove landlord company profiles.",
    badge: "Landlord records",
  },
  "external-companies": {
    title: "External Companies",
    description: "Manage external housing providers and their city or school coverage.",
    badge: "External providers",
  },
  accounts: {
    title: "Accounts",
    description: "Create company admins, update permissions, and verify access.",
    badge: "Access control",
  },
  activities: {
    title: "Activities",
    description: "Maintain points of interest and activity data for city pages.",
    badge: "Local content",
  },
  waitlist: {
    title: "Waitlist",
    description: "Review signups, daily trends, source storage, and registered emails.",
    badge: "Launch demand",
  },
  statistics: {
    title: "Statistics",
    description: "Fetch admin reporting data for registered users and growth analysis.",
    badge: "Reporting",
  },
} satisfies Record<
  AdminSection,
  {
    title: string;
    description: string;
    badge: string;
  }
>;

function toInputValue(value: unknown) {
  return value === undefined || value === null ? "" : String(value);
}

function parseRequiredNumber(value: string, label: string) {
  const normalized = value.trim().replace(",", ".");
  const parsed = normalized ? Number(normalized) : Number.NaN;
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

type CityOption = { city: CityDTO; code: string };

function normalizeCityLookupValue(value: string | null | undefined) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLocaleUpperCase("sv-SE")
    .replace(/[\s-]+/g, "_");
}

function cityOptionMatchesValue(option: CityOption, value: string) {
  const lookupValue = normalizeCityLookupValue(value);
  if (!lookupValue) return false;

  return [option.code, option.city.code, option.city.city].some(
    (candidate) => normalizeCityLookupValue(candidate) === lookupValue
  );
}

function getCityCodeOptions(cities: CityDTO[]): CityOption[] {
  return cities
    .map((city) => ({ city, code: cityCode(city) }))
    .filter((item): item is CityOption => Boolean(item.code));
}

function resolveCityCodeValue(value: string | null | undefined, options: CityOption[]) {
  const selected = value?.trim() ?? "";
  if (!selected) return "";

  return options.find((option) => cityOptionMatchesValue(option, selected))?.code ?? "";
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

/**
 * Adapter that converts a TanStack `useQuery` result into the
 * `{ items, state, refresh }` shape that every section in this file expects.
 *
 * Before Phase 3, this helper had its own state machine and a private
 * `useEffect`-based fetch. Now it just maps the query's lifecycle into
 * `AdminActionState` and exposes `refetch` as `refresh` for backwards
 * compatibility with the call sites.
 *
 * Use it like:
 *   const tagsQuery = useAdminTags();
 *   const { items, state, refresh } = useResourceList(tagsQuery);
 */
function useResourceList<TItem>(query: {
  data?: TItem[];
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: unknown;
  refetch: () => Promise<unknown>;
}) {
  const items = query.data ?? [];
  const state: AdminActionState = query.isError
    ? {
        status: "error",
        message:
          query.error instanceof Error
            ? query.error.message
            : "Kunde inte hämta data.",
      }
    : query.isLoading
    ? { status: "loading", message: "Hämtar data..." }
    : { status: "idle" };

  // `refresh` keeps the same call signature as the old API (returns the
  // fresh list). Sections invoke it after raw service mutations during the
  // transition; once they migrate to mutation hooks the call becomes a
  // no-op because the hook's `onSettled` already invalidates the query.
  const refresh = async () => {
    const result = await query.refetch();
    return (result as { data?: TItem[] }).data ?? [];
  };

  return { items, state, refresh };
}

function ResultBlock({ state }: { state: AdminActionState }) {
  if (state.status === "idle") return null;

  const isError = state.status === "error";
  const isLoading = state.status === "loading";

  return (
    <div
      className={[
        "mt-4 rounded-lg border px-4 py-3 text-sm shadow-theme-xs",
        isError
          ? "border-red-200 bg-red-50 text-red-800"
          : isLoading
            ? "border-gray-200 bg-white text-gray-600"
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
    <code className="inline-flex max-w-full items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs font-medium text-gray-600 shadow-theme-xs">
      <span className="rounded-md bg-brand-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
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
    <section className="portal-surface-hoverable min-w-0 p-5 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-gray-950">{title}</h3>
          {description && (
            <p className="mt-1 text-sm leading-6 text-gray-500">{description}</p>
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
    <label className="grid gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
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
        className="h-10 rounded-lg border-gray-200 bg-white normal-case tracking-normal text-gray-950 shadow-theme-xs transition focus-visible:border-brand-500 focus-visible:ring-brand-500/15"
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
        className="min-h-24 rounded-lg border-gray-200 bg-white normal-case tracking-normal text-gray-950 shadow-theme-xs transition focus-visible:border-brand-500 focus-visible:ring-brand-500/15"
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
        className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm normal-case tracking-normal text-gray-950 shadow-theme-xs outline-none transition focus-visible:border-brand-500 focus-visible:ring-2 focus-visible:ring-brand-500/15"
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
      className="mt-4 bg-brand-500 text-white shadow-theme-xs hover:bg-brand-700"
    >
      {children}
    </Button>
  );
}

type TagFormState = {
  tag: string;
  displayName: string;
  icon: string;
  tagValues: string;
};

function TagIconPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<AppIconCategory | "all">("all");
  const selected = getAppIconOption(value);
  const filteredIcons = useMemo(
    () => filterAppIconOptions(query, category),
    [category, query]
  );

  return (
    <div className="grid gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500 md:col-span-2">
      <span>Ikon</span>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="flex min-h-10 w-full items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2 text-left normal-case tracking-normal text-gray-950 shadow-theme-xs transition hover:border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
          >
            <span className="flex min-w-0 items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-brand-50 text-brand-500">
                {selected ? (
                  <selected.Icon className="h-5 w-5" />
                ) : (
                  <SearchIcon className="h-5 w-5 text-gray-400" />
                )}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold">
                  {selected?.label ?? (value.trim() || "Välj ikon")}
                </span>
                <span className="block truncate text-xs font-medium text-gray-500">
                  {selected?.name ?? (value.trim() || "Ingen ikon vald")}
                </span>
              </span>
            </span>
            <ChevronDownIcon className="h-4 w-4 shrink-0 text-gray-500" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-[min(92vw,720px)] overflow-hidden portal-surface p-0 shadow-theme-lg"
        >
          <div className="border-b border-gray-200 bg-gray-50 p-3">
            <div className="grid gap-2 sm:grid-cols-[1fr_180px]">
              <label className="relative block">
                <span className="sr-only">Sök ikon</span>
                <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Sök ikon..."
                  className="h-10 rounded-lg border-gray-200 bg-white pl-9 normal-case tracking-normal text-gray-950 shadow-theme-xs"
                />
              </label>
              <label>
                <span className="sr-only">Filtrera på typ</span>
                <select
                  value={category}
                  onChange={(event) =>
                    setCategory(event.target.value as AppIconCategory | "all")
                  }
                  className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium normal-case tracking-normal text-gray-950 shadow-theme-xs outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
                >
                  <option value="all">Alla typer</option>
                  {APP_ICON_CATEGORIES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs normal-case tracking-normal text-gray-500">
              <span>
                {filteredIcons.length} ikon{filteredIcons.length === 1 ? "" : "er"}
              </span>
              {value.trim() && (
                <button
                  type="button"
                  onClick={() => {
                    onChange("");
                    setOpen(false);
                  }}
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 font-semibold text-brand-700 transition hover:bg-brand-50"
                >
                  <XIcon className="h-3.5 w-3.5" />
                  Rensa
                </button>
              )}
            </div>
          </div>
          <div className="max-h-[420px] overflow-y-auto p-2">
            {filteredIcons.length > 0 ? (
              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-4">
                {filteredIcons.map((icon) => {
                  const isSelected = selected?.name === icon.name;
                  return (
                    <button
                      key={icon.name}
                      type="button"
                      onClick={() => {
                        onChange(icon.name);
                        setOpen(false);
                      }}
                      className={`flex min-w-0 items-center gap-2 rounded-lg border px-2.5 py-2 text-left normal-case tracking-normal transition ${
                        isSelected
                          ? "border-brand-500 bg-brand-500 text-white"
                          : "border-transparent bg-white text-gray-950 hover:border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <icon.Icon
                        className={`h-5 w-5 shrink-0 ${isSelected ? "text-white" : "text-brand-500"}`}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold">
                          {icon.label}
                        </span>
                        <span
                          className={`block truncate text-[11px] font-medium ${
                            isSelected ? "text-white/75" : "text-gray-500"
                          }`}
                        >
                          {icon.name}
                        </span>
                      </span>
                      {isSelected && <CheckIcon className="h-4 w-4 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="px-3 py-8 text-center text-sm normal-case tracking-normal text-gray-500">
                Ingen ikon matchar sökningen.
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

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
        <TagIconPicker value={form.icon} onChange={(icon) => onChange({ icon })} />
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
  const { items, state: listState, refresh } = useResourceList(useAdminTags());
  const modifyTag = useAdminModifyTag();
  const createTagMutation = useAdminCreateTag();
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
      await modifyTag.mutateAsync({
        tag: updateForm.tag.trim(),
        displayName: updateForm.displayName.trim(),
        icon: updateForm.icon.trim(),
        tagValues: parseListInput(updateForm.tagValues),
      });
      // The mutation already invalidates qk.admin.tags + qk.listings.tags;
      // the explicit refresh stays for now so the section's own listState
      // transitions show the loading flash users are used to.
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
      await createTagMutation.mutateAsync({
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

type CsvSchoolImportRow = SchoolFormState & {
  id: string;
  rowNumber: number;
};

type CsvColumnIndexes = {
  schoolName: number;
  lat: number;
  lng: number;
  dataStart: number;
};

const CSV_COLUMN_ALIASES = {
  schoolName: ["schoolname", "school", "skolnamn", "skola", "name", "namn"],
  lat: ["lat", "latitude", "latitud", "breddgrad"],
  lng: [
    "lng",
    "lon",
    "long",
    "longitude",
    "longitud",
    "langitud",
    "långitud",
  ],
};

function normalizeCsvHeader(value: string) {
  return value
    .replace(/^\uFEFF/, "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLocaleLowerCase("sv-SE")
    .replace(/[^a-z0-9]/g, "");
}

function countCsvDelimiter(line: string, delimiter: string) {
  let count = 0;
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"') {
      if (inQuotes && line[index + 1] === '"') {
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (!inQuotes && char === delimiter) {
      count += 1;
    }
  }

  return count;
}

function detectCsvDelimiter(headerLine: string) {
  const delimiters = ["\t", ";", ","];
  let bestDelimiter = ",";
  let bestCount = countCsvDelimiter(headerLine, bestDelimiter);

  for (const delimiter of delimiters) {
    const count = countCsvDelimiter(headerLine, delimiter);
    const isPreferredTie =
      count === bestCount &&
      count > 0 &&
      delimiters.indexOf(delimiter) < delimiters.indexOf(bestDelimiter);

    if (count > bestCount || isPreferredTie) {
      bestDelimiter = delimiter;
      bestCount = count;
    }
  }

  return bestDelimiter;
}

function parseCsvText(text: string, delimiter: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];

    if (char === '"') {
      if (inQuotes && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (!inQuotes && char === delimiter) {
      row.push(field);
      field = "";
      continue;
    }

    if (!inQuotes && char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      continue;
    }

    if (!inQuotes && char === "\r") {
      continue;
    }

    field += char;
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

function isBlankCsvRow(row: string[]) {
  return row.every((field) => !field.trim());
}

function findCsvColumnIndex(row: string[], aliases: string[]) {
  const normalizedAliases = new Set(aliases.map(normalizeCsvHeader));
  return row.findIndex((field) => normalizedAliases.has(normalizeCsvHeader(field)));
}

function getCsvColumnIndexes(rows: string[][]): CsvColumnIndexes {
  const header = rows[0] ?? [];
  const schoolName = findCsvColumnIndex(header, CSV_COLUMN_ALIASES.schoolName);
  const lat = findCsvColumnIndex(header, CSV_COLUMN_ALIASES.lat);
  const lng = findCsvColumnIndex(header, CSV_COLUMN_ALIASES.lng);

  if (schoolName >= 0 && lat >= 0 && lng >= 0) {
    return { schoolName, lat, lng, dataStart: 1 };
  }

  const fallbackLat = readCsvCoordinateNumber(header[1]);
  const fallbackLng = readCsvCoordinateNumber(header[2]);

  if (header.length >= 3 && Number.isFinite(fallbackLat) && Number.isFinite(fallbackLng)) {
    return { schoolName: 0, lat: 1, lng: 2, dataStart: 0 };
  }

  throw new Error(
    "CSV-filen behöver kolumner för skolnamn, latitud och longitud."
  );
}

function normalizeCsvCoordinate(value: string | undefined) {
  return (value ?? "").trim().replace(",", ".");
}

function readCsvCoordinateNumber(value: string | undefined) {
  const normalized = normalizeCsvCoordinate(value);
  return normalized ? Number(normalized) : Number.NaN;
}

function createCsvImportRowId(rowNumber: number, index: number) {
  return `school-csv-${Date.now()}-${rowNumber}-${index}`;
}

function parseCsvSchoolRows(text: string): CsvSchoolImportRow[] {
  const firstLine = text.split(/\r?\n/).find((line) => line.trim());
  if (!firstLine) {
    throw new Error("CSV-filen är tom.");
  }

  const rows = parseCsvText(text, detectCsvDelimiter(firstLine)).filter(
    (row) => !isBlankCsvRow(row)
  );
  if (rows.length === 0) {
    throw new Error("CSV-filen är tom.");
  }

  const columns = getCsvColumnIndexes(rows);
  const parsedRows = rows
    .slice(columns.dataStart)
    .map((row, index) => {
      const rowNumber = columns.dataStart + index + 1;
      return {
        id: createCsvImportRowId(rowNumber, index),
        rowNumber,
        schoolId: "",
        schoolName: (row[columns.schoolName] ?? "").replace(/^\uFEFF/, "").trim(),
        city: "",
        lat: normalizeCsvCoordinate(row[columns.lat]),
        lng: normalizeCsvCoordinate(row[columns.lng]),
      };
    })
    .filter((row) => row.schoolName || row.lat || row.lng);

  if (parsedRows.length === 0) {
    throw new Error("CSV-filen innehåller inga skolrader.");
  }

  return parsedRows;
}

function getCsvSchoolRowError(row: CsvSchoolImportRow) {
  const errors: string[] = [];
  if (!row.schoolName.trim()) errors.push("saknar skolnamn");
  if (!row.city.trim()) errors.push("saknar stad");
  if (!Number.isFinite(readCsvCoordinateNumber(row.lat))) {
    errors.push("ogiltig latitud");
  }
  if (!Number.isFinite(readCsvCoordinateNumber(row.lng))) {
    errors.push("ogiltig longitud");
  }
  return errors.join(", ");
}

function buildCsvSchoolPayload(
  row: CsvSchoolImportRow,
  cityOptions: CityOption[]
): AdminAddSchoolRequest {
  return buildSchoolPayload(
    {
      schoolName: row.schoolName,
      city: row.city,
      lat: row.lat,
      lng: row.lng,
    },
    false,
    cityOptions
  );
}

function buildSchoolPayload(
  form: SchoolFormState,
  requireId: boolean,
  cityOptions: CityOption[] = []
): AdminAddSchoolRequest {
  const schoolId = parseOptionalNumber(form.schoolId ?? "");
  if (requireId && !schoolId) {
    throw new Error("Välj en skola eller ange schoolId innan du uppdaterar.");
  }
  const cityCodeValue = resolveCityCodeValue(form.city, cityOptions);
  if (!cityCodeValue) {
    throw new Error("Välj en stad.");
  }

  const selectedCity = cityOptions.find((option) => option.code === cityCodeValue);
  if (!selectedCity) {
    throw new Error("Den valda staden finns inte i stadslistan.");
  }
  const cityName = selectedCity.city.city?.trim() || selectedCity.code;

  return {
    ...(schoolId ? { schoolId } : {}),
    schoolName: form.schoolName.trim(),
    city: cityName,
    cityCode: cityCodeValue,
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
  cityOptions: CityOption[];
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
        {cityOptions.map(({ city, code }) => (
          <option key={code} value={code}>
            {cityOptionLabel(city)}
          </option>
        ))}
      </FormSelect>
      <FormInput label="Latitud" value={form.lat} onChange={(lat) => onChange({ lat })} />
      <FormInput label="Longitud" value={form.lng} onChange={(lng) => onChange({ lng })} />
    </div>
  );
}

function SchoolsForm() {
  const { items, state: listState, refresh } = useResourceList(useAdminSchools());
  const { items: cities, state: cityState } = useResourceList(useAdminCitySummaries());
  const modifySchool = useAdminModifySchool();
  const createSchoolMutation = useAdminCreateSchool();
  const createSchoolsMutation = useAdminCreateSchools();
  const [selectedId, setSelectedId] = useState("");
  const [updateState, setUpdateState] = useState<AdminActionState>({ status: "idle" });
  const [createState, setCreateState] = useState<AdminActionState>({ status: "idle" });
  const [importState, setImportState] = useState<AdminActionState>({ status: "idle" });
  const [updateForm, setUpdateForm] = useState<SchoolFormState>(emptySchoolForm);
  const [createForm, setCreateForm] = useState<SchoolFormState>(emptySchoolForm);
  const [importRows, setImportRows] = useState<CsvSchoolImportRow[]>([]);
  const [csvFileName, setCsvFileName] = useState("");
  const [bulkCity, setBulkCity] = useState("");
  const citiesLoading = cityState.status === "loading";
  const updateCityOptions = getCityCodeOptions(cities);
  const createCityOptions = getCityCodeOptions(cities);
  const importCityOptions = getCityCodeOptions(cities);
  const importInvalidCount = importRows.filter(getCsvSchoolRowError).length;
  const importReadyCount = importRows.length - importInvalidCount;

  function selectSchool(id: string) {
    setSelectedId(id);
    const selected = items.find((school) => String(school.id) === id);
    if (!selected) return;
    setUpdateForm({
      schoolId: String(selected.id),
      schoolName: selected.name ?? "",
      city: resolveCityCodeValue(
        selected.cityCode,
        getCityCodeOptions(cities)
      ),
      lat: toInputValue(selected.lat),
      lng: toInputValue(selected.lng),
    });
  }

  async function updateSchool() {
    setUpdateState({ status: "loading", message: "Uppdaterar skola..." });
    try {
      await modifySchool.mutateAsync(buildSchoolPayload(updateForm, true, updateCityOptions));
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
      await createSchoolMutation.mutateAsync(buildSchoolPayload(createForm, false, createCityOptions));
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

  async function handleCsvFileChange(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;

    setImportState({ status: "loading", message: "Läser CSV-fil..." });
    try {
      const rows = parseCsvSchoolRows(await file.text());
      setImportRows(rows);
      setCsvFileName(file.name);
      setBulkCity("");
      setImportState({
        status: "success",
        message: `${rows.length} rader lästes in.`,
      });
    } catch (error) {
      setImportRows([]);
      setCsvFileName("");
      setImportState({
        status: "error",
        message:
          error instanceof Error ? error.message : "CSV-filen kunde inte läsas.",
      });
    } finally {
      input.value = "";
    }
  }

  function updateImportRow(id: string, patch: Partial<CsvSchoolImportRow>) {
    setImportRows((current) =>
      current.map((row) => (row.id === id ? { ...row, ...patch } : row))
    );
  }

  function removeImportRow(id: string) {
    setImportRows((current) => current.filter((row) => row.id !== id));
  }

  function applyBulkCity() {
    const city = resolveCityCodeValue(bulkCity, importCityOptions);
    if (!city) return;
    setImportRows((current) => current.map((row) => ({ ...row, city })));
  }

  function clearImportRows() {
    setImportRows([]);
    setCsvFileName("");
    setBulkCity("");
    setImportState({ status: "idle" });
  }

  async function createImportedSchools() {
    if (importRows.length === 0) {
      setImportState({ status: "error", message: "Läs in minst en CSV-rad." });
      return;
    }

    const rowsWithErrors = importRows.filter(getCsvSchoolRowError);
    if (rowsWithErrors.length > 0) {
      setImportState({
        status: "error",
        message: `Åtgärda ${rowsWithErrors.length} rader innan import.`,
      });
      return;
    }

    const count = importRows.length;
    setImportState({ status: "loading", message: `Skapar ${count} skolor...` });

    try {
      await createSchoolsMutation.mutateAsync(
        importRows.map((row) =>
          buildCsvSchoolPayload(row, getCityCodeOptions(cities))
        )
      );
      setImportRows([]);
      setCsvFileName("");
      setBulkCity("");
      setImportState({ status: "success", message: `${count} skolor skapades.` });
      await refresh();
    } catch (error) {
      setImportState({
        status: "error",
        message:
          error instanceof Error
            ? `${error.message} Vissa rader kan redan ha skapats.`
            : "Importen kunde inte slutföras.",
      });
    }
  }

  return (
    <div className="grid gap-4">
      <ActionShell
        title="Hämta och uppdatera skola"
        description="GET hämtar alla skolor och städer. Välj en skola och uppdatera den med PUT."
        method="GET/PUT"
        endpoint="/api/schools, /api/cities, /api/admin/school"
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

      <ActionShell
        title="Importera skolor från CSV"
        description="Läser in skolrader och skapar kvarvarande rader via POST."
        method="POST"
        endpoint="/api/admin/school"
      >
        <ResultBlock state={cityState} />
        <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(220px,320px)]">
          <FieldRow label="CSV-fil">
            <Input
              type="file"
              accept=".csv,text/csv"
              disabled={importState.status === "loading"}
              onChange={handleCsvFileChange}
              className="h-10 rounded-[8px] border-[#dfe7e3] bg-white normal-case tracking-normal text-[#111827] file:mr-3 file:rounded-[6px] file:bg-[#eef5f1] file:px-3 file:text-[#004225]"
            />
          </FieldRow>
          <FormSelect
            label="Stad för alla rader"
            value={bulkCity}
            onChange={setBulkCity}
            disabled={citiesLoading || importCityOptions.length === 0}
          >
            <option value="">
              {citiesLoading ? "Hämtar städer..." : "Välj stad"}
            </option>
            {importCityOptions.map(({ city, code }) => (
              <option key={code} value={code}>
                {cityOptionLabel(city)}
              </option>
            ))}
          </FormSelect>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            isDisabled={!bulkCity.trim() || importRows.length === 0}
            onPress={applyBulkCity}
            className="rounded-[8px] px-3 text-[#004225]"
          >
            Applicera stad på alla
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            isDisabled={importRows.length === 0}
            onPress={clearImportRows}
            className="rounded-[8px] px-3 text-[#004225]"
          >
            Rensa import
          </Button>
          {csvFileName && (
            <span className="inline-flex min-w-0 items-center gap-2 rounded-[8px] border border-[#dfe7e3] bg-[#fbfcfb] px-3 py-1.5 text-sm text-[#36534d]">
              <FileSpreadsheetIcon className="h-4 w-4 shrink-0" />
              <span className="truncate">{csvFileName}</span>
            </span>
          )}
        </div>

        {importRows.length > 0 ? (
          <>
            <div className="mt-4 overflow-x-auto rounded-[8px] border border-[#dfe7e3]">
              <table className="w-full min-w-[920px] table-fixed border-collapse text-sm">
                <thead className="bg-[#f3f8f5] text-left text-xs font-semibold uppercase tracking-wide text-[#476e66]">
                  <tr>
                    <th className="w-16 px-3 py-2">Rad</th>
                    <th className="w-[280px] px-3 py-2">Skolnamn</th>
                    <th className="w-[220px] px-3 py-2">Stad</th>
                    <th className="w-28 px-3 py-2">Lat</th>
                    <th className="w-28 px-3 py-2">Long</th>
                    <th className="w-[180px] px-3 py-2">Status</th>
                    <th className="w-20 px-3 py-2 text-right">Ta bort</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#dfe7e3]">
                  {importRows.map((row) => {
                    const rowError = getCsvSchoolRowError(row);
                    return (
                      <tr key={row.id} className={rowError ? "bg-red-50/60" : "bg-white"}>
                        <td className="px-3 py-2 font-medium text-[#36534d]">
                          {row.rowNumber}
                        </td>
                        <td className="px-3 py-2">
                          <Input
                            aria-label={`Skolnamn rad ${row.rowNumber}`}
                            value={row.schoolName}
                            disabled={importState.status === "loading"}
                            onChange={(event) =>
                              updateImportRow(row.id, {
                                schoolName: event.target.value,
                              })
                            }
                            className="h-9 rounded-[8px] border-[#dfe7e3] bg-white text-sm text-[#111827]"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <select
                            aria-label={`Stad rad ${row.rowNumber}`}
                            value={row.city}
                            disabled={
                              citiesLoading ||
                              importCityOptions.length === 0 ||
                              importState.status === "loading"
                            }
                            onChange={(event) =>
                              updateImportRow(row.id, { city: event.target.value })
                            }
                            className="h-9 w-full rounded-[8px] border border-[#dfe7e3] bg-white px-3 text-sm text-[#111827] outline-none focus-visible:ring-2 focus-visible:ring-[#004225]/20"
                          >
                            <option value="">
                              {citiesLoading ? "Hämtar..." : "Välj stad"}
                            </option>
                            {importCityOptions.map(({ city, code }) => (
                              <option key={code} value={code}>
                                {cityOptionLabel(city)}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-3 py-2">
                          <Input
                            aria-label={`Latitud rad ${row.rowNumber}`}
                            value={row.lat}
                            disabled={importState.status === "loading"}
                            onChange={(event) =>
                              updateImportRow(row.id, { lat: event.target.value })
                            }
                            className="h-9 rounded-[8px] border-[#dfe7e3] bg-white text-sm text-[#111827]"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <Input
                            aria-label={`Longitud rad ${row.rowNumber}`}
                            value={row.lng}
                            disabled={importState.status === "loading"}
                            onChange={(event) =>
                              updateImportRow(row.id, { lng: event.target.value })
                            }
                            className="h-9 rounded-[8px] border-[#dfe7e3] bg-white text-sm text-[#111827]"
                          />
                        </td>
                        <td className="px-3 py-2 text-xs text-[#66716f]">
                          {rowError || "Klar"}
                        </td>
                        <td className="px-3 py-2 text-right">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            isDisabled={importState.status === "loading"}
                            onPress={() => removeImportRow(row.id)}
                            className="min-w-0 rounded-[8px] text-red-600 hover:bg-red-50"
                          >
                            <Trash2Icon className="h-4 w-4" />
                            <span className="sr-only">Ta bort rad</span>
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-[#66716f]">
                {importReadyCount} klara av {importRows.length} rader
              </p>
              <Button
                type="button"
                isLoading={importState.status === "loading"}
                isDisabled={
                  importRows.length === 0 ||
                  importInvalidCount > 0 ||
                  importState.status === "loading"
                }
                onPress={() => void createImportedSchools()}
                className="rounded-[8px] bg-[#004225] text-white hover:bg-[#00351e]"
              >
                <UploadIcon className="h-4 w-4" />
                Skapa {importRows.length} skolor
              </Button>
            </div>
          </>
        ) : (
          <div className="mt-4 flex items-center gap-2 rounded-[8px] border border-dashed border-[#c8d8d1] bg-[#fbfcfb] px-4 py-3 text-sm text-[#66716f]">
            <FileSpreadsheetIcon className="h-4 w-4 shrink-0" />
            <span>Ingen CSV inläst.</span>
          </div>
        )}

        <ResultBlock state={importState} />
      </ActionShell>
    </div>
  );
}

function LocationCategoriesForm() {
  const { items, state: listState, refresh } = useResourceList(useAdminLocationCategories());
  const addLocationCategory = useAdminAddLocationCategory();
  const modifyLocationCategory = useAdminModifyLocationCategory();
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
        await addLocationCategory.mutateAsync(payload);
        setCreateForm({ category: "", googleType: "" });
      } else {
        await modifyLocationCategory.mutateAsync(payload);
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
  const { items, state: listState, refresh } = useResourceList(useAdminActivities());
  const { items: categories, state: categoryState } = useResourceList(useAdminLocationCategories());
  const createActivityMutation = useAdminCreateActivity();
  const modifyActivity = useAdminModifyActivity();
  const deleteActivityMutation = useAdminDeleteActivity();
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
        await createActivityMutation.mutateAsync(
          buildActivityPayload(source, false) as AdminCreatePOIRequest,
        );
        setCreateForm(emptyActivityForm);
      } else {
        await modifyActivity.mutateAsync(buildActivityPayload(source, true));
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
      await deleteActivityMutation.mutateAsync(id);
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
          Ta bort valda
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
              className="min-w-0 rounded-[8px] px-3 text-[#004225]"
            >
              Markera alla
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              isDisabled={form.cityCodes.length === 0}
              onPress={() => onChange({ cityCodes: [] })}
              className="min-w-0 rounded-[8px] px-3 text-[#004225]"
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
                  className="mt-0.5 border-[#9fb4ad] data-[state=checked]:border-[#004225] data-[state=checked]:bg-[#004225]"
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
            className="bg-[#004225] text-white hover:bg-[#00351e]"
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
        endpoint="/api/admin/company/{id}/refresh-listings"
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

type ExternalCompanyFormState = {
  name: string;
  description: string;
  logoUrl: string;
  websiteUrl: string;
  cityCodes: string[];
  schoolIds: number[];
};

const emptyExternalCompanyForm: ExternalCompanyFormState = {
  name: "",
  description: "",
  logoUrl: "",
  websiteUrl: "",
  cityCodes: [],
  schoolIds: [],
};

type ExternalCompanyUpdateFormState = Omit<
  ExternalCompanyFormState,
  "schoolIds"
> & {
  id: string;
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

function buildExternalCompanyPayload(form: ExternalCompanyFormState) {
  const name = form.name.trim();

  if (!name) {
    throw new Error("Ange ett företagsnamn.");
  }

  return {
    name,
    description: form.description.trim() || null,
    logoUrl: form.logoUrl.trim() || null,
    websiteUrl: form.websiteUrl.trim() || null,
    cityCodes: Array.from(
      new Set(form.cityCodes.map((code) => normalizeCityCode(code)).filter(Boolean))
    ),
    schoolIds: Array.from(
      new Set(form.schoolIds.filter((id) => Number.isFinite(id)))
    ),
  };
}

function buildExternalCompanyUpdatePayload(form: ExternalCompanyUpdateFormState) {
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

function schoolId(school: School) {
  return school.schoolId ?? school.id;
}

function schoolOptionLabel(school: School) {
  return [school.name, school.city, schoolId(school)].filter(Boolean).join(" - ");
}

function externalCompanyOptionLabel(company: ExternalCompanyDTO) {
  return [company.name, company.id].filter(Boolean).join(" - ");
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

  return (
    <div className="grid gap-4">
      <ActionShell
      title="Skapa externt företag"
      description="POST skapar ett externt företag och kopplar det till valda städer och skolor."
      method="POST"
      endpoint="/api/companies/external-company"
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
        <FormInput
          label="Logo URL"
          value={form.logoUrl}
          onChange={(logoUrl) => patchForm({ logoUrl })}
          placeholder="https://..."
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
                className="min-w-0 rounded-[8px] px-3 text-[#004225]"
              >
                Markera alla
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                isDisabled={form.cityCodes.length === 0 || state.status === "loading"}
                onPress={() => patchForm({ cityCodes: [] })}
                className="min-w-0 rounded-[8px] px-3 text-[#004225]"
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
                    className="mt-0.5 border-[#9fb4ad] data-[state=checked]:border-[#004225] data-[state=checked]:bg-[#004225]"
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
                className="min-w-0 rounded-[8px] px-3 text-[#004225]"
              >
                Markera alla
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                isDisabled={form.schoolIds.length === 0 || state.status === "loading"}
                onPress={() => patchForm({ schoolIds: [] })}
                className="min-w-0 rounded-[8px] px-3 text-[#004225]"
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
                    className="mt-0.5 border-[#9fb4ad] data-[state=checked]:border-[#004225] data-[state=checked]:bg-[#004225]"
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
        disabled={!form.name.trim()}
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
            className="border-[#9fb4ad] data-[state=checked]:border-[#004225] data-[state=checked]:bg-[#004225]"
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
              className="min-w-0 rounded-[8px] px-3 text-[#004225]"
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
              className="min-w-0 rounded-[8px] px-3 text-[#004225]"
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
                  className="mt-0.5 border-[#9fb4ad] data-[state=checked]:border-[#004225] data-[state=checked]:bg-[#004225]"
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
    ? [{ city: { city: createForm.city.trim(), code: createForm.city.trim() }, code: createForm.city.trim() }, ...cityOptions]
    : cityOptions;

  function getDefaultCompanyCity(companyId: string) {
    const selectedCompany = companyOptions.find(
      (company) => String(company.id) === companyId
    );
    return normalizeCityCode(selectedCompany?.cities?.[0] ?? "G\u00d6TEBORG");
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
    if (!window.confirm(`Ta bort företagskontot ${accountName}? Detta går inte att ångra.`)) {
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
                        ? "border-[#004225] bg-white text-[#111827]"
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
                        className="inline-flex h-8 items-center justify-center gap-2 rounded-[8px] border border-[#004225] bg-white px-3 text-xs font-semibold text-[#004225] hover:bg-[#edf5f1] disabled:cursor-not-allowed disabled:border-[#dfe7e3] disabled:text-[#9aa7a4] disabled:opacity-70"
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
    </div>
  );
}

type CityFormState = {
  code: string;
  name: string;
  description: string;
  bannerUrl: string;
};

const emptyCityForm: CityFormState = {
  code: "",
  name: "",
  description: "",
  bannerUrl: "",
};

function cityCode(city: CityDTO) {
  return normalizeCityCode(city.code ?? city.city ?? "");
}

function cityToForm(city: CityDTO | CityDetailedDTO): CityFormState {
  return {
    code: cityCode(city),
    name: city.city ?? "",
    description: city.description ?? "",
    bannerUrl: city.bannerUrl ?? "",
  };
}

function cityOptionLabel(city: CityDTO) {
  return [city.city, cityCode(city)].filter(Boolean).join(" - ");
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
    description: form.description.trim() || null,
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
    description: form.description.trim() || null,
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
          label="Kod"
          value={form.code}
          onChange={(code) => onChange({ code })}
          placeholder="LUND"
          disabled={lockCode}
        />
        <FormInput label="Namn" value={form.name} onChange={(name) => onChange({ name })} />
        <FormInput
          label="Banner URL"
          value={form.bannerUrl}
          onChange={(bannerUrl) => onChange({ bannerUrl })}
          placeholder="https://..."
        />
      </div>
      <div className="mt-3">
        <FormTextarea
          label="Beskrivning"
          value={form.description}
          onChange={(description) => onChange({ description })}
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
      const detail = await adminService.getCity(code);
      setCityDetail(detail);
      setUpdateForm(cityToForm(detail));
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
        description: payload.description ?? "",
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
                className="min-w-0 rounded-[8px] px-3 text-[#004225]"
              >
                Markera alla
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                isDisabled={deleteCodes.length === 0 || deleteState.status === "loading"}
                onPress={() => setDeleteCodes([])}
                className="min-w-0 rounded-[8px] px-3 text-[#004225]"
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
                    className="mt-0.5 border-[#9fb4ad] data-[state=checked]:border-[#004225] data-[state=checked]:bg-[#004225]"
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
  // Page-mount read via TanStack — the refetch button below calls the
  // query's `refetch` directly so the "Uppdatera" UX stays one click.
  const waitlistQuery = useAdminWaitlistStats();
  const stats = waitlistQuery.data ?? null;
  const state: AdminActionState = waitlistQuery.isError
    ? {
        status: "error",
        message:
          waitlistQuery.error instanceof Error
            ? waitlistQuery.error.message
            : "Kunde inte hämta waitlist-statistik.",
      }
    : waitlistQuery.isLoading || waitlistQuery.isFetching
    ? { status: "loading", message: "Hämtar waitlist..." }
    : { status: "idle" };

  const refresh = () => waitlistQuery.refetch();

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
  // Note: this section just fires the request and reports success/error —
  // the response payload is never rendered. Wrapping in a `useQuery` would
  // add cache/loading plumbing for no gain. Direct service call is the
  // correct shape here.
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
  const details = ADMIN_SECTION_DETAILS[section];

  return (
    <main className="space-y-6 text-gray-800">
      <header className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="break-words text-2xl font-semibold leading-8 text-gray-950">
            {details.title}
          </h1>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-gray-500">
            {details.description}
          </p>
        </div>
        <div className="portal-control flex h-10 w-fit shrink-0 items-center gap-2 px-3 text-xs font-semibold text-gray-600">
          <span
            className={cn(
              "h-2 w-2 rounded-full",
              section === "waitlist" || section === "statistics"
                ? "bg-emerald-500"
                : "bg-brand-500"
            )}
          />
          {details.badge}
        </div>
      </header>

      <div className="flex flex-col gap-5">
        <SectionContent active={section} value="tags">
          <TagsForm />
        </SectionContent>

        <SectionContent active={section} value="schools">
          <SchoolsForm />
        </SectionContent>

        <SectionContent active={section} value="cities">
          <CitiesForm />
        </SectionContent>

        <SectionContent active={section} value="locations">
          <LocationCategoriesForm />
        </SectionContent>

        <SectionContent active={section} value="companies">
          <CompaniesForm />
        </SectionContent>

        <SectionContent active={section} value="external-companies">
          <ExternalCompaniesForm />
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
      </div>
    </main>
  );
}
