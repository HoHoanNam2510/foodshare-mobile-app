// app/_layout.tsx
import { useFonts } from 'expo-font';
import { Slot, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import {
  Epilogue_400Regular,
  Epilogue_700Bold,
  Epilogue_800ExtraBold,
} from '@expo-google-fonts/epilogue';
import {
  BeVietnamPro_400Regular,
  BeVietnamPro_600SemiBold,
  BeVietnamPro_700Bold,
} from '@expo-google-fonts/be-vietnam-pro';
import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from 'react-native-reanimated';
import { useEffect, useRef, useState } from 'react';
import { AppState, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useAuthStore } from '@/stores/authStore';
import { useLanguageStore } from '@/stores/languageStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { useThemeStore } from '@/stores/themeStore';
import MenuDrawer from '@/components/shared/MenuDrawer';
import BadgeUnlockToast from '@/components/shared/BadgeUnlockToast';
import OfflineBanner from '@/components/shared/OfflineBanner';
import { getBadgeCatalogApi, type IBadge } from '@/lib/badgeApi';
import { connectSocket, subscribeToNotifications } from '@/lib/socket';
import type { INotification } from '@/lib/notificationApi';
import {
  registerForPushNotificationsAsync,
  savePushTokenToServer,
  setupNotificationHandler,
} from '@/lib/pushNotifications';

import '@/lib/i18n';
import './global.css';

setupNotificationHandler();

// Tắt chế độ cảnh báo Strict Mode
configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});

SplashScreen.preventAutoHideAsync();

function useProtectedRoute() {
  const { token, isHydrated } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isHydrated) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!token && !inAuthGroup) {
      router.replace('/(auth)/login' as never);
    } else if (token && inAuthGroup) {
      router.replace('/(tabs)/home' as never);
    }
  }, [token, isHydrated, segments, router]);
}

export default function RootLayout() {
  const hydrate = useAuthStore((s) => s.hydrate);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const token = useAuthStore((s) => s.token);
  const hydrateLanguage = useLanguageStore((s) => s.hydrate);
  const isLanguageHydrated = useLanguageStore((s) => s.isHydrated);
  const hydrateTheme = useThemeStore((s) => s.hydrate);
  const isThemeHydrated = useThemeStore((s) => s.isHydrated);
  const addNotification = useNotificationStore((s) => s.addNotification);
  const fetchUnreadCount = useNotificationStore((s) => s.fetchUnreadCount);
  const resetNotifications = useNotificationStore((s) => s.reset);

  const [toastBadge, setToastBadge] = useState<IBadge | null>(null);
  const unlockedBadgeIdsRef = useRef<Set<string>>(new Set());
  const initialBadgeLoadDoneRef = useRef(false);
  const toastHideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const checkNewBadgesRef = useRef<(() => Promise<void>) | null>(null);

  const [fontsLoaded, error] = useFonts({
    Epilogue: Epilogue_700Bold,
    'Be Vietnam Pro': BeVietnamPro_400Regular,
    'Epilogue-Regular': Epilogue_400Regular,
    'Epilogue-ExtraBold': Epilogue_800ExtraBold,
    'BeVietnamPro-SemiBold': BeVietnamPro_600SemiBold,
    'BeVietnamPro-Bold': BeVietnamPro_700Bold,
  });

  useEffect(() => {
    hydrate();
    hydrateLanguage();
    hydrateTheme();
  }, [hydrate, hydrateLanguage, hydrateTheme]);

  useEffect(() => {
    if (
      (fontsLoaded || error) &&
      isHydrated &&
      isLanguageHydrated &&
      isThemeHydrated
    ) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, error, isHydrated, isLanguageHydrated, isThemeHydrated]);

  useProtectedRoute();

  useEffect(() => {
    if (!token) {
      unlockedBadgeIdsRef.current = new Set();
      initialBadgeLoadDoneRef.current = false;
      setToastBadge(null);
      return;
    }

    const checkNewBadges = async () => {
      try {
        const res = await getBadgeCatalogApi();

        const unlocked = res.data.badges.filter((b) => b.isUnlocked);
        const nextSet = new Set(unlocked.map((b) => b._id));

        if (initialBadgeLoadDoneRef.current) {
          const newOnes = unlocked.filter(
            (b) => !unlockedBadgeIdsRef.current.has(b._id)
          );
          if (newOnes.length > 0) {
            setToastBadge(newOnes[0]);
            if (toastHideTimerRef.current) {
              clearTimeout(toastHideTimerRef.current);
            }
            toastHideTimerRef.current = setTimeout(
              () => setToastBadge(null),
              5000
            );
          }
        }

        unlockedBadgeIdsRef.current = nextSet;
        initialBadgeLoadDoneRef.current = true;
      } catch {
        // ignore toast polling errors
      }
    };

    checkNewBadgesRef.current = checkNewBadges;
    checkNewBadges();

    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        checkNewBadges();
      }
    });

    return () => {
      sub.remove();
      if (toastHideTimerRef.current) {
        clearTimeout(toastHideTimerRef.current);
      }
    };
  }, [token]);

  // Socket connection + notification subscription
  useEffect(() => {
    if (!token) {
      resetNotifications();
      return;
    }

    let unsubscribe: (() => void) | undefined;

    const setup = async () => {
      try {
        await connectSocket();
        unsubscribe = subscribeToNotifications((raw) => {
          const notification = raw as INotification;
          addNotification(notification);
          if (
            notification.type === 'SYSTEM' &&
            notification.title === 'Huy hiệu mới!'
          ) {
            checkNewBadgesRef.current?.();
          }
        });
        fetchUnreadCount();

        // Đăng ký Expo Push Token và lưu lên server
        const pushToken = await registerForPushNotificationsAsync();
        if (pushToken) {
          await savePushTokenToServer(pushToken);
        }
      } catch {
        // ignore socket/push errors
      }
    };

    setup();

    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') fetchUnreadCount();
    });

    return () => {
      unsubscribe?.();
      sub.remove();
    };
  }, [token, addNotification, fetchUnreadCount, resetNotifications]);

  if (!fontsLoaded || !isHydrated || !isLanguageHydrated || !isThemeHydrated) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <View className="bg-neutral dark:bg-neutral-T10 flex-1">
        <OfflineBanner />
        <Slot />
        <BadgeUnlockToast
          badge={toastBadge}
          onDismiss={() => {
            if (toastHideTimerRef.current)
              clearTimeout(toastHideTimerRef.current);
            setToastBadge(null);
          }}
        />
      </View>
      <MenuDrawer />
    </SafeAreaProvider>
  );
}
