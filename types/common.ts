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