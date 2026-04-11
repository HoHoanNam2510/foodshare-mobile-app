// app/(review)/my-reviews.tsx
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
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

import { ReceivedReviewCard, WrittenReviewCard } from '@/components/review/ReviewCard';
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

function AverageRatingBadge({ average, count }: { average: number; count: number }) {
  if (count === 0) return null;
  return (
    <View className="mx-4 mb-3 bg-neutral-T100 rounded-2xl p-4 flex-row items-center gap-3" style={styles.card}>
      <View className="w-14 h-14 rounded-xl bg-primary-T95 items-center justify-center">
        <Text style={{ fontFamily: 'Epilogue', fontWeight: '800', fontSize: 20, color: '#296C24' }}>
          {average.toFixed(1)}
        </Text>
      </View>
      <View className="flex-1 gap-0.5">
        <Text style={{ fontFamily: 'Epilogue', fontWeight: '700' }} className="text-sm text-neutral-T10">
          Điểm uy tín của bạn
        </Text>
        <Text className="font-body text-xs text-neutral-T50">
          Trung bình từ {count} đánh giá đã nhận
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
  const cfg = {
    written: {
      icon: 'rate-review' as const,
      title: 'Chưa viết đánh giá nào',
      body: 'Sau khi hoàn thành giao dịch, hãy để lại đánh giá để nhận GreenPoints thưởng.',
    },
    received: {
      icon: 'star-border' as const,
      title: 'Chưa nhận được đánh giá nào',
      body: 'Khi đối tác giao dịch đánh giá bạn, chúng sẽ hiển thị tại đây.',
    },
  }[tab];

  return (
    <View className="flex-1 items-center justify-center py-24 px-8 gap-3">
      <View className="w-16 h-16 rounded-2xl bg-primary-T95 items-center justify-center">
        <MaterialIcons name={cfg.icon} size={28} color="#296C24" />
      </View>
      <Text className="font-sans font-bold text-base text-neutral-T10 text-center">{cfg.title}</Text>
      <Text className="font-body text-sm text-neutral-T50 text-center leading-5">{cfg.body}</Text>
    </View>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function MyReviewsScreen() {
  const router = useRouter();
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
  const [receivedLoading, setReceivedLoading] = useState(false);
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
      setWritten(res.data);
    } catch {
      setWrittenError('Không thể tải dữ liệu. Vui lòng thử lại.');
    } finally {
      setWrittenLoading(false);
      setWrittenRefreshing(false);
    }
  }, []);

  const loadReceived = useCallback(async (isRefresh = false) => {
    if (!myId) return;
    if (isRefresh) setReceivedRefreshing(true);
    else setReceivedLoading(true);
    setReceivedError(null);
    try {
      const res = await getUserReviewsApi(myId, { limit: 50 });
      setReceived(res.data);
    } catch {
      setReceivedError('Không thể tải dữ liệu. Vui lòng thử lại.');
    } finally {
      setReceivedLoading(false);
      setReceivedRefreshing(false);
      setReceivedLoaded(true);
    }
  }, [myId]);

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
    Alert.alert(
      'Rút lại đánh giá?',
      'Điểm uy tín của người được đánh giá sẽ được tính lại sau khi bạn rút lại. Thao tác này không thể hoàn tác.',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Rút lại',
          style: 'destructive',
          onPress: async () => {
            setDeletingId(reviewId);
            try {
              await deleteMyReviewApi(reviewId);
              setWritten((prev) => prev.filter((r) => r._id !== reviewId));
              Alert.alert('Đã rút lại', 'Đánh giá của bạn đã được xóa thành công.');
            } catch {
              Alert.alert('Lỗi', 'Không thể rút lại đánh giá. Vui lòng thử lại.');
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]
    );
  }, []);

  // ── Navigate to edit ───────────────────────────────────────────────────────

  const handleEdit = useCallback((review: IWrittenReview) => {
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
  }, [router]);

  // ── Report handler ─────────────────────────────────────────────────────────

  const handleReport = useCallback((reviewId: string, title: string) => {
    router.push({
      pathname: '/(report)/create-report',
      params: {
        targetType: 'REVIEW',
        targetId: reviewId,
        targetTitle: title,
      },
    } as any);
  }, [router]);

  // ── Computed ───────────────────────────────────────────────────────────────

  const receivedAverage =
    received.length > 0
      ? received.reduce((sum, r) => sum + r.rating, 0) / received.length
      : 0;

  const TABS: { key: TabKey; label: string; count: number }[] = [
    { key: 'written', label: 'Đã viết', count: written.length },
    { key: 'received', label: 'Đã nhận', count: received.length },
  ];

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <View className="flex-1 bg-neutral">
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <ManagementHeader title="Đánh giá của tôi" onBack={() => router.back()} />

      {/* ── Tab Bar ── */}
      <View className="mx-4 mt-4 mb-3 bg-neutral-T95 rounded-xl p-1 flex-row">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.8}
              className="flex-1 py-2.5 rounded-lg items-center"
              style={isActive ? styles.tabActive : undefined}
            >
              <View className="flex-row items-center gap-1.5">
                <Text
                  className="font-label font-semibold text-xs"
                  style={{ color: isActive ? '#296C24' : '#757777' }}
                >
                  {tab.label}
                </Text>
                {tab.count > 0 && (
                  <View
                    className="px-1.5 py-0.5 rounded-full"
                    style={{ backgroundColor: isActive ? '#296C24' : '#C8CACA' }}
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
            <Text className="font-body text-sm text-neutral-T50">Đang tải...</Text>
          </View>
        ) : writtenError ? (
          <View className="flex-1 items-center justify-center px-8 gap-4">
            <Text className="font-body text-sm text-neutral-T50 text-center">{writtenError}</Text>
            <TouchableOpacity
              onPress={() => loadWritten()}
              className="px-6 py-3 bg-primary-T40 rounded-xl"
              activeOpacity={0.85}
            >
              <Text className="font-label font-semibold text-neutral-T100">Thử lại</Text>
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
                onDelete={deletingId === item._id ? () => {} : () => handleDelete(item._id)}
              />
            )}
            ListEmptyComponent={<EmptyState tab="written" />}
            ListHeaderComponent={
              <View className="mx-4 mt-4 mb-3 p-3 bg-primary-T95 rounded-xl flex-row gap-2 items-start">
                <MaterialIcons name="info-outline" size={15} color="#296C24" style={{ marginTop: 1 }} />
                <Text className="font-body text-xs text-primary-T30 flex-1 leading-4">
                  Sửa hoặc rút lại đánh giá sẽ tự động tính lại điểm uy tín của người được đánh giá.
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
      ) : receivedLoading && !receivedLoaded ? (
        <View className="flex-1 items-center justify-center gap-3">
          <ActivityIndicator size="large" color="#296C24" />
          <Text className="font-body text-sm text-neutral-T50">Đang tải...</Text>
        </View>
      ) : receivedError ? (
        <View className="flex-1 items-center justify-center px-8 gap-4">
          <Text className="font-body text-sm text-neutral-T50 text-center">{receivedError}</Text>
          <TouchableOpacity
            onPress={() => loadReceived()}
            className="px-6 py-3 bg-primary-T40 rounded-xl"
            activeOpacity={0.85}
          >
            <Text className="font-label font-semibold text-neutral-T100">Thử lại</Text>
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
                    ? `Đánh giá từ ${(item.reviewerId as any).fullName}`
                    : 'Đánh giá'
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
          contentContainerStyle={{ paddingTop: 12, paddingBottom: 40, flexGrow: 1 }}
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
