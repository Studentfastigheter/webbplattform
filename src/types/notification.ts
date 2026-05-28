export type NotificationDTO = {
  id: number;
  title?: string | null;
  body?: string | null;
  opened?: boolean | null;
  createdAt?: string | null;
};

type NotificationBase = {
  id: number;
  createdAt: string;
  opened?: boolean;
  title?: string;
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
