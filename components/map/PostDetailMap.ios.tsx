import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface PostDetailMapProps {
  coordinates: [number, number]; // [lng, lat]
  onDirections: () => void;
}

// iOS placeholder — MapLibre requires native compilation (dev client).
// Still shows the "Chỉ đường" button since Linking.openURL works on iOS.
export default function PostDetailMap({ onDirections }: PostDetailMapProps) {
  return (
    <View
      className="bg-neutral-T90 rounded-2xl overflow-hidden items-center justify-center"
      style={{
        height: 180,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 12,
        elevation: 3,
      }}
    >
      <Ionicons name="map-outline" size={36} color="#9CA3AF" />
      <Text className="font-body text-sm text-neutral-T50 mt-2 text-center px-6">
        Tạm thời chưa hỗ trợ bản đồ trên iOS
      </Text>

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onDirections}
        style={{
          marginTop: 12,
          backgroundColor: '#296C24',
          borderRadius: 20,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 14,
          paddingVertical: 8,
        }}
      >
        <MaterialIcons name="directions" size={16} color="#fff" />
        <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700', marginLeft: 4 }}>
          Chỉ đường
        </Text>
      </TouchableOpacity>
    </View>
  );
}
