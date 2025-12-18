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