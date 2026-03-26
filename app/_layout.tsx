// app/_layout.tsx
import { useFonts } from 'expo-font';
import { Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Import thư viện cấu hình Reanimated
import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from 'react-native-reanimated';

// Tắt chế độ cảnh báo Strict Mode
configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false, // <-- Dòng này sẽ làm warning biến mất vĩnh viễn
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

export default function RootLayout() {
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

  return (
    <SafeAreaProvider>
      <View className="flex-1 bg-neutral">
        <Slot />
      </View>
    </SafeAreaProvider>
  );
}
