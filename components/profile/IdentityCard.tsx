import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Image, Text, View } from 'react-native';

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
}: IdentityCardProps) {
  const year = new Date(createdAt).getFullYear();

  return (
    <View className="bg-neutral-T100 rounded-2xl shadow-sm p-6 gap-4">
      {isIncomplete && (
        <SectionIncompleteBadge message="Missing avatar — tap Edit to add" />
      )}
      <View className="flex-row items-center gap-6">
        {/* Avatar */}
        <View className="relative">
          <View className="w-24 h-24 rounded-full overflow-hidden border border-neutral-T80 bg-neutral-T95 items-center justify-center">
            {avatar ? (
              <Image
                source={{ uri: avatar }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <MaterialIcons name="person" size={40} color="#757777" />
            )}
          </View>
          {/* Role badge */}
          <View
            className={`absolute -bottom-1 -right-1 ${ROLE_BADGE[role].containerClass} px-3 py-1 rounded-full border border-neutral-T100`}
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
          <Text className="font-sans font-bold text-2xl text-neutral-T10">
            {fullName}
          </Text>
          <View className="flex-row items-center gap-2 mt-1">
            <Text className="text-sm font-label text-neutral-T50">
              Since {year}
            </Text>
            {status === 'ACTIVE' && (
              <MaterialIcons name="verified" size={16} color="#296C24" />
            )}
          </View>
        </View>
      </View>

      {/* Stats */}
      <View className="flex-row gap-3 pt-2">
        <View className="flex-1 bg-neutral-T95 rounded-xl p-4">
          <Text className="font-label text-[10px] font-semibold text-neutral-T50 tracking-wider uppercase">
            Green Points
          </Text>
          <Text className="font-sans font-bold text-primary-T40 text-xl mt-1">
            {greenPoints.toLocaleString()}
          </Text>
        </View>
        <View className="flex-1 bg-neutral-T95 rounded-xl p-4">
          <Text className="font-label text-[10px] font-semibold text-neutral-T50 tracking-wider uppercase">
            Rating
          </Text>
          <View className="flex-row items-center gap-1 mt-1">
            <Text className="font-sans font-bold text-secondary-T40 text-xl">
              {averageRating}
            </Text>
            <MaterialIcons name="star" size={18} color="#944A00" />
          </View>
        </View>
      </View>
    </View>
  );
}
