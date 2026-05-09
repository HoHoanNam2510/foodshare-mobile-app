import React, { useMemo, useState } from 'react';
import { View, Text } from 'react-native';
import { CartesianChart, Line, useChartPressState } from 'victory-native';
import { ITimeseriesPoint } from '@/types/statistics';
import { formatVND } from '@/utils/statisticsHelpers';

interface CompareChartProps {
  current: ITimeseriesPoint[];
  previous: ITimeseriesPoint[];
  metric: 'given' | 'received' | 'revenue';
}

export default function CompareChart({
  current,
  previous,
  metric,
}: CompareChartProps) {
  const [tooltipData, setTooltipData] = useState<{
    index: number;
    cur: number;
    prev: number;
    left: number;
  } | null>(null);

  const getVal = (point: ITimeseriesPoint): number =>
    metric === 'given'
      ? point.given
      : metric === 'received'
        ? point.received
        : point.revenue;

  const mergedData = useMemo(() => {
    const maxLen = Math.max(current.length, previous.length);
    return Array.from({ length: maxLen }, (_, i) => ({
      index: i,
      cur: current[i] ? getVal(current[i]) : 0,
      prev: previous[i] ? getVal(previous[i]) : 0,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, previous, metric]);

  const { state, isActive } = useChartPressState({
    x: 0,
    y: { cur: 0, prev: 0 },
  });

  React.useEffect(() => {
    if (isActive) {
      setTooltipData({
        index: state.x.value.value,
        cur: state.y.cur.value.value,
        prev: state.y.prev.value.value,
        left: state.x.position.value,
      });
    } else {
      setTooltipData(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  const formatLabel = (value: number): string =>
    metric === 'revenue' ? formatVND(value) : Math.round(value).toString();

  return (
    <View style={{ height: 280 }}>
      <CartesianChart
        data={mergedData}
        xKey="index"
        yKeys={['cur', 'prev']}
        yAxis={[{ formatYLabel: formatLabel }]}
        domainPadding={10}
        chartPressState={state}
      >
        {({ points }) => (
          <>
            <Line points={points.cur} color="#72B866" strokeWidth={2} />
            <Line points={points.prev} color="#6B7280" strokeWidth={2} />
          </>
        )}
      </CartesianChart>
      {tooltipData && (
        <View
          style={{
            position: 'absolute',
            top: 10,
            left: Math.max(0, tooltipData.left - 60),
            backgroundColor: 'white',
            padding: 8,
            borderRadius: 8,
            elevation: 3,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
          }}
        >
          <Text className="text-primary text-xs">
            Hiện tại ({current[tooltipData.index]?.name ?? ''}
            ):{' '}
            {metric === 'revenue'
              ? formatVND(tooltipData.cur)
              : tooltipData.cur}
          </Text>
          <Text className="text-neutral-T50 text-xs">
            So sánh ({previous[tooltipData.index]?.name ?? ''}
            ):{' '}
            {metric === 'revenue'
              ? formatVND(tooltipData.prev)
              : tooltipData.prev}
          </Text>
        </View>
      )}
      {/* Legend */}
      <View className="mt-2 flex-row justify-center">
        <View className="mr-4 flex-row items-center">
          <View className="bg-primary mr-1 h-3 w-3 rounded-full" />
          <Text className="text-neutral-T30 text-xs">Hiện tại</Text>
        </View>
        <View className="flex-row items-center">
          <View className="bg-neutral-T50 mr-1 h-3 w-3 rounded-full" />
          <Text className="text-neutral-T30 text-xs">So sánh</Text>
        </View>
      </View>
    </View>
  );
}

/*
// Mock data for testing
const mockCurrent: ITimeseriesPoint[] = [
  { name: '2026-05-01', given: 5, received: 2, revenue: 100000 },
  { name: '2026-05-02', given: 3, received: 4, revenue: 150000 },
  { name: '2026-05-03', given: 7, received: 1, revenue: 200000 },
];
const mockPrevious: ITimeseriesPoint[] = [
  { name: '2026-04-01', given: 4, received: 3, revenue: 80000 },
  { name: '2026-04-02', given: 6, received: 2, revenue: 120000 },
  { name: '2026-04-03', given: 5, received: 5, revenue: 180000 },
];
*/
