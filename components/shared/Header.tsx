import { Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Image, Platform, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** ── Header ── */
export default function Header() {
  // Lấy chính xác khoảng cách an toàn của thiết bị (tai thỏ, dynamic island, status bar)
  const insets = useSafeAreaInsets();

  const content = (
    <View className="flex-row items-center justify-between px-6 pb-4">
      <TouchableOpacity className="w-9 h-9 items-center justify-center">
        <Feather name="menu" size={22} color="#191c1c" />
      </TouchableOpacity>

      <Text
        className="text-base font-sans tracking-tight text-primary-dark"
        style={{ fontWeight: '700', letterSpacing: -0.3 }}
      >
        The Editorial Harvest
      </Text>

      <View className="flex-row items-center gap-3">
        <TouchableOpacity className="w-9 h-9 items-center justify-center">
          <Feather name="bell" size={20} color="#191c1c" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Image
            source={{ uri: 'https://i.pravatar.cc/60?img=33' }}
            className="w-9 h-9 rounded-full"
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  // Fallback an toàn: Nếu expo-blur vẫn lỗi, bạn có thể comment đoạn if này lại
  // và chỉ dùng return bên dưới để app không bị crash.
  if (Platform.OS === 'ios') {
    return (
      <BlurView
        intensity={70}
        tint="light"
        className="absolute top-0 left-0 right-0 z-10"
        // Cộng thêm paddingTop bằng đúng khoảng insets.top của thiết bị
        style={{ paddingTop: insets.top > 0 ? insets.top + 10 : 44 }}
      >
        {content}
      </BlurView>
    );
  }

  return (
    <View
      className="bg-surface/95 absolute top-0 left-0 right-0 z-10"
      style={{ paddingTop: insets.top > 0 ? insets.top + 10 : 44 }}
    >
      {content}
    </View>
  );
}
