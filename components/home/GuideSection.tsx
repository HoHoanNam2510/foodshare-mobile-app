import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';

const GUIDE_CARD_CONFIGS = [
  { id: 'g1', icon: 'shield-check', labelKey: 'home.guideSafety' },
  { id: 'g2', icon: 'truck-fast', labelKey: 'home.guideFastPickup' },
  { id: 'g3', icon: 'leaf', labelKey: 'home.guideReduceWaste' },
  { id: 'g4', icon: 'account-group', labelKey: 'home.guideCommunity' },
];

export default function GuideSection() {
  const { t } = useTranslation();
  return (
    <View className="mt-8">
      <View className="px-5 mb-1">
        <Text className="text-sm font-body text-neutral-T50">{t('home.guideSubtitle')}</Text>
        <Text
          className="text-xl font-sans text-neutral-T10 mt-1"
          style={{ fontWeight: '700', letterSpacing: -0.3 }}
        >
          {t('home.guideTitle')}
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
          {GUIDE_CARD_CONFIGS.map((card, index) => (
            <TouchableOpacity
              key={card.id}
              className={`bg-neutral-T100 rounded-2xl p-4 justify-between shadow-sm active:opacity-80 ${
                index < GUIDE_CARD_CONFIGS.length - 1 ? 'mr-2.5' : ''
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
                {t(card.labelKey)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}
