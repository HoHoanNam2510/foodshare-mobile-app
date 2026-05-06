// app/(review)/my-reviews.tsx
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  ReceivedReviewCard,
  WrittenReviewCard,
} from '@/components/review/ReviewCard';
import ManagementHeader from '@/components/shared/headers/ManagementHeader';
import {
  deleteMyReviewApi,
  getMyWrittenReviewsApi,
  getUserReviewsApi,
  type IReceivedReview,
  type IWrittenReview,
} from '@/lib/reviewApi';
import { useAuthStore } from '@/stores/authStore';

// ── Types ─────────────────────────────────────────────────────────────────────

type TabKey = 'written' | 'received';

// ── Helpers ───────────────────────────────────────────────────────────────────

function AverageRatingBadge({
  average,
  count,
}: {
  average: number;
  count: number;
}) {
  const { t } = useTranslation();
  if (count === 0) return null;
  return (
    <View
      className="bg-neutral-T100 mx-4 mb-3 flex-row items-center gap-3 rounded-2xl p-4"
      style={styles.card}
    >
      <View className="bg-primary-T95 h-14 w-14 items-center justify-center rounded-xl">
        <Text
          style={{
            fontFamily: 'Epilogue',
            fontWeight: '800',
            fontSize: 20,
            color: '#296C24',
          }}
        >
          {average.toFixed(1)}
        </Text>
      </View>
      <View className="flex-1 gap-0.5">
        <Text
          style={{ fontFamily: 'Epilogue', fontWeight: '700' }}
          className="text-neutral-T10 text-sm"
        >
          {t('review.trustScoreTitle')}
        </Text>
        <Text className="font-body text-neutral-T50 text-xs">
          {t('review.trustScoreFrom', { count })}
        </Text>
      </View>
      <View className="flex-row gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <MaterialIcons
            key={s}
            name={s <= Math.round(average) ? 'star' : 'star-border'}
            size={14}
            color="#F59E0B"
          />
        ))}
      </View>
    </View>
  );
}

function EmptyState({ tab }: { tab: TabKey }) {
  const { t } = useTranslation();
  const cfg = {
    written: {
      icon: 'rate-review' as const,
      titleKey: 'review.emptyWrittenTitle',
      bodyKey: 'review.emptyWrittenBody',
    },
    received: {
      icon: 'star-border' as const,
      titleKey: 'review.emptyReceivedTitle',
      bodyKey: 'review.emptyReceivedBody',
    },
  }[tab];

  return (
    <View className="flex-1 items-center justify-center gap-3 px-8 py-24">
      <View className="bg-primary-T95 h-16 w-16 items-center justify-center rounded-2xl">
        <MaterialIcons name={cfg.icon} size={28} color="#296C24" />
      </View>
      <Text className="text-neutral-T10 text-center font-sans text-base font-bold">
        {t(cfg.titleKey)}
      </Text>
      <Text className="font-body text-neutral-T50 text-center text-sm leading-5">
        {t(cfg.bodyKey)}
      </Text>
    </View>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function MyReviewsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const myId = user?._id ?? '';

  const [activeTab, setActiveTab] = useState<TabKey>('written');

  // Written reviews state
  const [written, setWritten] = useState<IWrittenReview[]>([]);
  const [writtenLoading, setWrittenLoading] = useState(true);
  const [writtenRefreshing, setWrittenRefreshing] = useState(false);
  const [writtenError, setWrittenError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Received reviews state
  const [received, setReceived] = useState<IReceivedReview[]>([]);
  const [receivedLoaded, setReceivedLoaded] = useState(false);
  const [receivedRefreshing, setReceivedRefreshing] = useState(false);
  const [receivedError, setReceivedError] = useState<string | null>(null);

  // ── Loaders ────────────────────────────────────────────────────────────────

  const loadWritten = useCallback(async (isRefresh = false) => {
    if (isRefresh) setWrittenRefreshing(true);
    else setWrittenLoading(true);
    setWrittenError(null);
    try {
      const res = await getMyWrittenReviewsApi({ limit: 50 });
      setWritten(res.data ?? []);
    } catch {
      setWrittenError(t('review.loadError'));
    } finally {
      setWrittenLoading(false);
      setWrittenRefreshing(false);
    }
  }, []);

  const loadReceived = useCallback(
    async (isRefresh = false) => {
      if (!myId) return;
      if (isRefresh) setReceivedRefreshing(true);
      setReceivedError(null);
      try {
        const res = await getUserReviewsApi(myId, { limit: 50 });
        setReceived(res.data ?? []);
      } catch {
        setReceivedError(t('review.loadError'));
      } finally {
        setReceivedRefreshing(false);
        setReceivedLoaded(true);
      }
    },
    [myId]
  );

  useEffect(() => {
    loadWritten();
  }, [loadWritten]);

  // Lazy-load received reviews on first tab switch
  useEffect(() => {
    if (activeTab === 'received' && !receivedLoaded) {
      loadReceived();
    }
  }, [activeTab, receivedLoaded, loadReceived]);

  // ── Delete handler ─────────────────────────────────────────────────────────

  const handleDelete = useCallback((reviewId: string) => {
    Alert.alert(t('review.withdrawTitle'), t('review.withdrawConfirmMsg'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('review.withdrawBtn'),
        style: 'destructive',
        onPress: async () => {
          setDeletingId(reviewId);
          try {
            await deleteMyReviewApi(reviewId);
            setWritten((prev) => prev.filter((r) => r._id !== reviewId));
            Alert.alert(t('review.withdrawnTitle'), t('review.withdrawnMsg'));
          } catch {
            Alert.alert(t('common.error'), t('review.withdrawError'));
          } finally {
            setDeletingId(null);
          }
        },
      },
    ]);
  }, []);

  // ── Navigate to edit ───────────────────────────────────────────────────────

  const handleEdit = useCallback(
    (review: IWrittenReview) => {
      router.push({
        pathname: '/(review)/create-review',
        params: {
          reviewId: review._id,
          existingRating: String(review.rating),
          existingFeedback: review.feedback ?? '',
          revieweeName:
            typeof review.revieweeId === 'object'
              ? (review.revieweeId as any).fullName
              : '',
        },
      } as any);
    },
    [router]
  );

  // ── Report handler ─────────────────────────────────────────────────────────

  const handleReport = useCallback(
    (reviewId: string, title: string) => {
      router.push({
        pathname: '/(report)/create-report',
        params: {
          targetType: 'REVIEW',
          targetId: reviewId,
          targetTitle: title,
        },
      } as any);
    },
    [router]
  );

  // ── Computed ───────────────────────────────────────────────────────────────

  const receivedAverage =
    received.length > 0
      ? received.reduce((sum, r) => sum + r.rating, 0) / received.length
      : 0;

  const TABS: { key: TabKey; label: string; count: number }[] = [
    { key: 'written', label: t('review.writtenTab'), count: written.length },
    { key: 'received', label: t('review.receivedTab'), count: received.length },
  ];

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <View className="bg-neutral flex-1">
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />
      <ManagementHeader
        title={t('review.myReviewsTitle')}
        onBack={() => router.back()}
      />

      {/* ── Tab Bar ── */}
      <View className="bg-neutral-T95 mx-4 mb-3 mt-4 flex-row rounded-xl p-1">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.8}
              className="flex-1 items-center rounded-lg py-2.5"
              style={isActive ? styles.tabActive : undefined}
            >
              <View className="flex-row items-center gap-1.5">
                <Text
                  className="font-label text-xs font-semibold"
                  style={{ color: isActive ? '#296C24' : '#757777' }}
                >
                  {tab.label}
                </Text>
                {tab.count > 0 && (
                  <View
                    className="rounded-full px-1.5 py-0.5"
                    style={{
                      backgroundColor: isActive ? '#296C24' : '#C8CACA',
                    }}
                  >
                    <Text
                      className="font-label font-bold"
                      style={{ fontSize: 9, color: '#FFFFFF' }}
                    >
                      {tab.count}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── Content ── */}
      {activeTab === 'written' ? (
        writtenLoading ? (
          <View className="flex-1 items-center justify-center gap-3">
            <ActivityIndicator size="large" color="#296C24" />
            <Text className="font-body text-neutral-T50 text-sm">
              {t('common.loading')}
            </Text>
          </View>
        ) : writtenError ? (
          <View className="flex-1 items-center justify-center gap-4 px-8">
            <Text className="font-body text-neutral-T50 text-center text-sm">
              {writtenError}
            </Text>
            <TouchableOpacity
              onPress={() => loadWritten()}
              className="bg-primary-T40 rounded-xl px-6 py-3"
              activeOpacity={0.85}
            >
              <Text className="font-label text-neutral-T100 font-semibold">
                {t('common.retry')}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={written}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <WrittenReviewCard
                review={item}
                onEdit={() => handleEdit(item)}
                onDelete={
                  deletingId === item._id
                    ? () => {}
                    : () => handleDelete(item._id)
                }
              />
            )}
            ListEmptyComponent={<EmptyState tab="written" />}
            ListHeaderComponent={
              <View className="bg-primary-T95 mx-4 mb-3 mt-4 flex-row items-start gap-2 rounded-xl p-3">
                <MaterialIcons
                  name="info-outline"
                  size={15}
                  color="#296C24"
                  style={{ marginTop: 1 }}
                />
                <Text className="font-body text-primary-T30 flex-1 text-xs leading-4">
                  {t('review.editRecalcInfo')}
                </Text>
              </View>
            }
            refreshControl={
              <RefreshControl
                refreshing={writtenRefreshing}
                onRefresh={() => loadWritten(true)}
                tintColor="#296C24"
              />
            }
            contentContainerStyle={{ paddingBottom: 40, flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
          />
        )
      ) : !receivedLoaded && !receivedError ? (
        <View className="flex-1 items-center justify-center gap-3">
          <ActivityIndicator size="large" color="#296C24" />
          <Text className="font-body text-neutral-T50 text-sm">
            {t('common.loading')}
          </Text>
        </View>
      ) : receivedError ? (
        <View className="flex-1 items-center justify-center gap-4 px-8">
          <Text className="font-body text-neutral-T50 text-center text-sm">
            {receivedError}
          </Text>
          <TouchableOpacity
            onPress={() => loadReceived()}
            className="bg-primary-T40 rounded-xl px-6 py-3"
            activeOpacity={0.85}
          >
            <Text className="font-label text-neutral-T100 font-semibold">
              {t('common.retry')}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={received}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <ReceivedReviewCard
              review={item}
              onReport={() =>
                handleReport(
                  item._id,
                  typeof item.reviewerId === 'object'
                    ? `${t('review.reviewedYou')} — ${(item.reviewerId as any).fullName}`
                    : t('review.title')
                )
              }
            />
          )}
          ListEmptyComponent={<EmptyState tab="received" />}
          ListHeaderComponent={
            received.length > 0 ? (
              <AverageRatingBadge
                average={receivedAverage}
                count={received.length}
              />
            ) : null
          }
          refreshControl={
            <RefreshControl
              refreshing={receivedRefreshing}
              onRefresh={() => loadReceived(true)}
              tintColor="#296C24"
            />
          }
          contentContainerStyle={{
            paddingTop: 12,
            paddingBottom: 40,
            flexGrow: 1,
          }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 3,
  },
  tabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
});
