import {
  apiClient,
  arrayFromApiResponse,
  buildQuery,
} from "@/lib/api/client";
import type {
  AdminAddSchoolRequest,
  AdminCityPayload,
  AdminCompanyUserDTO,
  AdminCreateCompanyRequest,
  AdminCreatePOIRequest,
  AdminListingTagDTO,
  AdminListingTagDetailDTO,
  AdminLocationCategoryDTO,
  AdminModifyPOIRequest,
  AdminPointOfInterestDTO,
  AdminUserTrendDTO,
} from "@/types";

function jsonBody(value: unknown) {
  return JSON.stringify(value);
}

function adminTagQuery(tag: AdminListingTagDetailDTO) {
  return buildQuery({
    tag: tag.tag,
    displayName: tag.displayName,
    icon: tag.icon,
    tagValues: tag.tagValues,
  });
}

export const adminService = {
  getTags: async (): Promise<AdminListingTagDetailDTO[]> => {
    const response = await apiClient<unknown>("/admin/tags");
    return arrayFromApiResponse<AdminListingTagDetailDTO>(response);
  },

  createTag: async (tag: AdminListingTagDTO): Promise<void> => {
    await apiClient<void>("/admin/tag", {
      method: "POST",
      body: jsonBody(tag),
    });
  },

  modifyTag: async (tag: AdminListingTagDetailDTO): Promise<void> => {
    await apiClient<void>(`/admin/tag${adminTagQuery(tag)}`, {
      method: "PUT",
    });
  },

  createSchool: async (school: AdminAddSchoolRequest): Promise<void> => {
    await apiClient<void>("/admin/school", {
      method: "POST",
      body: jsonBody(school),
    });
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

  deleteCompany: async (companyId: number): Promise<void> => {
    await apiClient<void>("/admin/company/delete", {
      method: "PUT",
      body: jsonBody(companyId),
    });
  },

  manageCompanyAccount: async (
    account: AdminCompanyUserDTO
  ): Promise<void> => {
    await apiClient<void>("/admin/company/account", {
      method: "PUT",
      body: jsonBody(account),
    });
  },

  createCity: async (city: AdminCityPayload): Promise<void> => {
    await apiClient<void>("/admin/city", {
      method: "POST",
      body: jsonBody(city),
    });
  },

  modifyCity: async (city: AdminCityPayload): Promise<void> => {
    await apiClient<void>("/admin/city", {
      method: "PUT",
      body: jsonBody(city),
    });
  },

  deleteCity: async (cityId: number): Promise<void> => {
    await apiClient<void>("/admin/city/delete", {
      method: "PUT",
      body: jsonBody(cityId),
    });
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
};
