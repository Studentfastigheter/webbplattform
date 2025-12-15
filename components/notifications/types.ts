export type NotificationBase = {
  id: string;
  createdAt: string;
  opened?: boolean;
};

export type MessageNotification = NotificationBase & {
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

export type NotificationItem =
  | MessageNotification
  | QueueUpdateNotification
  | ListingStatusNotification;
