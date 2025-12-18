// src/types/message.ts
import { TimestampString } from "./common";

export type MessageId = number;
export type ConversationId = number;
export type MessageSenderType = "student" | "private_landlord" | "company";

export interface Message {
  messageId: MessageId;
  conversationId: ConversationId;
  senderType: MessageSenderType;
  body: string;
  createdAt: TimestampString;
}

export interface Conversation {
  conversationId: ConversationId;
  studentId: number;
  privateLandlordId: number | null;
  createdAt: TimestampString;
  // UI-specifika fält (kan vara valfria om de läggs på i frontend)
  title?: string;
  lastMessage?: string;
  updatedAt?: string;
  unreadCount?: number;
}