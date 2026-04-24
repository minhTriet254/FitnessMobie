// types/chat.ts

export interface ChatMessage {
  id: number;
  senderId: string;
  senderUserName: string;
  content: string;
  sentAt: string;
  conversationId: number | null;
  isReadByAdmin: boolean;
  isGlobalChat: boolean;
}

export interface Conversation {
  id: number;
  userId: string;
  userName: string;
  adminId: string | null;
  adminName: string | null;
  createdAt: string;
  lastMessageAt: string | null;
  isActive: boolean;
  lastMessage: ChatMessage | null;
  unreadCount: number;
}

export enum ChatType {
  GLOBAL = 'global',
  PRIVATE = 'private',
}

export enum ConversationStatus {
  WAITING = 'waiting',
  ACTIVE = 'active',
  CLOSED = 'closed',
}