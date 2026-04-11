import { apiClient, buildQuery } from "@/lib/api-client";
import { HousingQueueDTO } from "@/types/queue";
import { ListingCardDTO } from "@/types/listing";

export interface CompanyDTO {
  id: number;
  name: string;
  subtitle: string;
  description: string;
  website: string;
  rating: number;
  verified: boolean;
  bannerUrl: string;
  logoUrl: string;
};

export type QueueFilters = {
  id?: string | null;          // Queue id, TODO: This should probably change (JaarmaCo@git)
  city?: string | null;        // City the queues should be in.
  pageNumber?: number;         // Page number to get.
  pageSize?: number;           // Number of entries in a page.
  pageCount?: number;          // Number of pages to fetch.
};

const DEFAULT_PAGE_SIZE = 12;

export const queueService = {

  list: async ({ id         = null,
                 city       = null,
                 pageNumber = 1,
                 pageSize   = DEFAULT_PAGE_SIZE,
                 pageCount  = 1,
               }: QueueFilters = {}): Promise<HousingQueueDTO[]> => {
    const drop = pageSize * (pageNumber - 1);
    const take = pageSize;
    const query: Record<string, any> = {
      drop: drop,
      take: take,
    };
    if (id !== null) {
      query.id = id;
    }
    if (city !== null) {
      query.city = city;
    }
    const request = `/queues${buildQuery(query)}`;
    console.log(`GET /api${request}`)
    return await apiClient<HousingQueueDTO[]>(request);
  },

  get: async (id: string): Promise<HousingQueueDTO> => {
    return await apiClient<HousingQueueDTO>(`/queues/${id}`);
  },

  getByCompany: async (companyId: number): Promise<HousingQueueDTO[]> => {
    return await apiClient<HousingQueueDTO[]>(`/companies/${companyId}/queues`);
  },

  join: async (queueId: string): Promise<void> => {
    // Vi förväntar oss text/plain svar från backend
    await apiClient<string>(`/queues/${queueId}/join`, {
      method: "POST"
    });
  },

  getMyQueues: async (): Promise<any[]> => {
    return await apiClient<any[]>("/queues/my");
  },

  getCompany: async (companyId: number): Promise<CompanyDTO> => {
    return await apiClient<CompanyDTO>(`/companies/${companyId}`);
  },

  getCompanyListings: async (companyId: number, page = 0, size = 12): Promise<ListingCardDTO[]> => {
    const query = buildQuery({ page, size });
    const res = await apiClient<any>(`/companies/${companyId}/listings${query}`);
    return res?.content ?? [];
  },
};
