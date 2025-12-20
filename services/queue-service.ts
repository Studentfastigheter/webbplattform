import { apiClient } from "@/lib/api-client";
import { HousingQueueDTO } from "@/types/queue";

export const queueService = {
  
  // 1. Hämta ALLA köer
  list: async (): Promise<HousingQueueDTO[]> => {
    return await apiClient<HousingQueueDTO[]>("/queues");
  },

  // 2. Hämta en SPECIFIK kö (Behövs för detaljsidan)
  get: async (id: string): Promise<HousingQueueDTO> => {
    return await apiClient<HousingQueueDTO>(`/queues/${id}`);
  },

  // 3. Hämta köer för ett specifikt företag
  getByCompany: async (companyId: number): Promise<HousingQueueDTO[]> => {
    return await apiClient<HousingQueueDTO[]>(`/companies/${companyId}/queues`);
  },

  // 4. Gå med i en kö (POST-anrop)
  join: async (queueId: string): Promise<void> => {
    // Vi förväntar oss text/plain svar från backend
    await apiClient<string>(`/queues/${queueId}/join`, {
      method: "POST"
    });
  },

  // Hämta inloggad students köer
  getMyQueues: async (): Promise<any[]> => {
    return await apiClient<any[]>("/queues/my");
  },
};