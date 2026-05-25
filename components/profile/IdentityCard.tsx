import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useThemeColors } from '@/lib/hooks/useThemeColors';
import SectionIncompleteBadge from '@/components/profile/SectionIncompleteBadge';

type UserRole = 'USER' | 'STORE' | 'ADMIN';

interface IdentityCardProps {
  avatar?: string;
  fullName: string;
  role: UserRole;
  createdAt: string;
  status: string;
  greenPoints: number;
  averageRating: number;
  isIncomplete?: boolean;
  onGreenPointsPress?: () => void;
}

const ROLE_BADGE: Record<
  UserRole,
  { containerClass: string; textClass: string; label: string }
> = {
  USER: {
    containerClass: 'bg-secondary-T90',
    textClass: 'text-secondary-T10',
    label: 'User',
  },
  STORE: {
    containerClass: 'bg-primary-T90',
    textClass: 'text-primary-T10',
    label: 'Store',
  },
  ADMIN: {
    containerClass: 'bg-neutral-T20',
    textClass: 'text-neutral-T100',
    label: 'Admin',
  },
};

export default function IdentityCard({
  avatar,
  fullName,
  role,
  createdAt,
  status,
  greenPoints,
  averageRating,
  isIncomplete,
  onGreenPointsPress,
}: IdentityCardProps) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const year = new Date(createdAt).getFullYear();

  return (
    <View className="bg-neutral-T100 dark:bg-neutral-T20 dark:border-neutral-T30 gap-4 rounded-2xl p-6 shadow-sm dark:border dark:shadow-none">
      {isIncomplete && (
        <SectionIncompleteBadge message={t('profile.missingAvatarMsg')} />
      )}
      <View className="flex-row items-center gap-6">
        {/* Avatar */}
        <View className="relative">
          <View className="border-neutral-T80 dark:border-neutral-T30 bg-neutral-T95 dark:bg-neutral-T30 h-24 w-24 items-center justify-center overflow-hidden rounded-full border">
            {avatar ? (
              <Image
                source={{ uri: avatar }}
                className="h-full w-full"
                resizeMode="cover"
              />
            ) : (
              <MaterialIcons name="person" size={40} color="#757777" />
            )}
          </View>
          {/* Role badge */}
          <View
            className={`absolute -bottom-1 -right-1 ${ROLE_BADGE[role].containerClass} border-neutral-T100 dark:border-neutral-T20 rounded-full border px-3 py-1`}
          >
            <Text
              className={`font-label text-[10px] font-bold ${ROLE_BADGE[role].textClass}`}
            >
              {ROLE_BADGE[role].label}
            </Text>
          </View>
        </View>

        {/* Name + since */}
        <View className="flex-1">
          <Text className="text-neutral-T10 dark:text-neutral-T90 font-sans text-2xl font-bold">
            {fullName}
          </Text>
          <View className="mt-1 flex-row items-center gap-2">
            <Text className="font-label text-neutral-T50 dark:text-neutral-T60 text-sm">
              {t('profile.since', { year })}
            </Text>
            {status === 'ACTIVE' && (
              <MaterialIcons
                name="verified"
                size={16}
                color={colors.primaryGreen}
              />
            )}
          </View>
        </View>
      </View>

      {/* Stats */}
      <View className="flex-row gap-3 pt-2">
        <TouchableOpacity
          className="bg-neutral-T95 dark:bg-neutral-T30 flex-1 rounded-xl p-4 active:opacity-70"
          onPress={onGreenPointsPress}
          activeOpacity={onGreenPointsPress ? 0.7 : 1}
          disabled={!onGreenPointsPress}
        >
          <Text className="font-label text-neutral-T50 dark:text-neutral-T60 text-[10px] font-semibold uppercase tracking-wider">
            {t('profile.greenPoints')}
          </Text>
          <Text className="text-primary-T40 dark:text-primary-T60 mt-1 font-sans text-xl font-bold">
            {greenPoints.toLocaleString()}
          </Text>
        </TouchableOpacity>
        <View className="bg-neutral-T95 dark:bg-neutral-T30 flex-1 rounded-xl p-4">
          <Text className="font-label text-neutral-T50 dark:text-neutral-T60 text-[10px] font-semibold uppercase tracking-wider">
            {t('profile.ratingLabel')}
          </Text>
          <View className="mt-1 flex-row items-center gap-1">
            <Text className="text-secondary-T40 dark:text-secondary-T60 font-sans text-xl font-bold">
              {averageRating}
            </Text>
            <MaterialIcons
              name="star"
              size={18}
              color={colors.secondaryOrange}
            />
          </View>
        </View>
      </View>
    </View>
  );
}
