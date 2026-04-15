import { Feather, Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ExplorePost } from './types';

interface PostCardProps {
  post: ExplorePost;
  onPress?: () => void;
}

type TFunc = (key: string, opts?: Record<string, unknown>) => string;

function formatPickupTime(start: string, end: string, t: TFunc): string {
  const s = new Date(start);
  const e = new Date(end);
  const pad = (n: number) => n.toString().padStart(2, '0');
  const timeRange = `${pad(s.getHours())}:${pad(s.getMinutes())} – ${pad(e.getHours())}:${pad(e.getMinutes())}`;

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  if (s.toDateString() === tomorrow.toDateString()) return t('explore.tomorrowTime', { time: timeRange });
  return timeRange;
}

function getUrgencyInfo(expiryDate: string, t: TFunc): { label: string; isUrgent: boolean } | null {
  const expiry = new Date(expiryDate);
  const now = new Date();
  const msPerDay = 24 * 60 * 60 * 1000;
  const daysLeft = (expiry.getTime() - now.getTime()) / msPerDay;

  if (daysLeft < 0) return { label: t('explore.expired'), isUrgent: true };
  if (expiry.toDateString() === now.toDateString()) return { label: t('explore.expiringToday'), isUrgent: true };

  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  if (expiry.toDateString() === tomorrow.toDateString()) return { label: t('explore.expiringTomorrow'), isUrgent: true };

  return null;
}

export default function PostCard({ post, onPress }: PostCardProps) {
  const { t } = useTranslation();
  const isFree = post.type === 'P2P_FREE';
  const imageUrl = post.images?.[0];
  const urgency = getUrgencyInfo(post.expiryDate, t as TFunc);
  const pickupLabel = formatPickupTime(post.pickupTime.start, post.pickupTime.end, t as TFunc);
  const priceLabel = isFree ? t('common.free').toUpperCase() : `${post.price.toLocaleString('vi-VN')}đ`;
  const tag = post.type === 'B2C_MYSTERY_BAG' ? t('explore.surpriseBag') : undefined;

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
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            className="w-full h-full"
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-full bg-neutral-T95 items-center justify-center">
            <Feather name="image" size={32} color="#AAABAB" />
          </View>
        )}

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
              {priceLabel}
            </Text>
          </View>
        )}

        {/* "Surprise Bag" label – bottom right */}
        {tag && (
          <View
            className="absolute bottom-3 right-3 px-3 py-1 rounded-full"
            style={{ backgroundColor: 'rgba(255,255,255,0.92)' }}
          >
            <Text
              className="text-primary-T40 text-sm font-label uppercase tracking-widest"
              style={{ fontWeight: '700' }}
            >
              {tag}
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
          {/* Distance (only in mock/map view) */}
          {post.distance && (
            <View className="flex-row items-center gap-1">
              <Feather name="navigation" size={12} color="#757777" />
              <Text className="text-neutral-T50 text-sm font-label">
                {post.distance}
              </Text>
            </View>
          )}

          {/* Pickup time */}
          <View className="flex-row items-center gap-1">
            <Feather name="clock" size={12} color="#983F6A" />
            <Text
              className="text-sm font-label"
              style={{ color: '#983F6A', fontWeight: '600' }}
            >
              {pickupLabel}
            </Text>
          </View>

          {/* Urgency */}
          {urgency && (
            <View className="flex-row items-center gap-1">
              <Ionicons
                name="warning-outline"
                size={12}
                color={urgency.isUrgent ? '#ba1a1a' : '#757777'}
              />
              <Text
                className="text-sm font-label"
                style={{
                  color: urgency.isUrgent ? '#ba1a1a' : '#757777',
                  fontWeight: urgency.isUrgent ? '600' : '400',
                }}
              >
                {urgency.label}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}
