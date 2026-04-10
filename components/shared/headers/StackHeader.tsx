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

export default function StackHeader({ title, rightElement, onBack }: StackHeaderProps) {
  const router = useRouter();

  return (
    <BaseHeader>
      <View className="flex-row items-center justify-between flex-1">
        {/* Left: Back Button */}
        <TouchableOpacity
          className="w-10 h-10 rounded-full bg-neutral-T95 items-center justify-center active:opacity-80"
          onPress={() => (onBack ? onBack() : router.back())}
        >
          <Feather name="arrow-left" size={20} color="#191C1C" />
        </TouchableOpacity>

        {/* Center: Title */}
        <Text
          className="text-lg flex-1 text-center"
          style={{ fontFamily: 'Epilogue', fontWeight: '700' }}
          numberOfLines={1}
        >
          {title}
        </Text>

        {/* Right: Optional Element */}
        <View className="flex-row items-center">
          {rightElement || (
            <View className="w-10 h-10" /> // Spacer for alignment
          )}
        </View>
      </View>
    </BaseHeader>
  );
}
