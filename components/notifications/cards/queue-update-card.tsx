import { ListChecks } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { NotificationCard } from "../notification-card";
import type { QueueUpdateNotification } from "../types";

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
      accent="success"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-foreground">{notification.queueName}</div>
          <p className="text-sm leading-relaxed">
            {notification.body ?? "Din plats i kön har uppdaterats."}
          </p>
        </div>
      </div>
    </NotificationCard>
  );
}
