// components/voucher/RedeemConfirmModal.tsx
import React from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import type { IVoucher } from '@/lib/voucherApi';
import VoucherDiscountBadge from './VoucherDiscountBadge';

interface RedeemConfirmModalProps {
  visible: boolean;
  voucher: IVoucher | null;
  userCurrentPoints: number;
  isLoading: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export default function RedeemConfirmModal({
  visible,
  voucher,
  userCurrentPoints,
  isLoading,
  onConfirm,
  onClose,
}: RedeemConfirmModalProps) {
  if (!voucher) return null;

  const pointsAfter = Math.max(0, userCurrentPoints - voucher.pointCost);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        onPress={isLoading ? undefined : onClose}
      >
        <Pressable onPress={(e) => e.stopPropagation()}>
          <View
            className="bg-neutral-T100 rounded-3xl mx-6 p-6 gap-5"
            style={{ minWidth: 300, maxWidth: 360 }}
          >
            {/* Title */}
            <Text className="font-sans font-bold text-xl text-neutral-T10 text-center">
              Xác nhận đổi điểm
            </Text>

            {/* Voucher Info */}
            <View className="items-center gap-3">
              <VoucherDiscountBadge
                discountType={voucher.discountType}
                discountValue={voucher.discountValue}
                size="lg"
              />
              <Text className="font-sans font-bold text-base text-neutral-T10 text-center">
                {voucher.code} — {voucher.title}
              </Text>
            </View>

            {/* Points Summary */}
            <View className="bg-neutral-T95 rounded-2xl p-4 gap-2">
              <View className="flex-row items-center justify-between">
                <Text className="font-label text-sm text-neutral-T50">
                  Bạn sẽ dùng:
                </Text>
                <View className="flex-row items-center gap-1">
                  <Text className="text-sm">🍃</Text>
                  <Text className="font-label font-semibold text-sm text-error">
                    {voucher.pointCost.toLocaleString()} điểm
                  </Text>
                </View>
              </View>
              <View className="h-px bg-neutral-T90" />
              <View className="flex-row items-center justify-between">
                <Text className="font-label text-sm text-neutral-T50">
                  Điểm còn lại:
                </Text>
                <View className="flex-row items-center gap-1">
                  <Text className="text-sm">🍃</Text>
                  <Text className="font-label font-semibold text-sm text-primary-T40">
                    {pointsAfter.toLocaleString()} điểm
                  </Text>
                </View>
              </View>
            </View>

            {/* Actions */}
            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 h-12 rounded-xl bg-neutral-T95 border border-neutral-T80 items-center justify-center"
                onPress={onClose}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                <Text className="font-label font-semibold text-neutral-T40">
                  Huỷ
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 h-12 rounded-xl bg-primary-T40 items-center justify-center"
                onPress={onConfirm}
                disabled={isLoading}
                activeOpacity={0.85}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="font-label font-semibold text-neutral-T100">
                    Xác nhận đổi
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
