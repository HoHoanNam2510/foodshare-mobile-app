import { Feather } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useTranslation } from 'react-i18next';
import { Conversation, getMyConversationsApi } from '@/lib/chatApi';
import { useAuthStore } from '@/stores/authStore';
import MainHeader from '@/components/shared/headers/MainHeader';

// ─── HELPERS ────────────────────────────────────────────────────────────────

function formatTime(
  iso: string | undefined,
  yesterday: string,
  language: string
): string {
  if (!iso) return '';
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const locale = language === 'vi' ? 'vi-VN' : 'en-US';

  if (diffDays === 0) {
    return date.toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit',
    });
  } else if (diffDays === 1) {
    return yesterday;
  } else if (diffDays < 7) {
    return date.toLocaleDateString(locale, { weekday: 'short' });
  }
  return date.toLocaleDateString(locale, { day: '2-digit', month: '2-digit' });
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
  const { t, i18n } = useTranslation();
  const other = conversation.participants.find((p) => p._id !== currentUserId);
  const unread = conversation.unreadCount?.[currentUserId] ?? 0;
  const hasUnread = unread > 0;
  const lastMsg =
    conversation.lastMessage?.content ?? t('chat.startConversation');
  const time = formatTime(
    conversation.lastMessage?.createdAt ?? conversation.updatedAt,
    t('common.yesterday'),
    i18n.language
  );
  const avatarUri =
    other?.avatar ?? `https://i.pravatar.cc/150?u=${other?._id}`;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      className="mx-5 mb-3 bg-neutral-T100 rounded-2xl px-4 py-3.5 flex-row items-center shadow-sm active:opacity-80"
    >
      {/* Avatar */}
      <View className="relative mr-3.5">
        <Image
          source={{ uri: avatarUri }}
          className="w-[54px] h-[54px] rounded-full"
        />
      </View>

      {/* Text content */}
      <View className="flex-1 justify-center">
        <View className="flex-row justify-between items-baseline mb-1">
          <Text
            className="font-body text-[15px] text-neutral-T10 flex-1 mr-2"
            style={{ fontWeight: hasUnread ? '700' : '400' }}
            numberOfLines={1}
          >
            {other?.fullName ?? t('chat.unknownUser')}
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
              <Text
                className="font-label text-[10px] text-neutral-T100"
                style={{ fontWeight: '700' }}
              >
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
  const { t } = useTranslation();
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
    <View className="flex-1 bg-neutral">
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />
      <MainHeader />

      {/* ── Search Bar ── */}
      <View className="px-5 py-3">
        <View className="flex-row items-center bg-neutral-T100 rounded-xl px-4 py-5 shadow-sm border border-neutral-T90">
          <Feather name="search" size={18} color="#AAABAB" />
          <TextInput
            placeholder={t('chat.searchPlaceholder')}
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
              {query
                ? t('chat.searchResultsFor', { query })
                : t('chat.recentLabel')}
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
                        name: other?.fullName ?? t('chat.unknownUser'),
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
              <Text
                className="font-body text-[15px] text-neutral-T10 mb-1"
                style={{ fontWeight: '700' }}
              >
                {query ? t('chat.noResultsTitle') : t('chat.noChats')}
              </Text>
              <Text className="font-body text-[13px] text-neutral-T50 text-center">
                {query ? t('chat.noResultsHint') : t('chat.startFromPost')}
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}
