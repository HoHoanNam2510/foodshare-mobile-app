import React, { useState, useCallback , useEffect, useRef } from 'react';
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
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePickerModal from '@/components/shared/DateTimePickerModal';
import { useRouter } from 'expo-router';
import StackHeader from '@/components/shared/headers/StackHeader';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuthStore } from '@/stores/authStore';
import { storeCreateVoucherApi, CreateVoucherBody } from '@/lib/voucherApi';
import { useTranslation } from 'react-i18next';

const CreateVoucherScreen = () => {
  const router = useRouter();
  const { user } = useAuthStore();
  const { t } = useTranslation();

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardDidHideListener?.remove();
      keyboardDidShowListener?.remove();
    };
  }, []);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<
    'PERCENTAGE' | 'FIXED_AMOUNT'
  >('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState('');
  const [pointCost, setPointCost] = useState('');
  const [totalQuantity, setTotalQuantity] = useState('');
  const [code, setCode] = useState('');
  const [validUntil, setValidUntil] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  );
  const [activeValidUntilPicker, setActiveValidUntilPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const scrollViewRef = useRef(null);

  const handleCreate = useCallback(async () => {
    if (!user || user.role !== 'STORE') {
      Alert.alert(t('voucher.errorAlert'), t('voucher.storeOnlyError'));
      return;
    }

    if (!title.trim()) {
      Alert.alert(t('voucher.errorAlert'), t('voucher.titleRequired'));
      return;
    }
    if (
      parseFloat(discountValue) <= 0 ||
      parseFloat(pointCost) <= 0 ||
      parseInt(totalQuantity) <= 0
    ) {
      Alert.alert(
        t('voucher.errorAlert'),
        t('voucher.invalidValues')
      );
      return;
    }
    if (!code.trim()) {
      Alert.alert(t('voucher.errorAlert'), t('voucher.codeRequired'));
      return;
    }

    setLoading(true);
    try {
      const body: CreateVoucherBody = {
        title: title.trim(),
        description: description.trim() || undefined,
        discountType,
        discountValue: parseFloat(discountValue),
        pointCost: parseInt(pointCost),
        totalQuantity: parseInt(totalQuantity),
        validFrom: new Date().toISOString(),
        validUntil: validUntil.toISOString(),
        code: code.trim().toUpperCase(),
      };
      const { success } = await storeCreateVoucherApi(body);
      if (success) {
        Alert.alert(t('voucher.successAlert'), t('voucher.createVoucherSuccess'), [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } else {
        Alert.alert(t('voucher.errorAlert'), t('voucher.createVoucherFailed'));
      }
    } catch (error) {
      console.error('Create voucher error:', error);
      Alert.alert(t('voucher.errorAlert'), t('voucher.createVoucherError'));
    } finally {
      setLoading(false);
    }
  }, [
    title,
    description,
    discountType,
    discountValue,
    pointCost,
    totalQuantity,
    code,
    validUntil,
    user,
    router,
  ]);

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View className="flex-1 bg-neutral">
        <StackHeader title={t('voucher.createVoucherTitle')} />
        <ScrollView
          ref={scrollViewRef}
          className="flex-1"
          contentContainerStyle={{
            paddingBottom: Math.max(100, keyboardHeight + 20),
            paddingHorizontal: 24,
            paddingTop: 24,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
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

          {/* Discount Type */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-foreground mb-2">
              {t('voucher.discountTypeLabel')} <Text className="text-error">*</Text>
            </Text>
            <View className="flex-row gap-3">
              <TouchableOpacity
                className={`flex-1 py-3 rounded-lg items-center border ${
                  discountType === 'PERCENTAGE'
                    ? 'bg-primary border-primary'
                    : 'bg-white border-gray-300'
                }`}
                onPress={() => setDiscountType('PERCENTAGE')}
              >
                <Text
                  className={
                    discountType === 'PERCENTAGE'
                      ? 'text-white font-semibold'
                      : 'text-foreground'
                  }
                >
                  {t('voucher.percentageLabel')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 py-3 rounded-lg items-center border ${
                  discountType === 'FIXED_AMOUNT'
                    ? 'bg-primary border-primary'
                    : 'bg-white border-gray-300'
                }`}
                onPress={() => setDiscountType('FIXED_AMOUNT')}
              >
                <Text
                  className={
                    discountType === 'FIXED_AMOUNT'
                      ? 'text-white font-semibold'
                      : 'text-foreground'
                  }
                >
                  {t('voucher.fixedAmountLabel')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Discount Value */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-foreground mb-2">
              {t('voucher.discountValueLabel')} {discountType === 'PERCENTAGE' ? t('voucher.percentageSuffix') : t('voucher.fixedAmountSuffix')}{' '}
              <Text className="text-error">*</Text>
            </Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 text-base bg-white"
              placeholder={
                discountType === 'PERCENTAGE' ? t('voucher.percentagePlaceholder') : t('voucher.fixedAmountPlaceholder')
              }
              keyboardType="numeric"
              value={discountValue}
              onChangeText={setDiscountValue}
            />
          </View>

          {/* Point Cost & Quantity */}
          <View className="flex-row gap-4 mb-4">
            <View className="flex-1">
              <Text className="text-sm font-medium text-foreground mb-2">
                {t('voucher.pointCostLabel')} <Text className="text-error">*</Text>
              </Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 text-base bg-white"
                placeholder={t('voucher.pointCostPlaceholder')}
                keyboardType="numeric"
                value={pointCost}
                onChangeText={setPointCost}
              />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-medium text-foreground mb-2">
                {t('voucher.quantityLabel')} <Text className="text-error">*</Text>
              </Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 text-base bg-white"
                placeholder={t('voucher.quantityPlaceholder')}
                keyboardType="numeric"
                value={totalQuantity}
                onChangeText={setTotalQuantity}
              />
            </View>
          </View>

          {/* Valid Until */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-foreground mb-2">
              {t('voucher.validUntilLabel')} <Text className="text-error">*</Text>
            </Text>
            <TouchableOpacity
              className="border border-gray-300 rounded-lg px-4 py-3 bg-white"
              onPress={() => setActiveValidUntilPicker(true)}
            >
              <View className="flex-row items-center justify-between">
                <Text className="text-base text-foreground">
                  {validUntil.toLocaleDateString('vi-VN')}
                </Text>
                <Ionicons name="calendar-outline" size={20} color="#6b7280" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Code */}
          <View className="mb-8">
            <Text className="text-sm font-medium text-foreground mb-2">
              {t('voucher.codeLabel')} <Text className="text-error">*</Text>
            </Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 text-base bg-white uppercase"
              placeholder={t('voucher.codePlaceholder')}
              value={code}
              autoCapitalize="characters"
              onChangeText={(value) => setCode(value.toUpperCase())}
            />
          </View>
        </ScrollView>

        {/* Fixed Bottom Submit Button */}
        <View className="px-6 pb-6">
          <TouchableOpacity
            className="bg-primary py-4 rounded-xl items-center"
            onPress={handleCreate}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-lg font-bold">{t('voucher.createVoucherBtn')}</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* DateTimePicker Modal */}
        <DateTimePickerModal
          visible={activeValidUntilPicker}
          value={validUntil}
          mode="date"
          minimumDate={new Date()}
          onChange={(_, date) => {
            if (date) {
              setValidUntil(date);
            }
          }}
          onClose={() => setActiveValidUntilPicker(false)}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

export default CreateVoucherScreen;
