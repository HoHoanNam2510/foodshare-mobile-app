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
    <View className="flex-row gap-3 pt-4">
      <TouchableOpacity
        className="flex-1 h-14 rounded-xl bg-primary-T95 border border-primary-T70 flex-row items-center justify-center gap-2 active:scale-[0.98]"
        onPress={onEditProfile}
        activeOpacity={0.8}
      >
        <MaterialIcons name="edit" size={20} color="#296C24" />
        <Text className="font-label font-semibold text-primary-T40">
          Edit profile
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        className="flex-1 h-14 rounded-xl bg-red-50 border border-red-200 flex-row items-center justify-center gap-2 active:scale-[0.98]"
        onPress={onLogOut}
        activeOpacity={0.8}
      >
        <MaterialIcons name="logout" size={20} color="#ba1a1a" />
        <Text className="font-label font-semibold text-error">Log out</Text>
      </TouchableOpacity>
    </View>
  );
}
