import { MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

type EmptyVariant = 'no-data' | 'empty-range' | 'error';

interface EmptyStateProps {
  variant: EmptyVariant;
  title?: string;
  description?: string;
  onRetry?: () => void;
}

const variantConfig: Record<
  EmptyVariant,
  { icon: string; defaultTitle: string; defaultDescription: string }
> = {
  'no-data': {
    icon: 'assessment',
    defaultTitle: 'Chưa có dữ liệu',
    defaultDescription: 'Thống kê sẽ hiển thị khi bạn có giao dịch.',
  },
  'empty-range': {
    icon: 'date-range',
    defaultTitle: 'Không có dữ liệu trong khoảng thời gian này',
    defaultDescription: 'Thử chọn khoảng thời gian khác.',
  },
  error: {
    icon: 'error-outline',
    defaultTitle: 'Có lỗi xảy ra',
    defaultDescription: 'Không thể tải dữ liệu thống kê.',
  },
};

export default function EmptyState({
  variant,
  title,
  description,
  onRetry,
}: EmptyStateProps) {
  const config = variantConfig[variant];
  const { colorScheme } = useColorScheme();
  return (
    <View className="flex-1 items-center justify-center p-8">
      <MaterialIcons
        name={config.icon as any}
        size={48}
        color={colorScheme === 'dark' ? '#8F9190' : '#C5C7C6'}
      />
      <Text className="font-body-bold text-neutral-T30 dark:text-neutral-T80 mt-4 text-lg">
        {title || config.defaultTitle}
      </Text>
      <Text className="text-neutral-T50 dark:text-neutral-T60 mt-2 text-center text-sm">
        {description || config.defaultDescription}
      </Text>
      {variant === 'error' && onRetry && (
        <TouchableOpacity
          className="bg-primary dark:bg-primary-T50 mt-6 rounded-xl px-6 py-3"
          onPress={onRetry}
        >
          <Text className="font-body-semibold text-white">Thử lại</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
