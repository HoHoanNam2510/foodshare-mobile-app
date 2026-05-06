import React, { useState } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';

type PostStatus =
  | 'PENDING_REVIEW'
  | 'AVAILABLE'
  | 'BOOKED'
  | 'OUT_OF_STOCK'
  | 'HIDDEN'
  | 'REJECTED';

export interface Post {
  id: string;
  title: string;
  status: string;
  image: string;
  price?: string;
}

interface RecentPostsProps {
  posts: Post[];
}

const getStatusBadgeColor = (status: string): string => {
  switch (status as PostStatus) {
    case 'AVAILABLE':
      return 'bg-primary-T40';
    case 'BOOKED':
      return 'bg-secondary-T40';
    case 'PENDING_REVIEW':
    case 'HIDDEN':
      return 'bg-neutral-T50';
    case 'OUT_OF_STOCK':
    case 'REJECTED':
      return 'bg-error';
    default:
      return 'bg-neutral-T50';
  }
};

const STATUS_LABEL_KEYS: Record<PostStatus | string, string> = {
  PENDING_REVIEW: 'post.statusPending',
  AVAILABLE: 'post.statusOpen',
  BOOKED: 'post.statusBooked',
  OUT_OF_STOCK: 'post.statusOutOfStock',
  HIDDEN: 'post.statusHidden',
  REJECTED: 'post.statusRejected',
};

export default function RecentPosts({ posts }: RecentPostsProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [displayCount, setDisplayCount] = useState(4);

  const displayedPosts = posts.slice(0, displayCount);
  const hasMore = displayCount < posts.length;

  const handleLoadMore = () => {
    setDisplayCount((prev) => prev + 4);
  };

  if (!posts || posts.length === 0) return null;

  return (
    <View className="mt-2 gap-4">
      {/* Header */}
      <View className="flex-row items-center justify-between px-1">
        <Text className="text-neutral-T10 font-sans text-xl font-bold">
          {t('profile.recentPosts')}
        </Text>
      </View>

      {/* 2-column grid */}
      <View className="flex-row flex-wrap justify-between gap-y-4">
        {displayedPosts.map((post) => {
          const isBooked = post.status === 'BOOKED';
          const isOutOfStock = post.status === 'OUT_OF_STOCK';

          return (
            <TouchableOpacity
              key={post.id}
              activeOpacity={0.9}
              onPress={() =>
                router.push(`/(post)/post-detail?id=${post.id}` as any)
              }
              className="bg-neutral-T100 w-[48%] overflow-hidden rounded-2xl shadow-sm active:scale-[0.98]"
            >
              <View className="relative h-32">
                <Image
                  source={{
                    uri: post.image || 'https://via.placeholder.com/150',
                  }}
                  className="h-full w-full"
                  resizeMode="cover"
                />

                {/* Overlays for BOOKED and OUT_OF_STOCK */}
                {(isBooked || isOutOfStock) && (
                  <View
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: isOutOfStock
                        ? 'rgba(0,0,0,0.5)'
                        : 'rgba(0,0,0,0.25)',
                    }}
                  />
                )}

                <View className="absolute left-2 top-2">
                  <View
                    className={`${getStatusBadgeColor(post.status)} rounded-full px-2 py-0.5`}
                    style={{ opacity: 0.9 }}
                  >
                    <Text className="text-neutral-T100 font-label text-[9px] font-bold">
                      {t(
                        STATUS_LABEL_KEYS[post.status as PostStatus] ??
                          'common.empty'
                      ).toUpperCase()}
                    </Text>
                  </View>
                </View>
              </View>
              <View className="p-3">
                <Text
                  className="font-body text-neutral-T10 text-sm font-semibold"
                  numberOfLines={1}
                >
                  {post.title}
                </Text>
                {post.price ? (
                  <Text className="text-primary-T40 mt-1 font-sans text-xs font-bold">
                    {post.price}
                  </Text>
                ) : null}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Load More Button */}
      {hasMore && (
        <TouchableOpacity
          onPress={handleLoadMore}
          className="bg-neutral-T95 mt-2 items-center justify-center rounded-xl py-3 active:opacity-80"
        >
          <Text className="text-primary-T30 font-label text-sm font-bold">
            {t('common.seeMore', 'Xem thêm')}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
