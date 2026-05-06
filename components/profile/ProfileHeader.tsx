import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';

interface ProfileHeaderProps {
  onSettingsPress?: () => void;
}

export default function ProfileHeader({ onSettingsPress }: ProfileHeaderProps) {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <View className="bg-neutral-T100 h-16 flex-row items-center gap-4 px-6 shadow-sm">
      <TouchableOpacity
        className="p-1 active:opacity-70"
        onPress={() => router.back()}
      >
        <MaterialIcons name="arrow-back" size={24} color="#757777" />
      </TouchableOpacity>
      <Text className="text-primary-T40 font-sans text-lg font-bold">
        {t('profile.title')}
      </Text>
      {/* <TouchableOpacity
        className="p-2 rounded-full active:opacity-70"
        onPress={onSettingsPress}
      >
        <MaterialIcons name="settings" size={24} color="#191C1C" />
      </TouchableOpacity> */}
    </View>
  );
}
