import type { CityDTO, CityRef } from "@/types/city";

export const formatCityName = (value: string) => {
  const trimmed = value.normalize("NFC").trim();
  if (!trimmed) return "";

  return trimmed
    .toLocaleLowerCase("sv-SE")
    .replace(/(^|[\s-])\p{L}/gu, (match) => match.toLocaleUpperCase("sv-SE"));
};

export const normalizeCityName = (value: string | null | undefined) =>
  formatCityName(value ?? "");

/**
 * Display name for a city reference. The backend already localizes `name`
 * from the request's Accept-Language header, so this is a plain accessor.
 */
export const cityRefLabel = (ref: CityRef) => ref.name || ref.code;

/**
 * Display name for a city (catalogue row). Falls back to a prettified code so
 * a heading never shows a raw "GOTHENBURG"-style identifier.
 */
export const cityDisplayName = (
  city: Pick<CityDTO, "code" | "name"> | null | undefined
) => {
  if (!city) return "";
  return city.name ?? formatCityName(city.code ?? "");
};

/** Lowercased city code for pretty city page URLs (/cities/gothenburg). */
export const cityCodeToUrlSegment = (code: string) =>
  code.trim().toLocaleLowerCase("en-US");
