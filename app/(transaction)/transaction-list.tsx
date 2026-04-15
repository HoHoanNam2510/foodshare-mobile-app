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

const ACTIVE_STATUSES: TransactionStatus[] = ['PENDING', 'ACCEPTED', 'ESCROWED'];
const HISTORY_STATUSES: TransactionStatus[] = ['COMPLETED', 'CANCELLED', 'REJECTED', 'REFUNDED', 'DISPUTED'];
// Trạng thái donor hiển thị trong tab "Đang diễn ra" (đã xác nhận, chờ giao nhận)
const DONOR_ACTIVE_STATUSES: TransactionStatus[] = ['ACCEPTED', 'ESCROWED'];

const STATUS_CONFIG: Record<TransactionStatus, { labelKey: string; bg: string; text: string }> = {
  PENDING:   { labelKey: 'transaction.statusPending',   bg: '#FEF9C3', text: '#A16207' },
  ACCEPTED:  { labelKey: 'transaction.statusAccepted',  bg: '#DBEAFE', text: '#1D4ED8' },
  ESCROWED:  { labelKey: 'transaction.statusEscrowed',  bg: '#F3E8FF', text: '#7E22CE' },
  COMPLETED: { labelKey: 'transaction.statusCompleted', bg: '#DCFCE7', text: '#15803D' },
  CANCELLED: { labelKey: 'transaction.statusCancelled', bg: '#F3F4F6', text: '#6B7280' },
  REJECTED:  { labelKey: 'transaction.statusRejected',  bg: '#FEE2E2', text: '#DC2626' },
  REFUNDED:  { labelKey: 'transaction.statusRefunded',  bg: '#FFF7ED', text: '#C2410C' },
  DISPUTED:  { labelKey: 'transaction.statusDisputed',  bg: '#FFF1F2', text: '#BE123C' },
};

type TabKey = 'active' | 'history' | 'incoming';

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// ── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: TransactionStatus }) {
  const { t } = useTranslation();
  const cfg = STATUS_CONFIG[status];
  return (
    <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
      <Text style={[styles.badgeText, { color: cfg.text }]}>{t(cfg.labelKey).toUpperCase()}</Text>
    </View>
  );
}

// ── Transaction Card (Receiver & Donor) ──────────────────────────────────────

interface TransactionCardProps {
  tx: Pick<ITransaction, '_id' | 'postId' | 'type' | 'status' | 'quantity' | 'createdAt'>;
  role: 'receiver' | 'donor';
  onPress: () => void;
  onCancel?: () => void;
  isCancelling?: boolean;
}

function TransactionCard({ tx, role, onPress, onCancel, isCancelling }: TransactionCardProps) {
  const { t } = useTranslation();
  const post = tx.postId;
  const isP2P = tx.type === 'REQUEST';
  const thumb = post.images?.[0];
  const canCancel = role === 'receiver' && tx.status === 'PENDING' && !!onCancel;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={styles.card}
      className="bg-neutral-T100 rounded-2xl mx-4 mb-3 overflow-hidden"
    >
      <View className="flex-row p-4 gap-3">
        <View className="rounded-xl overflow-hidden bg-neutral-T95" style={styles.thumb}>
          {thumb ? (
            <Image source={{ uri: thumb }} style={StyleSheet.absoluteFill} resizeMode="cover" />
          ) : (
            <View className="flex-1 items-center justify-center">
              <MaterialIcons name="fastfood" size={22} color="#AAABAB" />
            </View>
          )}
        </View>

        <View className="flex-1 gap-1">
          <View className="flex-row items-center gap-2 flex-wrap">
            <View
              className="px-2 py-0.5 rounded-md"
              style={{ backgroundColor: isP2P ? '#DCFCE7' : '#FEF3C7' }}
            >
              <Text
                className="font-label font-bold text-[9px] uppercase tracking-wider"
                style={{ color: isP2P ? '#15803D' : '#92400E' }}
              >
                {isP2P ? 'P2P' : 'B2C'}
              </Text>
            </View>
            <StatusBadge status={tx.status} />
            {/* Role badge */}
            <View className="px-2 py-0.5 rounded-md" style={{ backgroundColor: role === 'donor' ? '#DCFCE7' : '#EFF6FF' }}>
              <Text className="font-label font-bold text-[9px] uppercase tracking-wider" style={{ color: role === 'donor' ? '#15803D' : '#1D4ED8' }}>
                {role === 'donor' ? t('transaction.roleGiver') : t('transaction.roleReceiver')}
              </Text>
            </View>
          </View>

          <Text className="font-sans font-bold text-sm text-neutral-T10 leading-tight" numberOfLines={2}>
            {post.title}
          </Text>

          <View className="flex-row items-center justify-between mt-1">
            <Text className="font-body text-xs text-neutral-T50">
              {isP2P ? t('common.free') : `${post.price.toLocaleString('vi-VN')}đ`}
              {'  ·  '}{t('transaction.qtyLabel')} {tx.quantity}
            </Text>
            <Text className="font-body text-xs text-neutral-T70">{formatDate(tx.createdAt)}</Text>
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
            className="h-10 rounded-xl border border-red-200 items-center justify-center flex-row gap-1.5"
            style={{ backgroundColor: '#FEF2F2' }}
          >
            {isCancelling ? (
              <ActivityIndicator size="small" color="#DC2626" />
            ) : (
              <Text className="font-label font-semibold text-sm" style={{ color: '#DC2626' }}>
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

function IncomingCard({ tx, onRespond, isResponding, onPress }: IncomingCardProps) {
  const { t } = useTranslation();
  const post = tx.postId;
  const requester = tx.requesterId;
  const thumb = post.images?.[0];
  const isPending = tx.status === 'PENDING';

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={isPending ? 1 : 0.85}
      style={styles.card}
      className="bg-neutral-T100 rounded-2xl mx-4 mb-3 overflow-hidden"
    >
      <View className="flex-row p-4 gap-3">
        {/* Thumbnail */}
        <View className="rounded-xl overflow-hidden bg-neutral-T95" style={styles.thumb}>
          {thumb ? (
            <Image source={{ uri: thumb }} style={StyleSheet.absoluteFill} resizeMode="cover" />
          ) : (
            <View className="flex-1 items-center justify-center">
              <MaterialIcons name="fastfood" size={22} color="#AAABAB" />
            </View>
          )}
        </View>

        {/* Info */}
        <View className="flex-1 gap-1">
          <Text className="font-sans font-bold text-sm text-neutral-T10 leading-tight" numberOfLines={2}>
            {post.title}
          </Text>

          {/* Requester row */}
          <View className="flex-row items-center gap-1.5">
            {requester.avatar ? (
              <Image source={{ uri: requester.avatar }} className="w-4 h-4 rounded-full" />
            ) : (
              <View className="w-4 h-4 rounded-full bg-primary-T95 items-center justify-center">
                <MaterialIcons name="person" size={10} color="#296C24" />
              </View>
            )}
            <Text className="font-body text-xs text-neutral-T50" numberOfLines={1}>
              {requester.fullName}
            </Text>
          </View>

          <View className="flex-row items-center justify-between mt-0.5">
            <StatusBadge status={tx.status} />
            <Text className="font-body text-xs text-neutral-T70">{formatDate(tx.createdAt)}</Text>
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
            className="flex-1 h-10 rounded-xl border border-red-200 items-center justify-center"
            style={{ backgroundColor: '#FEF2F2' }}
            activeOpacity={0.8}
          >
            <Text className="font-label font-semibold text-sm" style={{ color: '#DC2626' }}>
              {t('transaction.reject')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onRespond(tx._id, 'ACCEPT')}
            disabled={isResponding}
            className="flex-1 h-10 rounded-xl bg-primary-T40 items-center justify-center"
            activeOpacity={0.8}
          >
            {isResponding ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text className="font-label font-semibold text-sm text-neutral-T100">
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
    active:   { icon: 'receipt-long' as const, titleKey: 'transaction.emptyActiveTitle',   bodyKey: 'transaction.emptyActiveBody' },
    history:  { icon: 'history' as const,      titleKey: 'transaction.emptyHistoryTitle',  bodyKey: 'transaction.emptyHistoryBody' },
    incoming: { icon: 'inbox' as const,         titleKey: 'transaction.emptyIncomingTitle', bodyKey: 'transaction.emptyIncomingBody' },
  };
  const cfg = configs[tab];
  return (
    <View className="flex-1 items-center justify-center py-24 px-8 gap-3">
      <View className="w-16 h-16 rounded-2xl bg-primary-T95 items-center justify-center">
        <MaterialIcons name={cfg.icon} size={28} color="#296C24" />
      </View>
      <Text className="font-sans font-bold text-base text-neutral-T10 text-center">{t(cfg.titleKey)}</Text>
      <Text className="font-body text-sm text-neutral-T50 text-center leading-5">{t(cfg.bodyKey)}</Text>
    </View>
  );
}

// ── Main Screen ──────────────────────────────────────────────────────────────

export default function TransactionListScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  // Receiver state
  const [transactions, setTransactions] = useState<ITransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Donor state
  const [ownerTransactions, setOwnerTransactions] = useState<ITransactionAsOwner[]>([]);
  const [ownerLoading, setOwnerLoading] = useState(false);
  const [ownerLoaded, setOwnerLoaded] = useState(false);
  const [ownerError, setOwnerError] = useState<string | null>(null);
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<TabKey>('active');

  const loadReceiver = useCallback(async (isRefresh = false) => {
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
  }, []);

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
  }, []);

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
          response === 'ACCEPT' ? t('transaction.acceptedAlertTitle') : t('transaction.rejectedAlertTitle'),
          response === 'ACCEPT'
            ? t('transaction.requestAcceptedMsg')
            : t('transaction.requestRejectedMsg'),
        );
      } catch (e) {
        Alert.alert(t('common.error'), e instanceof Error ? e.message : t('common.error'));
      } finally {
        setRespondingId(null);
      }
    },
    [loadOwner, loadReceiver]
  );

  const handleCancel = useCallback(
    async (transactionId: string) => {
      setCancellingId(transactionId);
      try {
        await cancelRequestApi(transactionId);
        await loadReceiver();
        Alert.alert(t('transaction.cancelledAlertTitle'), t('transaction.cancelledRequestMsg'));
      } catch (e: any) {
        Alert.alert(t('common.error'), e?.response?.data?.message ?? t('common.error'));
      } finally {
        setCancellingId(null);
      }
    },
    [loadReceiver]
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
  const activeReceiverTxs = transactions.filter((tx) => ACTIVE_STATUSES.includes(tx.status));
  const activeDonorTxs = ownerTransactions.filter((tx) => DONOR_ACTIVE_STATUSES.includes(tx.status));

  // "Lịch sử": both receiver and donor completed/cancelled/rejected
  const historyReceiverTxs = transactions.filter((tx) => HISTORY_STATUSES.includes(tx.status));
  const historyDonorTxs = ownerTransactions.filter((tx) => HISTORY_STATUSES.includes(tx.status));

  // "Nhận yêu cầu": only PENDING incoming requests (awaiting donor response)
  const pendingIncomingTxs = ownerTransactions.filter((tx) => tx.status === 'PENDING');

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'active',   label: t('transaction.tabActive') },
    { key: 'history',  label: t('transaction.tabHistory') },
    { key: 'incoming', label: t('transaction.tabIncoming') },
  ];

  return (
    <View className="flex-1 bg-neutral">
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <ManagementHeader title={t('transaction.myTransactions')} onBack={() => router.back()} />

      {/* ── Tab Bar ── */}
      <View className="flex-row mx-4 mt-4 mb-3 bg-neutral-T95 rounded-xl p-1">
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            activeOpacity={0.8}
            className="flex-1 py-2.5 rounded-lg items-center"
            style={activeTab === tab.key ? styles.tabActive : undefined}
          >
            <Text
              className="font-label font-semibold text-xs"
              style={{ color: activeTab === tab.key ? '#296C24' : '#757777' }}
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
            <Text className="font-body text-sm text-neutral-T50 mt-3">{t('common.loading')}</Text>
          </View>
        ) : ownerError ? (
          <View className="flex-1 items-center justify-center px-8 gap-4">
            <Text className="font-body text-sm text-neutral-T50 text-center">{ownerError}</Text>
            <TouchableOpacity
              onPress={loadOwner}
              className="px-6 py-3 bg-primary-T40 rounded-xl"
              activeOpacity={0.85}
            >
              <Text className="font-label font-semibold text-neutral-T100">{t('common.retry')}</Text>
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
            contentContainerStyle={{ paddingTop: 16, paddingBottom: 40, flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
          />
        )
      ) : isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#296C24" />
          <Text className="font-body text-sm text-neutral-T50 mt-3">{t('common.loading')}</Text>
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-8 gap-4">
          <Text className="font-body text-sm text-neutral-T50 text-center">{error}</Text>
          <TouchableOpacity
            onPress={() => loadReceiver()}
            className="px-6 py-3 bg-primary-T40 rounded-xl"
            activeOpacity={0.85}
          >
            <Text className="font-label font-semibold text-neutral-T100">Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : activeTab === 'active' ? (
        <FlatList
          data={[
            ...activeReceiverTxs.map((tx) => ({ tx, role: 'receiver' as const })),
            ...activeDonorTxs.map((tx) => ({ tx, role: 'donor' as const })),
          ]}
          keyExtractor={(item) => `${item.role}-${item.tx._id}`}
          renderItem={({ item }) => (
            <TransactionCard
              tx={item.tx}
              role={item.role}
              onPress={() => navigateToDetail(item.tx._id)}
              onCancel={item.role === 'receiver' ? () => handleCancel(item.tx._id) : undefined}
              isCancelling={cancellingId === item.tx._id}
            />
          )}
          ListEmptyComponent={<EmptyState tab="active" />}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => { loadReceiver(true); loadOwner(); }}
              tintColor="#296C24"
            />
          }
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 40, flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <FlatList
          data={[
            ...historyReceiverTxs.map((tx) => ({ tx, role: 'receiver' as const })),
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
              onRefresh={() => { loadReceiver(true); loadOwner(); }}
              tintColor="#296C24"
            />
          }
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 40, flexGrow: 1 }}
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
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
});
