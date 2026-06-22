import { TimestampString } from "./common";

// ==========================================================
// DTO från Backend (Matchar Java HousingQueueDTO)
// ==========================================================
export interface HousingQueueDTO {
  id: string;
  companyLogoUrl?: string | null;
  companyId: number;
  name: string;
  city: string;
  description?: string;
  tags?: string[];
  totalUnits?: number;
  waitDays?: number;
  activeListings?: number;
  /** Frontend-enriched alias/fields from company/profile endpoints. */
  logoUrl?: string | null;
  bannerUrl?: string;
  contactPhone?: string;
  contactEmail?: string;
  website?: string;
  socialLinks?: Record<string, string>;
  requirements?: HousingQueueRequirementDTO | null;
};

export interface HousingQueueRequirementDTO {
  id?: string;
  housingQueueId?: string;
  requirements?: string | null;
}

export interface StudentQueueMembershipDTO {
  id: string;
  queueId: string;
  joinedAt?: TimestampString;
  status?: string;
  lastUpdated?: TimestampString;
}
