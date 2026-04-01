import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';

interface StoreDetailsCardProps {
  businessName: string;
  openHours: string;
  closeHours: string;
  description: string;
  businessAddress: string;
}

export default function StoreDetailsCard({
  businessName,
  openHours,
  closeHours,
  description,
  businessAddress,
}: StoreDetailsCardProps) {
  return (
    <View className="bg-neutral-T100 rounded-2xl shadow-sm p-6 gap-4">
      {/* Section header */}
      <View className="flex-row items-center gap-3">
        <View className="w-10 h-10 bg-primary-T95 rounded-xl items-center justify-center">
          <MaterialIcons name="storefront" size={20} color="#296C24" />
        </View>
        <Text className="font-sans font-bold text-lg text-neutral-T10">
          Store details
        </Text>
      </View>

      {/* Content */}
      <View className="gap-4 pt-2">
        <View>
          <Text className="font-body font-semibold text-lg text-neutral-T10">
            {businessName}
          </Text>
          <View className="flex-row items-center gap-2 mt-1">
            <MaterialIcons name="schedule" size={16} color="#757777" />
            <Text className="font-label text-sm text-neutral-T50">
              {openHours} — {closeHours}
            </Text>
          </View>
        </View>
        <Text className="text-sm leading-relaxed text-neutral-T30 font-body">
          {description}
        </Text>
        <View className="flex-row items-start gap-2 pt-2">
          <MaterialIcons name="location-on" size={20} color="#296C24" />
          <Text className="font-body text-sm text-neutral-T10 flex-1">
            {businessAddress}
          </Text>
        </View>
      </View>
    </View>
  );
}
