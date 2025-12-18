"use client";

import * as React from "react";
import type { Message } from "@/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface MessageListProps {
  messages: Message[];
  autoScroll?: boolean;
}

export function MessageList({ messages, autoScroll = false }: MessageListProps) {
  const bottomRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!autoScroll) return;
    // Scrolla mjukt till botten när meddelanden ändras
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, autoScroll]);

  return (
    <ScrollArea className="flex-1 h-full">
      <div className="flex flex-col gap-4 p-4">
        {messages.map((m) => {
          // Kontrollera om det är "jag" (studenten) som skrivit
          const isMe = String(m.senderType).toLowerCase() === "student";

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
        
        {/* Osynligt element som vi scrollar till */}
        <div ref={bottomRef} className="h-1" />
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