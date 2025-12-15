import { MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { NotificationCard } from "../notification-card";
import type { MessageNotification } from "../types";

type Props = {
  notification: MessageNotification;
};

export function MessageNotificationCard({ notification }: Props) {
  return (
    <NotificationCard
      icon={<MessageSquare className="h-4 w-4" aria-hidden />}
      title="Nytt meddelande"
      createdAt={notification.createdAt}
      opened={notification.opened}
      accent="success"
    >
      <div className="flex flex-wrap items-center gap-2 text-foreground">
        <span className="text-sm font-semibold">{notification.sender}</span>
      </div>
      <p className="text-sm leading-relaxed text-foreground">{notification.body}</p>
    </NotificationCard>
  );
}
