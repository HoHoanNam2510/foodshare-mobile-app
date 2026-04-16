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
  return (
    <TouchableOpacity
      className="flex-row items-center gap-4 py-4 border-b border-neutral-T90 active:opacity-70"
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View className="w-9 h-9 rounded-xl bg-primary-T95 items-center justify-center">
        <MaterialIcons name={icon} size={18} color="#296C24" />
      </View>
      <Text className="flex-1 font-body text-base text-neutral-T10 font-semibold">
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
  USER: { containerClass: 'bg-secondary-T90', textClass: 'text-secondary-T10' },
  STORE: { containerClass: 'bg-primary-T90', textClass: 'text-primary-T10' },
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
        className="absolute top-0 bottom-0 left-0 bg-neutral-T100 shadow-lg"
        style={{
          width: DRAWER_WIDTH,
          transform: [{ translateX: slideAnim }],
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        }}
      >
        {/* ── Header ── */}
        <View className="px-5 pt-3 pb-4 flex-row items-center">
          <Text
            className="text-lg font-sans text-primary-T40"
            style={{ fontWeight: '700', letterSpacing: -0.3 }}
          >
            FoodShare
          </Text>
          <View className="flex-1" />
          <TouchableOpacity
            className="w-9 h-9 rounded-full bg-neutral-T95 items-center justify-center active:opacity-70"
            onPress={handleClose}
          >
            <Feather name="x" size={18} color="#191C1C" />
          </TouchableOpacity>
        </View>

        {/* ── User Identity ── */}
        <View className="px-5 pb-5 flex-row items-center gap-3">
          <View className="w-14 h-14 rounded-full overflow-hidden border border-neutral-T80 bg-neutral-T95 items-center justify-center">
            {user?.avatar ? (
              <Image
                source={{ uri: user.avatar }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <MaterialIcons name="person" size={26} color="#757777" />
            )}
          </View>
          <View className="flex-1">
            <Text
              className="font-sans text-neutral-T10 text-base"
              style={{ fontWeight: '700' }}
              numberOfLines={1}
            >
              {user?.fullName ?? '—'}
            </Text>
            <View
              className={`self-start mt-1 px-2.5 py-0.5 rounded-full ${roleBadge.containerClass}`}
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
            className="flex-row items-center px-3 h-9 rounded-full bg-primary-T95 border border-primary-T90 active:opacity-70"
            onPress={toggleLanguage}
            accessibilityLabel="Toggle language"
          >
            <MaterialIcons name="language" size={16} color="#296C24" />
            <Text
              className="ml-1.5 font-label text-xs font-bold text-primary-T20"
              style={{ letterSpacing: 0.5 }}
            >
              {language === 'vi' ? 'VI' : 'EN'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Divider ── */}
        <View className="h-px bg-neutral-T90 mx-5" />

        {/* ── Menu Items ── */}
        <ScrollView
          className="flex-1 px-5"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 8 }}
        >
          {/* Section label */}
          <Text className="font-label text-xs font-semibold text-neutral-T50 tracking-wider uppercase mt-3 mb-1">
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
            icon="history"
            label={t('menu.pointHistory')}
            onPress={() => navigate('/(voucher)/point-history')}
          />
          <MenuItem
            icon="leaderboard"
            label={t('menu.leaderboard')}
            onPress={() => navigate('/(leaderboard)/leaderboard')}
          />
        </ScrollView>

        {/* ── Logout (pinned to bottom) ── */}
        <View className="px-5 pt-3 border-t border-neutral-T90">
          <TouchableOpacity
            className="h-14 rounded-xl bg-red-50 border border-red-200 flex-row items-center justify-center gap-2.5 active:scale-[0.98]"
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <MaterialIcons name="logout" size={20} color="#ba1a1a" />
            <Text className="font-label font-semibold text-error">
              {t('auth.logout')}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
}
