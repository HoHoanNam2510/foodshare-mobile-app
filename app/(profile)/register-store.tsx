import { MaterialIcons } from '@expo/vector-icons';
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
import ImagePickerSection from '@/components/post/ImagePickerSection';
import StackHeader from '@/components/shared/headers/StackHeader';
import FormInput from '@/components/shared/FormInput';
import SectionLabel from '@/components/shared/SectionLabel';
import { registerStoreApi } from '@/lib/profileApi';
import { uploadImage } from '@/lib/uploadApi';
import { useAuthStore } from '@/stores/authStore';

export default function RegisterStore() {
  const { t } = useTranslation();
  const router = useRouter();
  const fetchProfile = useAuthStore((s) => s.fetchProfile);
  const user = useAuthStore((s) => s.user);

  // Store info
  const [businessName, setBusinessName] = useState('');
  const [openHours, setOpenHours] = useState('');
  const [closeHours, setCloseHours] = useState('');
  const [description, setDescription] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');

  // KYC documents
  const [kycDocuments, setKycDocuments] = useState<string[]>([]);

  // Payment info (thông tin nhận tiền)
  const [momoPhone, setMomoPhone] = useState('');
  // const [zalopayPhone, setZalopayPhone] = useState(''); // TODO: Re-enable when ZaloPay is ready
  const [bankName, setBankName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankAccountName, setBankAccountName] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLocalUri = (uri: string): boolean =>
    uri.startsWith('file://') || uri.startsWith('content://');

  const handleSubmit = async (): Promise<void> => {
    // Kiểm tra hồ sơ cá nhân trước
    const missingFields: string[] = [];
    if (!user?.phoneNumber?.trim()) missingFields.push('số điện thoại');
    if (!user?.defaultAddress?.trim()) missingFields.push('địa chỉ mặc định');
    if (missingFields.length > 0) {
      Alert.alert(
        t('profile.profileIncompleteTitle'),
        t('profile.profileIncompleteMsg', { missing: missingFields.join(' và ') }),
        [
          { text: t('common.later'), style: 'cancel' },
          { text: t('profile.updateNow'), onPress: () => router.push('/(profile)/edit-profile') },
        ]
      );
      return;
    }

    // Validate required fields
    if (!businessName.trim()) {
      Alert.alert(t('profile.missingInfoTitle'), t('profile.missingBusinessName'));
      return;
    }
    if (!openHours.trim() || !closeHours.trim()) {
      Alert.alert(t('profile.missingInfoTitle'), t('profile.missingHours'));
      return;
    }
    if (!businessAddress.trim()) {
      Alert.alert(t('profile.missingInfoTitle'), t('profile.missingBusinessAddress'));
      return;
    }
    if (kycDocuments.length === 0) {
      Alert.alert(t('profile.missingKycTitle'), t('profile.missingKycMsg'));
      return;
    }

    setIsSubmitting(true);
    try {
      // Upload KYC documents
      const uploadedDocs = await Promise.all(
        kycDocuments.map(async (uri) => {
          if (isLocalUri(uri)) {
            const result = await uploadImage(uri, 'kyc');
            return result.url;
          }
          return uri;
        })
      );

      // Build paymentInfo — chỉ gửi nếu có ít nhất 1 trường
      const paymentInfo: Record<string, string> = {};
      if (momoPhone.trim()) paymentInfo.momoPhone = momoPhone.trim();
      // if (zalopayPhone.trim()) paymentInfo.zalopayPhone = zalopayPhone.trim(); // TODO: Re-enable when ZaloPay is ready
      if (bankName.trim()) paymentInfo.bankName = bankName.trim();
      if (bankAccountNumber.trim()) paymentInfo.bankAccountNumber = bankAccountNumber.trim();
      if (bankAccountName.trim()) paymentInfo.bankAccountName = bankAccountName.trim();

      const res = await registerStoreApi({
        storeInfo: {
          businessName: businessName.trim(),
          openHours: openHours.trim(),
          closeHours: closeHours.trim(),
          description: description.trim() || undefined,
          businessAddress: businessAddress.trim(),
        },
        kycDocuments: uploadedDocs,
        ...(Object.keys(paymentInfo).length > 0 && { paymentInfo }),
      });

      if (res.success) {
        await fetchProfile();
        Alert.alert(
          t('common.success'),
          t('profile.registerSuccessMsg'),
          [{ text: 'OK', onPress: () => router.back() }]
        );
      }
    } catch (error: unknown) {
      const msg =
        error instanceof Error ? error.message : t('profile.registerStoreFailed');
      Alert.alert(t('common.error'), msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-neutral-DEFAULT">
      <StackHeader title={t('profile.registerStore')} />

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
            <View className="bg-secondary-T95 border border-secondary-T70 rounded-2xl p-4 flex-row gap-3">
              <MaterialIcons name="info-outline" size={22} color="#6B5E00" />
              <View className="flex-1">
                <Text className="font-body text-sm text-secondary-T30 leading-5">
                  {t('profile.registerStoreBanner')}
                </Text>
              </View>
            </View>

            {/* Store Details */}
            <SectionLabel icon="storefront" label={t('profile.storeInfoSection')} />

            <FormInput
              label={`${t('profile.businessNameLabel')} *`}
              value={businessName}
              onChangeText={setBusinessName}
              placeholder="VD: Tiệm bánh mì Sài Gòn"
            />

            <View className="flex-row gap-3">
              <View className="flex-1">
                <FormInput
                  label={`${t('profile.openHoursLabel')} *`}
                  value={openHours}
                  onChangeText={setOpenHours}
                  placeholder="06:00"
                />
              </View>
              <View className="flex-1">
                <FormInput
                  label={`${t('profile.closeHoursLabel')} *`}
                  value={closeHours}
                  onChangeText={setCloseHours}
                  placeholder="22:00"
                />
              </View>
            </View>

            <FormInput
              label={`${t('profile.businessAddressLabel')} *`}
              value={businessAddress}
              onChangeText={setBusinessAddress}
              placeholder="123 Nguyễn Trãi, Q.1, TP.HCM"
            />

            <FormInput
              label={t('profile.storeDescriptionLabel')}
              value={description}
              onChangeText={setDescription}
              placeholder={t('profile.storeDescriptionPlaceholder')}
              multiline
            />

            {/* KYC Documents */}
            <SectionLabel icon="verified-user" label={t('profile.kycSection')} />

            <Text className="font-body text-xs text-neutral-T50 -mt-2">
              {t('profile.kycHint')}
            </Text>

            <ImagePickerSection
              images={kycDocuments}
              onImagesChange={setKycDocuments}
              maxImages={5}
            />

            {/* Payment Info */}
            <SectionLabel icon="account-balance" label={t('profile.paymentSection')} />

            <Text className="font-body text-xs text-neutral-T50 -mt-2">
              {t('profile.paymentHint')}
            </Text>

            <FormInput
              label={t('profile.momoLabel')}
              value={momoPhone}
              onChangeText={setMomoPhone}
              placeholder="0912345678"
              keyboardType="phone-pad"
            />

            {/* TODO: Re-enable when ZaloPay is ready */}
            {/* <FormInput
              label="SĐT ZaloPay"
              value={zalopayPhone}
              onChangeText={setZalopayPhone}
              placeholder="0912345678"
              keyboardType="phone-pad"
            /> */}

            <FormInput
              label={t('profile.bankNameLabel')}
              value={bankName}
              onChangeText={setBankName}
              placeholder={t('profile.bankNamePlaceholder')}
            />

            <FormInput
              label={t('profile.bankAccountNumberLabel')}
              value={bankAccountNumber}
              onChangeText={setBankAccountNumber}
              placeholder={t('profile.bankAccountNumberLabel')}
              keyboardType="numeric"
            />

            <FormInput
              label={t('profile.bankAccountNameLabel')}
              value={bankAccountName}
              onChangeText={setBankAccountName}
              placeholder={t('profile.bankAccountNamePlaceholder')}
            />

            {/* Submit button */}
            <TouchableOpacity
              className="h-14 rounded-xl bg-primary-T40 items-center justify-center mt-2 active:opacity-80"
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text className="font-label font-bold text-base text-neutral-T100">
                  {t('profile.submitApplication')}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
