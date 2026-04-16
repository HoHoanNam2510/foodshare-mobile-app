// app/(voucher)/voucher-market.tsx
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import ManagementHeader from '@/components/shared/headers/ManagementHeader';

import RedeemConfirmModal from '@/components/voucher/RedeemConfirmModal';
import VoucherCard from '@/components/voucher/VoucherCard';
import { getVoucherMarketApi, redeemVoucherApi } from '@/lib/voucherApi';
import type {
  IVoucher,
  VoucherSortOption,
  DiscountTypeFilter,
} from '@/lib/voucherApi';
import { useAuthStore } from '@/stores/authStore';

type SortLabel = 'voucher.sortNewest' | 'voucher.sortPointsAsc' | 'voucher.sortPointsDesc';
const SORT_OPTIONS: { label: SortLabel; value: VoucherSortOption }[] = [
  { label: 'voucher.sortNewest', value: 'newest' },
  { label: 'voucher.sortPointsAsc', value: 'pointCost_asc' },
  { label: 'voucher.sortPointsDesc', value: 'pointCost_desc' },
];

const FILTER_OPTIONS: { label: string; value: DiscountTypeFilter }[] = [
  { label: 'voucher.filterAll', value: 'ALL' },
  { label: 'voucher.filterPercentage', value: 'PERCENTAGE' },
  { label: 'voucher.filterFixed', value: 'FIXED_AMOUNT' },
];

export default function VoucherMarketScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const deductGreenPoints = useAuthStore((s) => s.deductGreenPoints);
  const restoreGreenPoints = useAuthStore((s) => s.restoreGreenPoints);
  const fetchProfile = useAuthStore((s) => s.fetchProfile);

  const [vouchers, setVouchers] = useState<IVoucher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<IVoucher | null>(null);
  const [activeFilter, setActiveFilter] = useState<DiscountTypeFilter>('ALL');
  const [activeSort, setActiveSort] = useState<VoucherSortOption>('newest');
  const [showSortMenu, setShowSortMenu] = useState(false);

  const loadVouchers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: {
        sort?: VoucherSortOption;
        discountType?: 'PERCENTAGE' | 'FIXED_AMOUNT';
      } = {
        sort: activeSort,
      };
      if (activeFilter !== 'ALL') {
        params.discountType = activeFilter;
      }
      const res = await getVoucherMarketApi(params);
      setVouchers(res.data);
    } catch (e) {
      Alert.alert(t('voucher.errorAlert'), t('voucher.loadMarketError'));
    } finally {
      setIsLoading(false);
    }
  }, [activeSort, activeFilter, t]);

  useEffect(() => {
    loadVouchers();
  }, [loadVouchers]);

  const handleRedeem = async () => {
    if (!selectedVoucher || !user) return;
    setIsRedeeming(true);
    // Optimistic update
    deductGreenPoints(selectedVoucher.pointCost);
    try {
      await redeemVoucherApi(selectedVoucher._id);
      setSelectedVoucher(null);
      await fetchProfile();
      Alert.alert(t('voucher.redeemSuccessTitle'), t('voucher.redeemSuccessMsg'));
      // Reload để cập nhật remainingQuantity
      loadVouchers();
    } catch (e) {
      // Rollback
      restoreGreenPoints(selectedVoucher.pointCost);
      Alert.alert(
        t('voucher.errorAlert'),
        e instanceof Error ? e.message : t('voucher.redeemError')
      );
    } finally {
      setIsRedeeming(false);
    }
  };

  const currentSortLabel =
    SORT_OPTIONS.find((o) => o.value === activeSort)?.label ?? 'voucher.sortNewest';

  return (
    <View className="flex-1 bg-neutral">
      <ManagementHeader title={t('voucher.marketTitle')} onBack={() => router.back()} />

      {/* ── Points Widget ── */}
      {user && (
        <View className="m-4 p-4 bg-primary-T95 rounded-xl flex-row items-center gap-2">
          <Text className="text-lg">🍃</Text>
          <Text className="font-label font-semibold text-sm text-primary-T30">
            {t('voucher.pointsLabel')}{' '}
            <Text className="font-bold text-primary-T10">
              {user.greenPoints.toLocaleString()} {t('voucher.pointsUnit')}
            </Text>
          </Text>
        </View>
      )}

      {/* ── Filter + Sort Bar ── */}
      <View className="px-4 mb-3 gap-2">
        {/* Filter Tabs */}
        <View className="flex-row gap-2">
          {FILTER_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              onPress={() => setActiveFilter(opt.value)}
              className={`px-3 py-1.5 rounded-full border ${
                activeFilter === opt.value
                  ? 'bg-primary-T40 border-primary-T40'
                  : 'bg-neutral-T100 border-neutral-T80'
              }`}
              activeOpacity={0.8}
            >
              <Text
                className={`font-label text-xs font-semibold ${
                  activeFilter === opt.value
                    ? 'text-neutral-T100'
                    : 'text-neutral-T50'
                }`}
              >
                {t(opt.label)}
              </Text>
            </TouchableOpacity>
          ))}

          {/* Sort Button */}
          <TouchableOpacity
            onPress={() => setShowSortMenu((v) => !v)}
            className="ml-auto flex-row items-center gap-1 px-3 py-1.5 rounded-full border border-neutral-T80 bg-neutral-T100"
            activeOpacity={0.8}
          >
            <MaterialIcons name="sort" size={14} color="#5C5F5E" />
            <Text className="font-label text-xs text-neutral-T50">
              {t(currentSortLabel)}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Sort Dropdown */}
        {showSortMenu && (
          <View className="absolute right-4 top-10 bg-neutral-T100 rounded-xl shadow-md z-10 overflow-hidden border border-neutral-T90">
            {SORT_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                onPress={() => {
                  setActiveSort(opt.value);
                  setShowSortMenu(false);
                }}
                className={`px-4 py-3 ${
                  activeSort === opt.value ? 'bg-primary-T95' : ''
                }`}
                activeOpacity={0.8}
              >
                <Text
                  className={`font-label text-sm ${
                    activeSort === opt.value
                      ? 'text-primary-T30 font-semibold'
                      : 'text-neutral-T30'
                  }`}
                >
                  {t(opt.label)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* ── Voucher List ── */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center gap-3">
          <ActivityIndicator size="large" color="#296C24" />
          <Text className="font-body text-sm text-neutral-T50">
            {t('voucher.loadingVouchers')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={vouchers}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: insets.bottom + 20,
          }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="items-center justify-center py-20 gap-3">
              <MaterialIcons name="local-offer" size={48} color="#C5C7C6" />
              <Text className="font-body text-sm text-neutral-T50 text-center">
                {t('voucher.emptyMarketTitle')}{'\n'}{t('voucher.emptyMarketDesc')}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <VoucherCard
              voucher={item}
              viewMode="market"
              userGreenPoints={user?.greenPoints ?? 0}
              onRedeemPress={(v) => setSelectedVoucher(v)}
              onPress={(id) =>
                router.push({
                  pathname: '/(voucher)/voucher-detail',
                  params: { id, source: 'market' },
                } as any)
              }
            />
          )}
        />
      )}

      {/* ── Redeem Confirm Modal ── */}
      <RedeemConfirmModal
        visible={!!selectedVoucher}
        voucher={selectedVoucher}
        userCurrentPoints={user?.greenPoints ?? 0}
        isLoading={isRedeeming}
        onConfirm={handleRedeem}
        onClose={() => !isRedeeming && setSelectedVoucher(null)}
      />
    </View>
  );
}
