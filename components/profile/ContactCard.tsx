import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import SectionIncompleteBadge from '@/components/profile/SectionIncompleteBadge';
import { reverseGeocode } from '@/lib/mapApi';

interface PrivacyFieldProps {
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  label: string;
  value: string;
  isHidden: boolean;
}

const PrivacyField = ({ icon, label, value, isHidden }: PrivacyFieldProps) => {
  const maskedValue =
    '*'.repeat(Math.min(value.length, 12)) + (value.length > 12 ? '...' : '');
  return (
    <View className="flex-row items-center gap-4">
      <MaterialIcons name={icon} size={22} color="#944A00" />
      <View className="flex-1">
        <Text className="font-label text-neutral-T50 text-[10px] font-semibold uppercase">
          {label}
        </Text>
        <Text className="font-body text-neutral-T10 text-sm" numberOfLines={1}>
          {isHidden ? maskedValue : value}
        </Text>
      </View>
    </View>
  );
};

interface ContactCardProps {
  email: string;
  phoneNumber?: string;
  defaultAddress?: string;
  location?: { type: string; coordinates: [number, number] };
  isIncomplete?: boolean;
}

export default function ContactCard({
  email,
  phoneNumber,
  defaultAddress,
  location,
  isIncomplete,
}: ContactCardProps) {
  const { t } = useTranslation();
  const [hideAll, setHideAll] = useState(true);
  const [resolvedAddress, setResolvedAddress] = useState<string | null>(null);

  useEffect(() => {
    if (!location) return;
    const [lng, lat] = location.coordinates;
    reverseGeocode(lat, lng).then((addr) => {
      if (addr) setResolvedAddress(addr);
    });
  }, [location]);

  const locationText =
    resolvedAddress ??
    (location
      ? `${location.coordinates[1].toFixed(4)}, ${location.coordinates[0].toFixed(4)}`
      : undefined);

  return (
    <View className="bg-neutral-T100 gap-5 rounded-2xl p-6 shadow-sm">
      {isIncomplete && (
        <SectionIncompleteBadge message={t('profile.contactIncompleteMsg')} />
      )}
      {/* Section header */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <View className="bg-secondary-T95 h-10 w-10 items-center justify-center rounded-xl">
            <MaterialIcons name="contact-mail" size={20} color="#944A00" />
          </View>
          <Text className="text-neutral-T10 font-sans text-lg font-bold">
            {t('profile.contactTitle')}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => setHideAll(!hideAll)}
          className="p-1 active:opacity-70"
        >
          <MaterialIcons
            name={hideAll ? 'visibility-off' : 'visibility'}
            size={22}
            color="#757777"
          />
        </TouchableOpacity>
      </View>

      <View className="gap-4">
        <PrivacyField
          icon="mail"
          label={t('auth.email')}
          value={email}
          isHidden={hideAll}
        />
        {phoneNumber ? (
          <PrivacyField
            icon="phone"
            label={t('profile.fieldPhone')}
            value={phoneNumber}
            isHidden={hideAll}
          />
        ) : null}
        {defaultAddress ? (
          <PrivacyField
            icon="home"
            label={t('profile.fieldAddress')}
            value={defaultAddress}
            isHidden={hideAll}
          />
        ) : null}
        {locationText && (
          <PrivacyField
            icon="location-on"
            label={t('profile.fieldLocation')}
            value={locationText}
            isHidden={hideAll}
          />
        )}
      </View>
    </View>
  );
}
