// app/_layout.tsx
import { useFonts } from 'expo-font';
import { Slot, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useAuthStore } from '@/stores/authStore';

// Import thư viện cấu hình Reanimated
import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from 'react-native-reanimated';

// Tắt chế độ cảnh báo Strict Mode
configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});

// Import các định dạng của Epilogue
import {
  Epilogue_400Regular,
  Epilogue_700Bold,
  Epilogue_800ExtraBold,
} from '@expo-google-fonts/epilogue';

// Import các định dạng của Be Vietnam Pro
import {
  BeVietnamPro_400Regular,
  BeVietnamPro_600SemiBold,
  BeVietnamPro_700Bold,
} from '@expo-google-fonts/be-vietnam-pro';
import './global.css';

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
  }, [token, isHydrated, segments]);
}

export default function RootLayout() {
  const hydrate = useAuthStore((s) => s.hydrate);
  const isHydrated = useAuthStore((s) => s.isHydrated);

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
  }, []);

  useEffect(() => {
    if ((fontsLoaded || error) && isHydrated) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, error, isHydrated]);

  useProtectedRoute();

  if (!fontsLoaded || !isHydrated) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <View className="flex-1 bg-neutral">
        <Slot />
      </View>
    </SafeAreaProvider>
  );
}
