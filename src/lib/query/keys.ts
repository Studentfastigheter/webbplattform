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
    requirementsProfilesByCompany: (companyId: number) =>
      ["listings", "requirements-profiles", "company", companyId] as const,

    cities: () => ["listings", "cities"] as const,
    tags: () => ["listings", "tags"] as const,

    favorites: (studentId?: string | number | null) =>
      ["listings", "favorites", studentId ?? "anonymous"] as const,
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
    companyListingsPageByCompany: (companyId: number) =>
      ["queues", "company-listings-page", companyId] as const,
    allCompanyListingsByCompany: (companyId: number) =>
      ["queues", "all-company-listings", companyId] as const,
  },

  companies: {
    all: ["companies"] as const,
    list: () => ["companies", "list"] as const,
    publicProfile: (id: number) => ["companies", "public", id] as const,
    privateProfile: (id: number) => ["companies", "private", id] as const,
    users: (id: number) => ["companies", "users", id] as const,
    platforms: () => ["companies", "platforms"] as const,
    roles: () => ["companies", "roles"] as const,
    viewCounts: (companyId: number, listingId: string) =>
      ["companies", "view-counts", companyId, listingId] as const,
    viewCountsByCompany: (companyId: number) =>
      ["companies", "view-counts", companyId] as const,
    applicationCounts: (companyId: number, size: number) =>
      ["companies", "application-counts", companyId, size] as const,
    applicationsByCompany: (companyId: number) =>
      ["companies", "applications", companyId] as const,
    applications: (companyId: number, pageSize: number, maxPages: number) =>
      ["companies", "applications", companyId, pageSize, maxPages] as const,
    analyticsOverview: (
      companyId: number,
      from: string,
      to: string,
      granularity: string,
      limit: number,
    ) =>
      [
        "companies",
        "analytics-overview",
        companyId,
        from,
        to,
        granularity,
        limit,
      ] as const,
    analyticsDashboard: (
      companyId: number,
      from: string,
      to: string,
      granularity: string,
      limit: number,
    ) =>
      [
        "companies",
        "analytics-dashboard",
        companyId,
        from,
        to,
        granularity,
        limit,
      ] as const,
    analyticsDashboardByCompany: (companyId: number) =>
      ["companies", "analytics-dashboard", companyId] as const,
    analyticsFunnel: (companyId: number, from: string, to: string) =>
      ["companies", "analytics-funnel", companyId, from, to] as const,
    analyticsFunnelByCompany: (companyId: number) =>
      ["companies", "analytics-funnel", companyId] as const,
    listingPerformance: (
      companyId: number,
      from: string,
      to: string,
      sortBy: string,
      limit: number,
    ) =>
      [
        "companies",
        "listing-performance",
        companyId,
        from,
        to,
        sortBy,
        limit,
      ] as const,
    listingPerformanceByCompany: (companyId: number) =>
      ["companies", "listing-performance", companyId] as const,
    listingPerformanceDetail: (
      companyId: number,
      listingId: string,
      from: string,
      to: string,
    ) =>
      [
        "companies",
        "listing-performance-detail",
        companyId,
        listingId,
        from,
        to,
      ] as const,
    listingStatuses: (companyId: number) =>
      ["companies", "listing-statuses", companyId] as const,
    applicationStatuses: (companyId: number, from: string, to: string) =>
      ["companies", "application-statuses", companyId, from, to] as const,
    applicationStatusesByCompany: (companyId: number) =>
      ["companies", "application-statuses", companyId] as const,
    applicationOutcomes: (companyId: number, from: string, to: string) =>
      ["companies", "application-outcomes", companyId, from, to] as const,
    applicationOutcomesByCompany: (companyId: number) =>
      ["companies", "application-outcomes", companyId] as const,
    applicationsTimeline: (companyId: number) =>
      ["companies", "applications-timeline", companyId] as const,
    timedApplicationsTotal: (companyId: number, from: string, to: string) =>
      ["companies", "timed-applications-total", companyId, from, to] as const,
    queueApplicationCount: (companyId: number) =>
      ["companies", "queue-application-count", companyId] as const,
    queueApplicationsTrend: (
      companyId: number,
      from: string,
      to: string,
      granularity: string,
    ) =>
      [
        "companies",
        "queue-applications-trend",
        companyId,
        from,
        to,
        granularity,
      ] as const,
    overviewTrend: (
      companyId: number,
      from: string,
      to: string,
      granularity: string,
    ) =>
      [
        "companies",
        "overview-trend",
        companyId,
        from,
        to,
        granularity,
      ] as const,
    overviewTrendByCompany: (companyId: number) =>
      ["companies", "overview-trend", companyId] as const,
    generalAnalytics: (companyId: number) =>
      ["companies", "general-analytics", companyId] as const,
    residentAnalytics: (companyId: number) =>
      ["companies", "resident-analytics", companyId] as const,
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
      companyId: number,
      listingId: string,
      from: string,
      to: string,
      category: DemographyCategory,
    ) =>
      [
        "demographics",
        "listing",
        companyId,
        listingId,
        from,
        to,
        category,
      ] as const,

    listingByAllCategories: (
      companyId: number,
      listingId: string,
      from: string,
      to: string,
    ) =>
      [
        "demographics",
        "listing-all-categories",
        companyId,
        listingId,
        from,
        to,
      ] as const,

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
      companyId: number,
      listingId: string,
      from: string,
      to: string,
      category: ApplicationDemographyCategory,
      gotListing: GotListingFilter,
    ) =>
      [
        "demographics",
        "application",
        companyId,
        listingId,
        from,
        to,
        category,
        gotListing,
      ] as const,

    applicationByAllCategories: (
      companyId: number,
      listingId: string,
      from: string,
      to: string,
      gotListing: GotListingFilter,
    ) =>
      [
        "demographics",
        "application-all-categories",
        companyId,
        listingId,
        from,
        to,
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

  // Admin namespace. The admin tools page mounts several sections in
  // parallel; sharing keys with the public-facing portal queries would be
  // wrong because the admin endpoints return richer DTOs. Keep them
  // namespaced.
  admin: {
    all: ["admin"] as const,
    tags: () => ["admin", "tags"] as const,
    schools: () => ["admin", "schools"] as const,
    cityNames: () => ["admin", "city-names"] as const,
    citySummaries: () => ["admin", "city-summaries"] as const,
    cityDetail: (code: string) => ["admin", "city-detail", code] as const,
    locationCategories: () => ["admin", "location-categories"] as const,
    activities: () => ["admin", "activities"] as const,
    companies: () => ["admin", "companies"] as const,
    companyDetail: (companyId: number) =>
      ["admin", "company", companyId] as const,
    companyRoles: () => ["admin", "company-roles"] as const,
    companyUsers: (companyId: number) =>
      ["admin", "company-users", companyId] as const,
    companyListingStatuses: (companyId: number) =>
      ["admin", "company-listing-statuses", companyId] as const,
    externalCompanies: () => ["admin", "external-companies"] as const,
    userStatistics: (from?: string, to?: string) =>
      ["admin", "user-statistics", from ?? "", to ?? ""] as const,
    waitlistStats: () => ["admin", "waitlist-stats"] as const,
  },

  // City detail (the working_main rename). Keyed on the normalized city code
  // so two different display spellings ("Göteborg" / "Goteborg") collapse to
  // the same cache entry.
  cities: {
    all: ["cities"] as const,
    list: () => ["cities", "list"] as const,
    detail: (code: string) => ["cities", "detail", code] as const,
  },

  // Rolling marketing ads. Public, low-churn — single cache entry.
  ads: {
    all: ["ads"] as const,
    current: () => ["ads", "current"] as const,
  },
} as const;
