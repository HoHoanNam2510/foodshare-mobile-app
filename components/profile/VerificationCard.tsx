import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Image, ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

type KycStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

interface VerificationCardProps {
  kycStatus: KycStatus;
  kycDocuments: string[];
}

const KYC_BADGE: Record<
  KycStatus,
  { containerClass: string; textClass: string; labelKey: string; bgStyle?: object }
> = {
  VERIFIED: {
    containerClass: 'bg-primary-T95',
    textClass: 'text-primary-T40',
    labelKey: 'profile.kycVerified',
  },
  PENDING: {
    containerClass: 'bg-secondary-T95',
    textClass: 'text-secondary-T40',
    labelKey: 'profile.kycPending',
  },
  REJECTED: {
    containerClass: '',
    textClass: 'text-error',
    labelKey: 'profile.kycRejected',
    bgStyle: { backgroundColor: 'rgba(186,26,26,0.1)' },
  },
};

export default function VerificationCard({
  kycStatus,
  kycDocuments,
}: VerificationCardProps) {
  const { t } = useTranslation();
  const badge = KYC_BADGE[kycStatus];

  return (
    <View className="bg-neutral-T100 rounded-2xl shadow-sm p-6 gap-5">
      {/* Section header */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <View className="w-10 h-10 bg-primary-T95 rounded-xl items-center justify-center">
            <MaterialIcons name="verified-user" size={20} color="#296C24" />
          </View>
          <Text className="font-sans font-bold text-lg text-neutral-T10">
            {t('profile.verificationTitle')}
          </Text>
        </View>
        {/* KYC status badge */}
        <View
          className={`${badge.containerClass} rounded-full p-2`}
          style={badge.bgStyle}
        >
          <Text
            className={`font-label text-[11px] font-bold ${badge.textClass}`}
          >
            {t(badge.labelKey)}
          </Text>
        </View>
      </View>

      {/* Trạng thái PENDING: hiển thị thông báo chờ */}
      {kycStatus === 'PENDING' && (
        <View className="bg-secondary-T95 border border-secondary-T70 rounded-xl p-3 flex-row gap-2 items-start">
          <MaterialIcons name="schedule" size={16} color="#6B5E00" />
          <Text className="font-body text-xs text-secondary-T30 flex-1 leading-5">
            {t('profile.verificationPendingMsg')}
          </Text>
        </View>
      )}

      {/* Trạng thái REJECTED: hiển thị cảnh báo */}
      {kycStatus === 'REJECTED' && (
        <View
          className="rounded-xl p-3 flex-row gap-2 items-start"
          style={{ backgroundColor: 'rgba(186,26,26,0.08)' }}
        >
          <MaterialIcons name="error-outline" size={16} color="#ba1a1a" />
          <Text className="font-body text-xs text-error flex-1 leading-5">
            {t('profile.verificationRejectedMsg')}
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
            className="w-32 h-20 rounded-xl overflow-hidden shadow-sm"
          >
            <Image
              source={{ uri: doc }}
              className="w-full h-full"
              resizeMode="cover"
              style={{ opacity: 0.7 }}
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
