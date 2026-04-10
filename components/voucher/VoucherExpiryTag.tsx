// components/voucher/VoucherExpiryTag.tsx
import React from 'react';
import { Text, View } from 'react-native';

interface VoucherExpiryTagProps {
  validUntil: string; // ISO date string
}

function getDaysUntilExpiry(validUntil: string): number {
  const now = new Date();
  const expiry = new Date(validUntil);
  const diffMs = expiry.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export default function VoucherExpiryTag({ validUntil }: VoucherExpiryTagProps) {
  const daysLeft = getDaysUntilExpiry(validUntil);
  const isExpiringSoon = daysLeft <= 3 && daysLeft > 0;
  const isExpired = daysLeft <= 0;

  const textColorClass = isExpired || isExpiringSoon ? 'text-error' : 'text-neutral-T50';

  return (
    <View className="flex-row items-center gap-1">
      {isExpiringSoon && (
        <Text className="text-xs">⚠️</Text>
      )}
      <Text className={`font-label text-xs ${textColorClass}`}>
        {isExpired
          ? 'Đã hết hạn'
          : `Hết hạn: ${formatDate(validUntil)}`}
      </Text>
      {isExpiringSoon && (
        <Text className="font-label text-xs text-error">
          (còn {daysLeft} ngày)
        </Text>
      )}
    </View>
  );
}
