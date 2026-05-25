import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import ImagePickerSection from '@/components/post/ImagePickerSection';
import StackHeader from '@/components/shared/headers/StackHeader';
import SectionLabel from '@/components/shared/SectionLabel';
import { resubmitKycApi } from '@/lib/profileApi';
import { uploadImage } from '@/lib/uploadApi';
import { useAuthStore } from '@/stores/authStore';

export default function KycResubmit() {
  const { t } = useTranslation();
  const router = useRouter();
  const fetchProfile = useAuthStore((s) => s.fetchProfile);

  const [kycDocuments, setKycDocuments] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLocalUri = (uri: string): boolean =>
    uri.startsWith('file://') || uri.startsWith('content://');

  const handleSubmit = async (): Promise<void> => {
    if (kycDocuments.length === 0) {
      Alert.alert(t('profile.missingKycTitle'), t('profile.missingKycMsg'));
      return;
    }

    setIsSubmitting(true);
    try {
      const uploadedDocs = await Promise.all(
        kycDocuments.map(async (uri) => {
          if (isLocalUri(uri)) {
            const result = await uploadImage(uri, 'kyc');
            return result.url;
          }
          return uri;
        })
      );

      const res = await resubmitKycApi(uploadedDocs);

      if (res.success) {
        await fetchProfile();
        Alert.alert(t('common.success'), t('profile.kycResubmitSuccessMsg'), [
          { text: 'OK', onPress: () => router.back() },
        ]);
      }
    } catch (error: unknown) {
      const msg =
        error instanceof Error ? error.message : t('profile.kycResubmitFailed');
      Alert.alert(t('common.error'), msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="bg-neutral dark:bg-neutral-T10 flex-1">
      <StackHeader title={t('profile.kycResubmitTitle')} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 24,
            paddingHorizontal: 24,
            paddingTop: 24,
          }}
          className="flex-1"
          keyboardShouldPersistTaps="handled"
        >
          <View className="gap-5">
            {/* Info banner */}
            <View className="bg-secondary-T95 dark:bg-secondary-T20 border-secondary-T70 dark:border-secondary-T40 flex-row gap-3 rounded-2xl border p-4">
              <MaterialIcons name="info-outline" size={22} color="#6B5E00" />
              <View className="flex-1">
                <Text className="font-body text-secondary-T30 dark:text-secondary-T80 text-sm leading-5">
                  {t('profile.kycResubmitBanner')}
                </Text>
              </View>
            </View>

            {/* KYC Documents */}
            <SectionLabel
              icon="verified-user"
              label={t('profile.kycSection')}
            />

            <Text className="font-body text-neutral-T50 dark:text-neutral-T60 -mt-2 text-xs">
              {t('profile.kycHint')}
            </Text>

            <ImagePickerSection
              images={kycDocuments}
              onImagesChange={setKycDocuments}
              maxImages={5}
            />

            {/* Submit button */}
            <TouchableOpacity
              className="bg-primary-T40 dark:bg-primary-T50 mt-2 h-14 items-center justify-center rounded-xl active:opacity-80"
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text className="font-label text-neutral-T100 text-base font-bold">
                  {t('profile.kycResubmitSubmitBtn')}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
