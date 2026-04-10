// components/voucher/VoucherDiscountBadge.tsx
import React from 'react';
import { Text, View } from 'react-native';

interface VoucherDiscountBadgeProps {
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  size?: 'sm' | 'md' | 'lg';
}

export default function VoucherDiscountBadge({
  discountType,
  discountValue,
  size = 'md',
}: VoucherDiscountBadgeProps) {
  const isPercentage = discountType === 'PERCENTAGE';

  // Format display value
  const displayValue = isPercentage
    ? `${discountValue}%`
    : discountValue >= 1000
    ? `-${(discountValue / 1000).toFixed(0)}K`
    : `-${discountValue.toLocaleString('vi-VN')}đ`;

  // Size variants
  const paddingClass =
    size === 'sm'
      ? 'px-2 py-0.5'
      : size === 'lg'
      ? 'px-5 py-3'
      : 'px-3 py-1.5';

  const textClass =
    size === 'sm'
      ? 'text-xs'
      : size === 'lg'
      ? 'text-3xl'
      : 'text-sm';

  // Color: PERCENTAGE = green, FIXED_AMOUNT = orange
  const bgClass = isPercentage ? 'bg-primary-T90' : 'bg-secondary-T90';
  const colorClass = isPercentage ? 'text-primary-T10' : 'text-secondary-T10';

  return (
    <View className={`${bgClass} ${paddingClass} rounded-lg self-start`}>
      <Text className={`font-sans font-bold ${textClass} ${colorClass}`}>
        {displayValue}
      </Text>
    </View>
  );
}
