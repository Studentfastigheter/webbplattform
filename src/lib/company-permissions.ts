import type { Locale } from "@/i18n/config";
import { localizedText } from "@/i18n/text";

export type CompanyRoleLike =
  | string
  | {
      name?: string | null;
      roleName?: string | null;
      description?: string | null;
      accessLevel?: number | string | null;
    }
  | null
  | undefined;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function toFiniteNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function firstString(...values: unknown[]) {
  return values.find(
    (value): value is string => typeof value === "string" && value.trim().length > 0
  )?.trim();
}

export function getCompanyRoleName(role?: CompanyRoleLike) {
  if (typeof role === "string") {
    return role.trim();
  }

  if (!isRecord(role)) {
    return "";
  }

  return firstString(role.name, role.roleName) ?? "";
}

export function getCompanyRoleDescription(role?: CompanyRoleLike) {
  if (!isRecord(role)) {
    return null;
  }

  return firstString(role.description) ?? null;
}

export function getCompanyRoleAccessLevel(role?: CompanyRoleLike) {
  if (!isRecord(role)) {
    return null;
  }

  return toFiniteNumber(role.accessLevel);
}

export function getCompanyRoleDisplayName(role: CompanyRoleLike, locale: Locale) {
  const roleName = getCompanyRoleName(role);
  const normalizedRoleName = roleName.trim().toUpperCase();

  if (normalizedRoleName === "ADMIN") return localizedText(locale, "Admin", "Admin");
  if (normalizedRoleName === "MANAGER") return localizedText(locale, "Manager", "Manager");
  if (normalizedRoleName === "AGENT") return localizedText(locale, "Agent", "Agent");

  return roleName || localizedText(locale, "Okänd behörighet", "Unknown permission");
}
