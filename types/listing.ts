import { Area, City, Coordinates, DateString, Tag, TimestampString, UrlString } from "./common";
import { User } from "./user";

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
  rooms: number;
  sizeM2: number;
  tags: string[];
  hostType: string;
  verifiedHost: boolean;
  lat?: number | null;
  lng?: number | null;
}

// 2. DETALJVYN (Single Listing) - Matchar Java ListingDetailDTO
export interface ListingDetailDTO {
  id: string;
  title: string;
  location: string;
  fullAddress?: string | null;
  rent: number;
  dwellingType: string;
  rooms: number;
  sizeM2: number;
  description: string;
  tags: string[];
  imageUrls: string[]; 
  
  // Datum
  moveIn?: DateString | null;
  applyBy?: DateString | null;
  availableFrom?: DateString | null;
  availableTo?: DateString | null;

  // Karta
  lat?: number | null;
  lng?: number | null;

  // Värd
  hostType: string;
  hostName: string;
  hostId: number;
  verifiedHost: boolean;
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

// Generisk typ för Paginering från Spring Boot
export interface PageResponse<T> {
  content: T[];
  page: {
    size: number;
    totalElements: number;
    totalPages: number;
    number: number;
  };
}

// ==========================================
// GAMLA TYPER (Entity-modeller)
// Behåll dessa om du använder dem i andra delar av appen (t.ex. Admin)
// ==========================================

// IDs
export type ListingId = string;
export type ListingImageId = number;
export type ListingLikedId = string;
export type ListingApplicationId = number;
export type WatchlistId = number;

// Status
export type ListingStatus = "available" | "rented" | "hidden";
export type ListingApplicationStatus = "submitted" | "accepted" | "rejected";

// Bilder
export type ListingImage = {
  id: ListingImageId;
  imageUrl: UrlString;
  createdAt: TimestampString;
};

// Base Listing
export interface BaseListing extends Coordinates {
  id: ListingId;
  title: string;
  area?: Area | null;
  city?: City | null;
  address?: string | null;
  dwellingType?: string | null;
  rooms?: number | null;
  sizeM2?: number | null;
  rent?: number | null;
  moveIn?: DateString | null;
  applyBy?: DateString | null;
  availableFrom?: DateString | null;
  availableTo?: DateString | null;
  description?: string | null;
  tags?: Tag[] | null;
  status: ListingStatus;
  createdAt: TimestampString;
  updatedAt: TimestampString;
  images?: ListingImage[]; 
}

// Company Listing
export interface CompanyListing extends BaseListing {
  company: User;
}

// Private Listing
export interface PrivateListing extends BaseListing {
  landlord: User;
  applicationCount?: number | null;
}

// Union type
export type Listing = CompanyListing | PrivateListing;

// --- Interaktioner ---

export type StudentLikedListing = {
  id: ListingLikedId;
  listing: Listing;
  studentId: number;
  createdAt: TimestampString;
};

export type ListingApplication = {
  id: ListingApplicationId;
  studentId: number;
  companyListing?: CompanyListing;
  privateListing?: PrivateListing;
  applicationMessage?: string | null;
  status: ListingApplicationStatus;
  createdAt: TimestampString;
  updatedAt: TimestampString;
};

export type StudentSearchWatchlist = {
  id: WatchlistId;
  studentId: number;
  city?: City | null;
  listingType?: "company" | "private" | null;
  minRent?: number | null;
  maxRent?: number | null;
  minRooms?: number | null;
  maxRooms?: number | null;
  createdAt: TimestampString;
};