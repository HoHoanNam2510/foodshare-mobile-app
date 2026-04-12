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
    <View className="flex-1 items-center justify-center bg-neutral-T90">
      <Ionicons name="map-outline" size={52} color="#9CA3AF" />
      <Text className="font-sans font-bold text-base text-neutral-T30 mt-4 text-center">
        Bản đồ chưa hỗ trợ trên iOS
      </Text>
      <Text className="font-body text-sm text-neutral-T50 mt-2 text-center px-10 leading-5">
        Tạm thời chưa hỗ trợ dịch vụ bản đồ trên thiết bị iOS. Vui lòng sử dụng Android để trải nghiệm tính năng này.
      </Text>
    </View>
  );
}
