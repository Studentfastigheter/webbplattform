import {
  apiClient,
  arrayFromApiResponse,
  buildQuery,
  pathSegment,
  type ServiceOptions,
} from "@/lib/api/client";
import {
  firstFiniteNumber as firstNumber,
  firstNonEmptyString as firstString,
  isRecord,
} from "@/lib/api/normalize";
import type {
  CityAdminDTO,
  CityCompanyDTO,
  CityDTO,
  CityDetailedDTO,
  CityRef,
  CitySchoolDTO,
  CityStudentActivityDTO,
  CreateCityRequest,
  ModifyCityRequest,
} from "@/types/city";
import { formatCityName } from "@/features/cities/city-utils";

// --- Area aliases (admin) ---
// Links a raw area name (as delivered by an external property system, per
// company) to the city it belongs to. Rows without a city were queued
// automatically — imported from the external system's area register or
// surfaced by an unresolvable listing — and still need an admin to link them.
// Aliases carry no coordinates: listing coordinates are always geocoded from
// the listing's own address, with the linked city as a constraint.
export type AreaAliasDTO = {
  areaName: string;
  companyId: number;
  companyName: string | null;
  cityCode: string | null;
  cityName: string | null;
  filled: boolean;
};

export type CreateAreaAliasRequest = {
  areaName: string;
  companyId: number;
  cityCode?: string | null;
};

export type ModifyAreaAliasRequest = {
  areaName: string;
  companyId: number;
  cityCode: string;
};

// Delade normaliseringshelpers — se @/lib/api/normalize.

export const normalizeCityCode = (value: string | null | undefined) =>
  value
    ?.normalize("NFD")
    // City codes are ASCII (derived from the English name) — fold any
    // diacritics so legacy display-name inputs still normalise to a code.
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLocaleUpperCase("sv-SE")
    .replace(/[\s-]+/g, "_") ?? "";

const normalizeCity = (value: unknown): CityDTO | null => {
  if (typeof value === "string") {
    const city = value.trim();
    return city ? { name: city, code: normalizeCityCode(city) } : null;
  }

  if (!isRecord(value)) {
    return null;
  }

  const name = firstString(value.name, value.nameSv, value.city, value.displayName);
  const code = firstString(value.code, value.cityCode, value.id);

  if (!name && !code) {
    return null;
  }

  return {
    name: name ?? code ?? "",
    code: normalizeCityCode(code ?? name),
    bannerUrl: firstString(value.bannerUrl, value.bannerURL) ?? null,
    description: firstString(value.description) ?? null,
  };
};

/**
 * Normalises a company's city reference — the API's {code, name} object
 * (name already localized by the backend), or a legacy plain code/name
 * string — into a CityRef.
 */
export const normalizeCityRef = (value: unknown): CityRef | null => {
  if (typeof value === "string") {
    const code = normalizeCityCode(value);
    if (!code) {
      return null;
    }
    return { code, name: formatCityName(value) };
  }

  if (!isRecord(value)) {
    return null;
  }

  const code = normalizeCityCode(
    firstString(value.code, value.cityCode, value.name)
  );
  if (!code) {
    return null;
  }
  const name = firstString(value.name, value.nameSv, value.city) ?? formatCityName(code);
  return { code, name };
};

const normalizeCityCompany = (value: unknown): CityCompanyDTO | null => {
  if (!isRecord(value)) {
    return null;
  }

  const id = firstNumber(value.id, value.companyId);
  const name = firstString(value.name, value.companyName);

  if (id === undefined || !name) {
    return null;
  }

  return {
    id,
    name,
    subtitle: firstString(value.subtitle) ?? null,
    description: firstString(value.description, value.companyDescription) ?? null,
    websiteUrl: firstString(value.websiteUrl, value.website, value.companyUrl) ?? null,
    bannerUrl: firstString(value.bannerUrl, value.bannerURL) ?? null,
    logoUrl: firstString(value.logoUrl, value.logoURL) ?? null,
  };
};

const normalizeCitySchool = (value: unknown): CitySchoolDTO | null => {
  if (!isRecord(value)) {
    return null;
  }

  const name = firstString(value.name, value.schoolName);
  const lat = firstNumber(value.lat, value.latitude);
  const lng = firstNumber(value.lng, value.longitude);

  if (!name || lat === undefined || lng === undefined) {
    return null;
  }

  return {
    id: firstNumber(value.id, value.schoolId),
    name,
    lat,
    lng,
  };
};

const normalizeCityStudentActivity = (
  value: unknown
): CityStudentActivityDTO | null => {
  if (!isRecord(value)) {
    return null;
  }

  const name = firstString(value.name, value.activityName);
  const category = firstString(value.category);
  const lat = firstNumber(value.lat, value.latitude);
  const lng = firstNumber(value.lng, value.longitude);

  if (!name || !category || lat === undefined || lng === undefined) {
    return null;
  }

  return {
    id: firstNumber(value.id, value.activityId, value.pointOfInterestId),
    name,
    category,
    lat,
    lng,
  };
};

const normalizeAreaAlias = (value: unknown): AreaAliasDTO | null => {
  if (!isRecord(value)) {
    return null;
  }

  const areaName = firstString(value.areaName);
  const companyId = firstNumber(value.companyId);

  if (!areaName || companyId === undefined) {
    return null;
  }

  const cityCode = firstString(value.cityCode) ?? null;

  return {
    areaName,
    companyId,
    companyName: firstString(value.companyName) ?? null,
    cityCode,
    cityName: firstString(value.cityName) ?? null,
    filled: typeof value.filled === "boolean" ? value.filled : Boolean(cityCode),
  };
};

const normalizeCityDetail = (value: unknown): CityDetailedDTO => {
  const city = normalizeCity(value);

  if (!isRecord(value) || !city) {
    throw new Error("Oväntat svar från servern.");
  }

  return {
    ...city,
    companies: arrayFromApiResponse<unknown>(value.companies)
      .map(normalizeCityCompany)
      .filter((company): company is CityCompanyDTO => company !== null),
    externalCompanies: arrayFromApiResponse<unknown>(value.externalCompanies)
      .map(normalizeCityCompany)
      .filter((company): company is CityCompanyDTO => company !== null),
    schools: arrayFromApiResponse<unknown>(value.schools)
      .map(normalizeCitySchool)
      .filter((school): school is CitySchoolDTO => school !== null),
    studentActivities: arrayFromApiResponse<unknown>(value.studentActivities)
      .map(normalizeCityStudentActivity)
      .filter(
        (activity): activity is CityStudentActivityDTO => activity !== null
      ),
  };
};

export const cityService = {
  list: async (options?: ServiceOptions): Promise<CityDTO[]> => {
    const cities = await apiClient<unknown>("/cities", {
      auth: false,
      signal: options?.signal,
    });
    return arrayFromApiResponse<unknown>(cities)
      .map(normalizeCity)
      .filter((city): city is CityDTO => city !== null);
  },

  listNames: async (options?: ServiceOptions): Promise<string[]> => {
    const cities = await cityService.list(options);
    return cities
      .map((city) => firstString(city.name, city.code))
      .filter((city): city is string => Boolean(city));
  },

  listCodes: async (options?: ServiceOptions): Promise<string[]> => {
    const cities = await cityService.list(options);
    return cities
      .map((city) => normalizeCityCode(firstString(city.code, city.name)))
      .filter(Boolean);
  },

  /** Admin edit view with every language variant explicit. */
  getAdmin: async (code: string, options?: ServiceOptions): Promise<CityAdminDTO> => {
    const city = await apiClient<CityAdminDTO>(`/cities/${pathSegment(code)}/admin`, {
      signal: options?.signal,
    });
    return {
      code: normalizeCityCode(city.code),
      nameSv: city.nameSv ?? null,
      nameEn: city.nameEn ?? null,
      descriptionSv: city.descriptionSv ?? null,
      descriptionEn: city.descriptionEn ?? null,
      bannerUrl: city.bannerUrl ?? null,
    };
  },

  get: async (code: string, options?: ServiceOptions): Promise<CityDetailedDTO> => {
    const city = await apiClient<unknown>(`/cities/${pathSegment(code)}`, {
      auth: false,
      signal: options?.signal,
    });
    return normalizeCityDetail(city);
  },

  create: async (payload: CreateCityRequest): Promise<void> => {
    await apiClient<void>("/cities", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  update: async (code: string, payload: ModifyCityRequest): Promise<void> => {
    await apiClient<void>(`/cities/${pathSegment(code)}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  delete: async (code: string): Promise<void> => {
    await apiClient<void>(`/cities/${pathSegment(code)}`, {
      method: "DELETE",
    });
  },

  // --- Area aliases (admin) ---

  listAreaAliases: async (options?: ServiceOptions): Promise<AreaAliasDTO[]> => {
    const aliases = await apiClient<unknown>("/cities/area-aliases", {
      signal: options?.signal,
    });
    return arrayFromApiResponse<unknown>(aliases)
      .map(normalizeAreaAlias)
      .filter((alias): alias is AreaAliasDTO => alias !== null);
  },

  createAreaAlias: async (
    payload: CreateAreaAliasRequest
  ): Promise<AreaAliasDTO | null> => {
    const created = await apiClient<unknown>("/cities/area-aliases", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return normalizeAreaAlias(created);
  },

  updateAreaAlias: async (
    payload: ModifyAreaAliasRequest
  ): Promise<AreaAliasDTO | null> => {
    const updated = await apiClient<unknown>("/cities/area-aliases", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    return normalizeAreaAlias(updated);
  },

  deleteAreaAlias: async (
    areaName: string,
    companyId: number
  ): Promise<void> => {
    await apiClient<void>(
      `/cities/area-aliases${buildQuery({ areaName, companyId })}`,
      {
        method: "DELETE",
      }
    );
  },
};
