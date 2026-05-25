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

export type AccountType =
  | "student"
  | "company"
  | "private_landlord"
  | "landlord"
  | "quick_register";

export type UserCompanyLink = {
  id?: CompanyId | string;
  companyId?: CompanyId | string;
  company_id?: CompanyId | string;
  name?: string;
  companyName?: string;
  logoUrl?: UrlString;
  role?: string;
  company?: {
    id?: CompanyId | string;
    name?: string;
    companyName?: string;
    logoUrl?: UrlString;
  } | null;
};

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
  verifiedEmail?: boolean;
  verifiedIdentity?: boolean;
  tags?: Tag[];
  linkedInUrl?: UrlString;
  instagramUrl?: UrlString;
  facebookUrl?: UrlString;
  studyProgram?: string;
  studyPace?: string;
  preferredArea?: string;

  // Student-specifika fält
  firstName?: string;
  surname?: string;
  ssn?: string; // Personnummer
  schoolId?: number;
  school_id?: number;
  schoolName?: string;
  verifiedStudent?: boolean;
  
  // Företag & Hyresvärd
  fullName?: string; // För privat hyresvärd
  companyName?: string; // För företag
  companyId?: CompanyId | string;
  activeCompanyId?: CompanyId | string;
  selectedCompanyId?: CompanyId | string;
  currentCompanyId?: CompanyId | string;
  company?: UserCompanyLink | null;
  companies?: UserCompanyLink[];
  companyIds?: Array<CompanyId | string>;
  companyMemberships?: UserCompanyLink[];
  companyAccounts?: UserCompanyLink[];
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
  accessToken?: string;
  access_token?: string;
  token?: string;
  jwt?: string;
  bearerToken?: string;
  user: User;
}

export interface StudentRegistrationResponse {
  authRef: string;
}

export interface QuickRegisterResponse {
  email: string;
}

export interface GoogleRegisterResponse {
  accessToken?: string;
  token?: string;
  access_token?: string;
  jwt?: string;
  bearerToken?: string;
  firstName?: string;
  surname?: string;
  email: string;
}

export type RegisterResponse =
  | AuthResponse
  | StudentRegistrationResponse
  | QuickRegisterResponse;

export interface GoogleAuthRequest {
  googleIdToken: string;
}

export type FrejaRegisterResponse = StudentRegistrationResponse;
export type FrejaAuthRef = StudentRegistrationResponse;

export type FrejaAuthStatus =
  | "MATCHES"
  | "CLASHING"
  | "DISAPPROVED"
  | "PENDING"
  | "EXPIRED"
  | "CANCELED";

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
  schoolId?: number;
}

export interface QuickRegisterRequest {
  email: string;
  password: string;
}

export interface RegisterStudentRequest {
  firstName: string;
  surname: string;
  email: string;
  schoolId: number;
  city: string;
  ssn: string;
}

export interface UpdateUserRequest {
  email?: string;
  displayName?: string;
  firstName?: string;
  surname?: string;
  phone?: string;
  city?: string;
  schoolName?: string;
  tags?: string[];
  logoUrl?: string;
  bannerUrl?: string;
  linkedInUrl?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  studyProgram?: string;
  studyPace?: string;
  preferredArea?: string;
  aboutText?: string; // Mappas till description för studenter i backend
  description?: string; // För hyresvärdar/företag
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface StartPasswordResetRequest {
  userEmail: string;
}

export interface PasswordResetFinalRequest {
  resetId: string;
  newPassword: string;
}

export interface VerifyEmailRequest {
  email: string;
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
