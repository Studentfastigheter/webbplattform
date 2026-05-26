import { MessageSquare } from "lucide-react";
import { NotificationCard } from "../notification-card";
import type { MessageNotification } from "@/types"; // Uppdaterad import

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
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2 text-foreground">
          <span className="text-sm font-semibold">{notification.sender}</span>
          {notification.threadTitle && (
            <span className="text-xs text-muted-foreground">• {notification.threadTitle}</span>
          )}
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground line-clamp-2">
          {notification.body}
        </p>
      </div>
    </NotificationCard>
  );
}