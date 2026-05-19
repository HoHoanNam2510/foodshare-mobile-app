// app/(voucher)/point-history.tsx
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ManagementHeader from '@/components/shared/headers/ManagementHeader';

import PointHistoryItem from '@/components/voucher/PointHistoryItem';
import { getPointHistoryApi } from '@/lib/greenPointApi';
import type { IPointLog } from '@/lib/greenPointApi';
import { useTranslation } from 'react-i18next';

const PAGE_SIZE = 20;

export default function PointHistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [logs, setLogs] = useState<IPointLog[]>([]);
  const [currentPoints, setCurrentPoints] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { t } = useTranslation();

  const loadHistory = useCallback(
    async (pageNum: number, append = false) => {
      if (pageNum === 1) setIsLoading(true);
      else setIsFetchingMore(true);

      try {
        const res = await getPointHistoryApi({
          page: pageNum,
          limit: PAGE_SIZE,
        });
        const { currentPoints: pts, logs: newLogs, pagination } = res.data;
        setCurrentPoints(pts);
        setLogs((prev) => (append ? [...prev, ...newLogs] : newLogs));
        setHasMore(pageNum < pagination.totalPages);
      } catch {
        Alert.alert(
          t('voucher.errorAlert'),
          t('voucher.loadPointHistoryError')
        );
      } finally {
        setIsLoading(false);
        setIsFetchingMore(false);
      }
    },
    [t]
  );

  useEffect(() => {
    loadHistory(1);
  }, [loadHistory]);

  const handleLoadMore = () => {
    if (!hasMore || isFetchingMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    loadHistory(nextPage, true);
  };

  return (
    <View className="bg-neutral flex-1">
      <ManagementHeader
        title={t('voucher.pointHistoryTitle')}
        onBack={() => router.back()}
      />

      {/* ── Points Widget ── */}
      <View className="m-4">
        <View
          className="bg-primary-T95 items-center gap-2 rounded-2xl p-5"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.07,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <Text className="text-4xl">🍃</Text>
          <Text className="font-label text-primary-T50 text-xs font-semibold uppercase tracking-wider">
            {t('voucher.currentPointsLabel')}
          </Text>
          {isLoading ? (
            <ActivityIndicator color="#296C24" />
          ) : (
            <Text className="text-primary-T20 font-sans text-4xl font-bold">
              {currentPoints.toLocaleString()}
            </Text>
          )}
          <Text className="font-label text-primary-T50 text-xs">
            {t('voucher.pointsUnit')}
          </Text>
        </View>
      </View>

      {/* ── History List ── */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center gap-3">
          <ActivityIndicator size="large" color="#296C24" />
          <Text className="font-body text-neutral-T50 text-sm">
            {t('voucher.loadingHistory')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={logs}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: insets.bottom + 20,
            gap: 8,
          }}
          showsVerticalScrollIndicator={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListEmptyComponent={
            <View className="items-center justify-center gap-3 py-20">
              <MaterialIcons name="history" size={48} color="#C5C7C6" />
              <Text className="font-body text-neutral-T50 text-center text-sm">
                {t('voucher.emptyHistoryTitle')}
                {'\n'}
                {t('voucher.emptyHistoryDesc')}
              </Text>
            </View>
          }
          ListFooterComponent={
            isFetchingMore ? (
              <View className="items-center py-4">
                <ActivityIndicator color="#296C24" />
              </View>
            ) : !hasMore && logs.length > 0 ? (
              <Text className="font-label text-neutral-T50 py-4 text-center text-xs">
                {t('voucher.endOfHistory')}
              </Text>
            ) : null
          }
          renderItem={({ item }) => <PointHistoryItem log={item} />}
        />
      )}
    </View>
  );
}
