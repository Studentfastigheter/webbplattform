"use client";

import type { Message } from "@/types";
import { ChatHeader } from "../ui/chat-header";
import { MessageList } from "../ui/messages-list";
import { MessageComposer } from "../ui/message-composer";

export function ChatPanel({
  title,
  messages,
  onSend,
  currentUserRole, // Ta emot rollen här
}: {
  title?: string;
  messages: Message[];
  onSend: (text: string) => void;
  currentUserRole: "student" | "private_landlord"; // Definiera typen
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
      {/* Skicka vidare rollen till listan */}
      <MessageList messages={messages} currentUserRole={currentUserRole} /> 
      <MessageComposer onSend={onSend} />
    </section>
  );
}