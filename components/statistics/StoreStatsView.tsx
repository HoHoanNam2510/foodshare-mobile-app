import React from 'react';
import { View, Text } from 'react-native';
import { IStatisticsData, PostTypeFilter } from '@/types/statistics';
import PostTypeTabs from './PostTypeTabs';
import StatsSummaryCards from './StatsSummaryCards';
import RevenueCard from './RevenueCard';
import GreenPointsCard from './GreenPointsCard';
import TopItemsList from './TopItemsList';
import GrowthChart from './GrowthChart';
import CompareChart from './CompareChart';

interface StoreStatsViewProps {
  data: IStatisticsData;
  chartType: 'line' | 'bar';
  activeTab: PostTypeFilter;
  onTabChange: (tab: PostTypeFilter) => void;
}

export default function StoreStatsView({
  data,
  chartType,
  activeTab,
  onTabChange,
}: StoreStatsViewProps) {
  const metric = activeTab === 'B2C_MYSTERY_BAG' ? 'revenue' : 'given';

  return (
    <View>
      <PostTypeTabs value={activeTab} onChange={onTabChange} />
      <StatsSummaryCards summary={data.summary} comparison={data.compare} />
      {activeTab === 'B2C_MYSTERY_BAG' && (
        <RevenueCard summary={data.summary} comparison={data.compare} />
      )}
      <View className="dark:bg-neutral-T20 dark:border-neutral-T30 my-4 rounded-2xl bg-white p-4 shadow-sm dark:border dark:shadow-none">
        <Text className="font-body-bold text-neutral-T10 dark:text-neutral-T90 mb-2 text-lg">
          Biểu đồ tăng trưởng
        </Text>
        {data.compare ? (
          <CompareChart
            current={data.timeseries}
            previous={data.compare.previousTimeseries}
            metric={metric}
          />
        ) : (
          <GrowthChart
            data={data.timeseries}
            metric={metric}
            chartType={chartType}
          />
        )}
      </View>
      <GreenPointsCard points={data.totalGreenPointsEarned} />
      <TopItemsList
        topItems={data.topItems}
        topCounterparts={data.topCounterparts}
      />
    </View>
  );
}
