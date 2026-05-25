// app/(voucher)/my-vouchers.tsx
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
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
import type { TFunction } from 'i18next';

import ManagementHeader from '@/components/shared/headers/ManagementHeader';

import VoucherCard from '@/components/voucher/VoucherCard';
import { getMyVouchersApi } from '@/lib/voucherApi';
import type {
  IUserVoucher,
  IVoucher,
  VoucherStatusFilter,
} from '@/lib/voucherApi';

const TABS = (
  t: TFunction
): { label: string; value: VoucherStatusFilter }[] => [
  { label: t('voucher.statusUnused'), value: 'UNUSED' },
  { label: t('voucher.statusUsed'), value: 'USED' },
  { label: t('voucher.statusExpired'), value: 'EXPIRED' },
];

export default function MyVouchersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState<VoucherStatusFilter>('UNUSED');
  const [userVouchers, setUserVouchers] = useState<
    (IUserVoucher & { voucherId: IVoucher })[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadVouchers = useCallback(
    async (status: VoucherStatusFilter) => {
      setIsLoading(true);
      try {
        const res = await getMyVouchersApi({ status });
        setUserVouchers(
          res.data.filter(
            (uv): uv is typeof uv & { voucherId: IVoucher } =>
              uv.voucherId != null
          )
        );
      } catch {
        Alert.alert(t('voucher.errorAlert'), t('voucher.loadWalletError'));
      } finally {
        setIsLoading(false);
      }
    },
    [t]
  );

  // Refresh khi focus (VD: vừa đổi voucher từ market)
  useFocusEffect(
    useCallback(() => {
      loadVouchers(activeTab);
    }, [loadVouchers, activeTab])
  );

  const handleTabChange = (tab: VoucherStatusFilter) => {
    setActiveTab(tab);
    loadVouchers(tab);
  };

  return (
    <View className="bg-neutral dark:bg-neutral-T10 flex-1">
      <ManagementHeader
        title={t('voucher.myVouchersTitle')}
        onBack={() => router.back()}
      />

      {/* ── Tab Bar ── */}
      <View className="bg-neutral-T95 dark:bg-neutral-T30 m-4 flex-row rounded-xl p-1">
        {TABS(t).map((tab) => (
          <TouchableOpacity
            key={tab.value}
            onPress={() => handleTabChange(tab.value)}
            className={`flex-1 items-center rounded-lg py-2.5 ${
              activeTab === tab.value
                ? 'bg-neutral-T100 dark:bg-neutral-T20'
                : ''
            }`}
            activeOpacity={0.8}
            style={
              activeTab === tab.value
                ? {
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.08,
                    shadowRadius: 4,
                    elevation: 2,
                  }
                : undefined
            }
          >
            <Text
              className={`font-label text-sm font-semibold ${
                activeTab === tab.value
                  ? 'text-neutral-T10 dark:text-neutral-T90'
                  : 'text-neutral-T50 dark:text-neutral-T60'
              }`}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Content ── */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center gap-3">
          <ActivityIndicator size="large" color="#296C24" />
          <Text className="font-body text-neutral-T50 dark:text-neutral-T60 text-sm">
            {t('common.loading')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={userVouchers}
          keyExtractor={(item) => item._id}
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 8,
            paddingBottom: insets.bottom + 20,
          }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="items-center justify-center gap-3 py-20">
              <MaterialIcons name="wallet" size={48} color="#C5C7C6" />
              <Text className="font-body text-neutral-T50 dark:text-neutral-T60 text-center text-sm">
                {t('voucher.emptyWalletTitle')}
                {'\n'}
                {t('voucher.emptyWalletDesc')}
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/(voucher)/voucher-market' as any)}
                className="bg-primary-T40 rounded-xl px-6 py-3"
                activeOpacity={0.85}
              >
                <Text className="font-label text-neutral-T100 font-semibold">
                  {t('voucher.goToMarket')}
                </Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item }) => (
            <VoucherCard
              voucher={item.voucherId}
              viewMode="wallet"
              userVoucherStatus={item.status}
              onPress={(id) =>
                router.push({
                  pathname: '/(voucher)/voucher-detail',
                  params: { id, source: 'wallet', status: item.status },
                } as any)
              }
            />
          )}
        />
      )}
    </View>
  );
}
