import {
  apiClient,
  arrayFromApiResponse,
  buildQuery,
  pathSegment,
} from "@/lib/api/client";
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

export type RollingAd = {
  id: number | string;
  start?: string;
  stop?: string;
  company?: string;
  data?: {
    imageUrl?: string;
    linkUrl?: string;
    headline?: string;
    ctaText?: string;
    [key: string]: unknown;
  } | null;
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
  /** @deprecated Use schoolTargetLat. Kept so older UI call sites still map to the current backend query name. */
  school_lat?: number | null;
  /** @deprecated Use schoolTargetLng. Kept so older UI call sites still map to the current backend query name. */
  school_lng?: number | null;
  amenities?: string[];
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

function buildListingSearchQuery(
  params: ListingSearchParams,
  includePageable = true
) {
  return buildQuery({
    ...(includePageable
      ? {
          page: params.page ?? 0,
          size: params.size ?? 12,
          sort: params.sort,
        }
      : {}),
    city: params.city?.trim(),
    dwellingType: normalizeDwellingTypeParam(params.dwellingType),
    minRent: params.minRent,
    maxRent: params.maxRent,
    minLivingArea: params.minLivingArea,
    maxLivingArea: params.maxLivingArea,
    exactRooms: params.exactRooms,
    minRooms: params.minRooms,
    maxRooms: params.maxRooms,
    hostType: normalizeHostTypeParam(params.hostType),
    schoolTargetLat: params.schoolTargetLat ?? params.school_lat,
    schoolTargetLng: params.schoolTargetLng ?? params.school_lng,
    maxDistanceToSchool: params.maxDistanceToSchool,
    amenities: params.amenities,
  });
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const firstString = (...values: unknown[]) =>
  values.find(
    (value): value is string => typeof value === "string" && value.trim().length > 0
  )?.trim();

const firstNumber = (...values: unknown[]) => {
  for (const value of values) {
    const numberValue =
      typeof value === "string" ? Number(value.replace(",", ".")) : Number(value);
    if (Number.isFinite(numberValue)) {
      return numberValue;
    }
  }

  return 0;
};

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
    size = LISTINGS_DEFAULT_PAGE_SIZE,
    city?: string | null,
    dwellingType?: string | null,
    minRent?: number | null,
    maxRent?: number | null,
    hostType?: string | null
  ): Promise<PageResponse<ListingCardDTO>> => {
    // Bygg query-objektet med alla filter som skickas från ListingsPage
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
      { auth: false }
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
    params: ListingSearchParams = {}
  ): Promise<ListingSearchFacetsDTO> => {
    assertListingSearchEnums(params);
    return apiClient<ListingSearchFacetsDTO>(
      `/listings/facets${buildListingSearchQuery(params, false)}`,
      { auth: false }
    );
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
  get: async (id: string): Promise<ListingDetailDTO> => {
    const detail = await apiClient<ListingDetailDTO>(`/listings/${pathSegment(id)}`, {
      auth: false,
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
    if (payload.status && !isListingStatus(payload.status)) {
      throw new Error("Ogiltig annonsstatus.");
    }

    await apiClient<void>(`/listings/${pathSegment(id)}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  delete: async (id: string): Promise<void> => {
    await apiClient<void>(`/listings/${pathSegment(id)}`, {
      method: "DELETE",
    });
  },

  getMyListingsPage: async (
    page = 0,
    size = 200
  ): Promise<PageResponse<ListingCardDTO>> => {
    const query = buildQuery({ page, size });
    const res = await apiClient<unknown>(`/listings/my${query}`);
    const content = normalizeListingCards(arrayFromApiResponse<unknown>(res));
    return normalizePageResponse(res, content, page, size);
  },

  getMyListings: async (page = 0, size = 200): Promise<ListingCardDTO[]> => {
    const res = await listingService.getMyListingsPage(page, size);
    return res.content ?? [];
  },

  getQueueListings: async (
    queueId: string,
    page = 0,
    size = 12
  ): Promise<PageResponse<ListingCardDTO>> => {
    const query = buildQuery({ page, size });
    const res = await apiClient<unknown>(
      `/listings/queue/${pathSegment(queueId)}${query}`,
      { auth: false }
    );
    const content = normalizeListingCards(arrayFromApiResponse<unknown>(res));
    return normalizePageResponse(res, content, page, size);
  },

  // 3. HÄMTA MINA ANSÖKNINGAR
  // Anropar: GET /api/applications/my
  getMyApplicationsPage: async (
    page = 0,
    size = 50
  ): Promise<PageResponse<StudentApplicationDTO>> => {
    const query = buildQuery({ page, size });
    const res = await apiClient<unknown>(`/applications/my${query}`);
    // Hantera både paginerat svar (PageResponse) och ren array
    const content = Array.isArray(res)
      ? (res as StudentApplicationDTO[])
      : arrayFromApiResponse<StudentApplicationDTO>(res);
    return normalizePageResponse(res, content, page, size);
  },

  getMyApplications: async (page = 0, size = 50): Promise<StudentApplicationDTO[]> => {
    const res = await listingService.getMyApplicationsPage(page, size);
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
    size = 200
  ): Promise<PageResponse<ListingCardDTO>> => {
    const query = buildQuery({ page, size });
    const res = await apiClient<unknown>(`/listings/favorites${query}`);
    const content = normalizeListingCards(
      Array.isArray(res) ? res : arrayFromApiResponse<unknown>(res)
    );
    return normalizePageResponse(res, content, page, size);
  },

  getFavorites: async (page = 0, size = 200): Promise<ListingCardDTO[]> => {
    const res = await listingService.getFavoritesPage(page, size);
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
  getListingTags: async (): Promise<ListingTagDTO[]> => {
    const res = await apiClient<unknown>("/listingtags", { auth: false });

    return arrayFromApiResponse<unknown>(res)
      .map(normalizeListingTagDTO)
      .filter((tag): tag is ListingTagDTO => tag !== null);
  },

  getRequirementsProfile: async (
    requirementsProfileId: string
  ): Promise<RequirementsProfileDTO> => {
    const profile = await apiClient<unknown>(
      `/requirements-profiles/${pathSegment(requirementsProfileId)}`,
      { auth: false }
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
    companyId: number
  ): Promise<RequirementsProfileDTO[]> => {
    const profiles = await apiClient<unknown>(
      `/requirements-profiles/company/${pathSegment(companyId)}`,
      { auth: false }
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

  // Aktiviteter (karta/område)
  /**
   * Rullande annonser (Ads)
   * Hämtar annonser som är aktiva just nu från backend.
   */
  getCurrentAds: async (): Promise<RollingAd[]> => {
    try {
      const ads = await apiClient<unknown>("/ads/current", { auth: false });

      return arrayFromApiResponse<unknown>(ads)
        .filter((ad): ad is {
          id: number | string;
          start?: unknown;
          stop?: unknown;
          company?: unknown;
          data?: unknown;
        } => (
          typeof ad === "object" &&
          ad !== null &&
          "id" in ad &&
          (typeof ad.id === "number" || typeof ad.id === "string")
        ))
        .map((ad) => ({
          id: ad.id,
          start: typeof ad.start === "string" ? ad.start : undefined,
          stop: typeof ad.stop === "string" ? ad.stop : undefined,
          company: typeof ad.company === "string" ? ad.company : undefined,
          data:
            typeof ad.data === "object" && ad.data !== null
              ? (ad.data as RollingAd["data"])
              : null,
        }));
    } catch (e) {
      console.error("Kunde inte hämta annonser:", e);
      return [];
    }
  },
};
