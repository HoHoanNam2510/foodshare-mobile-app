// components/shared/SectionLabel.tsx
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';

interface SectionLabelProps {
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  label: string;
}

export default function SectionLabel({ icon, label }: SectionLabelProps) {
  return (
    <View className="flex-row items-center gap-3 pt-2">
      <MaterialIcons name={icon} size={20} color="#296C24" />
      <Text className="font-sans font-bold text-base text-neutral-T10">{label}</Text>
    </View>
  );
}
