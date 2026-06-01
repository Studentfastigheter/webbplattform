import { authService } from "@/features/auth/services/auth-service";
import {
  apiClient,
  arrayFromApiResponse,
  buildQuery,
  pathSegment,
} from "@/lib/api/client";
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
  companyDescription?: string | null;
  website?: string | null;
  companyUrl?: string | null;
  websiteUrl?: string | null;
  privacyUrl?: string | null;
  privacyPolicyUrl?: string | null;
  termsUrl?: string | null;
  rating?: number | null;
  verified?: boolean | null;
  bannerUrl?: string | null;
  logoUrl?: string | null;
  email?: string | null;
  phone?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  contactNote?: string | null;
  orgNumber?: string | null;
  organisationNumber?: string | null;
  organizationNumber?: string | null;
  internalContactNote?: string | null;
  pictureUrlList?: string[];
  videoUrlList?: string[];
  socialLinks?: Record<string, string>;
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
  bannerUrl?: string | null;
  cityCodes?: string[];
  schoolIds?: number[];
};

export type ModifyExternalCompanyRequest = {
  id: number;
  name?: string | null;
  description?: string | null;
  logoUrl?: string | null;
  websiteUrl?: string | null;
  bannerUrl?: string | null;
  cities?: string[];
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
  status?: string;
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

const defaultGeneralAnalyticsPeriods = ["P7D", "P1M", "P3M", "P1Y"];

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

function normalizeCompanyPrivate(value: unknown): CompanyPrivateDTO {
  if (!isRecord(value)) {
    throw new Error("OvÃ¤ntat svar frÃ¥n servern.");
  }

  const id = firstNumber(value.id, value.companyId);
  const name = firstString(value.name, value.companyName);

  if (id === undefined || !name) {
    throw new Error("OvÃ¤ntat svar frÃ¥n servern.");
  }

  return {
    ...(value as Partial<CompanyPrivateDTO>),
    id,
    name,
    description: firstString(value.description, value.companyDescription),
    companyDescription: firstString(value.companyDescription, value.description),
    companyUrl: firstString(value.companyUrl),
    website: firstString(value.website, value.websiteUrl),
    websiteUrl: firstString(value.websiteUrl, value.website),
    privacyUrl: firstString(value.privacyUrl, value.privacyPolicyUrl, value.policyUrl),
    privacyPolicyUrl: firstString(value.privacyPolicyUrl, value.privacyUrl, value.policyUrl),
    termsUrl: firstString(value.termsUrl),
    contactEmail: firstString(value.contactEmail, value.email),
    contactPhone: firstString(value.contactPhone, value.phone),
    email: firstString(value.email, value.contactEmail),
    phone: firstString(value.phone, value.contactPhone),
    orgNumber: firstString(
      value.orgNumber,
      value.organisationNumber,
      value.organizationNumber
    ),
    internalContactNote: firstString(value.internalContactNote, value.contactNote),
    contactNote: firstString(value.contactNote, value.internalContactNote),
    pictureUrlList: toArray<string>(value.pictureUrlList ?? value.companyPictures),
    videoUrlList: toArray<string>(value.videoUrlList ?? value.companyVideos),
    socialLinks: normalizeStringRecord(value.socialLinks),
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
    status: firstString(value.status, value.applicationStatus),
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

export const companyService = {

  listCompanies: async (
    params: CompanyListParams = {}
  ): Promise<CompanyPublicDTO[]> => {
    const companies = await apiClient<unknown>(
      `/companies${buildQuery({ city: params.city?.trim() })}`,
      { auth: false }
    );
    return arrayFromApiResponse<unknown>(companies)
      .map(normalizeCompanyPublic)
      .filter((company): company is CompanyPublicDTO => company !== null);
  },

  publicProfile: async (id: number): Promise<CompanyPublicDTO> => {
    const company = await apiClient<unknown>(`/companies/${pathSegment(id)}`, {
      auth: false,
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

  privateProfile: async (id: number): Promise<CompanyPrivateDTO> => {
    const company = await apiClient<unknown>(`/companies/${pathSegment(id)}/private`);
    return normalizeCompanyPrivate(company);
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

  users: async (id: number): Promise<CompanyUserDTO[]> => {
    const users = await apiClient<unknown>(`/companies/${pathSegment(id)}/users`);
    return arrayFromApiResponse<CompanyUserDTO>(users);
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
    options: { count?: number; since?: string } = {}
  ): Promise<NewApplication[]> => {
    const result = await apiClient<unknown>(
      companyApplicationsEndpoint(id, 0, options.count ?? 10)
    );

    return toArray<unknown>(result, true)
      .flatMap(expandCompanyApplicationRows)
      .map(normalizeNewApplication)
      .filter((application): application is NewApplication => application !== null);
  }, 

  applications: async (
    id: number,
    options: { pageSize?: number; maxPages?: number } = {}
  ): Promise<NewApplication[]> => {
    const pageSize = options.pageSize ?? 200;
    const maxPages = options.maxPages ?? 25;
    const applications: NewApplication[] = [];

    for (let page = 0; page < maxPages; page += 1) {
      const result = await apiClient<unknown>(
        companyApplicationsEndpoint(id, page, pageSize)
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

  applicationCount: async (id: number): Promise<number> => {
    const result = await apiClient<unknown>(`/analytics/${pathSegment(id)}/general`);

    if (isRecord(result)) {
      return toNumber(result.currentApplications);
    }

    return toNumber(result);
  },
  
  applicationsTimeline: async (
    id: number,
    options: { from?: string | Date; to?: string | Date } = {}
  ): Promise<Timeline> => {
    const now = new Date();
    const defaultFrom = new Date(now);
    defaultFrom.setFullYear(defaultFrom.getFullYear() - 2);

    const entries = await companyService.timedApplications(
      id,
      options.from ?? defaultFrom,
      options.to ?? now
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
    to: string | Date
  ): Promise<ApplicationStatisticEntry[]> => {
    const fromValue = from instanceof Date ? from.toISOString() : from;
    const toValue = to instanceof Date ? to.toISOString() : to;
    const result = await apiClient<unknown>(
      `/analytics/${pathSegment(id)}/timed-applications/${pathSegment(fromValue)}/${pathSegment(toValue)}`
    );

    return toArray<unknown>(result, true)
      .map(normalizeApplicationTrendEntry)
      .filter((entry): entry is ApplicationStatisticEntry => entry !== null);
  },

  timedApplicationsForListing: async (
    id: number,
    from: string | Date,
    to: string | Date,
    listingId: string | number
  ): Promise<ApplicationStatisticEntry[]> => {
    const fromValue = from instanceof Date ? from.toISOString() : from;
    const toValue = to instanceof Date ? to.toISOString() : to;
    const result = await apiClient<unknown>(
      `/analytics/${pathSegment(id)}/timed-applications/${pathSegment(fromValue)}/${pathSegment(toValue)}/${pathSegment(listingId)}`
    );

    return toArray<unknown>(result, true)
      .map(normalizeApplicationTrendEntry)
      .filter((entry): entry is ApplicationStatisticEntry => entry !== null);
  },

  applicationCountsPerObject: async (id: number, limit: number = 5): Promise<ObjectApplicationCount[]> => {
    const query = buildQuery({ limit: limit === null ? 5 : limit });
    const result = await apiClient<unknown>(
      `/analytics/${pathSegment(id)}/current_applications/by_object${query}`
    );

    return toArray<unknown>(result, true)
      .map(normalizeObjectApplicationCount)
      .filter((entry): entry is ObjectApplicationCount => entry !== null);
  },

  listingViewCounts: async (
    id: number,
    listingId: string | number
  ): Promise<ListingViewCounts> => {
    const result = await apiClient<unknown>(
      `/analytics/${pathSegment(id)}/listing/${pathSegment(listingId)}/`
    );

    return normalizeListingViewCounts(result);
  },

  generalAnalytics: async (
    id: number
  ): Promise<AnalyticalQuantities> => {
    const result = await apiClient<unknown>(`/analytics/${pathSegment(id)}/general`);

    return normalizeAnalyticalQuantities(result);
  },

  residentAnalyticsData: async (id: number): Promise<ResidentAnalyticsData> => {
    const result = await apiClient<unknown>(
      `/analytics/${pathSegment(id)}/residents/data`
    );

    return normalizeResidentAnalyticsData(result);
  },

  residentsByTown: async (id: number): Promise<unknown[]> => {
    const data = await companyService.residentAnalyticsData(id);
    return data.residentTowns;
  },

  residentsBySchool: async (id: number): Promise<ResidentsSchoolCount[]> => {
    const data = await companyService.residentAnalyticsData(id);
    return data.residentSchools;
  },

  landlordKickback: async (companyId: number): Promise<unknown> => {
    return apiClient<unknown>(`/landlord/${pathSegment(companyId)}/kickback`, {
      auth: false,
    });
  },

  getAllPlatforms: async (): Promise<SocialPlatform[]> => {
    const platforms = await apiClient<unknown>("/companies/all-platforms", {
      auth: false,
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
};
