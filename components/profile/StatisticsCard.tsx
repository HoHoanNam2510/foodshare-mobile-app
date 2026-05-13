import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useStatistics } from '@/hooks/useStatistics';

export default function StatisticsCard() {
  const { t } = useTranslation();
  const router = useRouter();
  const { data, loading } = useStatistics({ range: '30d' });

  return (
    <View className="bg-neutral-T100 gap-4 rounded-2xl p-6 shadow-sm">
      {/* Header */}
      <View className="flex-row items-center gap-2">
        <View className="bg-primary-T95 h-9 w-9 items-center justify-center rounded-xl">
          <MaterialIcons name="bar-chart" size={18} color="#296C24" />
        </View>
        <Text className="text-neutral-T10 font-sans text-lg font-bold">
          {t('statistics.title')}
        </Text>
      </View>

      {/* Stats content */}
      {loading ? (
        <View className="items-center py-2">
          <ActivityIndicator size="small" color="#72B866" />
        </View>
      ) : (
        <View className="flex-row gap-3">
          <View className="bg-neutral-T95 flex-1 rounded-xl p-4">
            <Text className="font-label text-neutral-T50 text-[10px] font-semibold uppercase tracking-wider">
              {t('profile.totalTransactions')}
            </Text>
            <Text className="text-primary-T40 mt-1 font-sans text-xl font-bold">
              {data?.summary.txCount ?? 0}
            </Text>
          </View>
          <View className="bg-neutral-T95 flex-1 rounded-xl p-4">
            <Text className="font-label text-neutral-T50 text-[10px] font-semibold uppercase tracking-wider">
              {t('statistics.greenPointsEarned')}
            </Text>
            <Text className="text-primary-T40 mt-1 font-sans text-xl font-bold">
              {data?.totalGreenPointsEarned ?? 0}
            </Text>
          </View>
        </View>
      )}

      {/* Detail button */}
      <TouchableOpacity
        className="border-primary-T40 rounded-xl border py-3"
        onPress={() => router.push('/(statistics)/statistics' as any)}
        activeOpacity={0.7}
      >
        <Text className="text-primary-T40 font-label text-center font-semibold">
          {t('statistics.viewDetail')} →
        </Text>
      </TouchableOpacity>
    </View>
  );
}
