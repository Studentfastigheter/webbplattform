import { Area, City, Tag, TimestampString, UrlString } from "./common";
import { CompanyAccount, CompanyId, StudentId } from "./user";

export type QueueId = string; // uuid
export type QueueApplicationId = string; // uuid
export type QueueStatus = "open" | "closed" | "paused";
export type QueueApplicationStatus =
  | "active"
  | "left"
  | "offered"
  | "expired";

export type HousingQueue = {
  queueId: QueueId;
  companyId: CompanyId;
  name: string;
  area?: Area | null;
  city?: City | null;
  lat?: number | null;
  lng?: number | null;
  description?: string | null;
  status: QueueStatus;
  totalUnits?: number | null;
  feeInfo?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  website?: UrlString | null;
  tags?: Tag[] | null;
  approximateWaitDays?: number | null;
  createdAt: TimestampString;
  updatedAt: TimestampString;
};

export type HousingQueueWithRelations = HousingQueue & {
  company?: CompanyAccount;
};

export type StudentQueueApplication = {
  applicationId: QueueApplicationId;
  studentId: StudentId;
  queueId: QueueId;
  joinedAt: TimestampString;
  status: QueueApplicationStatus;
  lastUpdated: TimestampString;
};

export type QueueEntry = {
  queueId: string;
  companyId: number;
  queueName: string;
  companyName: string;
  joinedAt: string;
  queueDays: number;
};