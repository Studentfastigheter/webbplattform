import { apiClient, buildQuery } from "@/lib/api-client";
import {
  ListingCardDTO,
  ListingDetailDTO,
  PageResponse,
  StudentApplicationDTO, // <--- NY IMPORT
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

// --- Service ---

export const listingService = {

  // 1. HÄMTA FLÖDET (Feed)
  // Anropar: GET /api/listings?page=0&size=12
  getAll: async (page = 0, size = 12): Promise<PageResponse<ListingCardDTO>> => {
    const query = buildQuery({ page, size });
    return await apiClient<PageResponse<ListingCardDTO>>(`/listings${query}`);
  },

  // 2. HÄMTA EN ANNONS (Detaljvy)
  // Anropar: GET /api/listings/{id}
  get: async (id: string): Promise<ListingDetailDTO> => {
    return await apiClient<ListingDetailDTO>(`/listings/${id}`);
  },

  // 3. HÄMTA MINA ANSÖKNINGAR (Ny metod!)
  // Anropar: GET /api/applications/my
  getMyApplications: async (): Promise<StudentApplicationDTO[]> => {
    return await apiClient<StudentApplicationDTO[]>("/applications/my");
  },

  // --- ÖVRIGA METODER ---

  // Ansök till en privat annons
  apply: async (listingId: string, message: string): Promise<void> => {
    await apiClient(`/applications/private/${listingId}`, {
      method: "POST",
      body: JSON.stringify({ message }),
    });
  },

  // Intresseanmälningar (för företag)
  registerInterest: async (listingId: string): Promise<void> => {
    await apiClient(`/listings/${listingId}/interest`, {
      method: "POST",
      body: JSON.stringify({}) 
    });
  },

  // Aktiviteter (karta/område)
  getActivities: async (listingId: string, radiusKm = 1.5): Promise<ListingActivity[]> => {
    try {
      const res = await apiClient<any[]>(
        `/listings/${listingId}/activities${buildQuery({ radiusKm })}`
      );
      
      return res.map((a) => ({
        id: a.id,
        name: a.name,
        category: a.category,
        distanceKm: a.distanceKm
      }));
    } catch (e) {
      console.error("Failed to load activities", e);
      return [];
    }
  },

  // Rullande annonser (Ads)
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