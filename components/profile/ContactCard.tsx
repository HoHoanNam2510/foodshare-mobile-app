import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

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
        <Text className="font-label text-[10px] text-neutral-T50 font-semibold uppercase">
          {label}
        </Text>
        <Text className="font-body text-sm text-neutral-T10" numberOfLines={1}>
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
    <View className="bg-neutral-T100 rounded-2xl shadow-sm p-6 gap-5">
      {isIncomplete && (
        <SectionIncompleteBadge message="Missing phone or address — tap Edit" />
      )}
      {/* Section header */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <View className="w-10 h-10 bg-secondary-T95 rounded-xl items-center justify-center">
            <MaterialIcons name="contact-mail" size={20} color="#944A00" />
          </View>
          <Text className="font-sans font-bold text-lg text-neutral-T10">
            Contact
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => setHideAll(!hideAll)}
          className="active:opacity-70 p-1"
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
          label="Email"
          value={email}
          isHidden={hideAll}
        />
        {phoneNumber ? (
          <PrivacyField
            icon="phone"
            label="Phone"
            value={phoneNumber}
            isHidden={hideAll}
          />
        ) : null}
        {defaultAddress ? (
          <PrivacyField
            icon="home"
            label="Address"
            value={defaultAddress}
            isHidden={hideAll}
          />
        ) : null}
        {locationText && (
          <PrivacyField
            icon="location-on"
            label="Location"
            value={locationText}
            isHidden={hideAll}
          />
        )}
      </View>
    </View>
  );
}
