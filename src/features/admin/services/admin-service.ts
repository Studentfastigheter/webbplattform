import {
  ApiError,
  apiClient,
  arrayFromApiResponse,
  buildQuery,
  pathSegment,
  type ServiceOptions,
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
import {
  cityService,
  normalizeCityCode,
  type AreaAliasDTO,
  type CreateAreaAliasRequest,
  type ModifyAreaAliasRequest,
} from "@/features/cities/services/city-service";
import {
  companyService,
  type AnalyticsCountBucket,
  type CreateExternalCompanyPayload,
  type ExternalCompanyDTO,
  type ModifyExternalCompanyRequest,
} from "@/features/companies/services/company-service";
import { queueService } from "@/features/queues/services/queue-service";

export type AdminCompanyListingStatusSource = "analytics-endpoint" | "all-listings";

export type AdminCompanyListingStatusStats = {
  companyId: number;
  buckets: AnalyticsCountBucket[];
  source: AdminCompanyListingStatusSource;
};

function jsonBody(value: unknown) {
  return JSON.stringify(value);
}

function isAuthorizationError(error: unknown) {
  return error instanceof ApiError && (error.status === 401 || error.status === 403);
}

function bucketizeListingStatuses(
  listings: Array<{ status?: string | null }>
): AnalyticsCountBucket[] {
  const counts = new Map<string, number>();

  listings.forEach((listing) => {
    const key = listing.status?.trim().toUpperCase();
    if (!key) return;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  });

  return Array.from(counts, ([key, count]) => ({ key, count })).sort((left, right) => {
    if (right.count !== left.count) return right.count - left.count;
    return left.key.localeCompare(right.key);
  });
}

async function getListingStatusBucketsFromAllListings(
  companyId: number,
  options?: ServiceOptions
): Promise<AnalyticsCountBucket[]> {
  const pageSize = 500;
  const firstPage = await queueService.getAllCompanyListingsPage(companyId, 0, pageSize, options);
  const listings = [...firstPage.content];
  const totalPages = Math.max(1, firstPage.totalPages ?? 1);

  if (totalPages > 1) {
    const remainingPages = await Promise.all(
      Array.from({ length: totalPages - 1 }, (_, index) =>
        queueService.getAllCompanyListingsPage(companyId, index + 1, pageSize, options)
      )
    );
    remainingPages.forEach((page) => listings.push(...page.content));
  }

  return bucketizeListingStatuses(listings);
}

function normalizeSchoolCityPayload(school: AdminAddSchoolRequest): AdminAddSchoolRequest {
  const cityCode = normalizeCityCode(school.cityCode);
  const city = school.city.trim();

  if (!cityCode) {
    throw new Error("Välj en stad innan du sparar skolan.");
  }

  return {
    ...school,
    city: city || cityCode,
    cityCode,
  };
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

  getCityAdmin: async (code: string) => {
    return cityService.getAdmin(code);
  },

  createSchool: async (school: AdminAddSchoolRequest): Promise<void> => {
    await apiClient<void>("/admin/school", {
      method: "POST",
      body: jsonBody(normalizeSchoolCityPayload(school)),
    });
  },

  createSchools: async (schools: AdminAddSchoolRequest[]): Promise<void> => {
    for (const school of schools) {
      await apiClient<void>("/admin/school", {
        method: "POST",
        body: jsonBody(normalizeSchoolCityPayload(school)),
      });
    }
  },

  modifySchool: async (school: AdminAddSchoolRequest): Promise<void> => {
    await apiClient<void>("/admin/school", {
      method: "PUT",
      body: jsonBody(normalizeSchoolCityPayload(school)),
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
    company: CreateExternalCompanyPayload
  ): Promise<void> => {
    await companyService.createExternalCompany(company);
  },

  updateExternalCompany: async (
    company: ModifyExternalCompanyRequest
  ): Promise<void> => {
    await companyService.updateExternalCompany(company);
  },

  getExternalCompaniesAdmin: async () => {
    return companyService.getExternalCompaniesAdmin();
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

  getCompanyListingStatuses: async (
    companyId: number,
    options?: ServiceOptions
  ): Promise<AdminCompanyListingStatusStats> => {
    try {
      return {
        companyId,
        buckets: await companyService.listingStatusCounts(companyId, options),
        source: "analytics-endpoint",
      };
    } catch (error) {
      if (!isAuthorizationError(error)) {
        throw error;
      }

      return {
        companyId,
        buckets: await getListingStatusBucketsFromAllListings(companyId, options),
        source: "all-listings",
      };
    }
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

  deleteCompanyAccount: async (
    companyId: number,
    userId: number
  ): Promise<void> => {
    if (typeof companyId !== "number" || typeof userId !== "number") {
      throw new Error("CompanyId och konto-id krävs för att ta bort ett företagskonto.");
    }

    await apiClient<void>(
      `/companies/${pathSegment(companyId)}/users/${pathSegment(userId)}`,
      {
        method: "DELETE",
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
      `/companies/${pathSegment(companyId)}/refresh-listings`,
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

  // --- Area aliases (CityController, admin-only) ---

  getAreaAliases: async (options?: ServiceOptions): Promise<AreaAliasDTO[]> => {
    return cityService.listAreaAliases(options);
  },

  createAreaAlias: async (
    payload: CreateAreaAliasRequest
  ): Promise<AreaAliasDTO | null> => {
    return cityService.createAreaAlias(payload);
  },

  modifyAreaAlias: async (
    payload: ModifyAreaAliasRequest
  ): Promise<AreaAliasDTO | null> => {
    return cityService.updateAreaAlias(payload);
  },

  deleteAreaAlias: async (
    areaName: string,
    companyId: number
  ): Promise<void> => {
    await cityService.deleteAreaAlias(areaName, companyId);
  },
};
