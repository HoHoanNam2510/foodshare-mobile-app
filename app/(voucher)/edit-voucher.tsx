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
  Modal,
  Pressable,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import StackHeader from '@/components/shared/headers/StackHeader';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#10b981" />
        </View>
      </View>
    );
  }

  if (!voucher) return null;

  return (
    <View className="bg-neutral dark:bg-neutral-T10 flex-1">
      <StackHeader title={t('voucher.editVoucherTitle')} />
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <View className="p-6">
          {/* Warning banner — shown when voucher has been redeemed */}
          {hasRedeemed && (
            <View className="mb-6 flex-row items-start gap-3 rounded-xl border border-yellow-300 bg-yellow-50 p-4">
              <Ionicons name="warning-outline" size={20} color="#d97706" />
              <Text className="flex-1 text-sm leading-5 text-yellow-800">
                {t('voucher.editRedeemedWarning')}
              </Text>
            </View>
          )}

          {/* Title */}
          <View className="mb-4">
            <Text className="text-foreground dark:text-neutral-T80 mb-2 text-sm font-medium">
              {t('voucher.titleLabel')} <Text className="text-error">*</Text>
            </Text>
            <TextInput
              className="dark:border-neutral-T30 dark:bg-neutral-T30 dark:text-neutral-T90 rounded-lg border border-gray-300 bg-white px-4 py-3 text-base"
              placeholder={t('voucher.titlePlaceholder')}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          {/* Description */}
          <View className="mb-4">
            <Text className="text-foreground dark:text-neutral-T80 mb-2 text-sm font-medium">
              {t('voucher.descriptionLabel')}
            </Text>
            <TextInput
              className="dark:border-neutral-T30 dark:bg-neutral-T30 dark:text-neutral-T90 h-24 rounded-lg border border-gray-300 bg-white px-4 py-3 text-base"
              placeholder={t('voucher.descriptionPlaceholder')}
              multiline
              numberOfLines={4}
              value={description}
              onChangeText={setDescription}
            />
          </View>

          {/* Valid Until */}
          <View className="mb-6">
            <Text className="text-foreground dark:text-neutral-T80 mb-2 text-sm font-medium">
              {t('voucher.validUntilLabel')}{' '}
              <Text className="text-error">*</Text>
            </Text>
            <TouchableOpacity
              className="dark:border-neutral-T30 dark:bg-neutral-T30 rounded-lg border border-gray-300 bg-white px-4 py-3"
              onPress={() => setShowDatePicker(true)}
            >
              <View className="flex-row items-center justify-between">
                <Text className="text-foreground dark:text-neutral-T90 text-base">
                  {validUntil.toLocaleDateString('vi-VN')}
                </Text>
                <Ionicons name="calendar-outline" size={20} color="#6b7280" />
              </View>
            </TouchableOpacity>
            <Modal
              transparent
              animationType="slide"
              visible={showDatePicker}
              onRequestClose={() => setShowDatePicker(false)}
            >
              <Pressable
                className="flex-1 justify-end"
                style={{ backgroundColor: 'rgba(0,0,0,0.35)' }}
                onPress={() => setShowDatePicker(false)}
              >
                <Pressable onPress={(e) => e.stopPropagation()}>
                  <View
                    className="dark:bg-neutral-T20 rounded-t-3xl bg-white px-6 pt-4"
                    style={{ paddingBottom: Math.max(insets.bottom, 24) + 8 }}
                  >
                    <View className="dark:bg-neutral-T30 mb-2 h-1 w-10 self-center rounded-full bg-gray-200" />
                    <View style={{ overflow: 'hidden', alignSelf: 'center' }}>
                      <DateTimePicker
                        value={validUntil}
                        mode="date"
                        display="spinner"
                        minimumDate={new Date()}
                        onChange={(_, date) => {
                          if (Platform.OS === 'android')
                            setShowDatePicker(false);
                          if (date) setValidUntil(date);
                        }}
                        themeVariant="light"
                        style={{ height: 216 }}
                      />
                    </View>
                    {Platform.OS === 'ios' && (
                      <TouchableOpacity
                        className="bg-primary mt-4 h-14 items-center justify-center rounded-xl"
                        onPress={() => setShowDatePicker(false)}
                      >
                        <Text className="text-base font-semibold text-white">
                          {t('common.done')}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </Pressable>
              </Pressable>
            </Modal>
          </View>

          {/* Read-only fields when redeemed */}
          {hasRedeemed && (
            <View className="dark:border-neutral-T30 dark:bg-neutral-T30 mb-6 gap-3 rounded-xl border border-gray-200 bg-neutral-50 p-4">
              <Text className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                {t('voucher.readOnlyFields')}
              </Text>

              <View>
                <Text className="dark:text-neutral-T60 mb-1 text-xs text-gray-400">
                  {t('voucher.codeLabel')}
                </Text>
                <Text className="text-foreground dark:text-neutral-T80 text-base font-semibold">
                  {voucher.code}
                </Text>
              </View>

              <View>
                <Text className="dark:text-neutral-T60 mb-1 text-xs text-gray-400">
                  {t('voucher.discountTypeLabel')}
                </Text>
                <Text className="text-foreground dark:text-neutral-T80 text-base">
                  {voucher.discountType === 'PERCENTAGE'
                    ? t('voucher.percentageLabel')
                    : t('voucher.fixedAmountLabel')}
                </Text>
              </View>

              <View className="flex-row gap-6">
                <View>
                  <Text className="dark:text-neutral-T60 mb-1 text-xs text-gray-400">
                    {t('voucher.discountValueLabel')}
                  </Text>
                  <Text className="text-foreground dark:text-neutral-T80 text-base">
                    {voucher.discountType === 'PERCENTAGE'
                      ? `${voucher.discountValue}%`
                      : `${voucher.discountValue.toLocaleString('vi-VN')}đ`}
                  </Text>
                </View>
                <View>
                  <Text className="dark:text-neutral-T60 mb-1 text-xs text-gray-400">
                    {t('voucher.pointCostLabel')}
                  </Text>
                  <Text className="text-foreground dark:text-neutral-T80 text-base">
                    {voucher.pointCost} {t('voucher.pointsUnit')}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Save button */}
          <TouchableOpacity
            className="bg-primary items-center rounded-xl py-4"
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-lg font-bold text-white">
                {t('common.save')}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default EditVoucherScreen;
