import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Image, ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useThemeColors } from '@/lib/hooks/useThemeColors';

type KycStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';
type PendingKycStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | null;

interface VerificationCardProps {
  kycStatus: KycStatus;
  kycDocuments: string[];
  pendingKycStatus?: PendingKycStatus;
  graceDaysLeft?: number | null;
  isInGracePeriod?: boolean;
}

const KYC_BADGE: Record<
  KycStatus,
  {
    containerClass: string;
    textClass: string;
    labelKey: string;
  }
> = {
  VERIFIED: {
    containerClass: 'bg-primary-T95 dark:bg-primary-T20',
    textClass: 'text-primary-T40 dark:text-primary-T60',
    labelKey: 'profile.kycVerified',
  },
  PENDING: {
    containerClass: 'bg-secondary-T95 dark:bg-secondary-T20',
    textClass: 'text-secondary-T40 dark:text-secondary-T60',
    labelKey: 'profile.kycPending',
  },
  REJECTED: {
    containerClass: 'bg-[rgba(186,26,26,0.1)] dark:bg-[rgba(186,26,26,0.2)]',
    textClass: 'text-error',
    labelKey: 'profile.kycRejected',
  },
};

export default function VerificationCard({
  kycStatus,
  kycDocuments,
  pendingKycStatus,
  graceDaysLeft,
  isInGracePeriod,
}: VerificationCardProps) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const badge = KYC_BADGE[kycStatus];

  return (
    <View className="bg-neutral-T100 dark:bg-neutral-T20 dark:border-neutral-T30 gap-5 rounded-2xl p-6 shadow-sm dark:border dark:shadow-none">
      {/* Section header */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <View className="bg-primary-T95 dark:bg-primary-T20 h-10 w-10 items-center justify-center rounded-xl">
            <MaterialIcons
              name="verified-user"
              size={20}
              color={colors.primaryGreen}
            />
          </View>
          <Text className="text-neutral-T10 dark:text-neutral-T90 font-sans text-lg font-bold">
            {t('profile.verificationTitle')}
          </Text>
        </View>
        {/* KYC status badge */}
        <View className={`${badge.containerClass} rounded-full p-2`}>
          <Text
            className={`font-label text-[11px] font-bold ${badge.textClass}`}
          >
            {t(badge.labelKey)}
          </Text>
        </View>
      </View>

      {/* Trạng thái PENDING (đăng ký lần đầu): hiển thị thông báo chờ */}
      {kycStatus === 'PENDING' && (
        <View className="bg-secondary-T95 dark:bg-secondary-T20 border-secondary-T70 dark:border-secondary-T30 flex-row items-start gap-2 rounded-xl border p-3">
          <MaterialIcons name="schedule" size={16} color="#6B5E00" />
          <Text className="font-body text-secondary-T30 dark:text-secondary-T80 flex-1 text-xs leading-5">
            {t('profile.verificationPendingMsg')}
          </Text>
        </View>
      )}

      {/* Trạng thái REJECTED (đăng ký lần đầu): hiển thị cảnh báo */}
      {kycStatus === 'REJECTED' && (
        <View className="flex-row items-start gap-2 rounded-xl bg-[rgba(186,26,26,0.08)] p-3 dark:bg-[rgba(186,26,26,0.18)]">
          <MaterialIcons name="error-outline" size={16} color="#ba1a1a" />
          <Text className="font-body text-error flex-1 text-xs leading-5">
            {t('profile.verificationRejectedMsg')}
          </Text>
        </View>
      )}

      {/* Tái nộp KYC đang chờ duyệt */}
      {pendingKycStatus === 'PENDING' && (
        <View className="bg-secondary-T95 dark:bg-secondary-T20 border-secondary-T70 dark:border-secondary-T30 flex-row items-start gap-2 rounded-xl border p-3">
          <MaterialIcons name="schedule" size={16} color="#6B5E00" />
          <Text className="font-body text-secondary-T30 dark:text-secondary-T80 flex-1 text-xs leading-5">
            {t('profile.kycResubmitPendingMsg')}
          </Text>
        </View>
      )}

      {/* Tái nộp KYC bị từ chối — còn trong grace period */}
      {pendingKycStatus === 'REJECTED' && isInGracePeriod && (
        <View className="flex-row items-start gap-2 rounded-xl bg-[rgba(186,26,26,0.08)] p-3 dark:bg-[rgba(186,26,26,0.18)]">
          <MaterialIcons name="warning-amber" size={16} color="#ba1a1a" />
          <Text className="font-body text-error flex-1 text-xs leading-5">
            {t('profile.kycGracePeriodCardMsg', { days: graceDaysLeft })}
          </Text>
        </View>
      )}

      {/* Tái nộp KYC bị từ chối — hết grace period (graceDaysLeft=0, không phải null) */}
      {pendingKycStatus === 'REJECTED' &&
        !isInGracePeriod &&
        graceDaysLeft !== null &&
        graceDaysLeft !== undefined &&
        graceDaysLeft <= 0 && (
          <View className="flex-row items-start gap-2 rounded-xl bg-[rgba(186,26,26,0.08)] p-3 dark:bg-[rgba(186,26,26,0.18)]">
            <MaterialIcons name="lock" size={16} color="#ba1a1a" />
            <Text className="font-body text-error flex-1 text-xs leading-5">
              {t('profile.kycExpiredMsg')}
            </Text>
          </View>
        )}

      {/* KYC document images */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 12 }}
      >
        {kycDocuments.map((doc) => (
          <View
            key={doc}
            className="h-20 w-32 overflow-hidden rounded-xl shadow-sm"
          >
            <Image
              source={{ uri: doc }}
              className="h-full w-full"
              resizeMode="cover"
              style={{ opacity: 0.7 }}
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
