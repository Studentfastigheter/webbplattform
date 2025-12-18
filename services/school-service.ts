import { apiClient, buildQuery } from "@/lib/api-client";
import { School, SchoolQueueSummary, ListingWithRelations } from "@/types";
// Vi lånar mappers från listing-service för att hantera listing-objekt
import { mapListingDto, ApiListingPublicDto } from "./listing-service";

// --- DTOs ---
type ApiSchoolDto = {
  id: number;
  name: string;
  city?: string | null;
  latitude?: number | null;
  longitude?: number | null;
};

type ApiSchoolQueueDto = {
  companyId: number;
  companyName: string;
  userQueueDays?: number | null;
  listingsCount?: number | null;
};

// --- Mappers ---
const mapSchoolDto = (dto: ApiSchoolDto): School => ({
  schoolId: dto.id,
  schoolName: dto.name,
  city: dto.city ?? null,
  lat: dto.latitude ?? null,
  lng: dto.longitude ?? null,
});

// --- Service Methods ---
export const schoolService = {
  list: async (q?: string): Promise<School[]> => {
    const res = await apiClient<ApiSchoolDto[]>(`/api/schools${buildQuery({ q })}`);
    return res.map(mapSchoolDto);
  },

  getListingsNear: async (
    schoolId: number,
    radiusKm = 10,
    size = 12
  ): Promise<ListingWithRelations[]> => {
    const query = buildQuery({ radiusKm, size });
    // Vi hämtar datan som matchar ListingPublicDto
    const res = await apiClient<{ items: ApiListingPublicDto[] }>(
      `/api/schools/${schoolId}/listings${query}`
    );
    // Vi använder listing-service's mapper för att få korrekt domän-objekt
    return (res.items || []).map(mapListingDto);
  },

  getQueues: async (
    schoolId: number,
    radiusKm = 10
  ): Promise<SchoolQueueSummary[]> => {
    return apiClient<ApiSchoolQueueDto[]>(
      `/api/schools/${schoolId}/queues${buildQuery({ radiusKm })}`
    );
  },
};