// components/shared/SelectPostTypeModal.tsx
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Modal, Pressable, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

type PostType = 'FREE_FOOD' | 'SURPRISE_BAG';
type UserRole = 'USER' | 'STORE' | 'ADMIN';

// USER chỉ được tạo FREE_FOOD (P2P). STORE/ADMIN được tạo cả hai.
const ALLOWED_POST_TYPES: Record<UserRole, PostType[]> = {
  USER: ['FREE_FOOD'],
  STORE: ['FREE_FOOD', 'SURPRISE_BAG'],
  ADMIN: ['FREE_FOOD', 'SURPRISE_BAG'],
};

type SelectPostTypeModalProps = {
  visible: boolean;
  onClose: () => void;
  userRole?: UserRole;
};

export default function SelectPostTypeModal({
  visible,
  onClose,
  userRole = 'USER',
}: SelectPostTypeModalProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [errorType, setErrorType] = useState<PostType | null>(null);

  const allowedTypes = ALLOWED_POST_TYPES[userRole];

  const handleSelect = (postType: PostType) => {
    if (!allowedTypes.includes(postType)) {
      setErrorType(postType);
      return;
    }
    setErrorType(null);
    onClose();
    setTimeout(() => {
      router.push({
        pathname: '/(post)/create-post' as any,
        params: { type: postType },
      });
    }, 150);
  };

  const handleClose = () => {
    setErrorType(null);
    onClose();
  };

  const handleGoRegisterStore = () => {
    handleClose();
    setTimeout(() => {
      router.push('/(profile)/register-store' as any);
    }, 150);
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <Pressable
        className="bg-neutral-T10/70 flex-1 justify-end"
        onPress={handleClose}
      >
        <Pressable onPress={(e) => e.stopPropagation()}>
          <View
            className="bg-neutral-T100 dark:bg-neutral-T20 border-neutral-T90 dark:border-neutral-T30 rounded-t-3xl border-t px-6 pt-4 shadow-lg dark:shadow-none"
            style={{ paddingBottom: Math.max(insets.bottom, 24) + 16 }}
          >
            {/* Drag handle */}
            <View className="bg-neutral-T80 dark:bg-neutral-T30 mb-8 h-1.5 w-12 self-center rounded-md" />

            {/* ── Option 1: P2P Free Food ── */}
            <PostTypeOption
              icon="heart"
              iconBg={
                allowedTypes.includes('FREE_FOOD') ? '#296C24' : '#AAABAB'
              }
              title={t('post.selectTypeFreeFoodTitle')}
              subtitle={t('post.selectTypeFreeFoodSubtitle')}
              allowed={allowedTypes.includes('FREE_FOOD')}
              showError={errorType === 'FREE_FOOD'}
              errorMsg={t('post.selectTypeNoPermission')}
              onPress={() => handleSelect('FREE_FOOD')}
            />

            <View className="mb-4" />

            {/* ── Option 2: B2C Surprise Bag ── */}
            <PostTypeOption
              icon="shopping-bag"
              iconBg={
                allowedTypes.includes('SURPRISE_BAG') ? '#944A00' : '#AAABAB'
              }
              title={t('post.selectTypeSurpriseBagTitle')}
              subtitle={t('post.selectTypeSurpriseBagSubtitle')}
              allowed={allowedTypes.includes('SURPRISE_BAG')}
              showError={errorType === 'SURPRISE_BAG'}
              errorMsg={
                userRole === 'USER'
                  ? t('post.selectTypeStoreOnly')
                  : t('post.selectTypeNoPermission')
              }
              upgradeLabel={
                userRole === 'USER'
                  ? t('post.selectTypeUpgradeToStore')
                  : undefined
              }
              onUpgradePress={
                userRole === 'USER' ? handleGoRegisterStore : undefined
              }
              onPress={() => handleSelect('SURPRISE_BAG')}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ── Internal sub-component ──
interface PostTypeOptionProps {
  icon: React.ComponentProps<typeof Feather>['name'];
  iconBg: string;
  title: string;
  subtitle: string;
  allowed: boolean;
  showError: boolean;
  errorMsg: string;
  upgradeLabel?: string;
  onUpgradePress?: () => void;
  onPress: () => void;
}

function PostTypeOption({
  icon,
  iconBg,
  title,
  subtitle,
  allowed,
  showError,
  errorMsg,
  upgradeLabel,
  onUpgradePress,
  onPress,
}: PostTypeOptionProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  return (
    <View>
      <TouchableOpacity
        activeOpacity={allowed ? 0.8 : 0.95}
        className={`flex-row items-center gap-4 rounded-2xl border px-4 py-4 shadow-sm ${
          allowed
            ? 'bg-neutral-T100 dark:bg-neutral-T30 border-neutral-T90 dark:border-neutral-T30'
            : 'bg-neutral-T97 dark:bg-neutral-T30 border-neutral-T90 dark:border-neutral-T30 opacity-50'
        }`}
        onPress={onPress}
      >
        <View
          className="h-14 w-14 items-center justify-center rounded-xl"
          style={{ backgroundColor: iconBg }}
        >
          <Feather name={icon} size={24} color="#FFFFFF" />
        </View>
        <View className="flex-1">
          <Text
            className={`mb-0.5 font-sans text-lg leading-tight ${allowed ? 'text-neutral-T10 dark:text-neutral-T90' : 'text-neutral-T50 dark:text-neutral-T60'}`}
            style={{ fontWeight: '800' }}
          >
            {title}
          </Text>
          <Text className="font-body text-neutral-T50 dark:text-neutral-T60 text-sm">
            {subtitle}
          </Text>
        </View>
        {allowed ? (
          <Feather
            name="arrow-right"
            size={20}
            color={isDark ? '#E1E3E2' : '#191C1C'}
          />
        ) : (
          <MaterialIcons name="lock" size={18} color="#AAABAB" />
        )}
      </TouchableOpacity>
      {showError && (
        <View className="ml-1 mt-1.5 gap-0.5">
          <View className="flex-row items-center gap-1">
            <MaterialIcons name="info-outline" size={13} color="#ba1a1a" />
            <Text className="font-body text-error text-xs">{errorMsg}</Text>
          </View>
          {upgradeLabel && onUpgradePress && (
            <TouchableOpacity onPress={onUpgradePress} className="ml-4">
              <Text className="font-label text-primary-T30 dark:text-primary-T60 text-xs underline">
                {upgradeLabel}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}
