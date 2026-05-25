import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { useThemeColors } from '@/lib/hooks/useThemeColors';
import { useAuthStore } from '@/stores/authStore';
import { useMenuDrawerStore } from '@/stores/menuDrawerStore';
import { useNotificationStore } from '@/stores/notificationStore';
import BaseHeader from './BaseHeader';

export default function MainHeader() {
  const router = useRouter();
  const openDrawer = useMenuDrawerStore((s) => s.open);
  const user = useAuthStore((s) => s.user);
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const colors = useThemeColors();

  return (
    <BaseHeader>
      <View className="flex-1 flex-row items-center justify-between">
        {/* Left: Menu */}
        <TouchableOpacity
          className="bg-neutral-T95 dark:bg-neutral-T30 h-10 w-10 items-center justify-center rounded-full active:opacity-80"
          onPress={openDrawer}
        >
          <Feather name="menu" size={20} color={colors.textPrimary} />
        </TouchableOpacity>

        {/* Center: Logo + FoodShare */}
        <View className="flex-row items-center gap-2">
          <Image
            source={require('../../../assets/images/logo.png')}
            style={{ width: 28, height: 28 }}
            resizeMode="contain"
          />
          <Text
            className="text-primary-T40 dark:text-primary-T60 font-sans text-lg tracking-tight"
            style={{ fontWeight: '700', letterSpacing: -0.3 }}
          >
            FoodShare
          </Text>
        </View>

        {/* Right: Notification + Profile */}
        <View className="flex-row items-center gap-2.5">
          <TouchableOpacity
            className="bg-neutral-T95 dark:bg-neutral-T30 h-10 w-10 items-center justify-center rounded-full active:opacity-80"
            onPress={() =>
              router.push('/(notification)/notifications' as never)
            }
          >
            <Feather name="bell" size={19} color={colors.textPrimary} />
            {unreadCount > 0 && (
              <View className="absolute right-0.5 top-0.5 h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-0.5">
                <Text className="text-[9px] font-bold leading-none text-white">
                  {unreadCount > 99 ? '99+' : String(unreadCount)}
                </Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            className="active:opacity-80"
            onPress={() => router.push('/profile')}
          >
            <Image
              source={
                user?.avatar
                  ? { uri: user.avatar }
                  : require('../../../assets/images/logo.png')
              }
              className="border-neutral-T90 dark:border-neutral-T30 h-10 w-10 rounded-full border"
            />
          </TouchableOpacity>
        </View>
      </View>
    </BaseHeader>
  );
}
