import { Ionicons } from '@expo/vector-icons';
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
  const isFree = post.type === 'P2P_FREE';
  const imageUrl = post.images?.[0];
  const priceLabel = isFree
    ? t('map.free')
    : `${post.price.toLocaleString('vi-VN')}đ`;
  const distanceLabel = formatDistance(post.distance);

  return (
    <View
      className="bg-neutral-T100 rounded-3xl p-3 flex-row gap-3"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 20,
        elevation: 8,
      }}
    >
      {/* Thumbnail */}
      <View className="w-22 h-22 rounded-2xl overflow-hidden flex-shrink-0">
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={{ width: 88, height: 88 }}
            resizeMode="cover"
          />
        ) : (
          <View
            style={{ width: 88, height: 88, backgroundColor: '#F3F4F4' }}
            className="items-center justify-center"
          />
        )}
      </View>

      {/* Info */}
      <View className="flex-1 justify-between py-0.5">
        <View>
          <Text
            className="text-secondary text-[10px] font-label uppercase tracking-widest"
            style={{ fontWeight: '700' }}
          >
            {isFree ? t('map.freeFood') : t('map.mysteryBag')}
          </Text>
          <Text
            className="text-neutral-T10 font-sans mt-0.5"
            style={{ fontSize: 15, fontWeight: '700', lineHeight: 20 }}
            numberOfLines={2}
          >
            {post.title}
          </Text>
          {distanceLabel && (
            <View className="flex-row items-center gap-1 mt-1">
              <Ionicons name="location-outline" size={12} color="#757777" />
              <Text className="text-neutral-T50 text-xs font-label">
                {distanceLabel}
              </Text>
            </View>
          )}
        </View>

        <View className="flex-row items-center justify-between mt-2">
          <Text
            className={`font-sans ${isFree ? 'text-primary-T40' : 'text-secondary'}`}
            style={{ fontSize: 16, fontWeight: '700' }}
          >
            {priceLabel}
          </Text>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onViewDetails}
            className="bg-primary-T90 px-3 py-1.5 rounded-xl"
          >
            <Text
              className="text-primary-T30 text-xs font-label"
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
