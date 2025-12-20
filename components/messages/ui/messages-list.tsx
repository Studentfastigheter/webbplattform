"use client";

import * as React from "react";
import type { Message } from "@/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface MessageListProps {
  messages: Message[];
  autoScroll?: boolean;
  currentUserRole: "student" | "private_landlord"; // Ny prop för dynamisk höger/vänster
}

export function MessageList({ messages, autoScroll = true, currentUserRole }: MessageListProps) {
  const bottomRef = React.useRef<HTMLDivElement>(null);

  // Scrolla till botten vid nya meddelanden
  React.useEffect(() => {
    if (!autoScroll) return;
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, autoScroll]);

  return (
    <ScrollArea className="flex-1 h-full">
      <div className="flex flex-col gap-4 p-4">
        {messages.map((m) => {
          // Jämför meddelandets avsändare med din egen roll istället för hårdkodad sträng
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
        
        {/* Scroll-ankare */}
        <div ref={bottomRef} className="h-0" />
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