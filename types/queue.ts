// ÄNDRING: Vi importerar AdvertiserSummary härifrån istället för att skapa en ny
import { Area, City, Tag, TimestampString, UrlString, AdvertiserSummary } from "./common";
import { User } from "./user"; 

export type QueueId = string; // UUID
export type QueueApplicationId = string; // UUID
export type QueueStatus = "open" | "closed" | "paused";
export type QueueApplicationStatus = "active" | "left" | "offered" | "expired";

// ==========================================================
// DTO från Backend (Matchar Java HousingQueueDTO)
// ==========================================================
export interface HousingQueueDTO {
  id: string;            
  companyId: number;     
  name: string;
  city: string;
  logoUrl: string;
  description?: string;
  tags?: string[];
  totalUnits?: number;
  waitDays?: number;     
  activeListings: number;
};

export type AdvertisedHousingQueue = HousingQueueDTO & {
  advertiser?: AdvertiserSummary;
};

export type QueueMapItem = AdvertisedHousingQueue & {
  lng: number;
  lat: number;
};

// ==========================================================
// GAMLA TYPER (Entity-modeller)
// ==========================================================

export interface HousingQueue {
  id: QueueId;
  company: User; 
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

export interface StudentQueueApplication {
  id: QueueApplicationId;
  studentId: number; 
  queue: HousingQueue;
  joinedAt: TimestampString;
  status: QueueApplicationStatus;
  lastUpdated: TimestampString;
}
