import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ManagementHeader from '@/components/shared/headers/ManagementHeader';

import VoucherCard from '@/components/voucher/VoucherCard';
import { storeGetMyVouchersApi, storeToggleVoucherApi } from '@/lib/voucherApi';
import type { IVoucher } from '@/lib/voucherApi';
import { useAuthStore } from '@/stores/authStore';
import { useTranslation } from 'react-i18next';

export default function StoreVouchersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const { t } = useTranslation();

  const [vouchers, setVouchers] = useState<IVoucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchVouchers = useCallback(async () => {
    if (!user || user.role !== 'STORE') {
      Alert.alert(t('voucher.errorAlert'), t('voucher.storeOnlyAccess'));
      router.back();
      return;
    }
    try {
      setLoading(true);
      const { success, data } = await storeGetMyVouchersApi();
      if (success) {
        setVouchers(
          data.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
        );
      }
    } catch {
      Alert.alert(t('voucher.errorAlert'), t('voucher.loadMarketError'));
    } finally {
      setLoading(false);
    }
  }, [user, router, t]);

  useEffect(() => {
    fetchVouchers();
  }, [fetchVouchers]);

  const handleToggle = async (voucherId: string) => {
    const idx = vouchers.findIndex((v) => v._id === voucherId);
    if (idx === -1) return;

    const updated = [...vouchers];
    updated[idx] = { ...updated[idx], isActive: !updated[idx].isActive };
    setVouchers(updated);

    try {
      const { success } = await storeToggleVoucherApi(voucherId);
      if (!success) throw new Error('Toggle failed');
    } catch {
      updated[idx] = { ...updated[idx], isActive: !updated[idx].isActive };
      setVouchers([...updated]);
      Alert.alert(t('voucher.errorAlert'), t('voucher.toggleVoucherError'));
    }
  };

  const handleEdit = (voucherId: string) => {
    router.push(`/(voucher)/edit-voucher?id=${voucherId}` as any);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchVouchers();
    setRefreshing(false);
  };

  return (
    <View className="flex-1 bg-neutral">
      <ManagementHeader
        title={t('voucher.storeVouchersTitle')}
        onBack={() => router.back()}
        actions={[
          {
            icon: 'plus',
            onPress: () => router.push('/(voucher)/create-voucher' as any),
          },
        ]}
      />
      {/* ── List ── */}
      {loading ? (
        <View className="flex-1 items-center justify-center gap-3">
          <ActivityIndicator size="large" color="#296C24" />
          <Text className="font-body text-sm text-neutral-T50">
            {t('common.loading')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={vouchers}
          keyExtractor={(item) => item._id}
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: insets.bottom + 20,
          }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View className="items-center justify-center py-20 gap-3">
              <MaterialIcons name="local-offer" size={48} color="#C5C7C6" />
              <Text className="font-body text-sm text-neutral-T50 text-center">
                {t('voucher.emptyStoreVouchersTitle')}{'\n'}{t('voucher.emptyStoreVouchersDesc')}
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/(voucher)/create-voucher' as any)}
                className="px-6 py-3 bg-primary-T40 rounded-xl"
                activeOpacity={0.85}
              >
                <Text className="font-label font-semibold text-neutral-T100">
                  {t('voucher.createVoucherBtn')}
                </Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item }) => (
            <VoucherCard
              voucher={item}
              viewMode="store-manage"
              onToggleActive={handleToggle}
              onEditPress={handleEdit}
              onPress={() => {}}
            />
          )}
        />
      )}
    </View>
  );
}
