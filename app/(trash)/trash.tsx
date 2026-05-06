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

import ManagementHeader from '@/components/shared/headers/ManagementHeader';
import {
  getMyTrashItemsApi,
  purgeMyTrashItemApi,
  restoreMyTrashItemApi,
  type ITrashItem,
  type ITrashPost,
  type ITrashReview,
  type ITrashVoucher,
  type UserTrashCollection,
} from '@/lib/trashApi';
import { useAuthStore } from '@/stores/authStore';

// ── Types ─────────────────────────────────────────────────────────────────────

type TabKey = UserTrashCollection;

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso?: string): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function getItemLabel(collection: TabKey, item: ITrashItem): string {
  if (collection === 'posts') return (item as ITrashPost).title || '—';
  if (collection === 'reviews')
    return `Đánh giá ${(item as ITrashReview).rating ?? '?'}/5`;
  return `${(item as ITrashVoucher).code ?? ''} — ${(item as ITrashVoucher).title ?? ''}`.replace(
    /^( — | —|— )$/,
    '—'
  );
}

function getItemIcon(
  collection: TabKey
): React.ComponentProps<typeof MaterialIcons>['name'] {
  if (collection === 'posts') return 'article';
  if (collection === 'reviews') return 'star';
  return 'confirmation-number';
}

// ── Sub-components ────────────────────────────────────────────────────────────

function EmptyState() {
  const { t } = useTranslation();
  return (
    <View className="flex-1 items-center justify-center gap-3 px-8 py-24">
      <View className="bg-primary-T95 h-16 w-16 items-center justify-center rounded-2xl">
        <MaterialIcons name="delete-outline" size={28} color="#296C24" />
      </View>
      <Text className="text-neutral-T10 text-center font-sans text-base font-bold">
        {t('trash.emptyTitle')}
      </Text>
      <Text className="font-body text-neutral-T50 text-center text-sm leading-5">
        {t('trash.emptyBody')}
      </Text>
    </View>
  );
}

function TrashItemCard({
  collection,
  item,
  onRestore,
  onPurge,
  restoring,
  purging,
}: {
  collection: TabKey;
  item: ITrashItem;
  onRestore: () => void;
  onPurge: () => void;
  restoring: boolean;
  purging: boolean;
}) {
  const { t } = useTranslation();
  const busy = restoring || purging;

  return (
    <View
      className="bg-neutral-T100 mx-4 mb-3 rounded-2xl p-4"
      style={styles.card}
    >
      <View className="flex-row items-start gap-3">
        <View className="bg-primary-T95 h-10 w-10 shrink-0 items-center justify-center rounded-xl">
          <MaterialIcons
            name={getItemIcon(collection)}
            size={20}
            color="#296C24"
          />
        </View>
        <View className="min-w-0 flex-1">
          <Text
            className="text-neutral-T10 font-sans text-sm font-semibold"
            numberOfLines={2}
          >
            {getItemLabel(collection, item)}
          </Text>
          <Text className="font-body text-neutral-T50 mt-0.5 text-xs">
            {t('trash.deletedOn', {
              date: formatDate((item as any).deletedAt),
            })}
          </Text>
        </View>
      </View>

      <View className="mt-3 flex-row gap-2">
        <TouchableOpacity
          onPress={onRestore}
          disabled={busy}
          activeOpacity={0.85}
          className="bg-primary-T95 h-9 flex-1 flex-row items-center justify-center gap-1.5 rounded-xl"
          style={busy ? { opacity: 0.5 } : undefined}
        >
          {restoring ? (
            <ActivityIndicator size="small" color="#296C24" />
          ) : (
            <MaterialIcons name="restore" size={15} color="#296C24" />
          )}
          <Text className="font-label text-primary-T30 text-xs font-semibold">
            {t('trash.restore')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onPurge}
          disabled={busy}
          activeOpacity={0.85}
          className="h-9 flex-1 flex-row items-center justify-center gap-1.5 rounded-xl bg-red-50"
          style={busy ? { opacity: 0.5 } : undefined}
        >
          {purging ? (
            <ActivityIndicator size="small" color="#DC2626" />
          ) : (
            <MaterialIcons name="delete-forever" size={15} color="#DC2626" />
          )}
          <Text className="font-label text-xs font-semibold text-red-600">
            {t('trash.purge')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function TrashScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const isStore = user?.role === 'STORE';

  const TABS: { key: TabKey; label: string }[] = [
    { key: 'posts', label: t('trash.tabPosts') },
    { key: 'reviews', label: t('trash.tabReviews') },
    ...(isStore
      ? [{ key: 'vouchers' as TabKey, label: t('trash.tabVouchers') }]
      : []),
  ];

  const [activeTab, setActiveTab] = useState<TabKey>('posts');
  const [items, setItems] = useState<Record<TabKey, ITrashItem[]>>({
    posts: [],
    reviews: [],
    vouchers: [],
  });
  const [loading, setLoading] = useState<Record<TabKey, boolean>>({
    posts: true,
    reviews: false,
    vouchers: false,
  });
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [actionId, setActionId] = useState<{
    id: string;
    type: 'restore' | 'purge';
  } | null>(null);

  const loadTab = useCallback(
    async (tab: TabKey, isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading((prev) => ({ ...prev, [tab]: true }));
      setError(null);
      try {
        const results = await getMyTrashItemsApi(tab);
        const data = results[0]?.data ?? [];
        setItems((prev) => ({ ...prev, [tab]: data }));
      } catch {
        setError(t('trash.loadError'));
      } finally {
        setLoading((prev) => ({ ...prev, [tab]: false }));
        setRefreshing(false);
      }
    },
    [t]
  );

  useEffect(() => {
    loadTab('posts');
  }, [loadTab]);

  const handleTabChange = useCallback(
    (tab: TabKey) => {
      setActiveTab(tab);
      if (items[tab].length === 0 && !loading[tab]) {
        loadTab(tab);
      }
    },
    [items, loading, loadTab]
  );

  const handleRestore = useCallback(
    (item: ITrashItem) => {
      Alert.alert(t('trash.restoreTitle'), t('trash.restoreConfirm'), [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('trash.restore'),
          onPress: async () => {
            setActionId({ id: item._id, type: 'restore' });
            try {
              await restoreMyTrashItemApi(activeTab, item._id);
              setItems((prev) => ({
                ...prev,
                [activeTab]: prev[activeTab].filter((i) => i._id !== item._id),
              }));
              Alert.alert(t('common.success'), t('trash.restoreSuccess'));
            } catch {
              Alert.alert(t('common.error'), t('trash.restoreError'));
            } finally {
              setActionId(null);
            }
          },
        },
      ]);
    },
    [activeTab, t]
  );

  const handlePurge = useCallback(
    (item: ITrashItem) => {
      Alert.alert(t('trash.purgeTitle'), t('trash.purgeConfirm'), [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('trash.purge'),
          style: 'destructive',
          onPress: async () => {
            setActionId({ id: item._id, type: 'purge' });
            try {
              await purgeMyTrashItemApi(activeTab, item._id);
              setItems((prev) => ({
                ...prev,
                [activeTab]: prev[activeTab].filter((i) => i._id !== item._id),
              }));
            } catch {
              Alert.alert(t('common.error'), t('trash.purgeError'));
            } finally {
              setActionId(null);
            }
          },
        },
      ]);
    },
    [activeTab, t]
  );

  const currentItems = items[activeTab];
  const isLoading = loading[activeTab];

  return (
    <View className="bg-neutral flex-1">
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />
      <ManagementHeader title={t('trash.title')} onBack={() => router.back()} />

      {/* ── Tab Bar ── */}
      <View className="bg-neutral-T95 mx-4 mb-3 mt-4 flex-row rounded-xl p-1">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          const count = items[tab.key].length;
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => handleTabChange(tab.key)}
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
                {count > 0 && (
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
                      {count}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── Info banner ── */}
      <View className="mx-4 mb-3 flex-row items-start gap-2 rounded-xl bg-amber-50 p-3">
        <MaterialIcons
          name="info-outline"
          size={15}
          color="#D97706"
          style={{ marginTop: 1 }}
        />
        <Text className="font-body flex-1 text-xs leading-4 text-amber-800">
          {t('trash.infoBanner')}
        </Text>
      </View>

      {/* ── Content ── */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center gap-3">
          <ActivityIndicator size="large" color="#296C24" />
          <Text className="font-body text-neutral-T50 text-sm">
            {t('common.loading')}
          </Text>
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center gap-4 px-8">
          <Text className="font-body text-neutral-T50 text-center text-sm">
            {error}
          </Text>
          <TouchableOpacity
            onPress={() => loadTab(activeTab)}
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
          data={currentItems}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <TrashItemCard
              collection={activeTab}
              item={item}
              onRestore={() => handleRestore(item)}
              onPurge={() => handlePurge(item)}
              restoring={
                actionId?.id === item._id && actionId.type === 'restore'
              }
              purging={actionId?.id === item._id && actionId.type === 'purge'}
            />
          )}
          ListEmptyComponent={<EmptyState />}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadTab(activeTab, true)}
              tintColor="#296C24"
            />
          }
          contentContainerStyle={{
            paddingTop: 4,
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
