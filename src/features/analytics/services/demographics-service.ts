import {
  apiClient,
  buildQuery,
  pathSegment,
  type ServiceOptions,
} from "@/lib/api/client";
import type { DeviceType, ViewType } from "@/types/common";
import {
  dummyApplicationDemography,
  dummyListingDemography,
  isDummyListingId,
} from "@/features/analytics/data/listing-analytics-dummy";

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

export type ApplicationDemographyCategory =
  | "GENDER"
  | "AGE"
  | "SCHOOL"
  | "PREFERRED_MAX_RENT"
  | "DAYS_IN_QUEUE"
  | "APPLICANT_OTHER_APPLICATIONS"
  | "GOT_LISTING";

export type GotListingFilter = "ACCEPTED_ONLY" | "REJECTED_ONLY" | "BOTH";

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

export const APPLICATION_DEMOGRAPHY_CATEGORIES = [
  "GENDER",
  "AGE",
  "SCHOOL",
  "PREFERRED_MAX_RENT",
  "DAYS_IN_QUEUE",
  "APPLICANT_OTHER_APPLICATIONS",
  "GOT_LISTING",
] as const satisfies readonly ApplicationDemographyCategory[];

export type DemographicsDeviceType = DeviceType;
export type DemographicsViewType = ViewType;

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

export type ApplicationDemographyBucket = {
  key: unknown;
  totalApplications: number;
};

export type ApplicationDemography = {
  listingId?: string;
  category?: ApplicationDemographyCategory;
  totalApplications?: number;
  from?: string;
  to?: string;
  buckets?: ApplicationDemographyBucket[];
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
  category?: string,
  gotListing?: GotListingFilter
) {
  return buildQuery({
    from: dateTimeValue(from),
    to: dateTimeValue(to),
    category,
    gotListing,
  });
}

export function getClientDeviceType(): DemographicsDeviceType {
  return typeof window !== "undefined" &&
    window.matchMedia("(max-width: 767px)").matches
    ? "MOBILE"
    : "DESKTOP";
}

export function canRecordDemographicsForUser(
  user: { accountType?: string | null } | null | undefined
) {
  return user?.accountType === "student";
}

export function ignoreDemographicsRecordError() {
  // Demographics writes are best-effort telemetry and must not interrupt browsing.
}

/**
 * For accepted/rejected filters we approximate the slice — the fixture only
 * ships the "BOTH" totals, so this keeps the proportions visible without
 * inventing buckets that don't exist for the real backend shape.
 */
function scaleApplicationDemographyForFilter(
  source: ApplicationDemography,
  filter: GotListingFilter | undefined
): ApplicationDemography {
  if (!filter || filter === "BOTH") return source;
  const factor = filter === "ACCEPTED_ONLY" ? 0.14 : 0.86;
  const scaledBuckets = (source.buckets ?? []).map((bucket) => ({
    ...bucket,
    totalApplications: Math.max(1, Math.round(bucket.totalApplications * factor)),
  }));
  return {
    ...source,
    totalApplications: scaledBuckets.reduce(
      (sum, bucket) => sum + bucket.totalApplications,
      0
    ),
    buckets: scaledBuckets,
  };
}

export const demographicsService = {
  getListing: async (
    listingId: string,
    from: string | Date,
    to: string | Date,
    category: DemographyCategory,
    options?: ServiceOptions
  ): Promise<ListingDemography> => {
    // Demo fixture intercept — see `listing-analytics-dummy.ts`.
    if (isDummyListingId(listingId)) {
      const fixture = dummyListingDemography[category];
      if (fixture) return fixture;
    }

    return apiClient<ListingDemography>(
      `/demographics/listing/${pathSegment(listingId)}${demographyQuery(
        from,
        to,
        category
      )}`,
      { signal: options?.signal }
    );
  },

  getListingByAllCategories: async (
    listingId: string,
    from: string | Date,
    to: string | Date,
    options?: ServiceOptions
  ): Promise<Record<DemographyCategory, ListingDemography | null>> => {
    // Demo fixture intercept — short-circuit the parallel fan-out below.
    if (isDummyListingId(listingId)) {
      return dummyListingDemography;
    }

    const entries = await Promise.all(
      LISTING_DEMOGRAPHY_CATEGORIES.map(async (category) => {
        const value = await demographicsService.getListing(
          listingId,
          from,
          to,
          category,
          options
        );
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
    category: DemographyCategory,
    options?: ServiceOptions
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
        signal: options?.signal,
      }
    );
  },

  getListingsBatchByAllCategories: async (
    companyId: number,
    listingIds: string[],
    from: string | Date,
    to: string | Date,
    options?: ServiceOptions
  ): Promise<Record<DemographyCategory, Record<string, ListingDemography>>> => {
    const entries = await Promise.all(
      LISTING_DEMOGRAPHY_CATEGORIES.map(async (category) => {
        const value =
          listingIds.length > 0
            ? await demographicsService.getListingsBatch(
                companyId,
                listingIds,
                from,
                to,
                category,
                options
              )
            : {};
        return [category, value] as const;
      })
    );

    return Object.fromEntries(entries) as Record<
      DemographyCategory,
      Record<string, ListingDemography>
    >;
  },

  getFullCompanyListings: async (
    companyId: number,
    from: string | Date,
    to: string | Date,
    category: DemographyCategory,
    options?: ServiceOptions
  ): Promise<Record<string, ListingDemography>> => {
    return apiClient<Record<string, ListingDemography>>(
      `/demographics/company/${pathSegment(companyId)}/listings${demographyQuery(
        from,
        to,
        category
      )}`,
      { signal: options?.signal }
    );
  },

  getFullCompanyListingsByAllCategories: async (
    companyId: number,
    from: string | Date,
    to: string | Date,
    options?: ServiceOptions
  ): Promise<Record<DemographyCategory, Record<string, ListingDemography>>> => {
    const entries = await Promise.all(
      LISTING_DEMOGRAPHY_CATEGORIES.map(async (category) => {
        const value = await demographicsService.getFullCompanyListings(
          companyId,
          from,
          to,
          category,
          options
        );
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
    category: CompanyDemographyCategory,
    options?: ServiceOptions
  ): Promise<CompanyDemography> => {
    return apiClient<CompanyDemography>(
      `/demographics/company/${pathSegment(companyId)}${demographyQuery(
        from,
        to,
        category
      )}`,
      { signal: options?.signal }
    );
  },

  getCompanyByAllCategories: async (
    companyId: number,
    from: string | Date,
    to: string | Date,
    options?: ServiceOptions
  ): Promise<Record<CompanyDemographyCategory, CompanyDemography | null>> => {
    const entries = await Promise.all(
      COMPANY_DEMOGRAPHY_CATEGORIES.map(async (category) => {
        const value = await demographicsService.getCompany(
          companyId,
          from,
          to,
          category,
          options
        );
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
    category: CompanyDemographyCategory,
    options?: ServiceOptions
  ): Promise<Record<string, CompanyDemography>> => {
    return apiClient<Record<string, CompanyDemography>>(
      `/demographics/companies/query${demographyQuery(from, to, category)}`,
      {
        method: "POST",
        body: JSON.stringify(companyIds),
        signal: options?.signal,
      }
    );
  },

  getCompaniesBatchByAllCategories: async (
    companyIds: number[],
    from: string | Date,
    to: string | Date,
    options?: ServiceOptions
  ): Promise<Record<CompanyDemographyCategory, Record<string, CompanyDemography>>> => {
    const entries = await Promise.all(
      COMPANY_DEMOGRAPHY_CATEGORIES.map(async (category) => {
        const value =
          companyIds.length > 0
            ? await demographicsService.getCompaniesBatch(
                companyIds,
                from,
                to,
                category,
                options
              )
            : {};
        return [category, value] as const;
      })
    );

    return Object.fromEntries(entries) as Record<
      CompanyDemographyCategory,
      Record<string, CompanyDemography>
    >;
  },

  getApplication: async (
    listingId: string,
    from: string | Date,
    to: string | Date,
    category: ApplicationDemographyCategory,
    gotListing?: GotListingFilter,
    options?: ServiceOptions
  ): Promise<ApplicationDemography> => {
    // Demo fixture intercept — see `listing-analytics-dummy.ts`.
    if (isDummyListingId(listingId)) {
      const fixture = dummyApplicationDemography[category];
      if (fixture) {
        return scaleApplicationDemographyForFilter(fixture, gotListing);
      }
    }

    return apiClient<ApplicationDemography>(
      `/demographics/applications/listing/${pathSegment(
        listingId
      )}${demographyQuery(from, to, category, gotListing)}`,
      { signal: options?.signal }
    );
  },

  getApplicationByAllCategories: async (
    listingId: string,
    from: string | Date,
    to: string | Date,
    gotListing?: GotListingFilter,
    options?: ServiceOptions
  ): Promise<Record<ApplicationDemographyCategory, ApplicationDemography | null>> => {
    const entries = await Promise.all(
      APPLICATION_DEMOGRAPHY_CATEGORIES.map(async (category) => {
        const value = await demographicsService.getApplication(
          listingId,
          from,
          to,
          category,
          gotListing,
          options
        );
        return [category, value] as const;
      })
    );

    return Object.fromEntries(entries) as Record<
      ApplicationDemographyCategory,
      ApplicationDemography | null
    >;
  },

  getApplicationsBatch: async (
    companyId: number,
    listingIds: string[],
    from: string | Date,
    to: string | Date,
    category: ApplicationDemographyCategory,
    gotListing?: GotListingFilter,
    options?: ServiceOptions
  ): Promise<Record<string, ApplicationDemography>> => {
    return apiClient<Record<string, ApplicationDemography>>(
      `/demographics/applications/listings/query/${pathSegment(
        companyId
      )}${demographyQuery(from, to, category, gotListing)}`,
      {
        method: "POST",
        body: JSON.stringify(listingIds),
        signal: options?.signal,
      }
    );
  },

  getApplicationsBatchByAllCategories: async (
    companyId: number,
    listingIds: string[],
    from: string | Date,
    to: string | Date,
    gotListing?: GotListingFilter,
    options?: ServiceOptions
  ): Promise<
    Record<ApplicationDemographyCategory, Record<string, ApplicationDemography>>
  > => {
    const entries = await Promise.all(
      APPLICATION_DEMOGRAPHY_CATEGORIES.map(async (category) => {
        const value =
          listingIds.length > 0
            ? await demographicsService
                .getApplicationsBatch(
                  companyId,
                  listingIds,
                  from,
                to,
                category,
                gotListing,
                options
              )
            : {};
        return [category, value] as const;
      })
    );

    return Object.fromEntries(entries) as Record<
      ApplicationDemographyCategory,
      Record<string, ApplicationDemography>
    >;
  },

  getFullCompanyListingsApplications: async (
    companyId: number,
    from: string | Date,
    to: string | Date,
    category: ApplicationDemographyCategory,
    gotListing?: GotListingFilter,
    options?: ServiceOptions
  ): Promise<Record<string, ApplicationDemography>> => {
    return apiClient<Record<string, ApplicationDemography>>(
      `/demographics/applications/company/${pathSegment(
        companyId
      )}/listings${demographyQuery(from, to, category, gotListing)}`,
      { signal: options?.signal }
    );
  },

  getFullCompanyListingsApplicationsByAllCategories: async (
    companyId: number,
    from: string | Date,
    to: string | Date,
    gotListing?: GotListingFilter,
    options?: ServiceOptions
  ): Promise<
    Record<ApplicationDemographyCategory, Record<string, ApplicationDemography>>
  > => {
    const entries = await Promise.all(
      APPLICATION_DEMOGRAPHY_CATEGORIES.map(async (category) => {
        const value = await demographicsService.getFullCompanyListingsApplications(
          companyId,
          from,
          to,
          category,
          gotListing,
          options
        );
        return [category, value] as const;
      })
    );

    return Object.fromEntries(entries) as Record<
      ApplicationDemographyCategory,
      Record<string, ApplicationDemography>
    >;
  },
};
