import {
  Camera,
  Logger,
  MapView,
  PointAnnotation,
  setAccessToken,
} from '@maplibre/maplibre-react-native';
import type { CameraRef } from '@maplibre/maplibre-react-native';
import * as Location from 'expo-location';
import React, { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import type { Feature, Geometry, GeoJsonProperties } from 'geojson';

// HCM city center fallback
const HCM_CENTER: [number, number] = [106.6297, 10.8231];

const GOONG_MAPTILES_KEY = process.env.EXPO_PUBLIC_GOONG_MAPTILES_KEY ?? '';

const TILE_STYLE_URL = `https://tiles.goong.io/assets/goong_map_web.json?api_key=${GOONG_MAPTILES_KEY}`;

setAccessToken(null);
// Suppress style parsing warnings from Goong's remote tile style JSON
Logger.setLogLevel('error');

interface GoongMapViewProps {
  children?: React.ReactNode;
  onUserLocation?: (coords: [number, number]) => void;
  centerCoordinate?: [number, number];
  zoomLevel?: number;
  onPress?: (coords: [number, number]) => void;
  interactive?: boolean;
}

export default function GoongMapView({
  children,
  onUserLocation,
  centerCoordinate,
  zoomLevel = 14,
  onPress,
  interactive = true,
}: GoongMapViewProps) {
  const cameraRef = useRef<CameraRef>(null);
  const [userCoords, setUserCoords] = useState<[number, number] | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        onUserLocation?.(HCM_CENTER);
        return;
      }
      try {
        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        const coords: [number, number] = [
          pos.coords.longitude,
          pos.coords.latitude,
        ];
        setUserCoords(coords);
        onUserLocation?.(coords);
      } catch {
        onUserLocation?.(HCM_CENTER);
      }
    })();
  }, []);

  const center = centerCoordinate ?? userCoords ?? HCM_CENTER;

  const handlePress = (feature: Feature<Geometry, GeoJsonProperties>) => {
    if (!onPress) return;
    const geo = feature?.geometry as { coordinates?: number[] } | undefined;
    const coords = geo?.coordinates;
    if (coords && coords.length >= 2) {
      onPress([coords[0], coords[1]]);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={{ flex: 1 }}
        mapStyle={TILE_STYLE_URL}
        compassEnabled={false}
        attributionEnabled={false}
        logoEnabled={false}
        scrollEnabled={interactive}
        zoomEnabled={interactive}
        rotateEnabled={false}
        onPress={onPress ? handlePress : undefined}
      >
        <Camera
          ref={cameraRef}
          centerCoordinate={center}
          zoomLevel={zoomLevel}
          animationMode="flyTo"
          animationDuration={600}
        />

        {/* User location dot */}
        {userCoords && (
          <PointAnnotation id="user-location" coordinate={userCoords}>
            <View
              style={{
                width: 16,
                height: 16,
                borderRadius: 8,
                backgroundColor: '#296C24',
                borderWidth: 2.5,
                borderColor: '#fff',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 4,
                elevation: 4,
              }}
            />
          </PointAnnotation>
        )}

        {children}
      </MapView>
    </View>
  );
}
