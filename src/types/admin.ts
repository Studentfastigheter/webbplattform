import type { SystemProvider } from "./common";
import type { AddSchoolRequest } from "./school";

export type AdminListingTagDTO = {
  tagKey?: string;
  displayName?: string;
  icon?: string;
};

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

export type AdminCreateCompanyRequest = {
  companyDate?: AdminCompanyDetailedDTO;
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

export type AdminCityPayload = Record<string, unknown>;

export type AdminAddSchoolRequest = AddSchoolRequest;
