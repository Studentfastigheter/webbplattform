import { City } from "./common";
import { SchoolId } from "./user";

export type School = {
  schoolId: SchoolId;
  schoolName: string;
  city?: City | null;
  lat?: number | null;
  lng?: number | null;
};

export type SchoolQueueSummary = {
  companyId: number;
  companyName: string;
  userQueueDays?: number | null;
  listingsCount?: number | null;
};