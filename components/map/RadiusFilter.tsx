import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

export type RadiusOption = 1000 | 3000 | 5000;

const OPTIONS: { label: string; value: RadiusOption }[] = [
  { label: '1 km', value: 1000 },
  { label: '3 km', value: 3000 },
  { label: '5 km', value: 5000 },
];

interface RadiusFilterProps {
  value: RadiusOption;
  onChange: (v: RadiusOption) => void;
}

export default function RadiusFilter({ value, onChange }: RadiusFilterProps) {
  return (
    <View className="flex-row gap-2">
      {OPTIONS.map((opt) => {
        const active = value === opt.value;
        return (
          <TouchableOpacity
            key={opt.value}
            activeOpacity={0.8}
            onPress={() => onChange(opt.value)}
            className={`rounded-full px-4 py-2 ${active ? 'bg-primary-T40' : 'bg-neutral-T100'}`}
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <Text
              className={`font-label text-xs font-semibold ${active ? 'text-neutral-T100' : 'text-neutral-T30'}`}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
