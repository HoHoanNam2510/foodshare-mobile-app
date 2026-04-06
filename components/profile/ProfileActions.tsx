import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface ProfileActionsProps {
  onEditProfile?: () => void;
  onRegisterStore?: () => void;
  onLogOut?: () => void;
  showRegisterStore?: boolean;
  storeRegistrationPending?: boolean;
}

export default function ProfileActions({
  onEditProfile,
  onRegisterStore,
  onLogOut,
  showRegisterStore,
  storeRegistrationPending,
}: ProfileActionsProps) {
  return (
    <View className="gap-3 pt-4">
      {showRegisterStore && (
        <TouchableOpacity
          className={`h-14 rounded-xl border flex-row items-center justify-center gap-2 ${
            storeRegistrationPending
              ? 'bg-neutral-T95 border-neutral-T80'
              : 'bg-secondary-T95 border-secondary-T70 active:scale-[0.98]'
          }`}
          onPress={storeRegistrationPending ? undefined : onRegisterStore}
          activeOpacity={storeRegistrationPending ? 1 : 0.8}
          disabled={storeRegistrationPending}
        >
          <MaterialIcons
            name="storefront"
            size={20}
            color={storeRegistrationPending ? '#AAABAB' : '#6B5E00'}
          />
          <Text
            className={`font-label font-semibold ${storeRegistrationPending ? 'text-neutral-T50' : 'text-secondary-T40'}`}
          >
            {storeRegistrationPending
              ? 'Đang chờ xét duyệt cửa hàng...'
              : 'Đăng ký cửa hàng'}
          </Text>
        </TouchableOpacity>
      )}

      <View className="flex-row gap-3">
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
    </View>
  );
}
