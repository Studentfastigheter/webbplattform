import { apiClient, buildQuery } from "@/lib/api-client";
import { School, Listing } from "@/types";
// Vi återanvänder mappern från listing-service för att hantera annons-objekten
import { mapListingDto, ApiCompanyListingDto, ApiPrivateListingDto } from "./listing-service";

// --- DTOs (Matchar Java-backendens respons exakt) ---

type ApiSchoolDto = {
  id: number;
  name: string;
  city?: string | null;
  lat?: number | null;
  lng?: number | null;
};

type ApiSchoolQueueDto = {
  companyId: number;
  companyName: string;
  userQueueDays?: number | null;
  listingsCount?: number | null;
};

type ApiListingResponse = {
  items: (ApiCompanyListingDto | ApiPrivateListingDto)[];
};

// Lokal typ om den saknas i @/types
export type SchoolQueueSummary = {
  companyId: number;
  companyName: string;
  userQueueDays: number;
  listingsCount: number;
};

// --- Mappers ---

const mapSchoolDto = (dto: ApiSchoolDto): School => ({
  id: dto.id,
  name: dto.name,
  city: dto.city ?? null,
  lat: dto.lat ?? null,
  lng: dto.lng ?? null,
});

// --- Service Methods ---

export const schoolService = {
  // 1. Sök efter skolor
  list: async (q?: string): Promise<School[]> => {
    const res = await apiClient<ApiSchoolDto[]>(`/schools${buildQuery({ q })}`);
    return res.map(mapSchoolDto);
  },

  // 2. Hitta annonser nära en skola
  getListingsNear: async (
    schoolId: number,
    radiusKm = 10,
    size = 12
  ): Promise<Listing[]> => {
    const query = buildQuery({ radiusKm, size });
    
    // Backend returnerar { items: [...] }
    const res = await apiClient<ApiListingResponse>(
      `/schools/${schoolId}/listings${query}`
    );

    // Mappa om varje DTO till vår Listing-typ
    return (res.items || []).map(mapListingDto);
  },

  // 3. Hitta bostadsköer relevanta för skolan
  getQueues: async (
    schoolId: number,
    radiusKm = 10
  ): Promise<SchoolQueueSummary[]> => {
    // Backend returnerar en lista av summaries
    const res = await apiClient<ApiSchoolQueueDto[]>(
      `/schools/${schoolId}/queues${buildQuery({ radiusKm })}`
    );

    return res.map(dto => ({
      companyId: dto.companyId,
      companyName: dto.companyName,
      userQueueDays: dto.userQueueDays ?? 0,
      listingsCount: dto.listingsCount ?? 0
    }));
  },
};