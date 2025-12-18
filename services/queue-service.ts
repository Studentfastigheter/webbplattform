import { apiClient, buildQuery } from "@/lib/api-client";
import {
  HousingQueueWithRelations,
  QueueStatus,
  QueueEntry,
  CompanyAccount,
} from "@/types";

// --- DTOs ---
type ApiQueueCompanyDto = {
  id: number;
  name: string;
  city?: string | null;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  subtitle?: string | null;
  description?: string | null;
  website?: string | null;
  rating?: number | null;
  verified?: boolean | null;
  tags?: string[] | null;
};

type ApiQueueDto = {
  id: string;
  companyId: number;
  name: string;
  area?: string | null;
  city?: string | null;
  description?: string | null;
  status: string;
  totalUnits?: number | null;
  feeInfo?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  website?: string | null;
  tags?: string[] | null;
  approximateWaitDays?: number | null;
  updatedAt?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  company?: ApiQueueCompanyDto | null;
};

type ApiQueueEntryDto = {
  queueId: string;
  companyId: number;
  queueName: string;
  companyName: string;
  joinedAt: string;
  queueDays: number;
};

// --- Mappers ---
const mapQueueCompany = (
  company?: ApiQueueCompanyDto | null
): CompanyAccount | undefined => {
  if (!company) return undefined;
  const now = new Date().toISOString();
  return {
    companyId: company.id,
    type: "company",
    email: "",
    passwordHash: "",
    createdAt: now,
    phone: null,
    logoUrl: company.logoUrl ?? null,
    bannerUrl: company.bannerUrl ?? null,
    tags: company.tags ?? null,
    settings: null,
    name: company.name,
    orgNumber: null,
    city: company.city ?? null,
    website: company.website ?? null,
    rating: company.rating ?? null,
    subtitle: company.subtitle ?? null,
    description: company.description ?? null,
    contactEmail: null,
    contactPhone: null,
    contactNote: null,
    verified: Boolean(company.verified),
  };
};

const mapQueueDto = (dto: ApiQueueDto): HousingQueueWithRelations => {
  const now = dto.updatedAt ?? new Date().toISOString();
  return {
    queueId: dto.id,
    companyId: dto.companyId,
    name: dto.name,
    area: dto.area ?? null,
    city: dto.city ?? null,
    lat: dto.latitude ?? null,
    lng: dto.longitude ?? null,
    description: dto.description ?? null,
    status: (dto.status as QueueStatus) ?? "open",
    totalUnits: dto.totalUnits ?? null,
    feeInfo: dto.feeInfo ?? null,
    contactEmail: dto.contactEmail ?? null,
    contactPhone: dto.contactPhone ?? null,
    website: dto.website ?? null,
    tags: dto.tags ?? [],
    approximateWaitDays: dto.approximateWaitDays ?? null,
    createdAt: now,
    updatedAt: now,
    company: mapQueueCompany(dto.company),
  };
};

// --- Service Methods ---
export const queueService = {
  list: async (): Promise<HousingQueueWithRelations[]> => {
    const res = await apiClient<ApiQueueDto[]>("/api/queues");
    return res.map(mapQueueDto);
  },

  get: async (queueId: string): Promise<HousingQueueWithRelations> => {
    const res = await apiClient<ApiQueueDto>(`/api/queues/${queueId}`);
    return mapQueueDto(res);
  },

  join: async (companyId: number, token: string): Promise<void> => {
    await apiClient<void>(
      `/api/queues/join${buildQuery({ companyId })}`,
      { method: "POST" },
      token
    );
  },

  joinAll: async (
    token: string,
    options?: { schoolId?: number; radiusKm?: number }
  ): Promise<QueueEntry[]> => {
    const query = buildQuery({
      schoolId: options?.schoolId,
      radiusKm: options?.radiusKm ?? 10,
    });
    return apiClient<ApiQueueEntryDto[]>(
      `/api/queues/join-all${query}`,
      { method: "POST" },
      token
    );
  },

  exit: async (companyId: number, token: string): Promise<void> => {
    await apiClient<void>(
      `/api/queues/exit${buildQuery({ companyId })}`,
      { method: "DELETE" },
      token
    );
  },

  getMyQueues: async (token: string): Promise<QueueEntry[]> => {
    return apiClient<ApiQueueEntryDto[]>("/api/queues/me", {}, token);
  },
};