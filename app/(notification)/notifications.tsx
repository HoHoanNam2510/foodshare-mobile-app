import React, { useCallback, useEffect } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import StackHeader from '@/components/shared/headers/StackHeader';
import { useNotificationStore } from '@/stores/notificationStore';
import type { INotification } from '@/lib/notificationApi';

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatRelativeTime(dateString: string): string {
  const diff = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Vừa xong';
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} ngày trước`;
  return new Date(dateString).toLocaleDateString('vi-VN');
}

function getNotificationIcon(type: INotification['type']): React.ReactNode {
  const iconMap: Record<
    INotification['type'],
    { name: keyof typeof Feather.glyphMap; color: string }
  > = {
    TRANSACTION: { name: 'repeat', color: '#2A7C6E' },
    SYSTEM: { name: 'bell', color: '#6366F1' },
    RADAR: { name: 'map-pin', color: '#F59E0B' },
    VOUCHER: { name: 'tag', color: '#EC4899' },
  };
  const { name, color } = iconMap[type] ?? { name: 'bell', color: '#6B7280' };
  return <Feather name={name} size={20} color={color} />;
}

// ── NotificationCard ──────────────────────────────────────────────────────────

interface CardProps {
  item: INotification;
  onPress: (item: INotification) => void;
}

function NotificationCard({ item, onPress }: CardProps) {
  return (
    <TouchableOpacity
      onPress={() => onPress(item)}
      activeOpacity={0.75}
      className="bg-neutral-T100 dark:bg-neutral-T20 flex-row items-start gap-3 px-4 py-3"
      style={
        !item.isRead
          ? { borderLeftWidth: 3, borderLeftColor: '#2A7C6E' }
          : undefined
      }
    >
      <View className="bg-neutral-T95 dark:bg-neutral-T30 mt-0.5 h-10 w-10 shrink-0 items-center justify-center rounded-full">
        {getNotificationIcon(item.type)}
      </View>

      <View className="flex-1">
        <Text
          className="text-neutral-T10 dark:text-neutral-T90 text-base"
          style={{
            fontFamily: item.isRead
              ? 'Be Vietnam Pro'
              : 'BeVietnamPro-SemiBold',
          }}
          numberOfLines={1}
        >
          {item.title}
        </Text>
        <Text
          className="text-neutral-T30 dark:text-neutral-T80 mt-0.5 text-sm"
          numberOfLines={2}
        >
          {item.body}
        </Text>
        <Text className="text-neutral-T50 dark:text-neutral-T60 mt-1 text-xs">
          {formatRelativeTime(item.createdAt)}
        </Text>
      </View>

      {!item.isRead && (
        <View className="bg-primary-T40 mt-2 h-2 w-2 shrink-0 rounded-full" />
      )}
    </TouchableOpacity>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function NotificationsScreen() {
  const router = useRouter();
  const {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    fetchNextPage,
    markAsRead,
    markAllAsRead,
  } = useNotificationStore();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handlePressItem = useCallback(
    async (item: INotification) => {
      if (!item.isRead) {
        await markAsRead(item._id);
      }
      if (item.type === 'TRANSACTION' && item.referenceId) {
        router.push(
          `/(transaction)/transaction-detail?id=${item.referenceId}` as never
        );
      } else if (item.type === 'RADAR' && item.referenceId) {
        router.push(`/(post)/post-detail?id=${item.referenceId}` as never);
      } else if (item.type === 'VOUCHER' && item.referenceId) {
        router.push(
          `/(voucher)/voucher-detail?id=${item.referenceId}` as never
        );
      } else if (
        item.type === 'SYSTEM' &&
        item.title === 'Bạn có đánh giá mới!'
      ) {
        router.push('/(review)/my-reviews' as never);
      }
    },
    [markAsRead, router]
  );

  const renderItem = useCallback(
    ({ item }: { item: INotification }) => (
      <NotificationCard item={item} onPress={handlePressItem} />
    ),
    [handlePressItem]
  );

  const renderSeparator = useCallback(
    () => <View className="bg-neutral-T95 dark:bg-neutral-T30 mx-4 h-px" />,
    []
  );

  const renderEmpty = useCallback(
    () => (
      <View className="flex-1 items-center justify-center gap-3 py-20">
        <Feather name="bell-off" size={48} color="#B0BAC0" />
        <Text className="text-neutral-T50 text-base">
          Chưa có thông báo nào
        </Text>
      </View>
    ),
    []
  );

  const renderFooter = useCallback(
    () =>
      isLoading ? (
        <ActivityIndicator size="small" color="#2A7C6E" className="py-4" />
      ) : null,
    [isLoading]
  );

  const markAllButton =
    unreadCount > 0 ? (
      <TouchableOpacity
        onPress={markAllAsRead}
        className="h-10 w-10 items-center justify-center active:opacity-70"
      >
        <Feather name="check-circle" size={20} color="#2A7C6E" />
      </TouchableOpacity>
    ) : (
      <View className="h-10 w-10" />
    );

  return (
    <SafeAreaView
      edges={['bottom']}
      className="bg-neutral dark:bg-neutral-T10 flex-1"
    >
      <StackHeader title="Thông báo" rightElement={markAllButton} />

      <FlatList
        data={notifications}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        ItemSeparatorComponent={renderSeparator}
        ListEmptyComponent={!isLoading ? renderEmpty : null}
        ListFooterComponent={renderFooter}
        onEndReached={fetchNextPage}
        onEndReachedThreshold={0.3}
        contentContainerStyle={
          notifications.length === 0 ? { flex: 1 } : undefined
        }
      />
    </SafeAreaView>
  );
}
