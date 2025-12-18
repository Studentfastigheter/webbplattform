import { Area, City, Tag, TimestampString, UrlString } from "./common";
import { User } from "./user"; // Importerar User (som Company är en variant av)

export type QueueId = string; // UUID
export type QueueApplicationId = string; // UUID
export type QueueStatus = "open" | "closed" | "paused";
export type QueueApplicationStatus = "active" | "left" | "offered" | "expired";

// Matchar Java HousingQueue
export interface HousingQueue {
  id: QueueId;
  company: User; // Backend skickar Company-objektet
  name: string;
  area?: Area | null;
  city?: City | null;
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
}

// Matchar Java StudentQueueApplication
export interface StudentQueueApplication {
  id: QueueApplicationId;
  studentId: number; // eller hela Student-objektet om backend skickar det
  queue: HousingQueue;
  joinedAt: TimestampString;
  status: QueueApplicationStatus;
  lastUpdated: TimestampString;
}