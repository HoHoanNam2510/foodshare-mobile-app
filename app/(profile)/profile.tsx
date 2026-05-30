// app/(profile)/profile.tsx
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import BadgesRow from '@/components/profile/BadgesRow';
import ContactCard from '@/components/profile/ContactCard';
import IdentityCard from '@/components/profile/IdentityCard';
import ProfileActions from '@/components/profile/ProfileActions';
import StatisticsCard from '@/components/profile/StatisticsCard';
import MainHeader from '@/components/shared/headers/MainHeader';
import RecentPosts, { Post } from '@/components/profile/RecentPosts';
import StoreDetailsCard from '@/components/profile/StoreDetailsCard';
import VerificationCard from '@/components/profile/VerificationCard';
import { useAuthStore } from '@/stores/authStore';
import ThemeToggle from '@/components/shared/ThemeToggle';
import type { IBadge } from '@/lib/badgeApi';
import { getMyPostsApi } from '@/lib/postApi';
import { deleteAccountApi } from '@/lib/profileApi';
import { getBadgeCatalogApi } from '@/lib/badgeApi';
import { fetchBookmarksApi } from '@/lib/bookmarkApi';
import type { ExplorePost } from '@/components/explore/types';

// ─── MAIN COMPONENT ───
export default function ProfileScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const fetchProfile = useAuthStore((s) => s.fetchProfile);
  const logout = useAuthStore((s) => s.logout);

  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const rejectionShownRef = useRef(false);

  // ── Delete account state ──
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteEmailInput, setDeleteEmailInput] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // ── Badge state ──
  const [badgeList, setBadgeList] = useState<IBadge[]>([]);
  const [badgeTotal, setBadgeTotal] = useState(0);
  const [badgeUnlocked, setBadgeUnlocked] = useState(0);
  const [badgesLoading, setBadgesLoading] = useState(false);

  // ── Posts state ──
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [savedPosts, setSavedPosts] = useState<ExplorePost[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(false);

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

      // Fetch user posts
      getMyPostsApi()
        .then((res) => {
          if (res?.success && res.data) {
            const formattedPosts: Post[] = res.data.map((p) => ({
              id: p._id,
              title: p.title,
              status: p.status,
              image: p.images?.[0] || '',
              price:
                p.type === 'P2P_FREE'
                  ? t('common.free')
                  : p.price
                    ? `£${p.price.toLocaleString('en-GB')}`
                    : '',
            }));
            setMyPosts(formattedPosts);
          }
        })
        .catch(() => {});

      // Fetch saved posts
      setLoadingSaved(true);
      fetchBookmarksApi(1, 10)
        .then((res) => setSavedPosts(res.posts))
        .catch(() => {})
        .finally(() => setLoadingSaved(false));
    }, [fetchProfile, t])
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
  }, [user?.kycStatus, user?.kycDocuments, user?.role]);

  const handleDeleteAccountConfirm = async () => {
    if (
      !user ||
      deleteEmailInput.trim().toLowerCase() !== user.email.toLowerCase()
    ) {
      Alert.alert(t('common.error'), t('profile.deleteAccountEmailMismatch'));
      return;
    }
    setIsDeletingAccount(true);
    try {
      await deleteAccountApi();
      setShowDeleteModal(false);
      Alert.alert(t('common.success'), t('profile.deleteAccountContactAdmin'), [
        { text: 'OK', onPress: () => logout() },
      ]);
    } catch (e) {
      Alert.alert(
        t('common.error'),
        e instanceof Error ? e.message : t('profile.deleteAccountFailed')
      );
    } finally {
      setIsDeletingAccount(false);
    }
  };

  if (!user) {
    return (
      <View className="bg-neutral-DEFAULT flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#72B866" />
        <Text className="font-body text-neutral-T50 dark:text-neutral-T60 mt-3 text-sm">
          {t('profile.loadingProfile')}
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

  // ─── KYC re-submission state (STORE only) ───
  const gracePeriodEndsAt = user.kycGracePeriodEndsAt
    ? new Date(user.kycGracePeriodEndsAt)
    : null;
  const isInGracePeriod =
    gracePeriodEndsAt !== null && new Date() < gracePeriodEndsAt;
  // null = không có grace period; 0 = đã hết hạn; >0 = còn N ngày
  const graceDaysLeft =
    gracePeriodEndsAt === null
      ? null
      : isInGracePeriod
        ? Math.ceil(
            (gracePeriodEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
          )
        : 0;
  const showKycResubmitButton =
    user.role === 'STORE' && user.pendingKycStatus !== 'PENDING';

  return (
    <View className="bg-neutral-DEFAULT dark:bg-neutral-T10 flex-1">
      {/* ── KYC Rejection Modal ── */}
      <Modal
        visible={showRejectionModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRejectionModal(false)}
      >
        <Pressable
          className="flex-1 items-center justify-center bg-black/45"
          onPress={() => setShowRejectionModal(false)}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View
              className="bg-neutral-T100 dark:bg-neutral-T20 mx-6 gap-4 rounded-3xl p-6"
              style={{ maxWidth: 340 }}
            >
              {/* Icon */}
              <View className="h-14 w-14 items-center justify-center self-center rounded-2xl bg-[rgba(186,26,26,0.1)] dark:bg-[rgba(186,26,26,0.18)]">
                <MaterialIcons name="gpp-bad" size={28} color="#ba1a1a" />
              </View>
              {/* Title */}
              <View className="gap-1">
                <Text className="text-neutral-T10 dark:text-neutral-T90 text-center font-sans text-lg font-bold">
                  {t('profile.kycRejectedTitle')}
                </Text>
                <Text className="font-body text-neutral-T50 dark:text-neutral-T60 text-center text-sm leading-5">
                  {t('profile.kycRejectedMsgPart1')}
                  <Text className="text-neutral-T30 dark:text-neutral-T80 font-semibold">
                    {t('profile.registerStore')}
                  </Text>
                  {t('profile.kycRejectedMsgPart2')}
                </Text>
              </View>
              {/* Action */}
              <TouchableOpacity
                className="h-12 items-center justify-center rounded-xl bg-[rgba(186,26,26,0.1)] dark:bg-[rgba(186,26,26,0.18)]"
                onPress={() => setShowRejectionModal(false)}
              >
                <Text className="font-label text-error font-semibold">
                  {t('common.gotIt')}
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── Delete Account Modal ── */}
      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => !isDeletingAccount && setShowDeleteModal(false)}
      >
        <Pressable
          className="flex-1 items-center justify-center bg-black/50"
          onPress={() => !isDeletingAccount && setShowDeleteModal(false)}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View
              className="bg-neutral-T100 dark:bg-neutral-T20 mx-6 gap-4 rounded-3xl p-6"
              style={{ maxWidth: 360 }}
            >
              <View className="h-14 w-14 items-center justify-center self-center rounded-2xl bg-[rgba(220,38,38,0.1)] dark:bg-[rgba(220,38,38,0.18)]">
                <MaterialIcons
                  name="delete-forever"
                  size={28}
                  color="#DC2626"
                />
              </View>
              <View className="gap-1">
                <Text className="text-neutral-T10 dark:text-neutral-T90 text-center font-sans text-lg font-bold">
                  {t('profile.deleteAccountTitle')}
                </Text>
                <Text className="font-body text-neutral-T50 dark:text-neutral-T60 text-center text-sm leading-5">
                  {t('profile.deleteAccountWarning')}
                </Text>
              </View>
              <View className="gap-1.5">
                <Text className="font-label text-neutral-T50 dark:text-neutral-T60 text-xs font-semibold uppercase tracking-wider">
                  {t('profile.deleteAccountConfirmMsg')}
                </Text>
                <TextInput
                  value={deleteEmailInput}
                  onChangeText={setDeleteEmailInput}
                  placeholder={t('profile.deleteAccountEmailPlaceholder')}
                  placeholderTextColor="#AAABAB"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  editable={!isDeletingAccount}
                  className="bg-neutral-T95 dark:bg-neutral-T30 font-body text-neutral-T10 dark:text-neutral-T90 border-neutral-T90 dark:border-neutral-T30 h-12 rounded-xl border px-4 text-sm"
                />
              </View>
              <View className="gap-2">
                {isDeletingAccount ? (
                  <TouchableOpacity
                    className="h-12 items-center justify-center rounded-xl bg-[rgba(220,38,38,0.3)]"
                    disabled
                  >
                    <ActivityIndicator color="#fff" />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    className="h-12 items-center justify-center rounded-xl bg-[#DC2626]"
                    onPress={handleDeleteAccountConfirm}
                    activeOpacity={0.85}
                  >
                    <Text className="font-label text-neutral-T100 font-semibold">
                      {t('profile.deleteAccount')}
                    </Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  className="bg-neutral-T95 dark:bg-neutral-T30 h-12 items-center justify-center rounded-xl"
                  onPress={() => {
                    setShowDeleteModal(false);
                    setDeleteEmailInput('');
                  }}
                  disabled={isDeletingAccount}
                  activeOpacity={0.8}
                >
                  <Text className="font-label text-neutral-T50 dark:text-neutral-T60 font-semibold">
                    {t('common.cancel')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <MainHeader />

      <TouchableOpacity className="px-6 pt-3" onPress={() => router.back()}>
        <Text className="font-bold text-slate-500 underline">
          {t('common.back')}
        </Text>
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
              pendingKycStatus={user.pendingKycStatus ?? null}
              graceDaysLeft={graceDaysLeft}
              isInGracePeriod={isInGracePeriod}
            />
          )}

          {/* KYC pending re-submission banner */}
          {user.role === 'STORE' && user.pendingKycStatus === 'PENDING' && (
            <View className="bg-secondary-T95 dark:bg-secondary-T20 border-secondary-T70 dark:border-secondary-T30 flex-row items-start gap-3 rounded-2xl border p-4">
              <MaterialIcons name="schedule" size={20} color="#6B5E00" />
              <Text className="font-body text-secondary-T30 dark:text-secondary-T80 flex-1 text-sm leading-5">
                {t('profile.kycResubmitPendingBanner')}
              </Text>
            </View>
          )}

          {/* Grace period warning banner */}
          {user.role === 'STORE' && isInGracePeriod && (
            <View className="flex-row items-start gap-3 rounded-2xl border border-[rgba(186,26,26,0.2)] bg-[rgba(186,26,26,0.08)] p-4 dark:border-[rgba(186,26,26,0.35)] dark:bg-[rgba(186,26,26,0.18)]">
              <MaterialIcons name="warning-amber" size={20} color="#ba1a1a" />
              <Text className="font-body text-error flex-1 text-sm leading-5">
                {t('profile.kycGracePeriodWarning', { days: graceDaysLeft })}
              </Text>
            </View>
          )}

          {/* KYC re-submit button (STORE only) */}
          {showKycResubmitButton && (
            <TouchableOpacity
              className="bg-secondary-T95 dark:bg-secondary-T20 border-secondary-T70 dark:border-secondary-T30 h-14 flex-row items-center justify-center gap-2 rounded-xl border active:scale-[0.98]"
              onPress={() => router.push('/(profile)/kyc-resubmit' as any)}
              activeOpacity={0.8}
            >
              <MaterialIcons name="verified-user" size={20} color="#6B5E00" />
              <Text className="font-label text-secondary-T40 font-semibold">
                {t('profile.kycResubmitBtn')}
              </Text>
            </TouchableOpacity>
          )}

          <BadgesRow
            badges={badgeList}
            total={badgeTotal}
            unlocked={badgeUnlocked}
            isLoading={badgesLoading}
            onSeeAll={() => router.push('/(profile)/badges' as any)}
          />

          <StatisticsCard />

          <RecentPosts posts={myPosts} />

          {/* ── Saved Posts ── */}
          <View
            className="bg-neutral-T100 dark:bg-neutral-T20 dark:border-neutral-T30 overflow-hidden rounded-2xl dark:border"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.06,
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            <View className="border-neutral-T95 dark:border-neutral-T30 flex-row items-center justify-between border-b px-4 py-3">
              <Text className="font-label text-neutral-T10 dark:text-neutral-T90 text-sm font-semibold">
                {t('profile.savedPosts')}
              </Text>
              {savedPosts.length > 0 && (
                <Text className="font-label text-neutral-T50 dark:text-neutral-T60 text-xs">
                  {t('profile.savedPostsCount', { count: savedPosts.length })}
                </Text>
              )}
            </View>

            {loadingSaved ? (
              <View className="items-center py-6">
                <ActivityIndicator size="small" color="#72B866" />
              </View>
            ) : savedPosts.length === 0 ? (
              <View className="items-center py-6">
                <Text className="font-body text-neutral-T50 dark:text-neutral-T60 text-sm">
                  {t('profile.noSavedPosts')}
                </Text>
              </View>
            ) : (
              <View>
                {savedPosts.map((post, idx) => (
                  <TouchableOpacity
                    key={post._id}
                    onPress={() =>
                      router.push({
                        pathname: '/(post)/post-detail' as any,
                        params: { id: post._id },
                      })
                    }
                    activeOpacity={0.75}
                    className={`flex-row items-center gap-3 px-4 py-3 ${idx < savedPosts.length - 1 ? 'border-neutral-T95 dark:border-neutral-T30 border-b' : ''}`}
                  >
                    {post.images?.[0] ? (
                      <Image
                        source={{ uri: post.images[0] }}
                        className="h-12 w-12 rounded-xl"
                        resizeMode="cover"
                      />
                    ) : (
                      <View className="bg-neutral-T95 dark:bg-neutral-T30 h-12 w-12 items-center justify-center rounded-xl">
                        <MaterialIcons
                          name="fastfood"
                          size={20}
                          color="#AAABAB"
                        />
                      </View>
                    )}
                    <View className="flex-1 gap-0.5">
                      <Text
                        className="font-label text-neutral-T10 dark:text-neutral-T90 text-sm font-semibold"
                        numberOfLines={1}
                      >
                        {post.title}
                      </Text>
                      <Text className="font-body text-neutral-T50 dark:text-neutral-T60 text-xs">
                        {post.type === 'P2P_FREE'
                          ? t('common.free')
                          : `${post.price.toLocaleString('vi-VN')}đ`}
                      </Text>
                    </View>
                    <MaterialIcons
                      name="chevron-right"
                      size={18}
                      color="#AAABAB"
                    />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* ── Appearance ── */}
          <View className="bg-neutral-T100 dark:bg-neutral-T20 dark:border-neutral-T30 rounded-2xl p-4 shadow-sm dark:border dark:shadow-none">
            <Text className="font-label text-neutral-T50 dark:text-neutral-T60 mb-3 text-xs font-semibold uppercase tracking-wider">
              {t('profile.settings')}
            </Text>
            <View className="flex-row items-center justify-between">
              <View className="flex-1 gap-0.5 pr-4">
                <Text className="font-body text-neutral-T10 dark:text-neutral-T90 text-sm font-semibold">
                  {t('profile.darkMode')}
                </Text>
                <Text className="font-body text-neutral-T50 dark:text-neutral-T60 text-xs leading-4">
                  {t('profile.darkModeDesc')}
                </Text>
              </View>
              <ThemeToggle />
            </View>
          </View>

          <ProfileActions
            onEditProfile={() => router.push('/(profile)/edit-profile')}
            onRegisterStore={() => router.push('/(profile)/register-store')}
            showRegisterStore={canRegisterStore}
            storeRegistrationPending={storeRegistrationPending}
            onDeleteAccount={() => {
              setDeleteEmailInput('');
              setShowDeleteModal(true);
            }}
          />
        </View>
      </ScrollView>
    </View>
  );
}
