// components/voucher/VoucherQuantityBar.tsx
import React from 'react';
import { Text, View } from 'react-native';

interface VoucherQuantityBarProps {
  remainingQuantity: number;
  totalQuantity: number;
  showText?: boolean;
}

export default function VoucherQuantityBar({
  remainingQuantity,
  totalQuantity,
  showText = true,
}: VoucherQuantityBarProps) {
  const percentage =
    totalQuantity > 0
      ? Math.max(0, Math.min(100, (remainingQuantity / totalQuantity) * 100))
      : 0;

  // Màu theo % còn lại: xanh >50%, vàng 20-50%, đỏ <20%
  const barColor =
    percentage > 50
      ? '#42863A'      // primary-T50 (xanh lá)
      : percentage > 20
      ? '#B95F03'      // secondary-T50 (cam/vàng)
      : '#ba1a1a';     // error (đỏ)

  return (
    <View className="gap-1">
      {showText && (
        <Text className="font-label text-xs text-neutral-T50">
          Còn {remainingQuantity}/{totalQuantity}
        </Text>
      )}
      <View className="h-1.5 bg-neutral-T90 rounded-full overflow-hidden">
        <View
          className="h-full rounded-full"
          style={{
            width: `${percentage}%`,
            backgroundColor: barColor,
          }}
        />
      </View>
    </View>
  );
}
