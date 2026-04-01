// app/(tabs)/profile.tsx
import React from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ContactCard from '@/components/profile/ContactCard';
import IdentityCard from '@/components/profile/IdentityCard';
import ProfileActions from '@/components/profile/ProfileActions';
import ProfileHeader from '@/components/profile/ProfileHeader';
import RecentPosts from '@/components/profile/RecentPosts';
import StoreDetailsCard from '@/components/profile/StoreDetailsCard';
import VerificationCard from '@/components/profile/VerificationCard';
import { useAuthStore } from '@/stores/authStore';

// ─── MOCK DATA ───
const MOCK_USER = {
  fullName: 'Alex Rivera',
  email: 'alex.rivera@sourdough.co',
  phoneNumber: '+44 20 7123 4567',
  defaultAddress: '78 Baker St, London',
  role: 'STORE', // 'USER' | 'STORE' | 'ADMIN'
  authProvider: 'GOOGLE',
  isProfileCompleted: true,
  status: 'ACTIVE', // 'ACTIVE' | 'BANNED'
  createdAt: '2021-06-15T00:00:00.000Z',
  avatar:
    'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400&q=80',
  location: { type: 'Point', coordinates: [-0.1568, 51.5229] },
  storeInfo: {
    businessName: 'Sourdough & Co.',
    openHours: '09:00',
    closeHours: '21:00',
    description:
      'Artisanal bakery specializing in slow-fermented breads and organic pastries. Everything is made fresh daily using traditional techniques and locally sourced ingredients.',
    businessAddress: '78 Baker St, London',
  },
  kycStatus: 'VERIFIED' as const, // 'PENDING' | 'VERIFIED' | 'REJECTED'
  kycDocuments: [
    'https://images.unsplash.com/photo-1621972750749-0fbb1abb7736?w=200&q=80',
    'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=200&q=80',
  ],
  greenPoints: 1240,
  averageRating: 4.9,
};

const MOCK_LISTINGS = [
  {
    id: '1',
    title: 'Classic Rustic Loaf',
    status: 'AVAILABLE',
    image:
      'https://images.unsplash.com/photo-1587486913049-53fc88980cfc?w=400&q=80',
    price: '£4.50',
  },
  {
    id: '2',
    title: 'Butter Croissants',
    status: 'BOOKED',
    image:
      'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&q=80',
    price: '£3.00',
  },
  {
    id: '3',
    title: 'Sourdough Batard',
    status: 'PENDING_REVIEW',
    image:
      'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=400&q=80',
    price: '£5.00',
  },
  {
    id: '4',
    title: 'Walnut Rye',
    status: 'OUT_OF_STOCK',
    image:
      'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80',
    price: '£6.00',
  },
  {
    id: '5',
    title: 'Seeded Baguette',
    status: 'HIDDEN',
    image:
      'https://images.unsplash.com/photo-1549931319-a545dcf3bc7c?w=400&q=80',
    price: '£2.50',
  },
  {
    id: '6',
    title: 'Cinnamon Roll',
    status: 'REJECTED',
    image:
      'https://images.unsplash.com/photo-1574085733277-851d9d856a3a?w=400&q=80',
    price: '£3.50',
  },
];

// ─── MAIN COMPONENT ───
export default function ProfileScreen() {
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = async (): Promise<void> => {
    await logout();
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-DEFAULT" edges={['top']}>
      <ProfileHeader />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 120,
          paddingHorizontal: 24,
          paddingTop: 24,
        }}
        className="flex-1"
      >
        <View className="gap-4">
          <IdentityCard
            avatar={MOCK_USER.avatar}
            fullName={MOCK_USER.fullName}
            role={MOCK_USER.role}
            createdAt={MOCK_USER.createdAt}
            status={MOCK_USER.status}
            greenPoints={MOCK_USER.greenPoints}
            averageRating={MOCK_USER.averageRating}
          />

          {MOCK_USER.role === 'STORE' && MOCK_USER.storeInfo && (
            <StoreDetailsCard
              businessName={MOCK_USER.storeInfo.businessName}
              openHours={MOCK_USER.storeInfo.openHours}
              closeHours={MOCK_USER.storeInfo.closeHours}
              description={MOCK_USER.storeInfo.description}
              businessAddress={MOCK_USER.storeInfo.businessAddress}
            />
          )}

          <ContactCard
            email={MOCK_USER.email}
            phoneNumber={MOCK_USER.phoneNumber}
            defaultAddress={MOCK_USER.defaultAddress}
          />

          <VerificationCard
            kycStatus={MOCK_USER.kycStatus}
            kycDocuments={MOCK_USER.kycDocuments}
          />

          <RecentPosts posts={MOCK_LISTINGS} onSeeAll={() => {}} />

          <ProfileActions onEditProfile={() => {}} onLogOut={handleLogout} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
