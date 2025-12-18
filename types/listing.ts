import { Area, City, Coordinates, DateString, Tag, TimestampString, UrlString } from "./common";
import { User } from "./user"; // Din nya User-typ

// IDs
export type ListingId = string; // UUID från Java
export type ListingImageId = number;
export type ListingLikedId = string; // UUID
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

// Base Listing (Matchar Java BaseListing MappedSuperclass)
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
  // Bilder hanteras ofta via separat endpoint eller inkluderat om du lade till det i DTO/Model
  images?: ListingImage[]; 
}

// Company Listing (Matchar Java CompanyListing)
export interface CompanyListing extends BaseListing {
  company: User; // Backend skickar hela Company-objektet (som är en User)
}

// Private Listing (Matchar Java PrivateListing)
export interface PrivateListing extends BaseListing {
  landlord: User; // Backend skickar hela PrivateLandlord-objektet
  applicationCount?: number | null;
}

// Union type
export type Listing = CompanyListing | PrivateListing;

// --- Interaktioner ---

export type StudentLikedListing = {
  id: ListingLikedId;
  listing: Listing; // Om du expanderar relationen
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