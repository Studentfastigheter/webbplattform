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
        "w-full flex items-start gap-3 p-3 text-left transition-colors hover:bg-muted/50 rounded-md mx-1",
        selected && "bg-muted hover:bg-muted"
      )}
    >
      <Avatar className="h-10 w-10 mt-0.5 border border-border/50">
        <AvatarFallback>{initials || "?"}</AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1 overflow-hidden">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <div className={cn("truncate text-sm", unreadCount > 0 ? "font-semibold text-foreground" : "font-medium text-foreground/90")}>
            {title}
          </div>
          <div className="shrink-0 text-[11px] text-muted-foreground">{updatedAt}</div>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className={cn("truncate text-xs pr-2", unreadCount > 0 ? "text-foreground font-medium" : "text-muted-foreground")}>
            {lastMessage}
          </div>
          {unreadCount > 0 && (
            <Badge variant="default" className="h-5 w-5 rounded-full p-0 flex items-center justify-center shrink-0 text-[10px]">
              {unreadCount}
            </Badge>
          )}
        </div>
      </div>
    </button>
  );
}