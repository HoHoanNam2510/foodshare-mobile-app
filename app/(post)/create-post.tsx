import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
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
import SaveTemplateModal from '@/components/post/SaveTemplateModal';
import TemplatePickerSheet from '@/components/post/TemplatePickerSheet';
import {
  createTemplateApi,
  getMyTemplatesApi,
  type IPostTemplate,
} from '@/lib/postTemplateApi';

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
  // Pre-upload: bắt đầu upload ảnh khi modal mở, không đợi đến khi user nhấn Verify
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[] | null>(
    null
  );
  const preUploadPromiseRef = useRef<Promise<string[]> | null>(null);
  // ── Field-level errors ──
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // ── Template state ──
  const [hasTemplates, setHasTemplates] = useState(false);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);

  // ── Fetch hasTemplates on mount ──
  useEffect(() => {
    getMyTemplatesApi()
      .then((list) => setHasTemplates(list.length > 0))
      .catch(() => {});
  }, []);

  // ── Apply template to form ──
  const applyTemplate = (template: IPostTemplate) => {
    setTitle(template.title);
    setDescription(template.description ?? '');
    setCategory(template.category);
    setQuantity(template.totalQuantity);
    setImages(template.images);
    if (isB2C && template.price > 0) {
      setPrice(String(template.price));
    }
  };

  // ── Save current form as template ──
  const handleSaveFormAsTemplate = async (templateName: string) => {
    setIsSavingTemplate(true);
    try {
      let resolvedImages: string[] = [];
      if (images.length > 0) {
        const results = await uploadMultipleImages(images, 'posts');
        resolvedImages = results.map((r) => r.url);
      }
      await createTemplateApi({
        templateName,
        type: isB2C ? 'B2C_MYSTERY_BAG' : 'P2P_FREE',
        category,
        title: title.trim(),
        description: description.trim() || undefined,
        images: resolvedImages,
        totalQuantity: quantity,
        price: isB2C ? parseFloat(price) || 0 : 0,
      });
      setShowSaveModal(false);
      setHasTemplates(true);
      Alert.alert(t('template.saveAsTemplate'), t('template.saveFormSuccess'));
    } catch (e) {
      Alert.alert(
        t('common.error'),
        e instanceof Error ? e.message : t('template.saveFailed')
      );
    } finally {
      setIsSavingTemplate(false);
    }
  };

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
      startPreUpload();
    }
  };

  const handleResendPasscode = async () => {
    await handleSendPasscode();
  };

  const startPreUpload = () => {
    setUploadedImageUrls(null);
    preUploadPromiseRef.current = uploadMultipleImages(images, 'posts')
      .then((results) => {
        const urls = results.map((r) => r.url);
        setUploadedImageUrls(urls);
        return urls;
      })
      .catch((err: unknown) => {
        preUploadPromiseRef.current = null;
        return Promise.reject(err);
      });
  };

  const handleVerify = async (passcode: string) => {
    setIsSubmitting(true);
    try {
      // 1. Upload images — dùng kết quả pre-upload nếu đã sẵn sàng
      let imageUrls: string[];
      if (uploadedImageUrls !== null) {
        // Branch A: pre-upload hoàn tất trước khi user nhấn Verify
        imageUrls = uploadedImageUrls;
      } else if (preUploadPromiseRef.current !== null) {
        // Branch B: pre-upload đang chạy — await phần còn lại
        try {
          imageUrls = await preUploadPromiseRef.current;
        } catch {
          // Pre-upload thất bại — fallback upload lại từ đầu
          const uploadResults = await uploadMultipleImages(images, 'posts');
          imageUrls = uploadResults.map((r) => r.url);
        }
      } else {
        // Branch C: pre-upload chưa chạy hoặc đã bị reset
        const uploadResults = await uploadMultipleImages(images, 'posts');
        imageUrls = uploadResults.map((r) => r.url);
      }

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
      setUploadedImageUrls(null);
      preUploadPromiseRef.current = null;
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
              className="bg-neutral-T100 rounded-t-3xl px-6 pb-6 pt-4"
              style={{ paddingBottom: Math.max(insets.bottom, 24) + 8 }}
            >
              <View className="bg-neutral-T80 mb-2 h-1 w-10 self-center rounded-full" />
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
                  className="bg-primary-T40 mt-4 h-14 items-center justify-center rounded-xl shadow-sm active:opacity-80"
                  onPress={() => setActivePicker(null)}
                >
                  <Text className="font-label text-neutral-T100 font-semibold">
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
    <View className="bg-neutral flex-1">
      <StackHeader
        title={isB2C ? t('post.createB2CTitle') : t('post.createP2PTitle')}
        rightElement={
          <Text className="font-label text-neutral-T70 text-xs">
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
          {/* ── Template picker banner ── */}
          {hasTemplates && (
            <TouchableOpacity
              className="bg-primary-T95 border-primary-T80 mb-6 flex-row items-center gap-3 rounded-2xl border p-4"
              onPress={() => setShowTemplatePicker(true)}
              activeOpacity={0.8}
            >
              <View className="bg-primary-T40 h-9 w-9 items-center justify-center rounded-xl">
                <MaterialIcons name="bookmark" size={18} color="#fff" />
              </View>
              <View className="flex-1">
                <Text className="font-label text-primary-T30 text-sm font-bold">
                  {t('template.useBanner')}
                </Text>
                <Text className="font-body text-primary-T50 text-xs">
                  {t('template.pickerSubtitle')}
                </Text>
              </View>
              <MaterialIcons name="chevron-right" size={20} color="#296C24" />
            </TouchableOpacity>
          )}

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
              <Text className="font-label ml-1 mt-1 text-xs text-red-500">
                {fieldErrors.images}
              </Text>
            )}
          </View>

          {/* ── Form fields ── */}
          <View className="mb-8 gap-6">
            {/* Danh mục */}
            <View className="gap-2">
              <Text className="font-label text-neutral-T50 ml-1 text-sm font-semibold">
                {t('post.category')}
              </Text>
              <CategoryPicker selected={category} onSelect={setCategory} />
            </View>

            {/* Tên món ăn */}
            <View className="gap-2">
              <Text className="font-label text-neutral-T50 ml-1 text-sm font-semibold">
                {t('post.foodName')}
              </Text>
              <TextInput
                className={`bg-neutral-T95 font-body text-neutral-T10 h-14 w-full rounded-xl border px-4 text-base ${fieldErrors.title ? 'border-red-500' : 'border-neutral-T90'}`}
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
                <Text className="font-label ml-1 text-xs text-red-500">
                  {fieldErrors.title}
                </Text>
              )}
            </View>

            {/* Mô tả */}
            <View className="gap-2">
              <Text className="font-label text-neutral-T50 ml-1 text-sm font-semibold">
                {t('post.description')}
              </Text>
              <TextInput
                className="bg-neutral-T95 border-neutral-T90 font-body text-neutral-T10 w-full rounded-xl border p-4 text-base"
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
                  <Text className="font-label text-neutral-T50 ml-1 text-sm font-semibold">
                    {t('post.priceLabel')}
                  </Text>
                  <View className="relative justify-center">
                    <TextInput
                      className={`bg-neutral-T95 font-body text-neutral-T10 h-14 w-full rounded-xl border pl-4 pr-10 text-base ${fieldErrors.price ? 'border-red-500' : 'border-neutral-T90'}`}
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
                    <Text className="font-label text-neutral-T50 absolute right-4 z-10 font-semibold">
                      ₫
                    </Text>
                  </View>
                  {fieldErrors.price ? (
                    <Text className="font-label ml-1 text-xs text-red-500">
                      {fieldErrors.price}
                    </Text>
                  ) : (
                    <Text className="text-neutral-T50 font-label ml-1 text-xs">
                      {t('post.unitPriceHint')}
                    </Text>
                  )}
                </View>
              )}
              <View className="flex-1 gap-2">
                <Text className="font-label text-neutral-T50 ml-1 text-sm font-semibold">
                  {t('post.servings')}
                </Text>
                <QuantityStepper value={quantity} onChange={setQuantity} />
              </View>
            </View>
          </View>

          {/* ── Khung giờ nhận hàng ── */}
          <View
            className={`mb-6 gap-4 rounded-2xl p-6 ${fieldErrors.pickupTime ? 'border border-red-500 bg-red-50' : 'bg-neutral-T95'}`}
          >
            <View className="flex-row items-center gap-2">
              <MaterialIcons
                name="schedule"
                size={20}
                color={fieldErrors.pickupTime ? '#EF4444' : '#296C24'}
              />
              <Text className="text-neutral-T10 font-sans text-base font-bold">
                {t('post.pickupWindow')}
              </Text>
            </View>
            <View className="flex-row gap-4">
              <View className="flex-1 gap-1">
                <Text className="font-label text-neutral-T70 ml-1 text-[10px] font-semibold tracking-wider">
                  {t('post.from')}
                </Text>
                <TouchableOpacity
                  className="bg-neutral-T100 border-neutral-T90 h-12 flex-row items-center justify-between rounded-xl border px-4 active:opacity-80"
                  onPress={() => openPicker('pickupStart', 'time')}
                >
                  <Text className="font-body text-neutral-T10 font-semibold">
                    {formatTime(pickupStart)}
                  </Text>
                  <MaterialIcons name="access-time" size={16} color="#AAABAB" />
                </TouchableOpacity>
              </View>
              <View className="flex-1 gap-1">
                <Text className="font-label text-neutral-T70 ml-1 text-[10px] font-semibold tracking-wider">
                  {t('post.to')}
                </Text>
                <TouchableOpacity
                  className="bg-neutral-T100 border-neutral-T90 h-12 flex-row items-center justify-between rounded-xl border px-4 active:opacity-80"
                  onPress={() => openPicker('pickupEnd', 'time')}
                >
                  <Text className="font-body text-neutral-T10 font-semibold">
                    {formatTime(pickupEnd)}
                  </Text>
                  <MaterialIcons name="access-time" size={16} color="#AAABAB" />
                </TouchableOpacity>
              </View>
            </View>
            {fieldErrors.pickupTime && (
              <Text className="font-label ml-1 text-xs text-red-500">
                {fieldErrors.pickupTime}
              </Text>
            )}
          </View>

          {/* ── Hạn sử dụng ── */}
          <View className="mb-6 gap-2">
            <Text className="font-label text-neutral-T50 ml-1 text-sm font-semibold">
              {t('post.expiryDate')}
            </Text>
            <TouchableOpacity
              className={`bg-neutral-T95 h-14 flex-row items-center justify-between rounded-xl border px-4 active:opacity-80 ${fieldErrors.expiryDate ? 'border-red-500' : 'border-neutral-T90'}`}
              onPress={() => openPicker('expiryDate', 'date')}
            >
              <Text className="font-body text-neutral-T10 text-base">
                {formatDate(expiryDate)}
              </Text>
              <MaterialIcons name="event" size={20} color="#AAABAB" />
            </TouchableOpacity>
            {fieldErrors.expiryDate && (
              <Text className="font-label ml-1 text-xs text-red-500">
                {fieldErrors.expiryDate}
              </Text>
            )}
          </View>

          {/* ── Location picker ── */}
          <View className="mb-2 gap-2">
            <Text className="font-label text-neutral-T50 ml-1 text-sm font-semibold">
              {t('post.pickupLocation')}
            </Text>
            <TouchableOpacity
              className="bg-neutral-T95 border-neutral-T90 h-14 flex-row items-center justify-between rounded-xl border px-4 active:opacity-80"
              onPress={() => setShowLocationPicker(true)}
            >
              <View className="flex-1 flex-row items-center gap-2">
                <MaterialIcons
                  name="location-on"
                  size={20}
                  color={pickedLocation ? '#296C24' : '#AAABAB'}
                />
                <Text
                  className="font-body flex-1 text-sm"
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

          {/* ── Save as template (inline, above footer) ── */}
          <TouchableOpacity
            className={`bg-primary-T95 border-primary-T70 mt-2 h-12 flex-row items-center justify-center gap-2 rounded-xl border active:opacity-80 ${!title.trim() ? 'opacity-40' : ''}`}
            onPress={() => setShowSaveModal(true)}
            disabled={!title.trim()}
            activeOpacity={0.8}
          >
            <MaterialIcons name="bookmark-add" size={18} color="#296C24" />
            <Text className="font-label text-primary-T40 text-sm font-semibold">
              {t('template.saveAsTemplate')}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── Fixed footer ── */}
      <View
        className="bg-neutral-T100 border-neutral-T90 absolute bottom-0 left-0 right-0 border-t"
        style={{
          paddingBottom: Math.max(insets.bottom, 16),
          paddingTop: 16,
          paddingHorizontal: 24,
        }}
      >
        <View className="flex-row gap-4">
          <TouchableOpacity
            className="bg-neutral-T95 h-14 flex-1 flex-row items-center justify-center gap-2 rounded-xl active:opacity-80"
            onPress={() => router.back()}
          >
            <MaterialIcons name="save" size={18} color="#757777" />
            <Text className="font-label text-neutral-T50 text-sm font-medium">
              {t('post.saveDraft')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-primary-T40 h-14 flex-1 flex-row items-center justify-center gap-2 rounded-xl shadow-sm active:opacity-80"
            onPress={handlePublish}
            disabled={isSendingPasscode}
          >
            {isSendingPasscode ? (
              <Text className="font-label text-neutral-T100 text-sm font-medium">
                {t('post.sendingCode')}
              </Text>
            ) : (
              <>
                <MaterialIcons name="check-circle" size={18} color="#FFFFFF" />
                <Text className="font-label text-neutral-T100 text-sm font-medium">
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
        onCancel={() => {
          setShowPasscode(false);
          setUploadedImageUrls(null);
          preUploadPromiseRef.current = null;
        }}
        onVerify={handleVerify}
        onResend={handleResendPasscode}
        isLoading={isSubmitting}
        deliveryMethod={deliveryMethod}
      />

      {/* ── Template picker sheet ── */}
      <TemplatePickerSheet
        visible={showTemplatePicker}
        onClose={() => setShowTemplatePicker(false)}
        onSelect={applyTemplate}
        onManage={() => router.push('/(post)/my-templates' as any)}
      />

      {/* ── Save form as template modal ── */}
      <SaveTemplateModal
        visible={showSaveModal}
        initialName={title.trim()}
        isSaving={isSavingTemplate}
        onSave={handleSaveFormAsTemplate}
        onCancel={() => setShowSaveModal(false)}
      />
    </View>
  );
}
