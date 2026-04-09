import api from './axios';

export interface Participant {
  _id: string;
  fullName: string;
  avatar?: string;
}

export interface LastMessage {
  _id: string;
  content: string;
  messageType: 'TEXT' | 'IMAGE' | 'LOCATION';
  createdAt: string;
  senderId: string;
}

export interface Conversation {
  _id: string;
  participants: Participant[];
  lastMessage?: LastMessage;
  lastMessageAt?: string;
  unreadCount: Record<string, number>;
  status: 'ACTIVE' | 'LOCKED';
  updatedAt: string;
}

export interface ChatMessage {
  _id: string;
  conversationId: string;
  senderId: string;
  messageType: 'TEXT';
  content: string;
  isRead: boolean;
  createdAt: string;
}

export const getMyConversationsApi = () =>
  api.get<{ success: boolean; data: Conversation[] }>('/chat/conversations');

export const getOrCreateConversationApi = (receiverId: string) =>
  api.post<{ success: boolean; data: Conversation }>('/chat/conversations', { receiverId });

export const getMessagesApi = (conversationId: string, page = 1) =>
  api.get<{ success: boolean; data: ChatMessage[] }>(
    `/chat/conversations/${conversationId}/messages`,
    { params: { page, limit: 50 } }
  );

export const sendMessageApi = (conversationId: string, text: string) =>
  api.post<{ success: boolean; data: ChatMessage }>('/chat/messages', {
    conversationId,
    text,
  });

export const markAsReadApi = (conversationId: string) =>
  api.put(`/chat/conversations/${conversationId}/read`);
