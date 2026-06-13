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
  messageType: 'TEXT' | 'IMAGE' | 'LOCATION';
  content: string;
  imageUrl?: string;
  location?: { latitude: number; longitude: number };
  isRead: boolean;
  isEdited?: boolean;
  editedAt?: string;
  isRecalled?: boolean;
  recalledAt?: string;
  createdAt: string;
}

export const getMyConversationsApi = () =>
  api.get<{ success: boolean; data: Conversation[] }>('/chat/conversations');

export const getOrCreateConversationApi = (receiverId: string) =>
  api.post<{ success: boolean; data: Conversation }>('/chat/conversations', {
    receiverId,
  });

export const getMessagesApi = (conversationId: string, page = 1) =>
  api.get<{
    success: boolean;
    data: ChatMessage[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>(`/chat/conversations/${conversationId}/messages`, {
    params: { page, limit: 50 },
  });

export const sendMessageApi = (
  conversationId: string,
  payload: {
    text?: string;
    imageUrl?: string;
    location?: { latitude: number; longitude: number };
  }
) =>
  api.post<{ success: boolean; data: ChatMessage }>('/chat/messages', {
    conversationId,
    ...payload,
  });

export const markAsReadApi = (conversationId: string) =>
  api.put(`/chat/conversations/${conversationId}/read`);

export const editMessageApi = (messageId: string, text: string) =>
  api.patch<{ success: boolean; data: ChatMessage }>(
    `/chat/messages/${messageId}`,
    { text }
  );

export const recallMessageApi = (messageId: string) =>
  api.post<{ success: boolean; data: ChatMessage }>(
    `/chat/messages/${messageId}/recall`
  );

export const deleteMessageApi = (messageId: string) =>
  api.delete(`/chat/messages/${messageId}`);
