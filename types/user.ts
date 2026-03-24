import { City, JsonValue, Tag, TimestampString, UrlString } from "./common";
// Behåll dina importer om du använder dem i relations-typen längst ner
import { School } from "./school";
import { StudentLikedListing, ListingApplication, StudentSearchWatchlist } from "./listing";
import { StudentQueueApplication } from "./queue";

// --- IDs & Typer ---
export type StudentId = number;
export type CompanyId = number;
export type LandlordId = number;
export type AccountId = StudentId | CompanyId | LandlordId;
export type UserId = number; // Gemensamt ID från UserResponse

export type AccountType = "student" | "company" | "private_landlord";

// --- Huvud-interface (Matchar Java UserResponse) ---
export interface User {
  id: UserId;
  email: string;
  accountType: AccountType;
  displayName: string;
  createdAt: TimestampString;
  
  // Gemensamma fält (kan vara null/undefined beroende på roll)
  phone?: string;
  city?: City; // Eller string om du vill förenkla
  logoUrl?: UrlString;
  bannerUrl?: UrlString;
  description?: string;
  verified: boolean;
  tags?: Tag[];

  // Student-specifika fält
  firstName?: string;
  surname?: string;
  ssn?: string; // Personnummer
  schoolId?: number;
  schoolName?: string;
  verifiedStudent?: boolean;
  
  // Företag & Hyresvärd
  fullName?: string; // För privat hyresvärd
  companyName?: string; // För företag
  orgNumber?: string;
  website?: UrlString;
  subtitle?: string;
  rating?: number;
  subscription?: string;
  contactEmail?: string;
  contactPhone?: string;
}

// --- Auth Responses ---
export interface AuthResponse {
  accessToken: string;
  user: User;
}

// --- Requests (Matchar dina Java DTOs) ---

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  accountType: AccountType;
  
  // Fyll i relevanta fält beroende på accountType
  firstName?: string;
  surname?: string;
  fullName?: string;
  companyName?: string;
  phone?: string;
  city?: string;
  ssn?: string; // Personnummer eller Organisationsnummer
}

export interface UpdateUserRequest {
  firstName?: string;
  surname?: string;
  phone?: string;
  city?: string;
  aboutText?: string; // Mappas till description för studenter i backend
  description?: string; // För hyresvärdar/företag
}

// --- Komplexa typer (Behåll denna om du bygger ut objektet på frontend) ---
export type StudentWithRelations = User & {
  school?: School | null;
  likedListings?: StudentLikedListing[];
  listingApplications?: ListingApplication[];
  queueApplications?: StudentQueueApplication[];
  searchWatchlist?: StudentSearchWatchlist[];
  // notifications?: UserNotification[]; // Hanteras ofta separat via context
};