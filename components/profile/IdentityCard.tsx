import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Image, Text, View } from 'react-native';

interface IdentityCardProps {
  avatar: string;
  fullName: string;
  role: string;
  createdAt: string;
  status: string;
  greenPoints: number;
  averageRating: number;
}

export default function IdentityCard({
  avatar,
  fullName,
  role,
  createdAt,
  status,
  greenPoints,
  averageRating,
}: IdentityCardProps) {
  const year = new Date(createdAt).getFullYear();

  return (
    <View className="bg-neutral-T100 rounded-2xl shadow-sm p-6 gap-4">
      <View className="flex-row items-center gap-6">
        {/* Avatar */}
        <View className="relative">
          <View className="w-24 h-24 rounded-full overflow-hidden border border-neutral-T80">
            <Image
              source={{ uri: avatar }}
              className="w-full h-full"
              resizeMode="cover"
            />
          </View>
          {/* Role badge */}
          <View className="absolute -bottom-1 -right-1 bg-secondary-T90 px-3 py-1 rounded-full border border-neutral-T100">
            <Text className="font-label text-[10px] font-bold text-secondary-T10">
              {role}
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
