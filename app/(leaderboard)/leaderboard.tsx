import { MaterialIcons } from '@expo/vector-icons';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';

import StackHeader from '@/components/shared/headers/StackHeader';
import {
  getLeaderboardApi,
  getMyRankingSummaryApi,
  type LeaderboardEntry,
  type LeaderboardPeriod,
  type LeaderboardRole,
  type MyRankingSummaryItem,
} from '@/lib/greenPointApi';


// Màu theme cho từng hạng
const RANK_THEMES = {
  1: { bg: '#FFF8E1', border: '#E0B100', badge: '#E0B100', text: '#7A5C00' },
  2: { bg: '#F5F5F5', border: '#9E9E9E', badge: '#9E9E9E', text: '#4A4A4A' },
  3: { bg: '#FBF0E8', border: '#9C5A22', badge: '#9C5A22', text: '#6B3A0F' },
} as const;

function getRankTheme(rank: number) {
  if (rank in RANK_THEMES) return RANK_THEMES[rank as keyof typeof RANK_THEMES];
  return { bg: '#F0F8F0', border: '#A8D5A2', badge: '#296C24', text: '#1A4A17' };
}

function SummaryCard({
  title,
  item,
}: {
  title: string;
  item?: MyRankingSummaryItem;
}) {
  const { t } = useTranslation();
  return (
    <View className="flex-1 bg-white rounded-2xl p-3 border border-primary-T80">
      <Text className="font-label text-xs text-primary-T40 mb-1">{title}</Text>
      {item ? (
        <>
          <Text
            className="font-sans text-base text-primary-T20"
            style={{ fontWeight: '700' }}
          >
            #{item.rank}
          </Text>
          <Text className="font-body text-xs text-primary-T40">
            {item.points} {t('leaderboard.pointsUnit')}
          </Text>
        </>
      ) : (
        <Text className="font-body text-xs text-primary-T50">{t('leaderboard.noData')}</Text>
      )}
    </View>
  );
}

function UserAvatar({
  uri,
  name,
  size,
  badgeBg,
}: {
  uri?: string;
  name: string;
  size: number;
  badgeBg: string;
}) {
  const initial = name?.charAt(0)?.toUpperCase() ?? '?';

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
        resizeMode="cover"
      />
    );
  }

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: `${badgeBg}22`,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ color: badgeBg, fontWeight: '700', fontSize: size * 0.4 }}>
        {initial}
      </Text>
    </View>
  );
}

function LeaderboardRow({ item }: { item: LeaderboardEntry }) {
  const { t } = useTranslation();
  const theme = getRankTheme(item.rank);
  const isTop3 = item.rank <= 3;

  return (
    <View
      style={{
        backgroundColor: theme.bg,
        borderColor: theme.border,
        borderWidth: 1,
        borderRadius: 16,
        marginBottom: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
      }}
    >
      {/* Rank badge */}
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 16,
          backgroundColor: theme.badge,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {isTop3 ? (
          <MaterialIcons name="emoji-events" size={16} color="#FFFFFF" />
        ) : (
          <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 13 }}>
            {item.rank}
          </Text>
        )}
      </View>

      {/* Avatar */}
      <UserAvatar
        uri={item.user.avatar}
        name={item.user.fullName}
        size={38}
        badgeBg={theme.badge}
      />

      {/* Name + role */}
      <View style={{ flex: 1 }}>
        <Text
          style={{ color: theme.text, fontWeight: '700', fontSize: 14 }}
          numberOfLines={1}
        >
          {item.user.fullName}
        </Text>
        <Text style={{ color: theme.badge, fontSize: 11, marginTop: 1 }}>
          {item.user.role === 'STORE' ? t('roles.STORE') : t('roles.USER')}
          {isTop3 && (
            <Text style={{ fontWeight: '700' }}>
              {item.rank === 1 ? '  🥇' : item.rank === 2 ? '  🥈' : '  🥉'}
            </Text>
          )}
        </Text>
      </View>

      {/* Points */}
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={{ color: theme.badge, fontWeight: '700', fontSize: 15 }}>
          {item.points}
        </Text>
        <Text style={{ color: theme.text, fontSize: 11, opacity: 0.7 }}>
          {t('leaderboard.pointsUnit')}
        </Text>
      </View>
    </View>
  );
}

export default function LeaderboardScreen() {
  const { t } = useTranslation();
  const [period, setPeriod] = useState<LeaderboardPeriod>('weekly');
  const [role, setRole] = useState<LeaderboardRole>('ALL');

  const PERIOD_OPTIONS: { label: string; value: LeaderboardPeriod }[] = [
    { label: t('leaderboard.periodDaily'), value: 'daily' },
    { label: t('leaderboard.periodWeekly'), value: 'weekly' },
    { label: t('leaderboard.periodMonthly'), value: 'monthly' },
    { label: t('leaderboard.periodYearly'), value: 'yearly' },
  ];

  const ROLE_OPTIONS: { label: string; value: LeaderboardRole }[] = [
    { label: t('leaderboard.roleAll'), value: 'ALL' },
    { label: t('roles.USER'), value: 'USER' },
    { label: t('roles.STORE'), value: 'STORE' },
  ];
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [mySummary, setMySummary] = useState<
    Record<LeaderboardPeriod, MyRankingSummaryItem | undefined>
  >({
    daily: undefined,
    weekly: undefined,
    monthly: undefined,
    yearly: undefined,
  });

  const fetchData = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      try {
        const [leaderboardRes, summaryRes] = await Promise.all([
          getLeaderboardApi({ period, role, page: 1, limit: 20 }),
          getMyRankingSummaryApi(),
        ]);

        setEntries(leaderboardRes.data.entries ?? []);
        setMySummary({
          daily: summaryRes.data?.daily,
          weekly: summaryRes.data?.weekly,
          monthly: summaryRes.data?.monthly,
          yearly: summaryRes.data?.yearly,
        });
      } finally {
        if (isRefresh) setRefreshing(false);
        else setLoading(false);
      }
    },
    [period, role]
  );

  useFocusEffect(
    useCallback(() => {
      fetchData(false);
    }, [fetchData])
  );

  return (
    <View className="flex-1 bg-neutral-T100">
      <StackHeader title={t('leaderboard.greenPointsLeaderboard')} />

      <View className="px-4 pt-3 gap-3">
        {/* Period filter */}
        <View className="flex-row gap-2">
          {PERIOD_OPTIONS.map((opt) => {
            const active = period === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                className={`px-3 py-2 rounded-full border ${
                  active
                    ? 'bg-primary-T95 border-primary-T80'
                    : 'bg-neutral-T100 border-neutral-T90'
                }`}
                onPress={() => setPeriod(opt.value)}
              >
                <Text
                  className={`font-label text-xs ${active ? 'text-primary-T30' : 'text-neutral-T40'}`}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Role filter */}
        <View className="flex-row gap-2">
          {ROLE_OPTIONS.map((opt) => {
            const active = role === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                className={`px-3 py-2 rounded-full border ${
                  active
                    ? 'bg-secondary-T95 border-secondary-T80'
                    : 'bg-neutral-T100 border-neutral-T90'
                }`}
                onPress={() => setRole(opt.value)}
              >
                <Text
                  className={`font-label text-xs ${active ? 'text-secondary-T20' : 'text-neutral-T40'}`}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* My ranking summary */}
        <View className="bg-primary-T95 border border-primary-T80 rounded-2xl p-3">
          <Text
            className="font-sans text-sm text-primary-T20 mb-2"
            style={{ fontWeight: '700' }}
          >
            {t('leaderboard.yourRank')}
          </Text>
          <View className="gap-2">
            <View className="flex-row gap-2">
              <SummaryCard title={t('leaderboard.summaryByDay')} item={mySummary.daily} />
              <SummaryCard title={t('leaderboard.summaryByWeek')} item={mySummary.weekly} />
            </View>
            <View className="flex-row gap-2">
              <SummaryCard title={t('leaderboard.summaryByMonth')} item={mySummary.monthly} />
              <SummaryCard title={t('leaderboard.summaryByYear')} item={mySummary.yearly} />
            </View>
          </View>
        </View>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="small" color="#296C24" />
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => `${item.user._id}-${item.rank}`}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 40 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchData(true)}
            />
          }
          ListHeaderComponent={
            entries.length > 0 ? (
              <Text className="font-label text-xs text-neutral-T50 mb-3">
                {t('leaderboard.topNUsers', { count: entries.length })}
              </Text>
            ) : null
          }
          ListEmptyComponent={
            <View className="mt-10 items-center">
              <Text className="font-body text-neutral-T50">
                {t('leaderboard.noRankingData')}
              </Text>
            </View>
          }
          ListFooterComponent={
            entries.length > 0 ? (
              <Text className="font-body text-xs text-neutral-T60 text-center mt-2">
                {t('leaderboard.showingTop', { count: entries.length })}
              </Text>
            ) : null
          }
          renderItem={({ item }) => <LeaderboardRow item={item} />}
        />
      )}
    </View>
  );
}
