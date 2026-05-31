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
};

export type AdminCompanyPublicDTO = {
  id?: number;
  name?: string;
  subtitle?: string;
  logoUrl?: string;
  housingQueueId?: string;
  privacyUrl?: string;
  termsUrl?: string;
};

export type AdminCreateCompanyRequest = {
  companylDetails: AdminCompanyDetailedDTO;
  credentials?: AdminCompanyCredentialDTO;
};

export type AdminCompanyUserDTO = {
  id?: number;
  companyId?: number;
  role?: AdminCompanyRole;
  firstName?: string;
  surname?: string;
  email?: string;
  phone?: string;
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

export type AdminUserTrendDTO = {
  year?: number;
  month?: number;
  day?: number;
  userCount?: number;
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
