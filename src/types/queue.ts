import { TimestampString } from "./common";

// ==========================================================
// DTO från Backend (Matchar Java HousingQueueDTO)
// ==========================================================
export interface HousingQueueDTO {
  id: string;
  companyId: number;
  name: string;
  city: string;
  description?: string;
  tags?: string[];
  totalUnits?: number;
  waitDays?: number;
  activeListings?: number;
  /** Frontend-enriched fields from company/profile endpoints, not part of HousingQueueDTO in Swagger. */
  logoUrl?: string;
  bannerUrl?: string;
  contactPhone?: string;
  contactEmail?: string;
  website?: string;
  socialLinks?: Record<string, string>;
};

export interface StudentQueueMembershipDTO {
  id: string;
  queueId: string;
  joinedAt?: TimestampString;
  status?: string;
  lastUpdated?: TimestampString;
}
