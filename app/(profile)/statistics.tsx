import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
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
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import EmptyState from '@/components/shared/EmptyState';
import UserStatsView from '@/components/statistics/UserStatsView';
import StoreStatsView from '@/components/statistics/StoreStatsView';

export default function StatisticsScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  // Query state
  const [range, setRange] = useState<StatisticsRange>('7d');
  const [from, setFrom] = useState<string | undefined>(undefined);
  const [to, setTo] = useState<string | undefined>(undefined);
  const [compareFrom, setCompareFrom] = useState<string | undefined>(undefined);
  const [compareTo, setCompareTo] = useState<string | undefined>(undefined);
  const [postType, setPostType] = useState<PostTypeFilter>('ALL');
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');

  // Skia worklet context isn't safe to use during a navigation transition.
  // Defer chart mounting until all interactions (nav animation) are done.
  const [skiaReady, setSkiaReady] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setSkiaReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Compare modal
  const [compareModalVisible, setCompareModalVisible] = useState(false);

  // Store tab state (only for STORE role)
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
      // Clear compare when range changes
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

  const metricForUser = 'given'; // or 'received' based on user preference? We'll use 'given' for now.

  return (
    <SafeAreaView className="bg-neutral flex-1">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 pb-2 pt-4">
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#191C1C" />
        </TouchableOpacity>
        <Text className="font-body-bold text-neutral-T10 text-xl">
          Thống kê
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Controls */}
      <View className="flex-row items-center justify-between px-6 py-3">
        <RangePicker selectedRange={range} onRangeChange={handleRangeChange} />
        <View className="flex-row items-center gap-3">
          <ChartTypeToggle value={chartType} onChange={setChartType} />
          <TouchableOpacity
            className="border-neutral-T80 rounded-xl border bg-white px-4 py-2"
            onPress={() => setCompareModalVisible(true)}
          >
            <Text className="font-body-semibold text-neutral-T30 text-sm">
              So sánh
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{ paddingBottom: 40, gap: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {(loading || !skiaReady) && !error && (
          <LoadingSkeleton variant="chart" />
        )}
        {!loading && error && <EmptyState variant="error" onRetry={refetch} />}
        {skiaReady && !loading && !error && !data && (
          <EmptyState variant="no-data" />
        )}
        {skiaReady && !loading && !error && data && (
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
                metric={metricForUser}
              />
            )}
          </>
        )}
      </ScrollView>

      {/* Compare Modal */}
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
