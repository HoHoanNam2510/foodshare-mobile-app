// app/(post)/PostDetail.tsx
import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// MOCK DATA ( Context B2C cho test Price)
const MOCK_ITEM = {
  id: 'm1',
  type: 'B2C', // Chuyển type sang B2C để test hiển thị Giá
  title: 'Fresh Bakery Surprise Bag',
  images: [
    'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&q=80',
    'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=800&q=80',
  ],
  category: 'Bakery',
  price: '$5.00', // Sẵn giá
  description:
    'Includes an assortment of 4-6 pastries: muffins, croissants, and artisan bread baked fresh today.',
  pickupTime: 'Today, 6:00 PM - 7:00 PM',
  location: '219 Bakers St, Chicago',
  storeName: 'Tiệm bánh ABC',
  storeAvatar: 'https://i.pravatar.cc/150?img=12',
  storeRating: 4.8,
};

// Sub-components Flat Style
const InfoItem = ({ icon, children }: { icon: any; children: string }) => (
  <View className="flex-row items-center gap-3 mb-4">
    <View className="w-10 h-10 rounded-xl bg-neutral-T95 border-2 border-neutral-T90 items-center justify-center">
      <Feather name={icon} size={18} color="#296C24" />
    </View>
    <Text className="flex-1 font-body text-base text-neutral-T10">
      {children}
    </Text>
  </View>
);

export default function PostDetailScreen() {
  const router = useRouter();
  const isB2C = MOCK_ITEM.type === 'B2C';

  return (
    <View className="flex-1 bg-neutral-DEFAULT">
      {/* ── Sticky Header (Flat style) ── */}
      <SafeAreaView
        edges={['top']}
        className="bg-neutral-T100 z-10 border-b-2 border-neutral-T90"
      >
        <View className="flex-row items-center justify-between px-6 py-3">
          <TouchableOpacity
            onPress={() => router.back()}
            className="p-1 active:scale-90 transition-transform"
          >
            <Feather name="arrow-left" size={24} color="#191C1C" />
          </TouchableOpacity>
          <Text
            className="text-sm font-sans text-neutral-T10"
            style={{ fontWeight: '800' }}
          >
            ABC Bakery
          </Text>
          <TouchableOpacity className="p-1 active:scale-90 transition-transform">
            <Feather
              name="bookmark"
              size={24}
              color={isB2C ? '#EC8632' : '#296C24'}
            />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* ── Image Gallery (Flat Rule: border-b-2) ── */}
        <View className="relative border-b-2 border-neutral-T90">
          <Image
            source={{ uri: MOCK_ITEM.images[0] }}
            className="w-full"
            style={{ height: 350 }}
            resizeMode="cover"
          />

          {/* Flat Category Badge */}
          <View className="absolute top-4 right-4 bg-neutral-T100 border-2 border-neutral-T90 rounded-md px-2.5 py-1 z-10">
            <Text className="text-xs font-label uppercase tracking-wider text-neutral-T50 font-bold">
              {MOCK_ITEM.category}
            </Text>
          </View>

          {/* FLAT PRICE BADGE (Geometric, Bordered) */}
          {isB2C && (
            <View className="absolute bottom-4 left-4 bg-secondary-T40 border-4 border-secondary-T30 px-3 py-1.5 rounded-xl shadow-none">
              <Text
                className="text-2xl font-sans text-neutral-T100 tracking-tight"
                style={{ fontWeight: '800' }}
              >
                {MOCK_ITEM.price}
              </Text>
            </View>
          )}
        </View>

        {/* ── Post Content ── */}
        <View className="px-6 pt-6 pb-24 bg-neutral-DEFAULT">
          <Text
            className="text-3xl font-sans text-neutral-T10 leading-tight mb-4"
            style={{ fontWeight: '800', letterSpacing: -0.8 }}
          >
            {MOCK_ITEM.title}
          </Text>

          {/* Section: Logistics (Card bọc phẳng) */}
          <View className="bg-neutral-T100 rounded-2xl p-6 border-2 border-neutral-T90 mb-6 shadow-none">
            <InfoItem icon="clock">{MOCK_ITEM.pickupTime}</InfoItem>
            <InfoItem icon="map-pin">{MOCK_ITEM.location}</InfoItem>
          </View>

          {/* Section: Description */}
          <View className="mb-8 px-1">
            <Text className="text-xs font-label uppercase tracking-widest text-neutral-T50 mb-3">
              Item Description
            </Text>
            <Text className="font-body text-base text-neutral-T10 leading-6">
              {MOCK_ITEM.description}
            </Text>
          </View>

          {/* Section: Giver/Store Info (Card bọc phẳng) */}
          <TouchableOpacity className="flex-row items-center gap-4 p-5 bg-neutral-T100 rounded-2xl border-2 border-neutral-T90 active:bg-neutral-T95 transition-colors">
            <Image
              source={{ uri: MOCK_ITEM.storeAvatar }}
              className="w-16 h-16 rounded-xl border-2 border-neutral-T90"
            />
            <View className="flex-1 gap-1">
              <Text
                className="text-base font-body text-neutral-T10"
                style={{ fontWeight: '700' }}
              >
                {MOCK_ITEM.storeName}
              </Text>
              <View className="flex-row items-center gap-1.5">
                <Ionicons name="star" size={14} color="#EC8632" />
                <Text
                  className="text-sm font-body text-neutral-T40"
                  style={{ fontWeight: '600' }}
                >
                  {MOCK_ITEM.storeRating} Store Rating
                </Text>
              </View>
            </View>
            <Feather
              name="chevron-right"
              size={18}
              color={isB2C ? '#EC8632' : '#296C24'}
            />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ── Sticky Contact Bar (Flat rule: bg-lowest, zero depth, border-t-2) ── */}
      <SafeAreaView
        edges={['bottom']}
        className="absolute bottom-0 left-0 right-0 bg-neutral-T100 border-t-2 border-neutral-T90"
      >
        <View className="flex-row items-center gap-3 px-6 py-3">
          <TouchableOpacity className="w-12 h-12 rounded-xl bg-neutral-T95 border-2 border-neutral-T90 items-center justify-center active:scale-90 transition-transform">
            <Feather
              name="message-square"
              size={20}
              color={isB2C ? '#EC8632' : '#296C24'}
            />
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 h-12 rounded-xl items-center justify-center active:scale-[0.98] transition-all ${isB2C ? 'bg-secondary-T40' : 'bg-primary-T40'}`}
          >
            <Text
              className="text-base font-label uppercase tracking-wider text-neutral-T100"
              style={{ fontWeight: '800' }}
            >
              {isB2C ? 'Request Bag' : 'Claim Free Food'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}
