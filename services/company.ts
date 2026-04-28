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
  likes?: AnalyticalQuantity[];
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toNumber(value: unknown, fallback = 0) {
  const numberValue =
    typeof value === "string" ? Number(value.replace(",", ".")) : Number(value);

  return Number.isFinite(numberValue) ? numberValue : fallback;
}

function toArray<T>(value: unknown, includeSingleObject = false): T[] {
  if (Array.isArray(value)) {
    return value as T[];
  }

  if (isRecord(value)) {
    if (Array.isArray(value.content)) {
      return value.content as T[];
    }

    if (Array.isArray(value.items)) {
      return value.items as T[];
    }

    if (Array.isArray(value.data)) {
      return value.data as T[];
    }

    if (includeSingleObject && Object.keys(value).length > 0) {
      return [value as T];
    }
  }

  return [];
}

function normalizeAnalyticalQuantity(value: unknown): AnalyticalQuantity | null {
  if (!isRecord(value)) {
    return null;
  }

  return {
    period: typeof value.period === "string" ? value.period : "",
    count: toNumber(value.count),
    percentChange: toNumber(value.percentChange),
  };
}

function normalizeAnalyticalQuantities(value: unknown): AnalyticalQuantities {
  if (!isRecord(value)) {
    return {};
  }

  const currentApplications = toNumber(value.currentApplications, Number.NaN);
  const totalApplications = toNumber(value.totalApplications, Number.NaN);
  const viewings = toNumber(value.viewings, Number.NaN);
  const likes = toNumber(value.likes, Number.NaN);
  const currentListings = toNumber(value.currentListings, Number.NaN);
  const hasSwaggerShape = [
    currentApplications,
    totalApplications,
    viewings,
    likes,
    currentListings,
  ].some(Number.isFinite);

  if (hasSwaggerShape) {
    const quantity = (period: string, count: number): AnalyticalQuantity => ({
      period,
      count: Number.isFinite(count) ? count : 0,
      percentChange: 0,
    });

    const periods = defaultGeneralAnalyticsPeriods;
    const applicationCount = Number.isFinite(totalApplications)
      ? totalApplications
      : currentApplications;
    const applicationQuantities = periods.map((period) =>
      quantity(period, applicationCount)
    );
    const viewingQuantities = periods.map((period) => quantity(period, viewings));
    const likesQuantities = periods.map((period) => quantity(period, likes));
    const activeListingQuantities = periods.map((period) =>
      quantity(period, currentListings)
    );

    return {
      applications: applicationQuantities,
      viewings: viewingQuantities,
      views: viewingQuantities,
      likes: likesQuantities,
      interactions: likesQuantities,
      activeListings: activeListingQuantities,
      active_listings: activeListingQuantities,
      activePosts: activeListingQuantities,
      active_posts: activeListingQuantities,
    };
  }

  return {
    applications: toArray<unknown>(value.applications)
      .map(normalizeAnalyticalQuantity)
      .filter((item): item is AnalyticalQuantity => item !== null),
    viewings: toArray<unknown>(value.viewings)
      .map(normalizeAnalyticalQuantity)
      .filter((item): item is AnalyticalQuantity => item !== null),
    likes: toArray<unknown>(value.likes)
      .map(normalizeAnalyticalQuantity)
      .filter((item): item is AnalyticalQuantity => item !== null),
    interactions: toArray<unknown>(value.interactions)
      .map(normalizeAnalyticalQuantity)
      .filter((item): item is AnalyticalQuantity => item !== null),
    activeListings: toArray<unknown>(value.activeListings)
      .map(normalizeAnalyticalQuantity)
      .filter((item): item is AnalyticalQuantity => item !== null),
  };
}

function normalizeApplicationTrendEntry(value: unknown): ApplicationStatisticEntry | null {
  if (!isRecord(value)) {
    return null;
  }

  const year = toNumber(value.year, Number.NaN);
  const month = toNumber(value.month, Number.NaN);

  if (!Number.isInteger(year) || !Number.isInteger(month)) {
    return null;
  }

  return {
    year,
    month,
    numApplications: toNumber(value.numApplications),
  };
}

function normalizeObjectApplicationCount(value: unknown): ObjectApplicationCount | null {
  if (!isRecord(value)) {
    return null;
  }

  const listingId = value.listingId;

  return {
    listingId:
      typeof listingId === "string" || typeof listingId === "number"
        ? listingId
        : String(listingId ?? ""),
    address: typeof value.address === "string" ? value.address : "",
    numApplications: toNumber(value.numApplications),
  };
}

function normalizeNewApplication(value: unknown): NewApplication | null {
  if (!isRecord(value)) {
    return null;
  }

  const listing = isRecord(value.listing) ? value.listing : null;
  const student = isRecord(value.student) ? value.student : null;
  const listingSummary = isRecord(value.listingSummary) ? value.listingSummary : null;
  const studentSummary = isRecord(value.studentSummary) ? value.studentSummary : null;
  const id = value.applicationId ?? value.id;
  const studentId = value.studentId ?? student?.id ?? studentSummary?.id;

  return {
    applicationId:
      typeof id === "number" ? id : Number.isFinite(Number(id)) ? Number(id) : undefined,
    id: typeof id === "string" || typeof id === "number" ? id : undefined,
    studentId: Number.isFinite(Number(studentId)) ? Number(studentId) : 0,
    firstName:
      typeof value.firstName === "string"
        ? value.firstName
        : typeof student?.firstName === "string"
          ? student.firstName
          : typeof studentSummary?.firstName === "string"
            ? studentSummary.firstName
            : "",
    surname:
      typeof value.surname === "string"
        ? value.surname
        : typeof student?.surname === "string"
          ? student.surname
          : typeof studentSummary?.surname === "string"
            ? studentSummary.surname
            : "",
    address:
      typeof value.address === "string"
        ? value.address
        : typeof listing?.fullAddress === "string"
          ? listing.fullAddress
          : typeof listing?.address === "string"
            ? listing.address
            : "",
    listingId:
      typeof value.listingId === "string" || typeof value.listingId === "number"
        ? value.listingId
        : typeof listing?.id === "string" || typeof listing?.id === "number"
          ? listing.id
          : undefined,
    listingTitle:
      typeof value.listingTitle === "string"
        ? value.listingTitle
        : typeof listing?.title === "string"
          ? listing.title
          : typeof listingSummary?.title === "string"
            ? listingSummary.title
            : undefined,
    submittedAt:
      typeof value.submittedAt === "string"
        ? value.submittedAt
        : typeof value.appliedAt === "string"
          ? value.appliedAt
          : undefined,
    createdAt: typeof value.createdAt === "string" ? value.createdAt : undefined,
  };
}

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
      page: 0,
      size: options.count ?? 10,
    });
    const result = await apiClient<unknown>(`/applications${query}`);

    return toArray<unknown>(result, true)
      .map(normalizeNewApplication)
      .filter((application): application is NewApplication => application !== null);
  }, 

  applicationCount: async (id: number): Promise<number> => {
    const result = await apiClient<unknown>(`/analytics/${id}/general`);

    if (isRecord(result)) {
      return toNumber(result.currentApplications);
    }

    return toNumber(result);
  },
  
  applicationsTimeline: async (id: number): Promise<Timeline> => {
    const entries = await apiClient<unknown>(`/analytics/${id}/current_applications/trend`);
    const rows = toArray<unknown>(entries, true)
      .map(normalizeApplicationTrendEntry)
      .filter((entry): entry is ApplicationStatisticEntry => entry !== null);

    return rows.map(({ year, month, numApplications }) => {
      return {
        timestamp: new Date(year, month - 1, 1),
        value: numApplications,
      };
    });
  },

  applicationCountsPerObject: async (id: number, limit: number = 5): Promise<ObjectApplicationCount[]> => {
    const query = buildQuery({ limit: limit === null ? 5 : limit });
    const result = await apiClient<unknown>(
      `/analytics/${id}/current_applications/by_object${query}`
    );

    return toArray<unknown>(result, true)
      .map(normalizeObjectApplicationCount)
      .filter((entry): entry is ObjectApplicationCount => entry !== null);
  },

  generalAnalytics: async (
    id: number,
    over: string | string[] = defaultGeneralAnalyticsPeriods
  ): Promise<AnalyticalQuantities> => {
    const periods = Array.isArray(over) ? over.join(",") : over;
    const query = buildQuery({ over: periods });

    const result = await apiClient<unknown>(`/analytics/${id}/general${query}`);

    return normalizeAnalyticalQuantities(result);
  },
};
