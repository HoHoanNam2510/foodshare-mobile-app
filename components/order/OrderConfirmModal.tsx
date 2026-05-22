// components/order/OrderConfirmModal.tsx
import { MaterialIcons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import type { IPostDetail } from '@/lib/postApi';
import type { IUserVoucher, IVoucher } from '@/lib/voucherApi';

interface OrderConfirmModalProps {
  visible: boolean;
  post: IPostDetail;
  quantity: number;
  selectedVoucher: IUserVoucher | null;
  isSubmitting: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export default function OrderConfirmModal({
  visible,
  post,
  quantity,
  selectedVoucher,
  isSubmitting,
  onConfirm,
  onClose,
}: OrderConfirmModalProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const voucher = (selectedVoucher?.voucherId ?? null) as IVoucher | null;

  const { baseAmount, discountAmount, totalAmount, isOverDiscount } =
    useMemo(() => {
      const base = post.price * quantity;
      let discount = 0;
      if (voucher) {
        discount =
          voucher.discountType === 'PERCENTAGE'
            ? (base * voucher.discountValue) / 100
            : voucher.discountValue;
      }
      return {
        baseAmount: base,
        discountAmount: Math.min(discount, base),
        totalAmount: Math.max(0, base - discount),
        isOverDiscount: voucher !== null && discount >= base,
      };
    }, [post.price, quantity, voucher]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      {/* Dimmed overlay — tapping closes the modal */}
      <TouchableOpacity
        className="flex-1 bg-black/40"
        activeOpacity={1}
        onPress={onClose}
      />

      {/* Bottom sheet */}
      <View
        className="bg-neutral-T100 rounded-t-3xl px-6 pt-5"
        style={{ paddingBottom: Math.max(insets.bottom, 24) }}
      >
        {/* Drag handle */}
        <View className="bg-neutral-T80 mx-auto mb-4 h-1 w-10 rounded-full" />

        {/* Title */}
        <Text className="text-neutral-T10 font-sans text-xl font-extrabold">
          {t('voucher.orderConfirmTitle')}
        </Text>

        {/* Price breakdown */}
        <View className="mt-5 gap-3">
          <View className="flex-row items-center justify-between">
            <Text className="font-body text-neutral-T50 text-sm">
              {t('voucher.orderBasePrice')}
            </Text>
            <Text className="font-label text-neutral-T30 text-sm font-semibold">
              {baseAmount.toLocaleString('vi-VN')}đ
            </Text>
          </View>

          {voucher && (
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-1.5">
                <Text className="font-body text-neutral-T50 text-sm">
                  {t('voucher.orderDiscount')}
                </Text>
                <View className="bg-primary-T95 rounded-md px-2 py-0.5">
                  <Text className="text-primary-T30 font-label text-xs font-semibold">
                    {voucher.code}
                  </Text>
                </View>
              </View>
              <Text className="font-label text-primary-T30 text-sm font-semibold">
                -{discountAmount.toLocaleString('vi-VN')}đ
              </Text>
            </View>
          )}

          <View className="bg-neutral-T90 h-px" />

          <View className="flex-row items-center justify-between">
            <Text className="text-neutral-T10 font-sans text-base font-extrabold">
              {t('voucher.orderTotal')}
            </Text>
            <Text
              className="font-sans text-xl font-extrabold"
              style={{ color: '#944A00' }}
            >
              {totalAmount.toLocaleString('vi-VN')}đ
            </Text>
          </View>
        </View>

        {/* Over-discount warning */}
        {isOverDiscount && (
          <View
            className="mt-4 flex-row items-start gap-2 rounded-xl p-3"
            style={{
              backgroundColor: 'rgba(254,215,72,0.2)',
              borderWidth: 1,
              borderColor: '#F59E0B',
            }}
          >
            <MaterialIcons
              name="warning"
              size={16}
              color="#B45309"
              style={{ marginTop: 1 }}
            />
            <Text
              className="font-body flex-1 text-xs leading-4"
              style={{ color: '#B45309' }}
            >
              {t('voucher.orderOverdiscountWarning')}
            </Text>
          </View>
        )}

        {/* Action buttons */}
        <View className="mt-5 gap-3">
          <TouchableOpacity
            className="items-center justify-center rounded-2xl py-4"
            style={{ backgroundColor: '#944A00' }}
            onPress={onConfirm}
            disabled={isSubmitting}
            activeOpacity={0.85}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-neutral-T100 font-sans text-base font-black uppercase tracking-tight">
                {t('voucher.orderConfirmBtn')}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-neutral-T95 items-center justify-center rounded-2xl py-4"
            onPress={onClose}
            disabled={isSubmitting}
            activeOpacity={0.85}
          >
            <Text className="font-label text-neutral-T40 text-base font-semibold">
              {t('common.cancel')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
