import React from 'react';
import { View, Text } from 'react-native';
import { IStatsSummary, IComparison } from '@/types/statistics';
import { formatVND } from '@/utils/statisticsHelpers';

interface RevenueCardProps {
  summary: IStatsSummary;
  comparison?: IComparison | null;
}

export default function RevenueCard({ summary, comparison }: RevenueCardProps) {
  return (
    <View
      className="mb-4 rounded-2xl p-4"
      style={{ backgroundColor: '#CAFFBB' }}
    >
      <View className="flex-row items-center justify-between">
        <Text className="font-body-semibold text-neutral-T30 text-base">
          Tổng doanh số
        </Text>
        {typeof comparison?.revenuePct === 'number' && (
          <View className="flex-row items-center">
            <Text
              className={`font-body-bold text-sm ${
                comparison.revenuePct > 0 ? 'text-primary' : 'text-red-600'
              }`}
            >
              {comparison.revenuePct > 0 ? '+' : ''}
              {comparison.revenuePct.toFixed(1)}%
            </Text>
          </View>
        )}
      </View>
      <Text className="font-body-bold text-neutral-T10 mt-2 text-3xl">
        {formatVND(summary.totalRevenue)}
      </Text>
    </View>
  );
}
