import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

export default function ImpactBanner() {
  const { t } = useTranslation();
  return (
    <View className="bg-primary-T40 mx-5 mb-6 mt-8 overflow-hidden rounded-2xl px-5 py-5 shadow-md">
      {/* Decorative elements */}
      <View
        className="bg-primary-T30/30 absolute -right-4 -top-4 h-20 w-20 rounded-xl"
        style={{ transform: [{ rotate: '15deg' }] }}
      />
      <View
        className="bg-primary-T50/25 absolute bottom-2 right-10 h-10 w-10 rounded-lg"
        style={{ transform: [{ rotate: '-10deg' }] }}
      />

      <View className="mb-3 flex-row items-center gap-2">
        <View className="bg-secondary-T80 h-9 w-9 items-center justify-center rounded-full">
          <Ionicons name="flash" size={18} color="#296C24" />
        </View>
        <Text
          className="text-neutral-T100 font-sans text-lg"
          style={{ fontWeight: '700' }}
        >
          {t('home.impactTitle')}
        </Text>
      </View>

      <View className="flex-row justify-between">
        {[
          { label: t('home.impactMeals'), value: '2.4M' },
          { label: t('home.impactCO2'), value: '800t' },
          { label: t('home.impactMembers'), value: '150K+' },
        ].map((stat, i) => (
          <View key={i} className="items-center">
            <Text
              className="text-neutral-T100 font-sans text-xl"
              style={{ fontWeight: '800' }}
            >
              {stat.value}
            </Text>
            <Text className="font-body text-neutral-T95/80 mt-0.5 text-xs">
              {stat.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
