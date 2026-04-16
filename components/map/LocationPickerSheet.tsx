import {
  Camera,
  MapView,
  PointAnnotation,
  setAccessToken,
} from '@maplibre/maplibre-react-native';
import type { CameraRef } from '@maplibre/maplibre-react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Feature, Geometry, GeoJsonProperties } from 'geojson';

import AddressAutocomplete from './AddressAutocomplete';
import { reverseGeocode } from '@/lib/mapApi';
import { useTranslation } from 'react-i18next';

// HCM center fallback
const HCM_CENTER: [number, number] = [106.6297, 10.8231];

const GOONG_MAPTILES_KEY = process.env.EXPO_PUBLIC_GOONG_MAPTILES_KEY ?? '';
const TILE_STYLE_URL = `https://tiles.goong.io/assets/goong_map_web.json?api_key=${GOONG_MAPTILES_KEY}`;

setAccessToken(null);

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

export default function LocationPickerSheet({
  visible,
  onClose,
  onConfirm,
  initialCoords,
}: LocationPickerSheetProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const cameraRef = useRef<CameraRef>(null);

  const [pinCoords, setPinCoords] = useState<[number, number]>(
    initialCoords ?? HCM_CENTER
  );
  const [address, setAddress] = useState('');
  const [resolving, setResolving] = useState(false);

  // On open: attempt GPS, then reverse geocode
  useEffect(() => {
    if (!visible) return;
    if (initialCoords) {
      setPinCoords(initialCoords);
      resolveAddress(initialCoords[1], initialCoords[0]);
      return;
    }
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        try {
          const pos = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          const coords: [number, number] = [
            pos.coords.longitude,
            pos.coords.latitude,
          ];
          setPinCoords(coords);
          resolveAddress(pos.coords.latitude, pos.coords.longitude);
          return;
        } catch {
          // fall through to HCM center
        }
      }
      setPinCoords(HCM_CENTER);
      resolveAddress(HCM_CENTER[1], HCM_CENTER[0]);
    })();
  }, [visible]);

  const resolveAddress = async (lat: number, lng: number) => {
    setResolving(true);
    try {
      const addr = await reverseGeocode(lat, lng);
      setAddress(addr ?? '');
    } finally {
      setResolving(false);
    }
  };

  const handleMapPress = (feature: Feature<Geometry, GeoJsonProperties>) => {
    const geo = feature?.geometry as { coordinates?: number[] } | undefined;
    const coords = geo?.coordinates;
    if (!coords || coords.length < 2) return;
    const newCoords: [number, number] = [coords[0], coords[1]];
    setPinCoords(newCoords);
    resolveAddress(coords[1], coords[0]);
  };

  const handleAutocompleteSelect = (
    addr: string,
    coords: [number, number]
  ) => {
    setPinCoords(coords);
    setAddress(addr);
    // @ts-ignore — flyTo exists at runtime
    cameraRef.current?.flyTo(coords, 600);
  };

  const handleConfirm = () => {
    onConfirm({ coordinates: pinCoords, address });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View className="flex-1 bg-neutral">
        {/* Header */}
        <View
          className="flex-row items-center justify-between px-5 bg-neutral-T100"
          style={{ paddingTop: insets.top + 12, paddingBottom: 12 }}
        >
          <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
            <Ionicons name="close" size={24} color="#2B2C2C" />
          </TouchableOpacity>
          <Text className="font-sans font-bold text-base text-neutral-T10">
            {t('map.pickLocationHeader')}
          </Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Autocomplete */}
        <View className="px-4 py-3 bg-neutral-T100 border-b border-neutral-T90">
          <AddressAutocomplete
            placeholder={t('map.searchAddressPlaceholder')}
            onSelect={handleAutocompleteSelect}
            initialValue={address}
          />
        </View>

        {/* Map */}
        <View className="flex-1">
          <MapView
            style={{ flex: 1 }}
            mapStyle={TILE_STYLE_URL}
            compassEnabled={false}
            attributionEnabled={false}
            logoEnabled={false}
            rotateEnabled={false}
            onPress={handleMapPress}
          >
            <Camera
              ref={cameraRef}
              centerCoordinate={pinCoords}
              zoomLevel={15}
              animationMode="flyTo"
              animationDuration={600}
            />

            {/* Draggable pin */}
            <PointAnnotation
              id="picker-pin"
              coordinate={pinCoords}
              draggable
              onDragEnd={(feature: any) => {
                const geo = feature?.geometry as { coordinates?: number[] } | undefined;
                const coords = geo?.coordinates;
                if (coords && coords.length >= 2) {
                  const newCoords: [number, number] = [coords[0], coords[1]];
                  setPinCoords(newCoords);
                  resolveAddress(coords[1], coords[0]);
                }
              }}
            >
              <View style={{ alignItems: 'center' }}>
                <Ionicons name="location" size={40} color="#296C24" />
              </View>
            </PointAnnotation>
          </MapView>
        </View>

        {/* Footer */}
        <View
          className="bg-neutral-T100 px-5 pt-4 border-t border-neutral-T90"
          style={{ paddingBottom: Math.max(insets.bottom, 16) + 4 }}
        >
          {/* Selected address */}
          <View className="flex-row items-start gap-2 mb-4">
            <Ionicons
              name="location-outline"
              size={18}
              color="#296C24"
              style={{ marginTop: 2 }}
            />
            <View className="flex-1">
              <Text className="font-label text-[10px] text-neutral-T50 uppercase tracking-wider mb-0.5">
                {t('map.selectedAddressLabel')}
              </Text>
              {resolving ? (
                <ActivityIndicator size="small" color="#296C24" />
              ) : (
                <Text
                  className="font-body text-sm text-neutral-T10"
                  numberOfLines={2}
                >
                  {address || t('map.unknownAddress')}
                </Text>
              )}
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleConfirm}
            disabled={resolving}
            className="h-14 bg-primary-T40 rounded-2xl items-center justify-center"
          >
            <Text className="font-label font-semibold text-base text-neutral-T100">
              {t('map.confirmLocationBtn')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
