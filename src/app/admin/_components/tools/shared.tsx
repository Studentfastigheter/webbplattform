"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { CheckCircle2Icon, RefreshCwIcon, XCircleIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAdminTags } from "@/features/admin/hooks/useAdmin";
import { normalizeCityCode } from "@/features/cities/services/city-service";
import type { ExternalCompanyDTO } from "@/features/companies/services/company-service";
import type { CityDTO, School } from "@/types";
import { cn } from "@/lib/utils";

export type AdminActionState = {
  status: "idle" | "loading" | "success" | "error";
  message?: string;
};

export const ADMIN_TABS = [
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
  "analytics",
] as const;

export type AdminSection = (typeof ADMIN_TABS)[number];

export const ADMIN_SECTION_DETAILS = {
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
    description:
      "Platform-wide KPI dashboard: users, quick registers, listings, applications, engagement, and geography.",
    badge: "Reporting",
  },
  analytics: {
    title: "Analytics",
    description: "Review listing status distribution per company and across the platform.",
    badge: "Company analytics",
  },
} satisfies Record<
  AdminSection,
  {
    title: string;
    description: string;
    badge: string;
  }
>;

export function toInputValue(value: unknown) {
  return value === undefined || value === null ? "" : String(value);
}

export function parseRequiredNumber(value: string, label: string) {
  const normalized = value.trim().replace(",", ".");
  const parsed = normalized ? Number(normalized) : Number.NaN;
  if (!Number.isFinite(parsed)) {
    throw new Error(`${label} måste vara ett nummer.`);
  }
  return parsed;
}

export function parseOptionalNumber(value: string) {
  if (!value.trim()) return undefined;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw new Error("Ett numeriskt fält innehåller ett ogiltigt värde.");
  }
  return parsed;
}

export function parseListInput(value: string) {
  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export type CityOption = { city: CityDTO; code: string };

export function normalizeCityLookupValue(value: string | null | undefined) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLocaleUpperCase("sv-SE")
    .replace(/[\s-]+/g, "_");
}

export function cityOptionMatchesValue(option: CityOption, value: string) {
  const lookupValue = normalizeCityLookupValue(value);
  if (!lookupValue) return false;

  return [option.code, option.city.code, option.city.name].some(
    (candidate) => normalizeCityLookupValue(candidate) === lookupValue
  );
}

export function getCityCodeOptions(cities: CityDTO[]): CityOption[] {
  return cities
    .map((city) => ({ city, code: cityCode(city) }))
    .filter((item): item is CityOption => Boolean(item.code));
}

export function resolveCityCodeValue(value: string | null | undefined, options: CityOption[]) {
  const selected = value?.trim() ?? "";
  if (!selected) return "";

  return options.find((option) => cityOptionMatchesValue(option, selected))?.code ?? "";
}

export function parseSocialLinksInput(value: string) {
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

export function formatSocialLinksInput(value: Record<string, string> | undefined) {
  return Object.entries(value ?? {})
    .map(([platform, url]) => `${platform}=${url}`)
    .join("\n");
}

export function normalizeDateTimeInput(value: string) {
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
export function useResourceList<TItem>(query: {
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

export function ResultBlock({ state }: { state: AdminActionState }) {
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

export function EndpointBadge({ method, endpoint }: { method: string; endpoint: string }) {
  return (
    <code className="inline-flex max-w-full items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs font-medium text-gray-600 shadow-theme-xs">
      <span className="rounded-md bg-brand-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
        {method}
      </span>
      <span className="break-all">{endpoint}</span>
    </code>
  );
}

export function SectionContent({
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

export function ActionShell({
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

export function FieldRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
      {label}
      {children}
    </label>
  );
}

export function FieldGroup({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500",
        className
      )}
    >
      <span>{label}</span>
      {children}
    </div>
  );
}

export function FormInput({
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

export function FormTextarea({
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

export function FormSelect({
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

export function SubmitButton({
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



export function schoolId(school: School) {
  return school.schoolId ?? school.id;
}

export function schoolOptionLabel(school: School) {
  return [school.name, school.city, schoolId(school)].filter(Boolean).join(" - ");
}

export function externalCompanyOptionLabel(company: { name?: string | null; id?: number | null }) {
  return [company.name, company.id].filter(Boolean).join(" - ");
}

export function cityCode(city: CityDTO) {
  return normalizeCityCode(city.code ?? city.name ?? "");
}

export function cityOptionLabel(city: CityDTO) {
  return [city.name, cityCode(city)].filter(Boolean).join(" - ");
}
