// components/voucher/VoucherCard.tsx
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

import type { IVoucher } from '@/lib/voucherApi';
import VoucherDiscountBadge from './VoucherDiscountBadge';
import VoucherExpiryTag from './VoucherExpiryTag';
import VoucherPointCost from './VoucherPointCost';
import VoucherQuantityBar from './VoucherQuantityBar';
import VoucherStatusBadge from './VoucherStatusBadge';
import { useTranslation } from 'react-i18next';

type VoucherCardViewMode = 'market' | 'wallet' | 'store-manage';

interface VoucherCardProps {
  // Dữ liệu chung
  voucher: IVoucher;
  viewMode: VoucherCardViewMode;

  // viewMode="market"
  userGreenPoints?: number;
  onRedeemPress?: (voucher: IVoucher) => void;

  // viewMode="wallet"
  userVoucherStatus?: 'UNUSED' | 'USED' | 'EXPIRED';

  // viewMode="store-manage"
  onToggleActive?: (voucherId: string) => void;
  onEditPress?: (voucherId: string) => void;
  onDeletePress?: (voucherId: string) => void;

  // Callback chung — nhấn vào card
  onPress?: (voucherId: string) => void;
}

export default function VoucherCard({
  voucher,
  viewMode,
  userGreenPoints,
  onRedeemPress,
  userVoucherStatus,
  onToggleActive,
  onEditPress,
  onDeletePress,
  onPress,
}: VoucherCardProps) {
  const { t } = useTranslation();
  const canAfford =
    userGreenPoints !== undefined ? userGreenPoints >= voucher.pointCost : true;

  const usedCount = voucher.totalQuantity - voucher.remainingQuantity;

  return (
    <TouchableOpacity
      onPress={() => onPress?.(voucher._id)}
      activeOpacity={onPress ? 0.85 : 1}
      style={styles.card}
      className="bg-neutral-T100 mb-3 overflow-hidden rounded-2xl"
    >
      {/* ── Thanh màu bên trái ── */}
      <View
        className="absolute bottom-0 left-0 top-0 w-1"
        style={{
          backgroundColor:
            voucher.discountType === 'PERCENTAGE' ? '#42863A' : '#B95F03',
        }}
      />

      <View className="ml-1 pb-4 pl-4 pr-4 pt-4">
        {/* ── Row 1: Badge + Code ── */}
        <View className="flex-row items-start justify-between gap-2">
          <VoucherDiscountBadge
            discountType={voucher.discountType}
            discountValue={voucher.discountValue}
            size="sm"
          />
          <Text className="font-label text-neutral-T50 text-xs font-semibold tracking-wider">
            {voucher.code}
          </Text>
        </View>

        {/* ── Row 2: Title ── */}
        <Text
          className="text-neutral-T10 mt-2 font-sans text-base font-bold"
          numberOfLines={1}
        >
          {voucher.title}
        </Text>

        {/* ── Row 3: Description (chỉ market mode) ── */}
        {viewMode === 'market' && voucher.description && (
          <Text
            className="font-body text-neutral-T50 mt-1 text-xs leading-4"
            numberOfLines={2}
          >
            {voucher.description}
          </Text>
        )}

        {/* ── Divider ── */}
        <View className="bg-neutral-T90 my-3 h-px" />

        {/* ── Bottom Info Row ── */}
        <View className="gap-2">
          {/* Point Cost */}
          <VoucherPointCost
            pointCost={voucher.pointCost}
            canAfford={canAfford}
            userPoints={userGreenPoints}
          />

          {/* Quantity Bar — chỉ market & store-manage */}
          {(viewMode === 'market' || viewMode === 'store-manage') && (
            <VoucherQuantityBar
              remainingQuantity={voucher.remainingQuantity}
              totalQuantity={voucher.totalQuantity}
              showText={true}
            />
          )}

          {/* Store-manage: X/Y đã dùng label */}
          {viewMode === 'store-manage' && (
            <Text className="font-label text-neutral-T50 text-xs">
              {t('voucher.redeemedCountFormat', {
                used: usedCount,
                total: voucher.totalQuantity,
              })}
            </Text>
          )}

          {/* Expiry Tag */}
          <VoucherExpiryTag validUntil={voucher.validUntil} />

          {/* Status Badge — chỉ wallet & store-manage */}
          {viewMode === 'wallet' && userVoucherStatus && (
            <VoucherStatusBadge status={userVoucherStatus} />
          )}

          {/* Store Active Badge */}
          {viewMode === 'store-manage' && (
            <View
              className={`self-start rounded-full px-2 py-0.5 ${
                voucher.isActive ? 'bg-primary-T95' : 'bg-neutral-T90'
              }`}
            >
              <Text
                className={`font-label text-xs font-semibold ${
                  voucher.isActive ? 'text-primary-T30' : 'text-neutral-T50'
                }`}
              >
                {voucher.isActive
                  ? t('voucher.activeBadge')
                  : t('voucher.inactiveBadge')}
              </Text>
            </View>
          )}
        </View>

        {/* ── Action Row ── */}
        <View className="mt-3">
          {viewMode === 'market' && (
            <TouchableOpacity
              className={`h-11 items-center justify-center rounded-xl ${
                canAfford ? 'bg-primary-T40' : 'bg-neutral-T90'
              }`}
              onPress={() => canAfford && onRedeemPress?.(voucher)}
              disabled={!canAfford}
              activeOpacity={0.85}
            >
              <Text
                className={`font-label text-sm font-semibold ${
                  canAfford ? 'text-neutral-T100' : 'text-neutral-T50'
                }`}
              >
                {canAfford
                  ? t('voucher.redeemNowBtn')
                  : t('voucher.notEnoughPointsShortBtn')}
              </Text>
            </TouchableOpacity>
          )}

          {viewMode === 'wallet' && (
            <TouchableOpacity
              className="bg-neutral-T95 border-neutral-T80 h-11 items-center justify-center rounded-xl border"
              onPress={() => onPress?.(voucher._id)}
              activeOpacity={0.8}
            >
              <Text className="font-label text-neutral-T40 text-sm font-semibold">
                {t('voucher.viewDetailsBtn')}
              </Text>
            </TouchableOpacity>
          )}

          {viewMode === 'store-manage' && (
            <View className="flex-row items-center gap-3">
              {/* Toggle */}
              <View className="flex-1 flex-row items-center gap-2">
                <Switch
                  value={voucher.isActive}
                  onValueChange={() => onToggleActive?.(voucher._id)}
                  trackColor={{ false: '#C5C7C6', true: '#90D882' }}
                  thumbColor={voucher.isActive ? '#296C24' : '#AAABAB'}
                />
                <Text className="font-label text-neutral-T50 text-xs">
                  {voucher.isActive
                    ? t('voucher.activeStatus')
                    : t('voucher.inactiveStatus')}
                </Text>
              </View>

              {/* Edit button */}
              <TouchableOpacity
                className="bg-secondary-T95 border-secondary-T80 h-10 flex-row items-center gap-1 rounded-xl border px-4"
                onPress={() => onEditPress?.(voucher._id)}
                activeOpacity={0.8}
              >
                <MaterialIcons name="edit" size={14} color="#944A00" />
                <Text className="font-label text-secondary-T40 text-xs font-semibold">
                  {t('voucher.editBtn')}
                </Text>
              </TouchableOpacity>

              {/* Delete button */}
              <TouchableOpacity
                className="h-10 w-10 items-center justify-center rounded-xl"
                style={{ backgroundColor: 'rgba(220,38,38,0.08)' }}
                onPress={() => onDeletePress?.(voucher._id)}
                activeOpacity={0.8}
              >
                <MaterialIcons
                  name="delete-outline"
                  size={18}
                  color="#DC2626"
                />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
});
