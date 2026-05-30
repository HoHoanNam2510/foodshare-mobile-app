// app/(tabs)/_layout.tsx
import { Slot, useRouter, useSegments } from 'expo-router';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import CustomTabBar from '../../components/shared/CustomTabBar';
import SelectPostTypeModal from '../../components/shared/SelectPostTypeModal';
import { useAuthStore } from '../../stores/authStore';
import { updateUserLocation } from '@/lib/mapApi';

export default function TabLayout() {
  const router = useRouter();
  const segments = useSegments();
  const userRole = useAuthStore((s) => s.user?.role) ?? 'USER';
  const userId = useAuthStore((s) => s.user?._id);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        const { status } = await Location.getForegroundPermissionsAsync();
        if (status !== 'granted') return;
        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        await updateUserLocation(pos.coords.longitude, pos.coords.latitude);
      } catch {
        // silent — location update is best-effort
      }
    })();
  }, [userId]);

  const [isModalVisible, setModalVisible] = useState(false);

  const handleTabPress = (routeName: string) => {
    // Bắt tín hiệu hành động mở Modal
    if (routeName === 'ACTION_ADD') {
      setModalVisible(true);
    } else {
      // Các tab khác thì điều hướng bình thường
      router.push(routeName as any);
    }
  };

  // Do thư mục hiện tại là (tabs), URL (segments) sẽ có mảng dạng ['(tabs)', 'explore']
  // Chúng ta lấy segment ở vị trí index 1 để biết đang ở màn hình nào
  const currentSegment = (segments[1] as string) || '';

  let activeIndex = 0;
  if (currentSegment === 'explore') activeIndex = 1;
  else if (currentSegment === 'post') activeIndex = 3;
  else if (currentSegment === 'chat') activeIndex = 4;

  return (
    // FIX TÀNG HÌNH NỀN: Đổi bg-surface thành bg-neutral
    <View className="bg-neutral dark:bg-neutral-T10 flex-1">
      {/* Slot chứa nội dung các màn hình con nằm trong thư mục (tabs) */}
      <View className="flex-1">
        <Slot />
      </View>

      {/* Thanh Tab Bar tuỳ chỉnh luôn nằm ở dưới cùng */}
      <CustomTabBar onTabPress={handleTabPress} activeIndex={activeIndex} />

      {/* 3. Render Modal nằm đè lên trên tất cả */}
      <SelectPostTypeModal
        visible={isModalVisible}
        onClose={() => setModalVisible(false)}
        userRole={userRole}
      />
    </View>
  );
}
