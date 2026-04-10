// components/voucher/PointHistoryItem.tsx
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';

import type { IPointLog } from '@/lib/greenPointApi';

interface PointHistoryItemProps {
  log: IPointLog;
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function PointHistoryItem({ log }: PointHistoryItemProps) {
  const isPositive = log.amount > 0;

  return (
    <View className="flex-row items-center gap-3 py-3 px-4 bg-neutral-T100 rounded-xl">
      {/* Icon */}
      <View
        className="w-10 h-10 rounded-full items-center justify-center"
        style={{
          backgroundColor: isPositive
            ? 'rgba(66,134,58,0.1)'
            : 'rgba(186,26,26,0.1)',
        }}
      >
        <MaterialIcons
          name={isPositive ? 'arrow-upward' : 'arrow-downward'}
          size={20}
          color={isPositive ? '#296C24' : '#ba1a1a'}
        />
      </View>

      {/* Reason + Date */}
      <View className="flex-1 gap-0.5">
        <Text className="font-label font-semibold text-sm text-neutral-T10" numberOfLines={2}>
          {log.reason}
        </Text>
        <Text className="font-label text-xs text-neutral-T50">
          {formatDateTime(log.createdAt)}
        </Text>
      </View>

      {/* Amount */}
      <Text
        className={`font-sans font-bold text-base ${
          isPositive ? 'text-primary-T40' : 'text-error'
        }`}
      >
        {isPositive ? '+' : ''}{log.amount.toLocaleString()}
      </Text>
    </View>
  );
}
