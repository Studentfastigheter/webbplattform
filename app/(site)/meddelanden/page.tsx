import MessageCard from "@/components/ui/messageCard";
import type { Conversation, Message } from "@/types";
import type { MessageWithUI } from "@/components/ui/messageBubble";

// Mock-konversationer
const conversations: Conversation[] = [
  {
    conversationId: "1",
    studentId: "123",
    privateLandlordId: null,
    createdAt: "2024-12-07T10:29:00Z",
  },
];

// Mock-meddelanden (domänmodell)
const rawMessages: Message[] = [
  {
    messageId: "1",
    conversationId: "1",
    senderType: "landlord",
    body:
      "Hej, vad roligt att du är intresserad. Rummet ligger på bottenvåningen...",
    createdAt: "2024-12-07T20:30:00Z",
  },
  {
    messageId: "2",
    conversationId: "1",
    senderType: "student",
    body: "Låter bra. Vilka bor i fastigheten?",
    createdAt: "2024-12-07T20:40:00Z",
  },
];

// Mappa till UI-message
const messages: MessageWithUI[] = rawMessages.map((m) => ({
  ...m,
  fromMe: m.senderType === "student",
  metaText: new Date(m.createdAt).toLocaleTimeString("sv-SE", {
    hour: "2-digit",
    minute: "2-digit",
  }),
}));

export default function Page() {
  return (
    <main className="p-6 min-h-screen">
      <h1 className="text-3xl font-semibold mb-6">Meddelanden</h1>

      <div className="relative w-full flex items-start justify-center">
        <MessageCard conversations={conversations} messages={messages} />
      </div>
    </main>
  );
}
