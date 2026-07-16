import { Ionicons } from '@expo/vector-icons';
import {
  Camera,
  FillLayer,
  LineLayer,
  Logger,
  MapView,
  PointAnnotation,
  ShapeSource,
  setAccessToken,
} from '@maplibre/maplibre-react-native';
import type { CameraRef } from '@maplibre/maplibre-react-native';
import * as Location from 'expo-location';
import React, { useEffect, useRef, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { Feature, Geometry, GeoJsonProperties } from 'geojson';

// HCM city center fallback
const HCM_CENTER: [number, number] = [106.6297, 10.8231];

function makeCircleGeoJSON(center: [number, number], radiusMeters: number) {
  const steps = 64;
  const [lng, lat] = center;
  const earthRadius = 6371000;
  const latRad = (lat * Math.PI) / 180;
  const lngDelta =
    (radiusMeters / (earthRadius * Math.cos(latRad))) * (180 / Math.PI);
  const latDelta = (radiusMeters / earthRadius) * (180 / Math.PI);
  const coords: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const angle = (i / steps) * 2 * Math.PI;
    coords.push([
      lng + lngDelta * Math.cos(angle),
      lat + latDelta * Math.sin(angle),
    ]);
  }
  return {
    type: 'Feature' as const,
    geometry: { type: 'Polygon' as const, coordinates: [coords] },
    properties: {},
  };
}

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
  radius?: number;
}

export default function GoongMapView({
  children,
  onUserLocation,
  centerCoordinate,
  zoomLevel = 14,
  onPress,
  interactive = true,
  radius,
}: GoongMapViewProps) {
  const { t } = useTranslation();
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
  }, [onUserLocation]);

  const center = centerCoordinate ?? userCoords ?? HCM_CENTER;

  // Recall the camera to the user's original GPS location after panning away.
  const handleRecenter = () => {
    if (!userCoords) return;
    cameraRef.current?.setCamera({
      centerCoordinate: userCoords,
      zoomLevel,
      animationMode: 'flyTo',
      animationDuration: 600,
    });
  };

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

        {/* Radius boundary circle */}
        {userCoords && radius && (
          <ShapeSource
            id="radius-source"
            shape={makeCircleGeoJSON(userCoords, radius)}
          >
            <FillLayer
              id="radius-fill"
              style={{ fillColor: '#296C24', fillOpacity: 0.15 }}
            />
            <LineLayer
              id="radius-border"
              style={{
                lineColor: '#296C24',
                lineWidth: 2.5,
                lineOpacity: 0.8,
                lineDasharray: [4, 3],
              }}
            />
          </ShapeSource>
        )}

        {/* User location dot — outer ring + inner dot */}
        {userCoords && (
          <PointAnnotation id="user-location" coordinate={userCoords}>
            <View
              style={{
                width: 32,
                height: 32,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <View
                style={{
                  position: 'absolute',
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: 'rgba(41, 108, 36, 0.18)',
                  borderWidth: 1.5,
                  borderColor: 'rgba(41, 108, 36, 0.4)',
                }}
              />
              <View
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 7,
                  backgroundColor: '#296C24',
                  borderWidth: 2.5,
                  borderColor: '#fff',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4,
                  elevation: 5,
                }}
              />
            </View>
          </PointAnnotation>
        )}

        {children}
      </MapView>

      {/* My-location button — recall to the user's actual position */}
      {userCoords && (
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleRecenter}
          className="bg-neutral-T100 dark:bg-neutral-T20 absolute right-4 flex-row items-center gap-2 rounded-full px-4 py-2.5"
          style={{
            bottom: 200,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 4,
            elevation: 4,
          }}
        >
          <Ionicons name="locate" size={16} color="#296C24" />
          <Text className="font-label text-primary-T40 text-xs font-semibold">
            {t('explore.myLocation')}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
