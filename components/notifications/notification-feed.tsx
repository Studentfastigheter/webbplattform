"use client";

import * as React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { NotificationItem } from "./types";
import { MessageNotificationCard } from "./cards/message-card";
import { QueueUpdateNotificationCard } from "./cards/queue-update-card";
import { ListingStatusNotificationCard } from "./cards/listing-status-card";

const DEMO_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "n4",
    type: "listing_status",
    listingTitle: "Nybyggd 1:a vid Chalmers",
    status: "published",
    body: "Din annons ar publicerad och syns nu i bostadsflodet.",
    createdAt: "2024-12-15T12:05:00.000Z",
    opened: false,
  },
  {
    id: "n3",
    type: "queue_update",
    queueName: "SGS Guldheden",
    position: 12,
    delta: -2,
    createdAt: "2024-12-15T11:20:00.000Z",
    opened: false,
  },
  {
    id: "n2",
    type: "message",
    sender: "Emma Karlsson",
    threadTitle: "Konversation #8123",
    body: "Hej! Tack for din ansokan. Kan du nasta tisdag kl 17.30?",
    createdAt: "2024-12-15T07:00:00.000Z",
    opened: true,
  },
  {
    id: "n1",
    type: "listing_status",
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

    const now = Date.now();
    setDemoItems([
      { ...DEMO_NOTIFICATIONS[0], createdAt: new Date(now - 5 * 60_000).toISOString() },
      { ...DEMO_NOTIFICATIONS[1], createdAt: new Date(now - 40 * 60_000).toISOString() },
      { ...DEMO_NOTIFICATIONS[2], createdAt: new Date(now - 5 * 60 * 60_000).toISOString() },
      { ...DEMO_NOTIFICATIONS[3], createdAt: new Date(now - 26 * 60 * 60_000).toISOString() },
    ]);
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
              Inga notiser annu.
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
  if (notification.type === "message") {
    return (
      <MessageNotificationCard key={notification.id} notification={notification} />
    );
  }

  if (notification.type === "queue_update") {
    return (
      <QueueUpdateNotificationCard key={notification.id} notification={notification} />
    );
  }

  if (notification.type === "listing_status") {
    return (
      <ListingStatusNotificationCard
        key={notification.id}
        notification={notification}
      />
    );
  }

  // Exhaustive guard: return null if a notistyp saknar renderer.
  return null;
}
