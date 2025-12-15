import * as React from "react";
import { cn } from "@/lib/utils";

type NotificationCardProps = {
  icon: React.ReactNode;
  title: string;
  createdAt: string;
  opened?: boolean;
  accent?: "success" | "info" | "warning" | "neutral";
  children: React.ReactNode;
};

export function NotificationCard({
  icon,
  title,
  createdAt,
  opened = false,
  accent = "neutral",
  children,
}: NotificationCardProps) {
  const accentKey = opened ? "neutral" : accent;
  const accentStyle = accentStyles[accentKey] ?? accentStyles.neutral;
  const iconStyle = accentStyles.neutral.icon;
  const [timeLabel, setTimeLabel] = React.useState("");

  React.useEffect(() => {
    setTimeLabel(formatRelativeTime(createdAt));

    const id = window.setInterval(() => {
      setTimeLabel(formatRelativeTime(createdAt));
    }, 60_000);

    return () => window.clearInterval(id);
  }, [createdAt]);

  return (
    <div
      className={cn(
        "rounded-2xl border p-4 text-left shadow-sm transition",
        accentStyle.container
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "mt-0.5 flex h-10 w-10 items-center justify-center rounded-full border",
            iconStyle
          )}
        >
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <span
                className={cn("h-2 w-2 rounded-full", accentStyle.dot)}
                aria-hidden
              />
              <div className="text-sm font-semibold leading-tight text-foreground">
                {title}
              </div>
            </div>
            <div className="shrink-0 text-xs text-muted-foreground">
              {timeLabel}
            </div>
          </div>

          <div className="mt-2 space-y-2 text-sm text-muted-foreground">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export function formatRelativeTime(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "invalid date";

  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);

  if (minutes < 1) return "just nu";
  if (minutes < 60) return `${minutes} min sedan`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h sedan`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} d sedan`;

  return date.toLocaleDateString("sv-SE", { month: "short", day: "numeric" });
}

const accentStyles: Record<
  NonNullable<NotificationCardProps["accent"]>,
  { container: string; icon: string; dot: string }
> = {
  success: {
    container:
      "border-muted bg-[color:var(--brand-soft)] hover:bg-[color:var(--brand-soft-strong)]",
    icon: "border-muted bg-background text-emerald-700",
    dot: "bg-emerald-500",
  },
  info: {
    container: "border-muted bg-sky-50 hover:bg-sky-100",
    icon: "border-sky-200 bg-background text-sky-700",
    dot: "bg-sky-500",
  },
  warning: {
    container: "border-muted bg-amber-50 hover:bg-amber-100",
    icon: "border-amber-200 bg-background text-amber-800",
    dot: "bg-amber-500",
  },
  neutral: {
    container: "border-muted bg-background hover:bg-muted/50",
    icon: "border-muted-foreground/20 bg-muted text-foreground",
    dot: "bg-muted-foreground/70",
  },
};
