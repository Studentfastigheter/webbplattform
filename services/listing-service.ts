import { apiClient, buildQuery } from "@/lib/api-client";
import {
  ListingWithRelations,
  ListingType,
  ListingImage,
  UserInterest,
  ListingActivity,
  RollingAd,
  // Dessa importerades inte i din screenshot, vilket orsakade felet "Cannot find name..."
  CompanyId,
  LandlordId,
} from "@/types";

// --- DTOs ---
export type ApiListingPublicDto = {
  id: string;
  area?: string | null;
  title: string;
  city?: string | null;
  rent?: number | null;
  primaryImageUrl?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  companyName?: string | null;
  distanceToSchoolKm?: number | null;
  sizeM2?: number | null;
  rooms?: number | null;
  dwellingType?: string | null;
  moveIn?: string | null;
  applyBy?: string | null;
  availableFrom?: string | null;
  tags?: string[] | null;
  images?: string[];
};

export type ApiListingPrivateDto = ApiListingPublicDto & {
  description?: string | null;
  address?: string | null;
  companyId?: number | null;
  landlordId?: number | null;
  landlordName?: string | null;
  listingType?: ListingType | string;
  userQueueDays?: number | null;
};

type ApiListingSearchResponse<T> = {
  items: T[];
  page: number;
  size: number;
  total: number;
  totalPages: number;
};

type ApiInterestDto = {
  listingId: string | null;
  title: string | null;
  city: string | null;
  rent: number | null;
  primaryImageUrl: string | null;
  companyName: string | null;
  createdAt: string;
};

type ApiActivityDto = {
  id: number;
  name: string;
  category: string;
  latitude?: number | null;
  longitude?: number | null;
  distanceKm?: number | null;
};

type RawAd = {
  id?: number;
  company?: string;
  start?: string;
  stop?: string;
  data?: unknown;
};

// --- Mappers ---
const toListingImages = (dto: {
  id: string;
  primaryImageUrl?: string | null;
  images?: string[];
}): ListingImage[] => {
  const urls: string[] = [];
  if (dto.primaryImageUrl) urls.push(dto.primaryImageUrl);
  if (dto.images?.length) urls.push(...dto.images);
  const unique = Array.from(new Set(urls));
  return unique.map((imageUrl, idx) => ({
    imageId: idx + 1,
    listingId: dto.id,
    imageUrl,
  }));
};

export const mapListingDto = (
  dto: ApiListingPublicDto | ApiListingPrivateDto
): ListingWithRelations => {
  const now = new Date().toISOString();
  
  const rawType =
    (dto as ApiListingPrivateDto).listingType ?? (dto as any).listingType;
  
  const isPrivate =
    rawType === "private" ||
    !!(dto as ApiListingPrivateDto).landlordId;

  // Säkra konverteringar till nummer (0 som fallback om det saknas)
  const landlordIdVal =
    isPrivate && "landlordId" in dto
      ? Number((dto as ApiListingPrivateDto).landlordId ?? 0)
      : 0;

  const companyIdVal =
    !isPrivate && "companyId" in dto && dto.companyId
      ? Number(dto.companyId)
      : 0;

  const advertiser =
    !isPrivate
      ? (dto.companyName || companyIdVal)
        ? {
            type: "company" as const,
            id: companyIdVal as CompanyId,
            displayName: dto.companyName ?? "Hyresvärd",
            city: dto.city ?? null,
          }
        : undefined
      : landlordIdVal
      ? {
          type: "private_landlord" as const,
          id: landlordIdVal as LandlordId,
          displayName:
            (dto as ApiListingPrivateDto).landlordName ??
            dto.companyName ??
            "Hyresvärd",
          city: dto.city ?? null,
        }
      : undefined;

  const baseListing = {
    listingId: dto.id,
    title: dto.title,
    area: dto.area ?? null,
    city: dto.city ?? null,
    address: "address" in dto ? dto.address ?? null : null,
    lat: dto.latitude ?? null,
    lng: dto.longitude ?? null,
    dwellingType: dto.dwellingType ?? null,
    rooms: dto.rooms ?? null,
    sizeM2: dto.sizeM2 ?? null,
    rent: dto.rent ?? null,
    moveIn: dto.moveIn ?? null,
    applyBy: dto.applyBy ?? null,
    availableFrom: dto.availableFrom ?? null,
    availableTo: null,
    description: "description" in dto ? dto.description ?? null : null,
    tags: dto.tags ?? [],
    images: toListingImages(dto),
    status: "available",
    createdAt: now,
    updatedAt: now,
    advertiser: advertiser as any,
  };

  if (isPrivate) {
    return {
      ...baseListing,
      listingType: "private",
      landlordId: landlordIdVal as LandlordId, // Nu definierat tack vare importen
    };
  } else {
    return {
      ...baseListing,
      listingType: "company",
      companyId: companyIdVal as CompanyId, // Nu definierat
    };
  }
};

const mapInterestDto = (dto: ApiInterestDto): UserInterest | null => {
  if (!dto.listingId) return null;
  return {
    listingId: dto.listingId,
    title: dto.title,
    city: dto.city,
    rent: dto.rent,
    primaryImageUrl: dto.primaryImageUrl,
    companyName: dto.companyName,
    createdAt: dto.createdAt,
  };
};

export type ListListingsParams = {
  q?: string;
  city?: string;
  minRent?: number;
  maxRent?: number;
  page?: number;
  size?: number;
  secure?: boolean;
};

export const listingService = {
  list: async (
    params?: ListListingsParams,
    token?: string
  ) => {
    const secure = params?.secure ?? Boolean(token);
    const endpoint = secure ? "/api/listings/secure" : "/api/listings";
    const query = buildQuery({
      q: params?.q,
      city: params?.city,
      minRent: params?.minRent,
      maxRent: params?.maxRent,
      page: params?.page,
      size: params?.size,
    });

    const res = await apiClient<ApiListingSearchResponse<ApiListingPublicDto>>(
      `${endpoint}${query}`,
      {},
      token
    );

    return {
      ...res,
      items: res.items.map(mapListingDto),
    };
  },

  get: async (listingId: string, options: { secure?: boolean; token?: string } = {}) => {
    const secure = options.secure ?? Boolean(options.token);
    const endpoint = secure
      ? `/api/listings/${listingId}/secure`
      : `/api/listings/${listingId}`;
    const dto = await apiClient<ApiListingPublicDto | ApiListingPrivateDto>(
      endpoint,
      {},
      options.token
    );
    return mapListingDto(dto);
  },

  registerInterest: async (listingId: string, token: string): Promise<void> => {
    await apiClient<void>(
      `/api/listings/${listingId}/interest`,
      { method: "POST" },
      token
    );
  },

  getActivities: async (listingId: string, radiusKm = 1.5): Promise<ListingActivity[]> => {
    return apiClient<ApiActivityDto[]>(
      `/api/listings/${listingId}/activities${buildQuery({ radiusKm })}`
    );
  },

  getMyInterests: async (token: string): Promise<UserInterest[]> => {
    const res = await apiClient<ApiInterestDto[]>("/api/interests/me", {}, token);
    return res.map(mapInterestDto).filter(Boolean) as UserInterest[];
  },

  getCurrentAds: async (token?: string): Promise<RollingAd[]> => {
    const ads = await apiClient<RawAd[]>("/api/ads/current", {}, token);
    return ads.map((ad) => ({
      id: ad.id,
      company: ad.company,
      data: ad.data,
    }));
  },
};