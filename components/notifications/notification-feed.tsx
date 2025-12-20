"use client";

import * as React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { NotificationItem } from "@/types";
import { notificationService } from "@/services/notification-service";
import { MessageNotificationCard } from "./cards/message-card";
import { QueueUpdateNotificationCard } from "./cards/queue-update-card";
import { ListingStatusNotificationCard } from "./cards/listing-status-card";
import { useAuth } from "@/context/AuthContext";

type Props = {
  items?: NotificationItem[]; // Möjlighet att skicka in data utifrån
};

export function NotificationsFeed({ items: initialItems }: Props) {
  const { token } = useAuth();
  const [notifications, setNotifications] = React.useState<NotificationItem[]>([]);
  const [loading, setLoading] = React.useState(!initialItems);

  // Hämta riktiga notiser från backend
  const fetchNotifications = React.useCallback(async () => {
    if (!token) return;
    try {
      const data = await notificationService.getAll();
      setNotifications(data);
    } catch (error) {
      console.error("Misslyckades att hämta notiser", error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  React.useEffect(() => {
    if (initialItems) {
      setNotifications(initialItems);
    } else {
      fetchNotifications();
    }
  }, [initialItems, fetchNotifications]);

  // Funktion för att hantera klick och markera som läst
  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, opened: true } : n))
      );
    } catch (error) {
      console.error("Kunde inte markera som läst", error);
    }
  };

  const ordered = React.useMemo(
    () => [...notifications].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
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
      return <MessageNotificationCard notification={notification} />;
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