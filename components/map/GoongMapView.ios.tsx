import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { Text, View } from 'react-native';

// HCM center fallback [lng, lat]
const HCM_CENTER: [number, number] = [106.6297, 10.8231];

interface GoongMapViewProps {
  children?: React.ReactNode;
  onUserLocation?: (coords: [number, number]) => void;
  centerCoordinate?: [number, number];
  zoomLevel?: number;
  onPress?: (coords: [number, number]) => void;
  interactive?: boolean;
}

// iOS placeholder — MapLibre requires native compilation (dev client).
// Running via Expo Go on iOS → show notice instead of crashing.
export default function GoongMapView({ onUserLocation }: GoongMapViewProps) {
  // Report HCM center so callers that depend on onUserLocation still function.
  useEffect(() => {
    onUserLocation?.(HCM_CENTER);
  }, []);

  return (
    <View className="bg-neutral-T90 flex-1 items-center justify-center">
      <Ionicons name="map-outline" size={52} color="#9CA3AF" />
      <Text className="text-neutral-T30 mt-4 text-center font-sans text-base font-bold">
        Bản đồ chưa hỗ trợ trên iOS
      </Text>
      <Text className="font-body text-neutral-T50 mt-2 px-10 text-center text-sm leading-5">
        Tạm thời chưa hỗ trợ dịch vụ bản đồ trên thiết bị iOS. Vui lòng sử dụng
        Android để trải nghiệm tính năng này.
      </Text>
    </View>
  );
}
