import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';

interface SectionIncompleteBadgeProps {
  message?: string;
}

export default function SectionIncompleteBadge({
  message = 'Incomplete — please update',
}: SectionIncompleteBadgeProps) {
  return (
    <View className="flex-row items-center gap-2 bg-secondary-T95 rounded-lg px-3 py-2">
      <MaterialIcons name="info-outline" size={16} color="#944A00" />
      <Text className="font-label text-xs font-semibold text-secondary-T40 flex-1">
        {message}
      </Text>
    </View>
  );
}
