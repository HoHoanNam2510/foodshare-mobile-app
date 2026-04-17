// app/(report)/report-detail.tsx
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import StackHeader from '@/components/shared/headers/StackHeader';
import {
  withdrawReportApi,
  type IReport,
  type ReportAction,
  type ReportStatus,
  type ReportTargetType,
} from '@/lib/reportApi';

// ── Config ────────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  ReportStatus,
  { labelKey: string; bg: string; text: string; border: string; icon: string }
> = {
  PENDING: {
    labelKey: 'report.statusPending',
    bg: '#FEF9C3',
    text: '#A16207',
    border: '#FDE68A',
    icon: 'hourglass-empty',
  },
  RESOLVED: {
    labelKey: 'report.statusResolved',
    bg: '#DCFCE7',
    text: '#15803D',
    border: '#BBF7D0',
    icon: 'check-circle',
  },
  DISMISSED: {
    labelKey: 'report.statusDismissed',
    bg: '#FEE2E2',
    text: '#DC2626',
    border: '#FECACA',
    icon: 'cancel',
  },
  WITHDRAWN: {
    labelKey: 'report.statusWithdrawn',
    bg: '#F3F4F6',
    text: '#6B7280',
    border: '#E5E7EB',
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

const REASON_ICON: Record<string, string> = {
  FOOD_SAFETY: 'warning',
  SCAM: 'gpp-bad',
  INAPPROPRIATE_CONTENT: 'block',
  NO_SHOW: 'event-busy',
  OTHER: 'more-horiz',
};

const ACTION_LABEL_KEY: Record<ReportAction, string | null> = {
  NONE: null,
  POST_HIDDEN: 'report.actionPostHidden',
  USER_WARNED: 'report.actionUserWarned',
  USER_BANNED: 'report.actionUserBanned',
  REFUNDED: 'report.actionRefunded',
  REVIEW_DELETED: 'report.actionReviewDeleted',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionLabel({ label }: { label: string }) {
  return (
    <Text
      className="text-xs text-neutral-T50 uppercase tracking-wider mb-2"
      style={{ fontFamily: 'BeVietnamPro-SemiBold' }}
    >
      {label}
    </Text>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <View className="flex-row items-center gap-3">
      <View className="w-8 h-8 rounded-lg bg-neutral-T95 items-center justify-center">
        <MaterialIcons name={icon as any} size={16} color="#757777" />
      </View>
      <View className="flex-1">
        <Text className="font-body text-xs text-neutral-T50">{label}</Text>
        <Text className="font-label font-semibold text-sm text-neutral-T10 mt-0.5">
          {value}
        </Text>
      </View>
    </View>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function ReportDetailScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { reportJson } = useLocalSearchParams<{ reportJson: string }>();

  const report = useMemo<IReport | null>(() => {
    try {
      return reportJson ? (JSON.parse(reportJson) as IReport) : null;
    } catch {
      return null;
    }
  }, [reportJson]);

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const handleEdit = () => {
    if (!report) return;
    router.push({
      pathname: '/(report)/create-report',
      params: {
        targetType: report.targetType,
        targetId: String(report.targetId),
        reportId: report._id,
        existingReason: report.reason,
        existingDescription: report.description,
        existingImages: JSON.stringify(report.images),
      },
    } as any);
  };

  const handleWithdraw = () => {
    if (!report) return;
    const reportId = report._id;
    Alert.alert(
      t('report.withdrawConfirmTitle'),
      t('report.withdrawConfirmMsg'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('report.withdrawBtn'),
          style: 'destructive',
          onPress: async () => {
            setIsWithdrawing(true);
            try {
              await withdrawReportApi(reportId);
              Alert.alert(
                t('report.withdrawnTitle'),
                t('report.withdrawnMsg'),
                [{ text: t('common.close'), onPress: () => router.back() }]
              );
            } catch (err: any) {
              const msg: string =
                err?.response?.data?.message ?? t('report.withdrawError');
              Alert.alert(t('common.error'), msg);
            } finally {
              setIsWithdrawing(false);
            }
          },
        },
      ]
    );
  };

  if (!report) {
    return (
      <View className="flex-1 bg-neutral items-center justify-center">
        <StatusBar
          barStyle="dark-content"
          backgroundColor="transparent"
          translucent
        />
        <StackHeader title={t('report.detailTitle')} />
        <Text className="font-body text-sm text-neutral-T50 mt-8">
          {t('report.notFoundMsg')}
        </Text>
      </View>
    );
  }

  const statusCfg = STATUS_CONFIG[report.status];
  const targetCfg = TARGET_TYPE_CONFIG[report.targetType];
  const reasonLabel = REASON_LABEL_KEY[report.reason]
    ? t(REASON_LABEL_KEY[report.reason])
    : report.reason;
  const reasonIcon = REASON_ICON[report.reason] ?? 'flag';
  const actionLabelKey = ACTION_LABEL_KEY[report.actionTaken];
  const actionLabel = actionLabelKey ? t(actionLabelKey) : null;
  const isDismissed = report.status === 'DISMISSED';
  const isResolved = report.status === 'RESOLVED';

  return (
    <View className="flex-1 bg-neutral">
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />
      <StackHeader title={t('report.detailTitle')} />

      {/* ── Lightbox ── */}
      <Modal
        visible={lightboxIndex !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setLightboxIndex(null)}
      >
        <Pressable
          className="flex-1 bg-black items-center justify-center"
          onPress={() => setLightboxIndex(null)}
        >
          {lightboxIndex !== null && report.images[lightboxIndex] && (
            <Image
              source={{ uri: report.images[lightboxIndex] }}
              style={{ width: '100%', height: '80%' }}
              resizeMode="contain"
            />
          )}
          <View
            className="absolute top-0 right-0 p-4"
            style={{ marginTop: insets.top }}
          >
            <TouchableOpacity
              onPress={() => setLightboxIndex(null)}
              className="w-10 h-10 rounded-full bg-white/20 items-center justify-center"
            >
              <MaterialIcons name="close" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          {report.images.length > 1 && lightboxIndex !== null && (
            <View className="absolute bottom-8 flex-row gap-2">
              {report.images.map((_, i) => (
                <View
                  key={i}
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor:
                      i === lightboxIndex ? '#FFFFFF' : 'rgba(255,255,255,0.4)',
                  }}
                />
              ))}
            </View>
          )}
        </Pressable>
      </Modal>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 32,
          paddingTop: 8,
        }}
      >
        {/* ── Status Banner ── */}
        <View
          className="mx-4 mb-4 rounded-2xl p-4 flex-row items-center gap-3"
          style={[
            styles.card,
            {
              backgroundColor: statusCfg.bg,
              borderWidth: 1,
              borderColor: statusCfg.border,
            },
          ]}
        >
          <View
            className="w-11 h-11 rounded-xl items-center justify-center"
            style={{ backgroundColor: statusCfg.text + '20' }}
          >
            <MaterialIcons
              name={statusCfg.icon as any}
              size={22}
              color={statusCfg.text}
            />
          </View>
          <View className="flex-1">
            <Text
              className="font-label font-semibold text-xs uppercase tracking-wider"
              style={{ color: statusCfg.text + 'CC' }}
            >
              {t('report.statusSectionLabel')}
            </Text>
            <Text
              className="font-sans text-base mt-0.5"
              style={{
                fontFamily: 'Epilogue',
                fontWeight: '700',
                color: statusCfg.text,
              }}
            >
              {t(statusCfg.labelKey)}
            </Text>
          </View>
          <View
            className="px-3 py-1.5 rounded-lg"
            style={{ backgroundColor: targetCfg.bg }}
          >
            <Text
              className="font-label font-semibold text-xs"
              style={{ color: targetCfg.text }}
            >
              {t(targetCfg.labelKey)}
            </Text>
          </View>
        </View>

        {/* ── Report Info Card ── */}
        <View
          className="mx-4 mb-4 bg-neutral-T100 rounded-2xl p-4 gap-4"
          style={styles.card}
        >
          <SectionLabel label={t('report.infoSectionLabel')} />

          <InfoRow
            icon={reasonIcon}
            label={t('report.violationReasonLabel')}
            value={reasonLabel}
          />

          <View className="h-px bg-neutral-T90" />

          <InfoRow
            icon="event"
            label={t('report.submittedDateLabel')}
            value={formatDate(report.createdAt)}
          />

          {report.resolvedAt && (
            <>
              <View className="h-px bg-neutral-T90" />
              <InfoRow
                icon="event-available"
                label={
                  isDismissed
                    ? t('report.dismissedDateLabel')
                    : t('report.resolvedDateLabel')
                }
                value={formatDate(report.resolvedAt)}
              />
            </>
          )}
        </View>

        {/* ── Description Card ── */}
        <View
          className="mx-4 mb-4 bg-neutral-T100 rounded-2xl p-4 gap-3"
          style={styles.card}
        >
          <SectionLabel label={t('report.descSectionLabel')} />
          <Text className="font-body text-sm text-neutral-T10 leading-5">
            {report.description}
          </Text>
        </View>

        {/* ── Evidence Images ── */}
        {report.images.length > 0 && (
          <View
            className="mx-4 mb-4 bg-neutral-T100 rounded-2xl p-4 gap-3"
            style={styles.card}
          >
            <View className="flex-row items-center justify-between">
              <SectionLabel label={t('report.evidenceSectionLabel')} />
              <Text className="font-label text-xs text-neutral-T50 -mt-2">
                {t('report.evidenceCountLabel', {
                  count: report.images.length,
                })}
              </Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 10 }}
            >
              {report.images.map((uri, index) => (
                <TouchableOpacity
                  key={`${uri}-${index}`}
                  activeOpacity={0.85}
                  onPress={() => setLightboxIndex(index)}
                >
                  <Image
                    source={{ uri }}
                    style={styles.thumbnail}
                    resizeMode="cover"
                  />
                  <View className="absolute bottom-1.5 right-1.5 bg-black/40 rounded px-1.5 py-0.5">
                    <Text className="text-white text-[9px] font-bold">
                      {index + 1}/{report.images.length}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* ── Resolution Card (RESOLVED or DISMISSED) ── */}
        {(isResolved || isDismissed) && (
          <View
            className="mx-4 mb-4 rounded-2xl p-4 gap-3"
            style={[
              styles.card,
              {
                backgroundColor: isDismissed ? '#FEF2F2' : '#F0FDF4',
                borderWidth: 1,
                borderColor: isDismissed ? '#FECACA' : '#BBF7D0',
              },
            ]}
          >
            <View className="flex-row items-center gap-2">
              <MaterialIcons
                name={isDismissed ? 'info-outline' : 'verified'}
                size={16}
                color={isDismissed ? '#DC2626' : '#15803D'}
              />
              <Text
                className="font-label font-semibold text-sm"
                style={{ color: isDismissed ? '#DC2626' : '#15803D' }}
              >
                {isDismissed
                  ? t('report.dismissedReasonLabel')
                  : t('report.resolvedResultLabel')}
              </Text>
            </View>

            {report.resolutionNote ? (
              <Text
                className="font-body text-sm leading-5"
                style={{ color: isDismissed ? '#991B1B' : '#166534' }}
              >
                {report.resolutionNote}
              </Text>
            ) : (
              <Text
                className="font-body text-sm italic"
                style={{
                  color: isDismissed ? '#DC2626' : '#15803D',
                  opacity: 0.7,
                }}
              >
                {t('report.noAdminNote')}
              </Text>
            )}

            {/* Action taken */}
            {actionLabel && (
              <View
                className="flex-row items-center gap-2 p-3 rounded-xl"
                style={{ backgroundColor: isDismissed ? '#FEE2E2' : '#DCFCE7' }}
              >
                <MaterialIcons
                  name="gavel"
                  size={14}
                  color={isDismissed ? '#DC2626' : '#15803D'}
                />
                <Text
                  className="font-label font-semibold text-xs flex-1"
                  style={{ color: isDismissed ? '#DC2626' : '#15803D' }}
                >
                  {t('report.actionLabel')} {actionLabel}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* ── Pending notice + actions ── */}
        {report.status === 'PENDING' && (
          <>
            <View
              className="mx-4 mb-4 flex-row gap-3 p-4 bg-yellow-50 rounded-2xl border border-yellow-200"
              style={styles.card}
            >
              <MaterialIcons
                name="hourglass-empty"
                size={18}
                color="#A16207"
                style={{ marginTop: 1 }}
              />
              <Text className="font-body text-sm text-yellow-800 flex-1 leading-5">
                {t('report.pendingNotice')}
              </Text>
            </View>

            {/* Edit / Withdraw buttons — only while PENDING */}
            <View className="mx-4 mb-4 flex-row gap-3">
              <TouchableOpacity
                className="flex-1 h-12 rounded-xl bg-neutral-T95 border border-neutral-T80 flex-row items-center justify-center gap-2"
                activeOpacity={0.8}
                onPress={handleEdit}
              >
                <MaterialIcons name="edit" size={18} color="#296C24" />
                <Text className="font-label font-semibold text-sm text-primary-T40">
                  {t('report.editReportBtn')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 h-12 rounded-xl bg-red-50 border border-red-200 flex-row items-center justify-center gap-2"
                activeOpacity={0.8}
                onPress={handleWithdraw}
                disabled={isWithdrawing}
              >
                {isWithdrawing ? (
                  <ActivityIndicator size="small" color="#DC2626" />
                ) : (
                  <>
                    <MaterialIcons name="undo" size={18} color="#DC2626" />
                    <Text className="font-label font-semibold text-sm text-error">
                      {t('report.withdrawBtn')}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* ── Resubmit notice (DISMISSED) ── */}
        {isDismissed && (
          <View
            className="mx-4 mb-4 flex-row gap-3 p-4 bg-primary-T95 rounded-2xl"
            style={styles.card}
          >
            <MaterialIcons
              name="refresh"
              size={18}
              color="#296C24"
              style={{ marginTop: 1 }}
            />
            <Text className="font-body text-sm text-primary-T30 flex-1 leading-5">
              {t('report.dismissedResubmitNotice')}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  thumbnail: {
    width: 120,
    height: 120,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
  },
});
