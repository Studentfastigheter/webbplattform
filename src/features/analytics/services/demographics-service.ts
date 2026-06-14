import {
  apiClient,
  buildQuery,
  pathSegment,
  type ServiceOptions,
} from "@/lib/api/client";
import type { DeviceType, ViewType } from "@/types/common";

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

function companyDemographicsEndpoint(companyId: number, path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `/companies/${pathSegment(companyId)}/demographics${normalizedPath}`;
}

function emptyListingDemographyBatchByCategory(): Record<
  DemographyCategory,
  Record<string, ListingDemography>
> {
  return Object.fromEntries(
    LISTING_DEMOGRAPHY_CATEGORIES.map((category) => [category, {}])
  ) as Record<DemographyCategory, Record<string, ListingDemography>>;
}

function emptyApplicationDemographyBatchByCategory(): Record<
  ApplicationDemographyCategory,
  Record<string, ApplicationDemography>
> {
  return Object.fromEntries(
    APPLICATION_DEMOGRAPHY_CATEGORIES.map((category) => [category, {}])
  ) as Record<
    ApplicationDemographyCategory,
    Record<string, ApplicationDemography>
  >;
}

export const demographicsService = {
  getListing: async (
    listingId: string,
    from: string | Date,
    to: string | Date,
    category: DemographyCategory,
    options?: ServiceOptions
  ): Promise<ListingDemography> => {
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

  getCompanyListing: async (
    companyId: number,
    listingId: string,
    from: string | Date,
    to: string | Date,
    category: DemographyCategory,
    options?: ServiceOptions
  ): Promise<ListingDemography> => {
    return apiClient<ListingDemography>(
      `${companyDemographicsEndpoint(
        companyId,
        `/listings/${pathSegment(listingId)}`
      )}${demographyQuery(from, to, category)}`,
      { signal: options?.signal }
    );
  },

  getCompanyListingByAllCategories: async (
    companyId: number,
    listingId: string,
    from: string | Date,
    to: string | Date,
    options?: ServiceOptions
  ): Promise<Record<DemographyCategory, ListingDemography | null>> => {
    return apiClient<Record<DemographyCategory, ListingDemography | null>>(
      `${companyDemographicsEndpoint(
        companyId,
        `/listings/${pathSegment(listingId)}/all`
      )}${demographyQuery(from, to)}`,
      { signal: options?.signal }
    );
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

  recordCompanyListingView: async (
    companyId: number,
    listingId: string,
    payload: NewListingViewDemographicsRequest
  ): Promise<void> => {
    await apiClient<void>(
      companyDemographicsEndpoint(
        companyId,
        `/listings/${pathSegment(listingId)}/views`
      ),
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
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
      `${companyDemographicsEndpoint(companyId, "/listings/query")}${demographyQuery(
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
    if (listingIds.length === 0) {
      return emptyListingDemographyBatchByCategory();
    }

    return apiClient<Record<DemographyCategory, Record<string, ListingDemography>>>(
      `${companyDemographicsEndpoint(
        companyId,
        "/listings/query/all"
      )}${demographyQuery(from, to)}`,
      {
        method: "POST",
        body: JSON.stringify(listingIds),
        signal: options?.signal,
      }
    );
  },

  getFullCompanyListings: async (
    companyId: number,
    from: string | Date,
    to: string | Date,
    category: DemographyCategory,
    options?: ServiceOptions
  ): Promise<Record<string, ListingDemography>> => {
    return apiClient<Record<string, ListingDemography>>(
      `${companyDemographicsEndpoint(companyId, "/listings")}${demographyQuery(
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
    return apiClient<Record<DemographyCategory, Record<string, ListingDemography>>>(
      `${companyDemographicsEndpoint(companyId, "/listings/all")}${demographyQuery(
        from,
        to
      )}`,
      { signal: options?.signal }
    );
  },

  getCompany: async (
    companyId: number,
    from: string | Date,
    to: string | Date,
    category: CompanyDemographyCategory,
    options?: ServiceOptions
  ): Promise<CompanyDemography> => {
    return apiClient<CompanyDemography>(
      `${companyDemographicsEndpoint(companyId, "/profile")}${demographyQuery(
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
    return apiClient<Record<CompanyDemographyCategory, CompanyDemography | null>>(
      `${companyDemographicsEndpoint(companyId, "/profile/all")}${demographyQuery(
        from,
        to
      )}`,
      { signal: options?.signal }
    );
  },

  recordCompanyView: async (
    companyId: number,
    payload: NewCompanyDemographicsRequest
  ): Promise<void> => {
    await apiClient<void>(
      companyDemographicsEndpoint(companyId, "/profile/views"),
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
  },

  getCompaniesBatch: async (
    companyIds: number[],
    from: string | Date,
    to: string | Date,
    category: CompanyDemographyCategory,
    options?: ServiceOptions
  ): Promise<Record<string, CompanyDemography>> => {
    if (companyIds.length === 1) {
      const companyId = companyIds[0];
      const value = await demographicsService.getCompany(
        companyId,
        from,
        to,
        category,
        options
      );
      return { [String(companyId)]: value };
    }

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
    if (companyIds.length === 0) {
      return Object.fromEntries(
        COMPANY_DEMOGRAPHY_CATEGORIES.map((category) => [category, {}])
      ) as Record<CompanyDemographyCategory, Record<string, CompanyDemography>>;
    }

    if (companyIds.length === 1) {
      const companyId = companyIds[0];
      const allCategories = await demographicsService.getCompanyByAllCategories(
        companyId,
        from,
        to,
        options
      );

      return Object.fromEntries(
        COMPANY_DEMOGRAPHY_CATEGORIES.map((category) => [
          category,
          allCategories[category]
            ? { [String(companyId)]: allCategories[category] as CompanyDemography }
            : {},
        ])
      ) as Record<CompanyDemographyCategory, Record<string, CompanyDemography>>;
    }

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

  getCompanyApplication: async (
    companyId: number,
    listingId: string,
    from: string | Date,
    to: string | Date,
    category: ApplicationDemographyCategory,
    gotListing?: GotListingFilter,
    options?: ServiceOptions
  ): Promise<ApplicationDemography> => {
    return apiClient<ApplicationDemography>(
      `${companyDemographicsEndpoint(
        companyId,
        `/applications/listings/${pathSegment(listingId)}`
      )}${demographyQuery(from, to, category, gotListing)}`,
      { signal: options?.signal }
    );
  },

  getCompanyApplicationByAllCategories: async (
    companyId: number,
    listingId: string,
    from: string | Date,
    to: string | Date,
    gotListing?: GotListingFilter,
    options?: ServiceOptions
  ): Promise<Record<ApplicationDemographyCategory, ApplicationDemography | null>> => {
    return apiClient<
      Record<ApplicationDemographyCategory, ApplicationDemography | null>
    >(
      `${companyDemographicsEndpoint(
        companyId,
        `/applications/listings/${pathSegment(listingId)}/all`
      )}${demographyQuery(from, to, undefined, gotListing)}`,
      { signal: options?.signal }
    );
  },

  getApplication: async (
    listingId: string,
    from: string | Date,
    to: string | Date,
    category: ApplicationDemographyCategory,
    gotListing?: GotListingFilter,
    options?: ServiceOptions
  ): Promise<ApplicationDemography> => {
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
      `${companyDemographicsEndpoint(
        companyId,
        "/applications/listings/query"
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
    if (listingIds.length === 0) {
      return emptyApplicationDemographyBatchByCategory();
    }

    return apiClient<
      Record<ApplicationDemographyCategory, Record<string, ApplicationDemography>>
    >(
      `${companyDemographicsEndpoint(
        companyId,
        "/applications/listings/query/all"
      )}${demographyQuery(from, to, undefined, gotListing)}`,
      {
        method: "POST",
        body: JSON.stringify(listingIds),
        signal: options?.signal,
      }
    );
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
      `${companyDemographicsEndpoint(
        companyId,
        "/applications/listings"
      )}${demographyQuery(from, to, category, gotListing)}`,
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
    return apiClient<
      Record<ApplicationDemographyCategory, Record<string, ApplicationDemography>>
    >(
      `${companyDemographicsEndpoint(
        companyId,
        "/applications/listings/all"
      )}${demographyQuery(from, to, undefined, gotListing)}`,
      { signal: options?.signal }
    );
  },
};
