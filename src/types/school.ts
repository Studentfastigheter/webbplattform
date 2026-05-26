import { City } from "./common";

export type SchoolId = number;

export interface School {
  id: SchoolId;
  name: string; // I Java: name (inte schoolName)
  city?: City | null;
  lat?: number | null;
  lng?: number | null;
}