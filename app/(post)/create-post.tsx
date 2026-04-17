import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CategoryPicker from '@/components/post/CategoryPicker';
import StackHeader from '@/components/shared/headers/StackHeader';
import ImagePickerSection from '@/components/post/ImagePickerSection';
import PasscodeModal from '@/components/post/PasscodeModal';
import QuantityStepper from '@/components/post/QuantityStepper';
import LocationPickerSheet, {
  PickedLocation,
} from '@/components/map/LocationPickerSheet';
import {
  ApiValidationError,
  createPostApi,
  sendPostPasscodeApi,
} from '@/lib/postApi';
import { uploadMultipleImages } from '@/lib/uploadApi';

type ActivePicker = 'pickupStart' | 'pickupEnd' | 'expiryDate' | null;
type PickerMode = 'date' | 'time';

export default function CreatePost() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const { type } = useLocalSearchParams();
  const isB2C = type === 'SURPRISE_BAG';

  // ── Form state ──
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Home cooked');
  const [images, setImages] = useState<string[]>([]);

  // Default pickup window: today 18:00 → 21:00; expiry: tomorrow
  const buildDefault = (hours: number) => {
    const d = new Date();
    d.setHours(hours, 0, 0, 0);
    return d;
  };
  const buildTomorrow = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(23, 59, 0, 0);
    return d;
  };

  const [pickupStart, setPickupStart] = useState(buildDefault(18));
  const [pickupEnd, setPickupEnd] = useState(buildDefault(21));
  const [expiryDate, setExpiryDate] = useState(buildTomorrow);

  // ── Picker UI state ──
  const [activePicker, setActivePicker] = useState<ActivePicker>(null);
  const [pickerMode, setPickerMode] = useState<PickerMode>('time');

  // ── Location state ──
  const [pickedLocation, setPickedLocation] = useState<PickedLocation | null>(
    null
  );
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  // ── Passcode / submit state ──
  const [showPasscode, setShowPasscode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingPasscode, setIsSendingPasscode] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<'email' | null>(null);
  // ── Field-level errors ──
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // ── Helpers ──
  const formatTime = (d: Date) =>
    d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const formatDate = (d: Date) =>
    d.toLocaleDateString([], {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  const getPickerValue = () => {
    if (activePicker === 'pickupStart') return pickupStart;
    if (activePicker === 'pickupEnd') return pickupEnd;
    return expiryDate;
  };

  const openPicker = (field: ActivePicker, mode: PickerMode = 'time') => {
    setActivePicker(field);
    setPickerMode(mode);
  };

  const handleDateChange = (_: unknown, selected?: Date) => {
    if (Platform.OS === 'android') {
      setActivePicker(null);
    }
    if (!selected) return;
    if (activePicker === 'pickupStart') {
      setPickupStart(selected);
      if (fieldErrors.pickupTime)
        setFieldErrors((e) => {
          const { pickupTime: _, ...rest } = e;
          return rest;
        });
    } else if (activePicker === 'pickupEnd') {
      setPickupEnd(selected);
      if (fieldErrors.pickupTime)
        setFieldErrors((e) => {
          const { pickupTime: _, ...rest } = e;
          return rest;
        });
    } else if (activePicker === 'expiryDate') {
      setExpiryDate(selected);
      if (fieldErrors.expiryDate)
        setFieldErrors((e) => {
          const { expiryDate: _, ...rest } = e;
          return rest;
        });
    }
  };

  const handleSendPasscode = async (): Promise<boolean> => {
    try {
      setIsSendingPasscode(true);
      const res = await sendPostPasscodeApi();
      if (res.success && res.data) {
        setDeliveryMethod(res.data.deliveryMethod);
        return true;
      }
      Alert.alert(
        t('common.error'),
        res.message || t('post.errorSendPasscode')
      );
      return false;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t('post.errorSendPasscode');
      Alert.alert(t('common.error'), message);
      return false;
    } finally {
      setIsSendingPasscode(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (images.length === 0) {
      errors.images = t('post.errorImages');
    }
    if (!title.trim()) {
      errors.title = t('post.errorTitleRequired');
    }
    if (isB2C && (!price || parseFloat(price) <= 0)) {
      errors.price = t('post.errorPriceRequired');
    }
    if (quantity < 1) {
      errors.quantity = t('post.errorQuantityMin');
    }
    if (pickupStart >= pickupEnd) {
      errors.pickupTime = t('post.errorPickupTime');
    }
    if (expiryDate <= new Date()) {
      errors.expiryDate = t('post.errorExpiryDate');
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePublish = async () => {
    if (!validateForm()) return;

    const sent = await handleSendPasscode();
    if (sent) {
      setShowPasscode(true);
    }
  };

  const handleResendPasscode = async () => {
    await handleSendPasscode();
  };

  const handleVerify = async (passcode: string) => {
    setIsSubmitting(true);
    try {
      // 1. Upload images to Cloudinary
      const uploadResults = await uploadMultipleImages(images, 'posts');
      const imageUrls = uploadResults.map((r) => r.url);

      // 2. Create post via API
      const res = await createPostApi({
        type: isB2C ? 'B2C_MYSTERY_BAG' : 'P2P_FREE',
        category,
        title: title.trim(),
        description: description.trim() || undefined,
        images: imageUrls,
        totalQuantity: quantity,
        price: isB2C ? parseFloat(price) || 0 : undefined,
        expiryDate: expiryDate.toISOString(),
        pickupTime: {
          start: pickupStart.toISOString(),
          end: pickupEnd.toISOString(),
        },
        location: pickedLocation
          ? { type: 'Point', coordinates: pickedLocation.coordinates }
          : undefined,
        passcode,
      });

      if (res.success) {
        Alert.alert(t('common.success'), t('post.createSuccess'), [
          {
            text: 'OK',
            onPress: () => router.push('/post' as never),
          },
        ]);
      } else {
        Alert.alert(t('common.error'), res.message || t('post.createFailed'));
      }
    } catch (err) {
      if (err instanceof ApiValidationError) {
        // Map server field errors to fieldErrors state
        const errors: Record<string, string> = {};
        for (const fe of err.fieldErrors) {
          errors[fe.path] = fe.message;
        }
        setFieldErrors(errors);
        Alert.alert(t('post.validationError'), t('post.checkFields'));
      } else {
        const message =
          err instanceof Error ? err.message : t('post.createFailed');
        Alert.alert(t('post.createFailed'), message);
      }
    } finally {
      setIsSubmitting(false);
      setShowPasscode(false);
    }
  };

  // ── Date picker modal (wraps native picker for clean iOS UX) ──
  const renderPickerModal = () => {
    if (!activePicker) return null;
    return (
      <Modal
        transparent
        animationType="slide"
        visible={!!activePicker}
        onRequestClose={() => setActivePicker(null)}
      >
        <Pressable
          className="flex-1 justify-end"
          style={{ backgroundColor: 'rgba(0,0,0,0.35)' }}
          onPress={() => setActivePicker(null)}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View
              className="bg-neutral-T100 rounded-t-3xl px-6 pt-4 pb-6"
              style={{ paddingBottom: Math.max(insets.bottom, 24) + 8 }}
            >
              <View className="w-10 h-1 bg-neutral-T80 rounded-full self-center mb-2" />
              <View style={{ overflow: 'hidden', alignSelf: 'center' }}>
                <DateTimePicker
                  value={getPickerValue()}
                  mode={pickerMode}
                  display="spinner"
                  onChange={handleDateChange}
                  themeVariant="light"
                  style={{ height: 216 }}
                />
              </View>
              {Platform.OS === 'ios' && (
                <TouchableOpacity
                  className="h-14 bg-primary-T40 rounded-xl items-center justify-center shadow-sm active:opacity-80 mt-4"
                  onPress={() => setActivePicker(null)}
                >
                  <Text className="font-label font-semibold text-neutral-T100">
                    {t('common.done')}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    );
  };

  return (
    <View className="flex-1 bg-neutral">
      <StackHeader
        title={isB2C ? t('post.createB2CTitle') : t('post.createP2PTitle')}
        rightElement={
          <Text className="font-label text-xs text-neutral-T70">
            {t('post.autoSaving')}
          </Text>
        }
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingTop: 24,
            paddingBottom: Math.max(insets.bottom, 16) + 88,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Photos ── */}
          <View className="mb-8">
            <ImagePickerSection
              images={images}
              onImagesChange={(imgs) => {
                setImages(imgs);
                if (fieldErrors.images)
                  setFieldErrors((e) => {
                    const { images: _, ...rest } = e;
                    return rest;
                  });
              }}
            />
            {fieldErrors.images && (
              <Text className="text-xs text-red-500 font-label mt-1 ml-1">
                {fieldErrors.images}
              </Text>
            )}
          </View>

          {/* ── Form fields ── */}
          <View className="gap-6 mb-8">
            {/* Danh mục */}
            <View className="gap-2">
              <Text className="font-label font-semibold text-sm text-neutral-T50 ml-1">
                {t('post.category')}
              </Text>
              <CategoryPicker selected={category} onSelect={setCategory} />
            </View>

            {/* Tên món ăn */}
            <View className="gap-2">
              <Text className="font-label font-semibold text-sm text-neutral-T50 ml-1">
                {t('post.foodName')}
              </Text>
              <TextInput
                className={`w-full h-14 px-4 rounded-xl bg-neutral-T95 border font-body text-base text-neutral-T10 ${fieldErrors.title ? 'border-red-500' : 'border-neutral-T90'}`}
                placeholder={t('post.foodNamePlaceholder')}
                placeholderTextColor="#AAABAB"
                value={title}
                onChangeText={(text) => {
                  setTitle(text);
                  if (fieldErrors.title)
                    setFieldErrors((e) => {
                      const { title: _, ...rest } = e;
                      return rest;
                    });
                }}
              />
              {fieldErrors.title && (
                <Text className="text-xs text-red-500 font-label ml-1">
                  {fieldErrors.title}
                </Text>
              )}
            </View>

            {/* Mô tả */}
            <View className="gap-2">
              <Text className="font-label font-semibold text-sm text-neutral-T50 ml-1">
                {t('post.description')}
              </Text>
              <TextInput
                className="w-full p-4 rounded-xl bg-neutral-T95 border border-neutral-T90 font-body text-base text-neutral-T10"
                placeholder={t('post.descriptionPlaceholder')}
                placeholderTextColor="#AAABAB"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                style={{ minHeight: 108 }}
                value={description}
                onChangeText={setDescription}
              />
            </View>

            {/* Giá (chỉ B2C) + Số phần */}
            <View className="flex-row gap-4">
              {isB2C && (
                <View className="flex-1 gap-2">
                  <Text className="font-label font-semibold text-sm text-neutral-T50 ml-1">
                    {t('post.priceLabel')}
                  </Text>
                  <View className="relative justify-center">
                    <TextInput
                      className={`w-full h-14 pl-4 pr-10 rounded-xl bg-neutral-T95 border font-body text-base text-neutral-T10 ${fieldErrors.price ? 'border-red-500' : 'border-neutral-T90'}`}
                      placeholder="0"
                      placeholderTextColor="#AAABAB"
                      keyboardType="number-pad"
                      value={price}
                      onChangeText={(p) => {
                        setPrice(p);
                        if (fieldErrors.price)
                          setFieldErrors((e) => {
                            const { price: _, ...rest } = e;
                            return rest;
                          });
                      }}
                    />
                    <Text className="absolute right-4 font-label font-semibold text-neutral-T50 z-10">
                      ₫
                    </Text>
                  </View>
                  {fieldErrors.price ? (
                    <Text className="text-xs text-red-500 font-label ml-1">
                      {fieldErrors.price}
                    </Text>
                  ) : (
                    <Text className="text-xs text-neutral-T50 font-label ml-1">
                      {t('post.unitPriceHint')}
                    </Text>
                  )}
                </View>
              )}
              <View className="flex-1 gap-2">
                <Text className="font-label font-semibold text-sm text-neutral-T50 ml-1">
                  {t('post.servings')}
                </Text>
                <QuantityStepper value={quantity} onChange={setQuantity} />
              </View>
            </View>
          </View>

          {/* ── Khung giờ nhận hàng ── */}
          <View
            className={`rounded-2xl p-6 gap-4 mb-6 ${fieldErrors.pickupTime ? 'bg-red-50 border border-red-500' : 'bg-neutral-T95'}`}
          >
            <View className="flex-row items-center gap-2">
              <MaterialIcons
                name="schedule"
                size={20}
                color={fieldErrors.pickupTime ? '#EF4444' : '#296C24'}
              />
              <Text className="font-sans font-bold text-base text-neutral-T10">
                {t('post.pickupWindow')}
              </Text>
            </View>
            <View className="flex-row gap-4">
              <View className="flex-1 gap-1">
                <Text className="text-[10px] font-label font-semibold tracking-wider text-neutral-T70 ml-1">
                  {t('post.from')}
                </Text>
                <TouchableOpacity
                  className="h-12 px-4 rounded-xl bg-neutral-T100 border border-neutral-T90 flex-row items-center justify-between active:opacity-80"
                  onPress={() => openPicker('pickupStart', 'time')}
                >
                  <Text className="font-body font-semibold text-neutral-T10">
                    {formatTime(pickupStart)}
                  </Text>
                  <MaterialIcons name="access-time" size={16} color="#AAABAB" />
                </TouchableOpacity>
              </View>
              <View className="flex-1 gap-1">
                <Text className="text-[10px] font-label font-semibold tracking-wider text-neutral-T70 ml-1">
                  {t('post.to')}
                </Text>
                <TouchableOpacity
                  className="h-12 px-4 rounded-xl bg-neutral-T100 border border-neutral-T90 flex-row items-center justify-between active:opacity-80"
                  onPress={() => openPicker('pickupEnd', 'time')}
                >
                  <Text className="font-body font-semibold text-neutral-T10">
                    {formatTime(pickupEnd)}
                  </Text>
                  <MaterialIcons name="access-time" size={16} color="#AAABAB" />
                </TouchableOpacity>
              </View>
            </View>
            {fieldErrors.pickupTime && (
              <Text className="text-xs text-red-500 font-label ml-1">
                {fieldErrors.pickupTime}
              </Text>
            )}
          </View>

          {/* ── Hạn sử dụng ── */}
          <View className="gap-2 mb-6">
            <Text className="font-label font-semibold text-sm text-neutral-T50 ml-1">
              {t('post.expiryDate')}
            </Text>
            <TouchableOpacity
              className={`h-14 px-4 rounded-xl bg-neutral-T95 border flex-row items-center justify-between active:opacity-80 ${fieldErrors.expiryDate ? 'border-red-500' : 'border-neutral-T90'}`}
              onPress={() => openPicker('expiryDate', 'date')}
            >
              <Text className="font-body text-base text-neutral-T10">
                {formatDate(expiryDate)}
              </Text>
              <MaterialIcons name="event" size={20} color="#AAABAB" />
            </TouchableOpacity>
            {fieldErrors.expiryDate && (
              <Text className="text-xs text-red-500 font-label ml-1">
                {fieldErrors.expiryDate}
              </Text>
            )}
          </View>

          {/* ── Location picker ── */}
          <View className="gap-2 mb-2">
            <Text className="font-label font-semibold text-sm text-neutral-T50 ml-1">
              {t('post.pickupLocation')}
            </Text>
            <TouchableOpacity
              className="h-14 px-4 rounded-xl bg-neutral-T95 border border-neutral-T90 flex-row items-center justify-between active:opacity-80"
              onPress={() => setShowLocationPicker(true)}
            >
              <View className="flex-row items-center gap-2 flex-1">
                <MaterialIcons
                  name="location-on"
                  size={20}
                  color={pickedLocation ? '#296C24' : '#AAABAB'}
                />
                <Text
                  className="font-body text-sm flex-1"
                  style={{ color: pickedLocation ? '#2B2C2C' : '#AAABAB' }}
                  numberOfLines={1}
                >
                  {pickedLocation
                    ? pickedLocation.address || t('post.locationSelected')
                    : t('post.locationPlaceholder')}
                </Text>
              </View>
              <MaterialIcons name="chevron-right" size={20} color="#AAABAB" />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── Fixed footer ── */}
      <View
        className="absolute bottom-0 left-0 right-0 bg-neutral-T100 border-t border-neutral-T90"
        style={{
          paddingBottom: Math.max(insets.bottom, 16),
          paddingTop: 16,
          paddingHorizontal: 24,
        }}
      >
        <View className="flex-row gap-4">
          <TouchableOpacity className="flex-1 h-14 bg-neutral-T95 rounded-xl items-center justify-center flex-row gap-2 active:opacity-80">
            <MaterialIcons name="save" size={18} color="#757777" />
            <Text className="font-label font-medium text-sm text-neutral-T50">
              {t('post.saveDraft')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 h-14 bg-primary-T40 rounded-xl items-center justify-center flex-row gap-2 shadow-sm active:opacity-80"
            onPress={handlePublish}
            disabled={isSendingPasscode}
          >
            {isSendingPasscode ? (
              <Text className="font-label font-medium text-sm text-neutral-T100">
                {t('post.sendingCode')}
              </Text>
            ) : (
              <>
                <MaterialIcons name="check-circle" size={18} color="#FFFFFF" />
                <Text className="font-label font-medium text-sm text-neutral-T100">
                  {t('post.publishPost')}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Date/time picker modal ── */}
      {renderPickerModal()}

      {/* ── Location picker sheet ── */}
      <LocationPickerSheet
        visible={showLocationPicker}
        onClose={() => setShowLocationPicker(false)}
        onConfirm={(loc) => setPickedLocation(loc)}
        initialCoords={pickedLocation?.coordinates}
      />

      {/* ── Passcode modal ── */}
      <PasscodeModal
        visible={showPasscode}
        onCancel={() => setShowPasscode(false)}
        onVerify={handleVerify}
        onResend={handleResendPasscode}
        isLoading={isSubmitting}
        deliveryMethod={deliveryMethod}
      />
    </View>
  );
}
