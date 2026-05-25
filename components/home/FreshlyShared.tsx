import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Image, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import {
  fetchFreshlyShared,
  type HomePost,
  type HomePostsParams,
} from '@/lib/homeApi';
import { useAuthStore } from '@/stores/authStore';

const INITIAL_LIMIT = 4;

function getPostBadgeType(post: HomePost): 'fresh' | 'expiring' | null {
  const now = Date.now();
  const expiry = new Date(post.expiryDate).getTime();
  const created = new Date(post.createdAt).getTime();

  if (expiry > now && expiry - now < 24 * 60 * 60 * 1000) return 'expiring';
  if (now - created < 2 * 60 * 60 * 1000) return 'fresh';
  return null;
}

function SkeletonCard({ anim }: { anim: Animated.Value }) {
  return (
    <Animated.View
      className="bg-neutral-T100 dark:bg-neutral-T20 dark:border-neutral-T30 flex-1 overflow-hidden rounded-2xl shadow-sm dark:border dark:shadow-none"
      style={{ opacity: anim }}
    >
      <View
        className="bg-neutral-T90 dark:bg-neutral-T30 w-full rounded-t-2xl"
        style={{ height: 140 }}
      />
      <View className="gap-2 px-3 pb-3.5 pt-3">
        <View className="bg-neutral-T90 dark:bg-neutral-T30 h-4 w-3/4 rounded-full" />
        <View className="bg-neutral-T90 dark:bg-neutral-T30 h-3 w-1/2 rounded-full" />
      </View>
    </Animated.View>
  );
}

function P2PCard({ post, onPress }: { post: HomePost; onPress: () => void }) {
  const { t } = useTranslation();
  const badgeType = getPostBadgeType(post);
  const owner = post.ownerId;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      className="bg-neutral-T100 dark:bg-neutral-T20 dark:border-neutral-T30 flex-1 overflow-hidden rounded-2xl shadow-sm active:opacity-90 dark:border dark:shadow-none"
    >
      <View className="relative">
        <Image
          source={{ uri: post.images[0] }}
          className="w-full rounded-t-2xl"
          style={{ height: 140 }}
          resizeMode="cover"
        />
        {badgeType && (
          <View
            className={`absolute left-2.5 top-2.5 rounded-full px-2.5 py-1 ${
              badgeType === 'expiring'
                ? 'bg-secondary-T40'
                : 'bg-neutral-T100/90'
            }`}
          >
            <Text
              className={`font-label text-[10px] ${
                badgeType === 'expiring'
                  ? 'text-neutral-T100'
                  : 'text-primary-T40'
              }`}
              style={{ fontWeight: '600' }}
            >
              {badgeType === 'expiring'
                ? t('home.badgeExpiring')
                : t('home.badgeFresh')}
            </Text>
          </View>
        )}
      </View>

      <View className="px-3 pb-3.5 pt-3">
        <Text
          className="font-body text-neutral-T10 dark:text-neutral-T90 text-[15px] leading-snug"
          style={{ fontWeight: '600' }}
          numberOfLines={1}
        >
          {post.title}
        </Text>
        <View className="mt-2 flex-row items-center gap-2">
          {owner.avatar ? (
            <Image
              source={{ uri: owner.avatar }}
              className="h-5 w-5 rounded-full"
            />
          ) : (
            <View className="bg-neutral-T90 dark:bg-neutral-T30 h-5 w-5 rounded-full" />
          )}
          <Text
            className="font-body text-neutral-T50 dark:text-neutral-T60 flex-1 text-xs"
            numberOfLines={1}
          >
            {owner.fullName}
            {post.distanceLabel ? ` · ${post.distanceLabel}` : ''}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function FreshlyShared({
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

    fetchFreshlyShared(params)
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

  const rows: HomePost[][] = [];
  for (let i = 0; i < visiblePosts.length; i += 2) {
    rows.push(visiblePosts.slice(i, i + 2));
  }

  return (
    <View className="mt-8 px-5">
      <View className="mb-4 flex-row items-center justify-between">
        <Text
          className="text-neutral-T10 dark:text-neutral-T90 font-sans text-xl"
          style={{ fontWeight: '700', letterSpacing: -0.3 }}
        >
          {t('home.freshlySharedTitle')}
        </Text>
        {!loading && hasMore && (
          <TouchableOpacity
            onPress={() => setExpanded((prev) => !prev)}
            className="flex-row items-center gap-1 active:opacity-70"
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

      {loading && (
        <View className="gap-3">
          <View className="flex-row gap-3">
            <SkeletonCard anim={pulseAnim} />
            <SkeletonCard anim={pulseAnim} />
          </View>
          <View className="flex-row gap-3">
            <SkeletonCard anim={pulseAnim} />
            <SkeletonCard anim={pulseAnim} />
          </View>
        </View>
      )}

      {!loading && posts.length === 0 && (
        <View className="items-center py-10">
          <Ionicons name="leaf-outline" size={40} color="#AAABAB" />
          <Text className="font-body text-neutral-T50 dark:text-neutral-T60 mt-3 text-center text-sm">
            {t('home.freshlySharedEmpty')}
          </Text>
        </View>
      )}

      {!loading && posts.length > 0 && (
        <View className="gap-3">
          {rows.map((row, idx) => (
            <View key={idx} className="flex-row gap-3">
              {row.map((post) => (
                <P2PCard
                  key={post._id}
                  post={post}
                  onPress={() =>
                    router.push({
                      pathname: '/(post)/post-detail' as any,
                      params: { id: post._id },
                    })
                  }
                />
              ))}
              {row.length === 1 && <View className="flex-1" />}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
