"use client";

import * as React from "react";
import { Bell } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NotificationCard } from "./notification-card";
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
    body: "Din annons är publicerad och syns nu i bostadsflödet.",
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    opened: false,
  },
  {
    id: "n3",
    type: "queue_update",
    queueName: "SGS Guldheden",
    position: 12,
    delta: -2,
    createdAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    opened: false,
  },
  {
    id: "n2",
    type: "message",
    sender: "Emma Karlsson",
    threadTitle: "Konversation #8123",
    body: "Hej! Tack för din ansökan. Kan du nästa tisdag kl 17.30?",
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    opened: true,
  },
  {
    id: "n1",
    type: "listing_status",
    listingTitle: "Studentrum, Johanneberg",
    status: "expiring",
    createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    opened: true,
  },
];

type Props = {
  items?: NotificationItem[];
};

export function NotificationsFeed({ items = DEMO_NOTIFICATIONS }: Props) {
  const ordered = React.useMemo(
    () =>
      [...items].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [items]
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