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

export type AdminCityPayload = Record<string, unknown>;

export type AdminAddSchoolRequest = AddSchoolRequest;
