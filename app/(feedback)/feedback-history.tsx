import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import StackHeader from '@/components/shared/headers/StackHeader';
import {
  getMyFeedbacksApi,
  type IFeedback,
  type FeedbackStatus,
  type FeedbackType,
} from '@/lib/feedbackApi';

// ── Config ────────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  FeedbackStatus,
  { bg: string; text: string; icon: string }
> = {
  PENDING: {
    bg: '#FEF9C3',
    text: '#A16207',
    icon: 'hourglass-empty',
  },
  PROCESSING: {
    bg: '#DBEAFE',
    text: '#1D4ED8',
    icon: 'autorenew',
  },
  CLOSED: {
    bg: '#DCFCE7',
    text: '#15803D',
    icon: 'check-circle',
  },
};

const TYPE_CONFIG: Record<
  FeedbackType,
  { icon: string; bg: string; text: string }
> = {
  BUG_REPORT: {
    icon: 'bug-report',
    bg: '#FEF2F2',
    text: '#DC2626',
  },
  SUGGESTION: {
    icon: 'lightbulb',
    bg: '#FFFBEB',
    text: '#B45309',
  },
};

const STATUS_I18N_KEY: Record<FeedbackStatus, string> = {
  PENDING: 'feedback.statusPending',
  PROCESSING: 'feedback.statusProcessing',
  CLOSED: 'feedback.statusClosed',
};

const TYPE_I18N_KEY: Record<FeedbackType, string> = {
  BUG_REPORT: 'feedback.typeBugReport',
  SUGGESTION: 'feedback.typeSuggestion',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: FeedbackStatus }) {
  const { t } = useTranslation();
  const cfg = STATUS_CONFIG[status];
  return (
    <View
      style={[styles.badge, { backgroundColor: cfg.bg }]}
      className="flex-row items-center gap-1"
    >
      <MaterialIcons name={cfg.icon as any} size={11} color={cfg.text} />
      <Text style={[styles.badgeText, { color: cfg.text }]}>
        {t(STATUS_I18N_KEY[status]).toUpperCase()}
      </Text>
    </View>
  );
}

function FeedbackCard({
  item,
  onPress,
}: {
  item: IFeedback;
  onPress: () => void;
}) {
  const { t } = useTranslation();
  const typeCfg = TYPE_CONFIG[item.type];
  return (
    <TouchableOpacity
      className="bg-neutral-T100 mx-4 mb-3 rounded-2xl p-4"
      style={styles.card}
      activeOpacity={0.85}
      onPress={onPress}
    >
      {/* Type + Status row */}
      <View className="mb-3 flex-row items-center justify-between">
        <View
          className="flex-row items-center gap-1.5 rounded-lg px-2.5 py-1"
          style={{ backgroundColor: typeCfg.bg }}
        >
          <MaterialIcons
            name={typeCfg.icon as any}
            size={13}
            color={typeCfg.text}
          />
          <Text
            className="font-label text-xs font-semibold"
            style={{ color: typeCfg.text }}
          >
            {t(TYPE_I18N_KEY[item.type])}
          </Text>
        </View>
        <StatusBadge status={item.status} />
      </View>

      {/* Title */}
      <Text
        className="text-neutral-T10 font-sans text-sm"
        style={{ fontFamily: 'Epilogue', fontWeight: '700' }}
        numberOfLines={2}
      >
        {item.title}
      </Text>

      {/* Footer */}
      <View className="mt-2 flex-row items-center justify-between">
        <View className="flex-row items-center gap-1">
          <MaterialIcons name="attach-file" size={13} color="#AAABAB" />
          <Text className="font-label text-neutral-T70 text-xs">
            {t('feedback.attachmentCount', { count: item.attachments.length })}
          </Text>
        </View>
        <Text className="font-body text-neutral-T70 text-xs">
          {formatDate(item.createdAt)}
        </Text>
      </View>

      {/* Tap hint */}
      <View className="mt-1.5 flex-row items-center justify-end gap-1">
        <Text className="font-body text-neutral-T70 text-xs">
          {t('feedback.viewDetail')}
        </Text>
        <MaterialIcons name="chevron-right" size={14} color="#AAABAB" />
      </View>
    </TouchableOpacity>
  );
}

function EmptyState() {
  const { t } = useTranslation();
  return (
    <View className="flex-1 items-center justify-center gap-3 px-8 py-24">
      <View className="bg-primary-T95 h-16 w-16 items-center justify-center rounded-2xl">
        <MaterialIcons name="feedback" size={28} color="#296C24" />
      </View>
      <Text className="text-neutral-T10 text-center font-sans text-base font-bold">
        {t('feedback.emptyTitle')}
      </Text>
      <Text className="font-body text-neutral-T50 text-center text-sm leading-5">
        {t('feedback.emptyBody')}
      </Text>
    </View>
  );
}

// ── Detail Modal ──────────────────────────────────────────────────────────────

function DetailModal({
  feedback,
  onClose,
}: {
  feedback: IFeedback | null;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  if (!feedback) return null;
  const typeCfg = TYPE_CONFIG[feedback.type];

  return (
    <Modal
      visible
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="bg-neutral-T100 flex-1">
        {/* Header */}
        <View className="border-neutral-T90 flex-row items-center justify-between border-b px-4 py-4">
          <Text
            className="text-neutral-T10 text-base"
            style={{ fontFamily: 'Epilogue', fontWeight: '700' }}
          >
            {t('feedback.detailTitle')}
          </Text>
          <TouchableOpacity
            className="bg-neutral-T95 h-9 w-9 items-center justify-center rounded-full"
            onPress={onClose}
          >
            <MaterialIcons name="close" size={18} color="#191C1C" />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 40 }}
        >
          {/* Type + Status */}
          <View className="flex-row items-center gap-3">
            <View
              className="flex-row items-center gap-1.5 rounded-lg px-2.5 py-1"
              style={{ backgroundColor: typeCfg.bg }}
            >
              <MaterialIcons
                name={typeCfg.icon as any}
                size={13}
                color={typeCfg.text}
              />
              <Text
                className="font-label text-xs font-semibold"
                style={{ color: typeCfg.text }}
              >
                {t(TYPE_I18N_KEY[feedback.type])}
              </Text>
            </View>
            <StatusBadge status={feedback.status} />
          </View>

          {/* Title + Content */}
          <View className="bg-neutral-T95 gap-2 rounded-2xl p-4">
            <Text className="font-label text-neutral-T50 text-xs font-semibold uppercase tracking-wider">
              {t('feedback.titleLabel')}
            </Text>
            <Text
              className="text-neutral-T10 font-sans text-base"
              style={{ fontWeight: '700' }}
            >
              {feedback.title}
            </Text>
            <View className="bg-neutral-T90 h-px" />
            <Text className="font-label text-neutral-T50 text-xs font-semibold uppercase tracking-wider">
              {t('feedback.contentLabel')}
            </Text>
            <Text className="font-body text-neutral-T30 text-sm leading-5">
              {feedback.content}
            </Text>
          </View>

          {/* Attachments */}
          {feedback.attachments.length > 0 && (
            <View className="gap-2">
              <Text className="font-label text-neutral-T50 text-xs font-semibold uppercase tracking-wider">
                {t('feedback.attachmentSectionTitle', {
                  count: feedback.attachments.length,
                })}
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 10 }}
              >
                {feedback.attachments.map((url, i) => (
                  <Image
                    key={`${url}-${i}`}
                    source={{ uri: url }}
                    className="h-28 w-28 rounded-xl"
                    resizeMode="cover"
                  />
                ))}
              </ScrollView>
            </View>
          )}

          {/* Metadata */}
          <View className="gap-2">
            <Text className="font-label text-neutral-T50 text-xs font-semibold uppercase tracking-wider">
              {t('feedback.metaSection')}
            </Text>
            <View className="bg-neutral-T95 gap-2 rounded-xl p-3">
              <View className="flex-row items-center justify-between">
                <Text className="font-body text-neutral-T50 text-xs">
                  {t('feedback.sentDate')}
                </Text>
                <Text className="font-label text-neutral-T30 text-xs font-semibold">
                  {formatDateTime(feedback.createdAt)}
                </Text>
              </View>
              {feedback.contextMetadata?.os && (
                <View className="flex-row items-center justify-between">
                  <Text className="font-body text-neutral-T50 text-xs">
                    {t('feedback.os')}
                  </Text>
                  <Text className="font-label text-neutral-T30 text-xs font-semibold uppercase">
                    {feedback.contextMetadata.os}
                  </Text>
                </View>
              )}
              {feedback.contextMetadata?.appVersion && (
                <View className="flex-row items-center justify-between">
                  <Text className="font-body text-neutral-T50 text-xs">
                    {t('feedback.appVersion')}
                  </Text>
                  <Text className="font-label text-neutral-T30 text-xs font-semibold">
                    {feedback.contextMetadata.appVersion}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Admin reply — only when CLOSED */}
          {feedback.status === 'CLOSED' && feedback.adminReply && (
            <View className="gap-2 rounded-2xl bg-green-50 p-4">
              <View className="flex-row items-center gap-2">
                <MaterialIcons name="verified" size={16} color="#15803D" />
                <Text
                  className="font-label text-xs font-semibold"
                  style={{ color: '#15803D' }}
                >
                  {t('feedback.adminReplyLabel')}
                </Text>
              </View>
              <Text
                className="font-body text-sm leading-5"
                style={{ color: '#166534' }}
              >
                {feedback.adminReply}
              </Text>
              {feedback.resolvedAt && (
                <Text
                  className="font-body text-xs"
                  style={{ color: '#86EFAC' }}
                >
                  {t('feedback.closedAt', {
                    datetime: formatDateTime(feedback.resolvedAt),
                  })}
                </Text>
              )}
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function FeedbackHistoryScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [feedbacks, setFeedbacks] = useState<IFeedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [selected, setSelected] = useState<IFeedback | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setIsRefreshing(true);
    else setIsLoading(true);
    setErrorKey(null);
    try {
      const res = await getMyFeedbacksApi();
      setFeedbacks(res.data);
    } catch {
      setErrorKey('feedback.loadError');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <View className="bg-neutral flex-1">
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />
      <StackHeader
        title={t('feedback.historyTitle')}
        rightElement={
          <TouchableOpacity
            className="bg-primary-T40 h-9 w-9 items-center justify-center rounded-full active:opacity-80"
            onPress={() => router.push('/(feedback)/feedback-create' as any)}
          >
            <MaterialIcons name="add" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        }
      />

      {isLoading ? (
        <View className="flex-1 items-center justify-center gap-3">
          <ActivityIndicator size="large" color="#296C24" />
          <Text className="font-body text-neutral-T50 text-sm">
            {t('common.loading')}
          </Text>
        </View>
      ) : errorKey ? (
        <View className="flex-1 items-center justify-center gap-4 px-8">
          <Text className="font-body text-neutral-T50 text-center text-sm">
            {t(errorKey)}
          </Text>
          <TouchableOpacity
            onPress={() => load()}
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
          data={feedbacks}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <FeedbackCard item={item} onPress={() => setSelected(item)} />
          )}
          ListEmptyComponent={<EmptyState />}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => load(true)}
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

      <DetailModal feedback={selected} onClose={() => setSelected(null)} />
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
});
