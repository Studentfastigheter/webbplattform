import { authService } from "@/services/auth-service";
import { apiClient } from "@/lib/api-client";

export type GraphEntry = {
	category: string,
	value: number,
};

export type TimelineEntry = {
	timestamp: Date,
	value: number,
};

export type Timeline = TimelineEntry[];

export type CompanyInfo = {
  userId: number,
  name: string,
};

export type NewApplication = {
  studentId: number,
  firstName: string,
  surname: string,
  address: string,
};

export type ObjectApplicationCount = {
  listingId: number,
  address: string,
  numApplications: number,
};

type ApplicationStatisticEntry = {
  year: number,
  month: number,
  numApplications: number,
};

export const companyService = {

  myCompany: async (): Promise<CompanyInfo> => {
    const result = await authService.me();
    if (result.accountType === "student") {
      throw new Error("Denna funktion är inte tillgänglig för studenter. Försök att logga in som uthyrare istället.");
    }
    if (result.id === null || result.companyName === null) {
      throw new Error("Oväntat svar från servern.");
    }
    return { userId: result?.id, name: result.companyName as string };
  },

  newApplications: async(id: number): Promise<NewApplication[]> => {
    return await apiClient<NewApplication[]>(`/analytics/${id}/current_applications/new_applications?since=always`); // TODO: change to this month
  }, 

  applicationCount: async (id: number): Promise<number> => {
    return apiClient<number>(`/analytics/${id}/current_applications`);
  },
  
  applicationsTimeline: async (id: number): Promise<Timeline> => {
    const entries = await apiClient<ApplicationStatisticEntry[]>(`/analytics/${id}/current_applications/trend`);
    return entries.map(({ year, month, numApplications }) => {
      return {
        timestamp: new Date(year, month, 1),
        value: numApplications,
      };
    });
  },

  applicationCountsPerObject: async (id: number, limit: number = 5): Promise<ObjectApplicationCount[]> => {
    return apiClient<ObjectApplicationCount[]>(`/analytics/${id}/current_applications/by_object?limit=${limit === null ? 5 : limit}`);
  },
};
