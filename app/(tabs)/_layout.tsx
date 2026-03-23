// app/(tabs)/_layout.tsx
import { Slot, useRouter, useSegments } from 'expo-router';
import { View } from 'react-native';
import CustomTabBar from '../../components/shared/CustomTabBar';

export default function TabLayout() {
  const router = useRouter();
  const segments = useSegments();

  const handleTabPress = (routeName: string) => {
    router.push(routeName as any);
  };

  // Do thư mục hiện tại là (tabs), URL (segments) sẽ có mảng dạng ['(tabs)', 'explore']
  // Chúng ta lấy segment ở vị trí index 1 để biết đang ở màn hình nào
  const currentSegment = (segments[1] as string) || '';

  let activeIndex = 0;
  if (currentSegment === 'explore') activeIndex = 1;
  // Bỏ logic check CreatePostP2P ở đây vì khi bấm nút Add, nó sẽ văng ra khỏi (tabs)
  else if (currentSegment === 'chat') activeIndex = 3;
  else if (currentSegment === 'profile') activeIndex = 4;

  return (
    <View className="flex-1 bg-surface">
      {/* Slot chứa nội dung các màn hình con nằm trong thư mục (tabs) */}
      <View className="flex-1">
        <Slot />
      </View>

      {/* Thanh Tab Bar tuỳ chỉnh luôn nằm ở dưới cùng */}
      <CustomTabBar onTabPress={handleTabPress} activeIndex={activeIndex} />
    </View>
  );
}
