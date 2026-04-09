import { useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ChatHeader from '@/components/chat/ChatHeader';
import ChatInput from '@/components/chat/ChatInput';
import MessageBubble, { Message } from '@/components/chat/MessageBubble';
import { ChatMessage, getMessagesApi, markAsReadApi, sendMessageApi } from '@/lib/chatApi';
import { connectSocket, joinRoom, leaveRoom } from '@/lib/socket';
import { useAuthStore } from '@/stores/authStore';

// ─── HELPERS ────────────────────────────────────────────────────────────────

function formatTime(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

function toDisplayMessage(msg: ChatMessage, currentUserId: string): Message {
  return {
    id: msg._id,
    sender: msg.senderId === currentUserId ? 'me' : 'other',
    text: msg.content,
    time: formatTime(msg.createdAt),
    isRead: msg.isRead,
  };
}

// ─── SCREEN ─────────────────────────────────────────────────────────────────

export default function ChatDetailScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    conversationId: string;
    name: string;
    avatarUri: string;
  }>();
  const { user } = useAuthStore();
  const scrollRef = useRef<ScrollView>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [sending, setSending] = useState(false);

  const conversationId = params.conversationId;
  const avatarUri = params.avatarUri || `https://i.pravatar.cc/150?u=${conversationId}`;

  // Load message history
  const loadMessages = useCallback(async () => {
    if (!conversationId || !user) return;
    try {
      const res = await getMessagesApi(conversationId);
      // API returns newest first — reverse for chronological display
      const sorted = [...(res.data.data ?? [])].reverse();
      setMessages(sorted.map((m) => toDisplayMessage(m, user._id)));
    } catch {
      // keep existing messages on error
    }
  }, [conversationId, user]);

  // Setup socket + load history
  useEffect(() => {
    if (!conversationId) return;

    let mounted = true;

    const setup = async () => {
      await loadMessages();

      // Mark as read
      markAsReadApi(conversationId).catch(() => {});

      // Connect socket and join room
      const socket = await connectSocket();
      if (!mounted) return;

      joinRoom(conversationId);

      socket.on('new-message', (msg: ChatMessage) => {
        if (!user) return;
        setMessages((prev) => {
          // Deduplicate by id
          if (prev.some((m) => m.id === msg._id)) return prev;
          return [...prev, toDisplayMessage(msg, user._id)];
        });
        // Scroll to bottom
        setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
        // Mark as read when screen is open
        markAsReadApi(conversationId).catch(() => {});
      });
    };

    setup();

    return () => {
      mounted = false;
      leaveRoom(conversationId);
    };
  }, [conversationId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSend = async (text: string) => {
    if (!conversationId || sending) return;
    setSending(true);
    try {
      const res = await sendMessageApi(conversationId, text);
      const saved = res.data.data;
      // Emit to socket so other participant gets it in real-time
      const { getSocket } = await import('@/lib/socket');
      const socket = getSocket();
      socket?.emit('client-message', { conversationId, message: saved });
    } catch {
      // message failed — could show a toast here
    } finally {
      setSending(false);
    }
  };

  return (
    <View className="flex-1 bg-neutral">
      <ChatHeader
        name={params.name || 'Người dùng'}
        avatarUri={avatarUri}
        isOnline={false}
      />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          ref={scrollRef}
          className="flex-1 px-6 pt-4"
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
          contentContainerStyle={{ paddingBottom: 8 }}
        >
          {/* Date separator */}
          <View className="items-center my-4">
            <View className="bg-neutral-T95 rounded-full px-4 py-1">
              <Text className="font-label text-xs text-neutral-T50 uppercase tracking-widest">
                Hôm nay
              </Text>
            </View>
          </View>

          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} avatarUri={avatarUri} />
          ))}
        </ScrollView>

        <View style={{ paddingBottom: Math.max(insets.bottom, 8) }}>
          <ChatInput onSend={handleSend} disabled={sending} />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
