// app/(tabs)/profile.tsx
import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// ─── MOCK DATA (Dựa trên Model User.ts) ───
const MOCK_USER = {
  fullName: 'Arthur Baker',
  email: 'a.baker@sourdough.co',
  phoneNumber: '+44 20 7946 0123',
  defaultAddress: '123 Baker St, London',
  role: 'STORE', // 'USER' | 'STORE' | 'ADMIN'
  authProvider: 'GOOGLE', // 'LOCAL' | 'GOOGLE'
  isProfileCompleted: true,
  status: 'ACTIVE', // 'ACTIVE' | 'BANNED'
  createdAt: '2023-10-01T00:00:00.000Z',
  avatar:
    'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400&q=80',
  location: { type: 'Point', coordinates: [-0.1568, 51.5229] },
  storeInfo: {
    openHours: '9:00 - 21:00',
    description:
      'Artisan bakery specializing in sourdough, naturally leavened breads and seasonal pastries.',
    businessAddress: '123 Baker St, London',
  },
  kycStatus: 'VERIFIED', // 'PENDING' | 'VERIFIED' | 'REJECTED'
  kycDocuments: [
    'https://images.unsplash.com/photo-1621972750749-0fbb1abb7736?w=200&q=80',
    'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=200&q=80',
  ],
  greenPoints: 1250,
  averageRating: 4.8,
};

const MOCK_LISTINGS = [
  {
    id: '1',
    type: 'P2P_FREE',
    title: 'Sourdough Loaf',
    status: 'AVAILABLE',
    image:
      'https://images.unsplash.com/photo-1587486913049-53fc88980cfc?w=400&q=80',
  },
  {
    id: '2',
    type: 'B2C_MYSTERY_BAG',
    title: 'Butter Croissants',
    status: 'LOW_STOCK',
    image:
      'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&q=80',
  },
  {
    id: '3',
    type: 'B2C_MYSTERY_BAG',
    title: 'Baguette Trad',
    status: 'OUT_OF_STOCK',
    image:
      'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=400&q=80',
  },
];

// ─── COMPONENT BẢO MẬT (PRIVACY FIELD) ───
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
        <MaterialIcons name={icon} size={20} color="#296C24" />
        <Text
          className="font-body text-sm font-bold text-neutral-T10 flex-1"
          numberOfLines={1}
        >
          {isHidden ? maskedValue : value}
        </Text>
      </View>
      <TouchableOpacity
        onPress={onToggle}
        className="p-1 active:scale-90 transition-transform"
      >
        <MaterialIcons
          name={isHidden ? 'visibility-off' : 'visibility'}
          size={20}
          color="#757777"
        />
      </TouchableOpacity>
    </View>
  );
};

// ─── MAIN COMPONENT ───
export default function ProfileScreen() {
  const [hideEmail, setHideEmail] = useState(true);
  const [hidePhone, setHidePhone] = useState(true);
  const [hideAddress, setHideAddress] = useState(false);
  const [activeTab, setActiveTab] = useState<'P2P_FREE' | 'B2C_MYSTERY_BAG'>(
    'P2P_FREE'
  );

  const filteredListings = MOCK_LISTINGS.filter((l) => l.type === activeTab);

  // Xử lý màu sắc linh hoạt cho KYC Badge
  const getKycBadgeStyle = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return 'bg-primary-T90 text-primary-T10 border-primary-T40';
      case 'PENDING':
        return 'bg-secondary-T90 text-secondary-T10 border-secondary-T40';
      case 'REJECTED':
        return 'bg-[#ffdad6] text-[#93000a] border-[#ba1a1a]';
      default:
        return 'bg-neutral-T90 text-neutral-T10 border-neutral-T80';
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-DEFAULT" edges={['top']}>
      {/* ── Top Navigation Anchor ── */}
      <View className="flex-row items-center justify-between w-full h-16 px-6 bg-neutral-DEFAULT border-b-2 border-neutral-T80 z-50">
        <View className="w-8" />
        <Text className="font-headline font-extrabold tracking-tighter uppercase text-xl text-neutral-T10">
          PROFILE
        </Text>
        <TouchableOpacity className="active:scale-95 transition-transform p-1">
          <MaterialIcons name="settings" size={26} color="#191C1C" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 120,
          paddingHorizontal: 16,
          paddingTop: 24,
        }}
        className="flex-1"
      >
        {/* ── Hero Identity Card ── */}
        <View className="bg-neutral-T100 border-2 border-neutral-T80 rounded-2xl p-6 flex-col items-center text-center mb-6">
          <View className="relative mb-4">
            <Image
              source={{ uri: MOCK_USER.avatar }}
              className="w-32 h-32 rounded-2xl border-2 border-neutral-T80 object-cover"
            />
            {/* Role Badge Góc Dưới */}
            <View className="absolute -bottom-3 -right-3 bg-secondary-T40 border-2 border-neutral-T80 rounded-lg px-3 py-1.5">
              <Text className="font-label text-[10px] font-bold text-neutral-T100 uppercase tracking-wider">
                {MOCK_USER.role}
              </Text>
            </View>
          </View>

          <Text className="font-headline font-extrabold text-3xl tracking-tighter mb-1 mt-2 text-neutral-T10 uppercase">
            {MOCK_USER.fullName}
          </Text>

          <View className="flex-row items-center gap-2 mb-4">
            {MOCK_USER.status === 'ACTIVE' && (
              <MaterialIcons name="verified" size={16} color="#296C24" />
            )}
            <Text className="font-label text-[11px] font-bold uppercase text-neutral-T50 tracking-wider">
              Since {new Date(MOCK_USER.createdAt).getFullYear()} •{' '}
              {MOCK_USER.authProvider}
            </Text>
          </View>

          <View className="flex-row gap-4 w-full">
            <View className="flex-1 bg-neutral-DEFAULT border-2 border-neutral-T80 rounded-xl p-3 flex-col items-center">
              <Text className="font-label text-[10px] text-neutral-T50 mb-1 tracking-wider uppercase">
                GREEN POINTS
              </Text>
              <Text className="font-headline font-bold text-lg text-primary-T40">
                {MOCK_USER.greenPoints.toLocaleString()}
              </Text>
            </View>
            <View className="flex-1 bg-neutral-DEFAULT border-2 border-neutral-T80 rounded-xl p-3 flex-col items-center">
              <Text className="font-label text-[10px] text-neutral-T50 mb-1 tracking-wider uppercase">
                RATING
              </Text>
              <Text className="font-headline font-bold text-lg text-secondary-T40">
                {MOCK_USER.averageRating}
              </Text>
            </View>
          </View>
        </View>

        {/* ── Store Details Card (Conditionally Rendered) ── */}
        {MOCK_USER.role === 'STORE' && MOCK_USER.storeInfo && (
          <View className="bg-neutral-T100 border-2 border-neutral-T80 rounded-2xl p-6 mb-6">
            <View className="flex-row items-center justify-between border-b-2 border-neutral-T90 pb-2 mb-4">
              <Text className="font-label text-sm font-bold tracking-widest text-neutral-T10 uppercase">
                STORE DETAILS
              </Text>
              <MaterialIcons name="storefront" size={24} color="#757777" />
            </View>
            <View className="flex-col gap-3">
              <View className="flex-row justify-between items-center">
                <Text className="font-label text-xs text-neutral-T50 tracking-wider uppercase">
                  OPEN HOURS
                </Text>
                <Text className="font-body font-bold text-neutral-T10">
                  {MOCK_USER.storeInfo.openHours}
                </Text>
              </View>
              <View className="flex-row justify-between items-start">
                <Text className="font-label text-xs text-neutral-T50 tracking-wider uppercase mt-1">
                  ADDRESS
                </Text>
                <Text className="font-body font-bold text-neutral-T10 text-right max-w-[200px]">
                  {MOCK_USER.storeInfo.businessAddress}
                </Text>
              </View>
              <View className="pt-2 border-t-2 border-neutral-T90 mt-1">
                <Text className="font-body text-sm leading-relaxed text-neutral-T40">
                  {MOCK_USER.storeInfo.description}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* ── Contact & Privacy ── */}
        <View className="bg-neutral-T100 border-2 border-neutral-T80 rounded-2xl p-6 mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="font-label text-sm font-bold tracking-widest text-neutral-T10 uppercase">
              CONTACT INFO
            </Text>
            <MaterialIcons name="contact-mail" size={24} color="#757777" />
          </View>
          <View className="flex-col gap-1">
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
              icon="location-on"
              value={MOCK_USER.defaultAddress}
              isHidden={hideAddress}
              onToggle={() => setHideAddress(!hideAddress)}
            />
            {/* Tọa độ Location (Dành cho Developer/Map Debug) */}
            <View className="flex-row items-center gap-3 mt-1 opacity-50">
              <MaterialIcons name="gps-fixed" size={20} color="#191C1C" />
              <Text className="font-body text-xs font-bold text-neutral-T10">
                [ {MOCK_USER.location.coordinates[0]},{' '}
                {MOCK_USER.location.coordinates[1]} ]
              </Text>
            </View>
          </View>
        </View>

        {/* ── Verification Section ── */}
        <View className="mb-8">
          <View className="flex-row items-center justify-between px-2 mb-3">
            <Text className="font-label text-sm font-bold tracking-widest text-neutral-T10 uppercase">
              VERIFICATION
            </Text>
            <View
              className={`border-2 rounded-full px-3 py-1 ${getKycBadgeStyle(MOCK_USER.kycStatus)}`}
            >
              <Text className="font-label text-[10px] font-black uppercase tracking-wider">
                {MOCK_USER.kycStatus}
              </Text>
            </View>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 16 }}
            className="flex-row"
          >
            {MOCK_USER.kycDocuments.map((doc, idx) => (
              <View
                key={idx}
                className="w-40 h-28 bg-neutral-T95 border-2 border-neutral-T80 rounded-xl overflow-hidden active:scale-95 transition-transform"
              >
                <Image
                  source={{ uri: doc }}
                  className="w-full h-full grayscale opacity-60"
                  resizeMode="cover"
                />
              </View>
            ))}
          </ScrollView>
        </View>

        {/* ── Listing Tabs ── */}
        <View className="mb-4 flex-row gap-2 border-2 border-neutral-T80 p-1 rounded-2xl bg-neutral-T95">
          <TouchableOpacity
            onPress={() => setActiveTab('P2P_FREE')}
            className={`flex-1 py-3 rounded-xl active:scale-95 transition-transform ${
              activeTab === 'P2P_FREE' ? 'bg-neutral-T10' : 'bg-transparent'
            }`}
          >
            <Text
              className={`font-headline font-black text-center tracking-tighter uppercase ${
                activeTab === 'P2P_FREE'
                  ? 'text-neutral-T100'
                  : 'text-neutral-T10'
              }`}
            >
              P2P FREE
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('B2C_MYSTERY_BAG')}
            className={`flex-1 py-3 rounded-xl active:scale-95 transition-transform ${
              activeTab === 'B2C_MYSTERY_BAG'
                ? 'bg-neutral-T10'
                : 'bg-transparent'
            }`}
          >
            <Text
              className={`font-headline font-black text-center tracking-tighter uppercase ${
                activeTab === 'B2C_MYSTERY_BAG'
                  ? 'text-neutral-T100'
                  : 'text-neutral-T10'
              }`}
            >
              B2C SURPRISE
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Bento Grid Listings ── */}
        <View className="flex-row flex-wrap justify-between gap-y-4">
          {filteredListings.length > 0 ? (
            filteredListings.map((item) => (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.9}
                className="w-[48%] aspect-square bg-neutral-T100 border-2 border-neutral-T80 rounded-2xl overflow-hidden active:scale-95 transition-transform"
              >
                <Image
                  source={{ uri: item.image }}
                  className="w-full h-2/3 border-b-2 border-neutral-T80"
                  resizeMode="cover"
                />
                <View className="p-3">
                  <Text
                    className={`font-label text-[10px] font-bold uppercase tracking-wider mb-1 ${
                      item.status === 'AVAILABLE'
                        ? 'text-primary-T40'
                        : 'text-neutral-T50'
                    }`}
                  >
                    {item.status.replace('_', ' ')}
                  </Text>
                  <Text
                    className="font-body font-bold text-xs uppercase truncate text-neutral-T10"
                    numberOfLines={1}
                  >
                    {item.title}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View className="w-full py-8 items-center justify-center border-2 border-dashed border-neutral-T80 rounded-2xl bg-neutral-T100">
              <Text className="font-body text-neutral-T50 uppercase tracking-widest text-xs font-bold">
                No listings yet
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
