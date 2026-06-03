import type {
  ApplicationDemographyCategory,
  CompanyDemographyCategory,
  DemographyCategory,
  GotListingFilter,
} from "@/features/analytics/services/demographics-service";
import type { ListingSearchParams } from "@/features/listings/services/listing-service";

/**
 * Single source of truth for every query key in the app.
 *
 * Conventions:
 * - Keys are namespaced by feature, then by intent (list/detail/etc).
 * - Lists with arguments take those arguments as positional params so two
 *   different argument tuples produce two distinct cache entries.
 * - Hierarchy matters: invalidating ["listings"] invalidates every listing
 *   query; invalidating ["listings","detail",id] invalidates only that one.
 *   This is why detail keys nest under the same root as list keys.
 * - Filter params are passed as the raw object — TanStack Query handles
 *   structural equality. Do NOT JSON.stringify here; doing so breaks the
 *   ability to filter by partial key.
 *
 * Helper rule of thumb when invalidating after a mutation:
 *   qc.invalidateQueries({ queryKey: qk.listings.all })
 *     → broad: every listings-* query refetches
 *   qc.invalidateQueries({ queryKey: qk.listings.detail(id) })
 *     → narrow: only that one detail refetches
 */
export const qk = {
  auth: {
    all: ["auth"] as const,
    session: () => ["auth", "session"] as const,
  },

  listings: {
    all: ["listings"] as const,
    lists: () => ["listings", "list"] as const,
    list: (params: ListingSearchParams) =>
      ["listings", "list", params] as const,

    facets: (params: ListingSearchParams) =>
      ["listings", "facets", params] as const,

    // Map view: same data domain as list, but with a much larger page size
    // and multi-page fan-out. Separate slot from list so toggling list↔map
    // doesn't blow away the list cache.
    map: (params: ListingSearchParams) =>
      ["listings", "map", params] as const,

    detail: (id: string) => ["listings", "detail", id] as const,

    requirementsProfile: (id: string) =>
      ["listings", "requirements-profile", id] as const,

    cities: () => ["listings", "cities"] as const,
    tags: () => ["listings", "tags"] as const,

    favorites: () => ["listings", "favorites"] as const,
    myListings: (page: number, size: number) =>
      ["listings", "my", page, size] as const,
    myApplications: () => ["listings", "my-applications"] as const,

    queueListings: (queueId: string, page: number, size: number) =>
      ["listings", "queue", queueId, page, size] as const,

    nearby: (cityOrArea: string | null, size: number) =>
      ["listings", "nearby", cityOrArea, size] as const,
  },

  queues: {
    all: ["queues"] as const,
    list: () => ["queues", "list"] as const,
    my: () => ["queues", "my"] as const,
    byCompany: (companyId: number) =>
      ["queues", "by-company", companyId] as const,
    detail: (queueId: string) => ["queues", "detail", queueId] as const,
    company: (companyId: number) =>
      ["queues", "company", companyId] as const,
    companyApplications: (companyId: number) =>
      ["queues", "company-applications", companyId] as const,
    allCompanyListings: (companyId: number, page: number, size: number) =>
      ["queues", "all-company-listings", companyId, page, size] as const,
    companyListingsPage: (companyId: number, page: number, size: number) =>
      ["queues", "company-listings-page", companyId, page, size] as const,
  },

  companies: {
    all: ["companies"] as const,
    list: () => ["companies", "list"] as const,
    publicProfile: (id: number) => ["companies", "public", id] as const,
    privateProfile: (id: number) => ["companies", "private", id] as const,
    users: (id: number) => ["companies", "users", id] as const,
    viewCounts: (companyId: number, listingId: string) =>
      ["companies", "view-counts", companyId, listingId] as const,
    applicationCounts: (companyId: number, size: number) =>
      ["companies", "application-counts", companyId, size] as const,
    timedApplications: (
      companyId: number,
      from: string,
      to: string,
      listingId: string,
    ) =>
      [
        "companies",
        "timed-applications",
        companyId,
        from,
        to,
        listingId,
      ] as const,
  },

  demographics: {
    all: ["demographics"] as const,

    listing: (
      listingId: string,
      from: string,
      to: string,
      category: DemographyCategory,
    ) =>
      ["demographics", "listing", listingId, from, to, category] as const,

    listingsBatchByAllCategories: (
      companyId: number,
      listingIds: string[],
      from: string,
      to: string,
    ) =>
      [
        "demographics",
        "listings-batch-all-categories",
        companyId,
        listingIds,
        from,
        to,
      ] as const,

    fullCompanyListingsByAllCategories: (
      companyId: number,
      from: string,
      to: string,
    ) =>
      [
        "demographics",
        "full-company-listings-all-categories",
        companyId,
        from,
        to,
      ] as const,

    company: (
      companyId: number,
      from: string,
      to: string,
      category: CompanyDemographyCategory,
    ) =>
      ["demographics", "company", companyId, from, to, category] as const,

    companiesBatchByAllCategories: (
      companyIds: number[],
      from: string,
      to: string,
    ) =>
      [
        "demographics",
        "companies-batch-all-categories",
        companyIds,
        from,
        to,
      ] as const,

    application: (
      listingId: string,
      from: string,
      to: string,
      category: ApplicationDemographyCategory,
      gotListing: GotListingFilter,
    ) =>
      [
        "demographics",
        "application",
        listingId,
        from,
        to,
        category,
        gotListing,
      ] as const,

    applicationsBatch: (
      companyId: number,
      listingIds: string[],
      from: string,
      to: string,
      category: ApplicationDemographyCategory,
      gotListing: GotListingFilter,
    ) =>
      [
        "demographics",
        "applications-batch",
        companyId,
        listingIds,
        from,
        to,
        category,
        gotListing,
      ] as const,
  },

  notifications: {
    all: ["notifications"] as const,
    list: () => ["notifications", "list"] as const,
  },

  schools: {
    all: ["schools"] as const,
    list: (q?: string) => ["schools", "list", q ?? ""] as const,
  },

  media: {
    all: ["media"] as const,
    companyPublic: (companyId: number) =>
      ["media", "company-public", companyId] as const,
  },

  documents: {
    all: ["documents"] as const,
    myInfo: () => ["documents", "my", "info"] as const,
  },

  admin: {
    all: ["admin"] as const,
    tags: () => ["admin", "tags"] as const,
    locationCategories: () => ["admin", "location-categories"] as const,
    activities: () => ["admin", "activities"] as const,
    companyDetail: (companyId: number) =>
      ["admin", "company", companyId] as const,
  },
} as const;
