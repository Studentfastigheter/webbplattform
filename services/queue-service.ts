import { apiClient } from "@/lib/api-client";
import { HousingQueue } from "@/types";

export const queueService = {
  // Hämta köer för ett specifikt företag
  getByCompany: async (companyId: number): Promise<HousingQueue[]> => {
    return await apiClient<HousingQueue[]>(`/companies/${companyId}/queues`);
  },

  // Gå med i en kö (använder Queue ID UUID)
  join: async (queueId: string): Promise<void> => {
    await apiClient<string>(`/queues/${queueId}/join`, {
      method: "POST"
    });
  },
};