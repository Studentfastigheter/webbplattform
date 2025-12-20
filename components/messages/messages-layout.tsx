"use client";

import * as React from "react";
import { useAuth } from "@/context/AuthContext";
import { messageService } from "@/services/message-service";
import { ConversationsPanel } from "./panels/conversations-panel";
import { ChatPanel } from "./panels/chat-panel";
import type { Conversation, Message } from "@/types";

export function MessagesLayout() {
  const { user } = useAuth();
  
  // State
  const [conversations, setConversations] = React.useState<Conversation[]>([]);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [selectedConversationId, setSelectedConversationId] = React.useState<string | null>(null);
  
  const [query, setQuery] = React.useState("");
  const [tab, setTab] = React.useState<"all" | "unread">("all");
  const [isLoading, setIsLoading] = React.useState(true);

  // 1. Hämta konversationer vid start
  React.useEffect(() => {
    const fetchConversations = async () => {
      try {
        setIsLoading(true);
        const data = await messageService.getConversations();
        setConversations(data);
        
        // Välj första konversationen automatiskt om ingen är vald
        if (data.length > 0 && !selectedConversationId) {
          setSelectedConversationId(String(data[0].conversationId));
        }
      } catch (error) {
        console.error("Kunde inte hämta konversationer:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  // 2. Hämta meddelanden när vald konversation ändras
  React.useEffect(() => {
    if (!selectedConversationId) return;

    const fetchMessages = async () => {
      try {
        const id = parseInt(selectedConversationId, 10);
        const data = await messageService.getMessages(id);
        setMessages(data);
      } catch (error) {
        console.error("Kunde inte hämta meddelanden:", error);
        setMessages([]);
      }
    };

    fetchMessages();
  }, [selectedConversationId]);

  // --- View Model för listan ---
  const conversationVM = React.useMemo(() => {
    return conversations.map((c) => {
      return {
        id: String(c.conversationId),
        // Använd 'otherPartyName' från din ConversationDTO istället för hårdkodad text
        title: (c as any).otherPartyName || (user?.accountType === "student" ? "Hyresvärd" : "Student"), 
        lastMessage: (c as any).lastMessage || "Klicka för att läsa", 
        updatedAt: formatTime(c.createdAt),
        unreadCount: 0, 
      };
    })
    .filter((c) => c.title.toLowerCase().includes(query.toLowerCase()))
    .filter((c) => (tab === "unread" ? c.unreadCount > 0 : true));
  }, [conversations, query, tab, user?.accountType]);

  // --- Handlers ---

  function handleSelect(id: string) {
    setSelectedConversationId(id);
  }

  // Räkna ut din roll för att veta vilken sida meddelanden ska ligga på
  const currentUserRole = user?.accountType === "student" ? "student" : "private_landlord";

  async function handleSend(text: string) {
    if (!selectedConversationId) return;
    const conversationId = parseInt(selectedConversationId, 10);

    try {
      // Optimistisk uppdatering med korrekt senderType
      const optimisticMsg: Message = {
        messageId: Date.now(), 
        conversationId,
        senderType: currentUserRole,
        body: text,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, optimisticMsg]);

      // Skicka till API
      const newMessage = await messageService.sendMessage(conversationId, text);
      
      // Ersätt den optimistiska med den riktiga
      setMessages((prev) => 
        prev.map(m => m.messageId === optimisticMsg.messageId ? newMessage : m)
      );
      
    } catch (error) {
      console.error("Kunde inte skicka meddelande", error);
      // Valfritt: Ta bort det optimistiska meddelandet vid fel
    }
  }

  const activeTitle = conversationVM.find((c) => c.id === selectedConversationId)?.title;

  return (
    <div className="grid h-full grid-cols-1 overflow-hidden rounded-xl border bg-background md:grid-cols-[320px_1fr] lg:grid-cols-[360px_1fr]">
      <ConversationsPanel
        conversations={conversationVM}
        selectedId={selectedConversationId ?? ""}
        query={query}
        tab={tab}
        onQueryChange={setQuery}
        onTabChange={setTab}
        onSelect={handleSelect}
      />

      {selectedConversationId ? (
        <ChatPanel
          title={activeTitle}
          messages={messages}
          onSend={handleSend}
          // Skicka ner din roll så ChatPanel kan avgöra höger/vänster sida
          currentUserRole={currentUserRole}
        />
      ) : (
        <div className="flex h-full items-center justify-center text-muted-foreground bg-muted/20">
          Välj en konversation för att börja chatta
        </div>
      )}
    </div>
  );
}

function formatTime(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("sv-SE", { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}