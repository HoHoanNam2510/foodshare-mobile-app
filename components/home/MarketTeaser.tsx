import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import {
  fetchMarketTeaser,
  type HomePost,
  type HomePostsParams,
} from '@/lib/homeApi';
import { useAuthStore } from '@/stores/authStore';
import { optimizeCloudinaryUrl } from '@/lib/cloudinary';

const INITIAL_LIMIT = 4;

function formatVND(price: number): string {
  if (price >= 1000) return `${Math.round(price / 1000)}k đ`;
  return `${price} đ`;
}

function MarketSkeletonCard({ anim }: { anim: Animated.Value }) {
  return (
    <Animated.View
      className="bg-neutral-T100 dark:bg-neutral-T20 dark:border-neutral-T30 mr-3 overflow-hidden rounded-2xl shadow-sm dark:border dark:shadow-none"
      style={{ width: 190, opacity: anim }}
    >
      <View
        className="bg-neutral-T90 dark:bg-neutral-T30 rounded-t-2xl"
        style={{ width: 190, height: 150 }}
      />
      <View className="gap-2 px-3.5 pb-3.5 pt-3">
        <View className="bg-neutral-T90 dark:bg-neutral-T30 h-4 w-3/4 rounded-full" />
        <View className="bg-neutral-T90 dark:bg-neutral-T30 h-3 w-1/2 rounded-full" />
      </View>
    </Animated.View>
  );
}

function MarketCard({
  post,
  isLast,
  onPress,
}: {
  post: HomePost;
  isLast: boolean;
  onPress: () => void;
}) {
  const owner = post.ownerId;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      className={`bg-neutral-T100 dark:bg-neutral-T20 dark:border-neutral-T30 overflow-hidden rounded-2xl shadow-sm active:opacity-90 dark:border dark:shadow-none ${isLast ? '' : 'mr-3'}`}
      style={{ width: 190 }}
    >
      <View className="relative">
        <Image
          source={{ uri: optimizeCloudinaryUrl(post.images[0], 400) }}
          style={{ width: 190, height: 150 }}
          className="rounded-t-2xl"
          resizeMode="cover"
        />
        <View className="bg-primary-T40 absolute bottom-3 left-3 rounded-full px-2.5 py-1">
          <Text
            className="font-body text-neutral-T100 text-xs"
            style={{ fontWeight: '600' }}
          >
            {formatVND(post.price)}
          </Text>
        </View>
        <TouchableOpacity
          onPress={onPress}
          className="bg-neutral-T100/90 absolute right-3 top-3 h-8 w-8 items-center justify-center rounded-full"
        >
          <Ionicons name="bag-outline" size={16} color="#191C1C" />
        </TouchableOpacity>
      </View>

      <View className="px-3.5 pb-3.5 pt-3">
        <Text
          className="font-body text-neutral-T10 dark:text-neutral-T90 text-[15px]"
          style={{ fontWeight: '600' }}
          numberOfLines={1}
        >
          {post.title}
        </Text>
        <View className="mt-1.5 flex-row items-center justify-between">
          <Text
            className="font-body text-neutral-T50 dark:text-neutral-T60 mr-2 flex-1 text-xs"
            numberOfLines={1}
          >
            {owner.fullName}
          </Text>
          {owner.averageRating > 0 && (
            <View className="flex-row items-center gap-0.5">
              <Ionicons name="star" size={12} color="#EC8632" />
              <Text
                className="font-body text-neutral-T10 dark:text-neutral-T90 text-xs"
                style={{ fontWeight: '600' }}
              >
                {owner.averageRating.toFixed(1)}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function MarketTeaser({
  activeCategory,
}: {
  activeCategory: string;
}) {
  const { t } = useTranslation();
  const router = useRouter();
  const userLng = useAuthStore((state) => state.user?.location?.coordinates[0]);
  const userLat = useAuthStore((state) => state.user?.location?.coordinates[1]);

  const [posts, setPosts] = useState<HomePost[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!loading) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.4,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [loading, pulseAnim]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setExpanded(false);

    const params: HomePostsParams = { limit: 6 };
    if (activeCategory !== 'all') params.categorySlug = activeCategory;
    if (userLng != null && userLat != null) {
      params.lng = userLng;
      params.lat = userLat;
    }

    fetchMarketTeaser(params)
      .then((data) => {
        if (!cancelled) setPosts(data);
      })
      .catch(() => {
        if (!cancelled) setPosts([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeCategory, userLng, userLat]);

  const visiblePosts = expanded ? posts : posts.slice(0, INITIAL_LIMIT);
  const hasMore = posts.length > INITIAL_LIMIT;

  return (
    <View className="mt-8">
      <View className="mb-1 px-5">
        <Text className="font-body text-neutral-T50 dark:text-neutral-T60 text-sm">
          {t('home.marketSubtitle')}
        </Text>
        <View className="mt-1 flex-row items-end justify-between">
          <Text
            className="text-neutral-T10 dark:text-neutral-T90 font-sans text-xl"
            style={{ fontWeight: '700', letterSpacing: -0.3 }}
          >
            {t('home.marketTitle')}
          </Text>
          {!loading && hasMore && (
            <TouchableOpacity
              onPress={() => setExpanded((prev) => !prev)}
              className="mb-1 flex-row items-center gap-1 active:opacity-70"
            >
              <Text
                className="font-body text-primary-T40 text-sm"
                style={{ fontWeight: '600' }}
              >
                {expanded ? t('common.collapse') : t('common.seeAll')}
              </Text>
              <Feather
                name={expanded ? 'chevron-up' : 'chevron-right'}
                size={16}
                color="#296C24"
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading && (
        <View className="mx-5 overflow-hidden">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingTop: 14, paddingBottom: 4 }}
          >
            <MarketSkeletonCard anim={pulseAnim} />
            <MarketSkeletonCard anim={pulseAnim} />
            <MarketSkeletonCard anim={pulseAnim} />
          </ScrollView>
        </View>
      )}

      {!loading && posts.length === 0 && (
        <View className="items-center px-5 py-10">
          <Ionicons name="bag-handle-outline" size={40} color="#AAABAB" />
          <Text className="font-body text-neutral-T50 dark:text-neutral-T60 mt-3 text-center text-sm">
            {t('home.marketTeaserEmpty')}
          </Text>
        </View>
      )}

      {!loading && posts.length > 0 && (
        <View className="mx-5 overflow-hidden">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingTop: 14, paddingBottom: 4 }}
          >
            {visiblePosts.map((post, index) => (
              <MarketCard
                key={post._id}
                post={post}
                isLast={index === visiblePosts.length - 1}
                onPress={() =>
                  router.push({
                    pathname: '/(post)/post-detail' as any,
                    params: { id: post._id },
                  })
                }
              />
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}
