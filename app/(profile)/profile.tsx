// app/(profile)/profile.tsx
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import ContactCard from '@/components/profile/ContactCard';
import IdentityCard from '@/components/profile/IdentityCard';
import ProfileActions from '@/components/profile/ProfileActions';
import BadgesRow from '@/components/profile/BadgesRow';
import MainHeader from '@/components/shared/headers/MainHeader';
import RecentPosts from '@/components/profile/RecentPosts';
import StoreDetailsCard from '@/components/profile/StoreDetailsCard';
import VerificationCard from '@/components/profile/VerificationCard';
import { useAuthStore } from '@/stores/authStore';
import { getBadgeCatalogApi } from '@/lib/badgeApi';
import type { IBadge } from '@/lib/badgeApi';

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
  const fetchProfile = useAuthStore((s) => s.fetchProfile);

  const [showRejectionModal, setShowRejectionModal] = useState(false);
  // Track để chỉ show modal 1 lần mỗi session (không pop lại mỗi lần focus)
  const rejectionShownRef = useRef(false);

  // ── Badge state ──
  const [badgeList, setBadgeList] = useState<IBadge[]>([]);
  const [badgeTotal, setBadgeTotal] = useState(0);
  const [badgeUnlocked, setBadgeUnlocked] = useState(0);
  const [badgesLoading, setBadgesLoading] = useState(false);

  // Fetch fresh profile data khi tab được focus
  useFocusEffect(
    useCallback(() => {
      fetchProfile();
      // Load badge catalog để hiển thị preview row
      setBadgesLoading(true);
      getBadgeCatalogApi()
        .then((res) => {
          setBadgeList(res.data.badges);
          setBadgeTotal(res.data.total);
          setBadgeUnlocked(res.data.unlocked);
        })
        .catch(() => {})
        .finally(() => setBadgesLoading(false));
    }, [fetchProfile])
  );

  // Hiển thị modal thông báo KYC bị từ chối (1 lần mỗi session)
  useEffect(() => {
    if (
      !rejectionShownRef.current &&
      user?.role === 'USER' &&
      user?.kycStatus === 'REJECTED' &&
      user?.kycDocuments &&
      user.kycDocuments.length > 0
    ) {
      setShowRejectionModal(true);
      rejectionShownRef.current = true;
    }
  }, [user?.kycStatus, user?.kycDocuments?.length]);

  if (!user) {
    return (
      <View className="flex-1 bg-neutral-DEFAULT items-center justify-center">
        <ActivityIndicator size="large" color="#72B866" />
        <Text className="font-body text-sm text-neutral-T50 mt-3">
          Loading profile...
        </Text>
      </View>
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
  // Store registration: show button only for USER role (not yet a store)
  const canRegisterStore = user.role === 'USER';
  // Pending = USER đã nộp hồ sơ, đang chờ admin duyệt (không tính trạng thái đã bị từ chối)
  const storeRegistrationPending =
    user.role === 'USER' &&
    user.kycStatus !== 'REJECTED' &&
    user.kycDocuments &&
    user.kycDocuments.length > 0;
  // Chỉ hiển thị VerificationCard khi user là STORE, hoặc đã nộp hồ sơ đăng ký store
  const showVerificationCard =
    user.role === 'STORE' ||
    (user.kycDocuments && user.kycDocuments.length > 0);

  return (
    <View className="flex-1 bg-neutral-DEFAULT">
      {/* ── KYC Rejection Modal ── */}
      <Modal
        visible={showRejectionModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRejectionModal(false)}
      >
        <Pressable
          className="flex-1 items-center justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
          onPress={() => setShowRejectionModal(false)}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View
              className="bg-neutral-T100 rounded-3xl mx-6 p-6 gap-4"
              style={{ maxWidth: 340 }}
            >
              {/* Icon */}
              <View
                className="w-14 h-14 rounded-2xl items-center justify-center self-center"
                style={{ backgroundColor: 'rgba(186,26,26,0.1)' }}
              >
                <MaterialIcons name="gpp-bad" size={28} color="#ba1a1a" />
              </View>
              {/* Title */}
              <View className="gap-1">
                <Text className="font-sans font-bold text-lg text-neutral-T10 text-center">
                  Đơn đăng ký bị từ chối
                </Text>
                <Text className="font-body text-sm text-neutral-T50 text-center leading-5">
                  Hồ sơ đăng ký cửa hàng của bạn chưa được duyệt. Bạn có thể
                  nhấn nút{' '}
                  <Text className="font-semibold text-neutral-T30">
                    Đăng ký cửa hàng
                  </Text>{' '}
                  để nộp lại đơn mới.
                </Text>
              </View>
              {/* Action */}
              <TouchableOpacity
                className="h-12 rounded-xl items-center justify-center"
                style={{ backgroundColor: 'rgba(186,26,26,0.1)' }}
                onPress={() => setShowRejectionModal(false)}
              >
                <Text className="font-label font-semibold text-error">
                  Đã hiểu
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <MainHeader />

      <TouchableOpacity className="px-6 pt-3" onPress={() => router.back()}>
        <Text className="font-bold text-slate-500 underline">Back</Text>
      </TouchableOpacity>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 48,
          paddingHorizontal: 24,
          paddingTop: 16,
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
            onGreenPointsPress={() =>
              router.push('/(voucher)/point-history' as any)
            }
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

          {showVerificationCard && (
            <VerificationCard
              kycStatus={user.kycStatus}
              kycDocuments={user.kycDocuments ?? []}
            />
          )}

          <BadgesRow
            badges={badgeList}
            total={badgeTotal}
            unlocked={badgeUnlocked}
            isLoading={badgesLoading}
            onSeeAll={() => router.push('/(profile)/badges' as any)}
          />

          <RecentPosts posts={MOCK_LISTINGS} onSeeAll={() => {}} />

          <ProfileActions
            onEditProfile={() => router.push('/(profile)/edit-profile')}
            onRegisterStore={() => router.push('/(profile)/register-store')}
            showRegisterStore={canRegisterStore}
            storeRegistrationPending={storeRegistrationPending}
          />
        </View>
      </ScrollView>
    </View>
  );
}
