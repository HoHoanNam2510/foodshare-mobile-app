import React, { ReactNode } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import BaseHeader from './BaseHeader';

interface ActionItem {
  icon: string;
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
  return (
    <BaseHeader>
      <View className="flex-row items-center justify-between flex-1">
        {/* Left: Back button (optional) + Title ExtraBold */}
        <View className="flex-row items-center gap-3 flex-1">
          {onBack && (
            <TouchableOpacity
              className="w-10 h-10 rounded-full bg-neutral-T95 items-center justify-center active:opacity-80"
              onPress={onBack}
            >
              <Feather name="arrow-left" size={20} color="#191C1C" />
            </TouchableOpacity>
          )}
          <Text
            className="text-xl flex-1"
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
              className="w-10 h-10 rounded-full bg-neutral-T95 items-center justify-center active:opacity-80"
              onPress={action.onPress}
            >
              <Feather name={action.icon as any} size={20} color="#191C1C" />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </BaseHeader>
  );
}
