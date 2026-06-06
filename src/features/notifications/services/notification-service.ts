import {
  apiClient,
  arrayFromApiResponse,
  pathSegment,
  type ServiceOptions,
} from "@/lib/api/client";
import { NotificationDTO, NotificationItem } from "@/types";

type NotificationResponseDTO = Partial<NotificationDTO> & {
  type?: NotificationItem["type"];
};

function normalizeNotification(value: unknown): NotificationItem | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const source = value as NotificationResponseDTO;
  if (typeof source.id !== "number") {
    return null;
  }

  return {
    ...(source as Partial<NotificationItem>),
    id: source.id,
    type: source.type ?? "generic",
    title: source.title ?? "Notis",
    body: source.body ?? "",
    opened: source.opened ?? false,
    createdAt: source.createdAt ?? new Date(0).toISOString(),
  } as NotificationItem;
}

export const notificationService = {
  // GET /api/notifications
  getAll: async (options?: ServiceOptions): Promise<NotificationItem[]> => {
    const notifications = await apiClient<unknown>("/notifications", {
      signal: options?.signal,
    });
    return arrayFromApiResponse<unknown>(notifications)
      .map(normalizeNotification)
      .filter((notification): notification is NotificationItem => notification !== null);
  },

  // PATCH /api/notifications/{id}/open
  markAsRead: async (id: number): Promise<void> => {
    await apiClient(`/notifications/${pathSegment(id)}/open`, {
      method: "PATCH",
    });
  },
};
