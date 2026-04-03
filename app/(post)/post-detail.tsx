// app/(post)/post-detail.tsx
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

// ─── MOCK DATA ───
const MOCK_ITEM = {
  id: 'm1',
  type: 'B2C',
  title: 'Fresh Avocado & Sourdough',
  image:
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80',
  category: 'Serving Food',
  quantity: '3/5 Items',
  expiryDate: 'Mar 31, 2025',
  expiryTime: '02:45',
  pickupDate: 'Mar 31, 2025',
  pickupTime: '02:05',
  description:
    'I have some ripe avocados and a half loaf of fresh sourdough bread from this morning. This sharing is perfect for today, I am gluten-free and don\'t need it. Please bring your own bag if possible.',
  locationName: '123 Culinary Ave',
  locationArea: 'San Francisco',
  mapImage:
    'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&q=80',
  storeName: 'Sarah Jenkins',
  storeAvatar: 'https://i.pravatar.cc/150?img=47',
};

export default function PostDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isB2C = MOCK_ITEM.type === 'B2C';

  return (
    <SafeAreaView className="flex-1 bg-neutral" edges={['top']}>
      {/* ─── Top Navigation Bar ─── */}
      <View className="flex-row items-center justify-between w-full h-14 px-4 bg-neutral">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center rounded-xl"
          style={styles.navBtn}
        >
          <MaterialIcons name="arrow-back" size={22} color="#191C1C" />
        </TouchableOpacity>

        <Text className="font-sans font-extrabold text-base tracking-tight text-neutral-T10 uppercase">
          FoodShare
        </Text>

        <TouchableOpacity
          className="w-10 h-10 items-center justify-center rounded-xl"
          style={styles.navBtn}
        >
          <MaterialIcons name="share" size={22} color="#191C1C" />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* ─── Hero Image ─── */}
        <View className="relative">
          <View className="w-full aspect-[4/3] bg-neutral-T90 overflow-hidden">
            <Image
              source={{ uri: MOCK_ITEM.image }}
              className="w-full h-full"
              resizeMode="cover"
            />
          </View>

          {/* Type + Status Badges — overlapping bottom of image */}
          <View className="absolute -bottom-4 left-5 flex-row items-center gap-2 z-10">
            <View
              className="bg-primary-T40 px-3 py-1.5 rounded-lg"
              style={styles.badge}
            >
              <Text className="text-neutral-T100 font-label font-bold text-xs tracking-wider uppercase">
                {isB2C ? 'Free' : 'Free'}
              </Text>
            </View>
            <View
              className="bg-primary-T95 px-3 py-1.5 rounded-lg"
              style={styles.badge}
            >
              <Text className="text-primary-T30 font-label font-bold text-xs tracking-wider uppercase">
                Available
              </Text>
            </View>
          </View>
        </View>

        {/* ─── Content Card ─── */}
        <View
          className="mx-4 mt-8 bg-neutral-T100 rounded-2xl overflow-hidden"
          style={styles.card}
        >
          {/* Title + Meta */}
          <View className="px-5 pt-6 pb-4">
            <Text className="font-sans font-extrabold text-3xl leading-[34px] tracking-tight text-neutral-T10">
              {MOCK_ITEM.title}
            </Text>
            <View className="flex-row items-center gap-2 mt-2">
              <Text className="font-label text-xs text-neutral-T50 font-semibold uppercase tracking-wider">
                {MOCK_ITEM.category}
              </Text>
              <View className="w-1 h-1 rounded-full bg-neutral-T70" />
              <Text className="font-label text-xs text-neutral-T50 font-semibold uppercase tracking-wider">
                {MOCK_ITEM.quantity}
              </Text>
            </View>
          </View>

          {/* Divider */}
          <View className="mx-5 h-px bg-neutral-T90" />

          {/* User Row */}
          <View className="px-5 py-4 flex-row items-center justify-between">
            <View className="flex-row items-center gap-3 flex-1">
              <Image
                source={{ uri: MOCK_ITEM.storeAvatar }}
                className="w-11 h-11 rounded-full"
                style={styles.avatar}
              />
              <View>
                <Text className="font-label text-[10px] text-neutral-T50 uppercase tracking-wider">
                  Posted by
                </Text>
                <Text className="font-sans font-extrabold text-base text-neutral-T10">
                  {MOCK_ITEM.storeName}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              className="w-10 h-10 items-center justify-center rounded-xl bg-neutral-T95"
            >
              <MaterialIcons name="bookmark-border" size={22} color="#296C24" />
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View className="mx-5 h-px bg-neutral-T90" />

          {/* Description */}
          <View className="px-5 py-5">
            <Text className="font-body text-neutral-T30 leading-6 text-[14px]">
              {MOCK_ITEM.description}
            </Text>
          </View>
        </View>

        {/* ─── Info Cards ─── */}
        <View className="mx-4 mt-3 gap-3">
          {/* Pickup Window */}
          <View
            className="bg-neutral-T100 rounded-2xl px-5 py-4 flex-row items-center gap-4"
            style={styles.card}
          >
            <View className="w-10 h-10 rounded-xl bg-primary-T95 items-center justify-center">
              <MaterialIcons name="schedule" size={20} color="#296C24" />
            </View>
            <View className="flex-1">
              <Text className="font-label text-[10px] text-neutral-T50 uppercase tracking-wider">
                Pickup Window
              </Text>
              <Text className="font-sans font-extrabold text-base text-neutral-T10 mt-0.5">
                {MOCK_ITEM.pickupDate} · {MOCK_ITEM.pickupTime}
              </Text>
            </View>
          </View>

          {/* Expires */}
          <View
            className="bg-neutral-T100 rounded-2xl px-5 py-4 flex-row items-center gap-4"
            style={styles.card}
          >
            <View className="w-10 h-10 rounded-xl bg-secondary-T95 items-center justify-center">
              <MaterialIcons name="timer" size={20} color="#944A00" />
            </View>
            <View className="flex-1">
              <Text className="font-label text-[10px] text-neutral-T50 uppercase tracking-wider">
                Expires
              </Text>
              <Text className="font-sans font-extrabold text-base text-neutral-T10 mt-0.5">
                {MOCK_ITEM.expiryDate} · {MOCK_ITEM.expiryTime}
              </Text>
            </View>
          </View>

          {/* Location */}
          <View
            className="bg-neutral-T100 rounded-2xl overflow-hidden"
            style={styles.card}
          >
            {/* Map thumbnail */}
            <View className="w-full h-28">
              <Image
                source={{ uri: MOCK_ITEM.mapImage }}
                className="w-full h-full"
                resizeMode="cover"
                style={{ opacity: 0.7 }}
              />
            </View>
            <View className="px-5 py-4 flex-row items-center gap-3">
              <View className="w-10 h-10 rounded-xl bg-neutral-T95 items-center justify-center">
                <MaterialIcons name="location-on" size={20} color="#191C1C" />
              </View>
              <View className="flex-1">
                <Text className="font-sans font-extrabold text-base text-neutral-T10">
                  {MOCK_ITEM.locationName}
                </Text>
                <Text className="font-body text-xs text-neutral-T50 mt-0.5">
                  {MOCK_ITEM.locationArea}
                </Text>
              </View>
              <TouchableOpacity className="bg-neutral-T95 px-3 py-2 rounded-lg">
                <Text className="font-label text-xs font-bold text-neutral-T10 uppercase tracking-wider">
                  Map
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* ─── Fixed Bottom Action Bar ─── */}
      <View
        className="absolute bottom-0 left-0 w-full bg-neutral"
        style={[
          styles.bottomBar,
          {
            paddingBottom: Math.max(insets.bottom, 16),
            paddingTop: 12,
            paddingHorizontal: 16,
          },
        ]}
      >
        <TouchableOpacity
          className="w-full bg-primary-T40 rounded-2xl items-center justify-center py-4"
          activeOpacity={0.85}
        >
          <Text className="text-neutral-T100 font-sans font-black text-lg tracking-tight uppercase">
            Reserve Food
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  navBtn: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  badge: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 3,
  },
  avatar: {
    borderWidth: 2,
    borderColor: '#E1E3E2',
  },
  bottomBar: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
  },
});
