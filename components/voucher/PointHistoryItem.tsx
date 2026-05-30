// components/voucher/PointHistoryItem.tsx
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import type { IPointLog } from '@/lib/greenPointApi';

interface PointHistoryItemProps {
  log: IPointLog;
}

function formatDateTime(iso: string, locale: string): string {
  return new Date(iso).toLocaleString(locale === 'vi' ? 'vi-VN' : 'en-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

type TFunction = (key: string, opts?: Record<string, unknown>) => string;

function translateReason(reason: string, t: TFunction): string {
  if (reason === 'Hoàn tất giao dịch P2P — Người nhận')
    return t('voucher.reasonP2PReceiver');
  if (reason === 'Hoàn tất giao dịch P2P — Người chia sẻ')
    return t('voucher.reasonP2PSharer');
  if (reason === 'Hoàn tất giao dịch B2C — Người nhận')
    return t('voucher.reasonB2CReceiver');
  if (reason === 'Hoàn tất giao dịch B2C — Người chia sẻ')
    return t('voucher.reasonB2CSharer');
  if (reason === 'Đổi điểm lấy Voucher')
    return t('voucher.reasonVoucherRedeem');
  if (reason === 'Thưởng điểm vì đã để lại đánh giá giao dịch')
    return t('voucher.reasonReviewBonus');
  if (reason.startsWith('Mở khóa huy hiệu:')) {
    const badgeName = reason.replace('Mở khóa huy hiệu:', '').trim();
    return `${t('voucher.reasonBadgeUnlock')}: ${badgeName}`;
  }
  return reason;
}

export default function PointHistoryItem({ log }: PointHistoryItemProps) {
  const isPositive = log.amount > 0;
  const { t, i18n } = useTranslation();

  return (
    <View className="bg-neutral-T100 dark:bg-neutral-T20 flex-row items-center gap-3 rounded-xl px-4 py-3">
      {/* Icon */}
      <View
        className="h-10 w-10 items-center justify-center rounded-full"
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
        <Text
          className="font-label text-neutral-T10 dark:text-neutral-T90 text-sm font-semibold"
          numberOfLines={2}
        >
          {translateReason(log.reason, t as TFunction)}
        </Text>
        <Text className="font-label text-neutral-T50 dark:text-neutral-T60 text-xs">
          {formatDateTime(log.createdAt, i18n.language)}
        </Text>
      </View>

      {/* Amount */}
      <Text
        className={`font-sans text-base font-bold ${
          isPositive ? 'text-primary-T40' : 'text-error'
        }`}
      >
        {isPositive ? '+' : ''}
        {log.amount.toLocaleString()}
      </Text>
    </View>
  );
}
