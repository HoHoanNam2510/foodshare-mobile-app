import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import React from 'react';
import {
  Image,
  ImageBackground,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ─────────────────────────────────────────────
// MOCK DATA
// ─────────────────────────────────────────────
const FILTERS = [
  { id: 'all', label: 'All', active: true },
  { id: 'food', label: 'Food', active: false },
  { id: 'nonfood', label: 'Non-food', active: false },
  { id: 'veg', label: 'Vegetarian', active: false },
  { id: 'bakery', label: 'Bakery', active: false },
  { id: 'produce', label: 'Produce', active: false },
];

const GUIDE_CARDS = [
  {
    id: 'g1',
    icon: 'shield-check',
    label: 'How to share safely',
    iconLib: 'MaterialCommunityIcons',
  },
  {
    id: 'g2',
    icon: 'truck-fast',
    label: 'Fast pickups 101',
    iconLib: 'MaterialCommunityIcons',
  },
  {
    id: 'g3',
    icon: 'leaf',
    label: 'Reduce your waste',
    iconLib: 'MaterialCommunityIcons',
  },
  {
    id: 'g4',
    icon: 'account-group',
    label: 'Community rules',
    iconLib: 'MaterialCommunityIcons',
  },
];

const P2P_ITEMS = [
  {
    id: 'p1',
    name: 'Bánh mì dư',
    image:
      'https://images.unsplash.com/photo-1600628421055-4d30de868b8f?w=400&q=80',
    user: 'Liam',
    avatar: 'https://i.pravatar.cc/40?img=11',
    distance: '2km away',
    badge: 'FRESH',
    badgeType: 'fresh',
  },
  {
    id: 'p2',
    name: '6 Glazed Donuts',
    image:
      'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&q=80',
    user: 'Sara',
    avatar: 'https://i.pravatar.cc/40?img=5',
    distance: '0.5km away',
    badge: 'EXPIRING SOON',
    badgeType: 'expiring',
  },
  {
    id: 'p3',
    name: 'Garden Salad Mix',
    image:
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80',
    user: 'Noah',
    avatar: 'https://i.pravatar.cc/40?img=15',
    distance: '1.2km away',
    badge: null,
    badgeType: null,
  },
  {
    id: 'p4',
    name: 'Artisanal Sourdough',
    image:
      'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80',
    user: 'Maya',
    avatar: 'https://i.pravatar.cc/40?img=20',
    distance: '3km away',
    badge: null,
    badgeType: null,
  },
];

const MARKET_ITEMS = [
  {
    id: 'm1',
    name: 'Tiệm bánh ABC',
    subtitle: 'Fresh pastry assortment',
    image:
      'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&q=80',
    price: '$2.00',
    rating: 4.8,
  },
  {
    id: 'm2',
    name: 'Green Organics',
    subtitle: 'Seasonal vegetable box',
    image:
      'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=400&q=80',
    price: '$4.50',
    rating: 4.6,
  },
  {
    id: 'm3',
    name: 'La Boulangerie',
    subtitle: 'Mixed bread & rolls',
    image:
      'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=400&q=80',
    price: '$3.00',
    rating: 4.9,
  },
  {
    id: 'm4',
    name: 'Sunrise Deli',
    subtitle: 'Ready meals & sides',
    image:
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80',
    price: '$5.50',
    rating: 4.7,
  },
];

// ─────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────

/** ── Header ── */
const Header = () => {
  // Lấy chính xác khoảng cách an toàn của thiết bị (tai thỏ, dynamic island, status bar)
  const insets = useSafeAreaInsets();

  const content = (
    <View className="flex-row items-center justify-between px-6 pb-4">
      <TouchableOpacity className="w-9 h-9 items-center justify-center">
        <Feather name="menu" size={22} color="#191c1c" />
      </TouchableOpacity>

      <Text
        className="text-base font-sans tracking-tight text-primary-dark"
        style={{ fontWeight: '700', letterSpacing: -0.3 }}
      >
        The Editorial Harvest
      </Text>

      <View className="flex-row items-center gap-3">
        <TouchableOpacity className="w-9 h-9 items-center justify-center">
          <Feather name="bell" size={20} color="#191c1c" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Image
            source={{ uri: 'https://i.pravatar.cc/60?img=33' }}
            className="w-9 h-9 rounded-full"
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  // Fallback an toàn: Nếu expo-blur vẫn lỗi, bạn có thể comment đoạn if này lại
  // và chỉ dùng return bên dưới để app không bị crash.
  if (Platform.OS === 'ios') {
    return (
      <BlurView
        intensity={70}
        tint="light"
        className="absolute top-0 left-0 right-0 z-10"
        // Cộng thêm paddingTop bằng đúng khoảng insets.top của thiết bị
        style={{ paddingTop: insets.top > 0 ? insets.top + 10 : 44 }}
      >
        {content}
      </BlurView>
    );
  }

  return (
    <View
      className="bg-surface/95 absolute top-0 left-0 right-0 z-10"
      style={{ paddingTop: insets.top > 0 ? insets.top + 10 : 44 }}
    >
      {content}
    </View>
  );
};

/** ── Filter Pills ── */
const FilterPills = () => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 24, gap: 10 }}
      className="py-1"
    >
      {FILTERS.map((f) => (
        <TouchableOpacity
          key={f.id}
          className={`px-5 py-2 rounded-full ${
            f.active ? 'bg-primary-dark' : 'bg-surface-lowest'
          }`}
          style={
            f.active
              ? {}
              : {
                  shadowColor: '#191c1c',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.04,
                  shadowRadius: 8,
                  elevation: 1,
                }
          }
        >
          <Text
            className={`text-sm font-body ${
              f.active ? 'text-white' : 'text-gray-500'
            }`}
            style={{ fontWeight: f.active ? '600' : '400' }}
          >
            {f.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

/** ── Hero Banner ── */
const HeroBanner = () => {
  return (
    <View className="mx-6">
      <ImageBackground
        source={{
          uri: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&q=80',
        }}
        className="rounded-3xl overflow-hidden"
        style={{ minHeight: 180 }}
      >
        {/* Dark overlay */}
        <View
          className="absolute inset-0 rounded-3xl"
          style={{ backgroundColor: 'rgba(41, 108, 36, 0.82)' }}
        />
        <View className="p-6 justify-between" style={{ minHeight: 180 }}>
          <Text
            className="text-xs font-body uppercase tracking-widest text-white/70"
            style={{ letterSpacing: 2 }}
          >
            Community Movement
          </Text>
          <View className="mt-3">
            <Text
              className="text-3xl font-sans text-white leading-tight"
              style={{ fontWeight: '800', letterSpacing: -0.8, lineHeight: 36 }}
            >
              Zero Waste Week –{'\n'}Join the movement!
            </Text>
            <TouchableOpacity className="mt-5 self-start bg-white rounded-full px-5 py-2.5 flex-row items-center gap-2">
              <Text
                className="text-primary-dark text-sm font-body"
                style={{ fontWeight: '700' }}
              >
                Take Action →
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
};

/** ── Guide Section ── */
const GuideSection = () => {
  return (
    <View className="mt-10">
      <View className="px-6 mb-1">
        <Text
          className="text-xs font-body uppercase tracking-widest text-gray-400"
          style={{ letterSpacing: 2 }}
        >
          The Basics
        </Text>
        <Text
          className="text-2xl font-sans text-gray-900 mt-1"
          style={{ fontWeight: '800', letterSpacing: -0.5 }}
        >
          Get started
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 16,
          gap: 12,
        }}
      >
        {GUIDE_CARDS.map((card) => (
          <TouchableOpacity
            key={card.id}
            className="bg-primary/20 rounded-2xl p-4 justify-between"
            style={{ width: 140, height: 120 }}
          >
            <MaterialCommunityIcons
              name={card.icon as any}
              size={26}
              color="#296C24"
            />
            <Text
              className="text-sm font-body text-primary-dark mt-2 leading-snug"
              style={{ fontWeight: '600' }}
            >
              {card.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

/** ── P2P Card ── */
const P2PCard = ({ item }: { item: (typeof P2P_ITEMS)[0] }) => {
  return (
    <View
      className="bg-surface-lowest rounded-3xl overflow-hidden flex-1"
      style={{
        shadowColor: '#191c1c',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 24,
        elevation: 2,
      }}
    >
      {/* Image */}
      <View className="relative">
        <Image
          source={{ uri: item.image }}
          className="w-full rounded-3xl"
          style={{ height: 140 }}
          resizeMode="cover"
        />
        {item.badge && (
          <View
            className={`absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full ${
              item.badgeType === 'expiring'
                ? 'bg-secondary'
                : 'bg-surface-lowest'
            }`}
          >
            <Text
              className={`text-xs font-body ${
                item.badgeType === 'expiring'
                  ? 'text-white'
                  : 'text-primary-dark'
              }`}
              style={{ fontWeight: '700', letterSpacing: 0.5 }}
            >
              {item.badge}
            </Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View className="px-3 pt-2.5 pb-3">
        <Text
          className="text-sm font-sans text-gray-900 leading-snug"
          style={{ fontWeight: '700' }}
          numberOfLines={1}
        >
          {item.name}
        </Text>
        <View className="flex-row items-center gap-1.5 mt-1.5">
          <Image
            source={{ uri: item.avatar }}
            className="w-4 h-4 rounded-full"
          />
          <Text className="text-xs font-body text-gray-400" numberOfLines={1}>
            {item.user} · {item.distance}
          </Text>
        </View>
      </View>
    </View>
  );
};

/** ── Freshly Shared Section ── */
const FreshlyShared = () => {
  const rows = [];
  for (let i = 0; i < P2P_ITEMS.length; i += 2) {
    rows.push(P2P_ITEMS.slice(i, i + 2));
  }

  return (
    <View className="mt-10 px-6">
      <View className="flex-row items-center justify-between mb-5">
        <Text
          className="text-2xl font-sans text-gray-900"
          style={{ fontWeight: '800', letterSpacing: -0.5 }}
        >
          Freshly Shared
        </Text>
        <TouchableOpacity className="flex-row items-center gap-1">
          <Text
            className="text-sm font-body text-primary-dark"
            style={{ fontWeight: '600' }}
          >
            See all
          </Text>
          <Feather name="chevron-right" size={15} color="#296C24" />
        </TouchableOpacity>
      </View>

      <View className="gap-4">
        {rows.map((row, idx) => (
          <View key={idx} className="flex-row gap-4">
            {row.map((item) => (
              <P2PCard key={item.id} item={item} />
            ))}
            {/* Fill empty column if odd item */}
            {row.length === 1 && <View className="flex-1" />}
          </View>
        ))}
      </View>
    </View>
  );
};

/** ── Market Teaser ── */
const MarketTeaser = () => {
  return (
    <View className="mt-10">
      <View className="px-6 mb-1">
        <Text
          className="text-xs font-body uppercase tracking-widest text-gray-400"
          style={{ letterSpacing: 2 }}
        >
          From Shops
        </Text>
        <View className="flex-row items-end justify-between mt-1">
          <Text
            className="text-2xl font-sans text-gray-900"
            style={{ fontWeight: '800', letterSpacing: -0.5 }}
          >
            Surprise Bags{'\n'}around you
          </Text>
          <TouchableOpacity className="flex-row items-center gap-1 mb-1">
            <Text
              className="text-sm font-body text-primary-dark"
              style={{ fontWeight: '600' }}
            >
              See all
            </Text>
            <Feather name="chevron-right" size={15} color="#296C24" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 16,
          gap: 14,
        }}
      >
        {MARKET_ITEMS.map((item) => (
          <TouchableOpacity
            key={item.id}
            className="bg-surface-lowest rounded-3xl overflow-hidden"
            style={{
              width: 190,
              shadowColor: '#191c1c',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.05,
              shadowRadius: 24,
              elevation: 2,
            }}
          >
            <View className="relative">
              <Image
                source={{ uri: item.image }}
                style={{ width: 190, height: 150 }}
                resizeMode="cover"
                className="rounded-3xl"
              />
              {/* Price pill overlapping image */}
              <View className="absolute bottom-3 left-3 bg-primary-dark rounded-full px-3 py-1">
                <Text
                  className="text-white text-sm font-body"
                  style={{ fontWeight: '700' }}
                >
                  {item.price}
                </Text>
              </View>
              {/* Bag icon */}
              <View className="absolute top-3 right-3 bg-surface-lowest/90 w-7 h-7 rounded-full items-center justify-center">
                <Ionicons name="bag-outline" size={14} color="#296C24" />
              </View>
            </View>

            <View className="px-3.5 pt-2.5 pb-3.5">
              <Text
                className="text-sm font-sans text-gray-900"
                style={{ fontWeight: '700' }}
                numberOfLines={1}
              >
                {item.name}
              </Text>
              <View className="flex-row items-center justify-between mt-1">
                <Text
                  className="text-xs font-body text-gray-400"
                  numberOfLines={1}
                >
                  {item.subtitle}
                </Text>
                <View className="flex-row items-center gap-0.5">
                  <Ionicons name="star" size={11} color="#EC8632" />
                  <Text
                    className="text-xs font-body text-gray-500"
                    style={{ fontWeight: '600' }}
                  >
                    {item.rating}
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

/** ── Impact Banner ── */
const ImpactBanner = () => {
  return (
    <View className="mx-6 mt-10 mb-12">
      <View
        className="bg-primary-dark rounded-3xl items-center py-10 px-6 overflow-hidden"
        style={{ position: 'relative' }}
      >
        {/* Decorative circle blobs */}
        <View
          className="absolute -top-10 -right-10 bg-primary/40 rounded-full"
          style={{ width: 160, height: 160 }}
        />
        <View
          className="absolute -bottom-8 -left-8 bg-primary/30 rounded-full"
          style={{ width: 130, height: 130 }}
        />

        <View className="bg-primary rounded-full w-12 h-12 items-center justify-center mb-5">
          <Ionicons name="flash" size={22} color="#ffffff" />
        </View>

        <Text
          className="text-5xl font-sans text-white text-center"
          style={{ fontWeight: '900', letterSpacing: -1.5 }}
        >
          2,412 lbs
        </Text>
        <Text className="text-base font-body text-white/70 text-center mt-2">
          Food saved in North Chicago this week
        </Text>

        <TouchableOpacity className="mt-6 border border-white/30 rounded-full px-6 py-2.5">
          <Text
            className="text-white text-sm font-body"
            style={{ fontWeight: '600' }}
          >
            See your impact stats
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ─────────────────────────────────────────────
// MAIN SCREEN
// ─────────────────────────────────────────────
export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    // Bỏ SafeAreaView, dùng View thường chiếm toàn bộ màn hình
    <View className="flex-1 bg-surface">
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />

      <Header />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 40,
          // Tính toán khoảng cách đẩy ScrollView xuống để không bị Header đè lên
          paddingTop: insets.top + 70,
        }}
        className="flex-1"
      >
        <FilterPills />
        <View className="mt-5">
          <HeroBanner />
        </View>
        <GuideSection />
        <FreshlyShared />
        <MarketTeaser />
        <ImpactBanner />
      </ScrollView>
    </View>
  );
}
