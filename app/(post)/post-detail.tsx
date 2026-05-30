// app/(post)/post-detail.tsx
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Linking,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import { useTranslation } from 'react-i18next';

import { getPostByIdApi, deletePostApi, type IPostDetail } from '@/lib/postApi';
import {
  addBookmarkApi,
  removeBookmarkApi,
  checkBookmarkApi,
} from '@/lib/bookmarkApi';
import { createRequestApi, createOrderApi } from '@/lib/transactionApi';
import {
  getApplicableVouchersForPostApi,
  type IUserVoucher,
  type IVoucher,
} from '@/lib/voucherApi';
import { getOrCreateConversationApi } from '@/lib/chatApi';
import { useColorScheme } from 'nativewind';

import { useAuthStore } from '@/stores/authStore';
import { useThemeColors } from '@/lib/hooks/useThemeColors';
import StackHeader from '@/components/shared/headers/StackHeader';
import PostDetailMap from '@/components/map/PostDetailMap';
import SaveTemplateModal from '@/components/post/SaveTemplateModal';
import VoucherBannerAlert from '@/components/voucher/VoucherBannerAlert';
import OrderConfirmModal from '@/components/order/OrderConfirmModal';
import { createTemplateApi } from '@/lib/postTemplateApi';

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatPickupTime(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(s.getHours())}:${pad(s.getMinutes())} – ${pad(e.getHours())}:${pad(e.getMinutes())}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function PostDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t, i18n } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = useThemeColors();
  const currentUser = useAuthStore((s) => s.user);

  const [post, setPost] = useState<IPostDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChatting, setIsChatting] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const { width: screenWidth } = useWindowDimensions();

  const [applicableVouchers, setApplicableVouchers] = useState<IUserVoucher[]>(
    []
  );
  const [selectedUserVoucherId, setSelectedUserVoucherId] = useState<
    string | null
  >(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await getPostByIdApi(id);
      setPost(res.data);
      setSelectedQuantity(1);
      setActiveImageIndex(0);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('post.errorLoad'));
    } finally {
      setIsLoading(false);
    }
  }, [id, t]);

  useEffect(() => {
    load();
  }, [load]);

  // Check initial bookmark state when post is loaded and user is authenticated
  useEffect(() => {
    if (!id || !currentUser) return;
    checkBookmarkApi(id)
      .then(setIsBookmarked)
      .catch(() => {});
  }, [id, currentUser]);

  const handleBookmarkToggle = async () => {
    const next = !isBookmarked;
    setIsBookmarked(next);
    try {
      if (next) {
        await addBookmarkApi(id as string);
      } else {
        await removeBookmarkApi(id as string);
      }
    } catch {
      setIsBookmarked(!next);
    }
  };

  // Fetch vouchers applicable for this B2C post (non-owner view only)
  useEffect(() => {
    if (
      !post ||
      post.type !== 'B2C_MYSTERY_BAG' ||
      !currentUser ||
      post.ownerId._id === currentUser._id ||
      post.status !== 'AVAILABLE'
    )
      return;
    getApplicableVouchersForPostApi(post._id)
      .then(({ data }) => setApplicableVouchers(data))
      .catch(() => {});
  }, [post, currentUser]);

  const isP2P = post?.type === 'P2P_FREE';
  const isOwnPost = post && currentUser && post.ownerId._id === currentUser._id;
  const isAvailable = post?.status === 'AVAILABLE';

  const handleRequestItem = async () => {
    if (!post) return;
    setIsSubmitting(true);
    try {
      await createRequestApi(post._id, selectedQuantity);
      Alert.alert(t('post.requestSent'), t('post.requestSentMsg'), [
        {
          text: t('post.viewTransaction'),
          onPress: () => router.push('/(transaction)/transaction-list' as any),
        },
        { text: 'OK', style: 'cancel' },
      ]);
    } catch (e) {
      Alert.alert(
        t('common.error'),
        e instanceof Error ? e.message : t('post.errorRequest')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditPost = () => {
    if (!post) return;
    router.push({
      pathname: '/(post)/edit-post',
      params: { id: post._id },
    } as any);
  };

  const handleDeletePost = () => {
    if (!post) return;
    Alert.alert(t('post.confirmDeleteTitle'), t('post.confirmDeleteMsg'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          try {
            await deletePostApi(post._id);
            Alert.alert(t('common.success'), t('post.deleteSuccess'), [
              { text: 'OK', onPress: () => router.back() },
            ]);
          } catch (e) {
            Alert.alert(
              t('common.error'),
              e instanceof Error ? e.message : t('post.errorLoad')
            );
          }
        },
      },
    ]);
  };

  const handleChat = async () => {
    if (!post || !currentUser) return;
    setIsChatting(true);
    try {
      const res = await getOrCreateConversationApi(owner._id);
      const conv = res.data.data;
      const other = conv.participants.find((p) => p._id !== currentUser._id);
      router.push({
        pathname: '/(chat)/chat-detail',
        params: {
          conversationId: conv._id,
          name: other?.fullName ?? owner.fullName,
          avatarUri: other?.avatar ?? owner.avatar ?? '',
        },
      } as any);
    } catch {
      Alert.alert(t('common.error'), t('post.errorChat'));
    } finally {
      setIsChatting(false);
    }
  };

  const handleBuyNow = () => {
    if (!post) return;
    setShowOrderModal(true);
  };

  const handleConfirmOrder = async () => {
    if (!post) return;
    setIsSubmitting(true);
    try {
      const res = await createOrderApi(
        post._id,
        selectedQuantity,
        selectedUserVoucherId ?? undefined
      );
      setShowOrderModal(false);
      router.push({
        pathname: '/(transaction)/transaction-detail',
        params: { id: res.data._id },
      } as any);
    } catch (e) {
      Alert.alert(
        t('common.error'),
        e instanceof Error ? e.message : t('post.errorRequest')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveAsTemplate = async (templateName: string) => {
    if (!post) return;
    setIsSavingTemplate(true);
    try {
      await createTemplateApi({
        templateName,
        type: post.type,
        category: post.category,
        title: post.title,
        description: post.description,
        images: post.images,
        totalQuantity: post.totalQuantity,
        price: post.price,
      });
      setShowSaveModal(false);
      Alert.alert(t('common.success'), t('template.saveSuccess'));
    } catch (e) {
      Alert.alert(
        t('common.error'),
        e instanceof Error ? e.message : t('template.saveFailed')
      );
    } finally {
      setIsSavingTemplate(false);
    }
  };

  const handleDirections = () => {
    if (!post?.location) return;
    const [lng, lat] = post.location.coordinates;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    Linking.openURL(url);
  };

  const handleShare = async () => {
    if (!post) return;

    const priceLabel =
      post.type === 'P2P_FREE' || post.price === 0
        ? t('common.free')
        : `${post.price.toLocaleString()}đ`;

    const fmt = (s: string) =>
      new Date(s).toLocaleTimeString(
        i18n.language === 'vi' ? 'vi-VN' : 'en-US',
        {
          hour: '2-digit',
          minute: '2-digit',
        }
      );

    const lines: string[] = [`🍱 ${post.title}`, `💰 ${priceLabel}`];

    if (post.description) {
      const short = post.description.slice(0, 80);
      lines.push(short + (post.description.length > 80 ? '...' : ''));
    }

    if (post.pickupTime?.start && post.pickupTime?.end) {
      lines.push(
        `⏰ ${fmt(post.pickupTime.start)} – ${fmt(post.pickupTime.end)}`
      );
    }

    if (post.remainingQuantity > 0) {
      lines.push(
        `📦 ${t('post.remainingQuantity')}: ${post.remainingQuantity}`
      );
    }

    lines.push(t('post.shareFooter'));

    await Share.share({ title: post.title, message: lines.join('\n') });
  };

  // ── Loading ──
  if (isLoading) {
    return (
      <SafeAreaView
        className="bg-neutral dark:bg-neutral-T10 flex-1 items-center justify-center"
        edges={['top']}
      >
        <ActivityIndicator size="large" color="#296C24" />
        <Text className="font-body text-neutral-T50 dark:text-neutral-T60 mt-3 text-sm">
          {t('common.loading')}
        </Text>
      </SafeAreaView>
    );
  }

  // ── Error ──
  if (error || !post) {
    return (
      <SafeAreaView
        className="bg-neutral dark:bg-neutral-T10 flex-1 items-center justify-center gap-4 px-8"
        edges={['top']}
      >
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

  const images = post.images ?? [];
  const owner = post.ownerId;

  // Real-time price after voucher discount (used in bottom bar)
  const baseTotal = post.price * selectedQuantity;
  const selectedVoucherData = (applicableVouchers.find(
    (v) => v._id === selectedUserVoucherId
  )?.voucherId ?? null) as IVoucher | null;
  const discountAmount = selectedVoucherData
    ? selectedVoucherData.discountType === 'PERCENTAGE'
      ? (baseTotal * selectedVoucherData.discountValue) / 100
      : selectedVoucherData.discountValue
    : 0;
  const displayTotal = Math.max(0, baseTotal - discountAmount);
  const hasDiscount = discountAmount > 0;

  const handleReport = () => {
    router.push({
      pathname: '/(report)/create-report',
      params: {
        targetType: 'POST',
        targetId: post._id,
        targetTitle: post.title,
      },
    } as any);
  };

  return (
    <View className="bg-neutral dark:bg-neutral-T10 flex-1">
      <StackHeader
        title={t('post.postDetail')}
        rightElement={
          <View className="flex-row items-center gap-2">
            <TouchableOpacity
              onPress={handleShare}
              activeOpacity={0.7}
              className="bg-neutral-T95 dark:bg-neutral-T30 h-10 w-10 items-center justify-center rounded-full"
            >
              <MaterialIcons name="share" size={20} color="#757777" />
            </TouchableOpacity>
            {!isOwnPost && currentUser && (
              <>
                <TouchableOpacity
                  onPress={handleBookmarkToggle}
                  activeOpacity={0.7}
                  className="bg-neutral-T95 dark:bg-neutral-T30 h-10 w-10 items-center justify-center rounded-full"
                >
                  <MaterialIcons
                    name={isBookmarked ? 'bookmark' : 'bookmark-border'}
                    size={22}
                    color={isBookmarked ? '#296C24' : '#757777'}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleReport}
                  activeOpacity={0.7}
                  className="bg-neutral-T95 dark:bg-neutral-T30 h-10 w-10 items-center justify-center rounded-full"
                >
                  <MaterialIcons name="flag" size={20} color="#757777" />
                </TouchableOpacity>
              </>
            )}
          </View>
        }
      />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: isAvailable && !isOwnPost ? (!isP2P ? 200 : 160) : 110,
        }}
      >
        {/* ─── Hero Images ─── */}
        <View className="relative">
          {images.length > 0 ? (
            <FlatList
              data={images}
              keyExtractor={(_, i) => i.toString()}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              style={{ height: screenWidth * (3 / 4) }}
              onMomentumScrollEnd={(e) => {
                const idx = Math.round(
                  e.nativeEvent.contentOffset.x / screenWidth
                );
                setActiveImageIndex(idx);
              }}
              renderItem={({ item }) => (
                <Image
                  source={{ uri: item }}
                  style={{ width: screenWidth, height: screenWidth * (3 / 4) }}
                  resizeMode="cover"
                />
              )}
            />
          ) : (
            <View
              style={{ height: screenWidth * (3 / 4) }}
              className="bg-neutral-T90 dark:bg-neutral-T30 w-full items-center justify-center"
            >
              <MaterialIcons name="fastfood" size={48} color="#AAABAB" />
            </View>
          )}

          {/* Image counter badge */}
          {images.length > 1 && (
            <View className="absolute right-3 top-3 rounded-full bg-black/50 px-2.5 py-1">
              <Text className="text-neutral-T100 font-label text-xs font-semibold">
                {activeImageIndex + 1} / {images.length}
              </Text>
            </View>
          )}

          {/* Type + Status Badges */}
          <View className="absolute -bottom-4 left-5 z-10 flex-row items-center gap-2">
            <View
              className="rounded-lg px-3 py-1.5"
              style={[
                styles.badge,
                {
                  backgroundColor: isP2P
                    ? isDark
                      ? '#42863A'
                      : '#296C24'
                    : isDark
                      ? '#B95F03'
                      : '#944A00',
                },
              ]}
            >
              <Text className="text-neutral-T100 font-label text-xs font-bold uppercase tracking-wider">
                {isP2P
                  ? t('common.free')
                  : `${post.price.toLocaleString('vi-VN')}đ`}
              </Text>
            </View>
            <View
              className="bg-primary-T95 dark:bg-primary-T20 rounded-lg px-3 py-1.5"
              style={styles.badge}
            >
              <Text className="text-primary-T30 dark:text-primary-T60 font-label text-xs font-bold uppercase tracking-wider">
                {post.status === 'AVAILABLE'
                  ? t('post.available')
                  : post.status === 'BOOKED'
                    ? t('post.reserved')
                    : post.status}
              </Text>
            </View>
          </View>
        </View>

        {/* ─── Content Card ─── */}
        <View
          className="bg-neutral-T100 dark:bg-neutral-T20 mx-4 mt-8 overflow-hidden rounded-2xl"
          style={styles.card}
        >
          {/* Title + Meta */}
          <View className="px-5 pb-4 pt-6">
            <Text className="text-neutral-T10 dark:text-neutral-T90 font-sans text-3xl font-extrabold leading-[34px] tracking-tight">
              {post.title}
            </Text>
            <View className="mt-2 flex-row items-center gap-2">
              <Text className="font-label text-neutral-T50 dark:text-neutral-T60 text-xs font-semibold uppercase tracking-wider">
                {post.category}
              </Text>
              <View className="bg-neutral-T70 h-1 w-1 rounded-full" />
              <Text className="font-label text-neutral-T50 dark:text-neutral-T60 text-xs font-semibold uppercase tracking-wider">
                {t('post.remainingCount', {
                  remaining: post.remainingQuantity,
                  total: post.totalQuantity,
                })}
              </Text>
            </View>
          </View>

          {/* Divider */}
          <View className="bg-neutral-T90 dark:bg-neutral-T30 mx-5 h-px" />

          {/* Owner Row */}
          <View className="flex-row items-center justify-between px-5 py-4">
            <TouchableOpacity
              className="flex-1 flex-row items-center gap-3"
              activeOpacity={0.75}
              onPress={() =>
                router.push({
                  pathname: '/(profile)/public-profile',
                  params: { id: owner._id },
                } as any)
              }
            >
              {owner.avatar ? (
                <Image
                  source={{ uri: owner.avatar }}
                  className="h-11 w-11 rounded-full"
                  style={styles.avatar}
                />
              ) : (
                <View
                  className="bg-primary-T95 h-11 w-11 items-center justify-center rounded-full"
                  style={styles.avatar}
                >
                  <MaterialIcons name="person" size={22} color="#296C24" />
                </View>
              )}
              <View>
                <Text className="font-label text-neutral-T50 dark:text-neutral-T60 text-[10px] uppercase tracking-wider">
                  {owner.role === 'STORE' ? t('roles.STORE') : t('post.sharer')}
                </Text>
                <Text className="text-neutral-T10 dark:text-neutral-T90 font-sans text-base font-extrabold">
                  {owner.fullName}
                </Text>
              </View>
            </TouchableOpacity>
            {owner.averageRating != null && (
              <View className="flex-row items-center gap-1">
                <MaterialIcons name="star" size={14} color="#F59E0B" />
                <Text className="font-label text-neutral-T30 dark:text-neutral-T80 text-sm font-semibold">
                  {owner.averageRating.toFixed(1)}
                </Text>
              </View>
            )}
          </View>

          {/* Divider */}
          <View className="bg-neutral-T90 dark:bg-neutral-T30 mx-5 h-px" />

          {/* Description */}
          {post.description && (
            <View className="px-5 py-5">
              <Text className="font-body text-neutral-T30 dark:text-neutral-T80 text-[14px] leading-6">
                {post.description}
              </Text>
            </View>
          )}
        </View>

        {/* ─── Info Cards ─── */}
        <View className="mx-4 mt-3 gap-3">
          {/* Pickup Window */}
          <View
            className="bg-neutral-T100 dark:bg-neutral-T20 flex-row items-center gap-4 rounded-2xl px-5 py-4"
            style={styles.card}
          >
            <View className="bg-primary-T95 dark:bg-primary-T20 h-10 w-10 items-center justify-center rounded-xl">
              <MaterialIcons
                name="schedule"
                size={20}
                color={colors.primaryGreen}
              />
            </View>
            <View className="flex-1">
              <Text className="font-label text-neutral-T50 dark:text-neutral-T60 text-[10px] uppercase tracking-wider">
                {t('post.pickupTime')}
              </Text>
              <Text className="text-neutral-T10 dark:text-neutral-T90 mt-0.5 font-sans text-base font-extrabold">
                {formatPickupTime(post.pickupTime.start, post.pickupTime.end)}
              </Text>
            </View>
          </View>

          {/* Expiry */}
          <View
            className="bg-neutral-T100 dark:bg-neutral-T20 flex-row items-center gap-4 rounded-2xl px-5 py-4"
            style={styles.card}
          >
            <View className="bg-secondary-T95 dark:bg-secondary-T20 h-10 w-10 items-center justify-center rounded-xl">
              <MaterialIcons
                name="timer"
                size={20}
                color={colors.secondaryOrange}
              />
            </View>
            <View className="flex-1">
              <Text className="font-label text-neutral-T50 dark:text-neutral-T60 text-[10px] uppercase tracking-wider">
                {t('post.expires')}
              </Text>
              <Text className="text-neutral-T10 dark:text-neutral-T90 mt-0.5 font-sans text-base font-extrabold">
                {formatDate(post.expiryDate)}
              </Text>
            </View>
          </View>
        </View>

        {/* ─── Map Section ─── */}
        {post.location && (
          <View className="mx-4 mb-2 mt-3">
            <PostDetailMap
              coordinates={post.location.coordinates}
              onDirections={handleDirections}
            />
          </View>
        )}

        {/* ─── Voucher Banner (B2C, non-owner, available) ─── */}
        {!isP2P &&
          !isOwnPost &&
          isAvailable &&
          applicableVouchers.length > 0 && (
            <View className="mx-4 mt-3">
              <VoucherBannerAlert
                vouchers={applicableVouchers}
                selectedId={selectedUserVoucherId}
                onSelect={setSelectedUserVoucherId}
                baseAmount={baseTotal}
              />
            </View>
          )}
      </ScrollView>

      {/* ─── Fixed Bottom Action Bar ─── */}
      <View
        className="bg-neutral dark:bg-neutral-T20 absolute bottom-0 left-0 w-full"
        style={[
          styles.bottomBar,
          {
            paddingBottom: Math.max(insets.bottom, 16),
            paddingTop: 12,
            paddingHorizontal: 16,
          },
        ]}
      >
        {isOwnPost ? (
          // Own post — Edit, Save as Template & Delete actions
          <View className="w-full flex-row gap-3">
            <TouchableOpacity
              className="bg-primary-T40 flex-1 flex-row items-center justify-center gap-2 rounded-2xl py-4"
              activeOpacity={0.85}
              onPress={handleEditPost}
            >
              <MaterialIcons name="edit" size={18} color="#fff" />
              <Text className="text-neutral-T100 font-sans text-base font-black tracking-tight">
                {t('common.edit')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-primary-T95 dark:bg-primary-T20 items-center justify-center rounded-2xl px-5 py-4"
              activeOpacity={0.85}
              onPress={() => setShowSaveModal(true)}
            >
              <MaterialIcons
                name="bookmark-add"
                size={22}
                color={colors.primaryGreen}
              />
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-neutral-T95 dark:bg-neutral-T30 items-center justify-center rounded-2xl px-5 py-4"
              activeOpacity={0.85}
              onPress={handleDeletePost}
            >
              <MaterialIcons name="delete-outline" size={22} color="#DC2626" />
            </TouchableOpacity>
          </View>
        ) : !isAvailable ? (
          // Unavailable — still allow chatting with owner
          <View className="w-full flex-row gap-3">
            <View className="bg-neutral-T95 dark:bg-neutral-T30 flex-1 items-center justify-center rounded-2xl py-4">
              <Text className="font-label text-neutral-T50 dark:text-neutral-T60 font-semibold">
                {t('post.notAvailable')}
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleChat}
              disabled={isChatting}
              activeOpacity={0.85}
              className="bg-neutral-T95 dark:bg-neutral-T30 w-14 items-center justify-center rounded-2xl"
            >
              {isChatting ? (
                <ActivityIndicator color="#296C24" />
              ) : (
                <MaterialIcons
                  name="chat-bubble-outline"
                  size={22}
                  color="#296C24"
                />
              )}
            </TouchableOpacity>
          </View>
        ) : isP2P ? (
          // P2P — Quantity selector + Request Item + Chat
          <View className="w-full gap-3">
            {/* Quantity selector row */}
            <View className="flex-row items-center justify-between px-1">
              <View className="flex-row items-center gap-2">
                <Text className="font-label text-neutral-T30 text-sm font-semibold">
                  {t('post.selectQty')}
                </Text>
                <Text className="font-label text-neutral-T70 text-xs">
                  ({t('post.maxQty', { max: post.remainingQuantity })})
                </Text>
              </View>
              <View className="flex-row items-center gap-3">
                <TouchableOpacity
                  onPress={() => setSelectedQuantity((q) => Math.max(1, q - 1))}
                  activeOpacity={0.7}
                  className="bg-neutral-T90 dark:bg-neutral-T30 h-9 w-9 items-center justify-center rounded-xl"
                >
                  <MaterialIcons name="remove" size={18} color="#5C5F5E" />
                </TouchableOpacity>
                <Text className="text-neutral-T10 dark:text-neutral-T90 w-7 text-center font-sans text-lg font-bold">
                  {selectedQuantity}
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    setSelectedQuantity((q) =>
                      Math.min(post.remainingQuantity, q + 1)
                    )
                  }
                  activeOpacity={0.7}
                  className="bg-neutral-T90 dark:bg-neutral-T30 h-9 w-9 items-center justify-center rounded-xl"
                >
                  <MaterialIcons name="add" size={18} color="#5C5F5E" />
                </TouchableOpacity>
              </View>
            </View>
            {/* Action buttons */}
            <View className="flex-row gap-3">
              <TouchableOpacity
                className="bg-primary-T40 flex-1 items-center justify-center rounded-2xl py-4"
                activeOpacity={0.85}
                onPress={handleRequestItem}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-neutral-T100 font-sans text-lg font-black uppercase tracking-tight">
                    {t('post.requestItem')}
                  </Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleChat}
                disabled={isChatting}
                activeOpacity={0.85}
                className="bg-primary-T95 dark:bg-primary-T20 w-14 items-center justify-center rounded-2xl"
              >
                {isChatting ? (
                  <ActivityIndicator color="#296C24" />
                ) : (
                  <MaterialIcons
                    name="chat-bubble-outline"
                    size={22}
                    color="#296C24"
                  />
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          // B2C — Quantity selector + price breakdown + Buy Now + Chat
          <View className="w-full gap-3">
            {/* Quantity selector + price breakdown */}
            <View className="flex-row items-center justify-between px-1">
              <View className="flex-row items-center gap-2">
                <Text className="font-label text-neutral-T30 text-sm font-semibold">
                  {t('post.selectQty')}
                </Text>
                <Text className="font-label text-neutral-T70 text-xs">
                  ({t('post.maxQty', { max: post.remainingQuantity })})
                </Text>
              </View>
              <View className="flex-row items-center gap-3">
                <TouchableOpacity
                  onPress={() => setSelectedQuantity((q) => Math.max(1, q - 1))}
                  activeOpacity={0.7}
                  className="bg-neutral-T90 dark:bg-neutral-T30 h-9 w-9 items-center justify-center rounded-xl"
                >
                  <MaterialIcons name="remove" size={18} color="#5C5F5E" />
                </TouchableOpacity>
                <Text className="text-neutral-T10 dark:text-neutral-T90 w-7 text-center font-sans text-lg font-bold">
                  {selectedQuantity}
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    setSelectedQuantity((q) =>
                      Math.min(post.remainingQuantity, q + 1)
                    )
                  }
                  activeOpacity={0.7}
                  className="bg-neutral-T90 dark:bg-neutral-T30 h-9 w-9 items-center justify-center rounded-xl"
                >
                  <MaterialIcons name="add" size={18} color="#5C5F5E" />
                </TouchableOpacity>
              </View>
            </View>
            {/* Price summary row */}
            <View className="flex-row items-center justify-between px-1">
              <Text className="font-label text-neutral-T50 text-sm">
                {t('post.unitPrice')}:{' '}
                <Text className="text-neutral-T30 font-semibold">
                  {post.price.toLocaleString('vi-VN')}đ
                </Text>
                {'  ×  '}
                <Text className="text-neutral-T30 font-semibold">
                  {selectedQuantity}
                </Text>
              </Text>
              <View className="items-end">
                {hasDiscount && (
                  <Text
                    className="text-neutral-T70 text-xs"
                    style={{ textDecorationLine: 'line-through' }}
                  >
                    {baseTotal.toLocaleString('vi-VN')}đ
                  </Text>
                )}
                <Text
                  className="font-sans text-base font-extrabold"
                  style={{ color: hasDiscount ? '#296C24' : '#7A3900' }}
                >
                  {t('post.totalPrice')}: {displayTotal.toLocaleString('vi-VN')}
                  đ
                </Text>
              </View>
            </View>
            {/* Action buttons */}
            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 items-center justify-center rounded-2xl py-4"
                activeOpacity={0.85}
                onPress={handleBuyNow}
                disabled={isSubmitting}
                style={styles.buyBtn}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-neutral-T100 font-sans text-lg font-black uppercase tracking-tight">
                    {t('post.buyNow', {
                      price: displayTotal.toLocaleString('vi-VN'),
                    })}
                  </Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleChat}
                disabled={isChatting}
                activeOpacity={0.85}
                className="w-14 items-center justify-center rounded-2xl"
                style={{ backgroundColor: 'rgba(148,74,0,0.1)' }}
              >
                {isChatting ? (
                  <ActivityIndicator color="#944A00" />
                ) : (
                  <MaterialIcons
                    name="chat-bubble-outline"
                    size={22}
                    color="#944A00"
                  />
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      <SaveTemplateModal
        visible={showSaveModal}
        initialName={post?.title ?? ''}
        isSaving={isSavingTemplate}
        onSave={handleSaveAsTemplate}
        onCancel={() => setShowSaveModal(false)}
      />

      <OrderConfirmModal
        visible={showOrderModal}
        post={post}
        quantity={selectedQuantity}
        selectedVoucher={
          applicableVouchers.find((v) => v._id === selectedUserVoucherId) ??
          null
        }
        isSubmitting={isSubmitting}
        onConfirm={handleConfirmOrder}
        onClose={() => setShowOrderModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 3,
  },
  avatar: {
    borderWidth: 2,
    borderColor: '#E1E3E2',
  },
  bottomBar: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
  },
  buyBtn: {
    backgroundColor: '#944A00',
    shadowColor: '#944A00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
});
