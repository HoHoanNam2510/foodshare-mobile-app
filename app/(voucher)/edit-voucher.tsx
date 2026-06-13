import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import StackHeader from '@/components/shared/headers/StackHeader';
import DateTimePickerModal from '@/components/shared/DateTimePickerModal';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '@/lib/hooks/useThemeColors';
import {
  storeGetMyVouchersApi,
  storeUpdateVoucherApi,
  UpdateVoucherBody,
} from '@/lib/voucherApi';
import type { IVoucher } from '@/lib/voucherApi';
import { useTranslation } from 'react-i18next';

const EditVoucherScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const [voucher, setVoucher] = useState<IVoucher | null>(null);
  const [fetching, setFetching] = useState(true);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [validUntil, setValidUntil] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const hasRedeemed = voucher
    ? voucher.remainingQuantity < voucher.totalQuantity
    : false;

  useEffect(() => {
    if (!id) {
      Alert.alert(t('voucher.errorAlert'), t('voucher.voucherNotFound'));
      router.back();
      return;
    }
    const load = async () => {
      try {
        const { success, data } = await storeGetMyVouchersApi();
        if (success) {
          const found = data.find((v) => v._id === id);
          if (!found) {
            Alert.alert(t('voucher.errorAlert'), t('voucher.voucherNotFound'));
            router.back();
            return;
          }
          setVoucher(found);
          setTitle(found.title);
          setDescription(found.description ?? '');
          setValidUntil(new Date(found.validUntil));
        }
      } catch (error) {
        console.error('Edit voucher fetch error:', error);
        Alert.alert(t('voucher.errorAlert'), t('voucher.loadVoucherError'));
        router.back();
      } finally {
        setFetching(false);
      }
    };
    load();
  }, [id, router, t]);

  const handleSave = useCallback(async () => {
    if (!title.trim()) {
      Alert.alert(t('voucher.errorAlert'), t('voucher.titleRequired'));
      return;
    }
    setLoading(true);
    try {
      const body: UpdateVoucherBody = {
        title: title.trim(),
        description: description.trim() || undefined,
        validUntil: validUntil.toISOString(),
      };
      const { success } = await storeUpdateVoucherApi(id as string, body);
      if (success) {
        Alert.alert(
          t('voucher.successAlert'),
          t('voucher.updateVoucherSuccess'),
          [{ text: 'OK', onPress: () => router.back() }]
        );
      } else {
        Alert.alert(t('voucher.errorAlert'), t('voucher.updateVoucherFailed'));
      }
    } catch (error) {
      console.error('Edit voucher save error:', error);
      Alert.alert(t('voucher.errorAlert'), t('voucher.updateVoucherError'));
    } finally {
      setLoading(false);
    }
  }, [id, title, description, validUntil, router, t]);

  if (fetching) {
    return (
      <View className="bg-neutral dark:bg-neutral-T10 flex-1">
        <StackHeader title={t('voucher.editVoucherTitle')} />
        <View className="flex-1 items-center justify-center gap-3">
          <ActivityIndicator size="large" color="#296C24" />
          <Text className="font-body text-neutral-T50 dark:text-neutral-T60 text-sm">
            {t('common.loading')}
          </Text>
        </View>
      </View>
    );
  }

  if (!voucher) return null;

  return (
    <View className="bg-neutral dark:bg-neutral-T10 flex-1">
      <StackHeader title={t('voucher.editVoucherTitle')} />
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
          {/* Warning banner */}
          {hasRedeemed && (
            <View className="mb-6 flex-row items-start gap-3 rounded-2xl border border-yellow-300 bg-yellow-50 p-4 dark:border-yellow-700 dark:bg-yellow-900/20">
              <MaterialIcons name="warning" size={20} color="#d97706" />
              <Text className="font-body flex-1 text-sm leading-5 text-yellow-800 dark:text-yellow-300">
                {t('voucher.editRedeemedWarning')}
              </Text>
            </View>
          )}

          {/* ── Editable Fields ── */}
          <View className="mb-8 gap-6">
            <View className="gap-2">
              <Text className="font-label text-neutral-T50 dark:text-neutral-T60 ml-1 text-sm font-semibold">
                {t('voucher.titleLabel')} <Text className="text-error">*</Text>
              </Text>
              <TextInput
                className="bg-neutral-T95 dark:bg-neutral-T30 border-neutral-T90 dark:border-neutral-T30 font-body text-neutral-T10 dark:text-neutral-T90 h-14 w-full rounded-xl border px-4 text-base"
                placeholder={t('voucher.titlePlaceholder')}
                placeholderTextColor={colors.placeholder}
                value={title}
                onChangeText={setTitle}
              />
            </View>

            <View className="gap-2">
              <Text className="font-label text-neutral-T50 dark:text-neutral-T60 ml-1 text-sm font-semibold">
                {t('voucher.descriptionLabel')}
              </Text>
              <TextInput
                className="bg-neutral-T95 dark:bg-neutral-T30 border-neutral-T90 dark:border-neutral-T30 font-body text-neutral-T10 dark:text-neutral-T90 w-full rounded-xl border p-4 text-base"
                placeholder={t('voucher.descriptionPlaceholder')}
                placeholderTextColor={colors.placeholder}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                style={{ minHeight: 108 }}
                value={description}
                onChangeText={setDescription}
              />
            </View>

            <View className="gap-2">
              <Text className="font-label text-neutral-T50 dark:text-neutral-T60 ml-1 text-sm font-semibold">
                {t('voucher.validUntilLabel')}{' '}
                <Text className="text-error">*</Text>
              </Text>
              <TouchableOpacity
                className="bg-neutral-T95 dark:bg-neutral-T30 border-neutral-T90 dark:border-neutral-T30 h-14 flex-row items-center justify-between rounded-xl border px-4 active:opacity-80"
                onPress={() => setShowDatePicker(true)}
              >
                <Text className="font-body text-neutral-T10 dark:text-neutral-T90 text-base">
                  {validUntil.toLocaleDateString('vi-VN')}
                </Text>
                <MaterialIcons
                  name="event"
                  size={20}
                  color={colors.textMuted}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Read-only fields when redeemed */}
          {hasRedeemed && (
            <View className="bg-neutral-T95 dark:bg-neutral-T30 border-neutral-T90 dark:border-neutral-T30 mb-6 gap-4 rounded-2xl border p-4">
              <Text className="font-label text-neutral-T50 dark:text-neutral-T60 text-xs font-semibold uppercase tracking-wide">
                {t('voucher.readOnlyFields')}
              </Text>

              <View>
                <Text className="font-label text-neutral-T70 dark:text-neutral-T60 mb-1 text-xs">
                  {t('voucher.codeLabel')}
                </Text>
                <Text className="font-body text-neutral-T10 dark:text-neutral-T80 text-base font-semibold">
                  {voucher.code}
                </Text>
              </View>

              <View>
                <Text className="font-label text-neutral-T70 dark:text-neutral-T60 mb-1 text-xs">
                  {t('voucher.discountTypeLabel')}
                </Text>
                <Text className="font-body text-neutral-T10 dark:text-neutral-T80 text-base">
                  {voucher.discountType === 'PERCENTAGE'
                    ? t('voucher.percentageLabel')
                    : t('voucher.fixedAmountLabel')}
                </Text>
              </View>

              <View className="flex-row gap-6">
                <View>
                  <Text className="font-label text-neutral-T70 dark:text-neutral-T60 mb-1 text-xs">
                    {t('voucher.discountValueLabel')}
                  </Text>
                  <Text className="font-body text-neutral-T10 dark:text-neutral-T80 text-base">
                    {voucher.discountType === 'PERCENTAGE'
                      ? `${voucher.discountValue}%`
                      : `${voucher.discountValue.toLocaleString('vi-VN')}đ`}
                  </Text>
                </View>
                <View>
                  <Text className="font-label text-neutral-T70 dark:text-neutral-T60 mb-1 text-xs">
                    {t('voucher.pointCostLabel')}
                  </Text>
                  <Text className="font-body text-neutral-T10 dark:text-neutral-T80 text-base">
                    {voucher.pointCost} {t('voucher.pointsUnit')}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── Fixed Footer ── */}
      <View
        className="bg-neutral-T100 dark:bg-neutral-T20 border-neutral-T90 dark:border-neutral-T30 absolute bottom-0 left-0 right-0 border-t"
        style={{
          paddingBottom: Math.max(insets.bottom, 16),
          paddingTop: 16,
          paddingHorizontal: 24,
        }}
      >
        <View className="flex-row gap-4">
          <TouchableOpacity
            className="bg-neutral-T95 dark:bg-neutral-T30 h-14 flex-1 flex-row items-center justify-center gap-2 rounded-xl active:opacity-80"
            onPress={() => router.back()}
          >
            <MaterialIcons name="close" size={18} color={colors.textMuted} />
            <Text className="font-label text-neutral-T50 dark:text-neutral-T60 text-sm font-medium">
              {t('common.cancel')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-primary-T40 h-14 flex-1 flex-row items-center justify-center gap-2 rounded-xl shadow-sm active:opacity-80"
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <MaterialIcons name="check" size={18} color="#FFFFFF" />
                <Text className="font-label text-neutral-T100 text-sm font-medium">
                  {t('common.save')}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <DateTimePickerModal
        visible={showDatePicker}
        value={validUntil}
        mode="date"
        minimumDate={new Date()}
        onChange={(_, date) => {
          if (date) setValidUntil(date);
        }}
        onClose={() => setShowDatePicker(false)}
      />
    </View>
  );
};

export default EditVoucherScreen;
