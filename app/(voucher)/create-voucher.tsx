import React, { useState, useCallback } from 'react';
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
import { useEffect, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePickerModal from '@/components/shared/DateTimePickerModal';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/stores/authStore';
import { storeCreateVoucherApi, CreateVoucherBody } from '@/lib/voucherApi';

const CreateVoucherScreen = () => {
  const router = useRouter();
  const { user } = useAuthStore();

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
      Alert.alert('Lỗi', 'Chỉ chủ cửa hàng mới tạo được voucher.');
      return;
    }

    if (!title.trim()) {
      Alert.alert('Lỗi', 'Tiêu đề không được để trống.');
      return;
    }
    if (
      parseFloat(discountValue) <= 0 ||
      parseFloat(pointCost) <= 0 ||
      parseInt(totalQuantity) <= 0
    ) {
      Alert.alert(
        'Lỗi',
        'Giá trị giảm giá, điểm đổi và số lượng phải lớn hơn 0.'
      );
      return;
    }
    if (!code.trim()) {
      Alert.alert('Lỗi', 'Mã voucher không được để trống.');
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
        Alert.alert('Thành công', 'Voucher đã được tạo!', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } else {
        Alert.alert('Lỗi', 'Không thể tạo voucher. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Create voucher error:', error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi tạo voucher.');
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
      <SafeAreaView
        className="flex-1 bg-background"
        edges={['top', 'left', 'right']}
      >
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
          <Text className="text-2xl font-bold text-foreground mb-6">
            Tạo Voucher mới
          </Text>

          {/* Title */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-foreground mb-2">
              Tiêu đề <Text className="text-error">*</Text>
            </Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 text-base bg-white"
              placeholder="VD: Giảm 20% đơn từ 100k"
              value={title}
              onChangeText={setTitle}
            />
          </View>

          {/* Description */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-foreground mb-2">
              Mô tả
            </Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 text-base bg-white h-24"
              placeholder="Mô tả chi tiết ưu đãi..."
              multiline
              numberOfLines={4}
              value={description}
              onChangeText={setDescription}
            />
          </View>

          {/* Discount Type */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-foreground mb-2">
              Loại giảm giá <Text className="text-error">*</Text>
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
                  Phần trăm (%)
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
                  Cố định (đ)
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Discount Value */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-foreground mb-2">
              Giá trị giảm {discountType === 'PERCENTAGE' ? '(%)' : '(VNĐ)'}{' '}
              <Text className="text-error">*</Text>
            </Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 text-base bg-white"
              placeholder={
                discountType === 'PERCENTAGE' ? 'VD: 20' : 'VD: 10000'
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
                Điểm đổi <Text className="text-error">*</Text>
              </Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 text-base bg-white"
                placeholder="VD: 50"
                keyboardType="numeric"
                value={pointCost}
                onChangeText={setPointCost}
              />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-medium text-foreground mb-2">
                Số lượng <Text className="text-error">*</Text>
              </Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 text-base bg-white"
                placeholder="VD: 100"
                keyboardType="numeric"
                value={totalQuantity}
                onChangeText={setTotalQuantity}
              />
            </View>
          </View>

          {/* Valid Until */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-foreground mb-2">
              Hết hạn <Text className="text-error">*</Text>
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
              Mã voucher <Text className="text-error">*</Text>
            </Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 text-base bg-white uppercase"
              placeholder="VD: SALE20"
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
              <Text className="text-white text-lg font-bold">Tạo Voucher</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* DateTimePicker Modal */}
        <DateTimePickerModal
          visible={activeValidUntilPicker}
          value={validUntil}
          mode="date"
          minimumDate={new Date()}
          onChange={(event, date) => {
            setActiveValidUntilPicker(Platform.OS === 'android');
            if (date) {
              setValidUntil(date);
            }
          }}
          onClose={() => setActiveValidUntilPicker(false)}
        />
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default CreateVoucherScreen;
