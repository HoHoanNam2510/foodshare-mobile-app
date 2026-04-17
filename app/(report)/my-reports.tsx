// app/(report)/my-reports.tsx
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ManagementHeader from '@/components/shared/headers/ManagementHeader';
import {
  getMyReportsApi,
  type IReport,
  type ReportStatus,
  type ReportTargetType,
} from '@/lib/reportApi';

// ── Config ────────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  ReportStatus,
  { labelKey: string; bg: string; text: string; icon: string }
> = {
  PENDING: {
    labelKey: 'report.statusPending',
    bg: '#FEF9C3',
    text: '#A16207',
    icon: 'hourglass-empty',
  },
  RESOLVED: {
    labelKey: 'report.statusResolved',
    bg: '#DCFCE7',
    text: '#15803D',
    icon: 'check-circle',
  },
  DISMISSED: {
    labelKey: 'report.statusDismissed',
    bg: '#FEE2E2',
    text: '#DC2626',
    icon: 'cancel',
  },
  WITHDRAWN: {
    labelKey: 'report.statusWithdrawn',
    bg: '#F3F4F6',
    text: '#6B7280',
    icon: 'undo',
  },
};

const TARGET_TYPE_CONFIG: Record<
  ReportTargetType,
  { labelKey: string; icon: string; bg: string; text: string }
> = {
  POST: {
    labelKey: 'report.targetPost',
    icon: 'article',
    bg: '#EFF6FF',
    text: '#1D4ED8',
  },
  USER: {
    labelKey: 'report.targetUser',
    icon: 'person',
    bg: '#F5F3FF',
    text: '#7C3AED',
  },
  TRANSACTION: {
    labelKey: 'report.targetTransaction',
    icon: 'receipt-long',
    bg: '#FFF7ED',
    text: '#C2410C',
  },
  REVIEW: {
    labelKey: 'report.targetReview',
    icon: 'star',
    bg: '#FFFBEB',
    text: '#B45309',
  },
};

const REASON_LABEL_KEY: Record<string, string> = {
  FOOD_SAFETY: 'report.reasonFoodSafetyLabel',
  SCAM: 'report.reasonScamLabel',
  INAPPROPRIATE_CONTENT: 'report.reasonInappropriateLabel',
  NO_SHOW: 'report.reasonNoShowLabel',
  OTHER: 'report.reasonOtherLabel',
};

type FilterTab = 'ALL' | ReportStatus;

const FILTER_TAB_KEYS: { key: FilterTab; labelKey: string }[] = [
  { key: 'ALL', labelKey: 'report.filterAll' },
  { key: 'PENDING', labelKey: 'report.statusPending' },
  { key: 'RESOLVED', labelKey: 'report.statusResolved' },
  { key: 'DISMISSED', labelKey: 'report.statusDismissed' },
  { key: 'WITHDRAWN', labelKey: 'report.statusWithdrawn' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ReportStatus }) {
  const { t } = useTranslation();
  const cfg = STATUS_CONFIG[status];
  return (
    <View
      style={[styles.badge, { backgroundColor: cfg.bg }]}
      className="flex-row items-center gap-1"
    >
      <MaterialIcons name={cfg.icon as any} size={11} color={cfg.text} />
      <Text style={[styles.badgeText, { color: cfg.text }]}>
        {t(cfg.labelKey).toUpperCase()}
      </Text>
    </View>
  );
}

function ReportCard({
  report,
  onPress,
}: {
  report: IReport;
  onPress: () => void;
}) {
  const { t } = useTranslation();
  const targetCfg = TARGET_TYPE_CONFIG[report.targetType];
  const reasonLabel = REASON_LABEL_KEY[report.reason]
    ? t(REASON_LABEL_KEY[report.reason])
    : report.reason;
  const isDismissed = report.status === 'DISMISSED';

  return (
    <TouchableOpacity
      className="mx-4 mb-3 bg-neutral-T100 rounded-2xl overflow-hidden"
      style={styles.card}
      activeOpacity={0.85}
      onPress={onPress}
    >
      {/* Top row */}
      <View className="p-4 gap-3">
        <View className="flex-row items-start justify-between gap-2">
          {/* Target type chip */}
          <View
            className="flex-row items-center gap-1.5 px-2.5 py-1 rounded-lg"
            style={{ backgroundColor: targetCfg.bg }}
          >
            <MaterialIcons
              name={targetCfg.icon as any}
              size={13}
              color={targetCfg.text}
            />
            <Text
              className="font-label font-semibold text-xs"
              style={{ color: targetCfg.text }}
            >
              {t(targetCfg.labelKey)}
            </Text>
          </View>
          <StatusBadge status={report.status} />
        </View>

        {/* Reason */}
        <View className="gap-0.5">
          <Text
            className="font-sans text-sm text-neutral-T10"
            style={{ fontFamily: 'Epilogue', fontWeight: '700' }}
          >
            {reasonLabel}
          </Text>
          <Text
            className="font-body text-xs text-neutral-T50"
            numberOfLines={2}
          >
            {report.description}
          </Text>
        </View>

        {/* Footer row */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-1">
            <MaterialIcons name="image" size={13} color="#AAABAB" />
            <Text className="font-label text-xs text-neutral-T70">
              {t('report.evidenceCountLabel', { count: report.images.length })}
            </Text>
          </View>
          <Text className="font-body text-xs text-neutral-T70">
            {formatDate(report.createdAt)}
          </Text>
        </View>
      </View>

      {/* Resolution note — shown when RESOLVED or DISMISSED */}
      {report.resolutionNote && (
        <View
          className="mx-4 mb-4 p-3 rounded-xl gap-1"
          style={{ backgroundColor: isDismissed ? '#FEF2F2' : '#F0FDF4' }}
        >
          <View className="flex-row items-center gap-1.5">
            <MaterialIcons
              name={isDismissed ? 'info-outline' : 'verified'}
              size={14}
              color={isDismissed ? '#DC2626' : '#15803D'}
            />
            <Text
              className="font-label font-semibold text-xs"
              style={{ color: isDismissed ? '#DC2626' : '#15803D' }}
            >
              {isDismissed
                ? t('report.dismissedReasonLabel')
                : t('report.resolvedResultLabel')}
            </Text>
          </View>
          <Text
            className="font-body text-xs leading-4"
            style={{ color: isDismissed ? '#DC2626' : '#15803D' }}
          >
            {report.resolutionNote}
          </Text>
        </View>
      )}

      {/* Resubmit hint when DISMISSED */}
      {isDismissed && (
        <View className="mx-4 mb-4 flex-row items-center gap-2 p-3 bg-primary-T95 rounded-xl">
          <MaterialIcons name="refresh" size={14} color="#296C24" />
          <Text className="font-body text-xs text-primary-T30 flex-1 leading-4">
            {t('report.dismissedHint')}
          </Text>
        </View>
      )}

      {/* Tap hint */}
      <View className="mx-4 mb-3 flex-row items-center justify-end gap-1">
        <Text className="font-body text-xs text-neutral-T70">
          {t('report.viewDetailHint')}
        </Text>
        <MaterialIcons name="chevron-right" size={14} color="#AAABAB" />
      </View>
    </TouchableOpacity>
  );
}

function EmptyState({ filter }: { filter: FilterTab }) {
  const { t } = useTranslation();
  const msgs: Record<
    FilterTab,
    { icon: string; titleKey: string; bodyKey: string }
  > = {
    ALL: {
      icon: 'flag',
      titleKey: 'report.emptyAllTitle',
      bodyKey: 'report.emptyAllBody',
    },
    PENDING: {
      icon: 'hourglass-empty',
      titleKey: 'report.emptyPendingTitle',
      bodyKey: 'report.emptyPendingBody',
    },
    RESOLVED: {
      icon: 'check-circle',
      titleKey: 'report.emptyResolvedTitle',
      bodyKey: '',
    },
    DISMISSED: {
      icon: 'cancel',
      titleKey: 'report.emptyDismissedTitle',
      bodyKey: '',
    },
    WITHDRAWN: {
      icon: 'undo',
      titleKey: 'report.emptyWithdrawnTitle',
      bodyKey: '',
    },
  };
  const cfg = msgs[filter];
  return (
    <View className="flex-1 items-center justify-center py-24 px-8 gap-3">
      <View className="w-16 h-16 rounded-2xl bg-primary-T95 items-center justify-center">
        <MaterialIcons name={cfg.icon as any} size={28} color="#296C24" />
      </View>
      <Text className="font-sans font-bold text-base text-neutral-T10 text-center">
        {t(cfg.titleKey)}
      </Text>
      {cfg.bodyKey ? (
        <Text className="font-body text-sm text-neutral-T50 text-center leading-5">
          {t(cfg.bodyKey)}
        </Text>
      ) : null}
    </View>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function MyReportsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const [reports, setReports] = useState<IReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL');

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setIsRefreshing(true);
    else setIsLoading(true);
    setError(null);
    try {
      const res = await getMyReportsApi();
      setReports(res.data);
    } catch {
      setError(t('review.loadError'));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered =
    activeTab === 'ALL'
      ? reports
      : reports.filter((r) => r.status === activeTab);

  const dismissedCount = reports.filter((r) => r.status === 'DISMISSED').length;

  return (
    <View className="flex-1 bg-neutral">
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />
      <ManagementHeader
        title={t('report.myReportsTitle')}
        onBack={() => router.back()}
      />

      {/* ── Filter tabs ── */}
      <View className="mx-4 mt-4 mb-3 bg-neutral-T95 rounded-xl p-1 flex-row">
        {FILTER_TAB_KEYS.map((tab) => {
          const isActive = activeTab === tab.key;
          const showDot = tab.key === 'DISMISSED' && dismissedCount > 0;
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.8}
              className="flex-1 py-2.5 rounded-lg items-center"
              style={isActive ? styles.tabActive : undefined}
            >
              <View className="flex-row items-center gap-1">
                <Text
                  className="font-label font-semibold text-xs"
                  style={{ color: isActive ? '#296C24' : '#757777' }}
                >
                  {t(tab.labelKey)}
                </Text>
                {showDot && (
                  <View className="w-1.5 h-1.5 rounded-full bg-red-500" />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── Content ── */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center gap-3">
          <ActivityIndicator size="large" color="#296C24" />
          <Text className="font-body text-sm text-neutral-T50">
            {t('common.loading')}
          </Text>
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-8 gap-4">
          <Text className="font-body text-sm text-neutral-T50 text-center">
            {error}
          </Text>
          <TouchableOpacity
            onPress={() => load()}
            className="px-6 py-3 bg-primary-T40 rounded-xl"
            activeOpacity={0.85}
          >
            <Text className="font-label font-semibold text-neutral-T100">
              {t('common.retry')}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <ReportCard
              report={item}
              onPress={() =>
                router.push({
                  pathname: '/(report)/report-detail',
                  params: { reportJson: JSON.stringify(item) },
                } as any)
              }
            />
          )}
          ListEmptyComponent={<EmptyState filter={activeTab} />}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => load(true)}
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
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
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
