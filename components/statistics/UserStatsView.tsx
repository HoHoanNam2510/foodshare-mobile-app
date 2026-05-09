import React from 'react';
import { View, Text } from 'react-native';
import { IStatisticsData } from '@/types/statistics';
import StatsSummaryCards from './StatsSummaryCards';
import GreenPointsCard from './GreenPointsCard';
import TopItemsList from './TopItemsList';
import GrowthChart from './GrowthChart';
import CompareChart from './CompareChart';

interface UserStatsViewProps {
  data: IStatisticsData;
  chartType: 'line' | 'bar';
  metric: 'given' | 'received';
}

export default function UserStatsView({
  data,
  chartType,
  metric,
}: UserStatsViewProps) {
  return (
    <View>
      <StatsSummaryCards summary={data.summary} comparison={data.compare} />
      <View className="my-4 rounded-2xl bg-white p-4 shadow-sm">
        <Text className="font-body-bold text-neutral-T10 mb-2 text-lg">
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
