import * as SecureStore from 'expo-secure-store';
import { io, Socket } from 'socket.io-client';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

let socket: Socket | null = null;

export async function connectSocket(): Promise<Socket> {
  // Return existing socket if connected OR still connecting (prevents duplicate sockets)
  if (socket && !socket.disconnected) return socket;

  const token = await SecureStore.getItemAsync('auth_token');

  socket = io(API_BASE_URL, {
    auth: { token },
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  return socket;
}

export function getSocket(): Socket | null {
  return socket;
}

export function disconnectSocket(): void {
  socket?.disconnect();
  socket = null;
}

export function joinRoom(conversationId: string): void {
  socket?.emit('join-room', conversationId);
}

export function leaveRoom(conversationId: string): void {
  socket?.emit('leave-room', conversationId);
}

export function subscribeToNotifications(
  onNotification: (notification: unknown) => void
): () => void {
  if (!socket) return () => {};

  socket.on('new-notification', onNotification);

  return () => {
    socket?.off('new-notification', onNotification);
  };
}

export interface PresenceUpdate {
  userId: string;
  online: boolean;
  lastSeen?: string;
}

export function emitMessageUpdate(
  conversationId: string,
  message: unknown
): void {
  socket?.emit('client-message-update', { conversationId, message });
}

export function emitMessageRecall(
  conversationId: string,
  messageId: string
): void {
  socket?.emit('client-message-recall', { conversationId, messageId });
}

export function subscribeToMessageUpdates(
  onUpdate: (message: unknown) => void,
  onRecall: (data: { messageId: string }) => void
): () => void {
  if (!socket) return () => {};

  socket.on('message:updated', onUpdate);
  socket.on('message:recalled', onRecall);

  return () => {
    socket?.off('message:updated', onUpdate);
    socket?.off('message:recalled', onRecall);
  };
}

/**
 * Theo dõi trạng thái online/offline của một user.
 * Server gửi trạng thái hiện tại ngay khi subscribe, và phát tiếp khi có thay đổi.
 */
export function subscribeToPresence(
  userId: string,
  onUpdate: (data: PresenceUpdate) => void
): () => void {
  if (!socket || !userId) return () => {};

  socket.emit('subscribe-presence', userId);

  const handler = (data: PresenceUpdate) => {
    if (data.userId === userId) onUpdate(data);
  };
  socket.on('presence:update', handler);

  return () => {
    socket?.emit('unsubscribe-presence', userId);
    socket?.off('presence:update', handler);
  };
}
