// app/(post)/PostDetail.tsx
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

// ─── MOCK DATA ───
const MOCK_ITEM = {
  id: 'm1',
  type: 'B2C',
  title: 'Artisan Sourdough Loaves',
  image:
    'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=800&q=80',
  category: 'Bakery',
  price: '$5.00',
  quantity: '5 Portions',
  expiryDate: 'Oct 27, 2023',
  pickupTime: '17:00 — 20:00',
  description:
    'This mystery bag contains a selection of our daily baked sourdough loaves. Expect a mix of classic white, seeded, or rye. All breads are baked fresh this morning with 100% natural starter and organic flours. Perfect for freezing or immediate consumption!',
  locationName: '245 Editorial Ave',
  locationArea: 'Food District, Central',
  mapImage:
    'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&q=80', // Map mockup
  storeName: 'Rise & Shine Bakery',
  storeAvatar: 'https://i.pravatar.cc/150?img=11',
};

export default function PostDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isB2C = MOCK_ITEM.type === 'B2C';

  return (
    <SafeAreaView className="flex-1 bg-neutral-DEFAULT" edges={['top']}>
      {/* ─── Top Navigation Bar ─── */}
      <View className="flex-row items-center justify-between w-full h-16 px-4 bg-neutral-DEFAULT border-b-2 border-neutral-T80 z-50">
        <TouchableOpacity
          onPress={() => router.back()}
          className="active:scale-95 transition-transform p-2 rounded-lg"
        >
          <MaterialIcons name="arrow-back" size={28} color="#191C1C" />
        </TouchableOpacity>
        <Text className="font-headline font-extrabold tracking-tighter uppercase text-xl text-primary-T40">
          SAVOR SHARE
        </Text>
        <TouchableOpacity className="active:scale-95 transition-transform p-2 rounded-lg">
          <MaterialIcons name="more-vert" size={28} color="#191C1C" />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* ─── Hero Section with Overlapping Badges ─── */}
        <View className="relative z-10 mb-8">
          <View className="w-full aspect-[4/3] border-b-2 border-neutral-T80 bg-neutral-T90 overflow-hidden">
            <Image
              source={{ uri: MOCK_ITEM.image }}
              className="w-full h-full"
              resizeMode="cover"
            />
          </View>

          {/* Floating Badges (Nằm đè lên mép dưới của ảnh) */}
          <View className="absolute -bottom-5 left-6 flex-row items-end gap-3 z-20">
            {/* Category Badge */}
            <View className="bg-secondary-T50 border-2 border-neutral-T80 px-4 py-2.5 rounded-xl">
              <Text className="text-neutral-T100 font-label font-extrabold text-[11px] tracking-widest uppercase">
                {MOCK_ITEM.category}
              </Text>
            </View>

            {/* Price Badge (To & Nổi bật hơn) */}
            {isB2C && (
              <View className="bg-tertiary-T50 border-2 border-neutral-T80 px-5 py-3 rounded-xl translate-y-2">
                <Text className="text-neutral-T100 font-label font-black text-2xl tracking-tighter">
                  {MOCK_ITEM.price}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* ─── Main Content Wrapper ─── */}
        <View className="px-6 flex-col gap-8">
          {/* Title & Type */}
          <View className="flex-col gap-3 items-start">
            <Text className="font-headline font-black text-4xl leading-[38px] tracking-tighter text-neutral-T10 uppercase">
              {MOCK_ITEM.title}
            </Text>
            <View className="bg-primary-T95 border-2 border-neutral-T80 px-3 py-1 rounded-full">
              <Text className="text-primary-T10 font-label font-bold text-[10px] tracking-widest uppercase">
                {isB2C ? 'SURPRISE BAG' : 'FREE FOOD'}
              </Text>
            </View>
          </View>

          {/* ─── Bento Info Grid ─── */}
          <View className="flex-row flex-wrap justify-between gap-y-4">
            {/* Quantity Box */}
            <View className="w-[48%] bg-neutral-T100 border-2 border-neutral-T80 p-4 rounded-2xl flex-col justify-between active:scale-95 transition-transform">
              <MaterialIcons
                name="inventory"
                size={24}
                color="#296C24"
                className="mb-3"
              />
              <View>
                <Text className="font-label text-[10px] text-neutral-T50 uppercase tracking-wider">
                  Quantity
                </Text>
                <Text className="font-headline font-extrabold text-lg text-neutral-T10">
                  {MOCK_ITEM.quantity}
                </Text>
              </View>
            </View>

            {/* Expiry Box */}
            <View className="w-[48%] bg-neutral-T100 border-2 border-neutral-T80 p-4 rounded-2xl flex-col justify-between active:scale-95 transition-transform">
              <MaterialIcons
                name="timer"
                size={24}
                color="#296C24"
                className="mb-3"
              />
              <View>
                <Text className="font-label text-[10px] text-neutral-T50 uppercase tracking-wider">
                  Expiry
                </Text>
                <Text className="font-headline font-extrabold text-lg text-neutral-T10">
                  {MOCK_ITEM.expiryDate}
                </Text>
              </View>
            </View>

            {/* Pickup Window Box (Full Width) */}
            <View className="w-full bg-neutral-T100 border-2 border-neutral-T80 p-4 rounded-2xl flex-row items-center gap-4 active:scale-95 transition-transform">
              <View className="bg-primary-T95 p-3 rounded-xl border-2 border-neutral-T80">
                <MaterialIcons name="schedule" size={24} color="#296C24" />
              </View>
              <View className="flex-1">
                <Text className="font-label text-[10px] text-neutral-T50 uppercase tracking-wider">
                  Pickup Window
                </Text>
                <Text className="font-headline font-extrabold text-xl text-neutral-T10">
                  {MOCK_ITEM.pickupTime}
                </Text>
              </View>
            </View>
          </View>

          {/* ─── Description ─── */}
          <View className="flex-col gap-4">
            <Text className="font-headline font-extrabold text-xl uppercase border-b-2 border-neutral-T80 pb-2 text-neutral-T10">
              Description
            </Text>
            <Text className="font-body text-neutral-T10 leading-6 text-[15px]">
              {MOCK_ITEM.description}
            </Text>
          </View>

          {/* ─── Location Card ─── */}
          <View className="bg-neutral-T95 border-2 border-neutral-T80 rounded-2xl overflow-hidden">
            <View className="h-32 w-full border-b-2 border-neutral-T80">
              {/* Giả lập Map bằng hình ảnh trắng đen (grayscale) cho nghệ thuật */}
              <Image
                source={{ uri: MOCK_ITEM.mapImage }}
                className="w-full h-full grayscale opacity-60"
                resizeMode="cover"
              />
            </View>
            <View className="p-4 flex-row items-start gap-3 bg-neutral-T100">
              <MaterialIcons
                name="location-on"
                size={24}
                color="#191C1C"
                className="mt-0.5"
              />
              <View className="flex-1">
                <Text className="font-headline font-extrabold text-base text-neutral-T10">
                  {MOCK_ITEM.locationName}
                </Text>
                <Text className="font-body text-xs text-neutral-T50 uppercase mt-1">
                  {MOCK_ITEM.locationArea}
                </Text>
              </View>
            </View>
          </View>

          {/* ─── User/Store Info ─── */}
          <View className="flex-row items-center justify-between bg-neutral-T100 border-2 border-neutral-T80 p-4 rounded-2xl mb-6">
            <View className="flex-row items-center gap-4 flex-1">
              <Image
                source={{ uri: MOCK_ITEM.storeAvatar }}
                className="w-14 h-14 rounded-full border-2 border-neutral-T80"
              />
              <View className="flex-1 mr-2">
                <Text className="font-label text-[10px] text-neutral-T50 uppercase tracking-wider">
                  Store
                </Text>
                <Text
                  className="font-headline font-extrabold text-lg text-neutral-T10"
                  numberOfLines={1}
                >
                  {MOCK_ITEM.storeName}
                </Text>
              </View>
            </View>
            <TouchableOpacity className="bg-neutral-T10 px-4 py-2.5 rounded-xl active:scale-95 transition-transform">
              <Text className="text-neutral-T100 font-label font-bold text-xs uppercase tracking-wider">
                FOLLOW
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* ─── Fixed Bottom Action Bar ─── */}
      <View
        className="absolute bottom-0 left-0 w-full bg-neutral-DEFAULT border-t-2 border-neutral-T80 z-50"
        style={{
          paddingBottom: Math.max(insets.bottom, 16),
          paddingTop: 16,
          paddingHorizontal: 24,
        }}
      >
        <View className="flex-row items-center gap-4">
          <TouchableOpacity className="w-16 h-16 border-2 border-neutral-T80 rounded-xl flex items-center justify-center bg-neutral-T100 active:scale-95 transition-transform">
            <MaterialIcons
              name="chat-bubble-outline"
              size={28}
              color="#191C1C"
            />
          </TouchableOpacity>

          <TouchableOpacity className="flex-1 h-16 bg-primary-T40 border-2 border-neutral-T80 rounded-xl flex items-center justify-center active:scale-95 transition-transform">
            <Text className="text-neutral-T100 font-headline font-black text-xl tracking-tight uppercase">
              {isB2C ? 'REQUEST BAG' : 'CLAIM FOOD'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
