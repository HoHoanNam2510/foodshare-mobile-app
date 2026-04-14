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
import MenuDrawer from '@/components/shared/MenuDrawer';
import BadgeUnlockToast from '@/components/shared/BadgeUnlockToast';
import { getBadgeCatalogApi, type IBadge } from '@/lib/badgeApi';
import './global.css';

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

  const [toastBadge, setToastBadge] = useState<IBadge | null>(null);
  const unlockedBadgeIdsRef = useRef<Set<string>>(new Set());
  const toastHideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
  }, [hydrate]);

  useEffect(() => {
    if ((fontsLoaded || error) && isHydrated) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, error, isHydrated]);

  useProtectedRoute();

  useEffect(() => {
    if (!token) {
      unlockedBadgeIdsRef.current = new Set();
      setToastBadge(null);
      return;
    }

    const checkNewBadges = async () => {
      try {
        const res = await getBadgeCatalogApi();
        const unlocked = res.data.badges.filter((b) => b.isUnlocked);
        const nextSet = new Set(unlocked.map((b) => b._id));

        if (unlockedBadgeIdsRef.current.size > 0) {
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
      } catch {
        // ignore toast polling errors
      }
    };

    checkNewBadges();

    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        checkNewBadges();
      }
    });

    const timer = setInterval(checkNewBadges, 45000);

    return () => {
      sub.remove();
      clearInterval(timer);
      if (toastHideTimerRef.current) {
        clearTimeout(toastHideTimerRef.current);
      }
    };
  }, [token]);

  if (!fontsLoaded || !isHydrated) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <View className="flex-1 bg-neutral">
        <Slot />
        <BadgeUnlockToast
          badge={toastBadge}
          onDismiss={() => {
            if (toastHideTimerRef.current) clearTimeout(toastHideTimerRef.current);
            setToastBadge(null);
          }}
        />
      </View>
      <MenuDrawer />
    </SafeAreaProvider>
  );
}
