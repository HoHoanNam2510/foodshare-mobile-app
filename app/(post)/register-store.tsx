import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';

import ImagePickerSection from '@/components/post/ImagePickerSection';
import FormInput from '@/components/shared/FormInput';
import SectionLabel from '@/components/shared/SectionLabel';
import { registerStoreApi } from '@/lib/profileApi';
import { uploadImage } from '@/lib/uploadApi';
import { useAuthStore } from '@/stores/authStore';

export default function RegisterStore() {
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
        'Hồ sơ chưa hoàn thiện',
        `Vui lòng cập nhật ${missingFields.join(' và ')} trong hồ sơ cá nhân trước khi đăng ký cửa hàng.`,
        [
          { text: 'Để sau', style: 'cancel' },
          { text: 'Cập nhật ngay', onPress: () => router.push('/(post)/edit-profile') },
        ]
      );
      return;
    }

    // Validate required fields
    if (!businessName.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập tên cửa hàng');
      return;
    }
    if (!openHours.trim() || !closeHours.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập giờ mở cửa và đóng cửa');
      return;
    }
    if (!businessAddress.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập địa chỉ cửa hàng');
      return;
    }
    if (kycDocuments.length === 0) {
      Alert.alert(
        'Thiếu tài liệu',
        'Vui lòng tải lên ít nhất 1 tài liệu KYC (giấy phép kinh doanh, CMND/CCCD...)'
      );
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

      const res = await registerStoreApi({
        storeInfo: {
          businessName: businessName.trim(),
          openHours: openHours.trim(),
          closeHours: closeHours.trim(),
          description: description.trim() || undefined,
          businessAddress: businessAddress.trim(),
        },
        kycDocuments: uploadedDocs,
      });

      if (res.success) {
        await fetchProfile();
        Alert.alert(
          'Thành công',
          'Đơn đăng ký cửa hàng đã được gửi. Vui lòng chờ Admin xét duyệt.',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      }
    } catch (error: unknown) {
      const msg =
        error instanceof Error ? error.message : 'Đăng ký cửa hàng thất bại';
      Alert.alert('Lỗi', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-DEFAULT" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center justify-between h-16 px-6 bg-neutral-T100 shadow-sm">
        <TouchableOpacity
          className="p-2 rounded-full active:opacity-70"
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#191C1C" />
        </TouchableOpacity>
        <Text className="font-sans font-bold text-lg text-neutral-T10">
          Đăng ký cửa hàng
        </Text>
        <View style={{ width: 40 }} />
      </View>

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
                  Sau khi đăng ký, đơn của bạn sẽ được Admin xét duyệt. Khi
                  được duyệt, tài khoản sẽ được nâng cấp lên Cửa hàng và bạn có
                  thể đăng bài dưới danh nghĩa cửa hàng.
                </Text>
              </View>
            </View>

            {/* Store Details */}
            <SectionLabel icon="storefront" label="Thông tin cửa hàng" />

            <FormInput
              label="Tên cửa hàng *"
              value={businessName}
              onChangeText={setBusinessName}
              placeholder="VD: Tiệm bánh mì Sài Gòn"
            />

            <View className="flex-row gap-3">
              <View className="flex-1">
                <FormInput
                  label="Giờ mở cửa *"
                  value={openHours}
                  onChangeText={setOpenHours}
                  placeholder="06:00"
                />
              </View>
              <View className="flex-1">
                <FormInput
                  label="Giờ đóng cửa *"
                  value={closeHours}
                  onChangeText={setCloseHours}
                  placeholder="22:00"
                />
              </View>
            </View>

            <FormInput
              label="Địa chỉ cửa hàng *"
              value={businessAddress}
              onChangeText={setBusinessAddress}
              placeholder="123 Nguyễn Trãi, Q.1, TP.HCM"
            />

            <FormInput
              label="Mô tả cửa hàng"
              value={description}
              onChangeText={setDescription}
              placeholder="Giới thiệu ngắn về cửa hàng của bạn..."
              multiline
            />

            {/* KYC Documents */}
            <SectionLabel icon="verified-user" label="Tài liệu xác minh (KYC)" />

            <Text className="font-body text-xs text-neutral-T50 -mt-2">
              Tải lên giấy phép kinh doanh, CMND/CCCD, hoặc giấy tờ liên quan
            </Text>

            <ImagePickerSection
              images={kycDocuments}
              onImagesChange={setKycDocuments}
              maxImages={5}
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
                  Gửi đơn đăng ký
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

