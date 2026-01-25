import { apiClient, buildQuery } from "@/lib/api-client";
import {
  ListingCardDTO,
  ListingDetailDTO,
  PageResponse,
  StudentApplicationDTO,
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

  /**
   * 1. HÄMTA FILTRERAT FLÖDE (Feed)
   * Uppdaterad för att stödja backend-filtrering.
   * Anropar: GET /api/listings?page=0&size=12&city=...&dwellingType=... etc.
   */
  getAll: async (
    page = 0, 
    size = 12, 
    city?: string | null,
    dwellingType?: string | null,
    minRent?: number | null,
    maxRent?: number | null,
    hostType?: string | null
  ): Promise<PageResponse<ListingCardDTO>> => {
    // Bygg query-objektet med alla filter som skickas från ListingsPage
    const queryParams: Record<string, any> = { 
      page, 
      size 
    };

    if (city)
      queryParams.city = city;
    if (dwellingType)
      queryParams.dwellingType = dwellingType;
    if (minRent !== null)
      queryParams.minRent = minRent;
    if (maxRent !== null)
      queryParams.maxRent = maxRent;
    if (hostType)
      queryParams.hostType = hostType;

    const query = buildQuery(queryParams);
    return await apiClient<PageResponse<ListingCardDTO>>(`/listings${query}`);
  },

  // 2. HÄMTA EN ANNONS (Detaljvy)
  // Anropar: GET /api/listings/{id}
  get: async (id: string): Promise<ListingDetailDTO> => {
    return await apiClient<ListingDetailDTO>(`/listings/${id}`);
  },

  // 3. HÄMTA MINA ANSÖKNINGAR
  // Anropar: GET /api/applications/my
  getMyApplications: async (): Promise<StudentApplicationDTO[]> => {
    return await apiClient<StudentApplicationDTO[]>("/applications/my");
  },

// --- FAVORITER ---

  /**
   * Lägg till annons som favorit
   * Anropar: POST /api/listings/{id}/favorite
   */
  addFavorite: async (listingId: string): Promise<void> => {
    await apiClient(`/listings/${listingId}/favorite`, {
      method: "POST",
    });
  },

  /**
   * Ta bort annons från favoriter
   * Anropar: DELETE /api/listings/{id}/favorite
   */
  removeFavorite: async (listingId: string): Promise<void> => {
    await apiClient(`/listings/${listingId}/favorite`, {
      method: "DELETE",
    });
  },

  getFavorites: async (): Promise<ListingCardDTO[]> => {
    return await apiClient<ListingCardDTO[]>("/listings/favorites");
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

  /**
   * Rullande annonser (Ads)
   * Hämtar annonser som är aktiva just nu från backend.
   */
  getCurrentAds: async (): Promise<RollingAd[]> => {
    try {
      const ads = await apiClient<any[]>("/ads/current");
      
      return ads.map((ad) => ({
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
