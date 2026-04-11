import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface ProfileActionsProps {
  onEditProfile?: () => void;
  onRegisterStore?: () => void;
  showRegisterStore?: boolean;
  storeRegistrationPending?: boolean;
}

export default function ProfileActions({
  onEditProfile,
  onRegisterStore,
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

      <TouchableOpacity
        className="h-14 rounded-xl bg-primary-T95 border border-primary-T70 flex-row items-center justify-center gap-2 active:scale-[0.98]"
        onPress={onEditProfile}
        activeOpacity={0.8}
      >
        <MaterialIcons name="edit" size={20} color="#296C24" />
        <Text className="font-label font-semibold text-primary-T40">
          Chỉnh sửa hồ sơ
        </Text>
      </TouchableOpacity>
    </View>
  );
}
