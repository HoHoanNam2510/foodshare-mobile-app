import { Feather } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Conversation, getMyConversationsApi } from '@/lib/chatApi';
import { useAuthStore } from '@/stores/authStore';

// ─── HELPERS ────────────────────────────────────────────────────────────────

function formatTime(iso?: string): string {
  if (!iso) return '';
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  } else if (diffDays === 1) {
    return 'Hôm qua';
  } else if (diffDays < 7) {
    const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    return days[date.getDay()];
  }
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
}

// ─── SUB-COMPONENTS ──────────────────────────────────────────────────────────

function ChatCard({
  conversation,
  currentUserId,
  onPress,
}: {
  conversation: Conversation;
  currentUserId: string;
  onPress: () => void;
}) {
  const other = conversation.participants.find((p) => p._id !== currentUserId);
  const unread = conversation.unreadCount?.[currentUserId] ?? 0;
  const hasUnread = unread > 0;
  const lastMsg = conversation.lastMessage?.content ?? 'Bắt đầu cuộc trò chuyện';
  const time = formatTime(conversation.lastMessage?.createdAt ?? conversation.updatedAt);
  const avatarUri = other?.avatar ?? `https://i.pravatar.cc/150?u=${other?._id}`;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      className="mx-5 mb-3 bg-neutral-T100 rounded-2xl px-4 py-3.5 flex-row items-center shadow-sm active:opacity-80"
    >
      {/* Avatar */}
      <View className="relative mr-3.5">
        <Image source={{ uri: avatarUri }} className="w-[54px] h-[54px] rounded-full" />
      </View>

      {/* Text content */}
      <View className="flex-1 justify-center">
        <View className="flex-row justify-between items-baseline mb-1">
          <Text
            className="font-body text-[15px] text-neutral-T10 flex-1 mr-2"
            style={{ fontWeight: hasUnread ? '700' : '400' }}
            numberOfLines={1}
          >
            {other?.fullName ?? 'Người dùng'}
          </Text>
          <Text
            className={`font-label text-[11px] ${hasUnread ? 'text-primary-T40' : 'text-neutral-T50'}`}
            style={{ fontWeight: hasUnread ? '600' : '400' }}
          >
            {time}
          </Text>
        </View>

        <View className="flex-row justify-between items-center">
          <Text
            className={`font-body text-[13px] flex-1 mr-2 ${hasUnread ? 'text-neutral-T30' : 'text-neutral-T50'}`}
            style={{ fontWeight: hasUnread ? '500' : '400' }}
            numberOfLines={1}
          >
            {lastMsg}
          </Text>

          {hasUnread ? (
            <View className="min-w-[20px] h-5 bg-primary-T40 rounded-full items-center justify-center px-1.5">
              <Text className="font-label text-[10px] text-neutral-T100" style={{ fontWeight: '700' }}>
                {unread}
              </Text>
            </View>
          ) : (
            <Feather name="check-circle" size={15} color="#AAABAB" />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── MAIN SCREEN ──────────────────────────────────────────────────────────────

export default function ChatListScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState('');

  const loadConversations = useCallback(async () => {
    try {
      const res = await getMyConversationsApi();
      setConversations(res.data.data ?? []);
    } catch {
      // keep existing list on error
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Reload when tab is focused
  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadConversations();
    }, [loadConversations])
  );

  const filtered = query.trim()
    ? conversations.filter((c) => {
        const other = c.participants.find((p) => p._id !== user?._id);
        return other?.fullName.toLowerCase().includes(query.toLowerCase());
      })
    : conversations;

  return (
    <SafeAreaView className="flex-1 bg-neutral" edges={['top']}>
      {/* ── Header ── */}
      <View className="flex-row items-center justify-between px-5 pt-3 pb-2">
        <Text className="font-sans text-[28px] text-neutral-T10" style={{ fontWeight: '700', letterSpacing: -0.5 }}>
          Tin nhắn
        </Text>
        <View className="flex-row items-center gap-3">
          {user?.avatar ? (
            <Image source={{ uri: user.avatar }} className="w-9 h-9 rounded-full" />
          ) : (
            <View className="w-9 h-9 rounded-full bg-neutral-T90 items-center justify-center">
              <Feather name="user" size={18} color="#AAABAB" />
            </View>
          )}
        </View>
      </View>

      {/* ── Search Bar ── */}
      <View className="px-5 mb-4">
        <View className="flex-row items-center bg-neutral-T100 rounded-xl px-4 py-5 shadow-sm border border-neutral-T90">
          <Feather name="search" size={18} color="#AAABAB" />
          <TextInput
            placeholder="Tìm kiếm tin nhắn…"
            placeholderTextColor="#AAABAB"
            value={query}
            onChangeText={setQuery}
            className="flex-1 ml-2.5 font-body text-[14px] text-neutral-T10"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} activeOpacity={0.7}>
              <Feather name="x" size={16} color="#AAABAB" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#296C24" />
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                loadConversations();
              }}
              tintColor="#296C24"
            />
          }
        >
          {/* ── Section label ── */}
          <View className="flex-row justify-between items-center px-5 mb-3">
            <Text className="font-body-semibold text-[13px] text-neutral-T50">
              {query ? `Kết quả cho "${query}"` : 'Gần đây'}
            </Text>
          </View>

          {/* ── Chat Cards ── */}
          {filtered.length > 0 ? (
            filtered.map((conv) => {
              const other = conv.participants.find((p) => p._id !== user?._id);
              return (
                <ChatCard
                  key={conv._id}
                  conversation={conv}
                  currentUserId={user?._id ?? ''}
                  onPress={() =>
                    router.push({
                      pathname: '/(chat)/chat-detail' as any,
                      params: {
                        conversationId: conv._id,
                        name: other?.fullName ?? 'Người dùng',
                        avatarUri: other?.avatar ?? '',
                      },
                    })
                  }
                />
              );
            })
          ) : (
            <View className="items-center mt-16 px-8">
              <View className="w-16 h-16 bg-neutral-T95 rounded-full items-center justify-center mb-4">
                <Feather name="message-circle" size={28} color="#AAABAB" />
              </View>
              <Text className="font-body text-[15px] text-neutral-T10 mb-1" style={{ fontWeight: '700' }}>
                {query ? 'Không tìm thấy cuộc trò chuyện' : 'Chưa có tin nhắn'}
              </Text>
              <Text className="font-body text-[13px] text-neutral-T50 text-center">
                {query
                  ? 'Thử tìm kiếm với tên khác.'
                  : 'Bắt đầu trò chuyện từ trang chi tiết bài đăng.'}
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
