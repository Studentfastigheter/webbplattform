import { apiClient, arrayFromApiResponse, pathSegment } from "@/lib/api-client";
import { NotificationItem } from "@/types";

export const notificationService = {
  // GET /api/notifications
  getAll: async (): Promise<NotificationItem[]> => {
    const notifications = await apiClient<unknown>("/notifications");
    return arrayFromApiResponse<NotificationItem>(notifications);
  },

  // PATCH /api/notifications/{id}/open
  markAsRead: async (id: number): Promise<void> => {
    await apiClient(`/notifications/${pathSegment(id)}/open`, {
      method: "PATCH",
    });
  },
};
