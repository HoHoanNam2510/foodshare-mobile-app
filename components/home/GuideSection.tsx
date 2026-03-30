import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

const GUIDE_CARDS = [
  { id: 'g1', icon: 'shield-check', label: 'How to share safely' },
  { id: 'g2', icon: 'truck-fast', label: 'Fast pickups 101' },
  { id: 'g3', icon: 'leaf', label: 'Reduce your waste' },
  { id: 'g4', icon: 'account-group', label: 'Community rules' },
];

export default function GuideSection() {
  return (
    <View className="mt-8">
      <View className="px-5 mb-1">
        <Text className="text-sm font-body text-neutral-T50">The basics</Text>
        <Text
          className="text-xl font-sans text-neutral-T10 mt-1"
          style={{ fontWeight: '700', letterSpacing: -0.3 }}
        >
          Get started
        </Text>
      </View>

      <View className="mx-5 overflow-hidden">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop: 14,
            paddingBottom: 4,
          }}
        >
          {GUIDE_CARDS.map((card, index) => (
            <TouchableOpacity
              key={card.id}
              className={`bg-neutral-T100 rounded-2xl p-4 justify-between shadow-sm active:opacity-80 ${
                index < GUIDE_CARDS.length - 1 ? 'mr-2.5' : ''
              }`}
              style={{ width: 140, height: 120 }}
            >
              <View className="w-10 h-10 rounded-xl bg-primary-T95 items-center justify-center">
                <MaterialCommunityIcons
                  name={card.icon as any}
                  size={22}
                  color="#296C24"
                />
              </View>
              <Text
                className="text-sm font-body text-neutral-T10 mt-2 leading-snug"
                style={{ fontWeight: '600' }}
              >
                {card.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}
