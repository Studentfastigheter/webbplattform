import {
  DateString,
  DocumentFileType,
  JsonValue,
  SystemProvider,
  TimestampString,
} from "./common";
export type { PageResponse } from "./api";

// ==========================================
// NYTT: DTOs (Används för listan, detaljsidan och ansökningar)
// ==========================================

// 1. KORTET (Feed)
export interface ListingCardDTO {
  id: string;
  imageUrl: string;
  title: string;
  location: string;
  rent: number;
  dwellingType: string;
  /** Display label for the dwelling type, localized by the backend. */
  dwellingTypeLabel?: string | null;
  rooms: number;
  sizeM2: number;
  tags: ListingTagDTO[];
  hostType: string;
  hostName?: string;
  hostLogoUrl?: string;
  verifiedHost: boolean;
  lat?: number | null;
  lng?: number | null;
  status?: ListingStatus | string | null;
  applyBy?: DateString | null;
  availableFrom?: DateString | null;
  availableTo?: DateString | null;
  /** Swagger field for ListingCardDTO. */
  requirementProfileId?: string | null;
  /** @deprecated Detail DTO uses requirementsProfileId; cards use requirementProfileId. */
  requirementsProfileId?: string | null;
  published?: TimestampString | null;
  nearbyLocations?: ListingNearbyLocationDTO[];
}

// 2. DETALJVYN (Single Listing) - Matchar Java ListingDetailDTO
export interface ListingDetailDTO {
  id: string;
  title: string;
  city: string;
  area: string;
  fullAddress?: string | null;
  rent: number;
  dwellingType: string;
  /** Display label for the dwelling type, localized by the backend. */
  dwellingTypeLabel?: string | null;
  rooms: number;
  sizeM2: number | null;
  description: string;
  tags: ListingTagDTO[];
  imageUrls: string[]; 
  
  // Datum
  moveIn?: DateString | null;
  applyBy?: DateString | null;
  availableFrom?: DateString | null;
  availableTo?: DateString | null;

  // Karta
  lat?: number | null;
  lng?: number | null;

  // Värd / Ägare
  ownerType: string;
  ownerName: string;
  ownerLogoUrl?: string | null;
  ownerId: number;
  provider?: SystemProvider | string | null;
  status?: ListingStatus | string | null;
  verifiedOwner: boolean;
  requirementsProfileId?: string | null;
  published?: TimestampString | null;
  nearbyLocations?: ListingNearbyLocationDTO[];
}

export interface ListingNearbyLocationDTO {
  location: "GYM" | "GROCERIES" | "NIGHTCLUB" | "UNIVERSITY" | "TRANSIT" | string;
  lat?: number | null;
  lng?: number | null;
  details?: string | null;
}

export interface ListingTagDTO {
  tagKey?: string | null;
  displayName: string;
  icon?: string | null;
}

interface RequiredDocument {
  caption?: string | null;
  validityDays?: number | null;
  mandatory?: boolean | null;
  validTypes?: Array<DocumentFileType | string>;
}

export interface RequirementsProfileDTO {
  id?: string | null;
  title?: string | null;
  minAge?: number | null;
  maxAge?: number | null;
  description?: string | null;
  requiredDocuments?: RequiredDocument[];
}

// 3. MINA ANSÖKNINGAR (My Applications) - Matchar Java StudentApplicationDTO
export interface StudentApplicationDTO {
  applicationId: number;
  status: string;        // "submitted", "accepted", etc.
  appliedAt: string;     // ISO-datum (Instant från Java)
  message?: string | null;
  
  // Bostadsinfo för kortet
  listingId: string;
  listingTitle: string;
  listingImage: string;
  rent: number;
  city: string;
  hostType: string;
}

export const LISTING_STATUS_VALUES = ["AVAILABLE", "HIDDEN", "RENTED"] as const;
export type ListingStatus = (typeof LISTING_STATUS_VALUES)[number];

export const DWELLING_TYPE_VALUES = ["APARTMENT", "ROOM", "CORRIDOR_ROOM"] as const;
export type DwellingType = (typeof DWELLING_TYPE_VALUES)[number];

export const HOST_TYPE_VALUES = ["COMPANY", "PRIVATE"] as const;
export type HostType = (typeof HOST_TYPE_VALUES)[number];

export interface UpdateListingRequest {
  title?: string;
  rooms?: number | null;
  sizeM2?: number | null;
  rent?: number | null;
  description?: string;
  tags?: string[];
  status?: ListingStatus;
  images?: string[];
  applyBy?: DateString | null;
  availableFrom?: DateString | null;
  availableTo?: DateString | null;
}

export interface UpdateMultipleListingsRequest {
  listingDatas: Record<string, UpdateListingRequest>;
}

export interface PublishListingRequest {
  title?: string;
  city?: string;
  area?: string;
  address?: string;
  dwellingType?: DwellingType | string;
  rooms?: number | null;
  sizeM2?: number | null;
  rent?: number | null;
  description?: string;
  tags?: string[];
  images?: string[];
  applyBy?: DateString | null;
  availableFrom?: DateString | null;
  availableTo?: DateString | null;
}

export interface ApplicationRequest {
  message?: string;
}

export interface Ad {
  id: number;
  start?: DateString | null;
  stop?: DateString | null;
  company?: string | null;
  data?: JsonValue;
}
