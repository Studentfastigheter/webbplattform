import { apiClient } from "@/lib/api-client";
import { Conversation, Message } from "@/types";

export const messageService = {
  getConversations: async (): Promise<Conversation[]> => {
    // Lägg till /messages så det matchar Controllern
    return await apiClient<Conversation[]>("/messages/conversations");
  },

  getMessages: async (conversationId: number): Promise<Message[]> => {
    // Matcha GetMapping("/conversations/{id}") i Java
    return await apiClient<Message[]>(`/messages/conversations/${conversationId}`);
  },

  sendMessage: async (conversationId: number, body: string): Promise<Message> => {
    return await apiClient<Message>(`/messages/conversations/${conversationId}`, {
      method: "POST",
      body: JSON.stringify({ body }),
    });
  },

  createConversation: async (recipientId: number, type: "company" | "private_landlord"): Promise<Conversation> => {
    return await apiClient<Conversation>("/messages/conversations", {
      method: "POST",
      body: JSON.stringify({ recipientId, type }),
    });
  }
};