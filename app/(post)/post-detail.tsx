// app/(post)/post-detail.tsx
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import { getPostByIdApi, deletePostApi, type IPostDetail } from '@/lib/postApi';
import { createRequestApi } from '@/lib/transactionApi';
import { getOrCreateConversationApi } from '@/lib/chatApi';
import { useAuthStore } from '@/stores/authStore';

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
  const { id } = useLocalSearchParams<{ id: string }>();
  const currentUser = useAuthStore((s) => s.user);

  const [post, setPost] = useState<IPostDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChatting, setIsChatting] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await getPostByIdApi(id);
      setPost(res.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không thể tải bài đăng.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const isP2P = post?.type === 'P2P_FREE';
  const isOwnPost = post && currentUser && post.ownerId._id === currentUser._id;
  const isAvailable = post?.status === 'AVAILABLE';

  const handleRequestItem = async () => {
    if (!post) return;
    setIsSubmitting(true);
    try {
      await createRequestApi(post._id, 1);
      Alert.alert(
        'Đã gửi yêu cầu',
        'Yêu cầu xin đồ của bạn đã được gửi. Vui lòng chờ người đăng xác nhận.',
        [
          {
            text: 'Xem giao dịch',
            onPress: () => router.push('/(transaction)/transaction-list' as any),
          },
          { text: 'OK', style: 'cancel' },
        ]
      );
    } catch (e) {
      Alert.alert('Lỗi', e instanceof Error ? e.message : 'Không thể gửi yêu cầu.');
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
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc chắn muốn xóa bài đăng này? Hành động này không thể hoàn tác.',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePostApi(post._id);
              Alert.alert('Thành công', 'Đã xóa bài đăng.', [
                { text: 'OK', onPress: () => router.back() },
              ]);
            } catch (e) {
              Alert.alert('Lỗi', e instanceof Error ? e.message : 'Không thể xóa bài đăng.');
            }
          },
        },
      ]
    );
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
      Alert.alert('Lỗi', 'Không thể mở cuộc trò chuyện.');
    } finally {
      setIsChatting(false);
    }
  };

  const handleBuyNow = () => {
    if (!post) return;
    // Navigate to dedicated payment screen with method selection + payment flow
    router.push({
      pathname: '/(transaction)/payment',
      params: { postId: post._id, quantity: '1' },
    } as any);
  };

  // ── Loading ──
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-neutral items-center justify-center" edges={['top']}>
        <ActivityIndicator size="large" color="#296C24" />
        <Text className="font-body text-sm text-neutral-T50 mt-3">Đang tải...</Text>
      </SafeAreaView>
    );
  }

  // ── Error ──
  if (error || !post) {
    return (
      <SafeAreaView className="flex-1 bg-neutral items-center justify-center px-8 gap-4" edges={['top']}>
        <Text className="font-body text-sm text-neutral-T50 text-center">
          {error ?? 'Không tìm thấy bài đăng.'}
        </Text>
        <TouchableOpacity
          onPress={load}
          className="px-6 py-3 bg-primary-T40 rounded-xl"
          activeOpacity={0.85}
        >
          <Text className="font-label font-semibold text-neutral-T100">Thử lại</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const thumb = post.images?.[0];
  const owner = post.ownerId;

  return (
    <SafeAreaView className="flex-1 bg-neutral" edges={['top']}>
      {/* ─── Top Navigation Bar ─── */}
      <View className="flex-row items-center justify-between w-full h-14 px-4 bg-neutral">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center rounded-xl"
          style={styles.navBtn}
        >
          <MaterialIcons name="arrow-back" size={22} color="#191C1C" />
        </TouchableOpacity>

        <Text className="font-sans font-extrabold text-base tracking-tight text-neutral-T10 uppercase">
          FoodShare
        </Text>

        <View className="w-10 h-10" />
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* ─── Hero Image ─── */}
        <View className="relative">
          <View className="w-full aspect-[4/3] bg-neutral-T90 overflow-hidden">
            {thumb ? (
              <Image source={{ uri: thumb }} className="w-full h-full" resizeMode="cover" />
            ) : (
              <View className="w-full h-full items-center justify-center">
                <MaterialIcons name="fastfood" size={48} color="#AAABAB" />
              </View>
            )}
          </View>

          {/* Type + Status Badges */}
          <View className="absolute -bottom-4 left-5 flex-row items-center gap-2 z-10">
            <View
              className="px-3 py-1.5 rounded-lg"
              style={[styles.badge, { backgroundColor: isP2P ? '#296C24' : '#944A00' }]}
            >
              <Text className="text-neutral-T100 font-label font-bold text-xs tracking-wider uppercase">
                {isP2P ? 'Miễn phí' : `${post.price.toLocaleString('vi-VN')}đ`}
              </Text>
            </View>
            <View
              className="bg-primary-T95 px-3 py-1.5 rounded-lg"
              style={styles.badge}
            >
              <Text className="text-primary-T30 font-label font-bold text-xs tracking-wider uppercase">
                {post.status === 'AVAILABLE' ? 'Còn hàng' : post.status === 'BOOKED' ? 'Đã đặt' : post.status}
              </Text>
            </View>
          </View>
        </View>

        {/* ─── Content Card ─── */}
        <View className="mx-4 mt-8 bg-neutral-T100 rounded-2xl overflow-hidden" style={styles.card}>
          {/* Title + Meta */}
          <View className="px-5 pt-6 pb-4">
            <Text className="font-sans font-extrabold text-3xl leading-[34px] tracking-tight text-neutral-T10">
              {post.title}
            </Text>
            <View className="flex-row items-center gap-2 mt-2">
              <Text className="font-label text-xs text-neutral-T50 font-semibold uppercase tracking-wider">
                {post.category}
              </Text>
              <View className="w-1 h-1 rounded-full bg-neutral-T70" />
              <Text className="font-label text-xs text-neutral-T50 font-semibold uppercase tracking-wider">
                Còn {post.remainingQuantity}/{post.totalQuantity}
              </Text>
            </View>
          </View>

          {/* Divider */}
          <View className="mx-5 h-px bg-neutral-T90" />

          {/* Owner Row */}
          <View className="px-5 py-4 flex-row items-center justify-between">
            <View className="flex-row items-center gap-3 flex-1">
              {owner.avatar ? (
                <Image
                  source={{ uri: owner.avatar }}
                  className="w-11 h-11 rounded-full"
                  style={styles.avatar}
                />
              ) : (
                <View className="w-11 h-11 rounded-full bg-primary-T95 items-center justify-center" style={styles.avatar}>
                  <MaterialIcons name="person" size={22} color="#296C24" />
                </View>
              )}
              <View>
                <Text className="font-label text-[10px] text-neutral-T50 uppercase tracking-wider">
                  {owner.role === 'STORE' ? 'Cửa hàng' : 'Người chia sẻ'}
                </Text>
                <Text className="font-sans font-extrabold text-base text-neutral-T10">
                  {owner.fullName}
                </Text>
              </View>
            </View>
            {owner.averageRating != null && (
              <View className="flex-row items-center gap-1">
                <MaterialIcons name="star" size={14} color="#F59E0B" />
                <Text className="font-label text-sm font-semibold text-neutral-T30">
                  {owner.averageRating.toFixed(1)}
                </Text>
              </View>
            )}
          </View>

          {/* Divider */}
          <View className="mx-5 h-px bg-neutral-T90" />

          {/* Description */}
          {post.description && (
            <View className="px-5 py-5">
              <Text className="font-body text-neutral-T30 leading-6 text-[14px]">
                {post.description}
              </Text>
            </View>
          )}
        </View>

        {/* ─── Info Cards ─── */}
        <View className="mx-4 mt-3 gap-3">
          {/* Pickup Window */}
          <View className="bg-neutral-T100 rounded-2xl px-5 py-4 flex-row items-center gap-4" style={styles.card}>
            <View className="w-10 h-10 rounded-xl bg-primary-T95 items-center justify-center">
              <MaterialIcons name="schedule" size={20} color="#296C24" />
            </View>
            <View className="flex-1">
              <Text className="font-label text-[10px] text-neutral-T50 uppercase tracking-wider">
                Khung giờ nhận
              </Text>
              <Text className="font-sans font-extrabold text-base text-neutral-T10 mt-0.5">
                {formatPickupTime(post.pickupTime.start, post.pickupTime.end)}
              </Text>
            </View>
          </View>

          {/* Expiry */}
          <View className="bg-neutral-T100 rounded-2xl px-5 py-4 flex-row items-center gap-4" style={styles.card}>
            <View className="w-10 h-10 rounded-xl bg-secondary-T95 items-center justify-center">
              <MaterialIcons name="timer" size={20} color="#944A00" />
            </View>
            <View className="flex-1">
              <Text className="font-label text-[10px] text-neutral-T50 uppercase tracking-wider">
                Hết hạn
              </Text>
              <Text className="font-sans font-extrabold text-base text-neutral-T10 mt-0.5">
                {formatDate(post.expiryDate)}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* ─── Fixed Bottom Action Bar ─── */}
      <View
        className="absolute bottom-0 left-0 w-full bg-neutral"
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
          // Own post — Edit & Delete actions
          <View className="flex-row gap-3 w-full">
            <TouchableOpacity
              className="flex-1 bg-primary-T40 rounded-2xl items-center justify-center py-4 flex-row gap-2"
              activeOpacity={0.85}
              onPress={handleEditPost}
            >
              <MaterialIcons name="edit" size={18} color="#fff" />
              <Text className="text-neutral-T100 font-sans font-black text-base tracking-tight">
                Chỉnh sửa
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-neutral-T95 rounded-2xl items-center justify-center py-4 px-5"
              activeOpacity={0.85}
              onPress={handleDeletePost}
            >
              <MaterialIcons name="delete-outline" size={22} color="#DC2626" />
            </TouchableOpacity>
          </View>
        ) : !isAvailable ? (
          // Unavailable — still allow chatting with owner
          <View className="flex-row gap-3 w-full">
            <View className="flex-1 bg-neutral-T95 rounded-2xl items-center justify-center py-4">
              <Text className="font-label font-semibold text-neutral-T50">
                Không còn hàng
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleChat}
              disabled={isChatting}
              activeOpacity={0.85}
              className="w-14 bg-neutral-T95 rounded-2xl items-center justify-center"
            >
              {isChatting ? (
                <ActivityIndicator color="#296C24" />
              ) : (
                <MaterialIcons name="chat-bubble-outline" size={22} color="#296C24" />
              )}
            </TouchableOpacity>
          </View>
        ) : isP2P ? (
          // P2P — Request Item + Chat
          <View className="flex-row gap-3 w-full">
            <TouchableOpacity
              className="flex-1 bg-primary-T40 rounded-2xl items-center justify-center py-4"
              activeOpacity={0.85}
              onPress={handleRequestItem}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-neutral-T100 font-sans font-black text-lg tracking-tight uppercase">
                  Yêu cầu nhận đồ
                </Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleChat}
              disabled={isChatting}
              activeOpacity={0.85}
              className="w-14 bg-primary-T95 rounded-2xl items-center justify-center"
            >
              {isChatting ? (
                <ActivityIndicator color="#296C24" />
              ) : (
                <MaterialIcons name="chat-bubble-outline" size={22} color="#296C24" />
              )}
            </TouchableOpacity>
          </View>
        ) : (
          // B2C — Buy Now + Chat
          <View className="flex-row gap-3 w-full">
            <TouchableOpacity
              className="flex-1 rounded-2xl items-center justify-center py-4"
              activeOpacity={0.85}
              onPress={handleBuyNow}
              disabled={isSubmitting}
              style={styles.buyBtn}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-neutral-T100 font-sans font-black text-lg tracking-tight uppercase">
                  Mua ngay · {post.price.toLocaleString('vi-VN')}đ
                </Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleChat}
              disabled={isChatting}
              activeOpacity={0.85}
              className="w-14 rounded-2xl items-center justify-center"
              style={{ backgroundColor: 'rgba(148,74,0,0.1)' }}
            >
              {isChatting ? (
                <ActivityIndicator color="#944A00" />
              ) : (
                <MaterialIcons name="chat-bubble-outline" size={22} color="#944A00" />
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  navBtn: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
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
