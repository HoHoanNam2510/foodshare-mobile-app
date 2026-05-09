import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
import StackHeader from '@/components/shared/headers/StackHeader';
import LocationPickerSheet, {
  PickedLocation,
} from '@/components/map/LocationPickerSheet';
import { pickImage } from '@/lib/imagePicker';
import { reverseGeocode, updateUserLocation } from '@/lib/mapApi';
import { updateProfileApi } from '@/lib/profileApi';
import { uploadImage } from '@/lib/uploadApi';
import { useAuthStore } from '@/stores/authStore';

export default function EditProfile() {
  const { t } = useTranslation();
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

  // Payment info — bank account cho cả STORE (nhận giải ngân) và USER (nhận hoàn tiền)
  const [bankName, setBankName] = useState(user?.paymentInfo?.bankName ?? '');
  const [bankCode, setBankCode] = useState(user?.paymentInfo?.bankCode ?? '');
  const [bankAccountNumber, setBankAccountNumber] = useState(
    user?.paymentInfo?.bankAccountNumber ?? ''
  );
  const [bankAccountName, setBankAccountName] = useState(
    user?.paymentInfo?.bankAccountName ?? ''
  );

  // ── Location state ───
  const [pickedLocation, setPickedLocation] = useState<PickedLocation | null>(
    null
  );
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [locationLabel, setLocationLabel] = useState('');

  const [isSaving, setIsSaving] = useState(false);

  const isStore = user?.role === 'STORE';

  const initialLng = user?.location?.coordinates[0];
  const initialLat = user?.location?.coordinates[1];

  useEffect(() => {
    if (initialLng == null || initialLat == null) return;
    reverseGeocode(initialLat, initialLng).then((addr) => {
      if (addr) setLocationLabel(addr);
    });
  }, [initialLng, initialLat]);

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
      Alert.alert(t('common.warning'), t('profile.fullNameRequired'));
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

      const payload: Record<string, unknown> = {
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim() || undefined,
        defaultAddress: defaultAddress.trim() || undefined,
        avatar: avatarUrl,
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

      // Lưu tài khoản ngân hàng cho tất cả user roles (STORE để nhận giải ngân, USER để nhận hoàn tiền)
      payload.paymentInfo = {
        bankName: bankName.trim() || undefined,
        bankCode: bankCode.trim() || undefined,
        bankAccountNumber: bankAccountNumber.trim() || undefined,
        bankAccountName: bankAccountName.trim() || undefined,
      };

      const res = await updateProfileApi(payload);
      if (res.success) {
        if (pickedLocation) {
          await updateUserLocation(
            pickedLocation.coordinates[0],
            pickedLocation.coordinates[1]
          );
        }
        await fetchProfile();
        router.back();
      }
    } catch (error: unknown) {
      const msg =
        error instanceof Error ? error.message : t('profile.updateFailed');
      Alert.alert(t('common.error'), msg);
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) return null;

  return (
    <View className="bg-neutral-DEFAULT flex-1">
      <StackHeader
        title={t('profile.editProfile')}
        rightElement={
          <TouchableOpacity
            className="bg-primary-T40 rounded-lg px-4 py-2 active:opacity-80"
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text className="font-label text-neutral-T100 text-sm font-bold">
                {t('common.save')}
              </Text>
            )}
          </TouchableOpacity>
        }
      />

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
            {/* ─── Avatar ─── */}
            <View className="items-center gap-2">
              <TouchableOpacity
                onPress={handlePickAvatar}
                className="active:opacity-80"
              >
                <View className="border-primary-T70 bg-neutral-T95 h-28 w-28 items-center justify-center overflow-hidden rounded-full border-2">
                  {avatar ? (
                    <Image
                      source={{ uri: avatar }}
                      className="h-full w-full"
                      resizeMode="cover"
                    />
                  ) : (
                    <MaterialIcons name="person" size={48} color="#757777" />
                  )}
                </View>
                <View className="bg-primary-T40 border-neutral-T100 absolute bottom-0 right-0 h-9 w-9 items-center justify-center rounded-full border-2">
                  <MaterialIcons name="camera-alt" size={18} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
              <Text className="font-label text-neutral-T50 text-xs">
                {t('profile.tapToChangeAvatar')}
              </Text>
            </View>

            {/* ─── Identity Section ─── */}
            <SectionLabel icon="person" label={t('profile.identitySection')} />

            <FormInput
              label={t('auth.fullName')}
              value={fullName}
              onChangeText={setFullName}
              placeholder={t('profile.fullNamePlaceholder')}
            />

            {/* ─── Contact Section ─── */}
            <SectionLabel
              icon="contact-mail"
              label={t('profile.contactSection')}
            />

            <FormInput
              label={t('auth.email')}
              value={user.email}
              editable={false}
              placeholder={t('auth.email')}
            />
            <FormInput
              label={t('auth.phoneNumber')}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="+84 xxx xxx xxx"
              keyboardType="phone-pad"
            />
            <FormInput
              label={t('profile.defaultAddress')}
              value={defaultAddress}
              onChangeText={setDefaultAddress}
              placeholder={t('profile.addressPlaceholder')}
            />

            {/* ─── Location picker ─── */}
            <View className="gap-1.5">
              <Text className="font-label text-neutral-T50 text-xs font-semibold uppercase tracking-wider">
                {t('profile.locationMap')}
              </Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setShowLocationPicker(true)}
                className="bg-neutral-T100 border-neutral-T80 h-12 flex-row items-center gap-3 rounded-xl border px-4"
              >
                <MaterialIcons name="location-on" size={18} color="#296C24" />
                <Text
                  className="font-body text-neutral-T10 flex-1 text-sm"
                  numberOfLines={1}
                >
                  {pickedLocation?.address ||
                    locationLabel ||
                    t('profile.locationNotSet')}
                </Text>
                <MaterialIcons name="chevron-right" size={20} color="#AAABAB" />
              </TouchableOpacity>
            </View>

            {/* ─── Store Section (only STORE role) ─── */}
            {isStore && (
              <>
                <SectionLabel
                  icon="storefront"
                  label={t('profile.storeDetailsSection')}
                />

                <FormInput
                  label={t('profile.businessNameLabel')}
                  value={businessName}
                  onChangeText={setBusinessName}
                  placeholder={t('profile.businessNameLabel')}
                />
                <View className="flex-row gap-3">
                  <View className="flex-1">
                    <FormInput
                      label={t('profile.openHoursLabel')}
                      value={openHours}
                      onChangeText={setOpenHours}
                      placeholder="09:00"
                    />
                  </View>
                  <View className="flex-1">
                    <FormInput
                      label={t('profile.closeHoursLabel')}
                      value={closeHours}
                      onChangeText={setCloseHours}
                      placeholder="21:00"
                    />
                  </View>
                </View>
                <FormInput
                  label={t('profile.storeDescriptionLabel')}
                  value={storeDescription}
                  onChangeText={setStoreDescription}
                  placeholder={t('profile.storeDescriptionPlaceholder')}
                  multiline
                />
                <FormInput
                  label={t('profile.businessAddressLabel')}
                  value={businessAddress}
                  onChangeText={setBusinessAddress}
                  placeholder={t('profile.businessAddressLabel')}
                />
              </>
            )}

            {/* ─── Bank Account (tất cả users) ─── */}
            <SectionLabel
              icon="account-balance"
              label={t('profile.bankSection')}
            />
            <Text className="font-body text-neutral-T50 -mt-2 text-xs">
              {isStore ? t('profile.bankHintStore') : t('profile.bankHintUser')}
            </Text>

            <FormInput
              label={t('profile.bankNameLabel')}
              value={bankName}
              onChangeText={setBankName}
              placeholder={t('profile.bankNamePlaceholder')}
            />
            <FormInput
              label={t('profile.bankCodeLabel')}
              value={bankCode}
              onChangeText={setBankCode}
              placeholder={t('profile.bankCodePlaceholder')}
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
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <LocationPickerSheet
        visible={showLocationPicker}
        onClose={() => setShowLocationPicker(false)}
        onConfirm={setPickedLocation}
        initialCoords={
          pickedLocation?.coordinates ??
          (user?.location
            ? [user.location.coordinates[0], user.location.coordinates[1]]
            : undefined)
        }
      />
    </View>
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
      <Text className="text-neutral-T10 font-sans text-base font-bold">
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
      <Text className="font-label text-neutral-T50 text-xs font-semibold uppercase tracking-wider">
        {label}
      </Text>
      <TextInput
        className={`bg-neutral-T100 border-neutral-T80 font-body text-neutral-T10 rounded-xl border px-4 text-sm ${
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
