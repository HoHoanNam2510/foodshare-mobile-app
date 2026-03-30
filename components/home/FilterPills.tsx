import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

const FILTERS = [
  { id: 'all', label: 'All', active: true },
  { id: 'food', label: 'Food', active: false },
  { id: 'nonfood', label: 'Non-food', active: false },
  { id: 'veg', label: 'Vegetarian', active: false },
  { id: 'bakery', label: 'Bakery', active: false },
  { id: 'produce', label: 'Produce', active: false },
];

export default function FilterPills() {
  return (
    <View className="mx-5 overflow-hidden">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="py-1"
      >
        {FILTERS.map((f, index) => (
          <TouchableOpacity
            key={f.id}
            className={`px-4 py-2 rounded-full ${
              f.active
                ? 'bg-primary-T40'
                : 'bg-neutral-T100 border border-neutral-T90'
            } ${index < FILTERS.length - 1 ? 'mr-2' : ''}`}
            activeOpacity={0.8}
          >
            <Text
              className={`text-sm font-body ${
                f.active ? 'text-neutral-T100' : 'text-neutral-T30'
              }`}
              style={{ fontWeight: f.active ? '600' : '400' }}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
