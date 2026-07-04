import {
  apiClient,
  arrayFromApiResponse,
  buildQuery,
  pathSegment,
  type ServiceOptions,
} from "@/lib/api/client";
import { normalizeCityCode } from "@/features/cities/services/city-service";
import { listingService } from "@/features/listings/services/listing-service";
import { School } from "@/types";
import { ListingCardDTO } from "@/types/listing";

type ApiSchoolDto = {
  schoolId?: number;
  id?: number;
  name: string;
  city?: string | null;
  cityCode?: string | null;
  city_code?: string | null;
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
  cityCode: dto.cityCode ?? dto.city_code ?? null,
  lat: dto.lat ?? null,
  lng: dto.lng ?? null,
});

export const schoolService = {
  list: async (q?: string, options?: ServiceOptions): Promise<School[]> => {
    const res = await apiClient<unknown>(`/schools${buildQuery({ q })}`, {
      auth: false,
      signal: options?.signal,
    });
    return arrayFromApiResponse<ApiSchoolDto>(res)
      .map(mapSchoolDto)
      .filter((school) => school.id > 0);
  },

  add: async (school: Omit<School, "id">): Promise<void> => {
    const cityCode = normalizeCityCode(school.cityCode);
    if (!cityCode) {
      throw new Error("Välj en stad innan du sparar skolan.");
    }

    await apiClient<void>("/schools/add", {
      method: "POST",
      body: JSON.stringify({
        schoolName: school.name,
        city: school.city || cityCode,
        cityCode,
        lat: school.lat,
        lng: school.lng,
      }),
    });
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
      schoolTargetLat: school.lat,
      schoolTargetLng: school.lng,
    });

    return res.content ?? [];
  },

  getQueues: async (schoolId: number): Promise<SchoolQueueSummary[]> => {
    const res = await apiClient<unknown>(
      `/schools/${pathSegment(schoolId)}/queues`,
      { auth: false }
    );

    return arrayFromApiResponse<ApiSchoolQueueDto>(res).map((dto) => ({
      companyId: dto.companyId,
      companyName: dto.companyName,
      listingCount: dto.listingCount ?? 0,
      queueId: dto.queueId,
      queueName: dto.queueName,
      userQueueDays: dto.userQueueDays ?? 0,
    }));
  },
};
