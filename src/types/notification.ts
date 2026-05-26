// src/types/notification.ts

type NotificationBase = {
  id: number; // Backend använder Long (number), inte UUID (string)
  createdAt: string;
  opened?: boolean;
  title?: string; // Backend skickar alltid en titel
};

type MessageNotification = NotificationBase & {
  type: "message";
  sender: string;
  body: string;
  threadTitle?: string;
};

export type QueueUpdateNotification = NotificationBase & {
  type: "queue_update";
  queueName: string;
  position: number;
  delta?: number;
  body?: string;
};

export type ListingStatusNotification = NotificationBase & {
  type: "listing_status";
  listingTitle: string;
  status: "published" | "paused" | "expiring" | "archived";
  body?: string;
};

type GenericNotification = NotificationBase & {
  type: "generic";
  body: string;
};

export type NotificationItem =
  | MessageNotification
  | QueueUpdateNotification
  | ListingStatusNotification
  | GenericNotification;
