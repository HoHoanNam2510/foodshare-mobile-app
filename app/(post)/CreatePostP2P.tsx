/**
 * CreatePostP2P.tsx
 * "Share Food / Item" screen — P2P_FREE post creation
 * Stack: React Native · Expo · Nativewind v4 · @expo/vector-icons (Feather)
 * Design: The Editorial Harvest — "The Living Magazine"
 */

import { Feather } from '@expo/vector-icons';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// ─────────────────────────────────────────────
// Static Mock Data
// ─────────────────────────────────────────────
const MOCK_USER = {
  sharerId: 'user_mock_001',
  name: 'Nguyen Van A',
  address: '12 Phan Văn Trị, Bình Thạnh, TP.HCM',
  coordinates: { longitude: 106.714, latitude: 10.812 },
};

const CATEGORIES = [
  { id: 1, label: 'Fruit & Veg' },
  { id: 2, label: 'Bakery' },
  { id: 3, label: 'Dairy' },
  { id: 4, label: 'Pantry' },
  { id: 5, label: 'Beverages' },
  { id: 6, label: 'Non-food' },
  { id: 7, label: 'Other' },
];

const UNITS = ['item', 'kg', 'g', 'litre', 'dozen', 'pack', 'box'];

const MAX_IMAGES = 10;

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface FormState {
  title: string;
  categoryId: number | null;
  description: string;
  quantity: string;
  unit: string;
  isPerishable: boolean;
  expiryDate: Date | null;
  pickupNote: string;
  images: string[];
}

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

/** Section heading with subtle muted label */
const SectionLabel = ({ label }: { label: string }) => (
  <Text className="font-body text-xs uppercase tracking-widest text-text-muted mb-3">
    {label}
  </Text>
);

/** Thin spacer for tonal layering — no hard lines */
const Spacer = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const heights: Record<string, number> = { sm: 16, md: 28, lg: 40 };
  return <View style={{ height: heights[size] }} />;
};

/** Required asterisk */
const Required = () => <Text className="text-secondary font-body"> *</Text>;

// ─────────────────────────────────────────────
// Main Screen
// ─────────────────────────────────────────────
export default function CreatePostP2P() {
  // ── Form state ──
  const [form, setForm] = useState<FormState>({
    title: '',
    categoryId: null,
    description: '',
    quantity: '',
    unit: 'item',
    isPerishable: false,
    expiryDate: null,
    pickupNote: '',
    images: [],
  });

  // Unit dropdown open state
  const [unitOpen, setUnitOpen] = useState(false);
  // Date picker visibility (Android)
  const [showDatePicker, setShowDatePicker] = useState(false);

  // ── Handlers ──
  const updateField = useCallback(
    <K extends keyof FormState>(key: K, value: FormState[K]) =>
      setForm((prev) => ({ ...prev, [key]: value })),
    []
  );

  const handlePickImage = async () => {
    if (form.images.length >= MAX_IMAGES) {
      Alert.alert('Limit reached', `You can add up to ${MAX_IMAGES} photos.`);
      return;
    }
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission needed',
        'Allow photo library access to add images.'
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.85,
      selectionLimit: MAX_IMAGES - form.images.length,
    });
    if (!result.canceled) {
      const newUris = result.assets.map((a) => a.uri);
      updateField('images', [...form.images, ...newUris].slice(0, MAX_IMAGES));
    }
  };

  const handleRemoveImage = (index: number) => {
    const next = [...form.images];
    next.splice(index, 1);
    updateField('images', next);
  };

  const handleDateChange = (_: DateTimePickerEvent, selected?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selected) updateField('expiryDate', selected);
  };

  const handleSubmit = () => {
    if (!form.title.trim()) {
      Alert.alert('Required', 'Please add a title for your listing.');
      return;
    }
    if (!form.categoryId) {
      Alert.alert('Required', 'Please select a category.');
      return;
    }
    if (!form.quantity || Number(form.quantity) < 1) {
      Alert.alert('Required', 'Please enter a valid quantity.');
      return;
    }
    if (form.images.length === 0) {
      Alert.alert('Required', 'Please add at least one photo.');
      return;
    }

    const payload = {
      ownerId: MOCK_USER.sharerId,
      type: 'P2P_FREE' as const,
      category: CATEGORIES.find((c) => c.id === form.categoryId)?.label ?? '',
      title: form.title.trim(),
      description: form.description.trim(),
      images: form.images,
      totalQuantity: Number(form.quantity),
      remainingQuantity: Number(form.quantity),
      price: 0,
      expiryDate: form.expiryDate,
      pickupTime: { start: null, end: null },
      location: {
        type: 'Point' as const,
        coordinates: [
          MOCK_USER.coordinates.longitude,
          MOCK_USER.coordinates.latitude,
        ] as [number, number],
      },
      status: 'AVAILABLE' as const,
    };

    console.log('[CreatePostP2P] Submitting payload:', payload);
    Alert.alert('🌱 Listed!', `"${form.title}" is now live in your community.`);
  };

  // ─────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────
  return (
    <SafeAreaView className="flex-1 bg-surface">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* ── Header ── */}
        <View className="flex-row items-center justify-between px-6 pt-4 pb-3 bg-surface">
          <TouchableOpacity
            className="w-10 h-10 rounded-full bg-surface-lowest items-center justify-center"
            style={{
              shadowColor: '#191c1c',
              shadowOpacity: 0.05,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 2 },
              elevation: 2,
            }}
            activeOpacity={0.7}
          >
            <Feather name="x" size={20} color="#191c1c" />
          </TouchableOpacity>

          <Text className="font-sans text-lg font-bold text-text tracking-tight">
            Share Food / Item
          </Text>

          {/* Invisible placeholder to center title */}
          <View className="w-10" />
        </View>

        {/* ── Scroll body ── */}
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ══════════════════════════════════════
              IMAGE ADD SECTION
          ══════════════════════════════════════ */}
          <View className="px-6 pt-4">
            <SectionLabel label="Photos" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {/* Add button */}
              <TouchableOpacity
                onPress={handlePickImage}
                activeOpacity={0.75}
                className="bg-surface-lowest rounded-3xl items-center justify-center mr-3"
                style={{
                  width: 112,
                  height: 112,
                  shadowColor: '#296c24',
                  shadowOpacity: 0.06,
                  shadowRadius: 16,
                  shadowOffset: { width: 0, height: 4 },
                  elevation: 3,
                }}
              >
                <View className="bg-primary rounded-full p-2 mb-2">
                  <Feather name="camera" size={16} color="#fff" />
                </View>
                <Text className="font-body text-xs text-text-muted text-center leading-4">
                  + Add photos{'\n'}
                  <Text className="text-text-muted opacity-60">
                    ({form.images.length}/{MAX_IMAGES})
                  </Text>
                </Text>
              </TouchableOpacity>

              {/* Thumbnail strip */}
              {form.images.map((uri, idx) => (
                <View
                  key={idx}
                  className="mr-3 relative"
                  style={{ width: 112, height: 112 }}
                >
                  <Image
                    source={{ uri }}
                    className="w-full h-full rounded-3xl"
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    onPress={() => handleRemoveImage(idx)}
                    className="absolute top-1.5 right-1.5 bg-text rounded-full w-5 h-5 items-center justify-center"
                    activeOpacity={0.8}
                  >
                    <Feather name="x" size={11} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>

          <Spacer size="lg" />

          {/* ══════════════════════════════════════
              DETAILS SECTION
          ══════════════════════════════════════ */}
          <View className="px-6">
            <SectionLabel label="Details" />

            {/* Title */}
            <View className="mb-6">
              <Text className="font-body text-sm text-text mb-2">
                Title
                <Required />
              </Text>
              <TextInput
                value={form.title}
                onChangeText={(v) => updateField('title', v)}
                placeholder="e.g. Homemade lemon cake"
                placeholderTextColor="#9ea99d"
                className="font-body text-base text-text bg-surface-lowest rounded-2xl px-4 py-3.5"
                style={{
                  shadowColor: '#191c1c',
                  shadowOpacity: 0.04,
                  shadowRadius: 12,
                  shadowOffset: { width: 0, height: 2 },
                  elevation: 2,
                }}
                returnKeyType="next"
                maxLength={80}
              />
            </View>

            {/* Category chips */}
            <View className="mb-6">
              <Text className="font-body text-sm text-text mb-2">
                Category
                <Required />
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {CATEGORIES.map((cat) => {
                  const active = form.categoryId === cat.id;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      onPress={() => updateField('categoryId', cat.id)}
                      activeOpacity={0.75}
                      className={`px-4 py-2 rounded-full ${
                        active ? 'bg-primary-dark' : 'bg-surface-lowest'
                      }`}
                      style={
                        active
                          ? undefined
                          : {
                              shadowColor: '#191c1c',
                              shadowOpacity: 0.04,
                              shadowRadius: 8,
                              elevation: 1,
                            }
                      }
                    >
                      <Text
                        className={`font-body text-sm ${
                          active ? 'text-white' : 'text-text-muted'
                        }`}
                      >
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Description */}
            <View className="mb-6">
              <Text className="font-body text-sm text-text mb-2">
                Description
              </Text>
              <TextInput
                value={form.description}
                onChangeText={(v) => updateField('description', v)}
                placeholder="e.g. 2 x tins of veg soup, BB Dec 2024"
                placeholderTextColor="#9ea99d"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                className="font-body text-base text-text bg-surface-lowest rounded-2xl px-4 py-3.5"
                style={{
                  minHeight: 110,
                  shadowColor: '#191c1c',
                  shadowOpacity: 0.04,
                  shadowRadius: 12,
                  shadowOffset: { width: 0, height: 2 },
                  elevation: 2,
                }}
                maxLength={400}
              />
            </View>

            {/* Quantity + Unit */}
            <View className="mb-2">
              <Text className="font-body text-sm text-text mb-2">
                Quantity
                <Required />
              </Text>
              <View className="flex-row items-center gap-3">
                {/* Number input */}
                <TextInput
                  value={form.quantity}
                  onChangeText={(v) =>
                    updateField('quantity', v.replace(/[^0-9]/g, ''))
                  }
                  placeholder="0"
                  placeholderTextColor="#9ea99d"
                  keyboardType="number-pad"
                  className="font-body text-base text-text bg-surface-lowest rounded-2xl px-4 py-3.5 flex-1"
                  style={{
                    shadowColor: '#191c1c',
                    shadowOpacity: 0.04,
                    shadowRadius: 12,
                    shadowOffset: { width: 0, height: 2 },
                    elevation: 2,
                  }}
                  maxLength={4}
                />

                {/* Unit selector */}
                <View className="relative">
                  <TouchableOpacity
                    onPress={() => setUnitOpen((o) => !o)}
                    activeOpacity={0.8}
                    className="flex-row items-center gap-2 bg-surface-lowest rounded-2xl px-4 py-3.5"
                    style={{
                      shadowColor: '#191c1c',
                      shadowOpacity: 0.04,
                      shadowRadius: 12,
                      shadowOffset: { width: 0, height: 2 },
                      elevation: 2,
                      minWidth: 100,
                    }}
                  >
                    <Text className="font-body text-base text-text">
                      {form.unit}
                    </Text>
                    <Feather
                      name={unitOpen ? 'chevron-up' : 'chevron-down'}
                      size={14}
                      color="#6b7a6a"
                    />
                  </TouchableOpacity>

                  {unitOpen && (
                    <View
                      className="absolute right-0 bg-surface-lowest rounded-2xl overflow-hidden"
                      style={{
                        top: 52,
                        width: 120,
                        zIndex: 999,
                        shadowColor: '#191c1c',
                        shadowOpacity: 0.08,
                        shadowRadius: 20,
                        shadowOffset: { width: 0, height: 8 },
                        elevation: 10,
                      }}
                    >
                      {UNITS.map((u) => (
                        <TouchableOpacity
                          key={u}
                          onPress={() => {
                            updateField('unit', u);
                            setUnitOpen(false);
                          }}
                          className={`px-4 py-3 ${form.unit === u ? 'bg-primary' : ''}`}
                          activeOpacity={0.7}
                        >
                          <Text
                            className={`font-body text-sm ${
                              form.unit === u ? 'text-white' : 'text-text'
                            }`}
                          >
                            {u}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              </View>
            </View>
          </View>

          <Spacer size="lg" />

          {/* ══════════════════════════════════════
              PERISHABLE SECTION
          ══════════════════════════════════════ */}
          <View className="px-6">
            <SectionLabel label="Food Safety" />

            <View
              className="bg-surface-lowest rounded-2xl px-5 py-4"
              style={{
                shadowColor: '#191c1c',
                shadowOpacity: 0.04,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 2 },
                elevation: 2,
              }}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1 pr-4">
                  <Text className="font-body text-sm text-text">
                    Is the product perishable?
                  </Text>
                  <Text className="font-body text-xs text-text-muted mt-0.5">
                    Dairy, fresh produce, cooked meals, etc.
                  </Text>
                </View>
                <Switch
                  value={form.isPerishable}
                  onValueChange={(v) => {
                    updateField('isPerishable', v);
                    if (!v) updateField('expiryDate', null);
                  }}
                  trackColor={{ false: '#e0e4df', true: '#72B866' }}
                  thumbColor={form.isPerishable ? '#296C24' : '#ffffff'}
                />
              </View>

              {/* Expiry date — animatable reveal */}
              {form.isPerishable && (
                <View className="mt-4 pt-4" style={{ borderTopWidth: 0 }}>
                  <Text className="font-body text-xs text-text-muted mb-2 uppercase tracking-widest">
                    Use-by / Expiry date
                    <Required />
                  </Text>

                  <TouchableOpacity
                    onPress={() => setShowDatePicker(true)}
                    activeOpacity={0.8}
                    className="flex-row items-center gap-3 bg-surface rounded-xl px-4 py-3"
                  >
                    <Feather name="calendar" size={16} color="#296C24" />
                    <Text
                      className={`font-body text-sm flex-1 ${
                        form.expiryDate ? 'text-text' : 'text-text-muted'
                      }`}
                    >
                      {form.expiryDate
                        ? form.expiryDate.toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })
                        : 'Select expiry date'}
                    </Text>
                    <Feather name="chevron-right" size={14} color="#9ea99d" />
                  </TouchableOpacity>

                  {(showDatePicker || Platform.OS === 'ios') && (
                    <DateTimePicker
                      value={form.expiryDate ?? new Date()}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'inline' : 'default'}
                      minimumDate={new Date()}
                      onChange={handleDateChange}
                      accentColor="#296C24"
                    />
                  )}
                </View>
              )}
            </View>
          </View>

          <Spacer size="lg" />

          {/* ══════════════════════════════════════
              PICKUP SECTION
          ══════════════════════════════════════ */}
          <View className="px-6">
            <SectionLabel label="Pick-up" />
            <TextInput
              value={form.pickupNote}
              onChangeText={(v) => updateField('pickupNote', v)}
              placeholder="e.g. Every day after 6 PM, ring doorbell twice"
              placeholderTextColor="#9ea99d"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              className="font-body text-base text-text bg-surface-lowest rounded-2xl px-4 py-3.5"
              style={{
                minHeight: 88,
                shadowColor: '#191c1c',
                shadowOpacity: 0.04,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 2 },
                elevation: 2,
              }}
              maxLength={200}
            />
          </View>

          <Spacer size="lg" />

          {/* ══════════════════════════════════════
              LOCATION SECTION
          ══════════════════════════════════════ */}
          <View className="px-6">
            <SectionLabel label="Location" />

            <TouchableOpacity
              activeOpacity={0.85}
              className="bg-surface-lowest rounded-3xl overflow-hidden"
              style={{
                shadowColor: '#296c24',
                shadowOpacity: 0.07,
                shadowRadius: 20,
                shadowOffset: { width: 0, height: 6 },
                elevation: 4,
              }}
            >
              {/* Mock map tile — green gradient placeholder */}
              <View
                className="w-full"
                style={{
                  height: 140,
                  backgroundColor: '#e8f0e6',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {/* Grid lines for map feel */}
                {[...Array(5)].map((_, i) => (
                  <View
                    key={`h${i}`}
                    style={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      top: i * 28 + 14,
                      height: 1,
                      backgroundColor: '#d0dece',
                    }}
                  />
                ))}
                {[...Array(7)].map((_, i) => (
                  <View
                    key={`v${i}`}
                    style={{
                      position: 'absolute',
                      top: 0,
                      bottom: 0,
                      left: i * 56,
                      width: 1,
                      backgroundColor: '#d0dece',
                    }}
                  />
                ))}

                {/* Map pin */}
                <View className="items-center">
                  <View
                    className="bg-primary-dark rounded-full w-10 h-10 items-center justify-center"
                    style={{
                      shadowColor: '#296c24',
                      shadowOpacity: 0.35,
                      shadowRadius: 12,
                      shadowOffset: { width: 0, height: 4 },
                      elevation: 6,
                    }}
                  >
                    <Feather name="map-pin" size={18} color="#fff" />
                  </View>
                  {/* Pin tail */}
                  <View
                    style={{
                      width: 0,
                      height: 0,
                      borderLeftWidth: 5,
                      borderRightWidth: 5,
                      borderTopWidth: 8,
                      borderLeftColor: 'transparent',
                      borderRightColor: 'transparent',
                      borderTopColor: '#296C24',
                      marginTop: -1,
                    }}
                  />
                </View>
              </View>

              {/* Address row */}
              <View className="flex-row items-center px-4 py-3.5 gap-3">
                <View className="bg-primary rounded-full w-8 h-8 items-center justify-center">
                  <Feather name="navigation" size={13} color="#fff" />
                </View>
                <View className="flex-1">
                  <Text
                    className="font-body text-sm text-text leading-snug"
                    numberOfLines={1}
                  >
                    {MOCK_USER.address}
                  </Text>
                  <Text className="font-body text-xs text-text-muted mt-0.5">
                    Tap to adjust pin
                  </Text>
                </View>
                <Feather name="chevron-right" size={16} color="#9ea99d" />
              </View>
            </TouchableOpacity>
          </View>

          <Spacer size="lg" />

          {/* ══════════════════════════════════════
              IMPACT BANNER
          ══════════════════════════════════════ */}
          <View className="px-6">
            <View
              className="bg-primary-dark rounded-3xl px-6 py-5 flex-row items-center gap-4"
              style={{
                shadowColor: '#296c24',
                shadowOpacity: 0.18,
                shadowRadius: 24,
                shadowOffset: { width: 0, height: 8 },
                elevation: 6,
              }}
            >
              <View className="bg-primary rounded-2xl w-12 h-12 items-center justify-center">
                <Feather name="globe" size={22} color="#fff" />
              </View>
              <View className="flex-1">
                <Text className="font-sans text-xl font-bold text-white tracking-tight leading-6">
                  2,412 lbs
                </Text>
                <Text className="font-body text-xs text-white opacity-75 mt-0.5">
                  of food saved by this community
                </Text>
              </View>
              <Feather
                name="arrow-right"
                size={18}
                color="rgba(255,255,255,0.5)"
              />
            </View>
          </View>
        </ScrollView>

        {/* ── Footer Submit Button ── */}
        <View
          className="absolute bottom-0 left-0 right-0 px-6 bg-surface"
          style={{
            paddingBottom: Platform.OS === 'ios' ? 34 : 20,
            paddingTop: 14,
            shadowColor: '#191c1c',
            shadowOpacity: 0.06,
            shadowRadius: 24,
            shadowOffset: { width: 0, height: -8 },
            elevation: 12,
          }}
        >
          <TouchableOpacity
            onPress={handleSubmit}
            activeOpacity={0.85}
            className="bg-primary-dark rounded-full py-4 items-center justify-center flex-row gap-2"
            style={{
              shadowColor: '#296c24',
              shadowOpacity: 0.3,
              shadowRadius: 16,
              shadowOffset: { width: 0, height: 6 },
              elevation: 8,
            }}
          >
            <Feather name="check-circle" size={18} color="#fff" />
            <Text className="font-sans font-bold text-base text-white tracking-wide">
              List this item
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
