import { Feather } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useColorScheme } from 'nativewind';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import LocationPickerSheet, {
  PickedLocation,
} from '@/components/map/LocationPickerSheet';
import { useThemeColors } from '@/lib/hooks/useThemeColors';
import { useAuthStore } from '@/stores/authStore';

interface ChatInputProps {
  onSend?: (text: string) => void;
  onSendImage?: () => void;
  onSendLocation?: (location: { latitude: number; longitude: number }) => void;
  onSaveEdit?: (messageId: string, text: string) => void;
  onCancelEdit?: () => void;
  editingMessageId?: string;
  editInitialText?: string;
  disabled?: boolean;
  uploading?: boolean;
  /** Khi có thẻ bài đăng/giao dịch đang chờ — hiển thị nút gửi dù text rỗng */
  pendingShare?: boolean;
}

export default function ChatInput({
  onSend,
  onSendImage,
  onSendLocation,
  onSaveEdit,
  onCancelEdit,
  editingMessageId,
  editInitialText,
  disabled,
  uploading,
  pendingShare,
}: ChatInputProps) {
  const { t } = useTranslation();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();

  const [message, setMessage] = useState('');
  const [sheetVisible, setSheetVisible] = useState(false);
  const [locationSheetVisible, setLocationSheetVisible] = useState(false);
  const [mapPickerVisible, setMapPickerVisible] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  const isStore = user?.role === 'STORE';
  const storeCoords = user?.location?.coordinates; // [lng, lat]

  const isBusy = uploading || gettingLocation;
  const isEditing = !!editingMessageId;

  // Prefill input when entering edit mode
  useEffect(() => {
    if (editInitialText !== undefined) {
      setMessage(editInitialText);
    }
  }, [editInitialText, editingMessageId]);

  const handleSend = () => {
    if (!message.trim()) return;
    if (isEditing && editingMessageId) {
      onSaveEdit?.(editingMessageId, message.trim());
      setMessage('');
    } else {
      onSend?.(message.trim());
      setMessage('');
    }
  };

  // ── Attachment sheet ─────────────────────────────────────────────────────

  const handlePickImage = () => {
    setSheetVisible(false);
    // iOS cần thêm thời gian để modal hoàn toàn dismiss trước khi mở image picker
    setTimeout(() => onSendImage?.(), Platform.OS === 'ios' ? 800 : 200);
  };

  const handleOpenLocationSheet = () => {
    setSheetVisible(false);
    setTimeout(() => setLocationSheetVisible(true), 200);
  };

  // ── Location source sheet ────────────────────────────────────────────────

  const handlePickOnMap = () => {
    setLocationSheetVisible(false);
    setTimeout(() => setMapPickerVisible(true), 200);
  };

  const handleCurrentLocation = async () => {
    setLocationSheetVisible(false);
    setGettingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('common.error'), t('chat.locationNoPermission'));
        return;
      }
      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (!servicesEnabled) {
        Alert.alert(t('common.error'), t('chat.locationServicesOff'));
        return;
      }
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      onSendLocation?.({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });
    } catch {
      Alert.alert(t('common.error'), t('chat.locationServicesOff'));
    } finally {
      setGettingLocation(false);
    }
  };

  const handleStoreLocation = () => {
    setLocationSheetVisible(false);
    if (!storeCoords) {
      Alert.alert(t('common.error'), t('chat.storeLocationNotSet'));
      return;
    }
    // Kiểm tra tọa độ mặc định (chưa thiết lập) hoặc nằm ngoài lãnh thổ Việt Nam
    const [lng, lat] = storeCoords;
    const isDefault =
      Math.abs(lng - 106.660172) < 0.0001 && Math.abs(lat - 10.762622) < 0.0001;
    const outsideVietnam =
      lat < 8.0 || lat > 24.0 || lng < 102.0 || lng > 110.0;
    if (isDefault || outsideVietnam) {
      Alert.alert(t('common.error'), t('chat.storeLocationInvalid'));
      return;
    }
    // storeCoords is [lng, lat]
    onSendLocation?.({ latitude: storeCoords[1], longitude: storeCoords[0] });
  };

  const handleMapConfirm = (picked: PickedLocation) => {
    // picked.coordinates is [lng, lat]
    onSendLocation?.({
      latitude: picked.coordinates[1],
      longitude: picked.coordinates[0],
    });
  };

  // ────────────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Edit mode indicator */}
      {isEditing && (
        <View className="mx-4 mb-1 flex-row items-center justify-between px-2">
          <View className="flex-row items-center gap-1.5">
            <Feather name="edit-2" size={12} color={colors.primaryGreen} />
            <Text className="font-label text-primary-T40 text-xs">
              {t('chat.editMessage')}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              setMessage('');
              onCancelEdit?.();
            }}
          >
            <Feather name="x" size={16} color="#AAABAB" />
          </TouchableOpacity>
        </View>
      )}
      <View
        className="bg-neutral-T100 dark:bg-neutral-T20 mx-4 mb-4 mt-2 flex-row items-center gap-2 rounded-full px-3 py-2"
        style={{
          shadowColor: '#191c1c',
          shadowOpacity: isDark ? 0 : 0.08,
          shadowOffset: { width: 0, height: -4 },
          shadowRadius: 16,
          elevation: isDark ? 0 : 5,
          borderWidth: 1,
          borderColor: isDark ? 'rgba(69,71,71,0.6)' : 'rgba(192,201,185,0.2)',
        }}
      >
        {/* Add button — opens attachment sheet (hidden while editing) */}
        <TouchableOpacity
          className="p-2"
          onPress={() => setSheetVisible(true)}
          disabled={isBusy || isEditing}
          style={{ opacity: isEditing ? 0.3 : 1 }}
        >
          {isBusy ? (
            <ActivityIndicator size={22} color={colors.primaryGreen} />
          ) : (
            <Feather name="plus-circle" size={22} color="#AAABAB" />
          )}
        </TouchableOpacity>

        {/* Text input */}
        <TextInput
          placeholder={t('chat.typeMessage')}
          placeholderTextColor={colors.placeholder}
          value={message}
          onChangeText={setMessage}
          multiline
          className="font-body text-neutral-T10 dark:text-neutral-T90 max-h-24 flex-1 py-1.5 text-base"
        />

        {/* Emoji or Send */}
        {message.trim().length > 0 || pendingShare ? (
          <TouchableOpacity
            onPress={handleSend}
            disabled={disabled}
            className="bg-primary h-10 w-10 items-center justify-center rounded-full"
            style={{
              shadowColor: '#72B866',
              shadowOpacity: 0.3,
              shadowRadius: 6,
              elevation: 3,
              opacity: disabled ? 0.5 : 1,
            }}
          >
            <Feather name="send" size={16} color="white" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity className="p-2">
            <Feather name="smile" size={22} color="#AAABAB" />
          </TouchableOpacity>
        )}
      </View>

      {/* ── Attachment action sheet ─────────────────────────────────────── */}
      <Modal
        visible={sheetVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setSheetVisible(false)}
      >
        <Pressable
          className="bg-neutral-T10/70 flex-1 justify-end"
          onPress={() => setSheetVisible(false)}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View
              className="bg-neutral-T100 dark:bg-neutral-T20 border-neutral-T90 dark:border-neutral-T30 rounded-t-3xl border-t px-6 pt-4"
              style={{ paddingBottom: Math.max(insets.bottom, 24) + 8 }}
            >
              <View className="bg-neutral-T80 dark:bg-neutral-T30 mb-6 h-1.5 w-12 self-center rounded-full" />

              {/* Send image */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handlePickImage}
                className="bg-neutral-T100 dark:bg-neutral-T30 border-neutral-T90 dark:border-neutral-T30 mb-3 flex-row items-center gap-4 rounded-2xl border px-4 py-4"
              >
                <View className="bg-primary-T40 h-12 w-12 items-center justify-center rounded-xl">
                  <Feather name="image" size={22} color="#FFFFFF" />
                </View>
                <View className="flex-1">
                  <Text className="text-neutral-T10 dark:text-neutral-T90 font-sans text-base font-semibold">
                    {t('chat.sendImage')}
                  </Text>
                </View>
                <Feather
                  name="arrow-right"
                  size={18}
                  color={isDark ? '#E1E3E2' : '#191C1C'}
                />
              </TouchableOpacity>

              {/* Send location */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleOpenLocationSheet}
                className="bg-neutral-T100 dark:bg-neutral-T30 border-neutral-T90 dark:border-neutral-T30 mb-1 flex-row items-center gap-4 rounded-2xl border px-4 py-4"
              >
                <View className="bg-primary-T40 h-12 w-12 items-center justify-center rounded-xl">
                  <Feather name="map-pin" size={22} color="#FFFFFF" />
                </View>
                <View className="flex-1">
                  <Text className="text-neutral-T10 dark:text-neutral-T90 font-sans text-base font-semibold">
                    {t('chat.sendLocation')}
                  </Text>
                </View>
                <Feather
                  name="arrow-right"
                  size={18}
                  color={isDark ? '#E1E3E2' : '#191C1C'}
                />
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── Location source sheet ───────────────────────────────────────── */}
      <Modal
        visible={locationSheetVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setLocationSheetVisible(false)}
      >
        <Pressable
          className="bg-neutral-T10/70 flex-1 justify-end"
          onPress={() => setLocationSheetVisible(false)}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View
              className="bg-neutral-T100 dark:bg-neutral-T20 border-neutral-T90 dark:border-neutral-T30 rounded-t-3xl border-t px-6 pt-4"
              style={{ paddingBottom: Math.max(insets.bottom, 24) + 8 }}
            >
              <View className="bg-neutral-T80 dark:bg-neutral-T30 mb-6 h-1.5 w-12 self-center rounded-full" />

              {/* Pick on map */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handlePickOnMap}
                className="bg-neutral-T100 dark:bg-neutral-T30 border-neutral-T90 dark:border-neutral-T30 mb-3 flex-row items-center gap-4 rounded-2xl border px-4 py-4"
              >
                <View className="bg-primary-T40 h-12 w-12 items-center justify-center rounded-xl">
                  <Feather name="map" size={22} color="#FFFFFF" />
                </View>
                <View className="flex-1">
                  <Text className="text-neutral-T10 dark:text-neutral-T90 font-sans text-base font-semibold">
                    {t('chat.pickOnMap')}
                  </Text>
                </View>
                <Feather
                  name="arrow-right"
                  size={18}
                  color={isDark ? '#E1E3E2' : '#191C1C'}
                />
              </TouchableOpacity>

              {/* Current location */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleCurrentLocation}
                className="bg-neutral-T100 dark:bg-neutral-T30 border-neutral-T90 dark:border-neutral-T30 mb-3 flex-row items-center gap-4 rounded-2xl border px-4 py-4"
              >
                <View className="bg-primary-T40 h-12 w-12 items-center justify-center rounded-xl">
                  <Feather name="navigation" size={22} color="#FFFFFF" />
                </View>
                <View className="flex-1">
                  <Text className="text-neutral-T10 dark:text-neutral-T90 font-sans text-base font-semibold">
                    {t('chat.sendCurrentLocation')}
                  </Text>
                </View>
                <Feather
                  name="arrow-right"
                  size={18}
                  color={isDark ? '#E1E3E2' : '#191C1C'}
                />
              </TouchableOpacity>

              {/* Store location — only for STORE accounts */}
              {isStore && (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleStoreLocation}
                  disabled={!storeCoords}
                  className="bg-neutral-T100 dark:bg-neutral-T30 border-neutral-T90 dark:border-neutral-T30 mb-1 flex-row items-center gap-4 rounded-2xl border px-4 py-4"
                  style={{ opacity: storeCoords ? 1 : 0.45 }}
                >
                  <View className="bg-primary-T40 h-12 w-12 items-center justify-center rounded-xl">
                    <Feather name="home" size={22} color="#FFFFFF" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-neutral-T10 dark:text-neutral-T90 font-sans text-base font-semibold">
                      {t('chat.sendStoreLocation')}
                    </Text>
                    {!storeCoords && (
                      <Text className="text-neutral-T50 dark:text-neutral-T60 font-label mt-0.5 text-xs">
                        {t('chat.storeLocationNotSet')}
                      </Text>
                    )}
                  </View>
                  {storeCoords && (
                    <Feather
                      name="arrow-right"
                      size={18}
                      color={isDark ? '#E1E3E2' : '#191C1C'}
                    />
                  )}
                </TouchableOpacity>
              )}
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── Full-screen map picker ──────────────────────────────────────── */}
      <LocationPickerSheet
        visible={mapPickerVisible}
        onClose={() => setMapPickerVisible(false)}
        onConfirm={handleMapConfirm}
      />
    </>
  );
}
