import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import GuideSectionModal from './GuideSectionModal';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

const GUIDE_CARD_CONFIGS: { id: string; icon: IconName; labelKey: string }[] = [
  { id: 'g1', icon: 'shield-check', labelKey: 'home.guideSafety' },
  { id: 'g2', icon: 'truck-fast', labelKey: 'home.guideFastPickup' },
  { id: 'g3', icon: 'leaf', labelKey: 'home.guideReduceWaste' },
  { id: 'g4', icon: 'account-group', labelKey: 'home.guideCommunity' },
];

export default function GuideSection() {
  const { t } = useTranslation();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  return (
    <View className="mt-8">
      <View className="mb-1 px-5">
        <Text className="font-body text-neutral-T50 text-sm">
          {t('home.guideSubtitle')}
        </Text>
        <Text
          className="text-neutral-T10 mt-1 font-sans text-xl"
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
              onPress={() => setSelectedIndex(index)}
              className={`bg-neutral-T100 justify-between rounded-2xl p-4 shadow-sm active:opacity-80 ${
                index < GUIDE_CARD_CONFIGS.length - 1 ? 'mr-2.5' : ''
              }`}
              style={{ width: 140, height: 120 }}
            >
              <View className="bg-primary-T95 h-10 w-10 items-center justify-center rounded-xl">
                <MaterialCommunityIcons
                  name={card.icon}
                  size={22}
                  color="#296C24"
                />
              </View>
              <Text
                className="font-body text-neutral-T10 mt-2 text-sm leading-snug"
                style={{ fontWeight: '600' }}
              >
                {t(card.labelKey)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <GuideSectionModal
        guideIndex={selectedIndex}
        onClose={() => setSelectedIndex(null)}
      />
    </View>
  );
}
