import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ChatHeader from '@/components/chat/ChatHeader';
import ChatInput from '@/components/chat/ChatInput';
import MessageBubble, { Message } from '@/components/chat/MessageBubble';
import SharedEntityCard from '@/components/chat/SharedEntityCard';
import {
  ChatMessage,
  deleteMessageApi,
  editMessageApi,
  getMessagesApi,
  markAsReadApi,
  recallMessageApi,
  sendMessageApi,
} from '@/lib/chatApi';
import { useThemeColors } from '@/lib/hooks/useThemeColors';
import { pickImage } from '@/lib/imagePicker';
import {
  connectSocket,
  emitMessageRecall,
  emitMessageUpdate,
  joinRoom,
  leaveRoom,
  subscribeToMessageUpdates,
  subscribeToPresence,
} from '@/lib/socket';
import { uploadImage } from '@/lib/uploadApi';
import { useAuthStore } from '@/stores/authStore';

// ─── HELPERS ────────────────────────────────────────────────────────────────

function isSameDay(a: string, b: string): boolean {
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
}

function formatTime(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatSessionDate(iso: string, language: string): string {
  const locale = language === 'vi' ? 'vi-VN' : 'en-US';
  return new Date(iso).toLocaleDateString(locale, {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function toDisplayMessage(msg: ChatMessage, currentUserId: string): Message {
  return {
    id: msg._id,
    sender: msg.senderId === currentUserId ? 'me' : 'other',
    text: msg.content,
    time: formatTime(msg.createdAt),
    isRead: msg.isRead,
    createdAt: msg.createdAt,
    messageType: msg.messageType,
    imageUrl: msg.imageUrl,
    location: msg.location,
    relatedPost: msg.relatedPost,
    relatedTransaction: msg.relatedTransaction,
    isEdited: msg.isEdited,
    isRecalled: msg.isRecalled,
  };
}

interface PendingShare {
  kind: 'POST' | 'TRANSACTION';
  id: string;
  title: string;
  imageUrl?: string;
  subtitle?: string;
}

// ─── SCREEN ─────────────────────────────────────────────────────────────────

export default function ChatDetailScreen() {
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const params = useLocalSearchParams<{
    conversationId: string;
    name: string;
    avatarUri: string;
    otherUserId: string;
    sharePostId?: string;
    shareTransactionId?: string;
    shareTitle?: string;
    shareImage?: string;
    shareSubtitle?: string;
  }>();
  const { user } = useAuthStore();
  const scrollRef = useRef<ScrollView>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [lastSeen, setLastSeen] = useState<string | null>(null);

  // Edit mode state
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);

  // Pending share card (từ post-detail / transaction-detail)
  const [pendingShare, setPendingShare] = useState<PendingShare | null>(() => {
    if (params.sharePostId) {
      return {
        kind: 'POST',
        id: params.sharePostId,
        title: params.shareTitle ?? '',
        imageUrl: params.shareImage || undefined,
        subtitle:
          params.shareSubtitle === 'FREE'
            ? t('chat.postFree')
            : params.shareSubtitle
              ? `${Number(params.shareSubtitle).toLocaleString('vi-VN')}đ`
              : undefined,
      };
    }
    if (params.shareTransactionId) {
      const statusKey =
        `transaction.status${params.shareSubtitle?.charAt(0).toUpperCase()}${params.shareSubtitle?.slice(1).toLowerCase()}` as const;
      return {
        kind: 'TRANSACTION',
        id: params.shareTransactionId,
        title: params.shareTitle ?? '',
        imageUrl: params.shareImage || undefined,
        subtitle: params.shareSubtitle
          ? t(statusKey as Parameters<typeof t>[0])
          : undefined,
      };
    }
    return null;
  });

  const otherUserId = params.otherUserId;
  const conversationId = params.conversationId;
  const avatarUri =
    params.avatarUri || `https://i.pravatar.cc/150?u=${conversationId}`;

  const loadMessages = useCallback(async () => {
    if (!conversationId || !user) return;
    try {
      const res = await getMessagesApi(conversationId);
      const sorted = [...(res.data.data ?? [])].reverse();
      setMessages(sorted.map((m) => toDisplayMessage(m, user._id)));
    } catch {
      // keep existing messages on error
    }
  }, [conversationId, user]);

  useEffect(() => {
    if (!conversationId) return;

    let mounted = true;
    let unsubPresence: (() => void) | undefined;
    let unsubMessageUpdates: (() => void) | undefined;
    let unsubNewMessage: (() => void) | undefined;

    const setup = async () => {
      await loadMessages();
      markAsReadApi(conversationId).catch(() => {});

      const socket = await connectSocket();
      if (!mounted) return;

      joinRoom(conversationId);

      if (otherUserId) {
        unsubPresence = subscribeToPresence(otherUserId, (data) => {
          if (mounted) {
            setIsOnline(data.online);
            if (!data.online && data.lastSeen) setLastSeen(data.lastSeen);
          }
        });
      }

      const newMessageHandler = (msg: ChatMessage) => {
        if (!user) return;
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg._id)) return prev;
          return [...prev, toDisplayMessage(msg, user._id)];
        });
        setTimeout(
          () => scrollRef.current?.scrollToEnd({ animated: true }),
          100
        );
        markAsReadApi(conversationId).catch(() => {});
      };
      socket.on('new-message', newMessageHandler);
      unsubNewMessage = () => socket.off('new-message', newMessageHandler);

      // Real-time edit: update the message in state
      unsubMessageUpdates = subscribeToMessageUpdates(
        (updated) => {
          const msg = updated as ChatMessage;
          if (!user) return;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === msg._id
                ? { ...m, text: msg.content, isEdited: msg.isEdited }
                : m
            )
          );
        },
        ({ messageId }) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === messageId ? { ...m, isRecalled: true, text: '' } : m
            )
          );
        }
      );
    };

    setup();

    return () => {
      mounted = false;
      unsubPresence?.();
      unsubMessageUpdates?.();
      unsubNewMessage?.();
      leaveRoom(conversationId);
    };
  }, [conversationId]); // eslint-disable-line react-hooks/exhaustive-deps

  const emitMessage = async (saved: ChatMessage) => {
    const { getSocket } = await import('@/lib/socket');
    getSocket()?.emit('client-message', { conversationId, message: saved });
  };

  /**
   * Gửi thẻ chia sẻ đang chờ (không kèm ghi chú) thành một message riêng.
   * Dùng khi người dùng gửi ảnh / vị trí lúc đang đính kèm thẻ — một message
   * chỉ mang được một loại nội dung nên thẻ phải tách thành message riêng.
   */
  const flushPendingShare = async () => {
    if (!conversationId || !pendingShare) return;
    const payload: Parameters<typeof sendMessageApi>[1] =
      pendingShare.kind === 'POST'
        ? { relatedPostId: pendingShare.id }
        : { relatedTransactionId: pendingShare.id };
    const res = await sendMessageApi(conversationId, payload);
    await emitMessage(res.data.data);
    setPendingShare(null);
  };

  const handleSend = async (text: string) => {
    if (!conversationId || sending) return;
    setSending(true);
    try {
      if (pendingShare) {
        const payload: Parameters<typeof sendMessageApi>[1] = {
          ...(text ? { text } : {}),
          ...(pendingShare.kind === 'POST'
            ? { relatedPostId: pendingShare.id }
            : { relatedTransactionId: pendingShare.id }),
        };
        const res = await sendMessageApi(conversationId, payload);
        await emitMessage(res.data.data);
        setPendingShare(null);
      } else {
        const res = await sendMessageApi(conversationId, { text });
        await emitMessage(res.data.data);
      }
    } catch {
      Alert.alert(t('common.error'), t('chat.startChatError'));
    } finally {
      setSending(false);
    }
  };

  const handleSendLocation = async (location: {
    latitude: number;
    longitude: number;
  }) => {
    if (!conversationId) return;
    try {
      await flushPendingShare();
      const res = await sendMessageApi(conversationId, { location });
      await emitMessage(res.data.data);
    } catch {
      Alert.alert('Lỗi', 'Không thể gửi vị trí. Kiểm tra kết nối mạng.');
    }
  };

  const handleSendImage = async () => {
    if (!conversationId || uploading) return;
    let uri: string | null = null;
    try {
      uri = await pickImage();
    } catch {
      return;
    }
    if (!uri) return;
    setUploading(true);
    try {
      await flushPendingShare();
      const { url } = await uploadImage(uri, 'chat');
      const res = await sendMessageApi(conversationId, { imageUrl: url });
      await emitMessage(res.data.data);
    } catch (err) {
      const errorCode = (
        err as { response?: { data?: { errorCode?: string } } }
      )?.response?.data?.errorCode;
      Alert.alert(
        t('common.error'),
        errorCode === 'IMAGE_RATE_LIMIT'
          ? t('chat.imageRateLimit')
          : t('common.error')
      );
    } finally {
      setUploading(false);
    }
  };

  // ── Edit / Recall / Delete handlers ────────────────────────────────────────

  const handleSaveEdit = async (messageId: string, text: string) => {
    setEditingMessage(null);
    try {
      const res = await editMessageApi(messageId, text);
      const updated = res.data.data;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? { ...m, text: updated.content, isEdited: true }
            : m
        )
      );
      emitMessageUpdate(conversationId, updated);
    } catch {
      // silent — message stays as-is if edit fails
    }
  };

  const handleRecall = async (messageId: string) => {
    try {
      await recallMessageApi(messageId);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId ? { ...m, isRecalled: true, text: '' } : m
        )
      );
      emitMessageRecall(conversationId, messageId);
    } catch {
      // silent
    }
  };

  const handleDelete = async (messageId: string) => {
    try {
      await deleteMessageApi(messageId);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId ? { ...m, isDeleted: true, text: '' } : m
        )
      );
    } catch {
      // silent
    }
  };

  return (
    <View className="bg-neutral dark:bg-neutral-T10 flex-1">
      <ChatHeader
        name={params.name || t('chat.unknownUser')}
        avatarUri={avatarUri}
        isOnline={isOnline}
        lastSeen={lastSeen ?? undefined}
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
          onContentSizeChange={() =>
            scrollRef.current?.scrollToEnd({ animated: false })
          }
          contentContainerStyle={{ paddingBottom: 8 }}
        >
          {messages.map((msg, index) => {
            const prev = messages[index - 1];
            const showSeparator =
              !prev || !isSameDay(msg.createdAt, prev.createdAt);

            return (
              <React.Fragment key={msg.id}>
                {showSeparator && (
                  <View className="my-4 items-center">
                    <View className="bg-neutral-T95 dark:bg-neutral-T30 rounded-full px-4 py-1">
                      <Text className="font-label text-neutral-T50 dark:text-neutral-T60 text-xs">
                        {index > 0
                          ? `${t('chat.sessionStarted')} · ${formatSessionDate(msg.createdAt, i18n.language)}`
                          : formatSessionDate(msg.createdAt, i18n.language)}
                      </Text>
                    </View>
                  </View>
                )}
                <MessageBubble
                  message={msg}
                  avatarUri={avatarUri}
                  onEdit={setEditingMessage}
                  onRecall={handleRecall}
                  onDelete={handleDelete}
                />
              </React.Fragment>
            );
          })}
        </ScrollView>

        <View style={{ paddingBottom: Math.max(insets.bottom, 8) }}>
          {/* Pending share card banner */}
          {pendingShare && (
            <View className="mx-4 mb-2 flex-row items-center justify-between">
              <View className="min-w-0 flex-1">
                <Text
                  className="font-label text-primary-T40 mb-1 text-xs"
                  numberOfLines={1}
                >
                  {pendingShare.kind === 'POST'
                    ? t('chat.pendingSharePost')
                    : t('chat.pendingShareTransaction')}
                </Text>
                <SharedEntityCard
                  kind={pendingShare.kind}
                  title={pendingShare.title}
                  imageUrl={pendingShare.imageUrl}
                  subtitle={pendingShare.subtitle}
                  compact
                />
              </View>
              <TouchableOpacity
                onPress={() => setPendingShare(null)}
                className="ml-2 p-1"
              >
                <Feather name="x" size={16} color={colors.placeholder} />
              </TouchableOpacity>
            </View>
          )}
          <ChatInput
            onSend={handleSend}
            onSendImage={handleSendImage}
            onSendLocation={handleSendLocation}
            onSaveEdit={handleSaveEdit}
            onCancelEdit={() => setEditingMessage(null)}
            editingMessageId={editingMessage?.id}
            editInitialText={editingMessage?.text}
            disabled={sending}
            uploading={uploading}
            pendingShare={!!pendingShare}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
