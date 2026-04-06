// app/(tabs)/_layout.tsx
import { Slot, useRouter, useSegments } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';
import CustomTabBar from '../../components/shared/CustomTabBar';
import SelectPostTypeModal from '../../components/shared/SelectPostTypeModal';
import { useAuthStore } from '../../stores/authStore';

export default function TabLayout() {
  const router = useRouter();
  const segments = useSegments();
  const userRole = useAuthStore((s) => s.user?.role) ?? 'USER';

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
  else if (currentSegment === 'chat') activeIndex = 3;
  else if (currentSegment === 'profile') activeIndex = 4;

  return (
    // FIX TÀNG HÌNH NỀN: Đổi bg-surface thành bg-neutral
    <View className="flex-1 bg-neutral">
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
