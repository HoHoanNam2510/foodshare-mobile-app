// app/(tabs)/profile.tsx
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ContactCard from '@/components/profile/ContactCard';
import IdentityCard from '@/components/profile/IdentityCard';
import ProfileActions from '@/components/profile/ProfileActions';
import ProfileHeader from '@/components/profile/ProfileHeader';
import RecentPosts from '@/components/profile/RecentPosts';
import StoreDetailsCard from '@/components/profile/StoreDetailsCard';
import VerificationCard from '@/components/profile/VerificationCard';
import { useAuthStore } from '@/stores/authStore';

// ─── MOCK LISTINGS (sẽ được thay thế khi có API posts) ───
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
      'https://feastingisfun.com/wp-content/uploads/2017/08/B95BD866-9ACF-4CE6-AF76-9D1375912546-825x510.jpeg',
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
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const fetchProfile = useAuthStore((s) => s.fetchProfile);

  // Fetch fresh profile data khi tab được focus
  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [fetchProfile])
  );

  const handleLogout = async (): Promise<void> => {
    await logout();
  };

  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-neutral-DEFAULT items-center justify-center">
        <ActivityIndicator size="large" color="#72B866" />
        <Text className="font-body text-sm text-neutral-T50 mt-3">
          Loading profile...
        </Text>
      </SafeAreaView>
    );
  }

  // ─── Incomplete checks ───
  const isIdentityIncomplete = !user.avatar;
  const isContactIncomplete = !user.phoneNumber || !user.defaultAddress;
  const isStoreIncomplete =
    user.role === 'STORE' &&
    (!user.storeInfo?.businessName ||
      !user.storeInfo?.openHours ||
      !user.storeInfo?.description);
  const isVerificationIncomplete =
    !user.kycDocuments || user.kycDocuments.length === 0;

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
            avatar={user.avatar}
            fullName={user.fullName}
            role={user.role}
            createdAt={user.createdAt}
            status={user.status}
            greenPoints={user.greenPoints}
            averageRating={user.averageRating}
            isIncomplete={isIdentityIncomplete}
          />

          {user.role === 'STORE' && (
            <StoreDetailsCard
              businessName={user.storeInfo?.businessName}
              openHours={user.storeInfo?.openHours}
              closeHours={user.storeInfo?.closeHours}
              description={user.storeInfo?.description}
              businessAddress={user.storeInfo?.businessAddress}
              isIncomplete={isStoreIncomplete}
            />
          )}

          <ContactCard
            email={user.email}
            phoneNumber={user.phoneNumber}
            defaultAddress={user.defaultAddress}
            location={user.location}
            isIncomplete={isContactIncomplete}
          />

          <VerificationCard
            kycStatus={user.kycStatus}
            kycDocuments={user.kycDocuments ?? []}
            isIncomplete={isVerificationIncomplete}
          />

          <RecentPosts posts={MOCK_LISTINGS} onSeeAll={() => {}} />

          <ProfileActions
            onEditProfile={() => router.push('/(post)/edit-profile')}
            onLogOut={handleLogout}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
