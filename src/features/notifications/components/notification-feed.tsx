"use client";

import * as React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { NotificationItem } from "@/types";
import { QueueUpdateNotificationCard } from "./cards/queue-update-card";
import { ListingStatusNotificationCard } from "./cards/listing-status-card";
import {
  useMarkNotificationRead,
  useNotifications,
} from "@/features/notifications/hooks/useNotifications";

type Props = {
  items?: NotificationItem[]; // Möjlighet att skicka in data utifrån
};

export function NotificationsFeed({ items: initialItems }: Props) {
  // The optional `initialItems` path is rare (caller-supplied data, e.g. from
  // a mock). When present, skip the network entirely (enabled: false) and
  // render those items. Otherwise, use the cached notifications query — the
  // hook handles auth gating internally (no token → no fetch).
  const { data: fetched, isLoading: fetching } = useNotifications({
    enabled: !initialItems,
  });
  const notifications = initialItems ?? fetched ?? [];
  const loading = initialItems ? false : fetching;
  const markAsRead = useMarkNotificationRead();

  const handleMarkAsRead = (id: number) => {
    // Optimistic cache update + rollback live inside useMarkNotificationRead.
    markAsRead.mutate(id);
  };

  const ordered = React.useMemo(
    () =>
      notifications
        .filter((notification) => notification.type !== "message")
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ),
    [notifications]
  );

  if (loading) {
    return <div className="p-4 text-center text-sm text-muted-foreground">Laddar notiser...</div>;
  }

  return (
    <div className="grid h-full grid-rows-[auto_1fr] overflow-hidden">
      <ScrollArea className="h-full">
        <div className="space-y-2 p-3">
          {ordered.length === 0 ? (
            <div className="bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
              Inga notiser ännu.
            </div>
          ) : (
            ordered.map((n) => (
              <div key={n.id} onClick={() => !n.opened && handleMarkAsRead(n.id)}>
                {renderNotification(n)}
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

function renderNotification(notification: NotificationItem) {
  // Samma switch-logik som tidigare...
  switch (notification.type) {
    case "message":
      return null;
    case "queue_update":
      return <QueueUpdateNotificationCard notification={notification} />;
    case "listing_status":
      return <ListingStatusNotificationCard notification={notification} />;
    default:
      return (
        <div className={`p-4 border rounded-lg shadow-sm text-sm ${notification.opened ? 'bg-white' : 'bg-blue-50 border-blue-100'}`}>
          <p className="font-medium">{notification.title || "Notis"}</p>
          <p className="text-muted-foreground">{notification.body}</p>
        </div>
      );
  }
}
