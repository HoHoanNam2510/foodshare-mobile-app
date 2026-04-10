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
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import VoucherCard from '@/components/voucher/VoucherCard';
import { getMyVouchersApi } from '@/lib/voucherApi';
import type { IUserVoucher, VoucherStatusFilter } from '@/lib/voucherApi';

const TABS: { label: string; value: VoucherStatusFilter }[] = [
  { label: 'Chưa dùng', value: 'UNUSED' },
  { label: 'Đã dùng', value: 'USED' },
  { label: 'Hết hạn', value: 'EXPIRED' },
];

export default function MyVouchersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [activeTab, setActiveTab] = useState<VoucherStatusFilter>('UNUSED');
  const [userVouchers, setUserVouchers] = useState<IUserVoucher[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadVouchers = useCallback(async (status: VoucherStatusFilter) => {
    setIsLoading(true);
    try {
      const res = await getMyVouchersApi({ status });
      setUserVouchers(res.data);
    } catch (e) {
      Alert.alert('Lỗi', 'Không thể tải ví voucher.');
    } finally {
      setIsLoading(false);
    }
  }, []);

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
    <SafeAreaView className="flex-1 bg-neutral" edges={['top']}>
      {/* ── Header ── */}
      <View className="flex-row items-center justify-between h-14 px-4 bg-neutral">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center rounded-xl bg-neutral-T95"
          activeOpacity={0.8}
        >
          <MaterialIcons name="arrow-back" size={22} color="#191C1C" />
        </TouchableOpacity>
        <Text className="font-sans font-bold text-lg text-neutral-T10">
          Ví Voucher của tôi
        </Text>
        <View className="w-10" />
      </View>

      {/* ── Tab Bar ── */}
      <View className="flex-row mx-4 mb-3 bg-neutral-T95 rounded-xl p-1">
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.value}
            onPress={() => handleTabChange(tab.value)}
            className={`flex-1 py-2.5 rounded-lg items-center ${
              activeTab === tab.value ? 'bg-neutral-T100' : ''
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
                activeTab === tab.value ? 'text-neutral-T10' : 'text-neutral-T50'
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
          <Text className="font-body text-sm text-neutral-T50">Đang tải...</Text>
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
            <View className="items-center justify-center py-20 gap-3">
              <MaterialIcons name="wallet" size={48} color="#C5C7C6" />
              <Text className="font-body text-sm text-neutral-T50 text-center">
                Bạn chưa có voucher nào trong mục này.{'\n'}
                Hãy ghé Chợ Voucher để đổi điểm!
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/(voucher)/voucher-market' as any)}
                className="px-6 py-3 bg-primary-T40 rounded-xl"
                activeOpacity={0.85}
              >
                <Text className="font-label font-semibold text-neutral-T100">
                  Đến Chợ Voucher
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
    </SafeAreaView>
  );
}
