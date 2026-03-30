import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';

export default function ImpactBanner() {
  return (
    <View className="mx-5 mt-8 mb-6 bg-primary-T40 rounded-2xl px-5 py-5 overflow-hidden shadow-md">
      {/* Decorative elements */}
      <View
        className="absolute -top-4 -right-4 w-20 h-20 bg-primary-T30/30 rounded-xl"
        style={{ transform: [{ rotate: '15deg' }] }}
      />
      <View
        className="absolute bottom-2 right-10 w-10 h-10 bg-primary-T50/25 rounded-lg"
        style={{ transform: [{ rotate: '-10deg' }] }}
      />

      <View className="flex-row items-center gap-2 mb-3">
        <View className="bg-secondary-T80 w-9 h-9 rounded-full items-center justify-center">
          <Ionicons name="flash" size={18} color="#296C24" />
        </View>
        <Text
          className="text-lg font-sans text-neutral-T100"
          style={{ fontWeight: '700' }}
        >
          You make a difference
        </Text>
      </View>

      <View className="flex-row justify-between">
        {[
          { label: 'Meals saved', value: '2.4M' },
          { label: 'CO₂ reduced', value: '800t' },
          { label: 'Members', value: '150K+' },
        ].map((stat, i) => (
          <View key={i} className="items-center">
            <Text
              className="text-xl font-sans text-neutral-T100"
              style={{ fontWeight: '800' }}
            >
              {stat.value}
            </Text>
            <Text className="text-xs font-body text-neutral-T95/80 mt-0.5">
              {stat.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
