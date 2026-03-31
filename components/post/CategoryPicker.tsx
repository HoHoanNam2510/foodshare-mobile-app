import React from 'react';
import { ScrollView, Text, TouchableOpacity } from 'react-native';

const CATEGORIES = [
  'Home cooked',
  'Bakery',
  'Fruits & Vegs',
  'Dairy',
  'Beverages',
  'Packaged food',
  'Other',
];

interface CategoryPickerProps {
  selected: string;
  onSelect: (category: string) => void;
}

export default function CategoryPicker({
  selected,
  onSelect,
}: CategoryPickerProps) {
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
          className={`px-5 py-2.5 rounded-lg shadow-sm active:opacity-80 ${
            selected === cat
              ? 'bg-primary-T95'
              : 'bg-neutral-T100 border border-neutral-T90'
          }`}
        >
          <Text
            className={`font-label text-sm font-semibold ${
              selected === cat ? 'text-primary-T30' : 'text-neutral-T50'
            }`}
          >
            {cat}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
