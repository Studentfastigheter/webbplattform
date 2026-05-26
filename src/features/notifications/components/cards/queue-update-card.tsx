import { ListChecks } from "lucide-react";
import { NotificationCard } from "../notification-card";
import type { QueueUpdateNotification } from "@/types"; // Uppdaterad import

type Props = {
  notification: QueueUpdateNotification;
};

export function QueueUpdateNotificationCard({ notification }: Props) {
  return (
    <NotificationCard
      icon={<ListChecks className="h-4 w-4" aria-hidden />}
      title="Uppdatering i kö"
      createdAt={notification.createdAt}
      opened={notification.opened}
      accent="info"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-foreground">{notification.queueName}</div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {notification.body ?? `Din plats i kön är nu ${notification.position}.`}
          </p>
        </div>
      </div>
    </NotificationCard>
  );
}