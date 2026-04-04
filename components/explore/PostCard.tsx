import { Feather, Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

import { ExplorePost } from './types';

interface PostCardProps {
  post: ExplorePost;
  onPress?: () => void;
}

export default function PostCard({ post, onPress }: PostCardProps) {
  const isFree = post.type === 'FREE';
  const isUrgent =
    !!post.urgencyLabel && post.urgencyLabel.includes('Expiring');

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      className="bg-neutral-T100 rounded-2xl overflow-hidden"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
      }}
    >
      {/* Image */}
      <View className="w-full aspect-video overflow-hidden">
        <Image
          source={{ uri: post.imageUrl }}
          className="w-full h-full"
          resizeMode="cover"
        />

        {/* Price / FREE badge – top left */}
        {isFree ? (
          <View className="absolute top-3 left-3 bg-primary-T40 px-3 py-1 rounded-full">
            <Text
              className="text-neutral-T100 text-xs font-label"
              style={{ fontWeight: '700' }}
            >
              FREE
            </Text>
          </View>
        ) : (
          <View className="absolute top-3 left-3 bg-secondary px-3 py-1 rounded-full">
            <Text
              className="text-neutral-T100 text-xs font-label"
              style={{ fontWeight: '700' }}
            >
              {post.price}
            </Text>
          </View>
        )}

        {/* "Surprise Bag" label – bottom right */}
        {post.tag && (
          <View
            className="absolute bottom-3 right-3 px-3 py-1 rounded-full"
            style={{ backgroundColor: 'rgba(255,255,255,0.92)' }}
          >
            <Text
              className="text-primary-T40 text-base font-label uppercase tracking-widest"
              style={{ fontWeight: '700' }}
            >
              {post.tag}
            </Text>
          </View>
        )}
      </View>

      {/* Info row */}
      <View className="px-4 py-3 gap-1.5">
        <View className="flex-row items-start justify-between">
          <Text
            className="text-neutral-T10 font-sans flex-1 pr-2"
            style={{ fontSize: 16, fontWeight: '700' }}
            numberOfLines={1}
          >
            {post.title}
          </Text>
          <Ionicons name="heart-outline" size={20} color="#AAABAB" />
        </View>

        <View className="flex-row items-center gap-4">
          {/* Distance */}
          <View className="flex-row items-center gap-1">
            <Feather name="navigation" size={12} color="#757777" />
            <Text className="text-neutral-T50 text-sm font-label">
              {post.distance}
            </Text>
          </View>

          {/* Pickup time or urgency */}
          {post.pickupTime && (
            <View className="flex-row items-center gap-1">
              <Feather name="clock" size={12} color="#983F6A" />
              <Text
                className="text-sm font-label"
                style={{ color: '#983F6A', fontWeight: '600' }}
              >
                {post.pickupTime}
              </Text>
            </View>
          )}
          {post.urgencyLabel && (
            <View className="flex-row items-center gap-1">
              <Ionicons
                name={isUrgent ? 'warning-outline' : 'cube-outline'}
                size={12}
                color={isUrgent ? '#ba1a1a' : '#757777'}
              />
              <Text
                className="text-sm font-label"
                style={{
                  color: isUrgent ? '#ba1a1a' : '#757777',
                  fontWeight: isUrgent ? '600' : '400',
                }}
              >
                {post.urgencyLabel}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}
