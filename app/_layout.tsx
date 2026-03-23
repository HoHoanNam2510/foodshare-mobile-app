// app/_layout.tsx
import { useFonts } from 'expo-font';
import { Slot, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import CustomTabBar from '../components/shared/CustomTabBar';

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

// Ngăn màn hình splash ẩn đi quá sớm
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();

  const [fontsLoaded, error] = useFonts({
    Epilogue: Epilogue_700Bold,
    'Be Vietnam Pro': BeVietnamPro_400Regular,
    'Epilogue-Regular': Epilogue_400Regular,
    'Epilogue-ExtraBold': Epilogue_800ExtraBold,
    'BeVietnamPro-SemiBold': BeVietnamPro_600SemiBold,
    'BeVietnamPro-Bold': BeVietnamPro_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || error) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, error]);

  if (!fontsLoaded && !error) {
    return null;
  }

  // Handle chuyển đổi route khi bấm Tab
  const handleTabPress = (routeName: string) => {
    router.replace(routeName as any);
  };

  // Xác định tab nào đang active dựa trên URL hiện tại (segments)
  let activeIndex = 0;
  const currentSegment = segments[0] as string; // Ép kiểu về string

  if (currentSegment === 'explore') activeIndex = 1;
  else if (currentSegment === 'CreatePostP2P') activeIndex = 2;
  else if (currentSegment === 'chat') activeIndex = 3;
  else if (currentSegment === 'profile') activeIndex = 4;

  return (
    <SafeAreaProvider>
      <View className="flex-1 bg-surface">
        {/* Slot chứa nội dung các màn hình */}
        <View className="flex-1">
          <Slot />
        </View>

        {/* Thanh Tab Bar tuỳ chỉnh luôn nằm ở dưới cùng */}
        <CustomTabBar onTabPress={handleTabPress} activeIndex={activeIndex} />
      </View>
    </SafeAreaProvider>
  );
}
