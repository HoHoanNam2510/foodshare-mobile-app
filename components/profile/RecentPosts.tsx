import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

type PostStatus =
  | 'PENDING_REVIEW'
  | 'AVAILABLE'
  | 'BOOKED'
  | 'OUT_OF_STOCK'
  | 'HIDDEN'
  | 'REJECTED';

interface Post {
  id: string;
  title: string;
  status: string;
  image: string;
  price?: string;
}

interface RecentPostsProps {
  posts: Post[];
  onSeeAll?: () => void;
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

const formatStatusLabel = (status: string): string => {
  switch (status as PostStatus) {
    case 'PENDING_REVIEW':
      return 'PENDING';
    case 'OUT_OF_STOCK':
      return 'OUT OF STOCK';
    default:
      return status.toUpperCase();
  }
};

export default function RecentPosts({ posts, onSeeAll }: RecentPostsProps) {
  return (
    <View className="gap-4">
      {/* Header */}
      <View className="flex-row items-center justify-between px-1">
        <Text className="font-sans font-bold text-xl text-neutral-T10">
          Recent posts
        </Text>
        <TouchableOpacity onPress={onSeeAll} className="active:opacity-70">
          <Text className="text-primary-T40 font-label text-sm font-semibold">
            See all
          </Text>
        </TouchableOpacity>
      </View>

      {/* 2-column grid */}
      <View className="flex-row flex-wrap justify-between gap-y-4">
        {posts.map((post) => (
          <TouchableOpacity
            key={post.id}
            activeOpacity={0.9}
            className="w-[48%] bg-neutral-T100 rounded-2xl shadow-sm overflow-hidden active:scale-[0.98]"
          >
            <View className="relative h-32">
              <Image
                source={{ uri: post.image }}
                className="w-full h-full"
                resizeMode="cover"
              />
              <View className="absolute top-2 left-2">
                <View
                  className={`${getStatusBadgeColor(post.status)} rounded-full px-2 py-0.5`}
                  style={{ opacity: 0.9 }}
                >
                  <Text className="text-neutral-T100 text-[9px] font-label font-bold">
                    {formatStatusLabel(post.status)}
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
              {post.price && (
                <Text className="text-primary-T40 font-sans font-bold text-xs mt-1">
                  {post.price}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
