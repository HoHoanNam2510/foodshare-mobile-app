import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';

interface GreenPointsCardProps {
  points: number;
}

export default function GreenPointsCard({ points }: GreenPointsCardProps) {
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={() => router.push('/(voucher)/point-history' as any)}
      activeOpacity={0.8}
      className="dark:bg-neutral-T20 dark:border-neutral-T30 mb-4 flex-row items-center rounded-2xl bg-white p-4 shadow-sm dark:border dark:shadow-none"
    >
      <View className="bg-primary-T95 dark:bg-primary-T20 mr-4 rounded-xl p-3">
        <MaterialCommunityIcons name="leaf" size={24} color="#72B866" />
      </View>
      <View className="flex-1">
        <Text className="text-neutral-T30 dark:text-neutral-T80 font-body text-sm">
          Green Points kiếm được
        </Text>
        <Text className="font-body-bold text-primary-T40 mt-1 text-2xl">
          {points}
        </Text>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={20} color="#C5C7C6" />
    </TouchableOpacity>
  );
}
