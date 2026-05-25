import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { PostTypeFilter } from '@/types/statistics';

interface PostTypeTabsProps {
  value: PostTypeFilter;
  onChange: (type: PostTypeFilter) => void;
}

export default function PostTypeTabs({ value, onChange }: PostTypeTabsProps) {
  const tabs: { label: string; value: PostTypeFilter }[] = [
    { label: 'P2P Miễn phí', value: 'P2P_FREE' },
    { label: 'B2C Túi Mù', value: 'B2C_MYSTERY_BAG' },
  ];

  return (
    <View className="border-neutral-T90 dark:border-neutral-T30 flex-row border-b">
      {tabs.map((tab) => {
        const isActive = value === tab.value;
        return (
          <TouchableOpacity
            key={tab.value}
            onPress={() => onChange(tab.value)}
            className={`flex-1 items-center py-3 ${
              isActive ? 'border-primary border-b-2' : ''
            }`}
          >
            <Text
              className={`font-body-semibold text-base ${
                isActive
                  ? 'text-primary dark:text-primary-T60'
                  : 'text-neutral-T40 dark:text-neutral-T60'
              }`}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
