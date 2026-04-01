import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Image, ScrollView, Text, View } from 'react-native';

import SectionIncompleteBadge from '@/components/profile/SectionIncompleteBadge';

type KycStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

interface VerificationCardProps {
  kycStatus: KycStatus;
  kycDocuments: string[];
  isIncomplete?: boolean;
}

const getKycBadgeClass = (status: KycStatus) => {
  switch (status) {
    case 'VERIFIED':
      return { container: 'bg-primary-T95', text: 'text-primary-T40' };
    case 'PENDING':
      return { container: 'bg-secondary-T95', text: 'text-secondary-T40' };
    case 'REJECTED':
      return { container: null, text: 'text-error' };
    default:
      return { container: 'bg-neutral-T95', text: 'text-neutral-T50' };
  }
};

export default function VerificationCard({
  kycStatus,
  kycDocuments,
  isIncomplete,
}: VerificationCardProps) {
  const badgeStyle = getKycBadgeClass(kycStatus);

  return (
    <View className="bg-neutral-T100 rounded-2xl shadow-sm p-6 gap-5">
      {isIncomplete && (
        <SectionIncompleteBadge message="No KYC documents uploaded yet" />
      )}
      {/* Section header */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <View className="w-10 h-10 bg-primary-T95 rounded-xl items-center justify-center">
            <MaterialIcons name="verified-user" size={20} color="#296C24" />
          </View>
          <Text className="font-sans font-bold text-lg text-neutral-T10">
            Verification
          </Text>
        </View>
        {/* KYC status badge */}
        {kycStatus === 'REJECTED' ? (
          <View
            className="rounded-full px-3 py-1"
            style={{ backgroundColor: 'rgba(186,26,26,0.1)' }}
          >
            <Text className="font-label text-[11px] font-bold text-error">
              {kycStatus}
            </Text>
          </View>
        ) : (
          <View className={`${badgeStyle.container} rounded-full px-3 py-1`}>
            <Text
              className={`font-label text-[11px] font-bold ${badgeStyle.text}`}
            >
              {kycStatus}
            </Text>
          </View>
        )}
      </View>

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
              style={{ opacity: 0.6 }}
            />
          </View>
        ))}
        {/* Add document placeholder */}
        <View className="w-32 h-20 rounded-xl bg-neutral-T95 items-center justify-center border border-dashed border-neutral-T80">
          <MaterialIcons name="add" size={24} color="#757777" />
        </View>
      </ScrollView>
    </View>
  );
}
