import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as FileSystem from 'expo-file-system/legacy';
import { useRouter } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Image,
  Linking,
  Modal,
  Platform,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ImageViewerModal from '@/components/chat/ImageViewerModal';
import SharedEntityCard from '@/components/chat/SharedEntityCard';
import { RelatedPost, RelatedTransaction } from '@/lib/chatApi';
import { useThemeColors } from '@/lib/hooks/useThemeColors';
import { useColorScheme } from 'nativewind';

export interface Message {
  id: string;
  sender: 'me' | 'other';
  text: string;
  time: string;
  isRead?: boolean;
  /** ISO timestamp gốc — dùng để tính separator phiên hội thoại */
  createdAt: string;
  messageType?: 'TEXT' | 'IMAGE' | 'LOCATION' | 'POST' | 'TRANSACTION';
  imageUrl?: string;
  location?: { latitude: number; longitude: number };
  relatedPost?: RelatedPost;
  relatedTransaction?: RelatedTransaction;
  isEdited?: boolean;
  isRecalled?: boolean;
  isDeleted?: boolean;
}

interface MessageBubbleProps {
  message: Message;
  avatarUri?: string;
  onEdit?: (message: Message) => void;
  onRecall?: (messageId: string) => void;
  onDelete?: (messageId: string) => void;
}

export default function MessageBubble({
  message,
  avatarUri,
  onEdit,
  onRecall,
  onDelete,
}: MessageBubbleProps) {
  const isMe = message.sender === 'me';
  const colors = useThemeColors();
  const { t } = useTranslation();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [menuVisible, setMenuVisible] = React.useState(false);
  const [viewerVisible, setViewerVisible] = React.useState(false);

  const handleOpenMap = () => {
    if (!message.location) return;
    const { latitude, longitude } = message.location;
    const url = Platform.select({
      ios: `maps://?q=${latitude},${longitude}`,
      android: `geo:${latitude},${longitude}?q=${latitude},${longitude}`,
      default: `https://www.google.com/maps?q=${latitude},${longitude}`,
    });
    Linking.openURL(url).catch(() =>
      Linking.openURL(`https://www.google.com/maps?q=${latitude},${longitude}`)
    );
  };

  const handleCopy = async () => {
    setMenuVisible(false);
    if (message.messageType === 'IMAGE' && message.imageUrl) {
      try {
        const target = `${FileSystem.cacheDirectory}chat-copy-${Date.now()}.jpg`;
        const { uri } = await FileSystem.downloadAsync(
          message.imageUrl,
          target
        );
        const base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        await Clipboard.setImageAsync(base64);
        FileSystem.deleteAsync(uri, { idempotent: true }).catch(() => {});
      } catch {
        Alert.alert(t('common.error'), t('chat.copyImageFailed'));
      }
      return;
    }
    if (message.messageType === 'LOCATION' && message.location) {
      await Clipboard.setStringAsync(
        `${message.location.latitude.toFixed(5)}, ${message.location.longitude.toFixed(5)}`
      );
      return;
    }
    if (message.text) {
      await Clipboard.setStringAsync(message.text);
    }
  };

  const handleEdit = () => {
    setMenuVisible(false);
    onEdit?.(message);
  };

  const handleRecall = () => {
    setMenuVisible(false);
    Alert.alert(t('chat.recallMessage'), t('chat.recallMessage') + '?', [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('chat.recallMessage'),
        style: 'destructive',
        onPress: () => onRecall?.(message.id),
      },
    ]);
  };

  const handleDelete = () => {
    setMenuVisible(false);
    Alert.alert(t('chat.deleteForMe'), t('chat.deleteForMe') + '?', [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.confirm'),
        style: 'destructive',
        onPress: () => onDelete?.(message.id),
      },
    ]);
  };

  // ── Bubble content ─────────────────────────────────────────────────────────

  const renderBubbleContent = () => {
    if (message.isRecalled) {
      return (
        <View
          className={`px-5 py-3.5 ${
            isMe
              ? 'bg-primary-T40/40 dark:bg-primary-T50/30 rounded-3xl rounded-tr-sm'
              : 'bg-neutral-T90 dark:bg-neutral-T30 rounded-3xl rounded-tl-sm'
          }`}
          style={{ opacity: 0.7 }}
        >
          <Text
            className={`font-body text-base italic ${
              isMe ? 'text-white/70' : 'text-neutral-T50 dark:text-neutral-T60'
            }`}
          >
            {t('chat.messageRecalled')}
          </Text>
        </View>
      );
    }

    if (message.isDeleted) {
      return (
        <View
          className={`px-5 py-3.5 ${
            isMe
              ? 'bg-primary-T40/20 dark:bg-primary-T50/20 rounded-3xl rounded-tr-sm'
              : 'bg-neutral-T90 dark:bg-neutral-T30 rounded-3xl rounded-tl-sm'
          }`}
          style={{ opacity: 0.5 }}
        >
          <Text
            className={`font-body text-base italic ${
              isMe ? 'text-white/60' : 'text-neutral-T50 dark:text-neutral-T60'
            }`}
          >
            {t('chat.messageDeleted')}
          </Text>
        </View>
      );
    }

    if (message.messageType === 'IMAGE' && message.imageUrl) {
      return (
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => setViewerVisible(true)}
          onLongPress={() => setMenuVisible(true)}
          delayLongPress={500}
        >
          <Image
            source={{ uri: message.imageUrl }}
            className={`${isMe ? 'rounded-3xl rounded-tr-sm' : 'rounded-3xl rounded-tl-sm'}`}
            style={{ width: 220, height: 220, resizeMode: 'cover' }}
          />
        </TouchableOpacity>
      );
    }

    if (message.messageType === 'LOCATION' && message.location) {
      return (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleOpenMap}
          onLongPress={() => setMenuVisible(true)}
          delayLongPress={500}
          className={`px-4 py-3.5 ${
            isMe
              ? 'bg-primary-T40 dark:bg-primary-T50 rounded-3xl rounded-tr-sm'
              : 'bg-neutral-T90 dark:bg-neutral-T30 rounded-3xl rounded-tl-sm'
          }`}
          style={{ width: 220 }}
        >
          <View className="mb-2 flex-row items-center gap-2">
            <Feather
              name="map-pin"
              size={15}
              color={isMe ? '#FFFFFF' : colors.primaryGreen}
            />
            <Text
              className={`font-sans text-sm font-semibold ${isMe ? 'text-white' : 'text-neutral-T10 dark:text-neutral-T90'}`}
            >
              {t('chat.sharedLocation')}
            </Text>
          </View>
          <Text
            className={`font-label text-[11px] ${isMe ? 'text-white/70' : 'text-neutral-T50 dark:text-neutral-T60'}`}
          >
            {message.location.latitude.toFixed(5)},{' '}
            {message.location.longitude.toFixed(5)}
          </Text>
          <View className="mt-2 flex-row items-center gap-1">
            <Text
              className={`font-label text-xs font-semibold ${isMe ? 'text-white' : 'text-primary-T40'}`}
            >
              {t('chat.openMap')} →
            </Text>
          </View>
        </TouchableOpacity>
      );
    }

    if (
      message.messageType === 'POST' ||
      message.messageType === 'TRANSACTION'
    ) {
      const isPost = message.messageType === 'POST';
      const post = message.relatedPost;
      const txn = message.relatedTransaction;

      const cardTitle = isPost
        ? (post?.title ?? message.text)
        : (txn?.postId?.title ?? message.text);
      const cardImage = isPost ? post?.images?.[0] : txn?.postId?.images?.[0];
      const cardSubtitle = isPost
        ? post
          ? post.type === 'P2P_FREE'
            ? t('chat.postFree')
            : post.price
              ? `${post.price.toLocaleString('vi-VN')}đ`
              : undefined
          : undefined
        : txn?.status
          ? t(
              `transaction.status${txn.status.charAt(0).toUpperCase()}${txn.status.slice(1).toLowerCase()}` as Parameters<
                typeof t
              >[0]
            )
          : undefined;

      const handleCardPress = () => {
        if (isPost && post?._id) {
          router.push({
            pathname: '/(post)/post-detail',
            params: { id: post._id },
          } as any);
        } else if (!isPost && txn?._id) {
          router.push({
            pathname: '/(transaction)/transaction-detail',
            params: { id: txn._id },
          } as any);
        }
      };

      const hasNote =
        message.text &&
        message.text !== 'Bài đăng' &&
        message.text !== 'Giao dịch';

      return (
        <View className={`gap-1.5 ${isMe ? 'items-end' : 'items-start'}`}>
          <SharedEntityCard
            kind={message.messageType}
            title={cardTitle}
            imageUrl={cardImage}
            subtitle={cardSubtitle}
            onPress={handleCardPress}
          />
          {hasNote && (
            <Text className="font-body text-neutral-T10 dark:text-neutral-T90 px-1 text-sm">
              {message.text}
            </Text>
          )}
        </View>
      );
    }

    // Default: TEXT
    return (
      <View
        className={`px-5 py-3.5 ${
          isMe
            ? 'bg-primary-T40 dark:bg-primary-T50 rounded-3xl rounded-tr-sm'
            : 'bg-neutral-T90 dark:bg-neutral-T30 rounded-3xl rounded-tl-sm'
        }`}
        style={
          isMe
            ? {
                shadowColor: '#191c1c',
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 2,
              }
            : {
                shadowColor: '#191c1c',
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 1,
              }
        }
      >
        <Text
          className={`font-body text-base ${isMe ? 'text-white' : 'text-neutral-T10 dark:text-neutral-T90'}`}
        >
          {message.text}
        </Text>
      </View>
    );
  };

  // ── Context menu ────────────────────────────────────────────────────────────

  const menuItems: {
    label: string;
    icon: string;
    action: () => void;
    destructive?: boolean;
  }[] = [];

  if (!message.isRecalled && !message.isDeleted) {
    const isCardType =
      message.messageType === 'POST' || message.messageType === 'TRANSACTION';
    if (isMe && message.messageType === 'TEXT') {
      menuItems.push({
        label: t('chat.editMessage'),
        icon: 'edit-2',
        action: handleEdit,
      });
    }
    if (isMe) {
      menuItems.push({
        label: t('chat.recallMessage'),
        icon: 'rotate-ccw',
        action: handleRecall,
        destructive: true,
      });
    }
    if (!isCardType) {
      menuItems.push({
        label: t('chat.copy'),
        icon: 'copy',
        action: handleCopy,
      });
    }
  }
  menuItems.push({
    label: t('chat.deleteForMe'),
    icon: 'trash-2',
    action: handleDelete,
    destructive: true,
  });

  return (
    <>
      <View
        className={`mb-5 flex-row ${isMe ? 'justify-end' : 'justify-start'}`}
      >
        {!isMe && avatarUri && (
          <Image
            source={{ uri: avatarUri }}
            className="mr-2 h-8 w-8 self-end rounded-full"
          />
        )}

        <View
          className={`gap-1 ${isMe ? 'items-end' : 'items-start'}`}
          style={{ maxWidth: '80%' }}
        >
          <TouchableOpacity
            activeOpacity={0.85}
            onLongPress={() => !message.isDeleted && setMenuVisible(true)}
            delayLongPress={500}
          >
            {renderBubbleContent()}
          </TouchableOpacity>

          <View
            className={`flex-row items-center gap-1 px-1 ${isMe ? 'flex-row-reverse' : ''}`}
          >
            {!message.isDeleted && (
              <Text className="font-label text-neutral-T50 dark:text-neutral-T60 text-[10px]">
                {message.time}
              </Text>
            )}
            {message.isEdited && !message.isRecalled && !message.isDeleted && (
              <Text className="font-label text-neutral-T50 dark:text-neutral-T60 text-[10px] italic">
                · {t('chat.edited')}
              </Text>
            )}
            {isMe && message.isRead && !message.isDeleted && (
              <MaterialCommunityIcons
                name="check-all"
                size={13}
                color={colors.primaryGreen}
              />
            )}
          </View>
        </View>
      </View>

      {/* ── Long-press context menu ─────────────────────────────────────────── */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable
          className="flex-1 justify-end bg-black/40"
          onPress={() => setMenuVisible(false)}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View
              className="bg-neutral-T100 dark:bg-neutral-T20 border-neutral-T90 dark:border-neutral-T30 rounded-t-3xl border-t px-4 pt-4"
              style={{ paddingBottom: Math.max(insets.bottom, 24) + 8 }}
            >
              <View className="bg-neutral-T80 dark:bg-neutral-T30 mb-4 h-1.5 w-12 self-center rounded-full" />
              {menuItems.map((item) => (
                <TouchableOpacity
                  key={item.label}
                  activeOpacity={0.8}
                  onPress={item.action}
                  className="flex-row items-center gap-4 px-2 py-3.5"
                >
                  <Feather
                    name={item.icon as 'edit-2'}
                    size={18}
                    color={
                      item.destructive
                        ? '#EF4444'
                        : isDark
                          ? '#E1E3E2'
                          : '#191C1C'
                    }
                  />
                  <Text
                    className={`font-sans text-base ${
                      item.destructive
                        ? 'text-red-500'
                        : 'text-neutral-T10 dark:text-neutral-T90'
                    }`}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── Full-screen image viewer (pinch-zoom + pan) ─────────────────────── */}
      <ImageViewerModal
        visible={viewerVisible}
        imageUrl={message.imageUrl}
        onClose={() => setViewerVisible(false)}
      />
    </>
  );
}
