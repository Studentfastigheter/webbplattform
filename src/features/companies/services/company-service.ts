import { authService } from "@/features/auth/services/auth-service";
import {
  apiClient,
  arrayFromApiResponse,
  buildQuery,
  pathSegment,
  type ServiceOptions,
} from "@/lib/api/client";
import { getActiveCompanyId, getActiveCompanySummary } from "@/lib/company-access";
import type { SystemProvider } from "@/types/common";

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
  privacyPolicyUrl?: string | null;
  termsUrl?: string | null;
  rating?: number | null;
  verified?: boolean | null;
  bannerUrl?: string | null;
  logoUrl?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  contactNote?: string | null;
  orgNumber?: string | null;
  cities?: string[];
  pictureUrlList?: string[];
  videoUrlList?: string[];
  socialLinks?: Record<string, string>;
  systemProvider?: SystemProvider | string | null;
};

export type CompanyPublicDTO = {
  id: number;
  name: string;
  companyId?: number;
  companyName?: string;
  subtitle?: string | null;
  description?: string | null;
  website?: string | null;
  companyUrl?: string | null;
  websiteUrl?: string | null;
  rating?: number | null;
  verified?: boolean | null;
  bannerUrl?: string | null;
  logoUrl?: string | null;
  housingQueueId?: string | null;
  privacyUrl?: string | null;
  privacyPolicyUrl?: string | null;
  termsUrl?: string | null;
  cities?: string[];
  schools?: ResidentSchool[];
  pictureUrlList?: string[];
  videoUrlList?: string[];
  socialLinks?: Record<string, string>;
};

export type CompanyListParams = {
  city?: string | null;
};

export type CreateExternalCompanyRequest = {
  name: string;
  description?: string | null;
  logoUrl?: string | null;
  websiteUrl?: string | null;
  cityCodes?: string[];
  schoolIds?: number[];
};

export type ModifyExternalCompanyRequest = {
  id: number;
  name?: string | null;
  description?: string | null;
  logoUrl?: string | null;
  websiteUrl?: string | null;
  cities?: string[];
};

export type ExternalCompanyDTO = {
  id: number;
  name: string;
  description?: string | null;
  logoUrl?: string | null;
  websiteUrl?: string | null;
  cityCodes?: string[];
  schoolIds?: number[];
};

export type CompanyRole = {
  name?: string;
  description?: string;
  accessLevel?: number;
};

export type SocialPlatform = {
  platform?: string;
};

export type CompanyUserDTO = {
  id: number;
  companyId: number;
  role?: CompanyRole | null;
  firstName?: string | null;
  surname?: string | null;
  email?: string | null;
  phone?: string | null;
  verified?: boolean | null;
  bannerUrl?: string | null;
  logoUrl?: string | null;
};

export type CompanyUserCreateRequest = {
  email: string;
  password: string;
  firstName?: string | null;
  surname?: string | null;
  phone?: string | null;
  city?: string | null;
  roleName?: string | null;
};

export type CompanyUserUpdateRequest = {
  firstName?: string | null;
  surname?: string | null;
  phone?: string | null;
  roleName?: string | null;
  bannerUrl?: string | null;
  logoUrl?: string | null;
};

export type CompanyChangeableDataDTO = {
  logoUrl?: string | null;
  bannerUrl?: string | null;
  companyDescription?: string | null;
  phone?: string | null;
  contactEmail?: string | null;
  companyUrl?: string | null;
  subtitle?: string | null;
  privacyPolicyUrl?: string | null;
  termsUrl?: string | null;
  websiteUrl?: string | null;
  pictureUrlList?: string[];
  videoUrlList?: string[];
  socialLinks?: Record<string, string>;
};

export type CompanyImageTarget = "logo" | "banner";

export type ModifyImageFileSupportedFormat = {
  mediaType: string;
  supportedExtensions: string[];
};

export type ModifyImageFileResult = {
  url?: string;
};

export type ResidentTrendEntry = {
  year: number;
  month: number;
  day: number;
  numResidents: number;
};

export type ResidentSchool = {
  id?: number;
  name?: string;
  city?: string;
  lat?: number;
  lng?: number;
};

export type ResidentsSchoolCount = {
  school?: ResidentSchool | null;
  residents: number;
};

export type ResidentsTownCount = {
  town: string;
  residents: number;
};

export type ResidentAnalyticsData = {
  residentTrend: ResidentTrendEntry[];
  residentSchools: ResidentsSchoolCount[];
  residentTowns: ResidentsTownCount[];
};

export type CompanyPortalAnalyticsOverview = {
  summary: AnalyticalQuantities;
  trend: CompanyOverviewTrendEntry[];
  residents: ResidentAnalyticsData;
  applicationsByListing: ObjectApplicationCount[];
  queueApplicationCount: number;
  generatedAt?: string;
};

export type AnalyticsCountBucket = {
  key: string;
  count: number;
};

export type CompanyAnalyticsFunnel = {
  from?: string;
  to?: string;
  companyProfileViews: number;
  listingQuickViews: number;
  listingDetailedViews: number;
  listingTotalViews: number;
  listingLikes: number;
  viewEventsResultingInLike: number;
  queueApplications: number;
  listingApplications: number;
  resolvedApplications: number;
  acceptedApplications: number;
  rejectedApplications: number;
  detailedViewRate: number;
  applicationConversionRate: number;
  acceptanceRate: number;
  likeRate: number;
};

export type ListingAnalyticsPerformance = {
  listingId: string;
  title?: string;
  address?: string;
  city?: string;
  area?: string;
  dwellingType?: string;
  status?: string;
  rent?: number;
  rooms?: number;
  sizeM2?: number;
  availableFrom?: string;
  applyBy?: string;
  createdAt?: string;
  lifetimeQuickViews: number;
  lifetimeDetailedViews: number;
  lifetimeTotalViews: number;
  periodQuickViews: number;
  periodDetailedViews: number;
  periodTotalViews: number;
  periodViewEventsResultingInLike: number;
  lifetimeLikes: number;
  periodLikes: number;
  currentApplications: number;
  periodApplications: number;
  periodAcceptedApplications: number;
  periodRejectedApplications: number;
  periodDetailedViewRate: number;
  periodApplicationConversionRate: number;
  periodLikeRate: number;
};

export type ListingPerformanceSort =
  | "periodTotalViews"
  | "periodDetailedViews"
  | "periodApplications"
  | "periodLikes"
  | "conversionRate"
  | "likeRate"
  | "currentApplications"
  | "lifetimeTotalViews"
  | "lifetimeQuickViews"
  | "lifetimeDetailedViews"
  | "periodAcceptedApplications"
  | "periodRejectedApplications";

export type CompanyPortalAnalyticsDashboard = {
  overview: CompanyPortalAnalyticsOverview;
  funnel: CompanyAnalyticsFunnel;
  listingStatuses: AnalyticsCountBucket[];
  applicationStatuses: AnalyticsCountBucket[];
  applicationOutcomes: AnalyticsCountBucket[];
  topListings: ListingAnalyticsPerformance[];
  generatedAt?: string;
};

export type NewApplication = {
  applicationId?: number;
  id?: string | number;
  studentId: number;
  firstName: string;
  surname: string;
  studentEmail?: string;
  studentCity?: string;
  studentSchool?: string;
  studentProgram?: string;
  address: string;
  listingId?: string | number;
  listingTitle?: string;
  listingCity?: string;
  listingRent?: number;
  listingImage?: string;
  listingDwellingType?: string;
  listingRooms?: number;
  listingSizeM2?: number;
  status?: ApplicationStatus;
  message?: string;
  submittedAt?: string;
  createdAt?: string;
};

export type ObjectApplicationCount = {
  listingId: string | number,
  address: string,
  numApplications: number,
};

export type ListingViewCounts = {
  quickViews: number;
  detailedViews: number;
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
  quickViews?: AnalyticalQuantity[];
  detailedViews?: AnalyticalQuantity[];
  likes?: AnalyticalQuantity[];
  interactions?: AnalyticalQuantity[];
  activeListings?: AnalyticalQuantity[];
  active_listings?: AnalyticalQuantity[];
  activePosts?: AnalyticalQuantity[];
  active_posts?: AnalyticalQuantity[];
};

export type ApplicationStatisticEntry = {
  day?: number,
  year: number,
  month: number,
  numApplications: number,
};

export type QueueApplicationTrendGranularity = "day" | "week" | "month";

export type QueueApplicationTrendEntry = {
  periodStart: string;
  periodEnd: string;
  granularity: QueueApplicationTrendGranularity;
  numApplications: number;
};

export type CompanyOverviewTrendGranularity = QueueApplicationTrendGranularity;

export type CompanyOverviewTrendEntry = {
  periodStart: string;
  periodEnd: string;
  granularity: CompanyOverviewTrendGranularity;
  companyProfileViews: number;
  queueApplications: number;
  listingApplications: number;
};

export const APPLICATION_STATUS_VALUES = [
  "SUBMITTED",
  "UNDER_REVIEW",
  "ACCEPTED",
  "OFFERED",
  "REJECTED",
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUS_VALUES)[number];

export type HandleCompanyApplicationRequest = {
  applicationId: number;
  studentId: number;
  newStatus: ApplicationStatus;
};

const defaultGeneralAnalyticsPeriods = ["P7D", "P1M", "P3M", "P1Y"];
const systemProviderValues = [
  "HOGIA",
  "PIGELLO",
  "DEMO",
  "MOMENTUM",
  "FAST2",
  "HOGIA_LANDLORD",
] as const satisfies readonly SystemProvider[];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toNumber(value: unknown, fallback = 0) {
  const numberValue =
    typeof value === "string" ? Number(value.replace(",", ".")) : Number(value);

  return Number.isFinite(numberValue) ? numberValue : fallback;
}

function firstString(...values: unknown[]): string | undefined {
  return values.find(
    (value): value is string => typeof value === "string" && value.trim().length > 0
  )?.trim();
}

function normalizeSystemProvider(value: unknown): SystemProvider | string | null {
  const provider = firstString(value);
  if (!provider) {
    return null;
  }

  const normalized = provider.toUpperCase();
  return systemProviderValues.includes(normalized as SystemProvider)
    ? (normalized as SystemProvider)
    : provider;
}

function firstNumber(...values: unknown[]): number | undefined {
  for (const value of values) {
    const numberValue =
      typeof value === "string" ? Number(value.replace(",", ".")) : Number(value);

    if (Number.isFinite(numberValue)) {
      return numberValue;
    }
  }

  return undefined;
}

function normalizeApplicationStatus(value: unknown): ApplicationStatus | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.trim().replace(/[-\s]+/g, "_").toUpperCase();
  if (!normalized) {
    return undefined;
  }

  const aliasMap: Record<string, ApplicationStatus> = {
    SUBMITTED: "SUBMITTED",
    UNDER_REVIEW: "UNDER_REVIEW",
    ACCEPTED: "ACCEPTED",
    OFFERED: "OFFERED",
    REJECTED: "REJECTED",
  };

  return aliasMap[normalized];
}

function readPath(source: Record<string, unknown> | null, path: string): unknown {
  const parts = path.split(".");
  let current: unknown = source;

  for (const part of parts) {
    if (!isRecord(current)) {
      return undefined;
    }

    current = current[part];
  }

  return current;
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

function normalizeStringRecord(value: unknown): Record<string, string> | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const entries = Object.entries(value)
    .map(([key, entryValue]) => [
      key,
      typeof entryValue === "string" ? entryValue : undefined,
    ] as const)
    .filter((entry): entry is readonly [string, string] => entry[1] !== undefined);

  return entries.length > 0 ? Object.fromEntries(entries) : undefined;
}

function normalizeSocialPlatform(value: unknown): SocialPlatform | null {
  if (!isRecord(value)) {
    return null;
  }

  const platform = firstString(value.platform);

  return platform ? { platform } : null;
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
  const quickViews = toNumber(value.quickViews, Number.NaN);
  const detailedViews = toNumber(value.detailedViews, Number.NaN);
  const viewings = toNumber(
    value.viewings ?? value.views,
    Number.isFinite(quickViews) || Number.isFinite(detailedViews)
      ? (Number.isFinite(quickViews) ? quickViews : 0) +
          (Number.isFinite(detailedViews) ? detailedViews : 0)
      : Number.NaN
  );
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
    const quickViewQuantities = periods.map((period) => quantity(period, quickViews));
    const detailedViewQuantities = periods.map((period) =>
      quantity(period, detailedViews)
    );
    const likesQuantities = periods.map((period) => quantity(period, likes));
    const activeListingQuantities = periods.map((period) =>
      quantity(period, currentListings)
    );

    return {
      applications: applicationQuantities,
      viewings: viewingQuantities,
      views: viewingQuantities,
      quickViews: quickViewQuantities,
      detailedViews: detailedViewQuantities,
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
    views: toArray<unknown>(value.views)
      .map(normalizeAnalyticalQuantity)
      .filter((item): item is AnalyticalQuantity => item !== null),
    quickViews: toArray<unknown>(value.quickViews)
      .map(normalizeAnalyticalQuantity)
      .filter((item): item is AnalyticalQuantity => item !== null),
    detailedViews: toArray<unknown>(value.detailedViews)
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
    day: Number.isInteger(toNumber(value.day, Number.NaN))
      ? toNumber(value.day)
      : undefined,
    year,
    month,
    numApplications: toNumber(value.numApplications),
  };
}

function normalizeQueueApplicationTrendEntry(value: unknown): QueueApplicationTrendEntry | null {
  if (!isRecord(value)) {
    return null;
  }

  const periodStart = firstString(value.periodStart);
  const periodEnd = firstString(value.periodEnd);
  const rawGranularity = firstString(value.granularity)?.toLowerCase();
  const granularity: QueueApplicationTrendGranularity =
    rawGranularity === "week" || rawGranularity === "month"
      ? rawGranularity
      : "day";

  if (!periodStart || !periodEnd) {
    return null;
  }

  return {
    periodStart,
    periodEnd,
    granularity,
    numApplications: toNumber(value.numApplications ?? value.count),
  };
}

function normalizeCompanyOverviewTrendEntry(value: unknown): CompanyOverviewTrendEntry | null {
  if (!isRecord(value)) {
    return null;
  }

  const periodStart = firstString(value.periodStart);
  const periodEnd = firstString(value.periodEnd);
  const rawGranularity = firstString(value.granularity)?.toLowerCase();
  const granularity: CompanyOverviewTrendGranularity =
    rawGranularity === "week" || rawGranularity === "month"
      ? rawGranularity
      : "day";

  if (!periodStart || !periodEnd) {
    return null;
  }

  return {
    periodStart,
    periodEnd,
    granularity,
    companyProfileViews: toNumber(value.companyProfileViews ?? value.profileViews),
    queueApplications: toNumber(value.queueApplications),
    listingApplications: toNumber(
      value.listingApplications ?? value.applications ?? value.totalApplications
    ),
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

function normalizeAnalyticsCountBucket(value: unknown): AnalyticsCountBucket | null {
  if (!isRecord(value)) {
    return null;
  }

  const key = firstString(value.key, value.status, value.name, value.label);

  if (!key) {
    return null;
  }

  return {
    key,
    count: toNumber(value.count ?? value.total ?? value.value),
  };
}

function normalizeAnalyticsCountBuckets(value: unknown): AnalyticsCountBucket[] {
  return toArray<unknown>(value, true)
    .map(normalizeAnalyticsCountBucket)
    .filter((entry): entry is AnalyticsCountBucket => entry !== null);
}

function normalizeCompanyAnalyticsFunnel(value: unknown): CompanyAnalyticsFunnel {
  const source = isRecord(value) ? value : {};

  return {
    from: firstString(source.from),
    to: firstString(source.to),
    companyProfileViews: toNumber(source.companyProfileViews),
    listingQuickViews: toNumber(source.listingQuickViews),
    listingDetailedViews: toNumber(source.listingDetailedViews),
    listingTotalViews: toNumber(source.listingTotalViews),
    listingLikes: toNumber(source.listingLikes),
    viewEventsResultingInLike: toNumber(source.viewEventsResultingInLike),
    queueApplications: toNumber(source.queueApplications),
    listingApplications: toNumber(source.listingApplications),
    resolvedApplications: toNumber(source.resolvedApplications),
    acceptedApplications: toNumber(source.acceptedApplications),
    rejectedApplications: toNumber(source.rejectedApplications),
    detailedViewRate: toNumber(source.detailedViewRate),
    applicationConversionRate: toNumber(source.applicationConversionRate),
    acceptanceRate: toNumber(source.acceptanceRate),
    likeRate: toNumber(source.likeRate),
  };
}

function normalizeListingAnalyticsPerformance(
  value: unknown
): ListingAnalyticsPerformance | null {
  if (!isRecord(value)) {
    return null;
  }

  const listingId = value.listingId;
  const normalizedListingId =
    typeof listingId === "string" || typeof listingId === "number"
      ? String(listingId)
      : "";

  if (!normalizedListingId) {
    return null;
  }

  return {
    listingId: normalizedListingId,
    title: firstString(value.title),
    address: firstString(value.address),
    city: firstString(value.city),
    area: firstString(value.area),
    dwellingType: firstString(value.dwellingType),
    status: firstString(value.status),
    rent: firstNumber(value.rent),
    rooms: firstNumber(value.rooms),
    sizeM2: firstNumber(value.sizeM2),
    availableFrom: firstString(value.availableFrom),
    applyBy: firstString(value.applyBy),
    createdAt: firstString(value.createdAt),
    lifetimeQuickViews: toNumber(value.lifetimeQuickViews),
    lifetimeDetailedViews: toNumber(value.lifetimeDetailedViews),
    lifetimeTotalViews: toNumber(value.lifetimeTotalViews),
    periodQuickViews: toNumber(value.periodQuickViews),
    periodDetailedViews: toNumber(value.periodDetailedViews),
    periodTotalViews: toNumber(value.periodTotalViews),
    periodViewEventsResultingInLike: toNumber(
      value.periodViewEventsResultingInLike
    ),
    lifetimeLikes: toNumber(value.lifetimeLikes),
    periodLikes: toNumber(value.periodLikes),
    currentApplications: toNumber(value.currentApplications),
    periodApplications: toNumber(value.periodApplications),
    periodAcceptedApplications: toNumber(value.periodAcceptedApplications),
    periodRejectedApplications: toNumber(value.periodRejectedApplications),
    periodDetailedViewRate: toNumber(value.periodDetailedViewRate),
    periodApplicationConversionRate: toNumber(
      value.periodApplicationConversionRate
    ),
    periodLikeRate: toNumber(value.periodLikeRate),
  };
}

function normalizeListingAnalyticsPerformanceList(
  value: unknown
): ListingAnalyticsPerformance[] {
  return toArray<unknown>(value, true)
    .map(normalizeListingAnalyticsPerformance)
    .filter((entry): entry is ListingAnalyticsPerformance => entry !== null);
}

function normalizeListingViewCounts(value: unknown): ListingViewCounts {
  if (!isRecord(value)) {
    return {
      quickViews: 0,
      detailedViews: 0,
    };
  }

  return {
    quickViews: toNumber(value.quickViews ?? value.quick_views),
    detailedViews: toNumber(value.detailedViews ?? value.detailed_views),
  };
}

function normalizeResidentTrendEntry(value: unknown): ResidentTrendEntry | null {
  if (!isRecord(value)) {
    return null;
  }

  const year = toNumber(value.year, Number.NaN);
  const month = toNumber(value.month, Number.NaN);
  const day = toNumber(value.day, Number.NaN);

  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day)
  ) {
    return null;
  }

  return {
    year,
    month,
    day,
    numResidents: toNumber(value.numResidents ?? value.residents),
  };
}

function normalizeResidentSchool(value: unknown): ResidentSchool | null {
  if (!isRecord(value)) {
    return null;
  }

  return {
    id:
      Number.isFinite(Number(value.id ?? value.schoolId))
        ? Number(value.id ?? value.schoolId)
        : undefined,
    name:
      typeof value.name === "string"
        ? value.name
        : typeof value.schoolName === "string"
          ? value.schoolName
          : undefined,
    city: typeof value.city === "string" ? value.city : undefined,
    lat: Number.isFinite(Number(value.lat)) ? Number(value.lat) : undefined,
    lng: Number.isFinite(Number(value.lng)) ? Number(value.lng) : undefined,
  };
}

function normalizeResidentsSchoolCount(value: unknown): ResidentsSchoolCount | null {
  if (!isRecord(value)) {
    return null;
  }

  const school = normalizeResidentSchool(value.school);
  const fallbackName =
    typeof value.schoolName === "string"
      ? value.schoolName
      : typeof value.name === "string"
        ? value.name
        : undefined;

  return {
    school: school ?? (fallbackName ? { name: fallbackName } : null),
    residents: toNumber(value.residents ?? value.numResidents ?? value.count),
  };
}

function normalizeResidentsTownCount(value: unknown): ResidentsTownCount | null {
  if (!isRecord(value)) {
    return null;
  }

  const town =
    typeof value.town === "string"
      ? value.town
      : typeof value.city === "string"
        ? value.city
        : "";

  return {
    town: town || "Okänd stad",
    residents: toNumber(value.residents ?? value.numResidents ?? value.count),
  };
}

function normalizeResidentAnalyticsData(value: unknown): ResidentAnalyticsData {
  if (!isRecord(value)) {
    return {
      residentTrend: [],
      residentSchools: [],
      residentTowns: [],
    };
  }

  return {
    residentTrend: toArray<unknown>(
      value.residentTrend ?? value.trend ?? value.residentsTrend
    )
      .map(normalizeResidentTrendEntry)
      .filter((entry): entry is ResidentTrendEntry => entry !== null),
    residentSchools: toArray<unknown>(
      value.residentSchools ?? value.schools ?? value.residentsBySchool
    )
      .map(normalizeResidentsSchoolCount)
      .filter((entry): entry is ResidentsSchoolCount => entry !== null),
    residentTowns: toArray<unknown>(
      value.residentTowns ?? value.towns ?? value.residentsByTown
    )
      .map(normalizeResidentsTownCount)
      .filter((entry): entry is ResidentsTownCount => entry !== null),
  };
}

function normalizeCompanyPortalAnalyticsOverview(
  value: unknown
): CompanyPortalAnalyticsOverview {
  const source = isRecord(value) ? value : {};

  return {
    summary: normalizeAnalyticalQuantities(source.summary),
    trend: toArray<unknown>(source.trend, true)
      .map(normalizeCompanyOverviewTrendEntry)
      .filter((entry): entry is CompanyOverviewTrendEntry => entry !== null),
    residents: normalizeResidentAnalyticsData(source.residents),
    applicationsByListing: toArray<unknown>(source.applicationsByListing, true)
      .map(normalizeObjectApplicationCount)
      .filter((entry): entry is ObjectApplicationCount => entry !== null),
    queueApplicationCount: toNumber(source.queueApplicationCount),
    generatedAt: firstString(source.generatedAt),
  };
}

function normalizeCompanyPortalAnalyticsDashboard(
  value: unknown
): CompanyPortalAnalyticsDashboard {
  const source = isRecord(value) ? value : {};

  return {
    overview: normalizeCompanyPortalAnalyticsOverview(source.overview),
    funnel: normalizeCompanyAnalyticsFunnel(source.funnel),
    listingStatuses: normalizeAnalyticsCountBuckets(source.listingStatuses),
    applicationStatuses: normalizeAnalyticsCountBuckets(
      source.applicationStatuses
    ),
    applicationOutcomes: normalizeAnalyticsCountBuckets(source.applicationOutcomes),
    topListings: normalizeListingAnalyticsPerformanceList(source.topListings),
    generatedAt: firstString(source.generatedAt),
  };
}

function normalizeCompanyPublic(value: unknown): CompanyPublicDTO | null {
  if (!isRecord(value)) {
    return null;
  }

  const id = firstNumber(value.id, value.companyId);
  const name = firstString(value.name, value.companyName);

  if (id === undefined || !name) {
    return null;
  }

  const schools = toArray<unknown>(
    value.schools ?? value.companySchools
  )
    .map(normalizeResidentSchool)
    .filter((school): school is ResidentSchool => school !== null);

  return {
    ...(value as Partial<CompanyPublicDTO>),
    id,
    name,
    companyId: firstNumber(value.companyId, value.id),
    companyName: firstString(value.companyName, value.name),
    description: firstString(value.description, value.companyDescription),
    companyUrl: firstString(value.companyUrl),
    website: firstString(value.website, value.websiteUrl),
    websiteUrl: firstString(value.websiteUrl, value.website),
    privacyUrl: firstString(value.privacyUrl, value.privacyPolicyUrl, value.policyUrl),
    privacyPolicyUrl: firstString(value.privacyPolicyUrl, value.privacyUrl, value.policyUrl),
    termsUrl: firstString(value.termsUrl),
    cities: toArray<string>(value.cities ?? value.companyCities),
    schools,
    pictureUrlList: toArray<string>(value.pictureUrlList ?? value.companyPictures),
    videoUrlList: toArray<string>(value.videoUrlList ?? value.companyVideos),
    socialLinks: normalizeStringRecord(value.socialLinks),
  };
}

function normalizeExternalCompany(value: unknown): ExternalCompanyDTO | null {
  if (!isRecord(value)) {
    return null;
  }

  const id = firstNumber(value.id, value.companyId);
  const name = firstString(value.name, value.companyName);

  if (id === undefined || !name) {
    return null;
  }

  return {
    id,
    name,
    description: firstString(value.description, value.companyDescription) ?? null,
    logoUrl: firstString(value.logoUrl, value.logoURL) ?? null,
    websiteUrl: firstString(value.websiteUrl, value.website, value.companyUrl) ?? null,
    cityCodes: toArray<string>(value.cityCodes ?? value.cities ?? value.companyCities),
    schoolIds: toArray<unknown>(value.schoolIds ?? value.schools ?? value.companySchools)
      .map((school) => {
        if (isRecord(school)) {
          return firstNumber(school.id, school.schoolId);
        }
        return firstNumber(school);
      })
      .filter((schoolId): schoolId is number => schoolId !== undefined),
  };
}

function normalizeCompanyPrivate(value: unknown): CompanyPrivateDTO {
  if (!isRecord(value)) {
    throw new Error("OvÃ¤ntat svar frÃ¥n servern.");
  }

  const id = firstNumber(value.id, value.companyId);
  const name = firstString(value.name, value.companyName);

  if (id === undefined || !name) {
    throw new Error("OvÃ¤ntat svar frÃ¥n servern.");
  }

  const rawCities = value.cities ?? value.companyCities;

  return {
    id,
    name,
    orgNumber: firstString(value.orgNumber),
    subtitle: firstString(value.subtitle),
    description: firstString(value.description, value.companyDescription),
    website: firstString(value.website, value.websiteUrl),
    privacyPolicyUrl: firstString(value.privacyPolicyUrl, value.privacyUrl, value.policyUrl),
    termsUrl: firstString(value.termsUrl),
    rating: firstNumber(value.rating),
    verified:
      typeof value.verified === "boolean" ? value.verified : undefined,
    bannerUrl: firstString(value.bannerUrl),
    logoUrl: firstString(value.logoUrl),
    contactEmail: firstString(value.contactEmail, value.email),
    contactPhone: firstString(value.contactPhone, value.phone),
    contactNote: firstString(value.contactNote, value.internalContactNote),
    ...(rawCities !== undefined ? { cities: toArray<string>(rawCities) } : {}),
    pictureUrlList: toArray<string>(value.pictureUrlList ?? value.companyPictures),
    videoUrlList: toArray<string>(value.videoUrlList ?? value.companyVideos),
    socialLinks: normalizeStringRecord(value.socialLinks),
    systemProvider: normalizeSystemProvider(
      value.systemProvider ?? value.propertySystem ?? value.provider
    ),
  };
}

function normalizeUploadedUrl(value: unknown): string | null {
  if (typeof value !== "string") {
    if (!isRecord(value)) {
      return null;
    }

    const directUrl = firstString(
      value.url,
      value.logoUrl,
      value.bannerUrl,
      value.imageUrl,
      value.fileUrl,
      value.location,
      value.path
    );

    if (directUrl) {
      return normalizeUploadedUrl(directUrl);
    }

    return normalizeUploadedUrl(value.data ?? value.result);
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  if (trimmed.startsWith("{") || trimmed.startsWith("[") || trimmed.startsWith("\"")) {
    try {
      return normalizeUploadedUrl(JSON.parse(trimmed));
    } catch {
      // Keep treating the response as a plain URL below.
    }
  }

  if (
    (trimmed.startsWith("\"") && trimmed.endsWith("\"")) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }

  return trimmed;
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
  const listingCity = firstString(
    value.city,
    value.listingCity,
    listing?.city,
    listing?.location,
    listingSummary?.city,
    listingSummary?.location
  );
  const imageUrls = Array.isArray(listing?.imageUrls) ? listing.imageUrls : null;

  return {
    applicationId:
      typeof id === "number" ? id : Number.isFinite(Number(id)) ? Number(id) : undefined,
    id: typeof id === "string" || typeof id === "number" ? id : undefined,
    studentId: Number.isFinite(Number(studentId)) ? Number(studentId) : 0,
    firstName: firstString(
      value.firstName,
      student?.firstName,
      studentSummary?.firstName,
      readPath(value, "applicant.firstName")
    ) ?? "",
    surname: firstString(
      value.surname,
      student?.surname,
      studentSummary?.surname,
      readPath(value, "applicant.surname"),
      readPath(value, "applicant.lastName")
    ) ?? "",
    studentEmail: firstString(
      value.email,
      value.studentEmail,
      student?.email,
      studentSummary?.email,
      readPath(value, "applicant.email")
    ),
    studentCity: firstString(
      value.studentCity,
      student?.city,
      studentSummary?.city,
      readPath(value, "applicant.city")
    ),
    studentSchool: firstString(
      value.schoolName,
      student?.schoolName,
      studentSummary?.schoolName,
      readPath(student, "school.name"),
      readPath(value, "applicant.schoolName")
    ),
    studentProgram: firstString(
      value.studyProgram,
      student?.studyProgram,
      studentSummary?.studyProgram,
      readPath(value, "applicant.studyProgram")
    ),
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
    listingTitle: firstString(
      value.listingTitle,
      listing?.title,
      listingSummary?.title
    ),
    listingCity,
    listingRent: firstNumber(value.rent, listing?.rent, listingSummary?.rent),
    listingImage: firstString(
      value.listingImage,
      value.imageUrl,
      listing?.imageUrl,
      listingSummary?.imageUrl,
      imageUrls?.[0]
    ),
    listingDwellingType: firstString(
      value.dwellingType,
      listing?.dwellingType,
      listingSummary?.dwellingType
    ),
    listingRooms: firstNumber(value.rooms, listing?.rooms, listingSummary?.rooms),
    listingSizeM2: firstNumber(
      value.sizeM2,
      listing?.sizeM2,
      listingSummary?.sizeM2
    ),
    status: normalizeApplicationStatus(
      firstString(value.status, value.applicationStatus)
    ),
    message: firstString(value.message, value.applicationMessage),
    submittedAt: firstString(value.submittedAt, value.appliedAt, value.createdAt),
    createdAt: firstString(value.createdAt),
  };
}

function expandCompanyApplicationRows(value: unknown): unknown[] {
  if (!isRecord(value)) {
    return [];
  }

  const nestedApplications = toArray<unknown>(value.applications);

  if (nestedApplications.length === 0) {
    return [value];
  }

  const listing = value.listing;

  return nestedApplications.map((application) => {
    if (!isRecord(application)) {
      return application;
    }

    return {
      ...application,
      listing,
    };
  });
}

function companyApplicationsEndpoint(id: number, page: number, size: number): string {
  return `/companies/${pathSegment(id)}/all-applications${buildQuery({
    page,
    size,
  })}`;
}

function companyPortalAnalyticsEndpoint(id: number, path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `/companies/${pathSegment(id)}/analytics${normalizedPath}`;
}

function dateTimeParam(value: string | Date | undefined): string | undefined {
  return value instanceof Date ? value.toISOString() : value;
}

export const companyService = {

  listCompanies: async (
    params: CompanyListParams = {},
    options?: ServiceOptions
  ): Promise<CompanyPublicDTO[]> => {
    const companies = await apiClient<unknown>(
      `/companies${buildQuery({ city: params.city?.trim() })}`,
      {
        auth: false,
        signal: options?.signal,
      }
    );
    return arrayFromApiResponse<unknown>(companies)
      .map(normalizeCompanyPublic)
      .filter((company): company is CompanyPublicDTO => company !== null);
  },

  publicProfile: async (
    id: number,
    options?: ServiceOptions
  ): Promise<CompanyPublicDTO> => {
    const company = await apiClient<unknown>(`/companies/${pathSegment(id)}`, {
      auth: false,
      signal: options?.signal,
    });
    const normalizedCompany = normalizeCompanyPublic(company);
    if (!normalizedCompany) {
      throw new Error("OvÃ¤ntat svar frÃ¥n servern.");
    }
    return normalizedCompany;
  },

  myCompany: async (): Promise<CompanyInfo> => {
    const result = await authService.me();
    if (result.accountType === "student") {
      throw new Error("Denna funktion är inte tillgänglig för studenter. Försök att logga in som uthyrare istället.");
    }
    const companyId = getActiveCompanyId(result);
    const companyName =
      getActiveCompanySummary(result)?.name ??
      result.companyName ??
      result.displayName;
    if (companyId === null || !companyName) {
      throw new Error("Oväntat svar från servern.");
    }
    return { userId: companyId, name: companyName };
  },

  privateProfile: async (
    id: number,
    options?: ServiceOptions
  ): Promise<CompanyPrivateDTO> => {
    const company = await apiClient<unknown>(
      `/companies/${pathSegment(id)}/private`,
      { signal: options?.signal }
    );
    return normalizeCompanyPrivate(company);
  },

  roles: async (options?: ServiceOptions): Promise<CompanyRole[]> => {
    const roles = await apiClient<unknown>("/companies/roles", {
      auth: false,
      signal: options?.signal,
    });
    return arrayFromApiResponse<CompanyRole>(roles);
  },

  updateCompanyData: async (
    id: number,
    payload: CompanyChangeableDataDTO
  ): Promise<void> => {
    await apiClient<void>(`/companies/${pathSegment(id)}/changeData`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  getSupportedImageFileFormats: async (
    id: number,
    target: CompanyImageTarget
  ): Promise<ModifyImageFileSupportedFormat[]> => {
    const formats = await apiClient<unknown>(
      `/companies/${pathSegment(id)}/changeData/${pathSegment(target)}`,
      { auth: false }
    );
    return arrayFromApiResponse<ModifyImageFileSupportedFormat>(formats);
  },

  uploadImage: async (
    id: number,
    target: CompanyImageTarget,
    file: File,
    options: { mediaType?: string } = {}
  ): Promise<string | null> => {
    const formData = new FormData();
    formData.append("file", file, file.name);
    const query = buildQuery({ mediaType: options.mediaType });

    const url = await apiClient<unknown>(
      `/companies/${pathSegment(id)}/changeData/${pathSegment(target)}${query}`,
      {
        method: "POST",
        body: formData,
      }
    );
    return normalizeUploadedUrl(url);
  },

  uploadLogo: async (
    id: number,
    file: File,
    options: { mediaType?: string } = {}
  ): Promise<string | null> => {
    return companyService.uploadImage(id, "logo", file, options);
  },

  uploadBanner: async (
    id: number,
    file: File,
    options: { mediaType?: string } = {}
  ): Promise<string | null> => {
    return companyService.uploadImage(id, "banner", file, options);
  },

  users: async (
    id: number,
    options?: ServiceOptions
  ): Promise<CompanyUserDTO[]> => {
    const users = await apiClient<unknown>(
      `/companies/${pathSegment(id)}/users`,
      { signal: options?.signal }
    );
    return arrayFromApiResponse<CompanyUserDTO>(users);
  },

  createUser: async (
    payload: CompanyUserCreateRequest
  ): Promise<void> => {
    await authService.registerWorker(
      {
        accountType: "company",
        email: payload.email,
        password: payload.password,
        firstName: payload.firstName ?? undefined,
        surname: payload.surname ?? undefined,
        phone: payload.phone ?? undefined,
        city: payload.city ?? undefined,
        roleName: payload.roleName ?? undefined,
      },
      { auth: true }
    );
  },

  updateUser: async (
    id: number,
    userId: number,
    payload: CompanyUserUpdateRequest
  ): Promise<CompanyUserDTO> => {
    return apiClient<CompanyUserDTO>(
      `/companies/${pathSegment(id)}/users/${pathSegment(userId)}`,
      {
        method: "PUT",
        body: JSON.stringify({
          id: userId,
          companyId: id,
          firstName: payload.firstName,
          surname: payload.surname,
          phone: payload.phone,
          bannerUrl: payload.bannerUrl,
          logoUrl: payload.logoUrl,
          role: payload.roleName ? { name: payload.roleName } : undefined,
        }),
      }
    );
  },

  deleteUser: async (id: number, userId: number): Promise<void> => {
    await apiClient<void>(
      `/companies/${pathSegment(id)}/users/${pathSegment(userId)}`,
      {
        method: "DELETE",
      }
    );
  },

  verifyUser: async (id: number, userId: number): Promise<void> => {
    await apiClient<void>(
      `/companies/${pathSegment(id)}/verify/${pathSegment(userId)}`,
      {
        method: "PUT",
      }
    );
  },

  newApplications: async (
    id: number,
    options: { count?: number; since?: string; signal?: AbortSignal } = {}
  ): Promise<NewApplication[]> => {
    const result = await apiClient<unknown>(
      companyApplicationsEndpoint(id, 0, options.count ?? 10),
      { signal: options.signal }
    );

    return toArray<unknown>(result, true)
      .flatMap(expandCompanyApplicationRows)
      .map(normalizeNewApplication)
      .filter((application): application is NewApplication => application !== null);
  }, 

  handleApplication: async (
    id: number,
    payload: HandleCompanyApplicationRequest
  ): Promise<void> => {
    await apiClient<void>(`/companies/${pathSegment(id)}/handle-application`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  applications: async (
    id: number,
    options: { pageSize?: number; maxPages?: number; signal?: AbortSignal } = {}
  ): Promise<NewApplication[]> => {
    const pageSize = options.pageSize ?? 200;
    const maxPages = options.maxPages ?? 25;
    const applications: NewApplication[] = [];

    for (let page = 0; page < maxPages; page += 1) {
      const result = await apiClient<unknown>(
        companyApplicationsEndpoint(id, page, pageSize),
        { signal: options.signal }
      );
      const rows = toArray<unknown>(result, true);

      applications.push(
        ...rows
          .flatMap(expandCompanyApplicationRows)
          .map(normalizeNewApplication)
          .filter((application): application is NewApplication => application !== null)
      );

      if (!isRecord(result)) {
        break;
      }

      const pageMetadata = isRecord(result.page) ? result.page : result;
      const totalPages = toNumber(pageMetadata.totalPages, Number.NaN);
      const isLastPage = result.last === true;

      if (
        isLastPage ||
        rows.length < pageSize ||
        (Number.isFinite(totalPages) && page >= totalPages - 1)
      ) {
        break;
      }
    }

    return applications;
  },

  analyticsOverview: async (
    id: number,
    options: {
      from?: string | Date;
      to?: string | Date;
      granularity?: CompanyOverviewTrendGranularity;
      limit?: number;
      signal?: AbortSignal;
    } = {}
  ): Promise<CompanyPortalAnalyticsOverview> => {
    const result = await apiClient<unknown>(
      `${companyPortalAnalyticsEndpoint(id, "/overview")}${buildQuery({
        from: dateTimeParam(options.from),
        to: dateTimeParam(options.to),
        granularity: options.granularity ?? "day",
        limit: options.limit,
      })}`,
      { signal: options.signal }
    );

    return normalizeCompanyPortalAnalyticsOverview(result);
  },

  analyticsDashboard: async (
    id: number,
    options: {
      from?: string | Date;
      to?: string | Date;
      granularity?: CompanyOverviewTrendGranularity;
      limit?: number;
      signal?: AbortSignal;
    } = {}
  ): Promise<CompanyPortalAnalyticsDashboard> => {
    const result = await apiClient<unknown>(
      `${companyPortalAnalyticsEndpoint(id, "/dashboard")}${buildQuery({
        from: dateTimeParam(options.from),
        to: dateTimeParam(options.to),
        granularity: options.granularity ?? "day",
        limit: options.limit,
      })}`,
      { signal: options.signal }
    );

    return normalizeCompanyPortalAnalyticsDashboard(result);
  },

  analyticsFunnel: async (
    id: number,
    options: { from?: string | Date; to?: string | Date; signal?: AbortSignal } = {}
  ): Promise<CompanyAnalyticsFunnel> => {
    const result = await apiClient<unknown>(
      `${companyPortalAnalyticsEndpoint(id, "/funnel")}${buildQuery({
        from: dateTimeParam(options.from),
        to: dateTimeParam(options.to),
      })}`,
      { signal: options.signal }
    );

    return normalizeCompanyAnalyticsFunnel(result);
  },

  listingPerformance: async (
    id: number,
    options: {
      from?: string | Date;
      to?: string | Date;
      sortBy?: ListingPerformanceSort;
      limit?: number;
      signal?: AbortSignal;
    } = {}
  ): Promise<ListingAnalyticsPerformance[]> => {
    const result = await apiClient<unknown>(
      `${companyPortalAnalyticsEndpoint(id, "/listings/performance")}${buildQuery({
        from: dateTimeParam(options.from),
        to: dateTimeParam(options.to),
        sortBy: options.sortBy,
        limit: options.limit,
      })}`,
      { signal: options.signal }
    );

    return normalizeListingAnalyticsPerformanceList(result);
  },

  listingPerformanceDetail: async (
    id: number,
    listingId: string | number,
    options: { from?: string | Date; to?: string | Date; signal?: AbortSignal } = {}
  ): Promise<ListingAnalyticsPerformance> => {
    const result = await apiClient<unknown>(
      `${companyPortalAnalyticsEndpoint(
        id,
        `/listings/${pathSegment(listingId)}/performance`
      )}${buildQuery({
        from: dateTimeParam(options.from),
        to: dateTimeParam(options.to),
      })}`,
      { signal: options.signal }
    );
    const normalized = normalizeListingAnalyticsPerformance(result);

    if (!normalized) {
      throw new Error("OvÃ¤ntat svar frÃ¥n servern.");
    }

    return normalized;
  },

  listingStatusCounts: async (
    id: number,
    options?: ServiceOptions
  ): Promise<AnalyticsCountBucket[]> => {
    const result = await apiClient<unknown>(
      companyPortalAnalyticsEndpoint(id, "/listings/statuses"),
      { signal: options?.signal }
    );

    return normalizeAnalyticsCountBuckets(result);
  },

  applicationStatusCounts: async (
    id: number,
    options: { from?: string | Date; to?: string | Date; signal?: AbortSignal } = {}
  ): Promise<AnalyticsCountBucket[]> => {
    const result = await apiClient<unknown>(
      `${companyPortalAnalyticsEndpoint(id, "/applications/statuses")}${buildQuery({
        from: dateTimeParam(options.from),
        to: dateTimeParam(options.to),
      })}`,
      { signal: options.signal }
    );

    return normalizeAnalyticsCountBuckets(result);
  },

  applicationOutcomeCounts: async (
    id: number,
    options: { from?: string | Date; to?: string | Date; signal?: AbortSignal } = {}
  ): Promise<AnalyticsCountBucket[]> => {
    const result = await apiClient<unknown>(
      `${companyPortalAnalyticsEndpoint(id, "/applications/outcomes")}${buildQuery({
        from: dateTimeParam(options.from),
        to: dateTimeParam(options.to),
      })}`,
      { signal: options.signal }
    );

    return normalizeAnalyticsCountBuckets(result);
  },

  applicationCount: async (id: number): Promise<number> => {
    const result = await apiClient<unknown>(
      companyPortalAnalyticsEndpoint(id, "/summary")
    );

    if (isRecord(result)) {
      return toNumber(result.currentApplications);
    }

    return toNumber(result);
  },

  queueApplicationCount: async (
    id: number,
    options?: ServiceOptions
  ): Promise<number> => {
    const result = await apiClient<unknown>(
      companyPortalAnalyticsEndpoint(id, "/queues/applications/count"),
      { signal: options?.signal }
    );

    return toNumber(result);
  },

  queueApplicationsTrend: async (
    id: number,
    options: {
      from?: string | Date;
      to?: string | Date;
      granularity?: QueueApplicationTrendGranularity;
      signal?: AbortSignal;
    } = {}
  ): Promise<QueueApplicationTrendEntry[]> => {
    const query = buildQuery({
      from: dateTimeParam(options.from),
      to: dateTimeParam(options.to),
      granularity: options.granularity ?? "day",
    });
    const result = await apiClient<unknown>(
      `${companyPortalAnalyticsEndpoint(id, "/queues/applications/trend")}${query}`,
      { signal: options.signal }
    );

    return toArray<unknown>(result, true)
      .map(normalizeQueueApplicationTrendEntry)
      .filter((entry): entry is QueueApplicationTrendEntry => entry !== null);
  },

  overviewTrend: async (
    id: number,
    options: {
      from?: string | Date;
      to?: string | Date;
      granularity?: CompanyOverviewTrendGranularity;
      signal?: AbortSignal;
    } = {}
  ): Promise<CompanyOverviewTrendEntry[]> => {
    const query = buildQuery({
      from: dateTimeParam(options.from),
      to: dateTimeParam(options.to),
      granularity: options.granularity ?? "day",
    });
    const result = await apiClient<unknown>(
      `${companyPortalAnalyticsEndpoint(id, "/trend")}${query}`,
      { signal: options.signal }
    );

    return toArray<unknown>(result, true)
      .map(normalizeCompanyOverviewTrendEntry)
      .filter((entry): entry is CompanyOverviewTrendEntry => entry !== null);
  },
  
  applicationsTimeline: async (
    id: number,
    options: { from?: string | Date; to?: string | Date; signal?: AbortSignal } = {}
  ): Promise<Timeline> => {
    const now = new Date();
    const defaultFrom = new Date(now);
    defaultFrom.setFullYear(defaultFrom.getFullYear() - 2);

    const entries = await companyService.timedApplications(
      id,
      options.from ?? defaultFrom,
      options.to ?? now,
      { signal: options.signal }
    );
    const rows = toArray<unknown>(entries, true)
      .map(normalizeApplicationTrendEntry)
      .filter((entry): entry is ApplicationStatisticEntry => entry !== null);

    return rows.map(({ year, month, day, numApplications }) => {
      return {
        timestamp: new Date(year, month - 1, day ?? 1),
        value: numApplications,
      };
    });
  },

  timedApplications: async (
    id: number,
    from: string | Date,
    to: string | Date,
    options?: ServiceOptions
  ): Promise<ApplicationStatisticEntry[]> => {
    const fromValue = dateTimeParam(from);
    const toValue = dateTimeParam(to);
    const query = buildQuery({ from: fromValue, to: toValue });
    const result = await apiClient<unknown>(
      `${companyPortalAnalyticsEndpoint(id, "/applications/trend")}${query}`,
      { signal: options?.signal }
    );

    return toArray<unknown>(result, true)
      .map(normalizeApplicationTrendEntry)
      .filter((entry): entry is ApplicationStatisticEntry => entry !== null);
  },

  timedApplicationsForListing: async (
    id: number,
    from: string | Date,
    to: string | Date,
    listingId: string | number,
    options?: ServiceOptions
  ): Promise<ApplicationStatisticEntry[]> => {
    const fromValue = dateTimeParam(from);
    const toValue = dateTimeParam(to);
    const query = buildQuery({ from: fromValue, to: toValue, listingId });
    const result = await apiClient<unknown>(
      `${companyPortalAnalyticsEndpoint(id, "/applications/trend")}${query}`,
      { signal: options?.signal }
    );

    return toArray<unknown>(result, true)
      .map(normalizeApplicationTrendEntry)
      .filter((entry): entry is ApplicationStatisticEntry => entry !== null);
  },

  applicationCountsPerObject: async (
    id: number,
    limit: number = 5,
    options?: ServiceOptions
  ): Promise<ObjectApplicationCount[]> => {
    const query = buildQuery({ limit: limit === null ? 5 : limit });
    const result = await apiClient<unknown>(
      `${companyPortalAnalyticsEndpoint(id, "/applications/by-listing")}${query}`,
      { signal: options?.signal }
    );

    const normalized = toArray<unknown>(result, true)
      .map(normalizeObjectApplicationCount)
      .filter((entry): entry is ObjectApplicationCount => entry !== null);

    return normalized;
  },

  listingViewCounts: async (
    id: number,
    listingId: string | number,
    options?: ServiceOptions
  ): Promise<ListingViewCounts> => {
    const result = await apiClient<unknown>(
      companyPortalAnalyticsEndpoint(
        id,
        `/listings/${pathSegment(listingId)}/views`
      ),
      { signal: options?.signal }
    );

    return normalizeListingViewCounts(result);
  },

  refreshCompanyListings: async (id: number): Promise<void> => {
    await apiClient<void>(
      `/companies/${pathSegment(id)}/refresh-listings`,
      {
        method: "POST",
      }
    );
  },

  generalAnalytics: async (
    id: number,
    options?: ServiceOptions
  ): Promise<AnalyticalQuantities> => {
    const result = await apiClient<unknown>(
      companyPortalAnalyticsEndpoint(id, "/summary"),
      { signal: options?.signal }
    );

    return normalizeAnalyticalQuantities(result);
  },

  residentAnalyticsData: async (
    id: number,
    options?: ServiceOptions
  ): Promise<ResidentAnalyticsData> => {
    const result = await apiClient<unknown>(
      companyPortalAnalyticsEndpoint(id, "/residents"),
      { signal: options?.signal }
    );

    return normalizeResidentAnalyticsData(result);
  },

  residentsByTown: async (
    id: number,
    options?: ServiceOptions
  ): Promise<unknown[]> => {
    const data = await companyService.residentAnalyticsData(id, options);
    return data.residentTowns;
  },

  residentsBySchool: async (
    id: number,
    options?: ServiceOptions
  ): Promise<ResidentsSchoolCount[]> => {
    const data = await companyService.residentAnalyticsData(id, options);
    return data.residentSchools;
  },

  landlordKickback: async (companyId: number): Promise<unknown> => {
    return apiClient<unknown>(`/landlord/${pathSegment(companyId)}/kickback`, {
      auth: false,
    });
  },

  getAllPlatforms: async (options?: ServiceOptions): Promise<SocialPlatform[]> => {
    const platforms = await apiClient<unknown>("/companies/all-platforms", {
      auth: false,
      signal: options?.signal,
    });
    return arrayFromApiResponse<unknown>(platforms)
      .map(normalizeSocialPlatform)
      .filter((platform): platform is SocialPlatform => platform !== null);
  },

  createExternalCompany: async (
    payload: CreateExternalCompanyRequest
  ): Promise<void> => {
    await apiClient<void>("/companies/external-company", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updateExternalCompany: async (
    payload: ModifyExternalCompanyRequest
  ): Promise<void> => {
    await apiClient<void>("/companies/external-company", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  getExternalCompanies: async (): Promise<ExternalCompanyDTO[]> => {
    const companies = await apiClient<unknown>("/companies/external-company", {
      auth: false,
    });
    return arrayFromApiResponse<unknown>(companies)
      .map(normalizeExternalCompany)
      .filter((company): company is ExternalCompanyDTO => company !== null);
  },

  deleteExternalCompany: async (id: number): Promise<void> => {
    await apiClient<void>(
      `/companies/external-company${buildQuery({ id })}`,
      {
        method: "DELETE",
      }
    );
  },
};
