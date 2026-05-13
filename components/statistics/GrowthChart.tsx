import React, { useMemo } from 'react';
import { View, Text, useWindowDimensions } from 'react-native';
import { LineChart, BarChart } from 'react-native-gifted-charts';
import { ITimeseriesPoint } from '@/types/statistics';
import { formatVND } from '@/utils/statisticsHelpers';

const CHART_COLOR = '#72B866';
const CHART_HEIGHT = 200;

interface GrowthChartProps {
  data: ITimeseriesPoint[];
  metric: 'given' | 'received' | 'revenue';
  chartType: 'line' | 'bar';
}

// "2026-05-01" → "01/5", "2026-05" → "T5"
function formatXLabel(name: string): string {
  if (name.length === 7) {
    return `T${parseInt(name.slice(5))}`;
  }
  const parts = name.split('-');
  return `${parts[2]}/${parseInt(parts[1])}`;
}

export default function GrowthChart({
  data,
  metric,
  chartType,
}: GrowthChartProps) {
  // Bug 5 fix: subtract extra space for y-axis (gifted-charts adds ~35px to the left)
  const { width: screenWidth } = useWindowDimensions();
  const chartWidth = screenWidth - 130;

  const chartData = useMemo(
    () =>
      data.map((point) => ({
        value:
          metric === 'given'
            ? point.given
            : metric === 'received'
              ? point.received
              : point.revenue,
        label: formatXLabel(point.name), // Bug 6 fix: short labels
      })),
    [data, metric]
  );

  const formatYLabel = (v: string): string => {
    const n = Number(v);
    if (metric !== 'revenue') return String(Math.round(n));
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}tr`;
    if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
    return String(n);
  };

  const sharedProps = {
    data: chartData,
    width: chartWidth,
    height: CHART_HEIGHT,
    isAnimated: true,
    noOfSections: 4,
    yAxisTextStyle: { color: '#9CA3AF', fontSize: 10 },
    xAxisLabelTextStyle: { color: '#9CA3AF', fontSize: 10 },
    rulesColor: '#F3F4F6',
    formatYLabel,
  };

  if (chartType === 'bar') {
    return (
      <BarChart {...sharedProps} frontColor={CHART_COLOR} barBorderRadius={4} />
    );
  }

  return (
    <LineChart
      {...sharedProps}
      color={CHART_COLOR}
      curved
      hideDataPoints={data.length > 14}
      dataPointsColor={CHART_COLOR}
      thickness={2}
      pointerConfig={{
        pointerStripHeight: CHART_HEIGHT - 20,
        pointerStripColor: '#D1FAE5',
        pointerStripWidth: 2,
        pointerColor: CHART_COLOR,
        radius: 5,
        pointerLabelWidth: 120,
        pointerLabelHeight: 56,
        activatePointersOnLongPress: false,
        autoAdjustPointerLabelPosition: true,
        pointerLabelComponent: (
          items: Array<{ label: string; value: number }>
        ) => (
          <View
            style={{
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
            <Text style={{ fontSize: 11, color: '#6B7280' }}>
              {items[0]?.label}
            </Text>
            <Text
              style={{ fontSize: 13, fontWeight: '700', color: CHART_COLOR }}
            >
              {metric === 'revenue'
                ? formatVND(items[0]?.value ?? 0)
                : items[0]?.value}
            </Text>
          </View>
        ),
      }}
    />
  );
}
