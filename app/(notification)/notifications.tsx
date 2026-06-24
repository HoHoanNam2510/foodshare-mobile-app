import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActionSheetIOS,
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import type { SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';

import StackHeader from '@/components/shared/headers/StackHeader';
import { useNotificationStore } from '@/stores/notificationStore';
import type { INotification } from '@/lib/notificationApi';

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatRelativeTime(dateString: string, t: TFunction): string {
  const diff = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return t('notification.justNow');
  if (minutes < 60) return t('common.minutesAgo', { count: minutes });
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t('common.hoursAgo', { count: hours });
  const days = Math.floor(hours / 24);
  if (days < 7) return t('common.daysAgo', { count: days });
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
    FEEDBACK: { name: 'message-circle', color: '#8B5CF6' },
  };
  const { name, color } = iconMap[type] ?? { name: 'bell', color: '#6B7280' };
  return <Feather name={name} size={20} color={color} />;
}

// ── Swipe delete action (right side) ─────────────────────────────────────────

function DeleteAction({ onPress }: { onPress: () => void }) {
  const { t } = useTranslation();
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className="w-20 items-center justify-center bg-red-500"
    >
      <Feather name="trash-2" size={20} color="#fff" />
      <Text className="mt-1 text-xs font-medium text-white">
        {t('notification.deleteAction')}
      </Text>
    </TouchableOpacity>
  );
}

// ── NotificationCard ──────────────────────────────────────────────────────────

interface CardProps {
  item: INotification;
  isSelectMode: boolean;
  isSelected: boolean;
  onPress: (item: INotification) => void;
  onLongPress: (item: INotification) => void;
  onDelete: (id: string) => void;
}

function NotificationCard({
  item,
  isSelectMode,
  isSelected,
  onPress,
  onLongPress,
  onDelete,
}: CardProps) {
  const { t } = useTranslation();
  const swipeableRef = useRef<SwipeableMethods>(null);

  const handleDeletePress = useCallback(() => {
    swipeableRef.current?.close();
    Alert.alert(
      t('notification.deleteTitle'),
      t('notification.deleteOneConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('notification.deleteAction'),
          style: 'destructive',
          onPress: () => onDelete(item._id),
        },
      ]
    );
  }, [item._id, onDelete, t]);

  const displayTitle = item.titleKey
    ? t(item.titleKey, item.bodyParams)
    : item.title;
  const displayBody = item.bodyKey
    ? t(item.bodyKey, item.bodyParams)
    : item.body;

  const cardContent = (
    <TouchableOpacity
      onPress={() => onPress(item)}
      onLongPress={() => {
        if (item.isRead) onLongPress(item);
      }}
      delayLongPress={300}
      activeOpacity={0.75}
      className="bg-neutral-T100 dark:bg-neutral-T20 flex-row items-start gap-3 px-4 py-3"
      style={
        !item.isRead
          ? { borderLeftWidth: 3, borderLeftColor: '#2A7C6E' }
          : undefined
      }
    >
      {/* Checkbox (select mode, read only) */}
      {isSelectMode && item.isRead && (
        <View
          className="mt-1 h-5 w-5 shrink-0 items-center justify-center rounded-full border-2"
          style={{
            borderColor: isSelected ? '#2A7C6E' : '#B0BAC0',
            backgroundColor: isSelected ? '#2A7C6E' : 'transparent',
          }}
        >
          {isSelected && <Feather name="check" size={12} color="#fff" />}
        </View>
      )}

      {/* Icon */}
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
          {displayTitle}
        </Text>
        <Text
          className="text-neutral-T30 dark:text-neutral-T80 mt-0.5 text-sm"
          numberOfLines={2}
        >
          {displayBody}
        </Text>
        <Text className="text-neutral-T50 dark:text-neutral-T60 mt-1 text-xs">
          {formatRelativeTime(item.createdAt, t)}
        </Text>
      </View>

      {!item.isRead && (
        <View className="bg-primary-T40 mt-2 h-2 w-2 shrink-0 rounded-full" />
      )}
    </TouchableOpacity>
  );

  // Unread: no swipe, no select checkbox
  if (!item.isRead || isSelectMode) {
    return cardContent;
  }

  // Read + normal mode: wrap with ReanimatedSwipeable
  return (
    <ReanimatedSwipeable
      ref={swipeableRef}
      friction={2}
      rightThreshold={40}
      renderRightActions={() => <DeleteAction onPress={handleDeletePress} />}
    >
      {cardContent}
    </ReanimatedSwipeable>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function NotificationsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const {
    notifications,
    unreadCount,
    isLoading,
    isSelectMode,
    selectedIds,
    fetchNotifications,
    fetchNextPage,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteMany,
    deleteAllRead,
    enterSelectMode,
    exitSelectMode,
    toggleSelect,
  } = useNotificationStore();

  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchNotifications();
    setIsRefreshing(false);
  }, [fetchNotifications]);

  // Reset select mode khi rời khỏi màn hình
  useFocusEffect(
    useCallback(() => {
      return () => {
        exitSelectMode();
      };
    }, [exitSelectMode])
  );

  const hasReadNotifications = notifications.some((n) => n.isRead);

  const handlePressItem = useCallback(
    async (item: INotification) => {
      if (isSelectMode) {
        if (item.isRead) toggleSelect(item._id);
        return;
      }
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
    [isSelectMode, markAsRead, router, toggleSelect]
  );

  const handleLongPress = useCallback(
    (item: INotification) => {
      if (!isSelectMode) {
        enterSelectMode();
        toggleSelect(item._id);
      }
    },
    [isSelectMode, enterSelectMode, toggleSelect]
  );

  const handleDelete = useCallback(
    (id: string) => {
      deleteNotification(id);
    },
    [deleteNotification]
  );

  const handleDeleteMany = useCallback(() => {
    if (selectedIds.length === 0) return;
    Alert.alert(
      t('notification.deleteTitle'),
      t('notification.deleteManyConfirm', { count: selectedIds.length }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('notification.deleteAction'),
          style: 'destructive',
          onPress: () => deleteMany(selectedIds),
        },
      ]
    );
  }, [selectedIds, deleteMany, t]);

  const handleTrashPress = useCallback(() => {
    const options = [
      t('notification.deleteAllReadTitle'),
      t('notification.selectToDelete'),
      t('common.cancel'),
    ];

    const execute = (index: number) => {
      if (index === 0) {
        Alert.alert(
          t('notification.deleteAllReadTitle'),
          t('notification.deleteAllReadConfirm'),
          [
            { text: t('common.cancel'), style: 'cancel' },
            {
              text: t('notification.deleteAction'),
              style: 'destructive',
              onPress: deleteAllRead,
            },
          ]
        );
      } else if (index === 1) {
        enterSelectMode();
      }
    };

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options, destructiveButtonIndex: 0, cancelButtonIndex: 2 },
        execute
      );
    } else {
      Alert.alert(t('notification.deleteOptionsTitle'), undefined, [
        {
          text: t('notification.deleteAllReadTitle'),
          style: 'destructive',
          onPress: () => execute(0),
        },
        { text: t('notification.selectToDelete'), onPress: () => execute(1) },
        { text: t('common.cancel'), style: 'cancel' },
      ]);
    }
  }, [deleteAllRead, enterSelectMode, t]);

  const renderItem = useCallback(
    ({ item }: { item: INotification }) => (
      <NotificationCard
        item={item}
        isSelectMode={isSelectMode}
        isSelected={selectedIds.includes(item._id)}
        onPress={handlePressItem}
        onLongPress={handleLongPress}
        onDelete={handleDelete}
      />
    ),
    [isSelectMode, selectedIds, handlePressItem, handleLongPress, handleDelete]
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
          {t('notification.empty')}
        </Text>
      </View>
    ),
    [t]
  );

  const renderFooter = useCallback(
    () =>
      isLoading ? (
        <ActivityIndicator size="small" color="#2A7C6E" className="py-4" />
      ) : null,
    [isLoading]
  );

  // ── Header right buttons ──────────────────────────────────────────────────

  const headerRight = isSelectMode ? (
    <TouchableOpacity
      onPress={exitSelectMode}
      className="h-10 items-center justify-center px-2 active:opacity-70"
    >
      <Text className="text-primary-T40 text-base font-medium">
        {t('common.cancel')}
      </Text>
    </TouchableOpacity>
  ) : (
    <View className="flex-row items-center gap-1">
      {unreadCount > 0 && (
        <TouchableOpacity
          onPress={markAllAsRead}
          className="h-10 w-10 items-center justify-center active:opacity-70"
        >
          <Feather name="check-circle" size={20} color="#2A7C6E" />
        </TouchableOpacity>
      )}
      {hasReadNotifications && (
        <TouchableOpacity
          onPress={handleTrashPress}
          className="h-10 w-10 items-center justify-center active:opacity-70"
        >
          <Feather name="trash-2" size={20} color="#EF4444" />
        </TouchableOpacity>
      )}
    </View>
  );

  const headerTitle = isSelectMode
    ? t('notification.selectedCount', { count: selectedIds.length })
    : t('notification.title');

  return (
    <SafeAreaView
      edges={['bottom']}
      className="bg-neutral dark:bg-neutral-T10 flex-1"
    >
      <StackHeader title={headerTitle} rightElement={headerRight} />

      <FlatList
        data={notifications}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        ItemSeparatorComponent={renderSeparator}
        ListEmptyComponent={!isLoading ? renderEmpty : null}
        ListFooterComponent={renderFooter}
        onEndReached={fetchNextPage}
        onEndReachedThreshold={0.3}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#2A7C6E"
          />
        }
        contentContainerStyle={
          notifications.length === 0 ? { flex: 1 } : undefined
        }
      />

      {/* Bottom bar — multi-select delete */}
      {isSelectMode && selectedIds.length > 0 && (
        <View className="border-t-neutral-T90 dark:border-t-neutral-T30 dark:bg-neutral-T20 border-t bg-white px-4 pb-4 pt-3">
          <TouchableOpacity
            onPress={handleDeleteMany}
            activeOpacity={0.8}
            className="items-center justify-center rounded-xl bg-red-500 py-3"
          >
            <Text className="text-base font-semibold text-white">
              {t('notification.deleteCount', { count: selectedIds.length })}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}
