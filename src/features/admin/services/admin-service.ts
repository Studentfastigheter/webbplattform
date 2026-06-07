import {
  apiClient,
  arrayFromApiResponse,
  buildQuery,
  pathSegment,
} from "@/lib/api/client";
import type {
  AdminAddSchoolRequest,
  AdminCompanyDetailedDTO,
  AdminCompanyCredentialDTO,
  AdminCompanyPublicDTO,
  AdminCompanyRole,
  AdminCompanyUserDTO,
  AdminCreateCompanyRequest,
  AdminCreateCompanyUserRequest,
  AdminCreatePOIRequest,
  AdminListingTagDetailDTO,
  AdminLocationCategoryDTO,
  AdminModifyPOIRequest,
  AdminPointOfInterestDTO,
  AdminUserTrendDTO,
  AdminWaitlistStatsDTO,
  CityDTO,
  CityDetailedDTO,
  CreateCityRequest,
  ModifyCityRequest,
  School,
} from "@/types";
import { schoolService } from "@/features/schools/services/school-service";
import { cityService } from "@/features/cities/services/city-service";
import {
  companyService,
  type CreateExternalCompanyRequest,
  type ExternalCompanyDTO,
  type ModifyExternalCompanyRequest,
} from "@/features/companies/services/company-service";

function jsonBody(value: unknown) {
  return JSON.stringify(value);
}

export const adminService = {
  getTags: async (): Promise<AdminListingTagDetailDTO[]> => {
    const response = await apiClient<unknown>("/admin/tags");
    return arrayFromApiResponse<AdminListingTagDetailDTO>(response);
  },

  createTag: async (tag: AdminListingTagDetailDTO): Promise<void> => {
    await apiClient<void>("/admin/tag", {
      method: "POST",
      body: jsonBody(tag),
    });
  },

  modifyTag: async (tag: AdminListingTagDetailDTO): Promise<void> => {
    await apiClient<void>("/admin/tag", {
      method: "PUT",
      body: jsonBody(tag),
    });
  },

  getSchools: async (): Promise<School[]> => {
    return schoolService.list();
  },

  getCities: async (): Promise<string[]> => {
    return cityService.listCodes();
  },

  getCitySummaries: async (): Promise<CityDTO[]> => {
    return cityService.list();
  },

  getCity: async (code: string): Promise<CityDetailedDTO> => {
    return cityService.get(code);
  },

  createSchool: async (school: AdminAddSchoolRequest): Promise<void> => {
    await apiClient<void>("/admin/school", {
      method: "POST",
      body: jsonBody(school),
    });
  },

  createSchools: async (schools: AdminAddSchoolRequest[]): Promise<void> => {
    for (const school of schools) {
      await apiClient<void>("/admin/school", {
        method: "POST",
        body: jsonBody(school),
      });
    }
  },

  modifySchool: async (school: AdminAddSchoolRequest): Promise<void> => {
    await apiClient<void>("/admin/school", {
      method: "PUT",
      body: jsonBody(school),
    });
  },

  getLocationCategories: async (): Promise<AdminLocationCategoryDTO[]> => {
    const response = await apiClient<unknown>("/admin/location-categories");
    return arrayFromApiResponse<AdminLocationCategoryDTO>(response);
  },

  addLocationCategory: async (
    category: AdminLocationCategoryDTO
  ): Promise<void> => {
    await apiClient<void>("/admin/location-category", {
      method: "POST",
      body: jsonBody(category),
    });
  },

  modifyLocationCategory: async (
    category: AdminLocationCategoryDTO
  ): Promise<void> => {
    await apiClient<void>("/admin/location-category", {
      method: "PUT",
      body: jsonBody(category),
    });
  },

  createCompany: async (
    company: AdminCreateCompanyRequest
  ): Promise<void> => {
    await apiClient<void>("/admin/company", {
      method: "POST",
      body: jsonBody(company),
    });
  },

  modifyCompany: async (
    company: AdminCreateCompanyRequest
  ): Promise<void> => {
    await apiClient<void>("/admin/company", {
      method: "PUT",
      body: jsonBody(company),
    });
  },

  createExternalCompany: async (
    company: CreateExternalCompanyRequest
  ): Promise<void> => {
    await companyService.createExternalCompany(company);
  },

  updateExternalCompany: async (
    company: ModifyExternalCompanyRequest
  ): Promise<void> => {
    await companyService.updateExternalCompany(company);
  },

  getExternalCompanies: async (): Promise<ExternalCompanyDTO[]> => {
    return companyService.getExternalCompanies();
  },

  deleteExternalCompany: async (companyId: number): Promise<void> => {
    await companyService.deleteExternalCompany(companyId);
  },

  getCompanies: async (): Promise<AdminCompanyPublicDTO[]> => {
    const response = await apiClient<unknown>("/companies", { auth: false });
    return arrayFromApiResponse<AdminCompanyPublicDTO>(response);
  },

  getCompany: async (companyId: number): Promise<AdminCompanyDetailedDTO> => {
    return apiClient<AdminCompanyDetailedDTO>(`/companies/${companyId}`, {
      auth: false,
    });
  },

  getCompanyRoles: async (): Promise<AdminCompanyRole[]> => {
    const response = await apiClient<unknown>("/companies/roles", {
      auth: false,
    });
    return arrayFromApiResponse<AdminCompanyRole>(response);
  },

  getCompanyUsers: async (companyId: number): Promise<AdminCompanyUserDTO[]> => {
    const response = await apiClient<unknown>(
      `/companies/${pathSegment(companyId)}/users`
    );
    return arrayFromApiResponse<AdminCompanyUserDTO>(response);
  },

  deleteCompany: async (companyId: number): Promise<void> => {
    await apiClient<void>("/admin/company/delete", {
      method: "PUT",
      body: jsonBody(companyId),
    });
  },

  manageCompanyAccount: async (
    account: AdminCompanyUserDTO
  ): Promise<void> => {
    if (typeof account.companyId !== "number" || typeof account.id !== "number") {
      throw new Error("CompanyId och konto-id krävs för att uppdatera ett företagskonto.");
    }

    await apiClient<void>(
      `/companies/${pathSegment(account.companyId)}/users/${pathSegment(account.id)}`,
      {
        method: "PUT",
        body: jsonBody(account),
      }
    );
  },

  verifyCompanyAccount: async (
    companyId: number,
    userId: number
  ): Promise<void> => {
    await apiClient<void>(
      `/companies/${pathSegment(companyId)}/verify/${pathSegment(userId)}`,
      {
        method: "PUT",
      }
    );
  },

  createCompanyAdmin: async (
    companyId: number,
    account: AdminCreateCompanyUserRequest
  ): Promise<void> => {
    await apiClient<void>(
      `/admin/company/${pathSegment(companyId)}/create-admin`,
      {
        method: "POST",
        body: jsonBody({
          ...account,
          companyId,
        }),
      }
    );
  },

  refreshCompanyListings: async (companyId: number): Promise<void> => {
    await apiClient<void>(
      `/admin/company/${pathSegment(companyId)}/refresh-listings`,
      {
        method: "POST",
      }
    );
  },

  updateCompanyCredentials: async (
    companyId: number,
    credentials: AdminCompanyCredentialDTO
  ): Promise<void> => {
    await apiClient<void>(
      `/admin/company/${pathSegment(companyId)}/credentials`,
      {
        method: "POST",
        body: jsonBody(credentials),
      }
    );
  },

  createCity: async (city: CreateCityRequest): Promise<void> => {
    await cityService.create(city);
  },

  modifyCity: async (
    code: string,
    city: ModifyCityRequest
  ): Promise<void> => {
    await cityService.update(code, city);
  },

  deleteCity: async (code: string): Promise<void> => {
    await cityService.delete(code);
  },

  getActivities: async (): Promise<AdminPointOfInterestDTO[]> => {
    const response = await apiClient<unknown>("/admin/activities");
    return arrayFromApiResponse<AdminPointOfInterestDTO>(response);
  },

  createActivity: async (activity: AdminCreatePOIRequest): Promise<void> => {
    await apiClient<void>("/admin/activity", {
      method: "POST",
      body: jsonBody(activity),
    });
  },

  modifyActivity: async (activity: AdminModifyPOIRequest): Promise<void> => {
    await apiClient<void>("/admin/activity", {
      method: "PUT",
      body: jsonBody(activity),
    });
  },

  deleteActivity: async (activityId: number): Promise<void> => {
    await apiClient<void>("/admin/activity/delete", {
      method: "PUT",
      body: jsonBody(activityId),
    });
  },

  getUserStatistics: async (
    options: { from?: string | Date; to?: string | Date } = {}
  ): Promise<AdminUserTrendDTO[]> => {
    const response = await apiClient<unknown>(
      `/admin/statistics/users${buildQuery({
        from: options.from instanceof Date ? options.from.toISOString() : options.from,
        to: options.to instanceof Date ? options.to.toISOString() : options.to,
      })}`
    );

    return arrayFromApiResponse<AdminUserTrendDTO>(response);
  },

  getWaitlistStats: async (): Promise<AdminWaitlistStatsDTO> => {
    return apiClient<AdminWaitlistStatsDTO>("/admin/waitlist");
  },
};
