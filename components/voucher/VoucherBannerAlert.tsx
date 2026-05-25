// components/voucher/VoucherBannerAlert.tsx
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { IUserVoucher, IVoucher } from '@/lib/voucherApi';

interface VoucherBannerAlertProps {
  vouchers: IUserVoucher[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  baseAmount?: number;
}

export default function VoucherBannerAlert({
  vouchers,
  selectedId,
  onSelect,
  baseAmount,
}: VoucherBannerAlertProps) {
  const { t } = useTranslation();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [expanded, setExpanded] = useState(false);

  // Normalize discount to absolute VNĐ value before comparing so that
  // PERCENTAGE and FIXED_AMOUNT vouchers rank on equal footing.
  const effectiveDiscount = (v: IVoucher | null): number => {
    if (!v) return 0;
    if (v.discountType === 'PERCENTAGE' && baseAmount) {
      return (baseAmount * v.discountValue) / 100;
    }
    return v.discountValue;
  };

  const sorted = [...vouchers].sort((a, b) => {
    const av = a.voucherId as IVoucher | null;
    const bv = b.voucherId as IVoucher | null;
    return effectiveDiscount(bv) - effectiveDiscount(av);
  });

  const bestVoucher = (sorted[0]?.voucherId ?? null) as IVoucher | null;
  if (!bestVoucher) return null;

  const selectedUv = vouchers.find((v) => v._id === selectedId) ?? null;
  const selectedVoucher = (selectedUv?.voucherId ?? null) as IVoucher | null;

  const isSelected = selectedId !== null && selectedVoucher !== null;
  const hasMultiple = vouchers.length > 1;

  const formatDiscount = (v: IVoucher) =>
    v.discountType === 'PERCENTAGE'
      ? `${v.discountValue}%`
      : `${v.discountValue.toLocaleString('vi-VN')}đ`;

  const formatBadge = (v: IVoucher) =>
    v.discountType === 'PERCENTAGE'
      ? `-${v.discountValue}%`
      : `-${(v.discountValue / 1000).toFixed(0)}K`;

  return (
    <View
      className="overflow-hidden rounded-2xl"
      style={{
        backgroundColor: isSelected
          ? isDark
            ? '#003A03'
            : '#E8F5E2'
          : isDark
            ? '#001A01'
            : '#F0FAF0',
        borderWidth: 1.5,
        borderColor: isSelected
          ? isDark
            ? '#5CA051'
            : '#296C24'
          : isDark
            ? '#42863A'
            : '#90D882',
      }}
    >
      {/* ── Compact header row ── */}
      <View className="flex-row items-center gap-3 px-4 py-3">
        <View className="bg-primary-T40 h-9 w-9 items-center justify-center rounded-xl">
          <MaterialIcons name="local-offer" size={18} color="#fff" />
        </View>

        <View className="flex-1">
          <Text className="text-primary-T20 dark:text-primary-T80 font-sans text-sm font-bold">
            {isSelected
              ? t('voucher.bannerApplied')
              : t('voucher.bannerAvailable', { count: vouchers.length })}
          </Text>
          <Text className="text-primary-T30 dark:text-primary-T60 mt-0.5 text-xs">
            {isSelected && selectedVoucher
              ? `${selectedVoucher.code} · -${formatDiscount(selectedVoucher)}`
              : t('voucher.bannerBestDiscount', {
                  discount: formatDiscount(bestVoucher),
                })}
          </Text>
        </View>

        {/* Action buttons */}
        {isSelected ? (
          <View className="flex-row items-center gap-1.5">
            <TouchableOpacity
              onPress={() => {
                onSelect(null);
                setExpanded(false);
              }}
              className="bg-primary-T95 dark:bg-primary-T20 border-primary-T80 dark:border-primary-T40 rounded-xl border px-3 py-2"
              activeOpacity={0.7}
            >
              <Text className="text-primary-T30 dark:text-primary-T80 font-label text-xs font-semibold">
                {t('voucher.bannerDeselect')}
              </Text>
            </TouchableOpacity>
            {hasMultiple && (
              <TouchableOpacity
                onPress={() => setExpanded((v) => !v)}
                className="bg-primary-T95 dark:bg-primary-T20 border-primary-T80 dark:border-primary-T40 h-8 w-8 items-center justify-center rounded-xl border"
                activeOpacity={0.7}
              >
                <Ionicons
                  name={expanded ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color={isDark ? '#5CA051' : '#296C24'}
                />
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View className="flex-row items-center gap-1.5">
            {!hasMultiple && (
              <TouchableOpacity
                onPress={() => onSelect(sorted[0]._id)}
                className="bg-primary-T40 rounded-xl px-3 py-2"
                activeOpacity={0.8}
              >
                <Text className="text-neutral-T100 font-label text-xs font-semibold">
                  {t('voucher.bannerApplyNow')}
                </Text>
              </TouchableOpacity>
            )}
            {hasMultiple && (
              <TouchableOpacity
                onPress={() => setExpanded((v) => !v)}
                className="bg-primary-T40 flex-row items-center gap-1 rounded-xl px-3 py-2"
                activeOpacity={0.8}
              >
                <Text className="text-neutral-T100 font-label text-xs font-semibold">
                  {t('voucher.bannerChoose')}
                </Text>
                <Ionicons
                  name={expanded ? 'chevron-up' : 'chevron-down'}
                  size={13}
                  color="#fff"
                />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* ── Expanded voucher list ── */}
      {expanded && (
        <View
          className="gap-2 px-3 pb-3 pt-2"
          style={{
            borderTopWidth: 1,
            borderTopColor: isDark ? '#0A530C' : '#C8EFC0',
          }}
        >
          {sorted.map((uv) => {
            const v = uv.voucherId as IVoucher | null;
            if (!v) return null;
            const isCurrent = uv._id === selectedId;

            return (
              <TouchableOpacity
                key={uv._id}
                className={`flex-row items-center rounded-xl border p-3 ${
                  isCurrent
                    ? 'border-primary-T40 bg-primary-T95 dark:bg-primary-T20 dark:border-primary-T50'
                    : 'dark:border-neutral-T30 dark:bg-neutral-T20 border-gray-200 bg-white'
                }`}
                onPress={() => {
                  onSelect(isCurrent ? null : uv._id);
                  setExpanded(false);
                }}
                activeOpacity={0.75}
              >
                {/* Discount badge */}
                <View className="bg-primary-T40 mr-3 min-w-[44px] items-center rounded-lg px-2 py-1.5">
                  <Text className="text-neutral-T100 font-label text-xs font-bold">
                    {formatBadge(v)}
                  </Text>
                </View>

                {/* Info */}
                <View className="flex-1">
                  <Text
                    className="text-neutral-T10 dark:text-neutral-T90 text-sm font-semibold"
                    numberOfLines={1}
                  >
                    {v.title}
                  </Text>
                  <Text className="text-neutral-T50 dark:text-neutral-T60 text-[11px]">
                    {v.code}
                  </Text>
                </View>

                {/* Status */}
                {isCurrent ? (
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={isDark ? '#5CA051' : '#296C24'}
                  />
                ) : (
                  <View className="bg-primary-T95 dark:bg-primary-T20 border-primary-T80 dark:border-primary-T40 rounded-lg border px-2.5 py-1">
                    <Text className="text-primary-T30 dark:text-primary-T80 font-label text-xs font-semibold">
                      {t('voucher.bannerApplyNow')}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
}
