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
  onPress,
}: VoucherCardProps) {
  const canAfford =
    userGreenPoints !== undefined
      ? userGreenPoints >= voucher.pointCost
      : true;

  const usedCount = voucher.totalQuantity - voucher.remainingQuantity;

  return (
    <TouchableOpacity
      onPress={() => onPress?.(voucher._id)}
      activeOpacity={onPress ? 0.85 : 1}
      style={styles.card}
      className="bg-neutral-T100 rounded-2xl overflow-hidden mb-3"
    >
      {/* ── Thanh màu bên trái ── */}
      <View
        className="absolute left-0 top-0 bottom-0 w-1"
        style={{
          backgroundColor:
            voucher.discountType === 'PERCENTAGE' ? '#42863A' : '#B95F03',
        }}
      />

      <View className="pl-4 pr-4 pt-4 pb-4 ml-1">
        {/* ── Row 1: Badge + Code ── */}
        <View className="flex-row items-start justify-between gap-2">
          <VoucherDiscountBadge
            discountType={voucher.discountType}
            discountValue={voucher.discountValue}
            size="sm"
          />
          <Text className="font-label text-xs text-neutral-T50 font-semibold tracking-wider">
            {voucher.code}
          </Text>
        </View>

        {/* ── Row 2: Title ── */}
        <Text
          className="font-sans font-bold text-base text-neutral-T10 mt-2"
          numberOfLines={1}
        >
          {voucher.title}
        </Text>

        {/* ── Row 3: Description (chỉ market mode) ── */}
        {viewMode === 'market' && voucher.description && (
          <Text
            className="font-body text-xs text-neutral-T50 mt-1 leading-4"
            numberOfLines={2}
          >
            {voucher.description}
          </Text>
        )}

        {/* ── Divider ── */}
        <View className="h-px bg-neutral-T90 my-3" />

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
            <Text className="font-label text-xs text-neutral-T50">
              {usedCount}/{voucher.totalQuantity} đã được đổi
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
              className={`self-start px-2 py-0.5 rounded-full ${
                voucher.isActive ? 'bg-primary-T95' : 'bg-neutral-T90'
              }`}
            >
              <Text
                className={`font-label text-xs font-semibold ${
                  voucher.isActive ? 'text-primary-T30' : 'text-neutral-T50'
                }`}
              >
                {voucher.isActive ? 'ACTIVE' : 'INACTIVE'}
              </Text>
            </View>
          )}
        </View>

        {/* ── Action Row ── */}
        <View className="mt-3">
          {viewMode === 'market' && (
            <TouchableOpacity
              className={`h-11 rounded-xl items-center justify-center ${
                canAfford
                  ? 'bg-primary-T40'
                  : 'bg-neutral-T90'
              }`}
              onPress={() => canAfford && onRedeemPress?.(voucher)}
              disabled={!canAfford}
              activeOpacity={0.85}
            >
              <Text
                className={`font-label font-semibold text-sm ${
                  canAfford ? 'text-neutral-T100' : 'text-neutral-T50'
                }`}
              >
                {canAfford ? 'Đổi ngay' : 'Không đủ điểm'}
              </Text>
            </TouchableOpacity>
          )}

          {viewMode === 'wallet' && (
            <TouchableOpacity
              className="h-11 rounded-xl bg-neutral-T95 border border-neutral-T80 items-center justify-center"
              onPress={() => onPress?.(voucher._id)}
              activeOpacity={0.8}
            >
              <Text className="font-label font-semibold text-sm text-neutral-T40">
                Xem chi tiết
              </Text>
            </TouchableOpacity>
          )}

          {viewMode === 'store-manage' && (
            <View className="flex-row gap-3 items-center">
              {/* Toggle */}
              <View className="flex-row items-center gap-2 flex-1">
                <Switch
                  value={voucher.isActive}
                  onValueChange={() => onToggleActive?.(voucher._id)}
                  trackColor={{ false: '#C5C7C6', true: '#90D882' }}
                  thumbColor={voucher.isActive ? '#296C24' : '#AAABAB'}
                />
                <Text className="font-label text-xs text-neutral-T50">
                  {voucher.isActive ? 'Đang bật' : 'Đã tắt'}
                </Text>
              </View>

              {/* Edit button */}
              <TouchableOpacity
                className="flex-row items-center gap-1 h-10 px-4 rounded-xl bg-secondary-T95 border border-secondary-T80"
                onPress={() => onEditPress?.(voucher._id)}
                activeOpacity={0.8}
              >
                <MaterialIcons name="edit" size={14} color="#944A00" />
                <Text className="font-label font-semibold text-xs text-secondary-T40">
                  Chỉnh sửa
                </Text>
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
