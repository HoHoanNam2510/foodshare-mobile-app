import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import SectionIncompleteBadge from '@/components/profile/SectionIncompleteBadge';

interface StoreDetailsCardProps {
  businessName?: string;
  openHours?: string;
  closeHours?: string;
  description?: string;
  businessAddress?: string;
  isIncomplete?: boolean;
}

export default function StoreDetailsCard({
  businessName,
  openHours,
  closeHours,
  description,
  businessAddress,
  isIncomplete,
}: StoreDetailsCardProps) {
  const { t } = useTranslation();
  return (
    <View className="bg-neutral-T100 dark:bg-neutral-T20 dark:border-neutral-T30 gap-4 rounded-2xl p-6 shadow-sm dark:border dark:shadow-none">
      {isIncomplete && (
        <SectionIncompleteBadge message={t('profile.storeIncompleteMsg')} />
      )}
      {/* Section header */}
      <View className="flex-row items-center gap-3">
        <View className="bg-tertiary-T95 dark:bg-tertiary-T20 h-10 w-10 items-center justify-center rounded-xl">
          <MaterialIcons name="storefront" size={20} color="#983F6A" />
        </View>
        <Text className="text-neutral-T10 dark:text-neutral-T90 font-sans text-lg font-bold">
          {t('profile.storeDetailsTitle')}
        </Text>
      </View>

      {/* Content */}
      <View className="gap-4 pt-2">
        <View>
          <Text className="font-body text-neutral-T10 dark:text-neutral-T90 text-lg font-semibold">
            {businessName || t('profile.storeNotSet')}
          </Text>
          {(openHours || closeHours) && (
            <View className="mt-1 flex-row items-center gap-2">
              <MaterialIcons name="schedule" size={16} color="#757777" />
              <Text className="font-label text-neutral-T50 dark:text-neutral-T60 text-sm">
                {openHours || '--:--'} — {closeHours || '--:--'}
              </Text>
            </View>
          )}
        </View>
        {description ? (
          <Text className="text-neutral-T30 dark:text-neutral-T80 font-body text-sm leading-relaxed">
            {description}
          </Text>
        ) : null}
        {businessAddress ? (
          <View className="flex-row items-start gap-2 pt-2">
            <MaterialIcons name="location-on" size={20} color="#983F6A" />
            <Text className="font-body text-neutral-T10 dark:text-neutral-T90 flex-1 text-sm">
              {businessAddress}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}
