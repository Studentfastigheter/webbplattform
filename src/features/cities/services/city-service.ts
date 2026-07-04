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
  CityCompanyDTO,
  CityDTO,
  CityDetailedDTO,
  CitySchoolDTO,
  CityStudentActivityDTO,
  CreateCityRequest,
  ModifyCityRequest,
} from "@/types/city";

// --- Area-to-city mappings (admin) ---
// Maps an area (sub-city with its own city code, e.g. a district) to the
// parent city it belongs to, so listings in the area are grouped under it.
export type AreaToCityDTO = {
  id: string;
  areaCode: string;
  areaName: string | null;
  parentCityCode: string;
  parentCityName: string | null;
};

export type CreateAreaToCityRequest = {
  areaCode: string;
  parentCityCode: string;
};

export type ModifyAreaToCityRequest = {
  areaCode?: string | null;
  parentCityCode?: string | null;
};

// --- Area-to-location overrides (admin) ---
// Maps a raw area name (per company) to a concrete location. Rows with
// null city/lat/lng were auto-created when geocoding failed and still need
// an admin to fill in the correct values.
export type AreaToLocationDTO = {
  areaName: string;
  companyId: number;
  companyName: string | null;
  city: string | null;
  lat: number | null;
  lng: number | null;
  filled: boolean;
};

export type CreateAreaToLocationRequest = {
  areaName: string;
  companyId: number;
  city?: string | null;
  lat?: number | null;
  lng?: number | null;
};

export type ModifyAreaToLocationRequest = {
  areaName: string;
  companyId: number;
  city?: string | null;
  lat?: number | null;
  lng?: number | null;
};

// Delade normaliseringshelpers — se @/lib/api/normalize.

export const normalizeCityCode = (value: string | null | undefined) =>
  value
    ?.normalize("NFC")
    .trim()
    .toLocaleUpperCase("sv-SE")
    .replace(/[\s-]+/g, "_") ?? "";

const normalizeCity = (value: unknown): CityDTO | null => {
  if (typeof value === "string") {
    const city = value.trim();
    return city ? { city, code: normalizeCityCode(city) } : null;
  }

  if (!isRecord(value)) {
    return null;
  }

  const city = firstString(value.city, value.name, value.displayName);
  const code = firstString(value.code, value.cityCode, value.id);

  if (!city && !code) {
    return null;
  }

  return {
    city: city ?? code ?? "",
    code: normalizeCityCode(code ?? city),
    bannerUrl: firstString(value.bannerUrl, value.bannerURL) ?? null,
    description: firstString(value.description) ?? null,
  };
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

const normalizeAreaToCity = (value: unknown): AreaToCityDTO | null => {
  if (!isRecord(value)) {
    return null;
  }

  const id = firstString(value.id);
  const areaCode = firstString(value.areaCode, value.code);
  const parentCityCode = firstString(value.parentCityCode);

  if (!id || !areaCode || !parentCityCode) {
    return null;
  }

  return {
    id,
    areaCode,
    areaName: firstString(value.areaName) ?? null,
    parentCityCode,
    parentCityName: firstString(value.parentCityName) ?? null,
  };
};

const normalizeAreaToLocation = (value: unknown): AreaToLocationDTO | null => {
  if (!isRecord(value)) {
    return null;
  }

  const areaName = firstString(value.areaName);
  const companyId = firstNumber(value.companyId);

  if (!areaName || companyId === undefined) {
    return null;
  }

  const lat = firstNumber(value.lat, value.latitude);
  const lng = firstNumber(value.lng, value.longitude);
  const city = firstString(value.city) ?? null;

  return {
    areaName,
    companyId,
    companyName: firstString(value.companyName) ?? null,
    city,
    lat: lat ?? null,
    lng: lng ?? null,
    filled:
      typeof value.filled === "boolean"
        ? value.filled
        : Boolean(city) && lat !== undefined && lng !== undefined,
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
      .map((city) => firstString(city.city, city.code))
      .filter((city): city is string => Boolean(city));
  },

  listCodes: async (options?: ServiceOptions): Promise<string[]> => {
    const cities = await cityService.list(options);
    return cities
      .map((city) => normalizeCityCode(firstString(city.code, city.city)))
      .filter(Boolean);
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

  // --- Area-to-city mappings (admin) ---

  listAreaMappings: async (
    options?: ServiceOptions
  ): Promise<AreaToCityDTO[]> => {
    const mappings = await apiClient<unknown>("/cities/area-mappings", {
      signal: options?.signal,
    });
    return arrayFromApiResponse<unknown>(mappings)
      .map(normalizeAreaToCity)
      .filter((mapping): mapping is AreaToCityDTO => mapping !== null);
  },

  createAreaMapping: async (
    payload: CreateAreaToCityRequest
  ): Promise<AreaToCityDTO | null> => {
    const created = await apiClient<unknown>("/cities/area-mappings", {
      method: "POST",
      body: JSON.stringify({
        areaCode: normalizeCityCode(payload.areaCode),
        parentCityCode: normalizeCityCode(payload.parentCityCode),
      }),
    });
    return normalizeAreaToCity(created);
  },

  updateAreaMapping: async (
    id: string,
    payload: ModifyAreaToCityRequest
  ): Promise<AreaToCityDTO | null> => {
    const updated = await apiClient<unknown>(
      `/cities/area-mappings/${pathSegment(id)}`,
      {
        method: "PUT",
        body: JSON.stringify({
          areaCode: payload.areaCode
            ? normalizeCityCode(payload.areaCode)
            : undefined,
          parentCityCode: payload.parentCityCode
            ? normalizeCityCode(payload.parentCityCode)
            : undefined,
        }),
      }
    );
    return normalizeAreaToCity(updated);
  },

  deleteAreaMapping: async (id: string): Promise<void> => {
    await apiClient<void>(`/cities/area-mappings/${pathSegment(id)}`, {
      method: "DELETE",
    });
  },

  // --- Area-to-location overrides (admin) ---

  listAreaLocations: async (
    options?: ServiceOptions
  ): Promise<AreaToLocationDTO[]> => {
    const locations = await apiClient<unknown>("/cities/area-locations", {
      signal: options?.signal,
    });
    return arrayFromApiResponse<unknown>(locations)
      .map(normalizeAreaToLocation)
      .filter((location): location is AreaToLocationDTO => location !== null);
  },

  createAreaLocation: async (
    payload: CreateAreaToLocationRequest
  ): Promise<AreaToLocationDTO | null> => {
    const created = await apiClient<unknown>("/cities/area-locations", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return normalizeAreaToLocation(created);
  },

  updateAreaLocation: async (
    payload: ModifyAreaToLocationRequest
  ): Promise<AreaToLocationDTO | null> => {
    const updated = await apiClient<unknown>("/cities/area-locations", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    return normalizeAreaToLocation(updated);
  },

  deleteAreaLocation: async (
    areaName: string,
    companyId: number
  ): Promise<void> => {
    await apiClient<void>(
      `/cities/area-locations${buildQuery({ areaName, companyId })}`,
      {
        method: "DELETE",
      }
    );
  },
};
