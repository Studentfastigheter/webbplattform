import { apiClient, arrayFromApiResponse, pathSegment } from "@/lib/api/client";
import type {
  CityCompanyDTO,
  CityDTO,
  CityDetailedDTO,
  CreateCityRequest,
  ModifyCityRequest,
} from "@/types/city";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const firstString = (...values: unknown[]) =>
  values.find(
    (value): value is string => typeof value === "string" && value.trim().length > 0
  )?.trim();

const firstNumber = (...values: unknown[]) => {
  for (const value of values) {
    const numberValue =
      typeof value === "string" ? Number(value.replace(",", ".")) : Number(value);

    if (Number.isFinite(numberValue)) {
      return numberValue;
    }
  }

  return undefined;
};

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
    code: code ?? normalizeCityCode(city),
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
  };
};

export const cityService = {
  list: async (): Promise<CityDTO[]> => {
    const cities = await apiClient<unknown>("/cities", { auth: false });
    return arrayFromApiResponse<unknown>(cities)
      .map(normalizeCity)
      .filter((city): city is CityDTO => city !== null);
  },

  listNames: async (): Promise<string[]> => {
    const cities = await cityService.list();
    return cities
      .map((city) => firstString(city.city, city.code))
      .filter((city): city is string => Boolean(city));
  },

  get: async (code: string): Promise<CityDetailedDTO> => {
    const city = await apiClient<unknown>(`/cities/${pathSegment(code)}`, {
      auth: false,
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
};
