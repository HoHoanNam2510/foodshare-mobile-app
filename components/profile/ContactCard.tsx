import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface PrivacyFieldProps {
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  label: string;
  value: string;
  isHidden: boolean;
  onToggle: () => void;
}

const PrivacyField = ({
  icon,
  label,
  value,
  isHidden,
  onToggle,
}: PrivacyFieldProps) => {
  const maskedValue = '*'.repeat(Math.min(value.length, 12)) + (value.length > 12 ? '...' : '');
  return (
    <View className="flex-row items-center justify-between">
      <View className="flex-row items-center gap-4 flex-1 mr-3">
        <MaterialIcons name={icon} size={22} color="#296C24" />
        <View className="flex-1">
          <Text className="font-label text-[10px] text-neutral-T50 font-semibold uppercase">
            {label}
          </Text>
          <Text className="font-body text-sm text-neutral-T10" numberOfLines={1}>
            {isHidden ? maskedValue : value}
          </Text>
        </View>
      </View>
      <TouchableOpacity onPress={onToggle} className="active:opacity-70 p-1">
        <MaterialIcons
          name={isHidden ? 'visibility-off' : 'visibility'}
          size={22}
          color="#757777"
        />
      </TouchableOpacity>
    </View>
  );
};

interface ContactCardProps {
  email: string;
  phoneNumber: string;
  defaultAddress: string;
}

export default function ContactCard({
  email,
  phoneNumber,
  defaultAddress,
}: ContactCardProps) {
  const [hideEmail, setHideEmail] = useState(true);
  const [hidePhone, setHidePhone] = useState(true);

  return (
    <View className="bg-neutral-T100 rounded-2xl shadow-sm p-6 gap-5">
      {/* Section header */}
      <View className="flex-row items-center gap-3">
        <View className="w-10 h-10 bg-tertiary-T95 rounded-xl items-center justify-center">
          <MaterialIcons name="contact-mail" size={20} color="#983F6A" />
        </View>
        <Text className="font-sans font-bold text-lg text-neutral-T10">
          Contact
        </Text>
      </View>

      <View className="gap-4">
        <PrivacyField
          icon="mail"
          label="Email"
          value={email}
          isHidden={hideEmail}
          onToggle={() => setHideEmail(!hideEmail)}
        />
        <PrivacyField
          icon="phone"
          label="Phone"
          value={phoneNumber}
          isHidden={hidePhone}
          onToggle={() => setHidePhone(!hidePhone)}
        />
        <View className="flex-row items-center gap-4">
          <MaterialIcons name="location-on" size={22} color="#296C24" />
          <View className="flex-1">
            <Text className="font-label text-[10px] text-neutral-T50 font-semibold uppercase">
              Address
            </Text>
            <Text className="font-body text-sm text-neutral-T10">
              {defaultAddress}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
