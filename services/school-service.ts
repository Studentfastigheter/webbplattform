import { apiClient, buildQuery } from "@/lib/api-client";
import { listingService } from "@/services/listing-service";
import { School } from "@/types";
import { ListingCardDTO } from "@/types/listing";

type ApiSchoolDto = {
  schoolId?: number;
  id?: number;
  name: string;
  city?: string | null;
  lat?: number | null;
  lng?: number | null;
};

type ApiSchoolQueueDto = {
  companyId: number;
  companyName: string;
  listingCount?: number | null;
  queueId: string;
  queueName: string;
  userQueueDays?: number | null;
};

export type SchoolQueueSummary = {
  companyId: number;
  companyName: string;
  listingCount: number;
  queueId: string;
  queueName: string;
  userQueueDays: number;
};

const mapSchoolDto = (dto: ApiSchoolDto): School => ({
  id: dto.schoolId ?? dto.id ?? 0,
  name: dto.name,
  city: dto.city ?? null,
  lat: dto.lat ?? null,
  lng: dto.lng ?? null,
});

export const schoolService = {
  list: async (q?: string): Promise<School[]> => {
    const res = await apiClient<ApiSchoolDto[]>(`/schools${buildQuery({ q })}`);
    return res.map(mapSchoolDto).filter((school) => school.id > 0);
  },

  getListingsNear: async (
    schoolId: number,
    size = 12
  ): Promise<ListingCardDTO[]> => {
    const schools = await schoolService.list();
    const school = schools.find((item) => item.id === schoolId);

    if (typeof school?.lat !== "number" || typeof school.lng !== "number") {
      return [];
    }

    const res = await listingService.getAll({
      page: 0,
      size,
      school_lat: school.lat,
      school_lng: school.lng,
    });

    return res.content ?? [];
  },

  getQueues: async (schoolId: number): Promise<SchoolQueueSummary[]> => {
    const res = await apiClient<ApiSchoolQueueDto[]>(
      `/schools/${schoolId}/queues`
    );

    return res.map((dto) => ({
      companyId: dto.companyId,
      companyName: dto.companyName,
      listingCount: dto.listingCount ?? 0,
      queueId: dto.queueId,
      queueName: dto.queueName,
      userQueueDays: dto.userQueueDays ?? 0,
    }));
  },
};
