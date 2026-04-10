import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
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
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import CategoryPicker from '@/components/post/CategoryPicker';
import ImagePickerSection from '@/components/post/ImagePickerSection';
import PasscodeModal from '@/components/post/PasscodeModal';
import QuantityStepper from '@/components/post/QuantityStepper';
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
      if (fieldErrors.pickupTime) setFieldErrors((e) => { const { pickupTime: _, ...rest } = e; return rest; });
    } else if (activePicker === 'pickupEnd') {
      setPickupEnd(selected);
      if (fieldErrors.pickupTime) setFieldErrors((e) => { const { pickupTime: _, ...rest } = e; return rest; });
    } else if (activePicker === 'expiryDate') {
      setExpiryDate(selected);
      if (fieldErrors.expiryDate) setFieldErrors((e) => { const { expiryDate: _, ...rest } = e; return rest; });
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
      Alert.alert('Error', res.message || 'Failed to send passcode');
      return false;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to send passcode';
      Alert.alert('Error', message);
      return false;
    } finally {
      setIsSendingPasscode(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (images.length === 0) {
      errors.images = 'Please add at least one photo';
    }
    if (!title.trim()) {
      errors.title = 'Meal title is required';
    }
    if (isB2C && (!price || parseFloat(price) <= 0)) {
      errors.price = 'Price must be greater than 0';
    }
    if (quantity < 1) {
      errors.quantity = 'At least 1 serving is required';
    }
    if (pickupStart >= pickupEnd) {
      errors.pickupTime = 'End time must be after start time';
    }
    if (expiryDate <= new Date()) {
      errors.expiryDate = 'Expiry date must be in the future';
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

      // 2. Create post via API (location tạm thời không bắt buộc — map chưa tích hợp)
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
        passcode,
      });

      if (res.success) {
        Alert.alert('Success', 'Your meal has been published!', [
          {
            text: 'OK',
            onPress: () => router.push('/post' as never),
          },
        ]);
      } else {
        Alert.alert('Error', res.message || 'Failed to create post');
      }
    } catch (err) {
      if (err instanceof ApiValidationError) {
        // Map server field errors to fieldErrors state
        const errors: Record<string, string> = {};
        for (const fe of err.fieldErrors) {
          errors[fe.path] = fe.message;
        }
        setFieldErrors(errors);
        Alert.alert('Validation error', 'Please check the highlighted fields.');
      } else {
        const message =
          err instanceof Error ? err.message : 'Failed to publish post';
        Alert.alert('Publish failed', message);
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
                    Done
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
    <SafeAreaView className="flex-1 bg-neutral" edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* ── Header ── */}
        <View className="flex-row items-center justify-between px-6 h-16 bg-neutral-T100 shadow-sm">
          <View className="flex-row items-center gap-4">
            <TouchableOpacity
              className="active:opacity-70 p-1"
              onPress={() => router.back()}
            >
              <MaterialIcons name="arrow-back" size={24} color="#757777" />
            </TouchableOpacity>
            <Text className="font-sans font-bold text-lg text-primary-T40">
              {isB2C ? 'Share surprise bag' : 'Share meal'}
            </Text>
          </View>
          <Text className="font-label text-xs text-neutral-T70">
            Auto-saving
          </Text>
        </View>

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
                if (fieldErrors.images) setFieldErrors((e) => { const { images: _, ...rest } = e; return rest; });
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
            {/* Category */}
            <View className="gap-2">
              <Text className="font-label font-semibold text-sm text-neutral-T50 ml-1">
                Category
              </Text>
              <CategoryPicker selected={category} onSelect={setCategory} />
            </View>

            {/* Meal title */}
            <View className="gap-2">
              <Text className="font-label font-semibold text-sm text-neutral-T50 ml-1">
                Meal title
              </Text>
              <TextInput
                className={`w-full h-14 px-4 rounded-xl bg-neutral-T95 border font-body text-base text-neutral-T10 ${fieldErrors.title ? 'border-red-500' : 'border-neutral-T90'}`}
                placeholder="e.g. Homemade Vegetarian Lasagna"
                placeholderTextColor="#AAABAB"
                value={title}
                onChangeText={(t) => {
                  setTitle(t);
                  if (fieldErrors.title) setFieldErrors((e) => { const { title: _, ...rest } = e; return rest; });
                }}
              />
              {fieldErrors.title && (
                <Text className="text-xs text-red-500 font-label ml-1">
                  {fieldErrors.title}
                </Text>
              )}
            </View>

            {/* Description */}
            <View className="gap-2">
              <Text className="font-label font-semibold text-sm text-neutral-T50 ml-1">
                Description
              </Text>
              <TextInput
                className="w-full p-4 rounded-xl bg-neutral-T95 border border-neutral-T90 font-body text-base text-neutral-T10"
                placeholder="Tell us about the ingredients, allergens, or why you're sharing..."
                placeholderTextColor="#AAABAB"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                style={{ minHeight: 108 }}
                value={description}
                onChangeText={setDescription}
              />
            </View>

            {/* Price (B2C only) + Servings row */}
            <View className="flex-row gap-4">
              {isB2C && (
                <View className="flex-1 gap-2">
                  <Text className="font-label font-semibold text-sm text-neutral-T50 ml-1">
                    Price
                  </Text>
                  <View className="relative justify-center">
                    <Text className="absolute left-4 font-label font-semibold text-neutral-T50 z-10">
                      $
                    </Text>
                    <TextInput
                      className={`w-full h-14 pl-8 pr-4 rounded-xl bg-neutral-T95 border font-body text-base text-neutral-T10 ${fieldErrors.price ? 'border-red-500' : 'border-neutral-T90'}`}
                      placeholder="0.00"
                      placeholderTextColor="#AAABAB"
                      keyboardType="decimal-pad"
                      value={price}
                      onChangeText={(p) => {
                        setPrice(p);
                        if (fieldErrors.price) setFieldErrors((e) => { const { price: _, ...rest } = e; return rest; });
                      }}
                    />
                  </View>
                  {fieldErrors.price && (
                    <Text className="text-xs text-red-500 font-label ml-1">
                      {fieldErrors.price}
                    </Text>
                  )}
                </View>
              )}
              <View className="flex-1 gap-2">
                <Text className="font-label font-semibold text-sm text-neutral-T50 ml-1">
                  Servings
                </Text>
                <QuantityStepper value={quantity} onChange={setQuantity} />
              </View>
            </View>
          </View>

          {/* ── Pickup window ── */}
          <View className={`rounded-2xl p-6 gap-4 mb-6 ${fieldErrors.pickupTime ? 'bg-red-50 border border-red-500' : 'bg-neutral-T95'}`}>
            <View className="flex-row items-center gap-2">
              <MaterialIcons name="schedule" size={20} color={fieldErrors.pickupTime ? '#EF4444' : '#296C24'} />
              <Text className="font-sans font-bold text-base text-neutral-T10">
                Pickup window
              </Text>
            </View>
            <View className="flex-row gap-4">
              <View className="flex-1 gap-1">
                <Text className="text-[10px] font-label font-semibold tracking-wider text-neutral-T70 ml-1">
                  Starts from
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
                  Until
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

          {/* ── Expiry date ── */}
          <View className="gap-2 mb-6">
            <Text className="font-label font-semibold text-sm text-neutral-T50 ml-1">
              Expiry date
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

          {/* ── Location (tạm ẩn — map service chưa tích hợp) ── */}
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
              Save draft
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 h-14 bg-primary-T40 rounded-xl items-center justify-center flex-row gap-2 shadow-sm active:opacity-80"
            onPress={handlePublish}
            disabled={isSendingPasscode}
          >
            {isSendingPasscode ? (
              <Text className="font-label font-medium text-sm text-neutral-T100">
                Sending code...
              </Text>
            ) : (
              <>
                <MaterialIcons name="check-circle" size={18} color="#FFFFFF" />
                <Text className="font-label font-medium text-sm text-neutral-T100">
                  Publish meal
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Date/time picker modal ── */}
      {renderPickerModal()}

      {/* ── Passcode modal ── */}
      <PasscodeModal
        visible={showPasscode}
        onCancel={() => setShowPasscode(false)}
        onVerify={handleVerify}
        onResend={handleResendPasscode}
        isLoading={isSubmitting}
        deliveryMethod={deliveryMethod}
      />
    </SafeAreaView>
  );
}
