import React, { useMemo } from 'react';
import { View, Text, useWindowDimensions } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { ITimeseriesPoint } from '@/types/statistics';
import { formatVND } from '@/utils/statisticsHelpers';

const COLOR_CURRENT = '#72B866';
const COLOR_PREVIOUS = '#6B7280';
const CHART_HEIGHT = 200;

interface CompareChartProps {
  current: ITimeseriesPoint[];
  previous: ITimeseriesPoint[];
  metric: 'given' | 'received' | 'revenue';
}

// "2026-05-01" → "01/5", "2026-05" → "T5"
function formatXLabel(name: string): string {
  if (name.length === 7) {
    return `T${parseInt(name.slice(5))}`;
  }
  const parts = name.split('-');
  return `${parts[2]}/${parseInt(parts[1])}`;
}

export default function CompareChart({
  current,
  previous,
  metric,
}: CompareChartProps) {
  // Bug 5 fix: account for gifted-charts y-axis width (~35px)
  const { width: screenWidth } = useWindowDimensions();
  const chartWidth = screenWidth - 130;

  const { currentData, previousData } = useMemo(() => {
    const getVal = (p: ITimeseriesPoint): number =>
      metric === 'given'
        ? p.given
        : metric === 'received'
          ? p.received
          : p.revenue;

    const cur = current.map((p) => ({
      value: getVal(p),
      label: formatXLabel(p.name),
    }));
    const prev = previous.map((p) => ({
      value: getVal(p),
      label: formatXLabel(p.name),
    }));
    return { currentData: cur, previousData: prev };
  }, [current, previous, metric]);

  const formatYLabel = (v: string): string => {
    const n = Number(v);
    if (metric !== 'revenue') return String(Math.round(n));
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}tr`;
    if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
    return String(n);
  };

  return (
    <View>
      <LineChart
        data={currentData}
        data2={previousData}
        color={COLOR_CURRENT}
        color2={COLOR_PREVIOUS}
        thickness={2}
        thickness2={2}
        width={chartWidth}
        height={CHART_HEIGHT}
        isAnimated
        curved
        hideDataPoints
        hideDataPoints2
        noOfSections={4}
        yAxisTextStyle={{ color: '#9CA3AF', fontSize: 10 }}
        xAxisLabelTextStyle={{ color: '#9CA3AF', fontSize: 10 }}
        rulesColor="#F3F4F6"
        formatYLabel={formatYLabel}
        pointerConfig={{
          pointerStripHeight: CHART_HEIGHT - 20,
          pointerStripColor: '#E5E7EB',
          pointerStripWidth: 2,
          radius: 5,
          activatePointersOnLongPress: false,
          autoAdjustPointerLabelPosition: true,
          pointerLabelWidth: 140,
          pointerLabelHeight: 76,
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
              <Text style={{ fontSize: 11, color: COLOR_CURRENT }}>
                {items[0]?.label ?? ''}
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: '700',
                  color: COLOR_CURRENT,
                }}
              >
                {metric === 'revenue'
                  ? formatVND(items[0]?.value ?? 0)
                  : items[0]?.value}
              </Text>
              <Text
                style={{ fontSize: 11, color: COLOR_PREVIOUS, marginTop: 4 }}
              >
                {items[1]?.label ?? ''}
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: '700',
                  color: COLOR_PREVIOUS,
                }}
              >
                {metric === 'revenue'
                  ? formatVND(items[1]?.value ?? 0)
                  : items[1]?.value}
              </Text>
            </View>
          ),
        }}
      />
      <View className="mt-2 flex-row justify-center gap-4">
        <View className="flex-row items-center">
          <View
            style={{
              width: 16,
              height: 3,
              backgroundColor: COLOR_CURRENT,
              marginRight: 4,
            }}
          />
          <Text className="text-neutral-T30 text-xs">Hiện tại</Text>
        </View>
        <View className="flex-row items-center">
          <View
            style={{
              width: 16,
              height: 3,
              backgroundColor: COLOR_PREVIOUS,
              marginRight: 4,
            }}
          />
          <Text className="text-neutral-T30 text-xs">So sánh</Text>
        </View>
      </View>
    </View>
  );
}
