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
  userId: string,
  name: string,
};

export type NewApplication = {
  studentId: string,
  firstName: string,
  surname: string,
  address: string,
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
    return { userId: result?.id.toString(), name: result.companyName as string };
  },

  newApplications: async(id: string): Promise<NewApplication[]> => {
    return await apiClient<NewApplication[]>(`/analytics/${id}/current_applications/new_applications?include=studentId,firstName,surname,address`);
  }, 

  applicationCount: async (id: string): Promise<number> => {
    return apiClient<number>(`/analytics/${id}/current_applications`);
  },
  
  applicationsTimeline: async (id: string): Promise<Timeline> => {
    const entries = await apiClient<ApplicationStatisticEntry[]>(`/analytics/${id}/current_applications/trend`);
    return entries.map(({ year, month, numApplications }) => {
      return {
        timestamp: new Date(year, month, 1),
        value: numApplications,
      };
    });
  },
};
