import React from 'react';
import { useRouter } from 'expo-router';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import BaseHeader from './BaseHeader';
import { useMenuDrawerStore } from '@/stores/menuDrawerStore';
import { useAuthStore } from '@/stores/authStore';
import { useNotificationStore } from '@/stores/notificationStore';

export default function MainHeader() {
  const router = useRouter();
  const openDrawer = useMenuDrawerStore((s) => s.open);
  const user = useAuthStore((s) => s.user);
  const unreadCount = useNotificationStore((s) => s.unreadCount);

  return (
    <BaseHeader>
      <View className="flex-row items-center justify-between flex-1">
        {/* Left: Menu */}
        <TouchableOpacity
          className="w-10 h-10 rounded-full bg-neutral-T95 items-center justify-center active:opacity-80"
          onPress={openDrawer}
        >
          <Feather name="menu" size={20} color="#191C1C" />
        </TouchableOpacity>

        {/* Center: Logo + FoodShare */}
        <View className="flex-row items-center gap-2">
          <Image
            source={require('../../../assets/images/logo.png')}
            style={{ width: 28, height: 28 }}
            resizeMode="contain"
          />
          <Text
            className="text-lg font-sans tracking-tight text-primary-T40"
            style={{ fontWeight: '700', letterSpacing: -0.3 }}
          >
            FoodShare
          </Text>
        </View>

        {/* Right: Notification + Profile */}
        <View className="flex-row items-center gap-2.5">
          <TouchableOpacity
            className="w-10 h-10 rounded-full bg-neutral-T95 items-center justify-center active:opacity-80"
            onPress={() => router.push('/(notification)/notifications' as never)}
          >
            <Feather name="bell" size={19} color="#191C1C" />
            {unreadCount > 0 && (
              <View className="absolute top-0.5 right-0.5 min-w-[16px] h-4 rounded-full bg-red-500 items-center justify-center px-0.5">
                <Text className="text-white text-[9px] font-bold leading-none">
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
              className="w-10 h-10 rounded-full border border-neutral-T90"
            />
          </TouchableOpacity>
        </View>
      </View>
    </BaseHeader>
  );
}
