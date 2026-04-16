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
    <View className="gap-4 mt-2">
      {/* Header */}
      <View className="flex-row items-center justify-between px-1">
        <Text className="font-sans font-bold text-xl text-neutral-T10">
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
              onPress={() => router.push(`/(post)/post-detail?id=${post.id}` as any)}
              className="w-[48%] bg-neutral-T100 rounded-2xl shadow-sm overflow-hidden active:scale-[0.98]"
            >
              <View className="relative h-32">
                <Image
                  source={{ uri: post.image || 'https://via.placeholder.com/150' }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
                
                {/* Overlays for BOOKED and OUT_OF_STOCK */}
                {(isBooked || isOutOfStock) && (
                  <View 
                    style={{
                      position: 'absolute',
                      top: 0, left: 0, right: 0, bottom: 0,
                      backgroundColor: isOutOfStock ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.25)',
                    }}
                  />
                )}

                <View className="absolute top-2 left-2">
                  <View
                    className={`${getStatusBadgeColor(post.status)} rounded-full px-2 py-0.5`}
                    style={{ opacity: 0.9 }}
                  >
                    <Text className="text-neutral-T100 text-[9px] font-label font-bold">
                      {t(STATUS_LABEL_KEYS[post.status as PostStatus] ?? 'common.empty').toUpperCase()}
                    </Text>
                  </View>
                </View>
              </View>
              <View className="p-3">
                <Text
                  className="font-body font-semibold text-sm text-neutral-T10"
                  numberOfLines={1}
                >
                  {post.title}
                </Text>
                {post.price ? (
                  <Text className="text-primary-T40 font-sans font-bold text-xs mt-1">
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
          className="mt-2 py-3 bg-neutral-T95 rounded-xl items-center justify-center active:opacity-80"
        >
          <Text className="text-primary-T30 font-label font-bold text-sm">
            {t('common.seeMore', 'Xem thêm')}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
