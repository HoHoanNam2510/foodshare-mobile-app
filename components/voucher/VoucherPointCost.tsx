// components/voucher/VoucherPointCost.tsx
import React from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

interface VoucherPointCostProps {
  pointCost: number;
  canAfford?: boolean;
  userPoints?: number; // Dùng để tính số điểm còn thiếu
}

export default function VoucherPointCost({
  pointCost,
  canAfford = true,
  userPoints,
}: VoucherPointCostProps) {
  const { t } = useTranslation();
  const pointsNeeded =
    !canAfford && userPoints !== undefined
      ? pointCost - userPoints
      : 0;

  return (
    <View className="gap-0.5">
      <View className="flex-row items-center gap-1">
        <Text className="text-base">🍃</Text>
        <Text
          className={`font-label font-semibold text-sm ${
            canAfford ? 'text-primary-T40' : 'text-error'
          }`}
        >
          {pointCost.toLocaleString()} {t('voucher.pointsUnit')}
        </Text>
      </View>
      {!canAfford && pointsNeeded > 0 && (
        <Text className="font-label text-xs text-error">
          {t('voucher.pointsNeededFormat', { points: pointsNeeded.toLocaleString() })}
        </Text>
      )}
    </View>
  );
}
