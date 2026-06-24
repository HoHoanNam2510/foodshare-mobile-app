// app/(transaction)/transaction-list.tsx
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import ManagementHeader from '@/components/shared/headers/ManagementHeader';
import { useColorScheme } from 'nativewind';

import {
  cancelRequestApi,
  getMyTransactionsApi,
  getMyTransactionsAsOwnerApi,
  respondToRequestApi,
  type ITransaction,
  type ITransactionAsOwner,
  type TransactionStatus,
} from '@/lib/transactionApi';

// ── Constants ────────────────────────────────────────────────────────────────

const ACTIVE_STATUSES: TransactionStatus[] = ['PENDING', 'ACCEPTED'];
const HISTORY_STATUSES: TransactionStatus[] = [
  'COMPLETED',
  'CANCELLED',
  'REJECTED',
];
// Trạng thái donor hiển thị trong tab "Đang diễn ra" (đã xác nhận, chờ giao nhận)
const DONOR_ACTIVE_STATUSES: TransactionStatus[] = ['ACCEPTED'];

const STATUS_CONFIG: Record<
  TransactionStatus,
  { labelKey: string; bg: string; text: string }
> = {
  PENDING: {
    labelKey: 'transaction.statusPending',
    bg: '#FEF9C3',
    text: '#A16207',
  },
  ACCEPTED: {
    labelKey: 'transaction.statusAccepted',
    bg: '#DBEAFE',
    text: '#1D4ED8',
  },
  COMPLETED: {
    labelKey: 'transaction.statusCompleted',
    bg: '#DCFCE7',
    text: '#15803D',
  },
  CANCELLED: {
    labelKey: 'transaction.statusCancelled',
    bg: '#F3F4F6',
    text: '#6B7280',
  },
  REJECTED: {
    labelKey: 'transaction.statusRejected',
    bg: '#FEE2E2',
    text: '#DC2626',
  },
};

type TabKey = 'active' | 'history' | 'incoming';

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

// ── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: TransactionStatus }) {
  const { t } = useTranslation();
  const cfg = STATUS_CONFIG[status];
  return (
    <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
      <Text style={[styles.badgeText, { color: cfg.text }]}>
        {t(cfg.labelKey).toUpperCase()}
      </Text>
    </View>
  );
}

// ── Transaction Card (Receiver & Donor) ──────────────────────────────────────

interface TransactionCardProps {
  tx: Pick<
    ITransaction,
    '_id' | 'postId' | 'type' | 'status' | 'quantity' | 'createdAt'
  >;
  role: 'receiver' | 'donor';
  onPress: () => void;
  onCancel?: () => void;
  isCancelling?: boolean;
}

function TransactionCard({
  tx,
  role,
  onPress,
  onCancel,
  isCancelling,
}: TransactionCardProps) {
  const { t } = useTranslation();
  const post = tx.postId;
  const isP2P = tx.type === 'REQUEST';
  const canCancel =
    role === 'receiver' && tx.status === 'PENDING' && !!onCancel;

  if (!post) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.85}
        style={styles.card}
        className="bg-neutral-T100 dark:bg-neutral-T20 mx-4 mb-3 overflow-hidden rounded-2xl"
      >
        <View className="flex-row items-center gap-3 p-4">
          <View
            className="bg-neutral-T95 dark:bg-neutral-T30 items-center justify-center overflow-hidden rounded-xl"
            style={styles.thumb}
          >
            <MaterialIcons name="delete-outline" size={22} color="#AAABAB" />
          </View>
          <View className="flex-1 gap-1">
            <View className="flex-row items-center gap-2">
              <StatusBadge status={tx.status} />
            </View>
            <Text className="text-neutral-T50 font-sans text-sm italic leading-tight">
              {t('transaction.deletedPost')}
            </Text>
            <Text className="font-body text-neutral-T70 dark:text-neutral-T60 text-xs">
              {formatDate(tx.createdAt)}
            </Text>
          </View>
          <MaterialIcons name="chevron-right" size={20} color="#AAABAB" />
        </View>
      </TouchableOpacity>
    );
  }

  const thumb = post.images?.[0];

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={styles.card}
      className="bg-neutral-T100 dark:bg-neutral-T20 mx-4 mb-3 overflow-hidden rounded-2xl"
    >
      <View className="flex-row gap-3 p-4">
        <View
          className="bg-neutral-T95 dark:bg-neutral-T30 overflow-hidden rounded-xl"
          style={styles.thumb}
        >
          {thumb ? (
            <Image
              source={{ uri: thumb }}
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
            />
          ) : (
            <View className="flex-1 items-center justify-center">
              <MaterialIcons name="fastfood" size={22} color="#AAABAB" />
            </View>
          )}
        </View>

        <View className="flex-1 gap-1">
          <View className="flex-row flex-wrap items-center gap-2">
            <View
              className="rounded-md px-2 py-0.5"
              style={{ backgroundColor: isP2P ? '#DCFCE7' : '#FEF3C7' }}
            >
              <Text
                className="font-label text-[9px] font-bold uppercase tracking-wider"
                style={{ color: isP2P ? '#15803D' : '#92400E' }}
              >
                {isP2P ? 'P2P' : 'B2C'}
              </Text>
            </View>
            <StatusBadge status={tx.status} />
            {/* Role badge */}
            <View
              className="rounded-md px-2 py-0.5"
              style={{
                backgroundColor: role === 'donor' ? '#DCFCE7' : '#EFF6FF',
              }}
            >
              <Text
                className="font-label text-[9px] font-bold uppercase tracking-wider"
                style={{ color: role === 'donor' ? '#15803D' : '#1D4ED8' }}
              >
                {role === 'donor'
                  ? t('transaction.roleGiver')
                  : t('transaction.roleReceiver')}
              </Text>
            </View>
          </View>

          <Text
            className="text-neutral-T10 dark:text-neutral-T90 font-sans text-sm font-bold leading-tight"
            numberOfLines={2}
          >
            {post.title}
          </Text>

          <View className="mt-1 flex-row items-center justify-between">
            <Text className="font-body text-neutral-T50 text-xs">
              {isP2P
                ? t('common.free')
                : `${post.price.toLocaleString('vi-VN')}đ`}
              {'  ·  '}
              {t('transaction.qtyLabel')} {tx.quantity}
            </Text>
            <Text className="font-body text-neutral-T70 dark:text-neutral-T60 text-xs">
              {formatDate(tx.createdAt)}
            </Text>
          </View>
        </View>

        <View className="justify-center">
          <MaterialIcons name="chevron-right" size={20} color="#AAABAB" />
        </View>
      </View>

      {/* Cancel button — only for PENDING receiver requests */}
      {canCancel && (
        <View className="px-4 pb-4">
          <TouchableOpacity
            onPress={onCancel}
            disabled={isCancelling}
            activeOpacity={0.8}
            className="h-10 flex-row items-center justify-center gap-1.5 rounded-xl border border-red-200"
            style={{ backgroundColor: '#FEF2F2' }}
          >
            {isCancelling ? (
              <ActivityIndicator size="small" color="#DC2626" />
            ) : (
              <Text
                className="font-label text-sm font-semibold"
                style={{ color: '#DC2626' }}
              >
                {t('transaction.cancelRequest')}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
}

// ── Donor / Incoming Card ─────────────────────────────────────────────────────

interface IncomingCardProps {
  tx: ITransactionAsOwner;
  onRespond: (id: string, response: 'ACCEPT' | 'REJECT') => void;
  isResponding: boolean;
  onPress: () => void;
}

function IncomingCard({
  tx,
  onRespond,
  isResponding,
  onPress,
}: IncomingCardProps) {
  const { t } = useTranslation();
  const post = tx.postId;
  const requester = tx.requesterId;
  const thumb = post?.images?.[0];
  const isPending = tx.status === 'PENDING';

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={isPending ? 1 : 0.85}
      style={styles.card}
      className="bg-neutral-T100 dark:bg-neutral-T20 mx-4 mb-3 overflow-hidden rounded-2xl"
    >
      <View className="flex-row gap-3 p-4">
        {/* Thumbnail */}
        <View
          className="bg-neutral-T95 dark:bg-neutral-T30 overflow-hidden rounded-xl"
          style={styles.thumb}
        >
          {thumb ? (
            <Image
              source={{ uri: thumb }}
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
            />
          ) : (
            <View className="flex-1 items-center justify-center">
              <MaterialIcons name="fastfood" size={22} color="#AAABAB" />
            </View>
          )}
        </View>

        {/* Info */}
        <View className="flex-1 gap-1">
          <Text
            className="text-neutral-T10 dark:text-neutral-T90 font-sans text-sm font-bold leading-tight"
            numberOfLines={2}
          >
            {post?.title ?? t('transaction.deletedPost')}
          </Text>

          {/* Requester row */}
          <View className="flex-row items-center gap-1.5">
            {requester.avatar ? (
              <Image
                source={{ uri: requester.avatar }}
                className="h-4 w-4 rounded-full"
              />
            ) : (
              <View className="bg-primary-T95 dark:bg-primary-T20 h-4 w-4 items-center justify-center rounded-full">
                <MaterialIcons name="person" size={10} color="#296C24" />
              </View>
            )}
            <Text
              className="font-body text-neutral-T50 dark:text-neutral-T60 text-xs"
              numberOfLines={1}
            >
              {requester.fullName}
            </Text>
          </View>

          <View className="mt-0.5 flex-row items-center justify-between">
            <StatusBadge status={tx.status} />
            <Text className="font-body text-neutral-T70 dark:text-neutral-T60 text-xs">
              {formatDate(tx.createdAt)}
            </Text>
          </View>
        </View>

        {!isPending && (
          <View className="justify-center">
            <MaterialIcons name="chevron-right" size={20} color="#AAABAB" />
          </View>
        )}
      </View>

      {/* Accept / Reject buttons — only for PENDING */}
      {isPending && (
        <View className="flex-row gap-2 px-4 pb-4">
          <TouchableOpacity
            onPress={() => onRespond(tx._id, 'REJECT')}
            disabled={isResponding}
            className="h-10 flex-1 items-center justify-center rounded-xl border border-red-200"
            style={{ backgroundColor: '#FEF2F2' }}
            activeOpacity={0.8}
          >
            <Text
              className="font-label text-sm font-semibold"
              style={{ color: '#DC2626' }}
            >
              {t('transaction.reject')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onRespond(tx._id, 'ACCEPT')}
            disabled={isResponding}
            className="bg-primary-T40 h-10 flex-1 items-center justify-center rounded-xl"
            activeOpacity={0.8}
          >
            {isResponding ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text className="font-label text-neutral-T100 text-sm font-semibold">
                {t('transaction.accept')}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
}

function EmptyState({ tab }: { tab: TabKey }) {
  const { t } = useTranslation();
  const configs = {
    active: {
      icon: 'receipt-long' as const,
      titleKey: 'transaction.emptyActiveTitle',
      bodyKey: 'transaction.emptyActiveBody',
    },
    history: {
      icon: 'history' as const,
      titleKey: 'transaction.emptyHistoryTitle',
      bodyKey: 'transaction.emptyHistoryBody',
    },
    incoming: {
      icon: 'inbox' as const,
      titleKey: 'transaction.emptyIncomingTitle',
      bodyKey: 'transaction.emptyIncomingBody',
    },
  };
  const cfg = configs[tab];
  return (
    <View className="flex-1 items-center justify-center gap-3 px-8 py-24">
      <View className="bg-primary-T95 dark:bg-primary-T20 h-16 w-16 items-center justify-center rounded-2xl">
        <MaterialIcons name={cfg.icon} size={28} color="#296C24" />
      </View>
      <Text className="text-neutral-T10 dark:text-neutral-T90 text-center font-sans text-base font-bold">
        {t(cfg.titleKey)}
      </Text>
      <Text className="font-body text-neutral-T50 dark:text-neutral-T60 text-center text-sm leading-5">
        {t(cfg.bodyKey)}
      </Text>
    </View>
  );
}

// ── Main Screen ──────────────────────────────────────────────────────────────

export default function TransactionListScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Receiver state
  const [transactions, setTransactions] = useState<ITransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Donor state
  const [ownerTransactions, setOwnerTransactions] = useState<
    ITransactionAsOwner[]
  >([]);
  const [ownerLoading, setOwnerLoading] = useState(false);
  const [ownerLoaded, setOwnerLoaded] = useState(false);
  const [ownerError, setOwnerError] = useState<string | null>(null);
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<TabKey>('active');

  const loadReceiver = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setIsRefreshing(true);
      else setIsLoading(true);
      setError(null);
      try {
        const res = await getMyTransactionsApi();
        setTransactions(res.data);
      } catch {
        setError(t('review.loadError'));
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [t]
  );

  const loadOwner = useCallback(async () => {
    setOwnerLoading(true);
    setOwnerError(null);
    try {
      const res = await getMyTransactionsAsOwnerApi();
      setOwnerTransactions(res.data);
    } catch {
      setOwnerError(t('review.loadError'));
    } finally {
      setOwnerLoading(false);
      setOwnerLoaded(true);
    }
  }, [t]);

  // Load both datasets on mount
  useEffect(() => {
    loadReceiver();
    loadOwner();
  }, [loadReceiver, loadOwner]);

  const handleRespond = useCallback(
    async (transactionId: string, response: 'ACCEPT' | 'REJECT') => {
      setRespondingId(transactionId);
      try {
        await respondToRequestApi(transactionId, response);
        // Reload both: donor sees updated incoming, receiver sees new ACCEPTED in active
        await Promise.all([loadOwner(), loadReceiver()]);
        Alert.alert(
          response === 'ACCEPT'
            ? t('transaction.acceptedAlertTitle')
            : t('transaction.rejectedAlertTitle'),
          response === 'ACCEPT'
            ? t('transaction.requestAcceptedMsg')
            : t('transaction.requestRejectedMsg')
        );
      } catch (e: any) {
        Alert.alert(
          t('common.error'),
          e?.response?.data?.message ?? t('common.error')
        );
      } finally {
        setRespondingId(null);
      }
    },
    [loadOwner, loadReceiver, t]
  );

  const handleCancel = useCallback(
    async (transactionId: string) => {
      setCancellingId(transactionId);
      try {
        await cancelRequestApi(transactionId);
        await loadReceiver();
        Alert.alert(
          t('transaction.cancelledAlertTitle'),
          t('transaction.cancelledRequestMsg')
        );
      } catch (e: any) {
        Alert.alert(
          t('common.error'),
          e?.response?.data?.message ?? t('common.error')
        );
      } finally {
        setCancellingId(null);
      }
    },
    [loadReceiver, t]
  );

  const navigateToDetail = useCallback(
    (id: string) => {
      router.push({
        pathname: '/(transaction)/transaction-detail' as any,
        params: { id },
      });
    },
    [router]
  );

  // ── Computed lists for each tab ──────────────────────────────────────────────

  // "Đang diễn ra": receiver PENDING/ACCEPTED/ESCROWED + donor ACCEPTED (already confirmed)
  const activeReceiverTxs = transactions.filter((tx) =>
    ACTIVE_STATUSES.includes(tx.status)
  );
  const activeDonorTxs = ownerTransactions.filter((tx) =>
    DONOR_ACTIVE_STATUSES.includes(tx.status)
  );

  // "Lịch sử": both receiver and donor completed/cancelled/rejected
  const historyReceiverTxs = transactions.filter((tx) =>
    HISTORY_STATUSES.includes(tx.status)
  );
  const historyDonorTxs = ownerTransactions.filter((tx) =>
    HISTORY_STATUSES.includes(tx.status)
  );

  // "Nhận yêu cầu": only PENDING incoming requests (awaiting donor response)
  const pendingIncomingTxs = ownerTransactions.filter(
    (tx) => tx.status === 'PENDING'
  );

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'active', label: t('transaction.tabActive') },
    { key: 'history', label: t('transaction.tabHistory') },
    { key: 'incoming', label: t('transaction.tabIncoming') },
  ];

  return (
    <View className="bg-neutral dark:bg-neutral-T10 flex-1">
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      <ManagementHeader
        title={t('transaction.myTransactions')}
        onBack={() => router.back()}
      />

      {/* ── Tab Bar ── */}
      <View className="bg-neutral-T95 dark:bg-neutral-T30 mx-4 mb-3 mt-4 flex-row rounded-xl p-1">
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            activeOpacity={0.8}
            className="flex-1 items-center rounded-lg py-2.5"
            style={
              activeTab === tab.key
                ? {
                    ...styles.tabActive,
                    backgroundColor: isDark ? '#2E3131' : '#FFFFFF',
                  }
                : undefined
            }
          >
            <Text
              className="font-label text-xs font-semibold"
              style={{
                color:
                  activeTab === tab.key
                    ? isDark
                      ? '#5CA051'
                      : '#296C24'
                    : isDark
                      ? '#8F9190'
                      : '#757777',
              }}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Content ── */}
      {activeTab === 'incoming' ? (
        ownerLoading && !ownerLoaded ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#296C24" />
            <Text className="font-body text-neutral-T50 dark:text-neutral-T60 mt-3 text-sm">
              {t('common.loading')}
            </Text>
          </View>
        ) : ownerError ? (
          <View className="flex-1 items-center justify-center gap-4 px-8">
            <Text className="font-body text-neutral-T50 text-center text-sm">
              {ownerError}
            </Text>
            <TouchableOpacity
              onPress={loadOwner}
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
            data={pendingIncomingTxs}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <IncomingCard
                tx={item}
                onRespond={handleRespond}
                isResponding={respondingId === item._id}
                onPress={() => navigateToDetail(item._id)}
              />
            )}
            ListEmptyComponent={<EmptyState tab="incoming" />}
            refreshControl={
              <RefreshControl
                refreshing={ownerLoading}
                onRefresh={loadOwner}
                tintColor="#296C24"
              />
            }
            contentContainerStyle={{
              paddingTop: 16,
              paddingBottom: 40,
              flexGrow: 1,
            }}
            showsVerticalScrollIndicator={false}
          />
        )
      ) : isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#296C24" />
          <Text className="font-body text-neutral-T50 dark:text-neutral-T60 mt-3 text-sm">
            {t('common.loading')}
          </Text>
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center gap-4 px-8">
          <Text className="font-body text-neutral-T50 text-center text-sm">
            {error}
          </Text>
          <TouchableOpacity
            onPress={() => loadReceiver()}
            className="bg-primary-T40 rounded-xl px-6 py-3"
            activeOpacity={0.85}
          >
            <Text className="font-label text-neutral-T100 font-semibold">
              {t('common.retry')}
            </Text>
          </TouchableOpacity>
        </View>
      ) : activeTab === 'active' ? (
        <FlatList
          data={[
            ...activeReceiverTxs.map((tx) => ({
              tx,
              role: 'receiver' as const,
            })),
            ...activeDonorTxs.map((tx) => ({ tx, role: 'donor' as const })),
          ]}
          keyExtractor={(item) => `${item.role}-${item.tx._id}`}
          renderItem={({ item }) => (
            <TransactionCard
              tx={item.tx}
              role={item.role}
              onPress={() => navigateToDetail(item.tx._id)}
              onCancel={
                item.role === 'receiver'
                  ? () => handleCancel(item.tx._id)
                  : undefined
              }
              isCancelling={cancellingId === item.tx._id}
            />
          )}
          ListEmptyComponent={<EmptyState tab="active" />}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => {
                loadReceiver(true);
                loadOwner();
              }}
              tintColor="#296C24"
            />
          }
          contentContainerStyle={{
            paddingTop: 16,
            paddingBottom: 40,
            flexGrow: 1,
          }}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <FlatList
          data={[
            ...historyReceiverTxs.map((tx) => ({
              tx,
              role: 'receiver' as const,
            })),
            ...historyDonorTxs.map((tx) => ({ tx, role: 'donor' as const })),
          ]}
          keyExtractor={(item) => `${item.role}-${item.tx._id}`}
          renderItem={({ item }) => (
            <TransactionCard
              tx={item.tx}
              role={item.role}
              onPress={() => navigateToDetail(item.tx._id)}
            />
          )}
          ListEmptyComponent={<EmptyState tab="history" />}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => {
                loadReceiver(true);
                loadOwner();
              }}
              tintColor="#296C24"
            />
          }
          contentContainerStyle={{
            paddingTop: 16,
            paddingBottom: 40,
            flexGrow: 1,
          }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 3,
  },
  thumb: {
    width: 72,
    height: 72,
  },
  badge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontFamily: 'BeVietnamPro-SemiBold',
    fontSize: 9,
    letterSpacing: 0.5,
  },
  tabActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
});
