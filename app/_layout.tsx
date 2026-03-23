// app/_layout.tsx
import { useFonts } from 'expo-font';
import { Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

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
      <View className="flex-1 bg-surface">
        {/* Slot này sẽ render ra (tabs) hoặc (post) tùy vào URL hiện tại */}
        <Slot />
      </View>
    </SafeAreaProvider>
  );
}
