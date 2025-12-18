"use client";

import * as React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { NotificationItem } from "@/types"; // <-- Uppdaterad import
import { MessageNotificationCard } from "./cards/message-card";
import { QueueUpdateNotificationCard } from "./cards/queue-update-card";
import { ListingStatusNotificationCard } from "./cards/listing-status-card";

// Uppdaterad demo-data med number-IDs och titles
const DEMO_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 4,
    type: "listing_status",
    title: "Annons publicerad",
    listingTitle: "Nybyggd 1:a vid Chalmers",
    status: "published",
    body: "Din annons är publicerad och syns nu i bostadsflödet.",
    createdAt: "2024-12-15T12:05:00.000Z",
    opened: false,
  },
  {
    id: 3,
    type: "queue_update",
    title: "Köplats uppdaterad",
    queueName: "SGS Guldheden",
    position: 12,
    delta: -2,
    createdAt: "2024-12-15T11:20:00.000Z",
    opened: false,
  },
  {
    id: 2,
    type: "message",
    title: "Nytt meddelande",
    sender: "Emma Karlsson",
    threadTitle: "Konversation #8123",
    body: "Hej! Tack för din ansökan. Kan du nästa tisdag kl 17.30?",
    createdAt: "2024-12-15T07:00:00.000Z",
    opened: true,
  },
  {
    id: 1,
    type: "listing_status",
    title: "Annons löper ut snart",
    listingTitle: "Studentrum, Johanneberg",
    status: "expiring",
    createdAt: "2024-12-14T10:00:00.000Z",
    opened: true,
  },
];

type Props = {
  items?: NotificationItem[];
};

export function NotificationsFeed({ items }: Props) {
  const [demoItems, setDemoItems] = React.useState(DEMO_NOTIFICATIONS);

  React.useEffect(() => {
    if (items) return;

    // Uppdatera tidsstämplar för demo-känsla
    const now = Date.now();
    setDemoItems([
      { ...DEMO_NOTIFICATIONS[0], createdAt: new Date(now - 5 * 60_000).toISOString() },
      { ...DEMO_NOTIFICATIONS[1], createdAt: new Date(now - 40 * 60_000).toISOString() },
      { ...DEMO_NOTIFICATIONS[2], createdAt: new Date(now - 5 * 60 * 60_000).toISOString() },
      { ...DEMO_NOTIFICATIONS[3], createdAt: new Date(now - 26 * 60 * 60_000).toISOString() },
    ] as NotificationItem[]);
  }, [items]);

  const source = items ?? demoItems;

  const ordered = React.useMemo(
    () =>
      [...source].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [source]
  );

  return (
    <div className="grid h-full grid-rows-[auto_1fr] overflow-hidden">
      <ScrollArea className="h-full">
        <div className="space-y-2 p-3">
          {ordered.length === 0 ? (
            <div className="bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
              Inga notiser ännu.
            </div>
          ) : (
            ordered.map((notification) => renderNotification(notification))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

function renderNotification(notification: NotificationItem) {
  switch (notification.type) {
    case "message":
      return (
        <MessageNotificationCard 
          key={notification.id} 
          notification={notification} 
        />
      );
    
    case "queue_update":
      return (
        <QueueUpdateNotificationCard 
          key={notification.id} 
          notification={notification} 
        />
      );
    
    case "listing_status":
      return (
        <ListingStatusNotificationCard
          key={notification.id}
          notification={notification}
        />
      );

    case "generic":
      // Fallback för generella notiser om du inte har en specifik kort-komponent
      return (
        <div key={notification.id} className="p-4 border rounded-lg bg-white shadow-sm text-sm">
          <p className="font-medium">{notification.title || "Notis"}</p>
          <p className="text-muted-foreground">{notification.body}</p>
        </div>
      );

    default:
      return null;
  }
}