import { apiClient, buildQuery } from "@/lib/api-client";
import {
  Listing,
  CompanyListing,
  PrivateListing,
  ListingImage,
  ListingStatus,
} from "@/types";

// --- Lokala typer (Dessa saknades i din listing.ts men behövs för funktionerna) ---
export type ListingType = "company" | "private";

export type ListingActivity = {
  id: number;
  name: string;
  category: string;
  distanceKm?: number | null;
};

export type RollingAd = {
  id: number | string;
  company?: string;
  data?: unknown;
};

// --- DTOs (Data Transfer Objects från Backend) ---

// VIKTIGT: Vi exporterar dessa så school-service.ts kan använda dem
export type ApiBaseListingDto = {
  id: string; // UUID
  title: string;
  area?: string | null;
  city?: string | null;
  address?: string | null;
  latitude?: number | null; 
  longitude?: number | null;
  lat?: number | null; 
  lng?: number | null;
  dwellingType?: string | null;
  rooms?: number | null;
  sizeM2?: number | null;
  rent?: number | null;
  moveIn?: string | null;
  applyBy?: string | null;
  availableFrom?: string | null;
  availableTo?: string | null;
  description?: string | null;
  tags?: string[] | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  images?: string[] | { imageId: number; imageUrl: string }[]; 
};

export type ApiCompanyListingDto = ApiBaseListingDto & {
  company: any; // Mappas till User
};

export type ApiPrivateListingDto = ApiBaseListingDto & {
  landlord: any; // Mappas till User
  applicationCount?: number | null;
};

type ApiListingResponse = {
  company: ApiCompanyListingDto[];
  private: ApiPrivateListingDto[];
};

type ApiActivityDto = {
  id: number;
  name: string;
  category: string;
  latitude?: number | null;
  longitude?: number | null;
  distanceKm?: number | null;
};

// --- Mappers ---

const mapImages = (dto: ApiBaseListingDto): ListingImage[] => {
  if (!dto.images || dto.images.length === 0) return [];
  
  return dto.images.map((img, index) => {
    if (typeof img === 'string') {
      return {
        id: index, // Temporärt ID
        imageUrl: img,
        createdAt: dto.createdAt
      };
    } else {
      return {
        id: img.imageId,
        imageUrl: img.imageUrl,
        createdAt: dto.createdAt
      };
    }
  });
};

export const mapListingDto = (
  dto: ApiCompanyListingDto | ApiPrivateListingDto
): Listing => {
  // Gemensamma fält
  const baseListing = {
    id: dto.id,
    title: dto.title,
    area: dto.area ?? null,
    city: dto.city ?? null,
    address: dto.address ?? null,
    lat: dto.lat ?? dto.latitude ?? null,
    lng: dto.lng ?? dto.longitude ?? null,
    dwellingType: dto.dwellingType ?? null,
    rooms: dto.rooms ?? null,
    sizeM2: dto.sizeM2 ?? null,
    rent: dto.rent ?? null,
    moveIn: dto.moveIn ?? null,
    applyBy: dto.applyBy ?? null,
    availableFrom: dto.availableFrom ?? null,
    availableTo: dto.availableTo ?? null,
    description: dto.description ?? null,
    tags: dto.tags ?? [],
    status: dto.status as ListingStatus,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
    images: mapImages(dto),
  };

  if ("landlord" in dto) {
    return {
      ...baseListing,
      landlord: dto.landlord,
      applicationCount: dto.applicationCount ?? 0,
    } as PrivateListing;
  } else {
    return {
      ...baseListing,
      company: dto.company,
    } as CompanyListing;
  }
};

// --- Service ---

export type ListListingsParams = {
  q?: string;
  city?: string;
  minRent?: number;
  maxRent?: number;
};

export const listingService = {
  // Hämta alla annonser
  list: async (params?: ListListingsParams): Promise<Listing[]> => {
    const res = await apiClient<ApiListingResponse>("/listings");
    
    const companyListings = (res.company || []).map(dto => mapListingDto(dto));
    const privateListings = (res.private || []).map(dto => mapListingDto(dto));

    let allListings = [...companyListings, ...privateListings];

    if (params?.city) {
      allListings = allListings.filter(l => 
        l.city?.toLowerCase() === params.city?.toLowerCase()
      );
    }

    return allListings;
  },

  // Hämta en specifik annons
  get: async (id: string, type: ListingType): Promise<Listing> => {
    const endpoint = type === "company" 
      ? `/listings/company/${id}` 
      : `/listings/private/${id}`;
      
    const dto = await apiClient<ApiCompanyListingDto | ApiPrivateListingDto>(endpoint);
    return mapListingDto(dto);
  },

  // Ansök till en privat annons
  apply: async (listingId: string, message: string): Promise<void> => {
    await apiClient(`/applications/private/${listingId}`, {
      method: "POST",
      body: JSON.stringify({ message }),
    });
  },

  // Intresseanmälningar
  registerInterest: async (listingId: string): Promise<void> => {
    await apiClient(`/listings/${listingId}/interest`, {
      method: "POST",
    });
  },

  // Aktiviteter
  getActivities: async (listingId: string, radiusKm = 1.5): Promise<ListingActivity[]> => {
    try {
      const res = await apiClient<ApiActivityDto[]>(
        `/listings/${listingId}/activities${buildQuery({ radiusKm })}`
      );
      return res.map(a => ({
        id: a.id,
        name: a.name,
        category: a.category,
        distanceKm: a.distanceKm
      }));
    } catch (e) {
      return [];
    }
  },

  // Rullande annonser
  getCurrentAds: async (): Promise<RollingAd[]> => {
    try {
      const ads = await apiClient<any[]>("/ads/current");
      return ads.map((ad) => ({
        id: ad.id,
        company: ad.company,
        data: ad.data,
      }));
    } catch (e) {
      return [];
    }
  },
};