import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface ProfileHeaderProps {
  onSettingsPress?: () => void;
}

export default function ProfileHeader({ onSettingsPress }: ProfileHeaderProps) {
  const router = useRouter();

  return (
    <View className="flex-row items-center justify-between h-16 px-6 bg-neutral-T100 shadow-sm">
      <TouchableOpacity
        className="p-2 rounded-full active:opacity-70"
        onPress={() => router.back()}
      >
        <MaterialIcons name="arrow-back" size={24} color="#191C1C" />
      </TouchableOpacity>
      <Text className="font-sans font-bold text-lg text-neutral-T10">
        Profile
      </Text>
      <TouchableOpacity
        className="p-2 rounded-full active:opacity-70"
        onPress={onSettingsPress}
      >
        <MaterialIcons name="settings" size={24} color="#191C1C" />
      </TouchableOpacity>
    </View>
  );
}
