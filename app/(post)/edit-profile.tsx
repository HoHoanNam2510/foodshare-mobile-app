import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ImagePickerSection from '@/components/post/ImagePickerSection';
import { pickImage } from '@/lib/imagePicker';
import { updateProfileApi } from '@/lib/profileApi';
import { uploadImage } from '@/lib/uploadApi';
import { useAuthStore } from '@/stores/authStore';

export default function EditProfile() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const fetchProfile = useAuthStore((s) => s.fetchProfile);

  // ─── Form state ───
  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber ?? '');
  const [defaultAddress, setDefaultAddress] = useState(
    user?.defaultAddress ?? ''
  );
  const [avatar, setAvatar] = useState(user?.avatar ?? '');
  const [kycDocuments, setKycDocuments] = useState<string[]>(
    user?.kycDocuments ?? []
  );

  // Store info (chỉ hiện khi role = STORE)
  const [businessName, setBusinessName] = useState(
    user?.storeInfo?.businessName ?? ''
  );
  const [openHours, setOpenHours] = useState(user?.storeInfo?.openHours ?? '');
  const [closeHours, setCloseHours] = useState(
    user?.storeInfo?.closeHours ?? ''
  );
  const [storeDescription, setStoreDescription] = useState(
    user?.storeInfo?.description ?? ''
  );
  const [businessAddress, setBusinessAddress] = useState(
    user?.storeInfo?.businessAddress ?? ''
  );

  const [isSaving, setIsSaving] = useState(false);

  const isStore = user?.role === 'STORE';

  const handlePickAvatar = async (): Promise<void> => {
    const uri = await pickImage({ allowsEditing: true, aspect: [1, 1] });
    if (uri) {
      setAvatar(uri);
    }
  };

  const isLocalUri = (uri: string): boolean =>
    uri.startsWith('file://') || uri.startsWith('content://');

  const handleSave = async (): Promise<void> => {
    if (!fullName.trim()) {
      Alert.alert('Validation', 'Full name is required');
      return;
    }

    setIsSaving(true);
    try {
      // Upload avatar mới lên Cloudinary nếu là local URI
      let avatarUrl = avatar || undefined;
      if (avatar && isLocalUri(avatar)) {
        const result = await uploadImage(avatar, 'avatars');
        avatarUrl = result.url;
      }

      // Upload KYC documents mới lên Cloudinary (từng ảnh một, giữ nguyên URL cũ)
      const uploadedKycDocs = await Promise.all(
        kycDocuments.map(async (uri) => {
          if (isLocalUri(uri)) {
            const result = await uploadImage(uri, 'kyc');
            return result.url;
          }
          return uri;
        })
      );

      const payload: Record<string, unknown> = {
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim() || undefined,
        defaultAddress: defaultAddress.trim() || undefined,
        avatar: avatarUrl,
        kycDocuments: uploadedKycDocs,
      };

      if (isStore) {
        payload.storeInfo = {
          businessName: businessName.trim() || undefined,
          openHours: openHours.trim() || undefined,
          closeHours: closeHours.trim() || undefined,
          description: storeDescription.trim() || undefined,
          businessAddress: businessAddress.trim() || undefined,
        };
      }

      const res = await updateProfileApi(payload);
      if (res.success) {
        await fetchProfile();
        router.back();
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Update failed';
      Alert.alert('Error', msg);
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) return null;

  return (
    <SafeAreaView className="flex-1 bg-neutral-DEFAULT" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center justify-between h-16 px-6 bg-neutral-T100 shadow-sm">
        <TouchableOpacity
          className="p-2 rounded-full active:opacity-70"
          onPress={() => router.back()}
        >
          <MaterialIcons name="close" size={24} color="#191C1C" />
        </TouchableOpacity>
        <Text className="font-sans font-bold text-lg text-neutral-T10">
          Edit profile
        </Text>
        <TouchableOpacity
          className="px-4 py-2 bg-primary-T40 rounded-lg active:opacity-80"
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text className="font-label font-bold text-sm text-neutral-T100">
              Save
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 120,
            paddingHorizontal: 24,
            paddingTop: 24,
          }}
          className="flex-1"
          keyboardShouldPersistTaps="handled"
        >
          <View className="gap-6">
            {/* ─── Avatar ─── */}
            <View className="items-center gap-3">
              <TouchableOpacity
                onPress={handlePickAvatar}
                className="active:opacity-80"
              >
                <View className="w-28 h-28 rounded-full overflow-hidden border-2 border-primary-T70 bg-neutral-T95 items-center justify-center">
                  {avatar ? (
                    <Image
                      source={{ uri: avatar }}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                  ) : (
                    <MaterialIcons name="person" size={48} color="#757777" />
                  )}
                </View>
                <View className="absolute bottom-0 right-0 w-9 h-9 bg-primary-T40 rounded-full items-center justify-center border-2 border-neutral-T100">
                  <MaterialIcons name="camera-alt" size={18} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
              <Text className="font-label text-xs text-neutral-T50">
                Tap to change avatar
              </Text>
            </View>

            {/* ─── Identity Section ─── */}
            <SectionLabel icon="person" label="Identity" />

            <FormInput
              label="Full name"
              value={fullName}
              onChangeText={setFullName}
              placeholder="Your full name"
            />

            {/* ─── Contact Section ─── */}
            <SectionLabel icon="contact-mail" label="Contact" />

            <FormInput
              label="Email"
              value={user.email}
              editable={false}
              placeholder="Email"
            />
            <FormInput
              label="Phone number"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="+84 xxx xxx xxx"
              keyboardType="phone-pad"
            />
            <FormInput
              label="Default address"
              value={defaultAddress}
              onChangeText={setDefaultAddress}
              placeholder="Your address"
            />

            {/* ─── Store Section (only STORE role) ─── */}
            {isStore && (
              <>
                <SectionLabel icon="storefront" label="Store details" />

                <FormInput
                  label="Business name"
                  value={businessName}
                  onChangeText={setBusinessName}
                  placeholder="Store name"
                />
                <View className="flex-row gap-3">
                  <View className="flex-1">
                    <FormInput
                      label="Open hours"
                      value={openHours}
                      onChangeText={setOpenHours}
                      placeholder="09:00"
                    />
                  </View>
                  <View className="flex-1">
                    <FormInput
                      label="Close hours"
                      value={closeHours}
                      onChangeText={setCloseHours}
                      placeholder="21:00"
                    />
                  </View>
                </View>
                <FormInput
                  label="Description"
                  value={storeDescription}
                  onChangeText={setStoreDescription}
                  placeholder="Describe your store..."
                  multiline
                />
                <FormInput
                  label="Business address"
                  value={businessAddress}
                  onChangeText={setBusinessAddress}
                  placeholder="Store address"
                />
              </>
            )}

            {/* ─── KYC Documents ─── */}
            <SectionLabel icon="verified-user" label="KYC Documents" />

            <ImagePickerSection
              images={kycDocuments}
              onImagesChange={setKycDocuments}
              maxImages={5}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Internal helpers ───

function SectionLabel({
  icon,
  label,
}: {
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  label: string;
}) {
  return (
    <View className="flex-row items-center gap-3 pt-2">
      <MaterialIcons name={icon} size={20} color="#296C24" />
      <Text className="font-sans font-bold text-base text-neutral-T10">
        {label}
      </Text>
    </View>
  );
}

interface FormInputProps {
  label: string;
  value: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  editable?: boolean;
  multiline?: boolean;
  keyboardType?: 'default' | 'phone-pad' | 'email-address' | 'numeric';
}

function FormInput({
  label,
  value,
  onChangeText,
  placeholder,
  editable = true,
  multiline = false,
  keyboardType = 'default',
}: FormInputProps) {
  return (
    <View className="gap-1.5">
      <Text className="font-label text-xs font-semibold text-neutral-T50 uppercase tracking-wider">
        {label}
      </Text>
      <TextInput
        className={`bg-neutral-T100 border border-neutral-T80 rounded-xl px-4 font-body text-sm text-neutral-T10 ${
          multiline ? 'h-24 pt-3' : 'h-12'
        } ${!editable ? 'opacity-50' : ''}`}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#AAABAB"
        editable={editable}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        keyboardType={keyboardType}
      />
    </View>
  );
}
