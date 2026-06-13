import { Home } from "@/components/icons";
import { NotificationCard } from "../notification-card";
import type { ListingStatusNotification } from "@/types"; // Uppdaterad import
import { useI18n } from "@/i18n/I18nProvider";
import { localizedText } from "@/i18n/text";

type Props = {
  notification: ListingStatusNotification;
};

export function ListingStatusNotificationCard({ notification }: Props) {
  const { locale } = useI18n();
  const statusCopy = notification.body ?? defaultStatusCopy(notification.status, locale);
  // const statusLabel = statusLabels[notification.status] ?? notification.status; // Används ej i nuvarande design
  const accent = statusAccent(notification.status);

  return (
    <NotificationCard
      icon={<Home className="h-4 w-4" aria-hidden />}
      title={localizedText(locale, "Status för annons", "Listing status")}
      createdAt={notification.createdAt}
      opened={notification.opened}
      accent={accent}
    >
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2 text-foreground">
          <span className="text-sm font-semibold">{notification.listingTitle}</span>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">{statusCopy}</p>
      </div>
    </NotificationCard>
  );
}

// const statusLabels: Record<ListingStatusNotification["status"], string> = {
//   published: "Publicerad",
//   paused: "Pausad",
//   expiring: "Snart utgående",
//   archived: "Arkiverad",
// };

function statusAccent(
  status: ListingStatusNotification["status"]
): NonNullable<React.ComponentProps<typeof NotificationCard>["accent"]> {
  switch (status) {
    case "expiring":
      return "warning";
    case "published":
      return "success";
    case "paused":
      return "info";
    case "archived":
    default:
      return "neutral";
  }
}

function defaultStatusCopy(status: ListingStatusNotification["status"], locale: "sv" | "en") {
  switch (status) {
    case "published":
      return localizedText(locale, "Din annons syns nu för studenter och spekulanter.", "Your listing is now visible to students and prospective tenants.");
    case "paused":
      return localizedText(locale, "Annonsen är pausad. Återuppta när du är redo att ta emot nya sökande.", "The listing is paused. Resume it when you are ready to receive new applicants.");
    case "expiring":
      return localizedText(locale, "Annonsen löper snart ut. Förläng om du vill fortsätta visa den.", "The listing will expire soon. Extend it if you want to keep showing it.");
    case "archived":
      return localizedText(locale, "Annonsen är arkiverad och visas inte längre publikt.", "The listing is archived and is no longer shown publicly.");
    default:
      return "";
  }
}
