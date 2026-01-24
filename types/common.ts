export type TimestampString = string;
export type DateString = string; // format: "YYYY-MM-DD"
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export type City = string;
export type Area = string;
export type UrlString = string;
export type Tag = string;

export type Coordinates = {
  lat?: number | null;
  lng?: number | null;
};

export interface AdvertiserSummary {
  id: number;
  type: "company" | "private_landlord";
  displayName: string;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  city?: string | null;
  rating?: number | null;
  website?: string | null;
  description?: string | null;
  phone?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  contactNote?: string | null;
  subtitle?: string | null;
}

// Keep only unique elements in array
export function uniqueOnly<E>(arr: E[]) {
  return Array.from(new Set<E>(arr)) as E[];
}

// Remove all empty elements from the array (I.e elements that match Boolean -> false)
export function removeEmpty<E>(arr: E[]) {
  return arr.filter(Boolean);
}

// Ensure the provided value is a string, and that it has a searchable format (no spaces and lower-case)
export function toSearchString<E>(item: E) {
  return typeof item === "string" ? item.trim().toLowerCase() : "";
}

// True when the provided search string is either empty (not specified) or equal to the target string
export function searchStringMatches(searchString: string, targetString: string) {
  return !searchString || searchString === targetString;
}


