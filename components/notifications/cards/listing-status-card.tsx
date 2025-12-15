import { Home } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { NotificationCard } from "../notification-card";
import type { ListingStatusNotification } from "../types";

type Props = {
  notification: ListingStatusNotification;
};

export function ListingStatusNotificationCard({ notification }: Props) {
  const statusCopy = notification.body ?? defaultStatusCopy(notification.status);
  const statusLabel = statusLabels[notification.status] ?? notification.status;
  const accent = statusAccent(notification.status);

  return (
    <NotificationCard
      icon={<Home className="h-4 w-4" aria-hidden />}
      title="Status för annons"
      createdAt={notification.createdAt}
      opened={notification.opened}
      accent={accent}
    >
      <div className="flex flex-wrap items-center gap-2 text-foreground">
        <span className="text-sm font-semibold">{notification.listingTitle}</span>
        <Badge variant="secondary" className="rounded-full capitalize">
          {statusLabel}
        </Badge>
      </div>

      <p className="text-sm leading-relaxed">{statusCopy}</p>
    </NotificationCard>
  );
}

const statusLabels: Record<ListingStatusNotification["status"], string> = {
  published: "Publicerad",
  paused: "Pausad",
  expiring: "Snart utgående",
  archived: "Arkiverad",
};

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

function defaultStatusCopy(status: ListingStatusNotification["status"]) {
  switch (status) {
    case "published":
      return "Din annons syns nu för studenter och spekulanter.";
    case "paused":
      return "Annonsen är pausad. Återuppta när du är redo att ta emot nya sökande.";
    case "expiring":
      return "Annonsen löper snart ut. Förläng om du vill fortsätta visa den.";
    case "archived":
      return "Annonsen är arkiverad och visas inte längre publikt.";
    default:
      return "";
  }
}
