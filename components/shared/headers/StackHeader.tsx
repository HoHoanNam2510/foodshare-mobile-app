import React, { ReactNode } from 'react';
import { useRouter } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import BaseHeader from './BaseHeader';

interface StackHeaderProps {
  title: string;
  rightElement?: ReactNode;
  onBack?: () => void;
}

export default function StackHeader({
  title,
  rightElement,
  onBack,
}: StackHeaderProps) {
  const router = useRouter();

  return (
    <BaseHeader>
      <View className="flex-1 flex-row items-center justify-between">
        {/* Left: Back Button */}
        <TouchableOpacity
          className="bg-neutral-T95 h-10 w-10 items-center justify-center rounded-full active:opacity-80"
          onPress={() => (onBack ? onBack() : router.back())}
        >
          <Feather name="arrow-left" size={20} color="#191C1C" />
        </TouchableOpacity>

        {/* Center: Title */}
        <Text
          className="flex-1 text-center text-lg"
          style={{ fontFamily: 'Epilogue', fontWeight: '700' }}
          numberOfLines={1}
        >
          {title}
        </Text>

        {/* Right: Optional Element */}
        <View className="flex-row items-center">
          {rightElement || (
            <View className="h-10 w-10" /> // Spacer for alignment
          )}
        </View>
      </View>
    </BaseHeader>
  );
}
