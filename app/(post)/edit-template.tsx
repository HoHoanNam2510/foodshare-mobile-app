import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import CategoryPicker from '@/components/post/CategoryPicker';
import ImagePickerSection from '@/components/post/ImagePickerSection';
import QuantityStepper from '@/components/post/QuantityStepper';
import ManagementHeader from '@/components/shared/headers/ManagementHeader';
import { getMyTemplatesApi, updateTemplateApi } from '@/lib/postTemplateApi';
import { uploadImage } from '@/lib/uploadApi';

function isCloudinaryUrl(uri: string): boolean {
  return uri.startsWith('http://') || uri.startsWith('https://');
}

export default function EditTemplateScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [templateName, setTemplateName] = useState('');
  const [type, setType] = useState<'P2P_FREE' | 'B2C_MYSTERY_BAG'>('P2P_FREE');
  const [category, setCategory] = useState('Home cooked');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState('');

  const isB2C = type === 'B2C_MYSTERY_BAG';

  // Load template data
  useEffect(() => {
    async function load() {
      try {
        const templates = await getMyTemplatesApi();
        const template = templates.find((tpl) => tpl._id === id);
        if (!template) {
          Alert.alert(t('common.error'), t('template.templateNotFound'), [
            { text: 'OK', onPress: () => router.back() },
          ]);
          return;
        }
        setTemplateName(template.templateName);
        setType(template.type);
        setCategory(template.category);
        setTitle(template.title);
        setDescription(template.description ?? '');
        setImages(template.images);
        setQuantity(template.totalQuantity);
        setPrice(template.price > 0 ? String(template.price) : '');
      } catch {
        Alert.alert(t('common.error'), t('template.loadTemplateError'), [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [id, t, router]);

  const validateForm = (): boolean => {
    if (!templateName.trim()) {
      Alert.alert(t('common.error'), t('template.missingName'));
      return false;
    }
    if (!title.trim()) {
      Alert.alert(t('common.error'), t('template.missingTitle'));
      return false;
    }
    if (isB2C && (!price || parseFloat(price) <= 0)) {
      Alert.alert(t('common.error'), t('template.missingPrice'));
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setIsSaving(true);
    try {
      const resolvedImages = await Promise.all(
        images.map(async (uri) => {
          if (isCloudinaryUrl(uri)) return uri;
          const result = await uploadImage(uri, 'posts');
          return result.url;
        })
      );

      await updateTemplateApi(id, {
        templateName: templateName.trim(),
        type,
        category,
        title: title.trim(),
        description: description.trim() || undefined,
        images: resolvedImages,
        totalQuantity: quantity,
        price: isB2C ? parseFloat(price) : 0,
      });

      router.back();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : t('template.updateFailed');
      Alert.alert(t('common.error'), message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View className="bg-neutral flex-1">
        <ManagementHeader
          title={t('template.editScreenTitle')}
          onBack={() => router.back()}
        />
        <View className="flex-1 items-center justify-center gap-3">
          <ActivityIndicator size="large" color="#296C24" />
          <Text className="font-body text-neutral-T50 text-sm">
            {t('common.loading')}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="bg-neutral flex-1">
      <ManagementHeader
        title={t('template.editScreenTitle')}
        onBack={() => router.back()}
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
          {/* Template name */}
          <View className="mb-6 gap-2">
            <Text className="font-label text-neutral-T50 ml-1 text-sm font-semibold">
              {t('template.fieldTemplateName')}
            </Text>
            <TextInput
              className="bg-neutral-T95 border-neutral-T90 font-body text-neutral-T10 h-14 w-full rounded-xl border px-4 text-base"
              placeholder={t('template.fieldTemplateNamePlaceholder')}
              placeholderTextColor="#AAABAB"
              value={templateName}
              onChangeText={setTemplateName}
            />
          </View>

          {/* Post type */}
          <View className="mb-6 gap-2">
            <Text className="font-label text-neutral-T50 ml-1 text-sm font-semibold">
              {t('template.fieldPostType')}
            </Text>
            <View className="flex-row gap-3">
              {(
                [
                  { value: 'P2P_FREE', labelKey: 'template.typeFree' },
                  { value: 'B2C_MYSTERY_BAG', labelKey: 'template.typeBag' },
                ] as const
              ).map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  className={`h-12 flex-1 items-center justify-center rounded-xl border ${type === opt.value ? 'bg-primary-T95 border-primary-T70' : 'bg-neutral-T95 border-neutral-T90'}`}
                  onPress={() => {
                    setType(opt.value);
                    if (opt.value === 'P2P_FREE') setPrice('');
                  }}
                  activeOpacity={0.8}
                >
                  <Text
                    className={`font-label text-sm font-semibold ${type === opt.value ? 'text-primary-T40' : 'text-neutral-T50'}`}
                  >
                    {t(opt.labelKey)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Images */}
          <View className="mb-8">
            <ImagePickerSection images={images} onImagesChange={setImages} />
          </View>

          {/* Category */}
          <View className="mb-6 gap-2">
            <Text className="font-label text-neutral-T50 ml-1 text-sm font-semibold">
              {t('post.category')}
            </Text>
            <CategoryPicker selected={category} onSelect={setCategory} />
          </View>

          {/* Food name */}
          <View className="mb-6 gap-2">
            <Text className="font-label text-neutral-T50 ml-1 text-sm font-semibold">
              {t('template.fieldFoodName')}
            </Text>
            <TextInput
              className="bg-neutral-T95 border-neutral-T90 font-body text-neutral-T10 h-14 w-full rounded-xl border px-4 text-base"
              placeholder={t('post.titlePlaceholder')}
              placeholderTextColor="#AAABAB"
              value={title}
              onChangeText={setTitle}
            />
          </View>

          {/* Description */}
          <View className="mb-6 gap-2">
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

          {/* Price (B2C) + Servings */}
          <View className="mb-6 flex-row gap-4">
            {isB2C && (
              <View className="flex-1 gap-2">
                <Text className="font-label text-neutral-T50 ml-1 text-sm font-semibold">
                  {t('template.fieldPrice')}
                </Text>
                <View className="relative justify-center">
                  <TextInput
                    className="bg-neutral-T95 border-neutral-T90 font-body text-neutral-T10 h-14 w-full rounded-xl border pl-4 pr-10 text-base"
                    placeholder="0"
                    placeholderTextColor="#AAABAB"
                    keyboardType="number-pad"
                    value={price}
                    onChangeText={setPrice}
                  />
                  <Text className="font-label text-neutral-T50 absolute right-4 z-10 font-semibold">
                    ₫
                  </Text>
                </View>
              </View>
            )}
            <View className="flex-1 gap-2">
              <Text className="font-label text-neutral-T50 ml-1 text-sm font-semibold">
                {t('template.fieldServings')}
              </Text>
              <QuantityStepper value={quantity} onChange={setQuantity} />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Fixed footer */}
      <View
        className="bg-neutral-T100 border-neutral-T90 absolute bottom-0 left-0 right-0 border-t"
        style={{
          paddingBottom: Math.max(insets.bottom, 16),
          paddingTop: 16,
          paddingHorizontal: 24,
        }}
      >
        <TouchableOpacity
          className="bg-primary-T40 h-14 flex-row items-center justify-center gap-2 rounded-xl shadow-sm active:opacity-80"
          onPress={handleSave}
          disabled={isSaving}
          activeOpacity={0.85}
        >
          {isSaving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <MaterialIcons name="check-circle" size={18} color="#fff" />
              <Text className="font-label text-neutral-T100 text-sm font-semibold">
                {t('template.saveChanges')}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
