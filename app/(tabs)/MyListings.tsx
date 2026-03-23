// app/(tabs)/MyListings.tsx (hoặc đường dẫn tương ứng của bạn)
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// ─── MOCK DATA (Dựa trên Post.ts) ───
const MY_POSTS = [
  {
    id: '1',
    type: 'P2P_FREE',
    title: 'Organic Eggs',
    image:
      'https://images.unsplash.com/photo-1587486913049-53fc88980cfc?w=400&q=80',
    expiryDate: '28th Mar 2026, 18:00',
    requests: 2,
    status: 'AVAILABLE',
  },
  {
    id: '2',
    type: 'B2C_MYSTERY_BAG',
    title: 'Bakery Surplus Bag',
    image:
      'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80',
    expiryDate: 'Today, 21:00',
    requests: 5,
    status: 'AVAILABLE',
  },
  {
    id: '3',
    type: 'P2P_FREE',
    title: 'Garden Salad Mix',
    image:
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80',
    expiryDate: 'Expired',
    requests: 0,
    status: 'UNLISTED',
  },
];

const FILTERS = [
  { id: 'ALL', label: 'All' },
  { id: 'P2P_FREE', label: 'Free Food' },
  { id: 'B2C_MYSTERY_BAG', label: 'Surprise Bags' },
];

export default function MyListings() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState('ALL');

  const filteredPosts = MY_POSTS.filter((post) =>
    activeFilter === 'ALL' ? true : post.type === activeFilter
  );

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top']}>
      {/* ── Header ── */}
      <View className="flex-row items-center justify-between px-6 py-4">
        <View className="w-8" />
        <Text className="font-sans text-xl font-bold text-text">
          My Listings
        </Text>
        <TouchableOpacity>
          <Feather name="menu" size={24} color="#191c1c" />
        </TouchableOpacity>
      </View>

      {/* ── Filter Pills ── */}
      <View className="px-6 py-2 mb-4">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="flex-row gap-3"
        >
          {FILTERS.map((filter) => {
            const isActive = activeFilter === filter.id;
            return (
              <TouchableOpacity
                key={filter.id}
                onPress={() => setActiveFilter(filter.id)}
                activeOpacity={0.7}
                className={`px-5 py-2.5 rounded-full mr-3 ${isActive ? 'bg-primary-dark' : 'bg-surface-lowest'}`}
                style={
                  !isActive
                    ? {
                        shadowColor: '#191c1c',
                        shadowOpacity: 0.04,
                        shadowRadius: 8,
                        shadowOffset: { width: 0, height: 2 },
                        elevation: 2,
                      }
                    : {}
                }
              >
                <Text
                  className={`font-body text-sm ${isActive ? 'text-white font-bold' : 'text-text-muted font-medium'}`}
                >
                  {filter.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ── Listings List ── */}
      <ScrollView
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {filteredPosts.map((post) => (
          <TouchableOpacity
            key={post.id}
            activeOpacity={0.8}
            // DÙNG CÚ PHÁP OBJECT ĐỂ TRUYỀN ROUTE VÀ PARAMS CHUẨN NHẤT
            onPress={() =>
              router.push({
                pathname: '/PostDetail', // Bỏ chữ (post) đi
                params: { id: post.id },
              })
            }
            className="flex-row bg-surface-lowest rounded-3xl mb-4 overflow-hidden"
            style={{
              shadowColor: '#191c1c',
              shadowOpacity: 0.05,
              shadowRadius: 16,
              shadowOffset: { width: 0, height: 4 },
              elevation: 3,
            }}
          >
            {/* Ảnh bên trái */}
            <View className="w-32 h-32 relative">
              <Image
                source={{ uri: post.image }}
                className="w-full h-full"
                resizeMode="cover"
              />
              {post.status === 'UNLISTED' && (
                <View className="absolute inset-0 bg-black/40 items-center justify-center">
                  <View className="bg-text/80 px-3 py-1 rounded-full">
                    <Text className="text-white font-body text-xs font-bold">
                      Unlisted
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* Thông tin bên phải */}
            <View className="flex-1 p-4 justify-center">
              <Text
                className="font-sans text-lg font-bold text-text mb-1"
                numberOfLines={1}
              >
                {post.title}
              </Text>
              <View className="flex-row items-center gap-2 mb-2">
                <Feather name="users" size={14} color="#6b7a6a" />
                <Text className="font-body text-xs text-text-muted">
                  {post.requests} requests
                </Text>
              </View>
              <Text className="font-body text-xs text-text-muted">
                Expires at: {post.expiryDate}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
