import { apiClient, buildQuery } from "@/lib/api-client";
import { School } from "@/types";
// VIKTIGT: Vi importerar den nya DTO:n istället för den gamla Listing-typen
import { ListingCardDTO } from "@/types/listing";

// --- DTOs ---

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

// Lokal typ för kö-summering
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
  // Vi returnerar nu ListingCardDTO[] istället för den gamla Listing[]
  getListingsNear: async (
    schoolId: number,
    radiusKm = 10,
    size = 12
  ): Promise<ListingCardDTO[]> => {
    const query = buildQuery({ radiusKm, size });
    
    // Vi antar att backend nu returnerar en lista av ListingCardDTO direkt
    // (Om backend returnerar en PageResponse, ändra till <PageResponse<ListingCardDTO>> och returnera res.content)
    const res = await apiClient<ListingCardDTO[]>(
      `/schools/${schoolId}/listings${query}`
    );

    // Ingen mappning behövs längre, DTO:n är redo för kortet!
    return res;
  },

  // 3. Hitta bostadsköer relevanta för skolan
  getQueues: async (
    schoolId: number,
    radiusKm = 10
  ): Promise<SchoolQueueSummary[]> => {
    const res = await apiClient<ApiSchoolQueueDto[]>(
      `/schools/${schoolId}/queues${buildQuery({ radiusKm })}`
    );

    return res.map((dto) => ({
      companyId: dto.companyId,
      companyName: dto.companyName,
      userQueueDays: dto.userQueueDays ?? 0,
      listingsCount: dto.listingsCount ?? 0,
    }));
  },
};