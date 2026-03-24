// app/(tabs)/Explore.tsx (hoặc app/explore.tsx tùy thư mục hiện tại của bạn)
import { Link } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Explore() {
  return (
    <SafeAreaView className="flex-1 bg-surface items-center justify-center px-6">
      <Text className="font-sans text-3xl font-bold text-text mb-8">
        Explore
      </Text>

      <View className="w-full gap-4">
        {/* Nút test Form Tạo Bài Đăng */}
        <Link href={'/CreatePostP2P'} asChild>
          <TouchableOpacity
            activeOpacity={0.8}
            className="w-full bg-primary-light py-4 rounded-2xl items-center"
          >
            <Text className="font-body text-primary-dark font-bold text-base">
              Test: Đi tới Form Create P2P
            </Text>
          </TouchableOpacity>
        </Link>

        {/* Nút shortcut bay thẳng đến Danh Sách Bài Đăng */}
        <Link href={'/MyListings'} asChild>
          <TouchableOpacity
            activeOpacity={0.8}
            className="w-full bg-primary-dark py-4 rounded-2xl items-center"
            style={{
              shadowColor: '#296c24',
              shadowOpacity: 0.3,
              shadowRadius: 16,
              shadowOffset: { width: 0, height: 6 },
              elevation: 8,
            }}
          >
            <Text className="font-body text-white font-bold text-base tracking-wide">
              Test: Xem Danh Sách Bài Đăng
            </Text>
          </TouchableOpacity>
        </Link>

        {/* MỚI: Nút shortcut test UI Đăng nhập/Đăng ký */}
        <Link href={'/(auth)/login'} asChild>
          <TouchableOpacity
            activeOpacity={0.8}
            className="w-full bg-secondary py-4 rounded-2xl items-center"
            style={{
              shadowColor: '#EC8632',
              shadowOpacity: 0.3,
              shadowRadius: 16,
              shadowOffset: { width: 0, height: 6 },
              elevation: 8,
            }}
          >
            <Text className="font-body text-white font-bold text-base tracking-wide">
              Test: Xem UI Login / Register
            </Text>
          </TouchableOpacity>
        </Link>
      </View>
    </SafeAreaView>
  );
}
