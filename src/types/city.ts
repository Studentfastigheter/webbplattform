export type CityDTO = {
  city?: string | null;
  bannerUrl?: string | null;
  description?: string | null;
  code?: string | null;
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
  description?: string | null;
  bannerUrl?: string | null;
};

export type ModifyCityRequest = {
  name?: string | null;
  description?: string | null;
  bannerUrl?: string | null;
};
