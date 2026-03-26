// app/(tabs)/MyListings.tsx (Hoặc component PostList)
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// ─── MOCK DATA ───
const MY_POSTS = [
  {
    id: '1',
    type: 'P2P_FREE',
    title: 'Artisan Sourdough Loaves',
    image:
      'https://images.unsplash.com/photo-1587486913049-53fc88980cfc?w=800&q=80',
    expiryDate: 'Expires in 2 days',
    requests: 12,
    status: 'AVAILABLE',
  },
  {
    id: '2',
    type: 'B2C_MYSTERY_BAG',
    title: 'Fresh Produce Surprise Bag',
    image:
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80',
    expiryDate: 'Expires in 5h',
    requests: 5,
    status: 'AVAILABLE',
  },
  {
    id: '3',
    type: 'P2P_FREE',
    title: 'Mediterranean Salad Box',
    image:
      'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80',
    expiryDate: 'No Expiry Set',
    requests: 0,
    status: 'UNLISTED',
  },
];

const FILTERS = [
  { id: 'ALL', label: 'All' },
  { id: 'P2P_FREE', label: 'Free Food' },
  { id: 'B2C_MYSTERY_BAG', label: 'Surprise Bags' },
];

export default function PostList() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState('ALL');

  const filteredPosts = MY_POSTS.filter((post) =>
    activeFilter === 'ALL' ? true : post.type === activeFilter
  );

  return (
    <SafeAreaView className="flex-1 bg-neutral-DEFAULT" edges={['top']}>
      {/* ─── TopAppBar (Header phẳng, viền đáy dày) ─── */}
      <View className="bg-neutral-T100 flex-row justify-between items-center w-full px-4 h-16 border-b-2 border-neutral-T80 z-50">
        <View className="flex-row items-center gap-3">
          <MaterialIcons
            name="menu"
            size={28}
            color="#191C1C"
            onPress={() => router.back()}
          />
          <Text className="text-2xl font-sans font-extrabold tracking-tighter text-primary-T40 uppercase">
            My Listings
          </Text>
        </View>
        <TouchableOpacity className="active:scale-95 transition-transform p-2 rounded-lg">
          <MaterialIcons name="more-vert" size={28} color="#191C1C" />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* ─── Filter Bar ─── */}
        <View className="pt-6 pb-2 pl-4">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 12, paddingRight: 24 }}
          >
            {FILTERS.map((filter) => {
              const isActive = activeFilter === filter.id;
              return (
                <TouchableOpacity
                  key={filter.id}
                  onPress={() => setActiveFilter(filter.id)}
                  activeOpacity={0.8}
                  // FLAT DESIGN: Cấu trúc viền rõ nét, uppercase cứng cáp, thay đổi màu đảo ngược
                  className={`px-6 py-2.5 border-2 rounded-xl active:scale-95 transition-transform ${
                    isActive
                      ? 'bg-primary-T40 border-primary-T40'
                      : 'bg-neutral-T100 border-neutral-T80'
                  }`}
                >
                  <Text
                    className={`font-label text-xs font-bold uppercase tracking-wider ${
                      isActive ? 'text-neutral-T100' : 'text-neutral-T50'
                    }`}
                  >
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* ─── Listing Cards List ─── */}
        <View className="px-4 pt-4 flex-col gap-6">
          {filteredPosts.map((post) => {
            const isUnlisted = post.status === 'UNLISTED';

            return (
              <TouchableOpacity
                key={post.id}
                activeOpacity={0.9}
                onPress={() =>
                  router.push({
                    pathname: '/(post)/PostDetail',
                    params: { id: post.id },
                  })
                }
                // FLAT DESIGN: Zero shadow, border-2 thay thế
                className="bg-neutral-T100 rounded-2xl border-2 border-neutral-T80 overflow-hidden active:scale-95 transition-transform"
              >
                {/* Image Container (Tỉ lệ 16:9) */}
                <View className="relative w-full h-48 border-b-2 border-neutral-T80 bg-neutral-T90">
                  <Image
                    source={{ uri: post.image }}
                    className={`w-full h-full ${isUnlisted ? 'opacity-60' : ''}`}
                    resizeMode="cover"
                  />

                  {/* Badge Unlisted Nổi Bật Dạng Poster */}
                  {isUnlisted && (
                    <View className="absolute inset-0 bg-neutral-T10/40 flex items-center justify-center">
                      <View className="bg-neutral-T10 px-4 py-1.5 rounded-md border-2 border-neutral-T100">
                        <Text className="text-neutral-T100 font-label font-bold uppercase tracking-[0.2em] text-xs">
                          Unlisted
                        </Text>
                      </View>
                    </View>
                  )}
                </View>

                {/* Content Container */}
                <View className="p-4 flex-col gap-2">
                  <View className="flex-row justify-between items-start">
                    <Text
                      className={`text-lg font-sans font-extrabold tracking-tight flex-1 mr-3 ${
                        isUnlisted ? 'text-neutral-T50' : 'text-neutral-T10'
                      }`}
                      numberOfLines={1}
                    >
                      {post.title}
                    </Text>

                    {/* Status Badge Mini */}
                    <View
                      className={`border-2 px-3 py-0.5 rounded-md ${
                        isUnlisted
                          ? 'bg-neutral-T90 border-neutral-T80'
                          : 'bg-primary-T90 border-primary-T40'
                      }`}
                    >
                      <Text
                        className={`font-label text-[10px] font-extrabold uppercase tracking-widest ${
                          isUnlisted ? 'text-neutral-T50' : 'text-primary-T10'
                        }`}
                      >
                        {isUnlisted ? 'Draft' : 'Active'}
                      </Text>
                    </View>
                  </View>

                  <View
                    className={`flex-row items-center gap-4 ${isUnlisted ? 'opacity-60' : ''}`}
                  >
                    <View className="flex-row items-center gap-1.5">
                      <MaterialIcons name="group" size={16} color="#757777" />
                      <Text className="text-sm font-body text-neutral-T50">
                        {post.requests} Requests
                      </Text>
                    </View>
                    <View className="flex-row items-center gap-1.5">
                      <MaterialIcons name="event" size={16} color="#757777" />
                      <Text className="text-sm font-body text-neutral-T50">
                        {post.expiryDate}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
