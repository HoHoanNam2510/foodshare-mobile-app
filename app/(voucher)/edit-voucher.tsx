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
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import StackHeader from '@/components/shared/headers/StackHeader';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
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

  const [voucher, setVoucher] = useState<IVoucher | null>(null);
  const [fetching, setFetching] = useState(true);

  // Editable fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [validUntil, setValidUntil] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  // If someone has already redeemed, restrict editing
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
  }, [id, router]);

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
        Alert.alert(t('voucher.successAlert'), t('voucher.updateVoucherSuccess'), [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } else {
        Alert.alert(t('voucher.errorAlert'), t('voucher.updateVoucherFailed'));
      }
    } catch (error) {
      console.error('Edit voucher save error:', error);
      Alert.alert(t('voucher.errorAlert'), t('voucher.updateVoucherError'));
    } finally {
      setLoading(false);
    }
  }, [id, title, description, validUntil, router]);

  if (fetching) {
    return (
      <View className="flex-1 bg-neutral">
        <StackHeader title={t('voucher.editVoucherTitle')} />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#10b981" />
        </View>
      </View>
    );
  }

  if (!voucher) return null;

  return (
    <View className="flex-1 bg-neutral">
      <StackHeader title={t('voucher.editVoucherTitle')} />
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <View className="p-6">
          {/* Warning banner — shown when voucher has been redeemed */}
          {hasRedeemed && (
            <View className="bg-yellow-50 border border-yellow-300 rounded-xl p-4 mb-6 flex-row items-start gap-3">
              <Ionicons name="warning-outline" size={20} color="#d97706" />
              <Text className="text-sm text-yellow-800 flex-1 leading-5">
                {t('voucher.editRedeemedWarning')}
              </Text>
            </View>
          )}

          {/* Title */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-foreground mb-2">
              {t('voucher.titleLabel')} <Text className="text-error">*</Text>
            </Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 text-base bg-white"
              placeholder={t('voucher.titlePlaceholder')}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          {/* Description */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-foreground mb-2">
              {t('voucher.descriptionLabel')}
            </Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 text-base bg-white h-24"
              placeholder={t('voucher.descriptionPlaceholder')}
              multiline
              numberOfLines={4}
              value={description}
              onChangeText={setDescription}
            />
          </View>

          {/* Valid Until */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-foreground mb-2">
              {t('voucher.validUntilLabel')} <Text className="text-error">*</Text>
            </Text>
            <TouchableOpacity
              className="border border-gray-300 rounded-lg px-4 py-3 bg-white"
              onPress={() => setShowDatePicker(true)}
            >
              <View className="flex-row items-center justify-between">
                <Text className="text-base text-foreground">
                  {validUntil.toLocaleDateString('vi-VN')}
                </Text>
                <Ionicons name="calendar-outline" size={20} color="#6b7280" />
              </View>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={validUntil}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                minimumDate={new Date()}
                onChange={(event, date) => {
                  setShowDatePicker(Platform.OS === 'ios');
                  if (date) setValidUntil(date);
                }}
              />
            )}
          </View>

          {/* Read-only fields when redeemed */}
          {hasRedeemed && (
            <View className="mb-6 rounded-xl bg-neutral-50 border border-gray-200 p-4 gap-3">
              <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                {t('voucher.readOnlyFields')}
              </Text>

              <View>
                <Text className="text-xs text-gray-400 mb-1">{t('voucher.codeLabel')}</Text>
                <Text className="text-base font-semibold text-foreground">
                  {voucher.code}
                </Text>
              </View>

              <View>
                <Text className="text-xs text-gray-400 mb-1">
                  {t('voucher.discountTypeLabel')}
                </Text>
                <Text className="text-base text-foreground">
                  {voucher.discountType === 'PERCENTAGE'
                    ? t('voucher.percentageLabel')
                    : t('voucher.fixedAmountLabel')}
                </Text>
              </View>

              <View className="flex-row gap-6">
                <View>
                  <Text className="text-xs text-gray-400 mb-1">
                    {t('voucher.discountValueLabel')}
                  </Text>
                  <Text className="text-base text-foreground">
                    {voucher.discountType === 'PERCENTAGE'
                      ? `${voucher.discountValue}%`
                      : `${voucher.discountValue.toLocaleString('vi-VN')}đ`}
                  </Text>
                </View>
                <View>
                  <Text className="text-xs text-gray-400 mb-1">{t('voucher.pointCostLabel')}</Text>
                  <Text className="text-base text-foreground">
                    {voucher.pointCost} {t('voucher.pointsUnit')}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Save button */}
          <TouchableOpacity
            className="bg-primary py-4 rounded-xl items-center"
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-lg font-bold">{t('common.save')}</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default EditVoucherScreen;
