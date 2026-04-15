import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
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
import QuantityStepper from '@/components/post/QuantityStepper';
import StackHeader from '@/components/shared/headers/StackHeader';
import {
  ApiValidationError,
  getPostByIdApi,
  updatePostApi,
  type UpdatePostPayload,
} from '@/lib/postApi';
import { uploadMultipleImages } from '@/lib/uploadApi';

type ActivePicker = 'pickupStart' | 'pickupEnd' | 'expiryDate' | null;
type PickerMode = 'date' | 'time';

export default function EditPost() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();

  // ── Loading state ──
  const [isLoadingPost, setIsLoadingPost] = useState(true);
  const [postType, setPostType] = useState<'P2P_FREE' | 'B2C_MYSTERY_BAG'>('P2P_FREE');
  const [originalImages, setOriginalImages] = useState<string[]>([]);

  // ── Form state ──
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Home cooked');
  const [images, setImages] = useState<string[]>([]);

  const [pickupStart, setPickupStart] = useState(new Date());
  const [pickupEnd, setPickupEnd] = useState(new Date());
  const [expiryDate, setExpiryDate] = useState(new Date());

  // ── Picker UI state ──
  const [activePicker, setActivePicker] = useState<ActivePicker>(null);
  const [pickerMode, setPickerMode] = useState<PickerMode>('time');

  // ── Submit state ──
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const isB2C = postType === 'B2C_MYSTERY_BAG';

  // ── Load existing post data ──
  const loadPost = useCallback(async () => {
    if (!id) return;
    setIsLoadingPost(true);
    try {
      const res = await getPostByIdApi(id);
      const p = res.data;
      setPostType(p.type);
      setTitle(p.title);
      setDescription(p.description ?? '');
      setQuantity(p.totalQuantity);
      setPrice(p.price > 0 ? String(p.price) : '');
      setCategory(p.category);
      setImages(p.images);
      setOriginalImages(p.images);
      setPickupStart(new Date(p.pickupTime.start));
      setPickupEnd(new Date(p.pickupTime.end));
      setExpiryDate(new Date(p.expiryDate));
    } catch (e) {
      Alert.alert(t('common.error'), e instanceof Error ? e.message : t('post.errorLoad'), [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } finally {
      setIsLoadingPost(false);
    }
  }, [id, router]);

  useEffect(() => {
    loadPost();
  }, [loadPost]);

  // ── Helpers ──
  const formatTime = (d: Date) =>
    d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const formatDate = (d: Date) =>
    d.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });

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
    if (Platform.OS === 'android') setActivePicker(null);
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

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (images.length === 0) errors.images = t('post.errorImages');
    if (!title.trim()) errors.title = t('post.errorTitleRequired');
    if (isB2C && (!price || parseFloat(price) <= 0)) errors.price = t('post.errorPriceRequired');
    if (quantity < 1) errors.quantity = t('post.errorQuantityMin');
    if (pickupStart >= pickupEnd) errors.pickupTime = t('post.errorPickupTime');
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm() || !id) return;
    setIsSubmitting(true);
    try {
      // Upload new local images (file:// URIs), keep existing remote URLs
      const newLocalImages = images.filter((img) => !img.startsWith('http'));
      const existingRemoteImages = images.filter((img) => img.startsWith('http'));

      let uploadedUrls: string[] = [];
      if (newLocalImages.length > 0) {
        const results = await uploadMultipleImages(newLocalImages, 'posts');
        uploadedUrls = results.map((r) => r.url);
      }

      const finalImages = [...existingRemoteImages, ...uploadedUrls];

      const payload: UpdatePostPayload = {
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        images: finalImages,
        totalQuantity: quantity,
        expiryDate: expiryDate.toISOString(),
        pickupTime: {
          start: pickupStart.toISOString(),
          end: pickupEnd.toISOString(),
        },
      };

      if (isB2C) {
        payload.price = parseFloat(price) || 0;
      }

      const res = await updatePostApi(id, payload);

      if (res.success) {
        Alert.alert(t('common.success'), t('post.updateSuccess'), [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } else {
        Alert.alert(t('common.error'), res.message || t('common.error'));
      }
    } catch (err) {
      if (err instanceof ApiValidationError) {
        const errors: Record<string, string> = {};
        for (const fe of err.fieldErrors) {
          errors[fe.path] = fe.message;
        }
        setFieldErrors(errors);
        Alert.alert(t('post.validationError'), t('post.checkFields'));
      } else {
        Alert.alert(t('common.error'), err instanceof Error ? err.message : t('common.error'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Date picker modal ──
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
                  <Text className="font-label font-semibold text-neutral-T100">{t('common.done')}</Text>
                </TouchableOpacity>
              )}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    );
  };

  // ── Loading ──
  if (isLoadingPost) {
    return (
      <SafeAreaView className="flex-1 bg-neutral items-center justify-center" edges={['top']}>
        <ActivityIndicator size="large" color="#296C24" />
        <Text className="font-body text-sm text-neutral-T50 mt-3">{t('common.loading')}</Text>
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1 bg-neutral">
      <StackHeader
        title={t('post.editPost')}
        rightElement={
          <View className="bg-neutral-T95 px-3 py-1.5 rounded-full">
            <Text className="font-label text-[10px] font-semibold text-neutral-T50 uppercase tracking-wider">
              {isB2C ? t('post.b2cMysteryBag') : t('common.free')}
            </Text>
          </View>
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
                if (fieldErrors.images) setFieldErrors((e) => { const { images: _, ...rest } = e; return rest; });
              }}
            />
            {fieldErrors.images && (
              <Text className="text-xs text-red-500 font-label mt-1 ml-1">{fieldErrors.images}</Text>
            )}
          </View>

          {/* ── Form fields ── */}
          <View className="gap-6 mb-8">
            {/* Category */}
            <View className="gap-2">
              <Text className="font-label font-semibold text-sm text-neutral-T50 ml-1">{t('post.category')}</Text>
              <CategoryPicker selected={category} onSelect={setCategory} />
            </View>

            {/* Meal title */}
            <View className="gap-2">
              <Text className="font-label font-semibold text-sm text-neutral-T50 ml-1">{t('post.title')}</Text>
              <TextInput
                className={`w-full h-14 px-4 rounded-xl bg-neutral-T95 border font-body text-base text-neutral-T10 ${fieldErrors.title ? 'border-red-500' : 'border-neutral-T90'}`}
                placeholder={t('post.titlePlaceholder')}
                placeholderTextColor="#AAABAB"
                value={title}
                onChangeText={(text) => {
                  setTitle(text);
                  if (fieldErrors.title) setFieldErrors((e) => { const { title: _, ...rest } = e; return rest; });
                }}
              />
              {fieldErrors.title && (
                <Text className="text-xs text-red-500 font-label ml-1">{fieldErrors.title}</Text>
              )}
            </View>

            {/* Description */}
            <View className="gap-2">
              <Text className="font-label font-semibold text-sm text-neutral-T50 ml-1">{t('post.description')}</Text>
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

            {/* Price (B2C only) + Servings row */}
            <View className="flex-row gap-4">
              {isB2C && (
                <View className="flex-1 gap-2">
                  <Text className="font-label font-semibold text-sm text-neutral-T50 ml-1">{t('post.priceLabel')}</Text>
                  <View className="relative justify-center">
                    <Text className="absolute left-4 font-label font-semibold text-neutral-T50 z-10">đ</Text>
                    <TextInput
                      className={`w-full h-14 pl-8 pr-4 rounded-xl bg-neutral-T95 border font-body text-base text-neutral-T10 ${fieldErrors.price ? 'border-red-500' : 'border-neutral-T90'}`}
                      placeholder="0"
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
                    <Text className="text-xs text-red-500 font-label ml-1">{fieldErrors.price}</Text>
                  )}
                </View>
              )}
              <View className="flex-1 gap-2">
                <Text className="font-label font-semibold text-sm text-neutral-T50 ml-1">{t('post.quantity')}</Text>
                <QuantityStepper value={quantity} onChange={setQuantity} />
              </View>
            </View>
          </View>

          {/* ── Pickup window ── */}
          <View className={`rounded-2xl p-6 gap-4 mb-6 ${fieldErrors.pickupTime ? 'bg-red-50 border border-red-500' : 'bg-neutral-T95'}`}>
            <View className="flex-row items-center gap-2">
              <MaterialIcons name="schedule" size={20} color={fieldErrors.pickupTime ? '#EF4444' : '#296C24'} />
              <Text className="font-sans font-bold text-base text-neutral-T10">{t('post.pickupWindow')}</Text>
            </View>
            <View className="flex-row gap-4">
              <View className="flex-1 gap-1">
                <Text className="text-[10px] font-label font-semibold tracking-wider text-neutral-T70 ml-1">{t('post.from')}</Text>
                <TouchableOpacity
                  className="h-12 px-4 rounded-xl bg-neutral-T100 border border-neutral-T90 flex-row items-center justify-between active:opacity-80"
                  onPress={() => openPicker('pickupStart', 'time')}
                >
                  <Text className="font-body font-semibold text-neutral-T10">{formatTime(pickupStart)}</Text>
                  <MaterialIcons name="access-time" size={16} color="#AAABAB" />
                </TouchableOpacity>
              </View>
              <View className="flex-1 gap-1">
                <Text className="text-[10px] font-label font-semibold tracking-wider text-neutral-T70 ml-1">{t('post.to')}</Text>
                <TouchableOpacity
                  className="h-12 px-4 rounded-xl bg-neutral-T100 border border-neutral-T90 flex-row items-center justify-between active:opacity-80"
                  onPress={() => openPicker('pickupEnd', 'time')}
                >
                  <Text className="font-body font-semibold text-neutral-T10">{formatTime(pickupEnd)}</Text>
                  <MaterialIcons name="access-time" size={16} color="#AAABAB" />
                </TouchableOpacity>
              </View>
            </View>
            {fieldErrors.pickupTime && (
              <Text className="text-xs text-red-500 font-label ml-1">{fieldErrors.pickupTime}</Text>
            )}
          </View>

          {/* ── Expiry date ── */}
          <View className="gap-2 mb-6">
            <Text className="font-label font-semibold text-sm text-neutral-T50 ml-1">{t('post.expiryDate')}</Text>
            <TouchableOpacity
              className={`h-14 px-4 rounded-xl bg-neutral-T95 border flex-row items-center justify-between active:opacity-80 ${fieldErrors.expiryDate ? 'border-red-500' : 'border-neutral-T90'}`}
              onPress={() => openPicker('expiryDate', 'date')}
            >
              <Text className="font-body text-base text-neutral-T10">{formatDate(expiryDate)}</Text>
              <MaterialIcons name="event" size={20} color="#AAABAB" />
            </TouchableOpacity>
            {fieldErrors.expiryDate && (
              <Text className="text-xs text-red-500 font-label ml-1">{fieldErrors.expiryDate}</Text>
            )}
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
          <TouchableOpacity
            className="flex-1 h-14 bg-neutral-T95 rounded-xl items-center justify-center flex-row gap-2 active:opacity-80"
            onPress={() => router.back()}
          >
            <MaterialIcons name="close" size={18} color="#757777" />
            <Text className="font-label font-medium text-sm text-neutral-T50">{t('common.cancel')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 h-14 bg-primary-T40 rounded-xl items-center justify-center flex-row gap-2 shadow-sm active:opacity-80"
            onPress={handleSave}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <MaterialIcons name="check" size={18} color="#FFFFFF" />
                <Text className="font-label font-medium text-sm text-neutral-T100">{t('post.saveChanges')}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Date/time picker modal ── */}
      {renderPickerModal()}
    </View>
  );
}
