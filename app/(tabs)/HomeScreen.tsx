import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import {
  Image,
  ImageBackground,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ─────────────────────────────────────────────
// MOCK DATA (Giữ nguyên)
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
  const insets = useSafeAreaInsets();

  return (
    <View
      className="bg-neutral absolute top-0 left-0 right-0 z-10 border-b-2 border-neutral-T90"
      style={{ paddingTop: insets.top > 0 ? insets.top + 10 : 44 }}
    >
      <View className="flex-row items-center justify-between px-6 pb-4">
        <TouchableOpacity className="w-9 h-9 items-center justify-center active:scale-95 transition-transform">
          <Feather name="menu" size={22} color="#191C1C" />
        </TouchableOpacity>

        <View className="flex-row items-center gap-2">
          <Image
            source={require('../../assets/images/logo.png')}
            style={{ width: 28, height: 28 }}
            resizeMode="contain"
          />
          <Text
            className="text-lg font-sans tracking-tight text-primary-T40"
            style={{ fontWeight: '800', letterSpacing: -0.3 }}
          >
            FoodShare
          </Text>
        </View>

        <View className="flex-row items-center gap-3">
          <TouchableOpacity className="w-9 h-9 items-center justify-center active:scale-95 transition-transform">
            <Feather name="bell" size={20} color="#191C1C" />
          </TouchableOpacity>
          <TouchableOpacity className="active:scale-95 transition-transform">
            <Image
              source={{ uri: 'https://i.pravatar.cc/60?img=33' }}
              // FLAT DESIGN: Bo góc hình học (rounded-xl) thay vì hình tròn (rounded-full)
              className="w-9 h-9 rounded-xl border-2 border-neutral-T90"
            />
          </TouchableOpacity>
        </View>
      </View>
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
          // FLAT DESIGN: Dùng viền thay vì bóng. Nút góc vuông nhẹ (rounded-xl)
          className={`px-5 py-2.5 rounded-xl border-2 ${
            f.active
              ? 'bg-primary-T40 border-primary-T40'
              : 'bg-neutral-T100 border-neutral-T90'
          }`}
          activeOpacity={0.8}
        >
          <Text
            className={`text-xs font-label uppercase tracking-wider ${
              f.active ? 'text-neutral-T100' : 'text-neutral-T50'
            }`}
            style={{ fontWeight: '700' }}
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
        className="rounded-2xl overflow-hidden border-2 border-primary-T40" // Flat rule: Giảm bo góc, thêm viền bao
        style={{ minHeight: 180 }}
      >
        <View
          className="absolute inset-0"
          style={{ backgroundColor: 'rgba(41, 108, 36, 0.85)' }}
        />
        <View className="p-6 justify-between" style={{ minHeight: 180 }}>
          <Text
            className="text-xs font-body uppercase tracking-widest text-neutral-T100/80"
            style={{ letterSpacing: 2 }}
          >
            Community Movement
          </Text>
          <View className="mt-3">
            <Text
              className="text-3xl font-sans text-neutral-T100 leading-tight"
              style={{ fontWeight: '800', letterSpacing: -0.8, lineHeight: 36 }}
            >
              Zero Waste Week –{'\n'}Join the movement!
            </Text>
            {/* FLAT DESIGN: Nút bấm vuông, không bóng, in hoa */}
            <TouchableOpacity className="mt-5 self-start bg-neutral-T100 rounded-xl px-5 py-3 flex-row items-center gap-2 active:scale-95 transition-transform">
              <Text
                className="text-primary-T40 text-xs font-label uppercase tracking-wider"
                style={{ fontWeight: '800' }}
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
          className="text-xs font-body uppercase tracking-widest text-neutral-T50"
          style={{ letterSpacing: 2 }}
        >
          The Basics
        </Text>
        <Text
          className="text-2xl font-sans text-neutral-T10 mt-1"
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
            // FLAT DESIGN: Thêm viền dày, bo góc xl
            className="bg-primary-T95 rounded-xl p-4 justify-between border-2 border-primary-T90 active:scale-95 transition-transform"
            style={{ width: 140, height: 120 }}
          >
            <MaterialCommunityIcons
              name={card.icon as any}
              size={28}
              color="#296C24"
            />
            <Text
              className="text-sm font-body text-primary-T40 mt-2 leading-snug"
              style={{ fontWeight: '700' }}
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
    <TouchableOpacity
      activeOpacity={0.9}
      // FLAT DESIGN: Cắt shadow, thêm border-2
      className="bg-neutral-T100 rounded-xl overflow-hidden flex-1 border-2 border-neutral-T90"
    >
      <View className="relative border-b-2 border-neutral-T90">
        <Image
          source={{ uri: item.image }}
          className="w-full"
          style={{ height: 140 }}
          resizeMode="cover"
        />
        {item.badge && (
          // FLAT DESIGN: Label vuông vức, uppercase
          <View
            className={`absolute top-2.5 left-2.5 px-2 py-1 rounded-md border-2 ${
              item.badgeType === 'expiring'
                ? 'bg-secondary border-secondary-T40'
                : 'bg-neutral-T100 border-neutral-T90'
            }`}
          >
            <Text
              className={`text-[10px] font-label uppercase tracking-wider ${
                item.badgeType === 'expiring'
                  ? 'text-neutral-T100'
                  : 'text-primary-T40'
              }`}
              style={{ fontWeight: '800' }}
            >
              {item.badge}
            </Text>
          </View>
        )}
      </View>

      <View className="px-3 pt-3 pb-4">
        <Text
          className="text-[15px] font-sans text-neutral-T10 leading-snug"
          style={{ fontWeight: '800' }}
          numberOfLines={1}
        >
          {item.name}
        </Text>
        <View className="flex-row items-center gap-2 mt-2">
          <Image source={{ uri: item.avatar }} className="w-5 h-5 rounded-md" />
          <Text
            className="text-xs font-body text-neutral-T50"
            numberOfLines={1}
          >
            {item.user} · {item.distance}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
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
          className="text-2xl font-sans text-neutral-T10"
          style={{ fontWeight: '800', letterSpacing: -0.5 }}
        >
          Freshly Shared
        </Text>
        <TouchableOpacity className="flex-row items-center gap-1 active:opacity-70">
          <Text
            className="text-sm font-label uppercase tracking-wider text-primary-T40"
            style={{ fontWeight: '800' }}
          >
            See all
          </Text>
          <Feather name="arrow-right" size={16} color="#296C24" />
        </TouchableOpacity>
      </View>
      <View className="gap-4">
        {rows.map((row, idx) => (
          <View key={idx} className="flex-row gap-4">
            {row.map((item) => (
              <P2PCard key={item.id} item={item} />
            ))}
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
          className="text-xs font-body uppercase tracking-widest text-neutral-T50"
          style={{ letterSpacing: 2 }}
        >
          From Shops
        </Text>
        <View className="flex-row items-end justify-between mt-1">
          <Text
            className="text-2xl font-sans text-neutral-T10"
            style={{ fontWeight: '800', letterSpacing: -0.5 }}
          >
            Surprise Bags{'\n'}around you
          </Text>
          <TouchableOpacity className="flex-row items-center gap-1 mb-1 active:opacity-70">
            <Text
              className="text-sm font-label uppercase tracking-wider text-primary-T40"
              style={{ fontWeight: '800' }}
            >
              See all
            </Text>
            <Feather name="arrow-right" size={16} color="#296C24" />
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
        }} // Đã xóa paddingBottom vì hết bóng đổ
      >
        {MARKET_ITEMS.map((item) => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.9}
            // FLAT DESIGN: Viền 2px, bỏ shadow
            className="bg-neutral-T100 rounded-xl overflow-hidden border-2 border-neutral-T90"
            style={{ width: 190 }}
          >
            <View className="relative border-b-2 border-neutral-T90">
              <Image
                source={{ uri: item.image }}
                style={{ width: 190, height: 150 }}
                resizeMode="cover"
              />
              <View className="absolute bottom-3 left-3 bg-primary-T40 rounded-md border-2 border-primary-T30 px-2 py-1">
                <Text
                  className="text-neutral-T100 text-xs font-label uppercase tracking-wider"
                  style={{ fontWeight: '800' }}
                >
                  {item.price}
                </Text>
              </View>
              <View className="absolute top-3 right-3 bg-neutral-T100 border-2 border-neutral-T90 w-8 h-8 rounded-md items-center justify-center">
                <Ionicons name="bag-outline" size={16} color="#191C1C" />
              </View>
            </View>
            <View className="px-4 pt-3 pb-4">
              <Text
                className="text-[15px] font-sans text-neutral-T10"
                style={{ fontWeight: '800' }}
                numberOfLines={1}
              >
                {item.name}
              </Text>
              <View className="flex-row items-center justify-between mt-1">
                <Text
                  className="text-xs font-body text-neutral-T50"
                  numberOfLines={1}
                >
                  {item.subtitle}
                </Text>
                <View className="flex-row items-center gap-0.5">
                  <Ionicons name="star" size={12} color="#EC8632" />
                  <Text
                    className="text-xs font-body text-neutral-T10"
                    style={{ fontWeight: '700' }}
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
      <View className="bg-primary-T40 rounded-2xl items-center py-10 px-6 overflow-hidden border-2 border-primary-T30 relative">
        <View
          className="absolute -top-10 -right-10 bg-primary/40 rounded-xl"
          style={{ width: 160, height: 160, transform: [{ rotate: '45deg' }] }}
        />
        <View
          className="absolute -bottom-8 -left-8 bg-primary/30 rounded-xl"
          style={{ width: 130, height: 130, transform: [{ rotate: '15deg' }] }}
        />

        <View className="bg-neutral-T100 border-2 border-neutral-T90 rounded-xl w-12 h-12 items-center justify-center mb-5 z-10">
          <Ionicons name="flash" size={24} color="#296C24" />
        </View>

        <Text
          className="text-5xl font-sans text-neutral-T100 text-center z-10"
          style={{ fontWeight: '900', letterSpacing: -1.5 }}
        >
          2,412 lbs
        </Text>
        <Text className="text-base font-body text-neutral-T100/90 text-center mt-2 z-10">
          Food saved in North Chicago this week
        </Text>

        <TouchableOpacity className="mt-8 border-2 border-neutral-T100 bg-neutral-T100/10 rounded-xl px-6 py-3 z-10 active:bg-neutral-T100/20">
          <Text
            className="text-neutral-T100 text-xs font-label uppercase tracking-wider"
            style={{ fontWeight: '800' }}
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
    <View className="flex-1 bg-neutral">
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
