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
      <View className="flex-1 bg-neutral">
        <StackHeader title={t('voucher.voucherDetailTitle')} />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#296C24" />
        </View>
      </View>
    );
  }

  if (!voucher) {
    return (
      <View className="flex-1 bg-neutral">
        <StackHeader title={t('voucher.voucherDetailTitle')} />
        <View className="flex-1 items-center justify-center px-8 gap-4">
          <Text className="font-body text-sm text-neutral-T50 text-center">
            {t('voucher.notFoundDetail')}
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="px-6 py-3 bg-primary-T40 rounded-xl"
          >
            <Text className="font-label font-semibold text-neutral-T100">
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
    <View className="flex-1 bg-neutral">
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
          className="bg-neutral-T100 rounded-2xl p-6 items-center gap-4"
          style={styles.card}
        >
          <VoucherDiscountBadge
            discountType={voucher.discountType}
            discountValue={voucher.discountValue}
            size="lg"
          />
          <Text className="font-sans font-bold text-2xl text-neutral-T10 text-center">
            {voucher.title}
          </Text>

          {/* Code + Copy */}
          <TouchableOpacity
            onPress={handleCopyCode}
            className="flex-row items-center gap-2 bg-neutral-T95 rounded-xl px-4 py-2"
            activeOpacity={0.8}
          >
            <Text className="font-label font-bold text-base text-neutral-T20 tracking-widest">
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
          className="bg-neutral-T100 rounded-2xl p-5 gap-4"
          style={styles.card}
        >
          <Text className="font-sans font-bold text-base text-neutral-T10">
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
              <Text className="font-label text-sm text-neutral-T50">
                {t('voucher.pointsCostDetail')}
              </Text>
              <VoucherPointCost
                pointCost={voucher.pointCost}
                canAfford={!isFromWallet ? canAfford : true}
                userPoints={user?.greenPoints}
              />
            </View>
            <View className="gap-1">
              <Text className="font-label text-sm text-neutral-T50">
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
              <View className="h-px bg-neutral-T90" />
              <View className="gap-1">
                <Text className="font-label text-sm text-neutral-T50">
                  {t('voucher.voucherDescriptionDetail')}
                </Text>
                <Text className="font-body text-sm text-neutral-T30 leading-5">
                  {voucher.description}
                </Text>
              </View>
            </>
          )}
        </View>

        {/* ── User Points Widget (chỉ market mode) ── */}
        {!isFromWallet && user && (
          <View className="flex-row items-center gap-2 px-4 py-3 bg-primary-T95 rounded-xl">
            <Text className="text-lg">🍃</Text>
            <Text className="font-label font-semibold text-sm text-primary-T30">
              {t('voucher.yourCurrentPoints')}{' '}
              <Text className="font-bold text-primary-T10">
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
          className="absolute bottom-0 left-0 right-0 bg-neutral px-4"
          style={[
            styles.bottomBar,
            { paddingBottom: Math.max(insets.bottom, 16), paddingTop: 12 },
          ]}
        >
          <TouchableOpacity
            className={`h-14 rounded-2xl items-center justify-center ${
              canAfford ? 'bg-primary-T40' : 'bg-neutral-T90'
            }`}
            onPress={() => canAfford && setShowModal(true)}
            disabled={!canAfford}
            activeOpacity={0.85}
          >
            <Text
              className={`font-sans font-bold text-base ${
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
      <Text className="font-label text-sm text-neutral-T50">{label}</Text>
      <Text className="font-label font-semibold text-sm text-neutral-T20">
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
