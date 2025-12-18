import { apiClient } from "@/lib/api-client";
import { Conversation, Message } from "@/types";

export const messageService = {
  // Hämta alla konversationer för inloggad användare
  getConversations: async (): Promise<Conversation[]> => {
    return await apiClient<Conversation[]>("/conversations");
  },

  // Hämta meddelanden för en specifik konversation
  getMessages: async (conversationId: number): Promise<Message[]> => {
    return await apiClient<Message[]>(`/conversations/${conversationId}/messages`);
  },

  // Skicka ett nytt meddelande
  sendMessage: async (conversationId: number, body: string): Promise<Message> => {
    return await apiClient<Message>(`/conversations/${conversationId}/messages`, {
      method: "POST",
      body: JSON.stringify({ body }),
    });
  },

  // Starta ny konversation
  createConversation: async (recipientId: number, type: "company" | "private_landlord"): Promise<Conversation> => {
    return await apiClient<Conversation>("/conversations", {
      method: "POST",
      body: JSON.stringify({ recipientId, type }),
    });
  }
};