import { Area, City, Coordinates, DateString, Tag, TimestampString, UrlString } from "./common";
import { CompanyId, LandlordId, StudentId } from "./user";

// IDs
export type ListingId = string; // uuid
export type ListingImageId = number;
export type ListingLikedId = string; // uuid
export type ListingApplicationId = number;
export type WatchlistId = number;

// Enums
export type ListingType = "company" | "private";
export type ListingStatus = "available" | string;
export type AdvertiserType = "company" | "private_landlord";
export type ListingApplicationStatus =
  | "submitted"
  | "shortlisted"
  | "rejected"
  | "accepted";

// Core Listing
export type ListingImage = {
  imageId: ListingImageId;
  listingId: ListingId;
  imageUrl: UrlString;
};

export type BaseListing = Coordinates & {
  listingId: ListingId;
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
  images?: ListingImage[];
  status: ListingStatus;
  createdAt: TimestampString;
  updatedAt: TimestampString;
};

export type CompanyListing = BaseListing & {
  listingType: "company";
  companyId: CompanyId;
};

export type PrivateListing = BaseListing & {
  listingType: "private";
  landlordId: LandlordId;
  applicationCount?: number | null;
};

export type Listing = CompanyListing | PrivateListing;

// Relations & Summaries
export type AdvertiserSummary = {
  type: AdvertiserType;
  id: CompanyId | LandlordId;
  displayName: string;
  logoUrl?: UrlString | null;
  bannerUrl?: UrlString | null;
  phone?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  contactNote?: string | null;
  rating?: number | null;
  subtitle?: string | null;
  description?: string | null;
  website?: UrlString | null;
  city?: City | null;
};

export type ListingWithRelations = Listing & {
  advertiser?: AdvertiserSummary;
};

export type StudentLikedListing = {
  listingLikedId: ListingLikedId;
  listingType: ListingType;
  listingId: ListingId;
  studentId: StudentId;
  createdAt: TimestampString;
};

export type ListingApplication = {
  applicationId: ListingApplicationId;
  studentId: StudentId;
  listingId: ListingId;
  listingType: ListingType;
  applicationMessage?: string | null;
  status: ListingApplicationStatus;
  createdAt: TimestampString;
  updatedAt: TimestampString;
};

export type StudentSearchWatchlist = {
  watchlistId: WatchlistId;
  studentId: StudentId;
  city?: City | null;
  listingType?: ListingType | null;
  minRent?: number | null;
  maxRent?: number | null;
  minRooms?: number | null;
  maxRooms?: number | null;
  createdAt: TimestampString;
};

// Activity & Interest
export type ListingActivity = {
  id: number;
  name: string;
  category: string;
  latitude?: number | null;
  longitude?: number | null;
  distanceKm?: number | null;
};

export type UserInterest = {
  listingId: string;
  title: string | null;
  city: string | null;
  rent: number | null;
  primaryImageUrl: string | null;
  companyName: string | null;
  createdAt: string;
};

export type RollingAd = {
  id?: number | string;
  company?: string;
  data?: unknown;
};