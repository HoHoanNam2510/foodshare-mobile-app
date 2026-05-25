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
    <View className="bg-neutral-T100 dark:bg-neutral-T20 dark:border-neutral-T30 gap-4 rounded-2xl p-5 shadow-sm dark:border dark:shadow-none">
      {/* Header */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <MaterialIcons name="military-tech" size={20} color="#296C24" />
          <Text className="text-neutral-T10 dark:text-neutral-T90 font-sans text-base font-bold">
            {t('profile.badges')}
          </Text>
        </View>
        <TouchableOpacity
          onPress={onSeeAll}
          className="flex-row items-center gap-1 active:opacity-70"
        >
          <Text className="font-label text-primary-T40 text-xs font-semibold">
            {t('common.seeAll')}
          </Text>
          <MaterialIcons name="chevron-right" size={16} color="#296C24" />
        </TouchableOpacity>
      </View>

      {/* Progress bar */}
      <View className="gap-1.5">
        <View className="flex-row items-center justify-between">
          <Text className="font-label text-neutral-T50 text-xs">
            {t('profile.badgeUnlockedLabel')}
          </Text>
          <Text className="font-label text-primary-T40 text-xs font-semibold">
            {unlocked}/{total}
          </Text>
        </View>
        <View className="bg-neutral-T90 dark:bg-neutral-T30 h-1.5 overflow-hidden rounded-full">
          <View
            className="bg-primary h-full rounded-full"
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
        <View className="items-center gap-2 py-6">
          <MaterialIcons name="military-tech" size={40} color="#C5C7C6" />
          <Text className="font-body text-neutral-T50 text-center text-xs">
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
              className="bg-neutral-T95 dark:bg-neutral-T30 h-14 w-14 items-center justify-center rounded-2xl active:opacity-70"
            >
              <Text className="font-label text-neutral-T50 text-xs font-semibold">
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
        className={`h-14 w-14 items-center justify-center overflow-hidden rounded-2xl ${
          badge.isUnlocked
            ? 'bg-primary-T95 dark:bg-primary-T20'
            : 'bg-neutral-T95 dark:bg-neutral-T30'
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
        className={`font-label text-center text-[9px] leading-tight ${
          badge.isUnlocked
            ? 'text-neutral-T20 dark:text-neutral-T90 font-semibold'
            : 'text-neutral-T60'
        }`}
        numberOfLines={2}
      >
        {badge.name}
      </Text>
    </View>
  );
}
