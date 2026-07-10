import type { AdminTrendPointDTO } from "@/types";
import type { TrendBarChartPoint } from "@/features/analytics/components/TrendBarChart";

/** Converts backend trend points (UTC dates) to TrendBarChart input. */
export function toTrendData(
  points: AdminTrendPointDTO[] | undefined
): TrendBarChartPoint[] {
  return (points ?? []).map((point) => ({
    timestamp: `${point.date}T00:00:00.000Z`,
    value: point.count,
  }));
}

export function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export function formatCount(value: number | undefined) {
  return (value ?? 0).toLocaleString("sv-SE");
}

const percentFormatter = new Intl.NumberFormat("sv-SE", {
  style: "percent",
  maximumFractionDigits: 1,
});

export function formatShare(ratio: number | undefined) {
  return percentFormatter.format(ratio ?? 0);
}

export const LISTING_STATUS_LABELS: Record<string, string> = {
  AVAILABLE: "Tillgängliga",
  RENTED: "Uthyrda",
  HIDDEN: "Dolda",
};

export const APPLICATION_STATUS_LABELS: Record<string, string> = {
  SUBMITTED: "Inskickade",
  UNDER_REVIEW: "Under granskning",
  ACCEPTED: "Accepterade",
  OFFERED: "Erbjudna",
  REJECTED: "Avslagna",
};

export const GENDER_LABELS: Record<string, string> = {
  MALE: "Män",
  FEMALE: "Kvinnor",
  OTHER: "Annat",
  UNKNOWN: "Okänt",
};

export function listingStatusLabel(key: string) {
  return LISTING_STATUS_LABELS[key] ?? key;
}

export function applicationStatusLabel(key: string) {
  return APPLICATION_STATUS_LABELS[key] ?? key;
}

export function genderLabel(key: string) {
  return GENDER_LABELS[key] ?? key;
}

/** "PLATFORM" is the backend's bucket for listings created on CampusLyan itself. */
export function listingSourceLabel(key: string) {
  if (key === "PLATFORM") return "CampusLyan (egna)";
  if (key === "UNKNOWN") return "Okänd";
  return key.charAt(0) + key.slice(1).toLowerCase();
}

const regionNames =
  typeof Intl.DisplayNames === "function"
    ? new Intl.DisplayNames(["sv"], { type: "region" })
    : null;

/** Backend returns ISO 3166 country codes; "UNKNOWN" for students without one. */
export function countryLabel(key: string) {
  if (key === "UNKNOWN") return "Okänt";
  try {
    return regionNames?.of(key) ?? key;
  } catch {
    return key;
  }
}
