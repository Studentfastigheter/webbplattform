/**
 * Reference to a city as the API serialises it: a stable code (also the city
 * page URL segment) plus the display name, already localized by the backend
 * from the request's Accept-Language header.
 */
export type CityRef = {
  code: string;
  name: string;
};

export type CityDTO = {
  code?: string | null;
  name?: string | null;
  bannerUrl?: string | null;
  description?: string | null;
};

/** Admin edit view: all language variants explicit (GET /cities/{code}/admin). */
export type CityAdminDTO = {
  code: string;
  nameSv?: string | null;
  nameEn?: string | null;
  descriptionSv?: string | null;
  descriptionEn?: string | null;
  bannerUrl?: string | null;
};

export type CityCompanyDTO = {
  id?: number;
  name?: string | null;
  subtitle?: string | null;
  description?: string | null;
  websiteUrl?: string | null;
  bannerUrl?: string | null;
  logoUrl?: string | null;
};

export type CitySchoolDTO = {
  id?: number;
  name?: string | null;
  lat?: number | null;
  lng?: number | null;
};

export type CityStudentActivityDTO = {
  id?: number;
  name?: string | null;
  category?: string | null;
  lat?: number | null;
  lng?: number | null;
};

export type CityDetailedDTO = CityDTO & {
  companies?: CityCompanyDTO[];
  externalCompanies?: CityCompanyDTO[];
  schools?: CitySchoolDTO[];
  studentActivities?: CityStudentActivityDTO[];
};

export type CreateCityRequest = {
  code: string;
  name?: string | null;
  nameEn?: string | null;
  description?: string | null;
  descriptionEn?: string | null;
  bannerUrl?: string | null;
};

export type ModifyCityRequest = {
  name?: string | null;
  nameEn?: string | null;
  description?: string | null;
  descriptionEn?: string | null;
  bannerUrl?: string | null;
};
