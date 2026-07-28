import type { CityRef } from "./city";
import type { SystemProvider } from "./common";
import type { AddSchoolRequest } from "./school";

export type AdminListingTagDetailDTO = {
  tag?: string;
  displayName?: string;
  icon?: string;
  tagValues?: string[];
};

export type AdminLocationCategoryDTO = {
  category?: string;
  googleType?: string;
};

export type AdminCompanyRole = {
  name?: string;
  description?: string;
  accessLevel?: number;
};

export type AdminCompanyCredentialDTO = {
  companyName?: string;
  companySystemUrlOrigin?: string;
  propertySystemUsername?: string;
  propertySystemPassword?: string;
  propertySystem?: SystemProvider;
};

export type AdminCompanyDetailedDTO = {
  companyId?: number;
  companyName?: string;
  subtitle?: string;
  logoUrl?: string;
  privacyPolicyUrl?: string;
  termsUrl?: string;
  bannerUrl?: string;
  socialLinks?: Record<string, string>;
  description?: string;
  pictureUrlList?: string[];
  videoUrlList?: string[];
  websiteUrl?: string;
  /** Responses carry {code, nameSv, nameEn} objects; requests may send plain codes. */
  cities?: Array<string | CityRef>;
};

export type AdminCompanyPublicDTO = {
  id?: number;
  name?: string;
  subtitle?: string;
  logoUrl?: string;
  housingQueueId?: string;
  privacyUrl?: string;
  termsUrl?: string;
  cities?: CityRef[];
};

export type AdminCreateCompanyRequest = {
  companylDetails: AdminCompanyDetailedDTO;
  credentials?: AdminCompanyCredentialDTO;
};

export type AdminCreateCompanyUserRequest = {
  companyId?: number;
  firstName: string;
  lastName: string;
  plainTextPassword: string;
  email: string;
  roleName: string;
  city?: string;
};

export type AdminCompanyUserDTO = {
  id?: number;
  companyId?: number;
  role?: AdminCompanyRole;
  firstName?: string;
  surname?: string;
  email?: string;
  phone?: string;
  verified?: boolean;
  bannerUrl?: string;
  logoUrl?: string;
};

export type AdminCreatePOIRequest = {
  category?: string;
  name?: string;
  lat?: number;
  lng?: number;
};

export type AdminModifyPOIRequest = AdminCreatePOIRequest & {
  id?: number;
};

export type AdminPointOfInterestDTO = {
  id?: number;
  name?: string;
  category?: string;
  lat?: number;
  lng?: number;
  googlePlaceId?: string;
  lastFetchedAt?: string;
};

export type AdminTrendPointDTO = {
  /** ISO date (yyyy-MM-dd), UTC day boundaries. */
  date: string;
  count: number;
  cumulative: number;
};

export type AdminCountBucketDTO = {
  key: string;
  count: number;
};

export type AdminOverviewStatsDTO = {
  students: number;
  verifiedStudents: number;
  verifiedStudentRatio: number;
  pendingQuickRegisters: number;
  companies: number;
  listings: number;
  listingsByStatus: AdminCountBucketDTO[];
  applications: number;
};

export type AdminUsersStatsDTO = {
  total: number;
  verified: number;
  registrations: AdminTrendPointDTO[];
};

export type AdminQuickRegisterStatsDTO = {
  pending: number;
  created: AdminTrendPointDTO[];
};

export type AdminListingsStatsDTO = {
  created: AdminTrendPointDTO[];
  byStatus: AdminCountBucketDTO[];
  byCity: AdminCountBucketDTO[];
  bySource: AdminCountBucketDTO[];
};

export type AdminApplicationsStatsDTO = {
  submitted: AdminTrendPointDTO[];
  byStatus: AdminCountBucketDTO[];
  answeredTotal: number;
  answeredGotListing: number;
  gotListingShare: number;
};

export type AdminEngagementStatsDTO = {
  views: AdminTrendPointDTO[];
  likes: AdminTrendPointDTO[];
  watchlists: AdminTrendPointDTO[];
  messages: AdminTrendPointDTO[];
};

export type AdminGeographyStatsDTO = {
  topCityInterests: AdminCountBucketDTO[];
  /** ISO 3166 country codes; "UNKNOWN" for students without a country. */
  studentsPerCountry: AdminCountBucketDTO[];
  genderSplit: AdminCountBucketDTO[];
};

export type AdminWaitlistTrendPointDTO = {
  date: string;
  count: number;
  cumulative: number;
};

export type AdminWaitlistEntryDTO = {
  email: string;
  createdAt: string;
};

export type AdminWaitlistStatsDTO = {
  total: number;
  entries: AdminWaitlistEntryDTO[];
  daily: AdminWaitlistTrendPointDTO[];
  unknownCreatedAtCount?: number;
  storage?: "firestore" | "local";
  generatedAt?: string;
};

/** One row in the admin application list (live or archived/decided). */
export type AdminApplicationRowDTO = {
  /** Numeric for active rows, UUID for archived rows. */
  id: string;
  source: "active" | "archived";
  status: "SUBMITTED" | "UNDER_REVIEW" | "OFFERED" | "ACCEPTED" | "REJECTED";
  appliedAt: string;
  /** Null when the student account has since been deleted. */
  studentId: number | null;
  studentFirstName: string | null;
  studentSurname: string | null;
  studentEmail: string | null;
  /** Null when the listing has since been deleted. */
  listingId: string | null;
  listingTitle: string | null;
  listingCity: string | null;
  ownerType: "COMPANY" | "PRIVATE" | null;
  companyId: number | null;
  ownerName: string | null;
};

export type AdminApplicationListDTO = {
  total: number;
  page: number;
  size: number;
  applications: AdminApplicationRowDTO[];
};

export type AdminApplicationListParams = {
  search?: string;
  source?: "active" | "archived";
  status?: string;
  ownerType?: "COMPANY" | "PRIVATE";
  companyId?: number;
  sort?: "APPLIED_DESC" | "APPLIED_ASC" | "STUDENT_ASC" | "OWNER_ASC";
  page?: number;
  size?: number;
};

/** One row in the admin queue-membership list. */
export type AdminQueueMembershipRowDTO = {
  id: string;
  studentId: number;
  studentFirstName: string | null;
  studentSurname: string | null;
  studentEmail: string;
  queueId: string;
  queueName: string;
  queueCity: string | null;
  companyId: number;
  companyName: string;
  joinedAt: string;
  status: string;
  external: boolean;
};

export type AdminQueueMembershipListDTO = {
  total: number;
  page: number;
  size: number;
  memberships: AdminQueueMembershipRowDTO[];
};

export type AdminQueueMembershipListParams = {
  search?: string;
  companyId?: number;
  status?: string;
  sort?: "JOINED_DESC" | "JOINED_ASC" | "STUDENT_ASC" | "COMPANY_ASC";
  page?: number;
  size?: number;
};

export type AdminCityPayload = Record<string, unknown>;

export type AdminAddSchoolRequest = AddSchoolRequest;
