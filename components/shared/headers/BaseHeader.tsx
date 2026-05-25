import React, { ReactNode } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface BaseHeaderProps {
  children: ReactNode;
  className?: string;
}

export default function BaseHeader({
  children,
  className = '',
}: BaseHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className={`bg-neutral-T100 dark:bg-neutral-T20 dark:border-neutral-T30 shadow-sm dark:border-b dark:shadow-none ${className}`}
      style={{ paddingTop: insets.top }}
    >
      <View className="flex-row items-center px-4 py-3">{children}</View>
    </View>
  );
}
