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
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
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
            className="bg-neutral-T100 mx-6 gap-5 rounded-3xl p-6"
            style={{ minWidth: 300, maxWidth: 360 }}
          >
            {/* Title */}
            <Text className="text-neutral-T10 text-center font-sans text-xl font-bold">
              {t('voucher.redeemConfirmTitle')}
            </Text>

            {/* Voucher Info */}
            <View className="items-center gap-3">
              <VoucherDiscountBadge
                discountType={voucher.discountType}
                discountValue={voucher.discountValue}
                size="lg"
              />
              <Text className="text-neutral-T10 text-center font-sans text-base font-bold">
                {voucher.code} — {voucher.title}
              </Text>
            </View>

            {/* Points Summary */}
            <View className="bg-neutral-T95 gap-2 rounded-2xl p-4">
              <View className="flex-row items-center justify-between">
                <Text className="font-label text-neutral-T50 text-sm">
                  {t('voucher.youWillUse')}
                </Text>
                <View className="flex-row items-center gap-1">
                  <Text className="text-sm">🍃</Text>
                  <Text className="font-label text-error text-sm font-semibold">
                    {voucher.pointCost.toLocaleString()}{' '}
                    {t('voucher.pointsUnit')}
                  </Text>
                </View>
              </View>
              <View className="bg-neutral-T90 h-px" />
              <View className="flex-row items-center justify-between">
                <Text className="font-label text-neutral-T50 text-sm">
                  {t('voucher.pointsRemaining')}
                </Text>
                <View className="flex-row items-center gap-1">
                  <Text className="text-sm">🍃</Text>
                  <Text className="font-label text-primary-T40 text-sm font-semibold">
                    {pointsAfter.toLocaleString()} {t('voucher.pointsUnit')}
                  </Text>
                </View>
              </View>
            </View>

            {/* Actions */}
            <View className="flex-row gap-3">
              <TouchableOpacity
                className="bg-neutral-T95 border-neutral-T80 h-12 flex-1 items-center justify-center rounded-xl border"
                onPress={onClose}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                <Text className="font-label text-neutral-T40 font-semibold">
                  {t('common.cancel')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-primary-T40 h-12 flex-1 items-center justify-center rounded-xl"
                onPress={onConfirm}
                disabled={isLoading}
                activeOpacity={0.85}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="font-label text-neutral-T100 font-semibold">
                    {t('voucher.confirmRedeemBtn')}
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
