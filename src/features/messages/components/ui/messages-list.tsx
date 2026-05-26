"use client";

import type { Message } from "@/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface MessageListProps {
  messages: Message[];
  currentUserRole: "student" | "private_landlord";
}

export function MessageList({ messages, currentUserRole }: MessageListProps) {
  return (
    <ScrollArea className="flex-1 h-full">
      <div className="flex flex-col gap-4 p-4">
        {messages.map((m) => {
          const isMe = m.senderType === currentUserRole;

          return (
            <div
              key={m.messageId}
              className={cn("flex w-full", isMe ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow-sm",
                  isMe
                    ? "bg-primary text-primary-foreground rounded-br-none"
                    : "bg-muted text-foreground rounded-bl-none"
                )}
              >
                <div className="whitespace-pre-wrap break-words">{m.body}</div>
                <div
                  className={cn(
                    "mt-1 text-[10px] opacity-70 text-right",
                    isMe ? "text-primary-foreground/80" : "text-muted-foreground"
                  )}
                >
                  {formatTime(m.createdAt)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}

function formatTime(iso: string) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString("sv-SE", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}