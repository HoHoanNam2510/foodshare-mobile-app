import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';

const FILTER_CONFIGS = [
  { id: 'all', labelKey: 'home.filterAll', active: true },
  { id: 'food', labelKey: 'home.filterFood', active: false },
  { id: 'nonfood', labelKey: 'home.filterNonfood', active: false },
  { id: 'veg', labelKey: 'home.filterVegetarian', active: false },
  { id: 'bakery', labelKey: 'home.filterBakery', active: false },
  { id: 'produce', labelKey: 'home.filterProduce', active: false },
];

export default function FilterPills() {
  const { t } = useTranslation();
  return (
    <View className="mx-5 overflow-hidden">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="py-1"
      >
        {FILTER_CONFIGS.map((f, index) => (
          <TouchableOpacity
            key={f.id}
            className={`px-4 py-2 rounded-full ${
              f.active
                ? 'bg-primary-T40'
                : 'bg-neutral-T100 border border-neutral-T90'
            } ${index < FILTER_CONFIGS.length - 1 ? 'mr-2' : ''}`}
            activeOpacity={0.8}
          >
            <Text
              className={`text-sm font-body ${
                f.active ? 'text-neutral-T100' : 'text-neutral-T30'
              }`}
              style={{ fontWeight: f.active ? '600' : '400' }}
            >
              {t(f.labelKey)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
