import { MaterialIcons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { useColorScheme } from 'nativewind';
import ImagePickerSection from '@/components/post/ImagePickerSection';
import FormInput from '@/components/shared/FormInput';
import StackHeader from '@/components/shared/headers/StackHeader';
import { createFeedbackApi, type FeedbackType } from '@/lib/feedbackApi';
import { uploadMultipleImages } from '@/lib/uploadApi';

// ── Type selector config ──────────────────────────────────────────────────────

interface TypeOption {
  value: FeedbackType;
  labelKey: string;
  descKey: string;
  icon: string;
}

const TYPE_OPTIONS: TypeOption[] = [
  {
    value: 'BUG_REPORT',
    labelKey: 'feedback.typeBugReportFull',
    descKey: 'feedback.typeBugReportDesc',
    icon: 'bug-report',
  },
  {
    value: 'SUGGESTION',
    labelKey: 'feedback.typeSuggestionFull',
    descKey: 'feedback.typeSuggestionDesc',
    icon: 'lightbulb',
  },
];

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function FeedbackCreateScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { relatedEntityId } = useLocalSearchParams<{
    relatedEntityId?: string;
  }>();

  const [selectedType, setSelectedType] = useState<FeedbackType | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [titleError, setTitleError] = useState('');
  const [contentError, setContentError] = useState('');

  const validate = (): boolean => {
    let valid = true;

    if (!selectedType) {
      Alert.alert(t('feedback.missingTypeTitle'), t('feedback.missingTypeMsg'));
      return false;
    }

    if (title.trim().length < 5) {
      setTitleError(t('feedback.titleMinError'));
      valid = false;
    } else if (title.trim().length > 100) {
      setTitleError(t('feedback.titleMaxError'));
      valid = false;
    } else {
      setTitleError('');
    }

    if (content.trim().length < 10) {
      setContentError(t('feedback.contentMinError'));
      valid = false;
    } else if (content.trim().length > 500) {
      setContentError(t('feedback.contentMaxError'));
      valid = false;
    } else {
      setContentError('');
    }

    return valid;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      let attachmentUrls: string[] = [];

      if (images.length > 0) {
        const uploaded = await uploadMultipleImages(images, 'feedbacks');
        attachmentUrls = uploaded.map((r) => r.url);
      }

      const os = Platform.OS as 'ios' | 'android' | 'web';
      const appVersion = Constants.expoConfig?.version;

      await createFeedbackApi({
        type: selectedType!,
        title: title.trim(),
        content: content.trim(),
        attachments: attachmentUrls,
        contextMetadata: {
          os,
          ...(appVersion && { appVersion }),
          ...(relatedEntityId && { relatedEntityId }),
        },
      });

      Alert.alert(t('feedback.submitSuccess'), t('feedback.submitSuccessMsg'), [
        { text: t('common.close'), onPress: () => router.back() },
      ]);
    } catch (err: unknown) {
      let msg = t('feedback.submitError');
      let is429 = false;
      if (err && typeof err === 'object' && 'response' in err) {
        const r = (
          err as { response: { data?: { message?: string }; status?: number } }
        ).response;
        msg = r?.data?.message ?? msg;
        is429 = r?.status === 429;
      } else if (err instanceof Error) {
        msg = err.message;
      }
      if (is429) {
        Alert.alert(t('feedback.rateLimitTitle'), msg);
      } else {
        Alert.alert(t('common.error'), msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const canSubmit =
    !!selectedType &&
    title.trim().length >= 5 &&
    content.trim().length >= 10 &&
    !isSubmitting;

  return (
    <View className="bg-neutral dark:bg-neutral-T10 flex-1">
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      <StackHeader title={t('feedback.createTitle')} />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Type Selector ── */}
          <View className="mx-4 mt-4 gap-2">
            <Text
              className="text-neutral-T10 dark:text-neutral-T90 text-base"
              style={{ fontFamily: 'Epilogue', fontWeight: '700' }}
            >
              {t('feedback.typeLabel')}
            </Text>

            <View className="gap-3">
              {TYPE_OPTIONS.map((option) => {
                const isSelected = selectedType === option.value;
                return (
                  <TouchableOpacity
                    key={option.value}
                    activeOpacity={0.8}
                    onPress={() => setSelectedType(option.value)}
                    className="bg-neutral-T100 dark:bg-neutral-T20 flex-row items-center gap-3 rounded-2xl p-4"
                    style={[styles.card, isSelected && styles.cardSelected]}
                  >
                    <View
                      className="h-10 w-10 items-center justify-center rounded-xl"
                      style={{
                        backgroundColor: isSelected
                          ? '#296C24'
                          : isDark
                            ? '#003A03'
                            : '#F0F4F0',
                      }}
                    >
                      <MaterialIcons
                        name={option.icon as any}
                        size={20}
                        color={isSelected ? '#FFFFFF' : '#296C24'}
                      />
                    </View>
                    <View className="flex-1 gap-0.5">
                      <Text
                        className="font-label text-neutral-T10 dark:text-neutral-T90 text-sm"
                        style={{ fontWeight: isSelected ? '700' : '600' }}
                      >
                        {t(option.labelKey)}
                      </Text>
                      <Text
                        className="font-body text-neutral-T50 dark:text-neutral-T60 text-xs"
                        numberOfLines={1}
                      >
                        {t(option.descKey)}
                      </Text>
                    </View>
                    <View
                      className="h-5 w-5 items-center justify-center rounded-full border-2"
                      style={{
                        borderColor: isSelected ? '#296C24' : '#C8CACA',
                        backgroundColor: isSelected ? '#296C24' : 'transparent',
                      }}
                    >
                      {isSelected && (
                        <MaterialIcons name="check" size={12} color="#FFFFFF" />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* ── Title ── */}
          <View className="mx-4 mt-5">
            <FormInput
              label={t('feedback.titleLabel')}
              value={title}
              onChangeText={(text) => {
                setTitle(text);
                if (titleError) setTitleError('');
              }}
              placeholder={t('feedback.titlePlaceholder')}
              errorMessage={titleError}
            />
            <Text className="font-body text-neutral-T70 dark:text-neutral-T60 mt-1 text-right text-xs">
              {title.trim().length}/100
            </Text>
          </View>

          {/* ── Content ── */}
          <View className="mx-4 mt-4">
            <FormInput
              label={t('feedback.contentDetailLabel')}
              value={content}
              onChangeText={(text) => {
                setContent(text);
                if (contentError) setContentError('');
              }}
              placeholder={t('feedback.contentPlaceholder')}
              multiline
              errorMessage={contentError}
            />
            <Text className="font-body text-neutral-T70 dark:text-neutral-T60 mt-1 text-right text-xs">
              {content.trim().length}/500
            </Text>
          </View>

          {/* ── Images ── */}
          <View className="mx-4 mt-4">
            <ImagePickerSection
              images={images}
              onImagesChange={setImages}
              maxImages={3}
            />
          </View>

          {/* ── Rate limit note ── */}
          <View className="mx-4 mt-4 flex-row gap-2 rounded-xl bg-blue-50 p-3 dark:bg-blue-950/30">
            <MaterialIcons
              name="info-outline"
              size={16}
              color="#1D4ED8"
              style={{ marginTop: 1 }}
            />
            <Text
              className="font-body flex-1 text-xs leading-4"
              style={{ color: '#1D4ED8' }}
            >
              {t('feedback.rateLimitNote')}
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── Submit Button ── */}
      <View
        className="bg-neutral-T100 dark:bg-neutral-T20 border-neutral-T90 dark:border-neutral-T30 absolute bottom-0 left-0 right-0 border-t px-4 pt-3"
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={!canSubmit}
          activeOpacity={0.85}
          className="h-14 flex-row items-center justify-center gap-2 rounded-xl"
          style={{ backgroundColor: canSubmit ? '#296C24' : '#E0E0E0' }}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <MaterialIcons
                name="send"
                size={18}
                color={canSubmit ? '#FFFFFF' : '#AAABAB'}
              />
              <Text
                className="font-label text-base font-semibold"
                style={{ color: canSubmit ? '#FFFFFF' : '#AAABAB' }}
              >
                {t('feedback.submitBtn')}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  cardSelected: {
    shadowColor: '#296C24',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1.5,
    borderColor: '#296C24',
  },
});
