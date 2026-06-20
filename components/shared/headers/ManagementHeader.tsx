import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useThemeColors } from '@/lib/hooks/useThemeColors';
import BaseHeader from './BaseHeader';

type FeatherIconName = React.ComponentProps<typeof Feather>['name'];

interface ActionItem {
  icon: FeatherIconName;
  onPress: () => void;
}

interface ManagementHeaderProps {
  title: string;
  actions?: ActionItem[];
  onBack?: () => void;
}

export default function ManagementHeader({
  title,
  actions = [],
  onBack,
}: ManagementHeaderProps) {
  const colors = useThemeColors();

  return (
    <BaseHeader>
      <View className="flex-1 flex-row items-center justify-between">
        {/* Left: Back button (optional) + Title ExtraBold */}
        <View className="flex-1 flex-row items-center gap-3">
          {onBack && (
            <TouchableOpacity
              className="bg-neutral-T95 dark:bg-neutral-T30 h-10 w-10 items-center justify-center rounded-full active:opacity-80"
              onPress={onBack}
            >
              <Feather name="arrow-left" size={20} color={colors.textPrimary} />
            </TouchableOpacity>
          )}
          <Text
            className="text-neutral-T10 dark:text-neutral-T90 flex-1 text-xl"
            style={{ fontFamily: 'Epilogue', fontWeight: '800' }}
            numberOfLines={1}
          >
            {title}
          </Text>
        </View>

        {/* Right: Actions */}
        <View className="flex-row items-center gap-2">
          {actions.map((action, index) => (
            <TouchableOpacity
              key={index}
              className="bg-neutral-T95 dark:bg-neutral-T30 h-10 w-10 items-center justify-center rounded-full active:opacity-80"
              onPress={action.onPress}
            >
              <Feather
                name={action.icon}
                size={20}
                color={colors.textPrimary}
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </BaseHeader>
  );
}
