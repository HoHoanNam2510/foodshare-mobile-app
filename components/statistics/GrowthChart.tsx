import React, { useMemo, useState } from 'react';
import { View, Text } from 'react-native';
import { CartesianChart, Bar, Line, useChartPressState } from 'victory-native';
import { ITimeseriesPoint } from '@/types/statistics';
import { formatVND } from '@/utils/statisticsHelpers';

interface GrowthChartProps {
  data: ITimeseriesPoint[];
  metric: 'given' | 'received' | 'revenue';
  chartType: 'line' | 'bar';
}

export default function GrowthChart({
  data,
  metric,
  chartType,
}: GrowthChartProps) {
  const [tooltipData, setTooltipData] = useState<{
    name: string;
    value: number;
    left: number;
  } | null>(null);

  const chartData = useMemo(
    () =>
      data.map((point) => ({
        x: point.name,
        y:
          metric === 'given'
            ? point.given
            : metric === 'received'
              ? point.received
              : point.revenue,
      })),
    [data, metric]
  );

  const { state, isActive } = useChartPressState({
    x: '' as string,
    y: { y: 0 },
  });

  React.useEffect(() => {
    if (isActive) {
      setTooltipData({
        name: state.x.value.value,
        value: state.y.y.value.value,
        left: state.x.position.value,
      });
    } else {
      setTooltipData(null);
    }
    // state is stable (created once by useChartPressState)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  const formatLabel = (value: number): string =>
    metric === 'revenue' ? formatVND(value) : Math.round(value).toString();

  return (
    <View style={{ height: 240 }}>
      <CartesianChart
        data={chartData}
        xKey="x"
        yKeys={['y']}
        yAxis={[{ formatYLabel: formatLabel }]}
        domainPadding={10}
        chartPressState={state}
      >
        {({ points, chartBounds }) =>
          chartType === 'bar' ? (
            <Bar points={points.y} chartBounds={chartBounds} color="#72B866" />
          ) : (
            <Line points={points.y} color="#72B866" strokeWidth={2} />
          )
        }
      </CartesianChart>
      {tooltipData && (
        <View
          style={{
            position: 'absolute',
            top: 10,
            left: Math.max(0, tooltipData.left - 50),
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
          <Text className="font-body-semibold text-neutral-T30 text-sm">
            {tooltipData.name}
          </Text>
          <Text className="font-body-bold text-primary text-base">
            {metric === 'revenue'
              ? formatVND(tooltipData.value)
              : tooltipData.value}
          </Text>
        </View>
      )}
    </View>
  );
}

/*
// Mock data for testing
const mockData: ITimeseriesPoint[] = [
  { name: '2026-05-01', given: 5, received: 2, revenue: 100000 },
  { name: '2026-05-02', given: 3, received: 4, revenue: 150000 },
  { name: '2026-05-03', given: 7, received: 1, revenue: 200000 },
  { name: '2026-05-04', given: 2, received: 6, revenue: 80000 },
  { name: '2026-05-05', given: 8, received: 3, revenue: 300000 },
];
*/
