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
import { useColorScheme } from 'nativewind';

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
      className="bg-neutral-T100 dark:bg-neutral-T20 dark:border-neutral-T30 mx-5 mb-3 flex-row items-center rounded-2xl px-4 py-3.5 shadow-sm active:opacity-80 dark:border dark:shadow-none"
    >
      {/* Avatar */}
      <View className="relative mr-3.5">
        <Image
          source={{ uri: avatarUri }}
          className="h-[54px] w-[54px] rounded-full"
        />
      </View>

      {/* Text content */}
      <View className="flex-1 justify-center">
        <View className="mb-1 flex-row items-baseline justify-between">
          <Text
            className={`font-body mr-2 flex-1 text-[15px] ${hasUnread ? 'text-neutral-T10 dark:text-neutral-T90 font-bold' : 'text-neutral-T10 dark:text-neutral-T90 font-normal'}`}
            numberOfLines={1}
          >
            {other?.fullName ?? t('chat.unknownUser')}
          </Text>
          <Text
            className={`font-label text-[11px] ${hasUnread ? 'text-primary-T40 dark:text-primary-T60 font-semibold' : 'text-neutral-T50 dark:text-neutral-T60 font-normal'}`}
          >
            {time}
          </Text>
        </View>

        <View className="flex-row items-center justify-between">
          <Text
            className={`font-body mr-2 flex-1 text-[13px] ${hasUnread ? 'text-neutral-T30 dark:text-neutral-T80 font-medium' : 'text-neutral-T50 dark:text-neutral-T60 font-normal'}`}
            numberOfLines={1}
          >
            {lastMsg}
          </Text>

          {hasUnread ? (
            <View className="bg-primary-T40 h-5 min-w-[20px] items-center justify-center rounded-full px-1.5">
              <Text className="font-label text-neutral-T100 text-[10px] font-bold">
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
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
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
    <View className="bg-neutral dark:bg-neutral-T10 flex-1">
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      <MainHeader />

      {/* ── Search Bar ── */}
      <View className="px-5 py-3">
        <View className="bg-neutral-T100 dark:bg-neutral-T20 border-neutral-T90 dark:border-neutral-T30 flex-row items-center rounded-xl border px-4 py-5 shadow-sm dark:shadow-none">
          <Feather name="search" size={18} color="#AAABAB" />
          <TextInput
            placeholder={t('chat.searchPlaceholder')}
            placeholderTextColor="#AAABAB"
            value={query}
            onChangeText={setQuery}
            className="font-body text-neutral-T10 dark:text-neutral-T90 ml-2.5 flex-1 text-[14px]"
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
          <View className="mb-3 flex-row items-center justify-between px-5">
            <Text className="font-body-semibold text-neutral-T50 dark:text-neutral-T60 text-[13px]">
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
                        otherUserId: other?._id ?? '',
                        name: other?.fullName ?? t('chat.unknownUser'),
                        avatarUri: other?.avatar ?? '',
                      },
                    })
                  }
                />
              );
            })
          ) : (
            <View className="mt-16 items-center px-8">
              <View className="bg-neutral-T95 dark:bg-neutral-T30 mb-4 h-16 w-16 items-center justify-center rounded-full">
                <Feather name="message-circle" size={28} color="#AAABAB" />
              </View>
              <Text className="font-body text-neutral-T10 dark:text-neutral-T90 mb-1 text-[15px] font-bold">
                {query ? t('chat.noResultsTitle') : t('chat.noChats')}
              </Text>
              <Text className="font-body text-neutral-T50 dark:text-neutral-T60 text-center text-[13px]">
                {query ? t('chat.noResultsHint') : t('chat.startFromPost')}
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}
