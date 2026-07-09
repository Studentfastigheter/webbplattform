import {
  apiClient,
  arrayFromApiResponse,
  buildQuery,
  pathSegment,
  type ServiceOptions,
} from "@/lib/api/client";
import {
  firstFiniteNumber,
  firstNonEmptyString,
  isRecord,
} from "@/lib/api/normalize";
import { cityService } from "@/features/cities/services/city-service";
import {
  DWELLING_TYPE_VALUES,
  HOST_TYPE_VALUES,
  LISTING_STATUS_VALUES,
  type ListingCardDTO,
  type ListingDetailDTO,
  type PageResponse,
  type StudentApplicationDTO,
  type ListingTagDTO,
  type ListingStatus,
  type DwellingType,
  type HostType,
  type ListingNearbyLocationDTO,
  type RequirementsProfileDTO,
  type UpdateListingRequest,
  type UpdateMultipleListingsRequest,
  type PublishListingRequest,
} from "@/types/listing";

// --- Lokala typer ---
export type ListingType = "company" | "private";

export type ListingActivity = {
  id: number;
  name: string;
  category: string;
  distanceKm?: number | null;
};

export type ListingSearchFacetsDTO = {
  totalHits?: number;
  totalCount?: number;
  totalElements?: number;
  priceDistribution?: {
    minRentObserved?: number;
    maxRentObserved?: number;
    minRent?: number;
    maxRent?: number;
    histogram?: Array<{
      minRent?: number;
      maxRent?: number;
      count?: number;
    }>;
  };
  companyCounts?: Array<{
    company?: {
      id?: number;
      name?: string;
      logoUrl?: string;
    };
    listingCount?: number;
    count?: number;
  }>;
  privateLandlordCount?: number;
  dwellingTypeCounts?: Array<{
    dwellingType?: DwellingType | string;
    count?: number;
  }>;
};

export type ListingSearchParams = {
  page?: number;
  size?: number;
  sort?: string | string[];
  city?: string | null;
  /** Exact match on the listing's resolved city relation (e.g. "GOTHENBURG") — unlike `city`, which is a free-text term. */
  cityCode?: string | null;
  dwellingType?: DwellingType | string | null;
  minRent?: number | null;
  maxRent?: number | null;
  minLivingArea?: number | null;
  maxLivingArea?: number | null;
  exactRooms?: number | null;
  minRooms?: number | null;
  maxRooms?: number | null;
  hostType?: HostType | string | null;
  schoolTargetLat?: number | null;
  schoolTargetLng?: number | null;
  maxDistanceToSchool?: number | null;
  companyId?: number | null;
  /** @deprecated Use schoolTargetLat. Kept so older UI call sites still map to the current backend query name. */
  school_lat?: number | null;
  /** @deprecated Use schoolTargetLng. Kept so older UI call sites still map to the current backend query name. */
  school_lng?: number | null;
  amenities?: string[];
  seed?: string | null;
};

export type ListingViewIncrementType = "QUICK" | "DETAILED";

const LISTINGS_DEFAULT_PAGE_SIZE = 24;

const DWELLING_TYPE_ALIASES: Record<string, DwellingType> = {
  APARTMENT: "APARTMENT",
  ROOM: "ROOM",
  CORRIDOR_ROOM: "CORRIDOR_ROOM",
  APARTMENT_TYPE: "APARTMENT",
  LAGENHET: "APARTMENT",
  LÄGENHET: "APARTMENT",
  RUM: "ROOM",
  KORRIDORSRUM: "CORRIDOR_ROOM",
  CORRIDORROOM: "CORRIDOR_ROOM",
};

const HOST_TYPE_ALIASES: Record<string, HostType> = {
  COMPANY: "COMPANY",
  PRIVATE: "PRIVATE",
  FORETAG: "COMPANY",
  FÖRETAG: "COMPANY",
  PRIVAT: "PRIVATE",
  PRIVATE_LANDLORD: "PRIVATE",
  LANDLORD: "PRIVATE",
};

const isListingStatus = (status: string): status is ListingStatus =>
  (LISTING_STATUS_VALUES as readonly string[]).includes(status);

const enumLookupKey = (value: string) =>
  value.normalize("NFC").trim().toUpperCase().replace(/[\s-]+/g, "_");

const normalizeDwellingTypeParam = (
  value: ListingSearchParams["dwellingType"]
): DwellingType | undefined => {
  if (!value) return undefined;
  return DWELLING_TYPE_ALIASES[enumLookupKey(value)];
};

const normalizeHostTypeParam = (
  value: ListingSearchParams["hostType"]
): HostType | undefined => {
  if (!value) return undefined;
  return HOST_TYPE_ALIASES[enumLookupKey(value)];
};

const assertPublishListingEnums = (payload: PublishListingRequest) => {
  if (payload.dwellingType && !normalizeDwellingTypeParam(payload.dwellingType)) {
    throw new Error("Ogiltig bostadstyp.");
  }
};

const normalizePublishListingPayload = (
  payload: PublishListingRequest
): PublishListingRequest => ({
  ...payload,
  dwellingType: normalizeDwellingTypeParam(payload.dwellingType),
});

function assertUpdateListingPayload(payload: UpdateListingRequest) {
  if (payload.status && !isListingStatus(payload.status)) {
    throw new Error("Ogiltig annonsstatus.");
  }
}

const applicationBody = (message?: string) => {
  const trimmed = message?.trim();
  return JSON.stringify(trimmed ? { message: trimmed } : {});
};

function assertListingSearchEnums(params: ListingSearchParams) {
  if (params.dwellingType && !normalizeDwellingTypeParam(params.dwellingType)) {
    throw new Error("Ogiltig bostadstyp.");
  }

  if (params.hostType && !normalizeHostTypeParam(params.hostType)) {
    throw new Error("Ogiltig hyresvärdstyp.");
  }
}

const finiteNumber = (value: unknown): number | undefined =>
  typeof value === "number" && Number.isFinite(value) ? value : undefined;

const normalizedString = (value: string | null | undefined): string | undefined => {
  const trimmed = value?.normalize("NFC").trim();
  return trimmed ? trimmed : undefined;
};

const normalizedStringArray = (values: string[] | undefined) => {
  if (!values) return undefined;
  const normalized = Array.from(
    new Set(
      values
        .map((value) => value.normalize("NFC").trim())
        .filter((value) => value.length > 0)
    )
  ).sort((left, right) => left.localeCompare(right, "sv-SE"));

  return normalized.length > 0 ? normalized : undefined;
};

export function normalizeListingSearchParams(
  params: ListingSearchParams = {},
  { includePageable = true }: { includePageable?: boolean } = {}
): ListingSearchParams {
  const normalized: ListingSearchParams = {};
  const schoolTargetLat = finiteNumber(params.schoolTargetLat ?? params.school_lat);
  const schoolTargetLng = finiteNumber(params.schoolTargetLng ?? params.school_lng);
  const dwellingType =
    normalizeDwellingTypeParam(params.dwellingType) ??
    normalizedString(params.dwellingType);
  const hostType =
    normalizeHostTypeParam(params.hostType) ?? normalizedString(params.hostType);
  const amenities = normalizedStringArray(params.amenities);

  if (includePageable) {
    normalized.page =
      Number.isInteger(params.page) && (params.page ?? 0) >= 0 ? params.page : 0;
    normalized.size =
      Number.isInteger(params.size) && (params.size ?? 0) > 0
        ? params.size
        : LISTINGS_DEFAULT_PAGE_SIZE;
    if (params.sort) {
      normalized.sort = params.sort;
    }
  }

  const city = normalizedString(params.city);
  if (city) normalized.city = city;
  const cityCode = normalizedString(params.cityCode);
  if (cityCode) normalized.cityCode = cityCode.toLocaleUpperCase("en-US");
  if (dwellingType) normalized.dwellingType = dwellingType;
  const minRent = finiteNumber(params.minRent);
  if (minRent !== undefined) normalized.minRent = minRent;
  const maxRent = finiteNumber(params.maxRent);
  if (maxRent !== undefined) normalized.maxRent = maxRent;
  const minLivingArea = finiteNumber(params.minLivingArea);
  if (minLivingArea !== undefined) normalized.minLivingArea = minLivingArea;
  const maxLivingArea = finiteNumber(params.maxLivingArea);
  if (maxLivingArea !== undefined) normalized.maxLivingArea = maxLivingArea;
  const exactRooms = finiteNumber(params.exactRooms);
  if (exactRooms !== undefined) normalized.exactRooms = exactRooms;
  const minRooms = finiteNumber(params.minRooms);
  if (minRooms !== undefined) normalized.minRooms = minRooms;
  const maxRooms = finiteNumber(params.maxRooms);
  if (maxRooms !== undefined) normalized.maxRooms = maxRooms;
  if (hostType) normalized.hostType = hostType;
  if (schoolTargetLat !== undefined) normalized.schoolTargetLat = schoolTargetLat;
  if (schoolTargetLng !== undefined) normalized.schoolTargetLng = schoolTargetLng;
  const maxDistanceToSchool = finiteNumber(params.maxDistanceToSchool);
  if (maxDistanceToSchool !== undefined) {
    normalized.maxDistanceToSchool = maxDistanceToSchool;
  }
  const companyId = finiteNumber(params.companyId);
  if (companyId !== undefined) normalized.companyId = companyId;
  if (amenities) normalized.amenities = amenities;
  const seed = normalizedString(params.seed);
  if (seed) normalized.seed = seed;

  return normalized;
}

function buildListingSearchQuery(
  params: ListingSearchParams,
  includePageable = true
) {
  const normalized = normalizeListingSearchParams(params, { includePageable });

  return buildQuery({
    ...(includePageable
      ? {
          page: normalized.page ?? 0,
          size: normalized.size ?? LISTINGS_DEFAULT_PAGE_SIZE,
          sort: normalized.sort,
        }
      : {}),
    city: normalized.city,
    cityCode: normalized.cityCode,
    dwellingType: normalized.dwellingType,
    minRent: normalized.minRent,
    maxRent: normalized.maxRent,
    minLivingArea: normalized.minLivingArea,
    maxLivingArea: normalized.maxLivingArea,
    exactRooms: normalized.exactRooms,
    minRooms: normalized.minRooms,
    maxRooms: normalized.maxRooms,
    hostType: normalized.hostType,
    schoolTargetLat: normalized.schoolTargetLat,
    schoolTargetLng: normalized.schoolTargetLng,
    maxDistanceToSchool: normalized.maxDistanceToSchool,
    companyId: normalized.companyId,
    amenities: normalized.amenities,
    seed: normalized.seed,
  });
}

// Delade helpers i @/lib/api/normalize; den här servicen behåller sitt
// historiska 0-fallback för tal.
const firstString = firstNonEmptyString;

const firstNumber = (...values: unknown[]) => firstFiniteNumber(...values) ?? 0;

const firstStringArray = (...values: unknown[]) => {
  for (const value of values) {
    if (Array.isArray(value)) {
      return value.filter(
        (item): item is string => typeof item === "string" && item.trim().length > 0
      );
    }
  }

  return [];
};

const normalizeListingTag = (value: unknown): ListingTagDTO | null => {
  if (typeof value === "string") {
    const trimmed = value.normalize("NFC").trim();
    return trimmed.length > 0 ? { displayName: trimmed, tagKey: trimmed, icon: null } : null;
  }

  if (!isRecord(value)) {
    return null;
  }

  const displayName = firstString(
    value.displayName,
    value.name,
    value.label,
    value.value,
    value.key,
    value.tagKey
  );

  if (!displayName) {
    return null;
  }

  return {
    tagKey: firstString(value.tagKey, value.key) ?? null,
    displayName,
    icon: firstString(value.icon) ?? null,
  };
};

const normalizeListingTags = (...values: unknown[]): ListingTagDTO[] => {
  for (const value of values) {
    if (!Array.isArray(value)) {
      continue;
    }

    return value
      .map(normalizeListingTag)
      .filter((tag): tag is ListingTagDTO => tag !== null);
  }

  return [];
};

const normalizeNearbyLocation = (
  value: unknown
): ListingNearbyLocationDTO | null => {
  if (!isRecord(value)) {
    return null;
  }

  const location = firstString(value.location, value.type, value.name);
  if (!location) {
    return null;
  }

  return {
    location,
    lat: Number.isFinite(Number(value.lat)) ? Number(value.lat) : null,
    lng: Number.isFinite(Number(value.lng)) ? Number(value.lng) : null,
    details: firstString(value.details, value.description) ?? null,
  };
};

const normalizeNearbyLocations = (...values: unknown[]) => {
  for (const value of values) {
    if (!Array.isArray(value)) {
      continue;
    }

    return value
      .map(normalizeNearbyLocation)
      .filter((item): item is ListingNearbyLocationDTO => item !== null);
  }

  return [];
};

const normalizePageResponse = <T>(
  value: unknown,
  content: T[],
  page: number,
  size: number
): PageResponse<T> => {
  if (!isRecord(value)) {
    return {
      content,
      totalPages: content.length > 0 ? 1 : 0,
      totalElements: content.length,
      numberOfElements: content.length,
      size,
      number: page,
      first: page <= 0,
      last: true,
      empty: content.length === 0,
    };
  }

  const pageMetadata = isRecord(value.page) ? value.page : value;
  const totalElementsValue = Number(pageMetadata.totalElements);
  const totalElements = Number.isFinite(totalElementsValue)
    ? totalElementsValue
    : content.length;
  const totalPagesValue = Number(pageMetadata.totalPages);
  const totalPages = Number.isFinite(totalPagesValue)
    ? totalPagesValue
    : totalElements > 0
      ? Math.ceil(totalElements / size)
      : 0;
  const pageNumberValue = Number(pageMetadata.number);
  const responseSizeValue = Number(pageMetadata.size);

  return {
    ...(value as Partial<PageResponse<T>>),
    content,
    totalPages,
    totalElements,
    numberOfElements:
      Number.isFinite(Number(value.numberOfElements))
        ? Number(value.numberOfElements)
        : content.length,
    size: Number.isFinite(responseSizeValue) ? responseSizeValue : size,
    number: Number.isFinite(pageNumberValue) ? pageNumberValue : page,
    first:
      typeof value.first === "boolean"
        ? value.first
        : (Number.isFinite(pageNumberValue) ? pageNumberValue : page) <= 0,
    last:
      typeof value.last === "boolean"
        ? value.last
        : totalPages <= 0 ||
          (Number.isFinite(pageNumberValue) ? pageNumberValue : page) >=
            totalPages - 1,
    empty:
      typeof value.empty === "boolean" ? value.empty : content.length === 0,
    page: {
      size: Number.isFinite(responseSizeValue) ? responseSizeValue : size,
      number: Number.isFinite(pageNumberValue) ? pageNumberValue : page,
      totalElements,
      totalPages,
    },
  };
};

const normalizeListingCard = (value: unknown): ListingCardDTO | null => {
  const source = isRecord(value) && isRecord(value.listing) ? value.listing : value;
  if (!isRecord(source)) {
    return null;
  }

  const id = firstString(source.id, source.listingId);
  const title = firstString(source.title, source.listingTitle);
  if (!id || !title) {
    return null;
  }

  const images = firstStringArray(source.imageUrls, source.images);
  const area = firstString(source.area);
  const city = firstString(source.city);
  const location = firstString(source.location) ?? [area, city].filter(Boolean).join(", ");

  const requirementsProfileId =
    firstString(source.requirementsProfileId, source.requirementProfileId) ??
    null;

  return {
    id,
    imageUrl: firstString(source.imageUrl, source.listingImage, images[0]) ?? "",
    title,
    location: location || "Ej angivet",
    rent: firstNumber(source.rent),
    dwellingType: firstString(source.dwellingType) ?? "Bostad",
    dwellingTypeLabel: firstString(source.dwellingTypeLabel) ?? null,
    rooms: firstNumber(source.rooms),
    sizeM2: firstNumber(source.sizeM2),
    tags: normalizeListingTags(source.tags),
    hostType: firstString(source.hostType, source.ownerType) ?? "",
    hostName: firstString(source.hostName, source.ownerName),
    hostLogoUrl: firstString(source.hostLogoUrl, source.ownerLogoUrl),
    verifiedHost:
      typeof source.verifiedHost === "boolean"
        ? source.verifiedHost
        : typeof source.verifiedOwner === "boolean"
          ? source.verifiedOwner
          : false,
    lat:
      typeof source.lat === "number"
        ? source.lat
        : typeof source.latitude === "number"
          ? source.latitude
          : null,
    lng:
      typeof source.lng === "number"
        ? source.lng
        : typeof source.longitude === "number"
          ? source.longitude
          : null,
    status: firstString(source.status),
    applyBy: firstString(source.applyBy) ?? null,
    availableFrom: firstString(source.availableFrom) ?? null,
    availableTo: firstString(source.availableTo) ?? null,
    requirementProfileId: requirementsProfileId,
    requirementsProfileId,
    published: firstString(source.published) ?? null,
    nearbyLocations: normalizeNearbyLocations(
      source.nearbyLocations,
      source.nearbyLocatios
    ),
  };
};

export const normalizeListingCards = (items: unknown[]): ListingCardDTO[] =>
  items
    .map(normalizeListingCard)
    .filter((item): item is ListingCardDTO => item !== null);

const normalizeListingDetail = (dto: ListingDetailDTO): ListingDetailDTO => {
  const source = dto as ListingDetailDTO & Record<string, unknown>;

  return {
    ...dto,
    tags: normalizeListingTags(source.tags),
    dwellingTypeLabel: firstString(source.dwellingTypeLabel) ?? null,
    imageUrls: firstStringArray(source.imageUrls, source.images),
    requirementsProfileId:
      firstString(source.requirementsProfileId, source.requirementProfileId) ??
      null,
    published: firstString(source.published) ?? null,
    nearbyLocations: normalizeNearbyLocations(
      source.nearbyLocations,
      source.nearbyLocatios
    ),
  };
};

const normalizeListingTagDTO = (value: unknown): ListingTagDTO | null => {
  if (typeof value === "string") {
    const displayName = value.normalize("NFC").trim();
    return displayName ? { displayName, icon: null } : null;
  }

  if (!isRecord(value)) {
    return null;
  }

  const displayName = firstString(
    value.displayName,
    value.name,
    value.label,
    value.value,
    value.key
  )?.normalize("NFC");

  if (!displayName) {
    return null;
  }

  return {
    tagKey: firstString(value.tagKey, value.key) ?? null,
    displayName,
    icon: firstString(value.icon) ?? null,
  };
};

const normalizeRequirementsProfile = (
  value: unknown
): RequirementsProfileDTO | null => {
  if (!isRecord(value)) {
    return null;
  }

  return {
    id: firstString(value.id) ?? (value.id != null ? String(value.id) : null),
    title: firstString(value.title, value.displayName, value.name) ?? null,
    minAge: Number.isFinite(Number(value.minAge ?? value.minimumAge))
      ? Number(value.minAge ?? value.minimumAge)
      : null,
    maxAge: Number.isFinite(Number(value.maxAge ?? value.maximumAge))
      ? Number(value.maxAge ?? value.maximumAge)
      : null,
    description: firstString(value.description) ?? null,
    requiredDocuments: Array.isArray(value.requiredDocuments)
      ? value.requiredDocuments
          .filter((document): document is Record<string, unknown> => isRecord(document))
          .map((document) => ({
            caption:
              firstString(
                document.caption,
                document.documentName,
                document.displayName,
                document.name
              ) ?? null,
            validityDays: Number.isFinite(Number(document.validityDays))
              ? Number(document.validityDays)
              : null,
            mandatory:
              typeof document.mandatory === "boolean"
                ? document.mandatory
                : null,
            validTypes: Array.isArray(document.validTypes)
              ? document.validTypes.filter(
                  (type): type is string =>
                    typeof type === "string" && type.trim().length > 0
                )
              : firstString(document.documentType)
                ? [firstString(document.documentType)!]
                : [],
          }))
          .filter((document) => Boolean(document.caption) || document.validTypes.length > 0)
      : [],
  };
};

// --- Service ---

export const listingService = {

  /**
   * 1. HÄMTA FILTRERAT FLÖDE (Feed)
   * Uppdaterad för att stödja backend-filtrering.
   * Anropar: GET /api/listings?page=0&size=12&city=...&dwellingType=... etc.
   */
  getAll: async (
    pageOrParams: number | ListingSearchParams = 0,
    sizeOrOptions: number | ServiceOptions = LISTINGS_DEFAULT_PAGE_SIZE,
    city?: string | null,
    dwellingType?: string | null,
    minRent?: number | null,
    maxRent?: number | null,
    hostType?: string | null,
    positionalOptions?: ServiceOptions
  ): Promise<PageResponse<ListingCardDTO>> => {
    // Bygg query-objektet med alla filter som skickas från ListingsPage
    const options =
      typeof pageOrParams === "object" && typeof sizeOrOptions === "object"
        ? sizeOrOptions
        : positionalOptions;
    const size =
      typeof sizeOrOptions === "number" ? sizeOrOptions : LISTINGS_DEFAULT_PAGE_SIZE;

    const params: ListingSearchParams =
      typeof pageOrParams === "object"
        ? { page: 0, size: LISTINGS_DEFAULT_PAGE_SIZE, ...pageOrParams }
        : {
            page: pageOrParams,
            size,
            city,
            dwellingType,
            minRent,
            maxRent,
            hostType,
          };

    assertListingSearchEnums(params);

    const query = buildListingSearchQuery(params);
    const res = await apiClient<unknown>(
      `/listings${query}`,
      { auth: false, signal: options?.signal }
    );
    const content = normalizeListingCards(arrayFromApiResponse<unknown>(res));
    return normalizePageResponse(
      res,
      content,
      params.page ?? 0,
      params.size ?? LISTINGS_DEFAULT_PAGE_SIZE
    );
  },

  getFacets: async (
    params: ListingSearchParams = {},
    options?: ServiceOptions
  ): Promise<ListingSearchFacetsDTO> => {
    assertListingSearchEnums(params);
    return apiClient<ListingSearchFacetsDTO>(
      `/listings/facets${buildListingSearchQuery(params, false)}`,
      { auth: false, signal: options?.signal }
    );
  },

  getCities: async (options?: ServiceOptions): Promise<string[]> => {
    return cityService.listNames(options);
  },

  create: async (payload: PublishListingRequest): Promise<void> => {
    assertPublishListingEnums(payload);

    await apiClient<void>("/listings", {
      method: "POST",
      body: JSON.stringify(normalizePublishListingPayload(payload)),
    });
  },

  // 2. HÄMTA EN ANNONS (Detaljvy)
  // Anropar: GET /api/listings/{id}
  get: async (
    id: string,
    options?: ServiceOptions
  ): Promise<ListingDetailDTO> => {
    const detail = await apiClient<ListingDetailDTO>(`/listings/${pathSegment(id)}`, {
      auth: false,
      signal: options?.signal,
    });
    return detail ? normalizeListingDetail(detail) : detail;
  },

  incrementViews: async (
    id: string,
    type: ListingViewIncrementType
  ): Promise<void> => {
    await apiClient<void>(`/listings/${pathSegment(id)}/increment`, {
      method: "PUT",
      auth: false,
      body: JSON.stringify({ type }),
    });
  },

  update: async (id: string, payload: UpdateListingRequest): Promise<void> => {
    assertUpdateListingPayload(payload);

    await apiClient<void>(`/listings/${pathSegment(id)}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  updateMany: async (
    payload: UpdateMultipleListingsRequest | Record<string, UpdateListingRequest>
  ): Promise<void> => {
    const request =
      "listingDatas" in payload ? payload : { listingDatas: payload };

    Object.values(request.listingDatas).forEach(assertUpdateListingPayload);

    await apiClient<void>("/listings/modify", {
      method: "PUT",
      body: JSON.stringify(request),
    });
  },

  delete: async (id: string): Promise<void> => {
    await apiClient<void>(`/listings/${pathSegment(id)}`, {
      method: "DELETE",
    });
  },

  getMyListingsPage: async (
    page = 0,
    size = 200,
    options?: ServiceOptions
  ): Promise<PageResponse<ListingCardDTO>> => {
    const query = buildQuery({ page, size });
    const res = await apiClient<unknown>(`/listings/my${query}`, {
      signal: options?.signal,
    });
    const content = normalizeListingCards(arrayFromApiResponse<unknown>(res));
    return normalizePageResponse(res, content, page, size);
  },

  getMyListings: async (
    page = 0,
    size = 200,
    options?: ServiceOptions
  ): Promise<ListingCardDTO[]> => {
    const res = await listingService.getMyListingsPage(page, size, options);
    return res.content ?? [];
  },

  getByQueuePage: async (
    queueId: string,
    page = 0,
    size = 12,
    options?: ServiceOptions
  ): Promise<PageResponse<ListingCardDTO>> => {
    const query = buildQuery({ page, size });
    const res = await apiClient<unknown>(
      `/listings/queue/${pathSegment(queueId)}${query}`,
      { auth: false, signal: options?.signal }
    );
    const content = normalizeListingCards(arrayFromApiResponse<unknown>(res));
    return normalizePageResponse(res, content, page, size);
  },

  getByQueue: async (
    queueId: string,
    page = 0,
    size = 50
  ): Promise<ListingCardDTO[]> => {
    const res = await listingService.getByQueuePage(queueId, page, size);
    return res.content ?? [];
  },

  // 3. HÄMTA MINA ANSÖKNINGAR
  // Anropar: GET /api/applications/my
  getMyApplicationsPage: async (
    page = 0,
    size = 50,
    options?: ServiceOptions
  ): Promise<PageResponse<StudentApplicationDTO>> => {
    const query = buildQuery({ page, size });
    const res = await apiClient<unknown>(`/applications/my${query}`, {
      signal: options?.signal,
    });
    // Hantera både paginerat svar (PageResponse) och ren array
    const content = Array.isArray(res)
      ? (res as StudentApplicationDTO[])
      : arrayFromApiResponse<StudentApplicationDTO>(res);
    return normalizePageResponse(res, content, page, size);
  },

  getMyApplications: async (
    page = 0,
    size = 50,
    options?: ServiceOptions
  ): Promise<StudentApplicationDTO[]> => {
    const res = await listingService.getMyApplicationsPage(page, size, options);
    return res.content ?? [];
  },

// --- FAVORITER ---

  /**
   * Lägg till annons som favorit
   * Anropar: POST /api/listings/{id}/favorites
   */
  addFavorite: async (listingId: string): Promise<void> => {
    await apiClient(`/listings/${pathSegment(listingId)}/favorites`, {
      method: "POST",
    });
  },

  /**
   * Ta bort annons från favoriter
   * Anropar: DELETE /api/listings/{id}/favorites
   */
  removeFavorite: async (listingId: string): Promise<void> => {
    await apiClient(`/listings/${pathSegment(listingId)}/favorites`, {
      method: "DELETE",
    });
  },

  getFavoritesPage: async (
    page = 0,
    size = 200,
    options?: ServiceOptions
  ): Promise<PageResponse<ListingCardDTO>> => {
    const query = buildQuery({ page, size });
    const res = await apiClient<unknown>(`/listings/favorites${query}`, {
      signal: options?.signal,
    });
    const content = normalizeListingCards(
      Array.isArray(res) ? res : arrayFromApiResponse<unknown>(res)
    );
    return normalizePageResponse(res, content, page, size);
  },

  getFavorites: async (
    page = 0,
    size = 200,
    options?: ServiceOptions
  ): Promise<ListingCardDTO[]> => {
    const res = await listingService.getFavoritesPage(page, size, options);
    return res.content ?? [];
  },

  // --- ÖVRIGA METODER ---

  // Bakåtkompatibel alias-metod för ansökan.
  // Anropar: POST /api/listings/{id}/applications
  apply: async (listingId: string, message?: string): Promise<void> => {
    await apiClient(`/listings/${pathSegment(listingId)}/applications`, {
      method: "POST",
      body: applicationBody(message),
    });
  },

  // Dra tillbaka en ansökan
  // Anropar: DELETE /api/applications/{id}
  withdrawApplication: async (applicationId: number): Promise<void> => {
    await apiClient(`/applications/${pathSegment(applicationId)}`, {
      method: "DELETE",
    });
  },

  // Ansök till en företagsannons
  // Anropar: POST /api/listings/{id}/applications
  applyToListing: async (listingId: string, message?: string): Promise<void> => {
    await apiClient(`/listings/${pathSegment(listingId)}/applications`, {
      method: "POST",
      body: applicationBody(message),
    });
  },

  getListingApplicationsPage: async (
    listingId: string,
    page = 0,
    size = 50
  ): Promise<PageResponse<StudentApplicationDTO>> => {
    const query = buildQuery({ page, size });
    const res = await apiClient<unknown>(
      `/listings/${pathSegment(listingId)}/applications${query}`
    );
    const content = Array.isArray(res)
      ? (res as StudentApplicationDTO[])
      : arrayFromApiResponse<StudentApplicationDTO>(res);
    return normalizePageResponse(res, content, page, size);
  },

  getListingApplications: async (
    listingId: string,
    page = 0,
    size = 50
  ): Promise<StudentApplicationDTO[]> => {
    const res = await listingService.getListingApplicationsPage(
      listingId,
      page,
      size
    );
    return res.content ?? [];
  },

  // Hämta tillgängliga annonstaggar.
  // Anropar: GET /api/listingtags
  getListingTags: async (
    options?: ServiceOptions
  ): Promise<ListingTagDTO[]> => {
    const res = await apiClient<unknown>("/listingtags", {
      auth: false,
      signal: options?.signal,
    });

    return arrayFromApiResponse<unknown>(res)
      .map(normalizeListingTagDTO)
      .filter((tag): tag is ListingTagDTO => tag !== null);
  },

  getLocationCategories: async (): Promise<string[]> => {
    const categories = await apiClient<unknown>("/listings/location-categories", {
      auth: false,
    });

    return arrayFromApiResponse<unknown>(categories)
      .map((category) =>
        typeof category === "string"
          ? category
          : isRecord(category)
            ? firstString(category.category, category.name, category.googleType)
            : undefined
      )
      .filter((category): category is string => Boolean(category));
  },

  getRequirementsProfile: async (
    requirementsProfileId: string,
    options?: ServiceOptions
  ): Promise<RequirementsProfileDTO> => {
    const profile = await apiClient<unknown>(
      `/requirements-profiles/${pathSegment(requirementsProfileId)}`,
      { auth: false, signal: options?.signal }
    );
    return normalizeRequirementsProfile(profile) ?? {};
  },

  getRequirementsProfiles: async (): Promise<RequirementsProfileDTO[]> => {
    const profiles = await apiClient<unknown>("/requirements-profiles", {
      auth: false,
    });
    return arrayFromApiResponse<unknown>(profiles)
      .map(normalizeRequirementsProfile)
      .filter((profile): profile is RequirementsProfileDTO => profile !== null);
  },

  getRequirementsProfilesByCompany: async (
    companyId: number,
    options?: ServiceOptions
  ): Promise<RequirementsProfileDTO[]> => {
    const profiles = await apiClient<unknown>(
      `/requirements-profiles/company/${pathSegment(companyId)}`,
      { auth: false, signal: options?.signal }
    );
    return arrayFromApiResponse<unknown>(profiles)
      .map(normalizeRequirementsProfile)
      .filter((profile): profile is RequirementsProfileDTO => profile !== null);
  },

  // Ansök till en privat annons
  // Anropar: POST /api/applications/private/{id}
  applyToPrivateListing: async (listingId: string, message: string): Promise<void> => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) {
      throw new Error("Meddelande krävs för privata annonser.");
    }

    await apiClient(`/applications/private/${pathSegment(listingId)}`, {
      method: "POST",
      body: JSON.stringify({ message: trimmedMessage }),
    });
  },

  acceptOffer: async (applicationId: number): Promise<void> => {
    await apiClient<void>(`/applications/${pathSegment(applicationId)}/offer-accept`, {
      method: "POST",
    });
  },

  rejectOffer: async (applicationId: number): Promise<void> => {
    await apiClient<void>(`/applications/${pathSegment(applicationId)}/offer-reject`, {
      method: "POST",
    });
  },

};
