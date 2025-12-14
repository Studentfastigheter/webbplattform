"use client";

import * as React from "react";
import type { Message } from "@/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export function MessageList({
  messages,
  autoScroll = false,
}: {
  messages: Message[];
  autoScroll?: boolean;
}) {
  const viewportRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!autoScroll) return;

    // Scrolla ENDAST i ScrollArea-viewporten (inte body)
    const el = viewportRef.current;
    if (!el) return;

    // Vänta ett tick så layouten hinner sätta höjder
    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });
  }, [messages.length, autoScroll]);

  return (
    <ScrollArea className="flex-1">
      {/* shadcn ScrollArea har en inre viewport-div. Vi sätter ref via selector: */}
      <ScrollViewportRef viewportRef={viewportRef} />

      <div className="space-y-2 p-4">
        {messages.map((m) => {
          const isMe = String(m.senderType).toUpperCase() === "STUDENT";

          return (
            <div
              key={String(m.messageId)}
              className={cn("flex", isMe ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[78%] rounded-2xl px-3 py-2 text-sm",
                  isMe
                    ? "bg-brand text-primary-foreground"
                    : "bg-muted text-foreground"
                )}
              >
                <div>{m.body}</div>
                <div
                  className={cn(
                    "mt-1 text-[10px] opacity-70",
                    isMe ? "text-primary-foreground" : "text-muted-foreground"
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

function ScrollViewportRef({
  viewportRef,
}: {
  viewportRef: React.MutableRefObject<HTMLDivElement | null>;
}) {
  const hostRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const host = hostRef.current?.closest("[data-radix-scroll-area-root]");
    if (!host) return;

    const viewport = host.querySelector(
      "[data-radix-scroll-area-viewport]"
    ) as HTMLDivElement | null;

    viewportRef.current = viewport;
    return () => {
      viewportRef.current = null;
    };
  }, [viewportRef]);

  return <div ref={hostRef} />;
}

function formatTime(iso: string) {
  const d = new Date(iso);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

