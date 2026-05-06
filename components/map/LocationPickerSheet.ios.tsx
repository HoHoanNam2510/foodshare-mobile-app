import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface PickedLocation {
  coordinates: [number, number]; // [lng, lat]
  address: string;
}

interface LocationPickerSheetProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (location: PickedLocation) => void;
  initialCoords?: [number, number];
}

// iOS placeholder — MapLibre requires native compilation (dev client).
// Running via Expo Go on iOS → show notice instead of crashing.
export default function LocationPickerSheet({
  visible,
  onClose,
}: LocationPickerSheetProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View
        className="bg-neutral flex-1 items-center justify-center px-8"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        <Ionicons name="map-outline" size={64} color="#9CA3AF" />
        <Text className="text-neutral-T10 mt-5 text-center font-sans text-xl font-bold">
          Chưa hỗ trợ trên iOS
        </Text>
        <Text className="font-body text-neutral-T50 mt-3 text-center text-sm leading-6">
          Tính năng chọn vị trí trên bản đồ tạm thời chưa khả dụng trên thiết bị
          iOS.{'\n'}
          Vui lòng sử dụng Android để trải nghiệm đầy đủ tính năng này.
        </Text>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onClose}
          className="bg-primary-T40 mt-10 h-14 items-center justify-center rounded-2xl px-12"
        >
          <Text className="font-label text-neutral-T100 text-base font-semibold">
            Đóng
          </Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}
