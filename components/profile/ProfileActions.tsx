import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface ProfileActionsProps {
  onEditProfile?: () => void;
  onLogOut?: () => void;
}

export default function ProfileActions({
  onEditProfile,
  onLogOut,
}: ProfileActionsProps) {
  return (
    <View className="gap-3 pt-4">
      <TouchableOpacity
        className="w-full h-14 rounded-xl border border-neutral-T80 bg-neutral-T100 flex-row items-center justify-center gap-2 active:scale-[0.98]"
        onPress={onEditProfile}
        activeOpacity={0.8}
      >
        <MaterialIcons name="edit" size={20} color="#191C1C" />
        <Text className="font-label font-semibold text-neutral-T10">
          Edit profile
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        className="w-full h-14 rounded-xl flex-row items-center justify-center gap-2 active:opacity-60"
        onPress={onLogOut}
        activeOpacity={0.6}
      >
        <MaterialIcons name="logout" size={20} color="#ba1a1a" />
        <Text className="font-label font-semibold text-error">Log out</Text>
      </TouchableOpacity>
    </View>
  );
}
