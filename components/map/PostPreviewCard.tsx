import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

import { MapPost } from './types';
import { useTranslation } from 'react-i18next';

interface PostPreviewCardProps {
  post: MapPost;
  onViewDetails?: () => void;
}

function formatDistance(metres?: number): string | null {
  if (metres == null) return null;
  if (metres < 1000) return `${Math.round(metres)} m`;
  return `${(metres / 1000).toFixed(1)} km`;
}

export default function PostPreviewCard({
  post,
  onViewDetails,
}: PostPreviewCardProps) {
  const { t } = useTranslation();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const isFree = post.type === 'P2P_FREE';
  const imageUrl = post.images?.[0];
  const priceLabel = isFree
    ? t('map.free')
    : `${post.price.toLocaleString('vi-VN')}đ`;
  const distanceLabel = formatDistance(post.distance);

  return (
    <View
      className="bg-neutral-T100 dark:bg-neutral-T20 flex-row gap-3 rounded-3xl p-3"
      style={
        isDark
          ? { borderWidth: 1, borderColor: '#454747' }
          : {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.12,
              shadowRadius: 20,
              elevation: 8,
            }
      }
    >
      {/* Thumbnail */}
      <View className="w-22 h-22 flex-shrink-0 overflow-hidden rounded-2xl">
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={{ width: 88, height: 88 }}
            resizeMode="cover"
          />
        ) : (
          <View
            style={{
              width: 88,
              height: 88,
              backgroundColor: isDark ? '#454747' : '#F3F4F4',
            }}
            className="items-center justify-center"
          />
        )}
      </View>

      {/* Info */}
      <View className="flex-1 justify-between py-0.5">
        <View>
          <Text
            className="text-secondary font-label text-[10px] uppercase tracking-widest"
            style={{ fontWeight: '700' }}
          >
            {isFree ? t('map.freeFood') : t('map.mysteryBag')}
          </Text>
          <Text
            className="text-neutral-T10 dark:text-neutral-T90 mt-0.5 font-sans"
            style={{ fontSize: 15, fontWeight: '700', lineHeight: 20 }}
            numberOfLines={2}
          >
            {post.title}
          </Text>
          {distanceLabel && (
            <View className="mt-1 flex-row items-center gap-1">
              <Ionicons
                name="location-outline"
                size={12}
                color={isDark ? '#8F9190' : '#757777'}
              />
              <Text className="text-neutral-T50 dark:text-neutral-T60 font-label text-xs">
                {distanceLabel}
              </Text>
            </View>
          )}
        </View>

        <View className="mt-2 flex-row items-center justify-between">
          <Text
            className={`font-sans ${isFree ? 'text-primary-T40' : 'text-secondary'}`}
            style={{ fontSize: 16, fontWeight: '700' }}
          >
            {priceLabel}
          </Text>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onViewDetails}
            className="bg-primary-T90 dark:bg-primary-T30 rounded-xl px-3 py-1.5"
          >
            <Text
              className="text-primary-T30 dark:text-primary-T80 font-label text-xs"
              style={{ fontWeight: '700' }}
            >
              {t('map.viewDetails')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
