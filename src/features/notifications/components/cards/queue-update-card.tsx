import { ListChecks } from "lucide-react";
import { NotificationCard } from "../notification-card";
import type { QueueUpdateNotification } from "@/types"; // Uppdaterad import
import { useI18n } from "@/i18n/I18nProvider";
import { localizedText } from "@/i18n/text";

type Props = {
  notification: QueueUpdateNotification;
};

export function QueueUpdateNotificationCard({ notification }: Props) {
  const { locale } = useI18n();

  return (
    <NotificationCard
      icon={<ListChecks className="h-4 w-4" aria-hidden />}
      title={localizedText(locale, "Uppdatering i kö", "Queue update")}
      createdAt={notification.createdAt}
      opened={notification.opened}
      accent="info"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-foreground">{notification.queueName}</div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {notification.body ?? localizedText(locale, `Din plats i kön är nu ${notification.position}.`, `Your position in the queue is now ${notification.position}.`)}
          </p>
        </div>
      </div>
    </NotificationCard>
  );
}
