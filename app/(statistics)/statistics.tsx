import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useAuthStore } from '@/stores/authStore';
import {
  StatisticsRange,
  PostTypeFilter,
  IStatisticsQuery,
} from '@/types/statistics';
import { useStatistics } from '@/hooks/useStatistics';
import RangePicker from '@/components/statistics/RangePicker';
import ChartTypeToggle from '@/components/statistics/ChartTypeToggle';
import CompareModal from '@/components/statistics/CompareModal';
import EmptyState from '@/components/shared/EmptyState';
import UserStatsView from '@/components/statistics/UserStatsView';
import StoreStatsView from '@/components/statistics/StoreStatsView';

export default function StatisticsScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const [range, setRange] = useState<StatisticsRange>('7d');
  const [from, setFrom] = useState<string | undefined>(undefined);
  const [to, setTo] = useState<string | undefined>(undefined);
  const [compareFrom, setCompareFrom] = useState<string | undefined>(undefined);
  const [compareTo, setCompareTo] = useState<string | undefined>(undefined);
  const [postType, setPostType] = useState<PostTypeFilter>('ALL');
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  const [compareModalVisible, setCompareModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<PostTypeFilter>('B2C_MYSTERY_BAG');

  const query = useMemo(
    (): IStatisticsQuery => ({
      range,
      from,
      to,
      compareFrom,
      compareTo,
      postType: user?.role === 'STORE' ? postType : 'ALL',
    }),
    [range, from, to, compareFrom, compareTo, postType, user?.role]
  );

  const { data, loading, error, refetch } = useStatistics(query);

  const handleRangeChange = useCallback(
    (newRange: StatisticsRange, newFrom?: string, newTo?: string) => {
      setRange(newRange);
      setFrom(newFrom);
      setTo(newTo);
      setCompareFrom(undefined);
      setCompareTo(undefined);
    },
    []
  );

  const handleCompareApply = useCallback(
    (params: {
      from: string;
      to: string;
      compareFrom: string;
      compareTo: string;
    }) => {
      setFrom(params.from);
      setTo(params.to);
      setCompareFrom(params.compareFrom);
      setCompareTo(params.compareTo);
      setCompareModalVisible(false);
    },
    []
  );

  const handleTabChange = useCallback((tab: PostTypeFilter) => {
    setActiveTab(tab);
    setPostType(tab);
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header area — white background with shadow separator (Bug 1 fix) */}
      <View className="bg-white shadow-sm">
        {/* Title row — back + title on left, controls on right (Bug 4 fix) */}
        <View className="flex-row items-center justify-between px-6 pb-2 pt-4">
          <View className="flex-row items-center gap-3">
            <TouchableOpacity onPress={() => router.back()}>
              <MaterialIcons name="arrow-back" size={24} color="#191C1C" />
            </TouchableOpacity>
            <Text className="font-body-bold text-neutral-T10 text-xl">
              Thống kê
            </Text>
          </View>
          <View className="flex-row items-center gap-2">
            <ChartTypeToggle value={chartType} onChange={setChartType} />
            <TouchableOpacity
              className="border-neutral-T80 rounded-xl border bg-white px-3 py-2"
              onPress={() => setCompareModalVisible(true)}
            >
              <Text className="font-body-semibold text-neutral-T30 text-sm">
                So sánh
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Range chips — own row, full width */}
        <View className="px-6 pb-3">
          <RangePicker selectedRange={range} onRangeChange={handleRangeChange} />
        </View>
      </View>

      <ScrollView
        className="flex-1 bg-neutral px-6"
        contentContainerStyle={{ paddingBottom: 40, gap: 16, paddingTop: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Bug 2 fix: replace broken shimmer with ActivityIndicator */}
        {loading && !error && (
          <View className="items-center py-20">
            <ActivityIndicator size="large" color="#72B866" />
          </View>
        )}
        {!loading && error && <EmptyState variant="error" onRetry={refetch} />}
        {!loading && !error && !data && (
          <EmptyState variant="no-data" />
        )}
        {!loading && !error && data && (
          <>
            {user?.role === 'STORE' ? (
              <StoreStatsView
                data={data}
                chartType={chartType}
                activeTab={activeTab}
                onTabChange={handleTabChange}
              />
            ) : (
              <UserStatsView
                data={data}
                chartType={chartType}
                metric="given"
              />
            )}
          </>
        )}
      </ScrollView>

      <CompareModal
        visible={compareModalVisible}
        onClose={() => setCompareModalVisible(false)}
        onApply={handleCompareApply}
        initialCurrentFrom={from}
        initialCurrentTo={to}
        initialCompareFrom={compareFrom}
        initialCompareTo={compareTo}
      />
    </SafeAreaView>
  );
}
