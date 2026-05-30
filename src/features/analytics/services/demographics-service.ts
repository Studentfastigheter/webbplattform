import { apiClient, buildQuery, pathSegment } from "@/lib/api/client";
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

  getFullCompanyListings: async (
    companyId: number,
    from: string | Date,
    to: string | Date,
    category: DemographyCategory
  ): Promise<Record<string, ListingDemography>> => {
    return apiClient<Record<string, ListingDemography>>(
      `/demographics/company/${pathSegment(companyId)}/listings${demographyQuery(
        from,
        to,
        category
      )}`
    );
  },

  getFullCompanyListingsByAllCategories: async (
    companyId: number,
    from: string | Date,
    to: string | Date
  ): Promise<Record<DemographyCategory, Record<string, ListingDemography>>> => {
    const entries = await Promise.all(
      LISTING_DEMOGRAPHY_CATEGORIES.map(async (category) => {
        const value = await demographicsService
          .getFullCompanyListings(companyId, from, to, category)
          .catch(() => ({}));
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

  getApplication: async (
    listingId: string,
    from: string | Date,
    to: string | Date,
    category: ApplicationDemographyCategory,
    gotListing?: GotListingFilter
  ): Promise<ApplicationDemography> => {
    return apiClient<ApplicationDemography>(
      `/demographics/applications/listing/${pathSegment(
        listingId
      )}${demographyQuery(from, to, category, gotListing)}`
    ).catch((err) => {
      console.warn("Falling back to dummy data for getApplication:", err);
      return getMockApplicationDemography(listingId, category, gotListing, from, to);
    });
  },

  getApplicationByAllCategories: async (
    listingId: string,
    from: string | Date,
    to: string | Date,
    gotListing?: GotListingFilter
  ): Promise<Record<ApplicationDemographyCategory, ApplicationDemography | null>> => {
    const entries = await Promise.all(
      APPLICATION_DEMOGRAPHY_CATEGORIES.map(async (category) => {
        const value = await demographicsService
          .getApplication(listingId, from, to, category, gotListing)
          .catch(() => null);
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
    gotListing?: GotListingFilter
  ): Promise<Record<string, ApplicationDemography>> => {
    return apiClient<Record<string, ApplicationDemography>>(
      `/demographics/applications/listings/query/${pathSegment(
        companyId
      )}${demographyQuery(from, to, category, gotListing)}`,
      {
        method: "POST",
        body: JSON.stringify(listingIds),
      }
    ).catch((err) => {
      console.warn("Falling back to dummy data for getApplicationsBatch:", err);
      const result: Record<string, ApplicationDemography> = {};
      listingIds.forEach((id) => {
        result[id] = getMockApplicationDemography(id, category, gotListing, from, to);
      });
      return result;
    });
  },

  getApplicationsBatchByAllCategories: async (
    companyId: number,
    listingIds: string[],
    from: string | Date,
    to: string | Date,
    gotListing?: GotListingFilter
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
                  gotListing
                )
                .catch(() => ({}))
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
    gotListing?: GotListingFilter
  ): Promise<Record<string, ApplicationDemography>> => {
    return apiClient<Record<string, ApplicationDemography>>(
      `/demographics/applications/company/${pathSegment(
        companyId
      )}/listings${demographyQuery(from, to, category, gotListing)}`
    ).catch((err) => {
      console.warn("Falling back to dummy data for getFullCompanyListingsApplications:", err);
      const mockIds = [
        "d3b07384-d113-49cd-a5d6-84dec414fa9e",
        "e4c07384-e113-49cd-a5d6-84dec414fa9f",
        "f5d07384-f113-49cd-a5d6-84dec414fa90"
      ];
      const result: Record<string, ApplicationDemography> = {};
      mockIds.forEach((id) => {
        result[id] = getMockApplicationDemography(id, category, gotListing, from, to);
      });
      return result;
    });
  },

  getFullCompanyListingsApplicationsByAllCategories: async (
    companyId: number,
    from: string | Date,
    to: string | Date,
    gotListing?: GotListingFilter
  ): Promise<
    Record<ApplicationDemographyCategory, Record<string, ApplicationDemography>>
  > => {
    const entries = await Promise.all(
      APPLICATION_DEMOGRAPHY_CATEGORIES.map(async (category) => {
        const value = await demographicsService
          .getFullCompanyListingsApplications(
            companyId,
            from,
            to,
            category,
            gotListing
          )
          .catch(() => ({}));
        return [category, value] as const;
      })
    );

    return Object.fromEntries(entries) as Record<
      ApplicationDemographyCategory,
      Record<string, ApplicationDemography>
    >;
  },
};

function getMockApplicationDemography(
  listingId: string,
  category: ApplicationDemographyCategory,
  gotListing?: GotListingFilter,
  from?: string | Date,
  to?: string | Date
): ApplicationDemography {
  let seed = 0;
  const str = listingId + category + (gotListing || "");
  for (let i = 0; i < str.length; i++) {
    seed = (seed * 31 + str.charCodeAt(i)) & 0xffffffff;
  }
  const random = () => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };

  const generateBuckets = () => {
    switch (category) {
      case "GOT_LISTING": {
        const accepted = Math.floor(random() * 15) + 5;
        const rejected = Math.floor(random() * 30) + 10;
        if (gotListing === "ACCEPTED_ONLY") {
          return [{ key: "true", totalApplications: accepted }];
        }
        if (gotListing === "REJECTED_ONLY") {
          return [{ key: "false", totalApplications: rejected }];
        }
        return [
          { key: "true", totalApplications: accepted },
          { key: "false", totalApplications: rejected },
        ];
      }
      case "GENDER":
        return [
          { key: "MALE", totalApplications: Math.floor(random() * 20) + 5 },
          { key: "FEMALE", totalApplications: Math.floor(random() * 25) + 8 },
          { key: "OTHER", totalApplications: Math.floor(random() * 5) + 1 },
        ];
      case "AGE":
        return [
          { key: "18-20", totalApplications: Math.floor(random() * 15) + 2 },
          { key: "21-25", totalApplications: Math.floor(random() * 30) + 10 },
          { key: "26-30", totalApplications: Math.floor(random() * 10) + 3 },
          { key: "31+", totalApplications: Math.floor(random() * 5) + 1 },
        ];
      case "SCHOOL":
        return [
          { key: "Chalmers", totalApplications: Math.floor(random() * 25) + 5 },
          { key: "Göteborgs universitet", totalApplications: Math.floor(random() * 20) + 4 },
          { key: "Högskolan i Halmstad", totalApplications: Math.floor(random() * 10) + 1 },
        ];
      case "PREFERRED_MAX_RENT":
        return [
          { key: "4000", totalApplications: Math.floor(random() * 15) + 3 },
          { key: "6000", totalApplications: Math.floor(random() * 25) + 5 },
          { key: "8000", totalApplications: Math.floor(random() * 10) + 2 },
          { key: "10000", totalApplications: Math.floor(random() * 5) + 1 },
        ];
      case "DAYS_IN_QUEUE":
        return [
          { key: "30", totalApplications: Math.floor(random() * 10) + 2 },
          { key: "90", totalApplications: Math.floor(random() * 15) + 4 },
          { key: "180", totalApplications: Math.floor(random() * 20) + 5 },
          { key: "365", totalApplications: Math.floor(random() * 12) + 3 },
          { key: "730", totalApplications: Math.floor(random() * 6) + 1 },
        ];
      case "APPLICANT_OTHER_APPLICATIONS":
        return [
          { key: "0", totalApplications: Math.floor(random() * 15) + 5 },
          { key: "1", totalApplications: Math.floor(random() * 20) + 4 },
          { key: "2", totalApplications: Math.floor(random() * 10) + 2 },
          { key: "3+", totalApplications: Math.floor(random() * 8) + 1 },
        ];
      default:
        return [];
    }
  };

  const buckets = generateBuckets();
  const total = buckets.reduce((sum, b) => sum + b.totalApplications, 0);

  return {
    listingId,
    category,
    totalApplications: total,
    from: from instanceof Date ? from.toISOString() : from,
    to: to instanceof Date ? to.toISOString() : to,
    buckets,
  };
}
