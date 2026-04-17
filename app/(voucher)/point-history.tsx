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

  const loadHistory = useCallback(async (pageNum: number, append = false) => {
    if (pageNum === 1) setIsLoading(true);
    else setIsFetchingMore(true);

    try {
      const res = await getPointHistoryApi({ page: pageNum, limit: PAGE_SIZE });
      const { currentPoints: pts, logs: newLogs, pagination } = res.data;
      setCurrentPoints(pts);
      setLogs((prev) => (append ? [...prev, ...newLogs] : newLogs));
      setHasMore(pageNum < pagination.totalPages);
    } catch (e) {
      Alert.alert(t('voucher.errorAlert'), t('voucher.loadPointHistoryError'));
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
    }
  }, []);

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
    <View className="flex-1 bg-neutral">
      <ManagementHeader
        title={t('voucher.pointHistoryTitle')}
        onBack={() => router.back()}
      />

      {/* ── Points Widget ── */}
      <View className="m-4">
        <View
          className="bg-primary-T95 rounded-2xl p-5 items-center gap-2"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.07,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <Text className="text-4xl">🍃</Text>
          <Text className="font-label text-xs font-semibold text-primary-T50 uppercase tracking-wider">
            {t('voucher.currentPointsLabel')}
          </Text>
          {isLoading ? (
            <ActivityIndicator color="#296C24" />
          ) : (
            <Text className="font-sans font-bold text-4xl text-primary-T20">
              {currentPoints.toLocaleString()}
            </Text>
          )}
          <Text className="font-label text-xs text-primary-T50">
            {t('voucher.pointsUnit')}
          </Text>
        </View>
      </View>

      {/* ── History List ── */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center gap-3">
          <ActivityIndicator size="large" color="#296C24" />
          <Text className="font-body text-sm text-neutral-T50">
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
            <View className="items-center justify-center py-20 gap-3">
              <MaterialIcons name="history" size={48} color="#C5C7C6" />
              <Text className="font-body text-sm text-neutral-T50 text-center">
                {t('voucher.emptyHistoryTitle')}
                {'\n'}
                {t('voucher.emptyHistoryDesc')}
              </Text>
            </View>
          }
          ListFooterComponent={
            isFetchingMore ? (
              <View className="py-4 items-center">
                <ActivityIndicator color="#296C24" />
              </View>
            ) : !hasMore && logs.length > 0 ? (
              <Text className="font-label text-xs text-neutral-T50 text-center py-4">
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
