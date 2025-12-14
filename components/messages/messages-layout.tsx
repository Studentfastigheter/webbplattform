"use client";

import * as React from "react";
import { ConversationsPanel } from "./panels/conversations-panel";
import { ChatPanel } from "./panels/chat-panel";
import type { Conversation, Message } from "@/types";

// --- DEMO DATA (ersätt senare med API) ---
const DEMO_CONVERSATIONS: Conversation[] = [
  {
    conversationId: "c1" as any,
    studentId: "s1" as any,
    privateLandlordId: null,
    createdAt: "2025-12-14T10:00:00.000Z" as any,
  },
];

const DEMO_MESSAGES: Record<string, Message[]> = {
  c1: [
    {
      messageId: "m1" as any,
      conversationId: "c1" as any,
      senderType: "STUDENT" as any,
      body: "Hej! Jag såg annonsen 😊",
      createdAt: "2025-12-14T10:03:00.000Z" as any,
    },
    {
      messageId: "m2" as any,
      conversationId: "c1" as any,
      senderType: "LANDLORD" as any,
      body: "Hej! Kul att du hör av dig. Vad undrar du?",
      createdAt: "2025-12-14T10:05:00.000Z" as any,
    },
  ],
};


function toKey(id: unknown) {
  return String(id);
}

export function MessagesLayout() {
  const [query, setQuery] = React.useState("");
  const [tab, setTab] = React.useState<"all" | "unread">("all");

  const [selectedConversationId, setSelectedConversationId] = React.useState<string>(
    toKey(DEMO_CONVERSATIONS[0]?.conversationId ?? "")
  );

  const [messagesByConversation, setMessagesByConversation] =
    React.useState<Record<string, Message[]>>(DEMO_MESSAGES);

  // TODO: när du har "name/lastMessage/unread" på riktigt, bygg view-model via join/API
  const conversationVM = React.useMemo(() => {
    return DEMO_CONVERSATIONS.map((c) => {
      const key = toKey(c.conversationId);
      const msgs = messagesByConversation[key] ?? [];
      const last = msgs[msgs.length - 1];

      return {
        id: key,
        title: `Konversation ${key}`, // ersätt med student/landlord-namn
        lastMessage: last?.body ?? "—",
        updatedAt: last?.createdAt ? formatTime(last.createdAt) : "—",
        unreadCount: 0, // koppla när du har olästlogik
      };
    })
      .filter((c) => c.title.toLowerCase().includes(query.toLowerCase()))
      .filter((c) => (tab === "unread" ? c.unreadCount > 0 : true));
  }, [messagesByConversation, query, tab]);

  const selectedConversation = DEMO_CONVERSATIONS.find(
    (c) => toKey(c.conversationId) === selectedConversationId
  );

  const selectedMessages = selectedConversation
    ? messagesByConversation[toKey(selectedConversation.conversationId)] ?? []
    : [];

  function handleSelect(id: string) {
    setSelectedConversationId(id);
  }

  function handleSend(text: string) {
    if (!selectedConversation) return;

    const key = toKey(selectedConversation.conversationId);

    const next: Message = {
      messageId: crypto.randomUUID() as any,
      conversationId: selectedConversation.conversationId,
      senderType: "STUDENT" as any, // byt till verklig senderType från auth/session
      body: text,
      createdAt: new Date().toISOString() as any,
    };

    setMessagesByConversation((prev) => {
      const current = prev[key] ?? [];
      return { ...prev, [key]: [...current, next] };
    });
  }

  return (
    <div className="grid h-full grid-cols-1 overflow-hidden rounded-xl border bg-background md:grid-cols-[360px_1fr]">
      <ConversationsPanel
        conversations={conversationVM}
        selectedId={selectedConversationId}
        query={query}
        tab={tab}
        onQueryChange={setQuery}
        onTabChange={setTab}
        onSelect={handleSelect}
      />

      <ChatPanel
        title={conversationVM.find((c) => c.id === selectedConversationId)?.title}
        messages={selectedMessages}
        onSend={handleSend}
      />
    </div>
  );
}

function formatTime(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "—";
  }
}
