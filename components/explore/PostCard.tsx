import { Feather, Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import React, { useState } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ExplorePost } from './types';
import { addBookmarkApi, removeBookmarkApi } from '@/lib/bookmarkApi';

interface PostCardProps {
  post: ExplorePost;
  onPress?: () => void;
  initialBookmarked?: boolean;
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

  if (s.toDateString() === tomorrow.toDateString())
    return t('explore.tomorrowTime', { time: timeRange });
  return timeRange;
}

type UrgencyLevel = 'critical' | 'warning' | 'soon' | null;

function getUrgencyInfo(
  expiryDate: string,
  t: TFunc
): { label: string; level: UrgencyLevel } | null {
  const expiry = new Date(expiryDate);
  const now = new Date();
  const msLeft = expiry.getTime() - now.getTime();

  if (msLeft < 0) return { label: t('explore.expired'), level: 'critical' };

  const hoursLeft = msLeft / (60 * 60 * 1000);

  if (hoursLeft < 3) {
    const minutesLeft = Math.floor(msLeft / 60000);
    const label =
      minutesLeft < 60
        ? t('explore.expiresInMinutes', {
            minutes: minutesLeft,
            defaultValue: `Còn ${minutesLeft} phút`,
          })
        : t('explore.expiresInHours', {
            hours: Math.floor(hoursLeft),
            defaultValue: `Còn ${Math.floor(hoursLeft)} giờ`,
          });
    return { label, level: 'critical' };
  }

  if (hoursLeft < 12) {
    const label = t('explore.expiresInHours', {
      hours: Math.floor(hoursLeft),
      defaultValue: `Còn ${Math.floor(hoursLeft)} giờ`,
    });
    return { label, level: 'warning' };
  }

  if (expiry.toDateString() === now.toDateString())
    return { label: t('explore.expiringToday'), level: 'soon' };

  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  if (expiry.toDateString() === tomorrow.toDateString())
    return { label: t('explore.expiringTomorrow'), level: 'soon' };

  return null;
}

export default function PostCard({
  post,
  onPress,
  initialBookmarked = false,
}: PostCardProps) {
  const { t } = useTranslation();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);

  const handleBookmarkPress = async () => {
    const next = !isBookmarked;
    setIsBookmarked(next);
    try {
      if (next) {
        await addBookmarkApi(post._id);
      } else {
        await removeBookmarkApi(post._id);
      }
    } catch {
      setIsBookmarked(!next); // revert on error
    }
  };
  const isFree = post.type === 'P2P_FREE';
  const imageUrl = post.images?.[0];
  const urgency = getUrgencyInfo(post.expiryDate, t as TFunc);
  const pickupLabel = formatPickupTime(
    post.pickupTime.start,
    post.pickupTime.end,
    t as TFunc
  );
  const priceLabel = isFree
    ? t('common.free').toUpperCase()
    : `${post.price.toLocaleString('vi-VN')}đ`;
  const tag =
    post.type === 'B2C_MYSTERY_BAG' ? t('explore.surpriseBag') : undefined;

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      className="bg-neutral-T100 dark:bg-neutral-T20 dark:border-neutral-T30 overflow-hidden rounded-2xl dark:border"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDark ? 0 : 0.08,
        shadowRadius: 8,
        elevation: isDark ? 0 : 3,
      }}
    >
      {/* Image */}
      <View className="aspect-video w-full overflow-hidden">
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            className="h-full w-full"
            resizeMode="cover"
          />
        ) : (
          <View className="bg-neutral-T95 dark:bg-neutral-T30 h-full w-full items-center justify-center">
            <Feather name="image" size={32} color="#AAABAB" />
          </View>
        )}

        {/* Price / FREE badge – top left */}
        {isFree ? (
          <View className="bg-primary-T40 absolute left-3 top-3 rounded-full px-3 py-1">
            <Text
              className="text-neutral-T100 font-label text-xs"
              style={{ fontWeight: '700' }}
            >
              FREE
            </Text>
          </View>
        ) : (
          <View className="bg-secondary absolute left-3 top-3 rounded-full px-3 py-1">
            <Text
              className="text-neutral-T100 font-label text-xs"
              style={{ fontWeight: '700' }}
            >
              {priceLabel}
            </Text>
          </View>
        )}

        {/* "Surprise Bag" label – bottom right */}
        {tag && (
          <View
            className="absolute bottom-3 right-3 rounded-full px-3 py-1"
            style={{
              backgroundColor: isDark
                ? 'rgba(46,49,49,0.92)'
                : 'rgba(255,255,255,0.92)',
            }}
          >
            <Text
              className="text-primary-T40 dark:text-primary-T60 font-label text-sm uppercase tracking-widest"
              style={{ fontWeight: '700' }}
            >
              {tag}
            </Text>
          </View>
        )}
      </View>

      {/* Info row */}
      <View className="gap-1.5 px-4 py-3">
        <View className="flex-row items-start justify-between">
          <Text
            className="text-neutral-T10 dark:text-neutral-T90 flex-1 pr-2 font-sans"
            style={{ fontSize: 16, fontWeight: '700' }}
            numberOfLines={1}
          >
            {post.title}
          </Text>
          <TouchableOpacity
            onPress={handleBookmarkPress}
            activeOpacity={0.7}
            hitSlop={8}
          >
            <Ionicons
              name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
              size={20}
              color={isBookmarked ? '#296C24' : '#AAABAB'}
            />
          </TouchableOpacity>
        </View>

        <View className="flex-row items-center gap-4">
          {/* Distance (only in mock/map view) */}
          {post.distance && (
            <View className="flex-row items-center gap-1">
              <Feather name="navigation" size={12} color="#757777" />
              <Text className="text-neutral-T50 font-label text-sm">
                {post.distance}
              </Text>
            </View>
          )}

          {/* Pickup time */}
          <View className="flex-row items-center gap-1">
            <Feather name="clock" size={12} color="#983F6A" />
            <Text
              className="font-label text-sm"
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
                color={
                  urgency.level === 'critical'
                    ? '#ba1a1a'
                    : urgency.level === 'warning'
                      ? '#EA8700'
                      : '#757777'
                }
              />
              <Text
                className="font-label text-sm"
                style={{
                  color:
                    urgency.level === 'critical'
                      ? '#ba1a1a'
                      : urgency.level === 'warning'
                        ? '#EA8700'
                        : '#757777',
                  fontWeight: urgency.level !== null ? '600' : '400',
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
