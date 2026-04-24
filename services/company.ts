import { authService } from "@/services/auth-service";
import { apiClient, buildQuery } from "@/lib/api-client";
import { getActiveCompanyId, getActiveCompanySummary } from "@/lib/company-access";

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

export type CompanyPrivateDTO = {
  id: number;
  name: string;
  subtitle?: string | null;
  description?: string | null;
  website?: string | null;
  rating?: number | null;
  verified?: boolean | null;
  bannerUrl?: string | null;
  logoUrl?: string | null;
  email?: string | null;
  phone?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  orgNumber?: string | null;
  organisationNumber?: string | null;
  organizationNumber?: string | null;
  internalContactNote?: string | null;
};

export type NewApplication = {
  applicationId?: number;
  id?: string | number;
  studentId: number,
  firstName: string,
  surname: string,
  address: string,
  listingId?: string | number;
  listingTitle?: string;
  submittedAt?: string;
  createdAt?: string;
};

export type ObjectApplicationCount = {
  listingId: string | number,
  address: string,
  numApplications: number,
};

export type AnalyticalQuantity = {
  period: string;
  absoluteCount?: number;
  amount?: number;
  change?: number;
  changeRate?: number;
  count?: number;
  percentChange?: number;
  quantity?: number;
  relativeChange?: number;
  changePercentage?: number;
  percentageChange?: number;
  rateOfChangePercentage?: number;
  rateOfChange?: number;
  value?: number;
};

export type AnalyticalQuantities = {
  applications?: AnalyticalQuantity[];
  viewings?: AnalyticalQuantity[];
  views?: AnalyticalQuantity[];
  interactions?: AnalyticalQuantity[];
  activeListings?: AnalyticalQuantity[];
  active_listings?: AnalyticalQuantity[];
  activePosts?: AnalyticalQuantity[];
  active_posts?: AnalyticalQuantity[];
};

type ApplicationStatisticEntry = {
  year: number,
  month: number,
  numApplications: number,
};

const defaultGeneralAnalyticsPeriods = ["P7D", "P1M", "P3M", "P1Y"];

export const companyService = {

  myCompany: async (): Promise<CompanyInfo> => {
    const result = await authService.me();
    if (result.accountType === "student") {
      throw new Error("Denna funktion är inte tillgänglig för studenter. Försök att logga in som uthyrare istället.");
    }
    const companyId = getActiveCompanyId(result);
    const companyName = getActiveCompanySummary(result)?.name ?? result.companyName;
    if (companyId === null || !companyName) {
      throw new Error("Oväntat svar från servern.");
    }
    return { userId: companyId, name: companyName };
  },

  privateProfile: async (id: number): Promise<CompanyPrivateDTO> => {
    return apiClient<CompanyPrivateDTO>(`/companies/${id}/private`);
  },

  newApplications: async (
    id: number,
    options: { count?: number; since?: string } = {}
  ): Promise<NewApplication[]> => {
    const query = buildQuery({
      count: options.count ?? 10,
      since: options.since ?? "always",
    });
    const result = await apiClient<NewApplication[] | { content?: NewApplication[] }>(
      `/analytics/${id}/current_applications/new_applications${query}`
    );

    if (Array.isArray(result)) {
      return result;
    }

    return Array.isArray(result?.content) ? result.content : [];
  }, 

  applicationCount: async (id: number): Promise<number> => {
    return apiClient<number>(`/analytics/${id}/current_applications`);
  },
  
  applicationsTimeline: async (id: number): Promise<Timeline> => {
    const entries = await apiClient<ApplicationStatisticEntry[] | { content?: ApplicationStatisticEntry[] }>(`/analytics/${id}/current_applications/trend`);
    const rows = Array.isArray(entries) ? entries : entries?.content ?? [];

    return rows.map(({ year, month, numApplications }) => {
      return {
        timestamp: new Date(year, month - 1, 1),
        value: numApplications,
      };
    });
  },

  applicationCountsPerObject: async (id: number, limit: number = 5): Promise<ObjectApplicationCount[]> => {
    const query = buildQuery({ limit: limit === null ? 5 : limit });
    const result = await apiClient<ObjectApplicationCount[] | { content?: ObjectApplicationCount[] }>(
      `/analytics/${id}/current_applications/by_object${query}`
    );

    if (Array.isArray(result)) {
      return result;
    }

    return Array.isArray(result?.content) ? result.content : [];
  },

  generalAnalytics: async (
    id: number,
    over: string | string[] = defaultGeneralAnalyticsPeriods
  ): Promise<AnalyticalQuantities> => {
    const periods = Array.isArray(over) ? over.join(",") : over;
    const query = buildQuery({ over: periods });

    return apiClient<AnalyticalQuantities>(`/analytics/${id}/general${query}`);
  },
};
