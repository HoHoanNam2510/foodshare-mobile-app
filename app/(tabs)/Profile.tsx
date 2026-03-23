// app/(tabs)/profile.tsx
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// ─── MOCK DATA (Dựa trên User.ts & Post.ts) ───
const MOCK_USER = {
  fullName: 'Ho Hoàn Nam',
  email: 'hohoannam2510@example.com',
  phoneNumber: '+84 987 654 321',
  role: 'USER',
  avatar: 'https://i.pravatar.cc/150?img=11',
  defaultAddress: '12 Phạm Văn Đồng, Bình Thạnh, TP.HCM',
  location: { type: 'Point', coordinates: [106.660172, 10.762622] },
  kycStatus: 'VERIFIED', // 'PENDING' | 'VERIFIED' | 'REJECTED'
  kycDocuments: [
    'https://images.unsplash.com/photo-1621972750749-0fbb1abb7736?w=200&q=80', // Mock ID card image
  ],
  greenPoints: 1250,
  averageRating: 4.8,
  createdAt: '2025-10-25T00:00:00.000Z',

  // Custom mock data for impact & badges
  impact: { offered: 24, received: 5 },
  badges: [
    { id: 'b1', icon: 'leaf', color: '#72B866', title: 'First Share' },
    { id: 'b2', icon: 'star', color: '#EC8632', title: 'Top Rated' },
    { id: 'b3', icon: 'shield-check', color: '#296C24', title: 'Trusted' },
  ],
};

const MOCK_LISTINGS = [
  {
    id: '1',
    type: 'P2P_FREE',
    title: 'Organic Eggs',
    image:
      'https://images.unsplash.com/photo-1587486913049-53fc88980cfc?w=200&q=80',
  },
  {
    id: '2',
    type: 'P2P_FREE',
    title: 'Garden Salad Mix',
    image:
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200&q=80',
  },
  {
    id: '3',
    type: 'B2C_MYSTERY_BAG',
    title: 'Bakery Surplus Bag',
    image:
      'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&q=80',
  },
];

// ─── SUB-COMPONENTS ───

// Dùng khoảng trắng thay viền (The No-Line Rule)
const SectionTitle = ({ title }: { title: string }) => (
  <Text className="font-sans text-xl font-bold text-text mb-4 mt-8 px-6 tracking-tight">
    {title}
  </Text>
);

// Component hiển thị field có thể ẩn/hiện
const PrivacyField = ({
  icon,
  value,
  isHidden,
  onToggle,
}: {
  icon: any;
  value: string;
  isHidden: boolean;
  onToggle: () => void;
}) => {
  const maskedValue = value.replace(/./g, '*').substring(0, 10) + '...';
  return (
    <View className="flex-row items-center justify-between mb-3">
      <View className="flex-row items-center gap-3 flex-1">
        <Feather name={icon} size={16} color="#6b7a6a" />
        <Text className="font-body text-sm text-text flex-1" numberOfLines={1}>
          {isHidden ? maskedValue : value}
        </Text>
      </View>
      <TouchableOpacity onPress={onToggle} className="p-1">
        <Feather
          name={isHidden ? 'eye-off' : 'eye'}
          size={18}
          color="#9ea99d"
        />
      </TouchableOpacity>
    </View>
  );
};

// ─── MAIN COMPONENT ───
export default function ProfileScreen() {
  // States for privacy toggles
  const [hideEmail, setHideEmail] = useState(true);
  const [hidePhone, setHidePhone] = useState(true);
  const [hideAddress, setHideAddress] = useState(false);

  // State for listings tab
  const [activeTab, setActiveTab] = useState<'P2P_FREE' | 'B2C_MYSTERY_BAG'>(
    'P2P_FREE'
  );

  const filteredListings = MOCK_LISTINGS.filter((l) => l.type === activeTab);

  const getLevel = (points: number) => {
    if (points > 1000) return 'Master Harvester';
    if (points > 500) return 'Green Guardian';
    return 'Seedling';
  };

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top']}>
      {/* ── Header ── */}
      <View className="flex-row items-center justify-between px-6 py-4">
        <View className="w-8" />
        <Text className="font-sans text-xl font-bold text-text">Profile</Text>
        <TouchableOpacity className="w-8 h-8 bg-surface-lowest rounded-full items-center justify-center shadow-sm">
          <Feather name="edit-2" size={16} color="#296C24" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* ── Basic Info Section ── */}
        <View className="px-6 mt-4 flex-row gap-5 items-start">
          <Image
            source={{ uri: MOCK_USER.avatar }}
            className="w-24 h-24 rounded-full"
          />
          <View className="flex-1 pt-1">
            <Text className="font-sans text-2xl font-bold text-text leading-tight">
              {MOCK_USER.fullName}
            </Text>

            {/* Rating */}
            <View className="flex-row items-center gap-1 mt-1 mb-3">
              <Text className="font-body font-bold text-text">
                {MOCK_USER.averageRating}
              </Text>
              <View className="flex-row">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Feather
                    key={i}
                    name="star"
                    size={14}
                    color={
                      i <= Math.round(MOCK_USER.averageRating)
                        ? '#EC8632'
                        : '#d0dece'
                    }
                  />
                ))}
              </View>
            </View>

            <PrivacyField
              icon="mail"
              value={MOCK_USER.email}
              isHidden={hideEmail}
              onToggle={() => setHideEmail(!hideEmail)}
            />
            <PrivacyField
              icon="phone"
              value={MOCK_USER.phoneNumber}
              isHidden={hidePhone}
              onToggle={() => setHidePhone(!hidePhone)}
            />
            <PrivacyField
              icon="map-pin"
              value={MOCK_USER.defaultAddress}
              isHidden={hideAddress}
              onToggle={() => setHideAddress(!hideAddress)}
            />
          </View>
        </View>

        {/* ── Verification (KYC) ── */}
        <SectionTitle title="Trust & Verification" />
        <View className="mx-6 bg-surface-lowest rounded-3xl p-5 shadow-sm">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="font-body text-base text-text font-medium">
              Identity Status
            </Text>
            <View
              className={`px-3 py-1 rounded-full ${MOCK_USER.kycStatus === 'VERIFIED' ? 'bg-primary/20' : 'bg-secondary/20'}`}
            >
              <Text
                className={`font-body text-xs font-bold ${MOCK_USER.kycStatus === 'VERIFIED' ? 'text-primary-dark' : 'text-secondary'}`}
              >
                {MOCK_USER.kycStatus}
              </Text>
            </View>
          </View>

          <Text className="font-body text-xs text-text-muted mb-3 uppercase tracking-wider">
            Submitted Documents
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="flex-row gap-3"
          >
            {MOCK_USER.kycDocuments.map((doc, idx) => (
              <Image
                key={idx}
                source={{ uri: doc }}
                className="w-24 h-16 rounded-xl bg-surface"
                resizeMode="cover"
              />
            ))}
            <TouchableOpacity className="w-24 h-16 rounded-xl bg-surface items-center justify-center border-2 border-dashed border-gray-300">
              <Feather name="plus" size={20} color="#9ea99d" />
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* ── Impact ── */}
        <SectionTitle title="Community Impact" />
        <View className="mx-6 bg-primary-dark rounded-3xl p-6 shadow-md flex-row items-center justify-between">
          <View>
            <Text className="font-body text-white/70 text-sm mb-1">
              Total Activity
            </Text>
            <Text className="font-sans text-5xl font-bold text-white tracking-tighter">
              {MOCK_USER.impact.offered + MOCK_USER.impact.received}
            </Text>
          </View>
          <View className="gap-2">
            <View className="flex-row items-center gap-2">
              <View className="w-2 h-2 rounded-full bg-secondary" />
              <Text className="font-body text-white text-sm">
                {MOCK_USER.impact.offered} Listings offered
              </Text>
            </View>
            <View className="flex-row items-center gap-2">
              <View className="w-2 h-2 rounded-full bg-tertiary" />
              <Text className="font-body text-white text-sm">
                {MOCK_USER.impact.received} Listings received
              </Text>
            </View>
          </View>
        </View>

        {/* ── Green Points & Badges ── */}
        <SectionTitle title="Achievements" />
        <View className="mx-6 flex-row gap-4 mb-4">
          <View className="flex-1 bg-surface-lowest rounded-3xl p-5 shadow-sm justify-center">
            <Text className="font-body text-text-muted text-xs uppercase tracking-wider mb-1">
              Rank
            </Text>
            <Text className="font-sans text-lg font-bold text-text text-primary-dark">
              {getLevel(MOCK_USER.greenPoints)}
            </Text>
          </View>
          <View className="flex-1 bg-surface-lowest rounded-3xl p-5 shadow-sm justify-center">
            <Text className="font-body text-text-muted text-xs uppercase tracking-wider mb-1">
              Green Points
            </Text>
            <View className="flex-row items-center gap-1">
              <MaterialCommunityIcons name="leaf" size={20} color="#72B866" />
              <Text className="font-sans text-2xl font-bold text-text">
                {MOCK_USER.greenPoints}
              </Text>
            </View>
          </View>
        </View>

        <SectionTitle title="Badges" />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 24,
            gap: 12,
            paddingVertical: 12, // <-- THÊM DÒNG NÀY ĐỂ FIX
          }}
          // Có thể thêm margin âm để bù lại khoảng padding dư nếu khoảng cách các section bị lệch
          className="-my-3"
        >
          {MOCK_USER.badges.map((badge) => (
            <View
              key={badge.id}
              className="items-center bg-surface-lowest rounded-2xl p-4 w-28 shadow-sm"
            >
              <View
                className="w-12 h-12 rounded-full items-center justify-center mb-2"
                style={{ backgroundColor: `${badge.color}20` }}
              >
                <MaterialCommunityIcons
                  name={badge.icon as any}
                  size={24}
                  color={badge.color}
                />
              </View>
              <Text className="font-body text-xs text-center text-text font-medium leading-tight">
                {badge.title}
              </Text>
            </View>
          ))}
        </ScrollView>

        {/* ── Recent Listings Tabs ── */}
        <SectionTitle title="Recent Listings" />
        <View className="px-6 flex-row gap-3 mb-5">
          <TouchableOpacity
            onPress={() => setActiveTab('P2P_FREE')}
            className={`px-5 py-2.5 rounded-full ${activeTab === 'P2P_FREE' ? 'bg-primary-dark' : 'bg-surface-lowest'}`}
          >
            <Text
              className={`font-body text-sm font-bold ${activeTab === 'P2P_FREE' ? 'text-white' : 'text-text-muted'}`}
            >
              Free food
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('B2C_MYSTERY_BAG')}
            className={`px-5 py-2.5 rounded-full ${activeTab === 'B2C_MYSTERY_BAG' ? 'bg-primary-dark' : 'bg-surface-lowest'}`}
          >
            <Text
              className={`font-body text-sm font-bold ${activeTab === 'B2C_MYSTERY_BAG' ? 'text-white' : 'text-text-muted'}`}
            >
              Surprise bags
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Listings Grid ── */}
        <View className="px-6 flex-row flex-wrap gap-4">
          {filteredListings.length > 0 ? (
            filteredListings.map((item) => (
              <TouchableOpacity
                key={item.id}
                className="bg-surface-lowest rounded-2xl overflow-hidden shadow-sm"
                style={{ width: '47%' }}
              >
                <Image
                  source={{ uri: item.image }}
                  className="w-full h-32"
                  resizeMode="cover"
                />
                <Text
                  className="font-body text-sm font-bold text-text p-3"
                  numberOfLines={1}
                >
                  {item.title}
                </Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text className="font-body text-text-muted text-center w-full mt-4">
              No listings found in this category.
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
