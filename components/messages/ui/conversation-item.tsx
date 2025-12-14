"use client";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export function ConversationItem({
  title,
  lastMessage,
  updatedAt,
  unreadCount,
  selected,
  onClick,
}: {
  title: string;
  lastMessage: string;
  updatedAt: string;
  unreadCount: number;
  selected: boolean;
  onClick: () => void;
}) {
  const initials = title
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full rounded-lg p-3 text-left transition hover:bg-muted",
        selected && "bg-muted"
      )}
    >
      <div className="flex items-center gap-3">
        <Avatar className="h-9 w-9">
          <AvatarFallback>{initials || "?"}</AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <div className={cn("truncate text-sm", unreadCount ? "font-semibold" : "font-medium")}>
              {title}
            </div>
            <div className="shrink-0 text-xs text-muted-foreground">{updatedAt}</div>
          </div>

          <div className="mt-1 flex items-center justify-between gap-2">
            <div className="truncate text-xs text-muted-foreground">{lastMessage}</div>
            {unreadCount > 0 && <Badge className="shrink-0">{unreadCount}</Badge>}
          </div>
        </div>
      </div>
    </button>
  );
}
