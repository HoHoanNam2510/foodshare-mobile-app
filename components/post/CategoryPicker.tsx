import React from 'react';
import { ScrollView, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';

export const CATEGORIES = [
  'Home cooked',
  'Bakery',
  'Fruits & Vegs',
  'Dairy',
  'Beverages',
  'Packaged food',
  'Other',
] as const;

interface CategoryPickerProps {
  selected: string;
  onSelect: (category: string) => void;
}

export default function CategoryPicker({
  selected,
  onSelect,
}: CategoryPickerProps) {
  const { t } = useTranslation();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8, paddingVertical: 4 }}
    >
      {CATEGORIES.map((cat) => (
        <TouchableOpacity
          key={cat}
          onPress={() => onSelect(cat)}
          className={`rounded-lg px-5 py-2.5 shadow-sm active:opacity-80 ${
            selected === cat
              ? 'bg-primary-T95'
              : 'bg-neutral-T100 border-neutral-T90 border'
          }`}
        >
          <Text
            className={`font-label text-sm font-semibold ${
              selected === cat ? 'text-primary-T30' : 'text-neutral-T50'
            }`}
          >
            {t(`post.categories.${cat}`, cat)}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
