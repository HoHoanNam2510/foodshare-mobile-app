import { Feather, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Animated,
  Dimensions,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuthStore } from '@/stores/authStore';
import { useLanguageStore } from '@/stores/languageStore';
import { useMenuDrawerStore } from '@/stores/menuDrawerStore';
import ThemeToggle from '@/components/shared/ThemeToggle';
import { useThemeColors } from '@/lib/hooks/useThemeColors';

const DRAWER_WIDTH = Dimensions.get('window').width * 0.82;
const ANIM_DURATION_IN = 280;
const ANIM_DURATION_OUT = 220;

// ─── Types ───────────────────────────────────────────────────────────────────

interface MenuItemProps {
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  label: string;
  onPress: () => void;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function MenuItem({ icon, label, onPress }: MenuItemProps) {
  const colors = useThemeColors();
  return (
    <TouchableOpacity
      className="border-neutral-T90 dark:border-neutral-T30 flex-row items-center gap-4 border-b py-4 active:opacity-70"
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View className="bg-primary-T95 dark:bg-primary-T20 h-9 w-9 items-center justify-center rounded-xl">
        <MaterialIcons name={icon} size={18} color={colors.primaryGreen} />
      </View>
      <Text className="font-body text-neutral-T10 dark:text-neutral-T90 flex-1 text-base font-semibold">
        {label}
      </Text>
      <Feather name="chevron-right" size={16} color="#AAABAB" />
    </TouchableOpacity>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const ROLE_BADGE: Record<
  string,
  { containerClass: string; textClass: string }
> = {
  USER: {
    containerClass: 'bg-secondary-T90 dark:bg-secondary-T20',
    textClass: 'text-secondary-T10 dark:text-secondary-T90',
  },
  STORE: {
    containerClass: 'bg-primary-T90 dark:bg-primary-T20',
    textClass: 'text-primary-T10 dark:text-primary-T90',
  },
  ADMIN: { containerClass: 'bg-neutral-T20', textClass: 'text-neutral-T100' },
};

export default function MenuDrawer() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { isOpen, close } = useMenuDrawerStore();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const language = useLanguageStore((s) => s.language);
  const toggleLanguage = useLanguageStore((s) => s.toggleLanguage);
  const colors = useThemeColors();

  const [modalVisible, setModalVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Open: show modal then animate in
  useEffect(() => {
    if (isOpen) {
      setModalVisible(true);
    }
  }, [isOpen]);

  const animateIn = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: ANIM_DURATION_IN,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: ANIM_DURATION_IN,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -DRAWER_WIDTH,
        duration: ANIM_DURATION_OUT,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: ANIM_DURATION_OUT,
        useNativeDriver: true,
      }),
    ]).start(() => {
      close();
      setModalVisible(false);
      slideAnim.setValue(-DRAWER_WIDTH);
      fadeAnim.setValue(0);
    });
  };

  const navigate = (href: string) => {
    handleClose();
    // Small delay so the close animation starts before navigating
    setTimeout(() => router.push(href as any), 80);
  };

  const handleLogout = async () => {
    handleClose();
    await logout();
  };

  const isStore = user?.role === 'STORE';
  const roleBadge = ROLE_BADGE[user?.role ?? 'USER'];

  return (
    <Modal
      visible={modalVisible}
      transparent
      animationType="none"
      statusBarTranslucent
      onShow={animateIn}
      onRequestClose={handleClose}
    >
      {/* Backdrop */}
      <Animated.View
        className="absolute inset-0"
        style={{ backgroundColor: 'rgba(0,0,0,0.45)', opacity: fadeAnim }}
        pointerEvents="none"
      />
      <Pressable
        className="flex-1"
        onPress={handleClose}
        style={{ position: 'absolute', inset: 0 }}
      />

      {/* Drawer Panel */}
      <Animated.View
        className="bg-neutral-T100 dark:bg-neutral-T20 dark:border-neutral-T30 absolute bottom-0 left-0 top-0 shadow-lg dark:border-r dark:shadow-none"
        style={{
          width: DRAWER_WIDTH,
          transform: [{ translateX: slideAnim }],
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        }}
      >
        {/* ── Header ── */}
        <View className="flex-row items-center px-5 pb-4 pt-3">
          <Text
            className="text-primary-T40 font-sans text-lg"
            style={{ fontWeight: '700', letterSpacing: -0.3 }}
          >
            FoodShare
          </Text>
          <View className="flex-1" />
          <TouchableOpacity
            className="bg-neutral-T95 dark:bg-neutral-T30 h-9 w-9 items-center justify-center rounded-full active:opacity-70"
            onPress={handleClose}
          >
            <Feather name="x" size={18} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* ── User Identity ── */}
        <View className="flex-row items-center gap-3 px-5 pb-5">
          <View className="border-neutral-T80 dark:border-neutral-T30 bg-neutral-T95 dark:bg-neutral-T30 h-14 w-14 items-center justify-center overflow-hidden rounded-full border">
            {user?.avatar ? (
              <Image
                source={{ uri: user.avatar }}
                className="h-full w-full"
                resizeMode="cover"
              />
            ) : (
              <MaterialIcons name="person" size={26} color="#757777" />
            )}
          </View>
          <View className="flex-1">
            <Text
              className="text-neutral-T10 dark:text-neutral-T90 font-sans text-base"
              style={{ fontWeight: '700' }}
              numberOfLines={1}
            >
              {user?.fullName ?? '—'}
            </Text>
            <View
              className={`mt-1 self-start rounded-full px-2.5 py-0.5 ${roleBadge.containerClass}`}
            >
              <Text
                className={`font-label text-[10px] font-bold ${roleBadge.textClass}`}
              >
                {t(`roles.${user?.role ?? 'USER'}`)}
              </Text>
            </View>
          </View>
          {/* Language toggle (right-aligned, opposite the avatar block) */}
          <TouchableOpacity
            className="bg-primary-T95 dark:bg-primary-T20 border-primary-T90 dark:border-primary-T30 h-9 flex-row items-center rounded-full border px-3 active:opacity-70"
            onPress={toggleLanguage}
            accessibilityLabel="Toggle language"
          >
            <MaterialIcons
              name="language"
              size={16}
              color={colors.primaryGreen}
            />
            <Text
              className="font-label text-primary-T20 dark:text-primary-T80 ml-1.5 text-xs font-bold"
              style={{ letterSpacing: 0.5 }}
            >
              {language === 'vi' ? 'VI' : 'EN'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Divider ── */}
        <View className="bg-neutral-T90 dark:bg-neutral-T30 mx-5 h-px" />

        {/* ── Menu Items ── */}
        <ScrollView
          className="flex-1 px-5"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 8 }}
        >
          {/* Section label */}
          <Text className="font-label text-neutral-T50 dark:text-neutral-T60 mb-1 mt-3 text-xs font-semibold uppercase tracking-wider">
            {t('menu.menu')}
          </Text>

          <MenuItem
            icon="receipt-long"
            label={t('menu.myTransactions')}
            onPress={() => navigate('/(transaction)/transaction-list')}
          />
          <MenuItem
            icon="star"
            label={t('menu.myReviews')}
            onPress={() => navigate('/(review)/my-reviews')}
          />
          <MenuItem
            icon="flag"
            label={t('menu.myReports')}
            onPress={() => navigate('/(report)/my-reports')}
          />
          {isStore && (
            <MenuItem
              icon="confirmation-number"
              label={t('menu.manageVouchers')}
              onPress={() => navigate('/(voucher)/store-vouchers')}
            />
          )}
          <MenuItem
            icon="local-offer"
            label={t('menu.myVouchers')}
            onPress={() => navigate('/(voucher)/my-vouchers')}
          />
          <MenuItem
            icon="bar-chart"
            label={t('menu.statistics')}
            onPress={() => navigate('/(statistics)/statistics')}
          />
          <MenuItem
            icon="delete"
            label={t('menu.myTrash')}
            onPress={() => navigate('/(trash)/trash')}
          />
          <MenuItem
            icon="history"
            label={t('menu.pointHistory')}
            onPress={() => navigate('/(voucher)/point-history')}
          />
          <MenuItem
            icon="leaderboard"
            label={t('menu.leaderboard')}
            onPress={() => navigate('/(leaderboard)/leaderboard')}
          />
          <MenuItem
            icon="feedback"
            label={t('menu.helpAndFeedback')}
            onPress={() => navigate('/(feedback)/feedback-history')}
          />
        </ScrollView>

        {/* ── Appearance ── */}
        <View className="px-5 py-3">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <View className="bg-primary-T95 dark:bg-primary-T20 h-9 w-9 items-center justify-center rounded-xl">
                <Feather name="moon" size={16} color={colors.primaryGreen} />
              </View>
              <Text className="font-body text-neutral-T10 dark:text-neutral-T90 text-base font-semibold">
                {t('profile.darkMode')}
              </Text>
            </View>
            <ThemeToggle />
          </View>
        </View>

        {/* ── Logout (pinned to bottom) ── */}
        <View className="border-neutral-T90 dark:border-neutral-T30 border-t px-5 pt-3">
          <TouchableOpacity
            className="h-14 flex-row items-center justify-center gap-2.5 rounded-xl border border-red-200 bg-red-50 active:scale-[0.98] dark:border-red-900 dark:bg-red-950"
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <MaterialIcons name="logout" size={20} color="#ba1a1a" />
            <Text className="font-label text-error font-semibold">
              {t('auth.logout')}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
}
