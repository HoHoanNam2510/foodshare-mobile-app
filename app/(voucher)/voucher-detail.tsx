// app/(voucher)/voucher-detail.tsx
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import StackHeader from '@/components/shared/headers/StackHeader';

import RedeemConfirmModal from '@/components/voucher/RedeemConfirmModal';
import VoucherDiscountBadge from '@/components/voucher/VoucherDiscountBadge';
import VoucherExpiryTag from '@/components/voucher/VoucherExpiryTag';
import VoucherPointCost from '@/components/voucher/VoucherPointCost';
import VoucherQuantityBar from '@/components/voucher/VoucherQuantityBar';
import VoucherStatusBadge from '@/components/voucher/VoucherStatusBadge';
import { getVoucherMarketApi, redeemVoucherApi } from '@/lib/voucherApi';
import type { IVoucher } from '@/lib/voucherApi';
import { useAuthStore } from '@/stores/authStore';
import { useTranslation } from 'react-i18next';

export default function VoucherDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const {
    id,
    source,
    status: walletStatus,
  } = useLocalSearchParams<{
    id: string;
    source: 'market' | 'wallet';
    status?: 'UNUSED' | 'USED' | 'EXPIRED';
  }>();

  const user = useAuthStore((s) => s.user);
  const deductGreenPoints = useAuthStore((s) => s.deductGreenPoints);
  const restoreGreenPoints = useAuthStore((s) => s.restoreGreenPoints);
  const fetchProfile = useAuthStore((s) => s.fetchProfile);

  const [voucher, setVoucher] = useState<IVoucher | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isRedeeming, setIsRedeeming] = useState(false);

  useEffect(() => {
    if (!id) return;
    // Lấy voucher từ market endpoint, lọc theo id
    setIsLoading(true);
    getVoucherMarketApi()
      .then((res) => {
        const found = res.data.find((v) => v._id === id);
        setVoucher(found ?? null);
      })
      .catch(() => setVoucher(null))
      .finally(() => setIsLoading(false));
  }, [id]);

  const canAfford =
    user && voucher ? user.greenPoints >= voucher.pointCost : false;
  const isFromWallet = source === 'wallet';

  const handleCopyCode = () => {
    if (!voucher) return;
    Alert.alert(t('voucher.voucherCodeLabel'), voucher.code, [
      { text: t('voucher.voucherCodeCopied') },
    ]);
  };

  const handleRedeem = async () => {
    if (!voucher || !user) return;
    setIsRedeeming(true);
    deductGreenPoints(voucher.pointCost);
    try {
      await redeemVoucherApi(voucher._id);
      setShowModal(false);
      await fetchProfile();
      Alert.alert(
        t('voucher.redeemSuccessTitle'),
        t('voucher.redeemSuccessMsg'),
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (e) {
      restoreGreenPoints(voucher.pointCost);
      Alert.alert(
        t('voucher.errorAlert'),
        e instanceof Error ? e.message : t('voucher.redeemError')
      );
    } finally {
      setIsRedeeming(false);
    }
  };

  if (isLoading) {
    return (
      <View className="bg-neutral flex-1">
        <StackHeader title={t('voucher.voucherDetailTitle')} />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#296C24" />
        </View>
      </View>
    );
  }

  if (!voucher) {
    return (
      <View className="bg-neutral flex-1">
        <StackHeader title={t('voucher.voucherDetailTitle')} />
        <View className="flex-1 items-center justify-center gap-4 px-8">
          <Text className="font-body text-neutral-T50 text-center text-sm">
            {t('voucher.notFoundDetail')}
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-primary-T40 rounded-xl px-6 py-3"
          >
            <Text className="font-label text-neutral-T100 font-semibold">
              {t('voucher.backBtn', 'Quay lại')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

  return (
    <View className="bg-neutral flex-1">
      <StackHeader title={t('voucher.voucherDetailTitle')} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: insets.bottom + 100,
          paddingTop: 16,
          gap: 12,
        }}
      >
        {/* ── Hero Badge Card ── */}
        <View
          className="bg-neutral-T100 items-center gap-4 rounded-2xl p-6"
          style={styles.card}
        >
          <VoucherDiscountBadge
            discountType={voucher.discountType}
            discountValue={voucher.discountValue}
            size="lg"
          />
          <Text className="text-neutral-T10 text-center font-sans text-2xl font-bold">
            {voucher.title}
          </Text>

          {/* Code + Copy */}
          <TouchableOpacity
            onPress={handleCopyCode}
            className="bg-neutral-T95 flex-row items-center gap-2 rounded-xl px-4 py-2"
            activeOpacity={0.8}
          >
            <Text className="font-label text-neutral-T20 text-base font-bold tracking-widest">
              {voucher.code}
            </Text>
            <MaterialIcons name="content-copy" size={16} color="#5C5F5E" />
          </TouchableOpacity>

          {/* Wallet Status */}
          {isFromWallet && walletStatus && (
            <VoucherStatusBadge status={walletStatus} />
          )}
        </View>

        {/* ── Details Card ── */}
        <View
          className="bg-neutral-T100 gap-4 rounded-2xl p-5"
          style={styles.card}
        >
          <Text className="text-neutral-T10 font-sans text-base font-bold">
            {t('voucher.voucherDetailsInfo')}
          </Text>

          <View className="gap-3">
            <DetailRow
              label={t('voucher.discountTypeDetail')}
              value={
                voucher.discountType === 'PERCENTAGE'
                  ? t('voucher.discountTypePercentage')
                  : t('voucher.discountTypeFixed')
              }
            />
            <DetailRow
              label={t('voucher.discountValueDetail')}
              value={
                voucher.discountType === 'PERCENTAGE'
                  ? `${voucher.discountValue}%`
                  : `${voucher.discountValue.toLocaleString('vi-VN')}đ`
              }
            />
            <View className="flex-row items-center justify-between">
              <Text className="font-label text-neutral-T50 text-sm">
                {t('voucher.pointsCostDetail')}
              </Text>
              <VoucherPointCost
                pointCost={voucher.pointCost}
                canAfford={!isFromWallet ? canAfford : true}
                userPoints={user?.greenPoints}
              />
            </View>
            <View className="gap-1">
              <Text className="font-label text-neutral-T50 text-sm">
                {t('voucher.remainingQuantityDetail')}
              </Text>
              <VoucherQuantityBar
                remainingQuantity={voucher.remainingQuantity}
                totalQuantity={voucher.totalQuantity}
              />
            </View>
            <DetailRow
              label={t('voucher.validityPeriodDetail')}
              value={`${formatDate(voucher.validFrom)} – ${formatDate(voucher.validUntil)}`}
            />
          </View>

          {voucher.description && (
            <>
              <View className="bg-neutral-T90 h-px" />
              <View className="gap-1">
                <Text className="font-label text-neutral-T50 text-sm">
                  {t('voucher.voucherDescriptionDetail')}
                </Text>
                <Text className="font-body text-neutral-T30 text-sm leading-5">
                  {voucher.description}
                </Text>
              </View>
            </>
          )}
        </View>

        {/* ── User Points Widget (chỉ market mode) ── */}
        {!isFromWallet && user && (
          <View className="bg-primary-T95 flex-row items-center gap-2 rounded-xl px-4 py-3">
            <Text className="text-lg">🍃</Text>
            <Text className="font-label text-primary-T30 text-sm font-semibold">
              {t('voucher.yourCurrentPoints')}{' '}
              <Text className="text-primary-T10 font-bold">
                {user.greenPoints.toLocaleString()}
              </Text>
            </Text>
          </View>
        )}

        {/* Expiry Warning */}
        <VoucherExpiryTag validUntil={voucher.validUntil} />
      </ScrollView>

      {/* ── Bottom Action ── */}
      {!isFromWallet && (
        <View
          className="bg-neutral absolute bottom-0 left-0 right-0 px-4"
          style={[
            styles.bottomBar,
            { paddingBottom: Math.max(insets.bottom, 16), paddingTop: 12 },
          ]}
        >
          <TouchableOpacity
            className={`h-14 items-center justify-center rounded-2xl ${
              canAfford ? 'bg-primary-T40' : 'bg-neutral-T90'
            }`}
            onPress={() => canAfford && setShowModal(true)}
            disabled={!canAfford}
            activeOpacity={0.85}
          >
            <Text
              className={`font-sans text-base font-bold ${
                canAfford ? 'text-neutral-T100' : 'text-neutral-T50'
              }`}
            >
              {canAfford
                ? t('voucher.redeemBtn')
                : t('voucher.notEnoughPointsBtn')}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <RedeemConfirmModal
        visible={showModal}
        voucher={voucher}
        userCurrentPoints={user?.greenPoints ?? 0}
        isLoading={isRedeeming}
        onConfirm={handleRedeem}
        onClose={() => !isRedeeming && setShowModal(false)}
      />
    </View>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="font-label text-neutral-T50 text-sm">{label}</Text>
      <Text className="font-label text-neutral-T20 text-sm font-semibold">
        {value}
      </Text>
    </View>
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
  bottomBar: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
  },
});
