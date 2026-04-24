import { apiClient, buildQuery } from "@/lib/api-client";
import {
  ListingCardDTO,
  ListingDetailDTO,
  PageResponse,
  PublishListingRequest,
  StudentApplicationDTO,
  UpdateListingRequest,
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
  company?: string;
  data?: unknown;
};

export type ListingSearchParams = {
  page?: number;
  size?: number;
  sort?: string | string[];
  city?: string | null;
  dwellingType?: string | null;
  minRent?: number | null;
  maxRent?: number | null;
  hostType?: string | null;
  school_lat?: number | null;
  school_lng?: number | null;
  amenities?: string[];
};

// --- Mock Coordinates Utility ---
// En enkel fallback för att generera koordinater om backend inte levererar dem (t.ex. vid mock/demo-data).
const addMockCoordinates = <T extends {
  lat?: number | null;
  lng?: number | null;
  title: string;
  location?: string | null;
  city?: string | null;
  area?: string | null;
  fullAddress?: string | null;
}>(dto: T): T => {
  if (typeof dto.lat === "number" && typeof dto.lng === "number") return dto;

  // Deterministisk offset baserad på titel/plats för att de inte ska alla ligga på exakt samma pixel (hash algorithm)
  const titleLower = dto.title?.toLowerCase() || "";
  const locLower = [dto.location, dto.city, dto.area, dto.fullAddress]
    .filter((value): value is string => typeof value === "string" && value.length > 0)
    .join(" ")
    .toLowerCase();
  
  let hash = 0;
  for (let i = 0; i < titleLower.length; i++) {
    hash = ((hash << 5) - hash) + titleLower.charCodeAt(i);
    hash |= 0;
  }
  const randomOffsetLat = (Math.abs(hash) % 100) * 0.0001 - 0.005;
  const randomOffsetLng = (Math.abs(hash >> 2) % 100) * 0.0001 - 0.005;
  
  let lat = 57.708870; // Göteborg center
  let lng = 11.974560;

  if (titleLower.includes("pennygången")) {
    lat = 57.6749 + randomOffsetLat;
    lng = 11.9329 + randomOffsetLng;
  } else if (titleLower.includes("högsbogatan")) {
    lat = 57.6811 + randomOffsetLat;
    lng = 11.9366 + randomOffsetLng;
  } else if (titleLower.includes("långgatan")) {
    lat = 57.6993 + randomOffsetLat;
    lng = 11.9482 + randomOffsetLng;
  } else if (locLower.includes("stockholm")) {
    lat = 59.3293 + randomOffsetLat * 10;
    lng = 18.0686 + randomOffsetLng * 10;
  } else {
    // Other Gothenburg locations spread further out
    lat += randomOffsetLat * 5;
    lng += randomOffsetLng * 5;
  }

  return { ...dto, lat, lng };
};

// --- Service ---

export const listingService = {

  // Publicera en ny annons som den inloggade användaren.
  publish: async (payload: PublishListingRequest): Promise<void> => {
    const { companyId: _companyId, ...requestPayload } = payload;

    await apiClient<void>("/listings", {
      method: "POST",
      body: JSON.stringify(requestPayload),
    });
  },

  /**
   * 1. HÄMTA FILTRERAT FLÖDE (Feed)
   * Uppdaterad för att stödja backend-filtrering.
   * Anropar: GET /api/listings?page=0&size=12&city=...&dwellingType=... etc.
   */
  getAll: async (
    pageOrParams: number | ListingSearchParams = 0,
    size = 12,
    city?: string | null,
    dwellingType?: string | null,
    minRent?: number | null,
    maxRent?: number | null,
    hostType?: string | null
  ): Promise<PageResponse<ListingCardDTO>> => {
    // Bygg query-objektet med alla filter som skickas från ListingsPage
    const params: ListingSearchParams =
      typeof pageOrParams === "object"
        ? { page: 0, size: 12, ...pageOrParams }
        : {
            page: pageOrParams,
            size,
            city,
            dwellingType,
            minRent,
            maxRent,
            hostType,
          };

    const query = buildQuery({
      page: params.page ?? 0,
      size: params.size ?? 12,
      sort: params.sort,
      city: params.city?.trim(),
      dwellingType: params.dwellingType,
      minRent: params.minRent,
      maxRent: params.maxRent,
      hostType: params.hostType,
      school_lat: params.school_lat,
      school_lng: params.school_lng,
      amenities: params.amenities,
    });
    const res = await apiClient<PageResponse<ListingCardDTO>>(`/listings${query}`);
    if (res && res.content) {
      res.content = res.content.map(addMockCoordinates);
    }
    return res;
  },

  // 2. HÄMTA EN ANNONS (Detaljvy)
  // Anropar: GET /api/listings/{id}
  get: async (id: string): Promise<ListingDetailDTO> => {
    const detail = await apiClient<ListingDetailDTO>(`/listings/${id}`);
    return detail ? addMockCoordinates(detail) : detail;
  },

  update: async (id: string, payload: UpdateListingRequest): Promise<void> => {
    await apiClient<void>(`/listings/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  delete: async (id: string): Promise<void> => {
    await apiClient<void>(`/listings/${id}`, {
      method: "DELETE",
    });
  },

  getMyListings: async (page = 0, size = 200): Promise<ListingCardDTO[]> => {
    const query = buildQuery({ page, size });
    const res = await apiClient<PageResponse<ListingCardDTO>>(`/listings/my${query}`);
    return (res?.content ?? []).map(addMockCoordinates);
  },

  // 3. HÄMTA MINA ANSÖKNINGAR
  // Anropar: GET /api/applications/my
  getMyApplications: async (page = 0, size = 50): Promise<StudentApplicationDTO[]> => {
    const query = buildQuery({ page, size });
    const res = await apiClient<any>(`/applications/my${query}`);
    // Hantera både paginerat svar (PageResponse) och ren array
    if (res?.content && Array.isArray(res.content)) return res.content;
    if (Array.isArray(res)) return res;
    return [];
  },

// --- FAVORITER ---

  /**
   * Lägg till annons som favorit
   * Anropar: POST /api/listings/{id}/favorite
   */
  addFavorite: async (listingId: string): Promise<void> => {
    await apiClient(`/listings/${listingId}/favorites`, {
      method: "POST",
    });
  },

  /**
   * Ta bort annons från favoriter
   * Anropar: DELETE /api/listings/{id}/favorites
   */
  removeFavorite: async (listingId: string): Promise<void> => {
    await apiClient(`/listings/${listingId}/favorites`, {
      method: "DELETE",
    });
  },

  getFavorites: async (page = 0, size = 200): Promise<ListingCardDTO[]> => {
    const query = buildQuery({ page, size });
    const res = await apiClient<any>(`/listings/favorites${query}`);
    
    // Check if it's returning a list of StudentLikedListing where the actual listing is embedded
    if (Array.isArray(res)) {
      if (res.length > 0 && res[0].listing) {
        return res.map((r: any) => addMockCoordinates(r.listing));
      }
      return res.map((r: any) => addMockCoordinates(r));
    }
    
    // Check if it's a page response
    if (res && res.content) {
      return res.content.map((r: any) => addMockCoordinates(r.listing ? r.listing : r));
    }
    
    return [];
  },

  // --- ÖVRIGA METODER ---

  // Bakåtkompatibel alias-metod för ansökan.
  // Anropar: POST /api/listings/{id}/applications
  apply: async (listingId: string, _message?: string): Promise<void> => {
    await apiClient(`/listings/${listingId}/applications`, {
      method: "POST",
    });
  },

  // Dra tillbaka en ansökan
  // Anropar: DELETE /api/applications/{id}
  withdrawApplication: async (applicationId: number): Promise<void> => {
    await apiClient(`/applications/${applicationId}`, {
      method: "DELETE",
    });
  },

  // Ansök till en företagsannons
  // Anropar: POST /api/listings/{id}/applications
  applyToListing: async (listingId: string, _message?: string): Promise<void> => {
    await apiClient(`/listings/${listingId}/applications`, {
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
      const ads = await apiClient<unknown[]>("/ads/current");
      if (!Array.isArray(ads)) {
        return [];
      }
      
      return ads
        .filter((ad): ad is { id: number | string; company?: string; data?: unknown } => (
          typeof ad === "object" &&
          ad !== null &&
          "id" in ad &&
          (typeof ad.id === "number" || typeof ad.id === "string")
        ))
        .map((ad) => ({
          id: ad.id,
          company: ad.company, // Matchar 'company' i Java-modellen
          data: ad.data,       // Innehåller JsonNode (JSONB)
        }));
    } catch (e) {
      console.error("Kunde inte hämta annonser:", e);
      return [];
    }
  },
};
