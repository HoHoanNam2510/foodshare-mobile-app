// components/voucher/VoucherStatusBadge.tsx
import React from 'react';
import { Text, View } from 'react-native';

interface VoucherStatusBadgeProps {
  status: 'UNUSED' | 'USED' | 'EXPIRED';
}

const STATUS_CONFIG = {
  UNUSED: {
    bgColor: '#ABF59C',   // primary-T90
    textColor: '#002201', // primary-T10
    label: 'Chưa dùng',
  },
  USED: {
    bgColor: '#E1E3E2',   // neutral-T90
    textColor: '#5C5F5E', // neutral-T40
    label: 'Đã dùng',
  },
  EXPIRED: {
    bgColor: 'rgba(186,26,26,0.12)', // error tint
    textColor: '#ba1a1a',            // error
    label: 'Hết hạn',
  },
};

export default function VoucherStatusBadge({ status }: VoucherStatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <View
      className="px-3 py-1 rounded-full self-start"
      style={{ backgroundColor: config.bgColor }}
    >
      <Text
        className="font-label text-xs font-semibold"
        style={{ color: config.textColor }}
      >
        {config.label}
      </Text>
    </View>
  );
}
