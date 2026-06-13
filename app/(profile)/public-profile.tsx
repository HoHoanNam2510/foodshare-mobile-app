import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import StackHeader from '@/components/shared/headers/StackHeader';
import { getUserByIdApi, type IPublicUser } from '@/lib/profileApi';
import { getOrCreateConversationApi } from '@/lib/chatApi';
import { useAuthStore } from '@/stores/authStore';

export default function PublicProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const currentUser = useAuthStore((s) => s.user);
  const insets = useSafeAreaInsets();

  const [user, setUser] = useState<IPublicUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isChatting, setIsChatting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isOwnProfile = currentUser?._id === id;

  const load = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await getUserByIdApi(id);
      setUser(res.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('errors.notFound'));
    } finally {
      setIsLoading(false);
    }
  }, [id, t]);

  useEffect(() => {
    load();
  }, [load]);

  const handleChat = async () => {
    if (!user) return;
    setIsChatting(true);
    try {
      const res = await getOrCreateConversationApi(user._id);
      const conv = res.data.data;
      const other = conv.participants.find((p) => p._id !== currentUser?._id);
      router.push({
        pathname: '/(chat)/chat-detail',
        params: {
          conversationId: conv._id,
          otherUserId: other?._id ?? user._id,
          name: other?.fullName ?? user.fullName,
          avatarUri: other?.avatar ?? user.avatar ?? '',
        },
      } as never);
    } catch {
      Alert.alert(
        t('common.error'),
        t('chat.startChatError', {
          defaultValue: 'Không thể mở cuộc trò chuyện.',
        })
      );
    } finally {
      setIsChatting(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView
        className="bg-neutral dark:bg-neutral-T10 flex-1 items-center justify-center"
        edges={['top']}
      >
        <ActivityIndicator size="large" color="#296C24" />
      </SafeAreaView>
    );
  }

  if (error || !user) {
    return (
      <SafeAreaView
        className="bg-neutral dark:bg-neutral-T10 flex-1 items-center justify-center gap-4 px-8"
        edges={['top']}
      >
        <StackHeader
          title={t('profile.publicProfile', { defaultValue: 'Hồ sơ' })}
        />
        <Text className="font-body text-neutral-T50 text-center text-sm">
          {error ?? t('errors.notFound')}
        </Text>
        <TouchableOpacity
          onPress={load}
          className="bg-primary-T40 rounded-xl px-6 py-3"
          activeOpacity={0.85}
        >
          <Text className="font-label text-neutral-T100 font-semibold">
            {t('common.retry')}
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const isStore = user.role === 'STORE';
  const joinYear = new Date(user.createdAt).getFullYear();

  return (
    <View className="bg-neutral dark:bg-neutral-T10 flex-1">
      <StackHeader
        title={
          isStore
            ? t('roles.STORE')
            : t('profile.publicProfile', { defaultValue: 'Hồ sơ' })
        }
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Avatar + Name */}
        <View className="items-center px-6 py-8">
          {user.avatar ? (
            <Image
              source={{ uri: user.avatar }}
              className="h-24 w-24 rounded-full"
              style={{ borderWidth: 3, borderColor: '#E1E3E2' }}
            />
          ) : (
            <View
              className="bg-primary-T95 h-24 w-24 items-center justify-center rounded-full"
              style={{ borderWidth: 3, borderColor: '#E1E3E2' }}
            >
              <MaterialIcons name="person" size={44} color="#296C24" />
            </View>
          )}

          <Text
            className="text-neutral-T10 dark:text-neutral-T90 mt-4 font-sans text-2xl font-extrabold"
            numberOfLines={2}
            style={{ textAlign: 'center' }}
          >
            {user.fullName}
          </Text>

          <View className="mt-1 flex-row items-center gap-1.5">
            <Text className="font-label text-neutral-T50 dark:text-neutral-T60 text-xs uppercase tracking-wider">
              {isStore ? t('roles.STORE') : t('roles.USER')}
            </Text>
            <View className="bg-neutral-T70 h-1 w-1 rounded-full" />
            <Text className="font-label text-neutral-T50 dark:text-neutral-T60 text-xs">
              {t('profile.memberSince', {
                year: joinYear,
                defaultValue: `Thành viên từ ${joinYear}`,
              })}
            </Text>
          </View>
        </View>

        {/* Stats row */}
        <View
          className="bg-neutral-T100 dark:bg-neutral-T20 mx-4 flex-row rounded-2xl"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 8,
            elevation: 2,
          }}
        >
          {user.averageRating != null && (
            <View className="flex-1 items-center py-5">
              <View className="flex-row items-center gap-1">
                <MaterialIcons name="star" size={16} color="#F59E0B" />
                <Text className="text-neutral-T10 dark:text-neutral-T90 font-sans text-xl font-extrabold">
                  {user.averageRating.toFixed(1)}
                </Text>
              </View>
              <Text className="text-neutral-T50 dark:text-neutral-T60 font-label mt-1 text-xs">
                {t('profile.rating', { defaultValue: 'Đánh giá' })}
                {user.totalReviews != null && ` (${user.totalReviews})`}
              </Text>
            </View>
          )}
          {user.greenPoints != null && (
            <View className="border-neutral-T90 dark:border-neutral-T30 flex-1 items-center border-l py-5">
              <Text className="text-primary-T40 dark:text-primary-T60 font-sans text-xl font-extrabold">
                {user.greenPoints.toLocaleString('vi-VN')}
              </Text>
              <Text className="text-neutral-T50 dark:text-neutral-T60 font-label mt-1 text-xs">
                {t('profile.greenPoints', { defaultValue: 'Điểm xanh' })}
              </Text>
            </View>
          )}
        </View>

        {/* Store info */}
        {isStore && user.storeInfo && (
          <View
            className="bg-neutral-T100 dark:bg-neutral-T20 mx-4 mt-3 rounded-2xl px-5 py-5"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.06,
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            <Text className="font-label text-neutral-T50 dark:text-neutral-T60 text-[10px] uppercase tracking-wider">
              {t('profile.storeInfo', { defaultValue: 'Thông tin cửa hàng' })}
            </Text>
            {user.storeInfo.businessName && (
              <Text className="text-neutral-T10 dark:text-neutral-T90 mt-2 font-sans text-base font-extrabold">
                {user.storeInfo.businessName}
              </Text>
            )}
            {user.storeInfo.description && (
              <Text className="font-body text-neutral-T30 dark:text-neutral-T80 mt-2 text-sm leading-5">
                {user.storeInfo.description}
              </Text>
            )}
            {user.storeInfo.businessAddress && (
              <View className="mt-3 flex-row items-start gap-2">
                <MaterialIcons
                  name="place"
                  size={16}
                  color="#757777"
                  style={{ marginTop: 1 }}
                />
                <Text className="font-body text-neutral-T50 dark:text-neutral-T60 flex-1 text-sm">
                  {user.storeInfo.businessAddress}
                </Text>
              </View>
            )}
          </View>
        )}

        <View className="h-8" />
      </ScrollView>

      {/* Chat button — không hiển thị khi xem profile của chính mình */}
      {!isOwnProfile && currentUser && (
        <View
          className="bg-neutral dark:bg-neutral-T10 border-neutral-T90 dark:border-neutral-T30 border-t px-4 py-3"
          style={{ paddingBottom: insets.bottom + 12 }}
        >
          <TouchableOpacity
            onPress={handleChat}
            disabled={isChatting}
            activeOpacity={0.85}
            className="bg-primary-T40 flex-row items-center justify-center gap-2 rounded-2xl py-3.5"
          >
            {isChatting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <MaterialIcons
                name="chat-bubble-outline"
                size={20}
                color="#fff"
              />
            )}
            <Text className="font-label text-neutral-T100 text-base font-semibold">
              {t('chat.startChat', { defaultValue: 'Nhắn tin' })}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
