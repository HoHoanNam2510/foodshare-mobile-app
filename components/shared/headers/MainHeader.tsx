import React from 'react';
import { useRouter } from 'expo-router';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import BaseHeader from './BaseHeader';
import { useMenuDrawerStore } from '@/stores/menuDrawerStore';

export default function MainHeader() {
  const router = useRouter();
  const openDrawer = useMenuDrawerStore((s) => s.open);

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
          <TouchableOpacity className="w-10 h-10 rounded-full bg-neutral-T95 items-center justify-center active:opacity-80">
            <Feather name="bell" size={19} color="#191C1C" />
          </TouchableOpacity>
          <TouchableOpacity
            className="active:opacity-80"
            onPress={() => router.push('/profile')}
          >
            <Image
              source={{ uri: 'https://i.pravatar.cc/60?img=33' }}
              className="w-10 h-10 rounded-full border border-neutral-T90"
            />
          </TouchableOpacity>
        </View>
      </View>
    </BaseHeader>
  );
}
