import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import StackHeader from '@/components/shared/headers/StackHeader';
import { getPostByIdApi, type IPostDetail } from '@/lib/postApi';
import { getPaymentQRApi } from '@/lib/paymentApi';
import { createOrderApi, type IPaymentInfo } from '@/lib/transactionApi';

const PAYMENT_TIMEOUT_SECONDS = 30 * 60; // 30 phút

export default function PaymentScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { postId, quantity: qtyStr, transactionId: resumeTxId } = useLocalSearchParams<{
    postId?: string;
    quantity?: string;
    transactionId?: string; // resume mode: đơn đã tạo, chỉ cần lấy lại QR
  }>();
  const quantity = Number(qtyStr) || 1;
  const isResumeMode = !!resumeTxId;

  const [post, setPost] = useState<IPostDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(resumeTxId ?? null);
  const [paymentInfo, setPaymentInfo] = useState<IPaymentInfo | null>(null);
  const [countdown, setCountdown] = useState(PAYMENT_TIMEOUT_SECONDS);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load post info (chỉ cần khi tạo đơn mới)
  useEffect(() => {
    if (!postId) return;
    (async () => {
      try {
        const res = await getPostByIdApi(postId);
        setPost(res.data);
      } catch (e) {
        Alert.alert(t('common.error'), e instanceof Error ? e.message : t('common.error'));
        router.back();
      } finally {
        if (!isResumeMode) setIsLoading(false);
      }
    })();
  }, [postId]);

  // Resume mode: lấy lại QR từ đơn đã có
  useEffect(() => {
    if (!resumeTxId) return;
    (async () => {
      try {
        const res = await getPaymentQRApi(resumeTxId);
        setPaymentInfo(res.data);
        // Tính countdown từ expiredAt thực tế
        if (res.data.expiredAt) {
          const remaining = Math.floor(
            (new Date(res.data.expiredAt).getTime() - Date.now()) / 1000
          );
          setCountdown(remaining > 0 ? remaining : 0);
        }
      } catch (e: any) {
        const msg = e?.response?.data?.message ?? t('common.error');
        Alert.alert(t('common.error'), msg, [{ text: 'OK', onPress: () => router.back() }]);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [resumeTxId]);

  // Countdown timer (bắt đầu sau khi có transactionId)
  useEffect(() => {
    if (!transactionId || countdown <= 0) return;

    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          Alert.alert(
            t('transaction.resultFailedTitle'),
            t('transaction.resultFailedSubtitle'),
            [{ text: 'OK', onPress: () => router.back() }]
          );
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [transactionId, countdown > 0]);

  const formatCountdown = useCallback((seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }, []);

  const handleCreateOrder = async () => {
    if (!post) return;
    setIsCreating(true);
    try {
      const res = await createOrderApi(post._id, quantity);
      setTransactionId(res.data._id);
      setPaymentInfo(res.data.paymentInfo);
    } catch (e) {
      Alert.alert(t('common.error'), e instanceof Error ? e.message : t('common.error'));
    } finally {
      setIsCreating(false);
    }
  };

  const handleDoneTransfer = () => {
    router.replace({
      pathname: '/(transaction)/payment-result',
      params: { transactionId: transactionId!, status: 'pending' },
    } as any);
  };

  const handleBack = () => {
    if (transactionId) {
      Alert.alert(
        t('transaction.exitPaymentTitle'),
        t('transaction.exitPaymentMsg'),
        [
          { text: t('transaction.stayBtn'), style: 'cancel' },
          {
            text: t('transaction.viewOrderBtn'),
            onPress: () =>
              router.replace({
                pathname: '/(transaction)/payment-result',
                params: { transactionId: transactionId!, status: 'pending' },
              } as any),
          },
        ]
      );
    } else {
      router.back();
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-neutral-DEFAULT">
        <StackHeader title={t('transaction.paymentTitle')} />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#296C24" />
        </View>
      </View>
    );
  }

  // Resume mode không cần post data để hiển thị QR
  if (!isResumeMode && !post) return null;

  const totalAmount = isResumeMode
    ? (paymentInfo?.amount ?? 0)
    : (post!.price * quantity);

  return (
    <View className="flex-1 bg-neutral-DEFAULT">
      <StackHeader title={t('transaction.paymentTitle')} onBack={handleBack} />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24, gap: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Order Summary */}
        <View className="bg-neutral-T100 rounded-2xl p-4 flex-row gap-3" style={styles.card}>
          {post?.images?.[0] ? (
            <Image
              source={{ uri: post.images[0] }}
              className="w-16 h-16 rounded-xl"
              resizeMode="cover"
            />
          ) : (
            <View className="w-16 h-16 rounded-xl bg-neutral-T90 items-center justify-center">
              <MaterialIcons name="fastfood" size={24} color="#AAABAB" />
            </View>
          )}
          <View className="flex-1 justify-center">
            <Text className="font-sans font-bold text-base text-neutral-T10" numberOfLines={2}>
              {post?.title ?? paymentInfo?.description ?? t('transaction.orderFallback')}
            </Text>
            {!isResumeMode && post && (
              <Text className="font-body text-sm text-neutral-T50 mt-1">
                {quantity} x {post.price.toLocaleString('vi-VN')}đ
              </Text>
            )}
          </View>
          <View className="justify-center">
            <Text className="font-sans font-extrabold text-lg text-secondary-T30">
              {totalAmount.toLocaleString('vi-VN')}đ
            </Text>
          </View>
        </View>

        {/* Countdown */}
        {transactionId && (
          <View className="bg-secondary-T95 border border-secondary-T70 rounded-xl px-4 py-3 flex-row items-center gap-3">
            <MaterialIcons name="timer" size={20} color="#944A00" />
            <Text className="font-body text-sm text-secondary-T30 flex-1">
              {t('transaction.transferCountdown')}
            </Text>
            <Text className="font-sans font-extrabold text-lg text-secondary-T20">
              {formatCountdown(countdown)}
            </Text>
          </View>
        )}

        {/* Before order created — instruction */}
        {!transactionId && (
          <View className="bg-primary-T95 border border-primary-T70 rounded-xl p-4 gap-2">
            <View className="flex-row items-center gap-2">
              <MaterialIcons name="info-outline" size={18} color="#296C24" />
              <Text className="font-sans font-bold text-sm text-primary-T30">
                {t('transaction.bankTransferTitle')}
              </Text>
            </View>
            <Text className="font-body text-sm text-neutral-T30 leading-5">
              {t('transaction.bankTransferDesc')}
            </Text>
          </View>
        )}

        {/* VietQR + Bank Info (after order created) */}
        {transactionId && paymentInfo && (
          <View className="bg-neutral-T100 rounded-2xl p-4 gap-4" style={styles.card}>
            <Text className="font-sans font-bold text-base text-neutral-T10 text-center">
              {t('transaction.scanQRTransferTitle')}
            </Text>

            {/* QR Image */}
            <View className="items-center">
              <Image
                source={{ uri: paymentInfo.qrDataURL }}
                style={{ width: 200, height: 200 }}
                resizeMode="contain"
              />
            </View>

            {/* Divider */}
            <View className="flex-row items-center gap-3">
              <View className="flex-1 h-px bg-neutral-T85" />
              <Text className="font-body text-xs text-neutral-T50">{t('transaction.orManualTransfer')}</Text>
              <View className="flex-1 h-px bg-neutral-T85" />
            </View>

            {/* Bank details */}
            <View className="gap-2">
              <BankInfoRow label={t('transaction.bankLabel')} value={paymentInfo.bankName} />
              <BankInfoRow label={t('transaction.accountNumberLabel')} value={paymentInfo.bankAccountNumber} copyable />
              <BankInfoRow label={t('transaction.accountNameLabel')} value={paymentInfo.bankAccountName} />
              <BankInfoRow
                label={t('transaction.amountLabel')}
                value={`${paymentInfo.amount.toLocaleString('vi-VN')}đ`}
                highlight
              />
              <BankInfoRow label={t('transaction.transferRefLabel')} value={paymentInfo.description} copyable />
            </View>

            <View className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
              <Text className="font-body text-xs text-yellow-800 text-center leading-5">
                {t('transaction.transferNoteWarning')}
              </Text>
            </View>
          </View>
        )}

        {/* No QR available fallback */}
        {transactionId && !paymentInfo && (
          <View className="bg-neutral-T100 rounded-2xl p-4 items-center gap-3" style={styles.card}>
            <MaterialIcons name="warning-amber" size={32} color="#944A00" />
            <Text className="font-body text-sm text-neutral-T30 text-center">
              {t('transaction.qrLoadError')}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom action */}
      <View className="px-5 pb-6 pt-3" style={styles.bottomBar}>
        {!transactionId ? (
          <TouchableOpacity
            className="w-full rounded-2xl items-center justify-center py-4"
            activeOpacity={0.85}
            onPress={handleCreateOrder}
            disabled={isCreating}
            style={[styles.primaryBtn, isCreating && { opacity: 0.6 }]}
          >
            {isCreating ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-neutral-T100 font-sans font-black text-lg tracking-tight">
                {t('transaction.createOrderBtn')}
              </Text>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            className="w-full rounded-2xl items-center justify-center py-4"
            activeOpacity={0.85}
            onPress={handleDoneTransfer}
            style={styles.primaryBtn}
          >
            <Text className="text-neutral-T100 font-sans font-black text-lg tracking-tight">
              {t('transaction.transferDoneBtn')}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// ── Internal helpers ─────────────────────────────────────────────────────────

function BankInfoRow({
  label,
  value,
  copyable = false,
  highlight = false,
}: {
  label: string;
  value: string;
  copyable?: boolean;
  highlight?: boolean;
}) {
  return (
    <View className="flex-row items-center justify-between py-1.5 border-b border-neutral-T90">
      <Text className="font-body text-sm text-neutral-T50 flex-1">{label}</Text>
      <View className="flex-row items-center gap-1 flex-1 justify-end">
        <Text
          className={`font-sans text-sm text-right ${highlight ? 'font-extrabold text-secondary-T20' : 'font-semibold text-neutral-T10'}`}
          numberOfLines={1}
        >
          {value}
        </Text>
        {copyable && (
          <MaterialIcons name="content-copy" size={14} color="#AAABAB" />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  bottomBar: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
  },
  primaryBtn: {
    backgroundColor: '#944A00',
    shadowColor: '#944A00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    borderRadius: 16,
  },
});
