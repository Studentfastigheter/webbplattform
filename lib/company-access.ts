import type { CompanyId, User } from "@/types/user";

export type CompanySummary = {
  id: CompanyId;
  name?: string;
  logoUrl?: string;
};

const ACTIVE_COMPANY_STORAGE_KEY = "campuslyan.portal.activeCompanyId.v1";

const directCompanyIdKeys = [
  "activeCompanyId",
  "selectedCompanyId",
  "currentCompanyId",
  "companyId",
  "company_id",
  "companyID",
  "organizationId",
  "organisationId",
];

const companyListKeys = [
  "companies",
  "companyIds",
  "company_ids",
  "companyAccounts",
  "companyMemberships",
  "companyUsers",
  "companyConnections",
  "linkedCompanies",
  "organizations",
  "organisations",
];

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

function readCompanyFromValue(value: unknown): CompanySummary | null {
  const directId = toFiniteNumber(value);
  if (directId != null) {
    return { id: directId };
  }

  if (!isRecord(value)) {
    return null;
  }

  const nestedCompany = value.company;
  if (isRecord(nestedCompany)) {
    const nestedId = toFiniteNumber(nestedCompany.id ?? nestedCompany.companyId);
    if (nestedId != null) {
      return {
        id: nestedId,
        name: firstString(nestedCompany.name, nestedCompany.companyName),
        logoUrl: firstString(nestedCompany.logoUrl),
      };
    }
  }

  const id =
    toFiniteNumber(value.companyId) ??
    toFiniteNumber(value.company_id) ??
    toFiniteNumber(value.companyID) ??
    toFiniteNumber(value.organizationId) ??
    toFiniteNumber(value.organisationId) ??
    toFiniteNumber(value.id);

  if (id == null) {
    return null;
  }

  return {
    id,
    name: firstString(value.name, value.companyName),
    logoUrl: firstString(value.logoUrl),
  };
}

function dedupeCompanies(companies: CompanySummary[]) {
  const byId = new Map<number, CompanySummary>();

  companies.forEach((company) => {
    const existing = byId.get(company.id);
    byId.set(company.id, {
      ...existing,
      ...company,
      name: company.name ?? existing?.name,
      logoUrl: company.logoUrl ?? existing?.logoUrl,
    });
  });

  return Array.from(byId.values());
}

export function getUserCompanies(user: User | null | undefined): CompanySummary[] {
  if (!user) {
    return [];
  }

  const source = user as User & Record<string, unknown>;
  const companies: CompanySummary[] = [];

  directCompanyIdKeys.forEach((key) => {
    const id = toFiniteNumber(source[key]);
    if (id != null) {
      companies.push({
        id,
        name: firstString(source.companyName),
        logoUrl: firstString(source.logoUrl),
      });
    }
  });

  const embeddedCompany = readCompanyFromValue(source.company);
  if (embeddedCompany) {
    companies.push(embeddedCompany);
  }

  companyListKeys.forEach((key) => {
    const value = source[key];
    if (!Array.isArray(value)) {
      return;
    }

    value.forEach((entry) => {
      const company = readCompanyFromValue(entry);
      if (company) {
        companies.push(company);
      }
    });
  });

  return dedupeCompanies(companies);
}

export function getActiveCompanyId(user: User | null | undefined): number | null {
  const companies = getUserCompanies(user);

  if (companies.length === 0) {
    return null;
  }

  if (typeof window !== "undefined") {
    const stored = toFiniteNumber(window.localStorage.getItem(ACTIVE_COMPANY_STORAGE_KEY));
    if (stored != null && companies.some((company) => company.id === stored)) {
      return stored;
    }
  }

  return companies[0]?.id ?? null;
}

export function getActiveCompanySummary(user: User | null | undefined) {
  const activeCompanyId = getActiveCompanyId(user);
  if (activeCompanyId == null) {
    return null;
  }

  return (
    getUserCompanies(user).find((company) => company.id === activeCompanyId) ?? {
      id: activeCompanyId,
      name: user?.companyName,
      logoUrl: user?.logoUrl,
    }
  );
}
