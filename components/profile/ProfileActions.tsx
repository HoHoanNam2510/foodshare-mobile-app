import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';

interface ProfileActionsProps {
  onEditProfile?: () => void;
  onRegisterStore?: () => void;
  showRegisterStore?: boolean;
  storeRegistrationPending?: boolean;
  onDeleteAccount?: () => void;
}

export default function ProfileActions({
  onEditProfile,
  onRegisterStore,
  showRegisterStore,
  storeRegistrationPending,
  onDeleteAccount,
}: ProfileActionsProps) {
  const { t } = useTranslation();
  return (
    <View className="gap-3 pt-4">
      {showRegisterStore && storeRegistrationPending && (
        <TouchableOpacity
          className="bg-neutral-T95 border-neutral-T80 h-14 flex-row items-center justify-center gap-2 rounded-xl border"
          activeOpacity={1}
          disabled
        >
          <MaterialIcons name="storefront" size={20} color="#AAABAB" />
          <Text className="font-label text-neutral-T50 font-semibold">
            {t('profile.storePendingLabel')}
          </Text>
        </TouchableOpacity>
      )}
      {showRegisterStore && !storeRegistrationPending && (
        <TouchableOpacity
          className="bg-secondary-T95 border-secondary-T70 h-14 flex-row items-center justify-center gap-2 rounded-xl border active:scale-[0.98]"
          onPress={onRegisterStore}
          activeOpacity={0.8}
        >
          <MaterialIcons name="storefront" size={20} color="#6B5E00" />
          <Text className="font-label text-secondary-T40 font-semibold">
            {t('profile.registerStore')}
          </Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        className="bg-primary-T95 border-primary-T70 h-14 flex-row items-center justify-center gap-2 rounded-xl border active:scale-[0.98]"
        onPress={onEditProfile}
        activeOpacity={0.8}
      >
        <MaterialIcons name="edit" size={20} color="#296C24" />
        <Text className="font-label text-primary-T40 font-semibold">
          {t('profile.editProfile')}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="h-14 flex-row items-center justify-center gap-2 rounded-xl border border-[rgba(220,38,38,0.2)] bg-[rgba(220,38,38,0.06)] active:scale-[0.98]"
        onPress={onDeleteAccount}
        activeOpacity={0.8}
      >
        <MaterialIcons name="delete-forever" size={20} color="#DC2626" />
        <Text className="font-label font-semibold text-[#DC2626]">
          {t('profile.deleteAccount')}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
