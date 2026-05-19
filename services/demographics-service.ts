import { apiClient, buildQuery, pathSegment } from "@/lib/api-client";

export type DemographyCategory =
  | "GENDER"
  | "AGE"
  | "CITY"
  | "SCHOOL"
  | "RESULTED_IN_LIKE"
  | "VIEW_TYPE"
  | "DEVICE_TYPE";

export type CompanyDemographyCategory = Exclude<
  DemographyCategory,
  "RESULTED_IN_LIKE"
>;

export const LISTING_DEMOGRAPHY_CATEGORIES = [
  "GENDER",
  "AGE",
  "CITY",
  "SCHOOL",
  "RESULTED_IN_LIKE",
  "VIEW_TYPE",
  "DEVICE_TYPE",
] as const satisfies readonly DemographyCategory[];

export const COMPANY_DEMOGRAPHY_CATEGORIES = [
  "GENDER",
  "AGE",
  "CITY",
  "SCHOOL",
  "VIEW_TYPE",
  "DEVICE_TYPE",
] as const satisfies readonly CompanyDemographyCategory[];

export type DemographicsDeviceType = "MOBILE" | "DESKTOP";
export type DemographicsViewType = "QUICK" | "DETAILED";

export type DemographyBucket = {
  key: unknown;
  totalViews: number;
};

export type ListingDemography = {
  listingId?: string;
  category?: DemographyCategory;
  totalViews?: number;
  from?: string;
  to?: string;
  buckets?: DemographyBucket[];
};

export type CompanyDemography = {
  companyId?: number;
  category?: CompanyDemographyCategory;
  totalViews?: number;
  from?: string;
  to?: string;
  buckets?: DemographyBucket[];
};

export type NewListingViewDemographicsRequest = {
  deviceType: DemographicsDeviceType;
  viewType: DemographicsViewType;
  resultedInLike?: boolean;
};

export type NewCompanyDemographicsRequest = {
  deviceType: DemographicsDeviceType;
  viewType: DemographicsViewType;
};

function dateTimeValue(value: string | Date): string {
  return value instanceof Date ? value.toISOString() : value;
}

function demographyQuery(
  from: string | Date,
  to: string | Date,
  category?: string
) {
  return buildQuery({
    from: dateTimeValue(from),
    to: dateTimeValue(to),
    category,
  });
}

export function getClientDeviceType(): DemographicsDeviceType {
  return typeof window !== "undefined" &&
    window.matchMedia("(max-width: 767px)").matches
    ? "MOBILE"
    : "DESKTOP";
}

export const demographicsService = {
  getListing: async (
    listingId: string,
    from: string | Date,
    to: string | Date,
    category: DemographyCategory
  ): Promise<ListingDemography> => {
    return apiClient<ListingDemography>(
      `/demographics/listing/${pathSegment(listingId)}${demographyQuery(
        from,
        to,
        category
      )}`
    );
  },

  getListingByAllCategories: async (
    listingId: string,
    from: string | Date,
    to: string | Date
  ): Promise<Record<DemographyCategory, ListingDemography | null>> => {
    const entries = await Promise.all(
      LISTING_DEMOGRAPHY_CATEGORIES.map(async (category) => {
        const value = await demographicsService
          .getListing(listingId, from, to, category)
          .catch(() => null);
        return [category, value] as const;
      })
    );

    return Object.fromEntries(entries) as Record<
      DemographyCategory,
      ListingDemography | null
    >;
  },

  recordListingView: async (
    listingId: string,
    payload: NewListingViewDemographicsRequest
  ): Promise<void> => {
    await apiClient<void>(`/demographics/listing/${pathSegment(listingId)}`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  getListingsBatch: async (
    companyId: number,
    listingIds: string[],
    from: string | Date,
    to: string | Date,
    category: DemographyCategory
  ): Promise<Record<string, ListingDemography>> => {
    return apiClient<Record<string, ListingDemography>>(
      `/demographics/listings/query/${pathSegment(companyId)}${demographyQuery(
        from,
        to,
        category
      )}`,
      {
        method: "POST",
        body: JSON.stringify(listingIds),
      }
    );
  },

  getListingsBatchByAllCategories: async (
    companyId: number,
    listingIds: string[],
    from: string | Date,
    to: string | Date
  ): Promise<Record<DemographyCategory, Record<string, ListingDemography>>> => {
    const entries = await Promise.all(
      LISTING_DEMOGRAPHY_CATEGORIES.map(async (category) => {
        const value =
          listingIds.length > 0
            ? await demographicsService
                .getListingsBatch(companyId, listingIds, from, to, category)
                .catch(() => ({}))
            : {};
        return [category, value] as const;
      })
    );

    return Object.fromEntries(entries) as Record<
      DemographyCategory,
      Record<string, ListingDemography>
    >;
  },

  getCompany: async (
    companyId: number,
    from: string | Date,
    to: string | Date,
    category: CompanyDemographyCategory
  ): Promise<CompanyDemography> => {
    return apiClient<CompanyDemography>(
      `/demographics/company/${pathSegment(companyId)}${demographyQuery(
        from,
        to,
        category
      )}`
    );
  },

  getCompanyByAllCategories: async (
    companyId: number,
    from: string | Date,
    to: string | Date
  ): Promise<Record<CompanyDemographyCategory, CompanyDemography | null>> => {
    const entries = await Promise.all(
      COMPANY_DEMOGRAPHY_CATEGORIES.map(async (category) => {
        const value = await demographicsService
          .getCompany(companyId, from, to, category)
          .catch(() => null);
        return [category, value] as const;
      })
    );

    return Object.fromEntries(entries) as Record<
      CompanyDemographyCategory,
      CompanyDemography | null
    >;
  },

  recordCompanyView: async (
    companyId: number,
    payload: NewCompanyDemographicsRequest
  ): Promise<void> => {
    await apiClient<void>(`/demographics/company/${pathSegment(companyId)}`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  getCompaniesBatch: async (
    companyIds: number[],
    from: string | Date,
    to: string | Date,
    category: CompanyDemographyCategory
  ): Promise<Record<string, CompanyDemography>> => {
    return apiClient<Record<string, CompanyDemography>>(
      `/demographics/companies/query${demographyQuery(from, to, category)}`,
      {
        method: "POST",
        body: JSON.stringify(companyIds),
      }
    );
  },

  getCompaniesBatchByAllCategories: async (
    companyIds: number[],
    from: string | Date,
    to: string | Date
  ): Promise<Record<CompanyDemographyCategory, Record<string, CompanyDemography>>> => {
    const entries = await Promise.all(
      COMPANY_DEMOGRAPHY_CATEGORIES.map(async (category) => {
        const value =
          companyIds.length > 0
            ? await demographicsService
                .getCompaniesBatch(companyIds, from, to, category)
                .catch(() => ({}))
            : {};
        return [category, value] as const;
      })
    );

    return Object.fromEntries(entries) as Record<
      CompanyDemographyCategory,
      Record<string, CompanyDemography>
    >;
  },
};
