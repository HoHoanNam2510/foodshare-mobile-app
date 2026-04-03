import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** ── Header ── */
export default function Header() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View
      className="bg-neutral-T100 absolute top-0 left-0 right-0 z-10 shadow-sm"
      style={{ paddingTop: insets.top > 0 ? insets.top + 10 : 44 }}
    >
      <View className="flex-row items-center justify-between px-5 pb-3">
        <TouchableOpacity className="w-10 h-10 rounded-full bg-neutral-T95 items-center justify-center active:opacity-80">
          <Feather name="menu" size={20} color="#191C1C" />
        </TouchableOpacity>

        <View className="flex-row items-center gap-2">
          <Image
            source={require('../../assets/images/logo.png')}
            style={{ width: 28, height: 28 }}
            resizeMode="contain"
          />
          <Text
            className="text-lg font-sans tracking-tight text-primary-T40"
            style={{ fontWeight: '700', letterSpacing: -0.3 }}
          >
            FoodShare
          </Text>
        </View>

        <View className="flex-row items-center gap-2.5">
          <TouchableOpacity className="w-10 h-10 rounded-full bg-neutral-T95 items-center justify-center active:opacity-80">
            <Feather name="bell" size={19} color="#191C1C" />
          </TouchableOpacity>
          <TouchableOpacity
            className="active:opacity-80"
            onPress={() => router.push('/profile')}
          >
            <Image
              source={{ uri: 'https://i.pravatar.cc/60?img=33' }}
              className="w-10 h-10 rounded-full border border-neutral-T90"
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
