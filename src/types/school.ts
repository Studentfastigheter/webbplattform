import { City } from "./common";

export type SchoolId = number;

export interface SchoolDTO {
  schoolId: SchoolId;
  name: string;
  city?: City | null;
  lat?: number | null;
  lng?: number | null;
}

export interface AddSchoolRequest {
  schoolName: string;
  city: string;
  lat: number;
  lng: number;
}

export interface QueueSummaryDTO {
  companyId: number;
  companyName: string;
  listingCount?: number | null;
  queueId: string;
  queueName: string;
  userQueueDays?: number | null;
}

export type School = Omit<SchoolDTO, "schoolId"> & {
  id: SchoolId;
  schoolId?: SchoolId;
};
