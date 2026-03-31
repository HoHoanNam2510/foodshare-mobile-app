import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
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
    if (activePicker === 'pickupStart') setPickupStart(selected);
    else if (activePicker === 'pickupEnd') setPickupEnd(selected);
    else if (activePicker === 'expiryDate') setExpiryDate(selected);
  };

  const handlePublish = () => {
    if (!title.trim() || images.length === 0) return;
    setShowPasscode(true);
  };

  const handleVerify = async (_passcode: string) => {
    setIsSubmitting(true);
    try {
      // TODO: call POST /api/posts with form data
      router.push('/(post)/post-list' as any);
    } catch (err) {
      console.error('Failed to publish post:', err);
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
              className="bg-neutral-T100 rounded-t-3xl px-6 pt-4 pb-6 gap-4"
              style={{ paddingBottom: Math.max(insets.bottom, 24) + 8 }}
            >
              <View className="w-10 h-1 bg-neutral-T80 rounded-full self-center mb-2" />
              <DateTimePicker
                value={getPickerValue()}
                mode={pickerMode}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
                style={{ width: '100%' }}
              />
              {Platform.OS === 'ios' && (
                <TouchableOpacity
                  className="h-14 bg-primary-T40 rounded-xl items-center justify-center shadow-sm active:opacity-80"
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
            <ImagePickerSection images={images} onImagesChange={setImages} />
          </View>

          {/* ── Form fields ── */}
          <View className="gap-6 mb-8">
            {/* Meal title */}
            <View className="gap-2">
              <Text className="font-label font-semibold text-sm text-neutral-T50 ml-1">
                Meal title
              </Text>
              <TextInput
                className="w-full h-14 px-4 rounded-xl bg-neutral-T95 border border-neutral-T90 font-body text-base text-neutral-T10"
                placeholder="e.g. Homemade Vegetarian Lasagna"
                placeholderTextColor="#AAABAB"
                value={title}
                onChangeText={setTitle}
              />
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
                      className="w-full h-14 pl-8 pr-4 rounded-xl bg-neutral-T95 border border-neutral-T90 font-body text-base text-neutral-T10"
                      placeholder="0.00"
                      placeholderTextColor="#AAABAB"
                      keyboardType="decimal-pad"
                      value={price}
                      onChangeText={setPrice}
                    />
                  </View>
                </View>
              )}
              <View className="flex-1 gap-2">
                <Text className="font-label font-semibold text-sm text-neutral-T50 ml-1">
                  Servings
                </Text>
                <QuantityStepper value={quantity} onChange={setQuantity} />
              </View>
            </View>

            {/* Category */}
            <View className="gap-2">
              <Text className="font-label font-semibold text-sm text-neutral-T50 ml-1">
                Category
              </Text>
              <CategoryPicker selected={category} onSelect={setCategory} />
            </View>
          </View>

          {/* ── Pickup window ── */}
          <View className="bg-neutral-T95 rounded-2xl p-6 gap-4 mb-6">
            <View className="flex-row items-center gap-2">
              <MaterialIcons name="schedule" size={20} color="#296C24" />
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
          </View>

          {/* ── Expiry date ── */}
          <View className="gap-2 mb-6">
            <Text className="font-label font-semibold text-sm text-neutral-T50 ml-1">
              Expiry date
            </Text>
            <TouchableOpacity
              className="h-14 px-4 rounded-xl bg-neutral-T95 border border-neutral-T90 flex-row items-center justify-between active:opacity-80"
              onPress={() => openPicker('expiryDate', 'date')}
            >
              <Text className="font-body text-base text-neutral-T10">
                {formatDate(expiryDate)}
              </Text>
              <MaterialIcons name="event" size={20} color="#AAABAB" />
            </TouchableOpacity>
          </View>

          {/* ── Location (placeholder) ── */}
          <View className="bg-neutral-T100 rounded-2xl overflow-hidden shadow-sm border border-neutral-T90 mb-4">
            <View className="h-32 bg-neutral-T95 items-center justify-center gap-1">
              <MaterialIcons name="location-on" size={40} color="#76BC69" />
              <Text className="font-label text-xs text-neutral-T70">
                Map preview coming soon
              </Text>
            </View>
            <View className="p-4 flex-row items-center justify-between">
              <View className="flex-1 mr-3">
                <Text className="font-sans font-bold text-sm text-neutral-T10">
                  Pickup location
                </Text>
                <Text
                  className="text-xs text-neutral-T50 font-body mt-0.5"
                  numberOfLines={1}
                >
                  Tap to set your pickup address
                </Text>
              </View>
              <TouchableOpacity className="px-4 py-2 rounded-lg bg-neutral-T95 active:opacity-80">
                <Text className="font-label text-xs font-semibold text-primary-T40">
                  Change
                </Text>
              </TouchableOpacity>
            </View>
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
              Save draft
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 h-14 bg-primary-T40 rounded-xl items-center justify-center flex-row gap-2 shadow-sm active:opacity-80"
            onPress={handlePublish}
          >
            <MaterialIcons name="check-circle" size={18} color="#FFFFFF" />
            <Text className="font-label font-medium text-sm text-neutral-T100">
              Publish meal
            </Text>
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
        isLoading={isSubmitting}
      />
    </SafeAreaView>
  );
}
