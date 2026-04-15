import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import {
  ActivityIndicator,
  Image,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import type { IBadge } from '@/lib/badgeApi';

interface BadgesRowProps {
  badges: IBadge[];
  total: number;
  unlocked: number;
  isLoading?: boolean;
  onSeeAll: () => void;
}

/** Preview row: hiển thị tối đa 5 badge đã mở khóa trên màn hình Profile */
export default function BadgesRow({
  badges,
  total,
  unlocked,
  isLoading,
  onSeeAll,
}: BadgesRowProps) {
  const { t } = useTranslation();
  // Ưu tiên show badge đã mở khóa trước, sau đó bổ sung badge chưa mở cho đủ 5
  const unlockedBadges = badges.filter((b) => b.isUnlocked);
  const lockedBadges = badges.filter((b) => !b.isUnlocked);
  const preview = [...unlockedBadges, ...lockedBadges].slice(0, 5);
  const remaining = total - 5;

  return (
    <View className="bg-neutral-T100 rounded-2xl shadow-sm p-5 gap-4">
      {/* Header */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <MaterialIcons name="military-tech" size={20} color="#296C24" />
          <Text className="font-sans font-bold text-base text-neutral-T10">
            {t('profile.badges')}
          </Text>
        </View>
        <TouchableOpacity
          onPress={onSeeAll}
          className="flex-row items-center gap-1 active:opacity-70"
        >
          <Text className="font-label text-xs font-semibold text-primary-T40">
            {t('common.seeAll')}
          </Text>
          <MaterialIcons name="chevron-right" size={16} color="#296C24" />
        </TouchableOpacity>
      </View>

      {/* Progress bar */}
      <View className="gap-1.5">
        <View className="flex-row items-center justify-between">
          <Text className="font-label text-xs text-neutral-T50">
            {t('profile.badgeUnlockedLabel')}
          </Text>
          <Text className="font-label text-xs font-semibold text-primary-T40">
            {unlocked}/{total}
          </Text>
        </View>
        <View className="h-1.5 bg-neutral-T90 rounded-full overflow-hidden">
          <View
            className="h-full bg-primary rounded-full"
            style={{ width: total > 0 ? `${(unlocked / total) * 100}%` : '0%' }}
          />
        </View>
      </View>

      {/* Badge previews */}
      {isLoading ? (
        <View className="items-center py-4">
          <ActivityIndicator color="#296C24" />
        </View>
      ) : badges.length === 0 ? (
        <View className="items-center py-6 gap-2">
          <MaterialIcons name="military-tech" size={40} color="#C5C7C6" />
          <Text className="font-body text-xs text-neutral-T50 text-center">
            {t('profile.badgesNoBadges')}
          </Text>
        </View>
      ) : (
        <View className="flex-row items-center gap-3">
          {preview.map((badge) => (
            <BadgeItem key={badge._id} badge={badge} />
          ))}
          {remaining > 0 && (
            <TouchableOpacity
              onPress={onSeeAll}
              className="w-14 h-14 rounded-2xl bg-neutral-T95 items-center justify-center active:opacity-70"
            >
              <Text className="font-label text-xs font-semibold text-neutral-T50">
                +{remaining}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

function BadgeItem({ badge }: { badge: IBadge }) {
  return (
    <View className="items-center gap-1.5" style={{ width: 52 }}>
      <View
        className={`w-14 h-14 rounded-2xl items-center justify-center overflow-hidden ${
          badge.isUnlocked ? 'bg-primary-T95' : 'bg-neutral-T95'
        }`}
      >
        <Image
          source={{ uri: badge.imageUrl }}
          style={{ width: 40, height: 40 }}
          resizeMode="contain"
          // Greyscale effect bằng opacity khi chưa mở khóa
          {...(!badge.isUnlocked && {
            style: { width: 40, height: 40, opacity: 0.3 },
          })}
        />
      </View>
      <Text
        className={`font-label text-[9px] text-center leading-tight ${
          badge.isUnlocked
            ? 'text-neutral-T20 font-semibold'
            : 'text-neutral-T60'
        }`}
        numberOfLines={2}
      >
        {badge.name}
      </Text>
    </View>
  );
}
