"use client";

import type { Message } from "@/types";
import { ChatHeader } from "../ui/chat-header";
import { MessageList } from "../ui/messages-list";
import { MessageComposer } from "../ui/message-composer";

export function ChatPanel({
  title,
  messages,
  onSend,
}: {
  title?: string;
  messages: Message[];
  onSend: (text: string) => void;
}) {
  if (!title) {
    return (
      <section className="flex h-full items-center justify-center">
        <div className="text-sm text-muted-foreground">Välj en konversation.</div>
      </section>
    );
  }

  return (
    <section className="flex h-full flex-col">
      <ChatHeader name={title} />
      <MessageList messages={messages} />
      <MessageComposer onSend={onSend} />
    </section>
  );
}
