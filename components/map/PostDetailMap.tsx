// TypeScript resolution fallback — Metro bundler uses PostDetailMap.android.tsx
// or PostDetailMap.ios.tsx at runtime based on platform.
import {
  Camera,
  MapView,
  PointAnnotation,
  setAccessToken,
} from '@maplibre/maplibre-react-native';
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

const GOONG_MAPTILES_KEY = process.env.EXPO_PUBLIC_GOONG_MAPTILES_KEY ?? '';
const TILE_STYLE_URL = `https://tiles.goong.io/assets/goong_map_web.json?api_key=${GOONG_MAPTILES_KEY}`;

setAccessToken(null);

interface PostDetailMapProps {
  coordinates: [number, number]; // [lng, lat]
  onDirections: () => void;
}

export default function PostDetailMap({ coordinates, onDirections }: PostDetailMapProps) {
  return (
    <View
      className="bg-neutral-T100 rounded-2xl overflow-hidden"
      style={{
        height: 180,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 12,
        elevation: 3,
      }}
    >
      <MapView
        style={{ flex: 1 }}
        mapStyle={TILE_STYLE_URL}
        compassEnabled={false}
        attributionEnabled={false}
        logoEnabled={false}
        scrollEnabled={false}
        zoomEnabled={false}
        rotateEnabled={false}
      >
        <Camera
          centerCoordinate={coordinates}
          zoomLevel={15}
          animationDuration={0}
        />
        <PointAnnotation id="post-pin" coordinate={coordinates}>
          <View
            style={{
              width: 16,
              height: 16,
              borderRadius: 8,
              backgroundColor: '#296C24',
              borderWidth: 2.5,
              borderColor: '#fff',
              elevation: 4,
            }}
          />
        </PointAnnotation>
      </MapView>

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onDirections}
        style={{
          position: 'absolute',
          bottom: 10,
          right: 10,
          backgroundColor: '#296C24',
          borderRadius: 20,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 14,
          paddingVertical: 8,
          elevation: 4,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
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
