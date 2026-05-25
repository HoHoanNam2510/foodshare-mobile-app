import React from 'react';
import { View, Text } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { IStatsSummary, IComparison } from '@/types/statistics';

interface StatsSummaryCardsProps {
  summary: IStatsSummary;
  comparison?: IComparison | null;
}

export default function StatsSummaryCards({
  summary,
  comparison,
}: StatsSummaryCardsProps) {
  const cards = [
    {
      key: 'given',
      label: 'Đã cho',
      value: summary.totalGiven,
      deltaPct: comparison?.givenPct,
      icon: 'arrow-upward' as const,
    },
    {
      key: 'received',
      label: 'Đã nhận',
      value: summary.totalReceived,
      deltaPct: comparison?.receivedPct,
      icon: 'arrow-downward' as const,
    },
    {
      key: 'transactions',
      label: 'Tổng giao dịch',
      value: summary.txCount,
      deltaPct: null,
      icon: 'receipt' as const,
    },
  ];

  return (
    <View className="flex-row flex-wrap">
      {cards.map((card, index) => (
        <View
          key={card.key}
          className={`${index === 2 ? 'w-full' : 'w-1/2'} p-2`}
        >
          <View className="dark:bg-neutral-T20 dark:border-neutral-T30 rounded-2xl bg-white p-4 shadow-sm dark:border dark:shadow-none">
            <View className="flex-row items-center justify-between">
              <View className="bg-primary-T95 dark:bg-primary-T20 rounded-xl p-2">
                <MaterialIcons name={card.icon} size={20} color="#72B866" />
              </View>
              {typeof card.deltaPct === 'number' && (
                <View className="flex-row items-center">
                  <MaterialIcons
                    name={
                      card.deltaPct > 0
                        ? 'arrow-upward'
                        : card.deltaPct < 0
                          ? 'arrow-downward'
                          : 'remove'
                    }
                    size={12}
                    color={card.deltaPct > 0 ? '#72B866' : '#DC2626'}
                  />
                  <Text
                    className={`font-body-semibold text-xs ${
                      card.deltaPct > 0 ? 'text-primary' : 'text-red-600'
                    }`}
                  >
                    {Math.abs(card.deltaPct).toFixed(1)}%
                  </Text>
                </View>
              )}
            </View>
            <Text className="font-body-bold text-neutral-T10 dark:text-neutral-T90 mt-2 text-2xl">
              {card.value}
            </Text>
            <Text className="text-neutral-T30 dark:text-neutral-T80 font-body text-sm">
              {card.label}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}
