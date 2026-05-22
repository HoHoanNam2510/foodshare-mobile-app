import React, { useState, useCallback, useEffect, useRef } from 'react';
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
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePickerModal from '@/components/shared/DateTimePickerModal';
import { useRouter } from 'expo-router';
import StackHeader from '@/components/shared/headers/StackHeader';
import { useAuthStore } from '@/stores/authStore';
import { storeCreateVoucherApi, CreateVoucherBody } from '@/lib/voucherApi';
import { getMyStorePostsApi, IPostDetail } from '@/lib/postApi';
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

  const [applicableType, setApplicableType] = useState<'ALL' | 'SPECIFIC'>(
    'ALL'
  );
  const [selectedPostIds, setSelectedPostIds] = useState<string[]>([]);
  const [availablePosts, setAvailablePosts] = useState<IPostDetail[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const postsLoadedRef = useRef(false);

  useEffect(() => {
    if (applicableType !== 'SPECIFIC' || postsLoadedRef.current) return;
    postsLoadedRef.current = true;
    const fetchPosts = async () => {
      setLoadingPosts(true);
      try {
        const { data } = await getMyStorePostsApi({ status: 'AVAILABLE' });
        const now = new Date();
        setAvailablePosts(
          data.filter(
            (p) =>
              p.type === 'B2C_MYSTERY_BAG' &&
              p.remainingQuantity > 0 &&
              new Date(p.expiryDate) > now
          )
        );
      } catch {
        Alert.alert(
          t('voucher.errorAlert'),
          t('voucher.applicableLoadPostsError')
        );
      } finally {
        setLoadingPosts(false);
      }
    };
    fetchPosts();
  }, [applicableType, t]);

  const togglePostSelection = useCallback((postId: string) => {
    setSelectedPostIds((prev) =>
      prev.includes(postId)
        ? prev.filter((id) => id !== postId)
        : [...prev, postId]
    );
  }, []);

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
      Alert.alert(t('voucher.errorAlert'), t('voucher.invalidValues'));
      return;
    }
    if (!code.trim()) {
      Alert.alert(t('voucher.errorAlert'), t('voucher.codeRequired'));
      return;
    }
    if (applicableType === 'SPECIFIC' && selectedPostIds.length === 0) {
      Alert.alert(
        t('voucher.errorAlert'),
        t('voucher.applicableSpecificRequired')
      );
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
        applicableType,
        applicablePostIds:
          applicableType === 'SPECIFIC' ? selectedPostIds : undefined,
      };
      const { success } = await storeCreateVoucherApi(body);
      if (success) {
        Alert.alert(
          t('voucher.successAlert'),
          t('voucher.createVoucherSuccess'),
          [{ text: 'OK', onPress: () => router.back() }]
        );
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
    applicableType,
    selectedPostIds,
    user,
    router,
    t,
  ]);

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View className="bg-neutral flex-1">
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
            <Text className="text-foreground mb-2 text-sm font-medium">
              {t('voucher.titleLabel')} <Text className="text-error">*</Text>
            </Text>
            <TextInput
              className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-base"
              placeholder={t('voucher.titlePlaceholder')}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          {/* Description */}
          <View className="mb-4">
            <Text className="text-foreground mb-2 text-sm font-medium">
              {t('voucher.descriptionLabel')}
            </Text>
            <TextInput
              className="h-24 rounded-lg border border-gray-300 bg-white px-4 py-3 text-base"
              placeholder={t('voucher.descriptionPlaceholder')}
              multiline
              numberOfLines={4}
              value={description}
              onChangeText={setDescription}
            />
          </View>

          {/* Discount Type */}
          <View className="mb-4">
            <Text className="text-foreground mb-2 text-sm font-medium">
              {t('voucher.discountTypeLabel')}{' '}
              <Text className="text-error">*</Text>
            </Text>
            <View className="flex-row gap-3">
              <TouchableOpacity
                className={`flex-1 items-center rounded-lg border py-3 ${
                  discountType === 'PERCENTAGE'
                    ? 'bg-primary border-primary'
                    : 'border-gray-300 bg-white'
                }`}
                onPress={() => setDiscountType('PERCENTAGE')}
              >
                <Text
                  className={
                    discountType === 'PERCENTAGE'
                      ? 'font-semibold text-white'
                      : 'text-foreground'
                  }
                >
                  {t('voucher.percentageLabel')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 items-center rounded-lg border py-3 ${
                  discountType === 'FIXED_AMOUNT'
                    ? 'bg-primary border-primary'
                    : 'border-gray-300 bg-white'
                }`}
                onPress={() => setDiscountType('FIXED_AMOUNT')}
              >
                <Text
                  className={
                    discountType === 'FIXED_AMOUNT'
                      ? 'font-semibold text-white'
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
            <Text className="text-foreground mb-2 text-sm font-medium">
              {t('voucher.discountValueLabel')}{' '}
              {discountType === 'PERCENTAGE'
                ? t('voucher.percentageSuffix')
                : t('voucher.fixedAmountSuffix')}{' '}
              <Text className="text-error">*</Text>
            </Text>
            <TextInput
              className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-base"
              placeholder={
                discountType === 'PERCENTAGE'
                  ? t('voucher.percentagePlaceholder')
                  : t('voucher.fixedAmountPlaceholder')
              }
              keyboardType="numeric"
              value={discountValue}
              onChangeText={setDiscountValue}
            />
          </View>

          {/* Point Cost & Quantity */}
          <View className="mb-4 flex-row gap-4">
            <View className="flex-1">
              <Text className="text-foreground mb-2 text-sm font-medium">
                {t('voucher.pointCostLabel')}{' '}
                <Text className="text-error">*</Text>
              </Text>
              <TextInput
                className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-base"
                placeholder={t('voucher.pointCostPlaceholder')}
                keyboardType="numeric"
                value={pointCost}
                onChangeText={setPointCost}
              />
            </View>
            <View className="flex-1">
              <Text className="text-foreground mb-2 text-sm font-medium">
                {t('voucher.quantityLabel')}{' '}
                <Text className="text-error">*</Text>
              </Text>
              <TextInput
                className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-base"
                placeholder={t('voucher.quantityPlaceholder')}
                keyboardType="numeric"
                value={totalQuantity}
                onChangeText={setTotalQuantity}
              />
            </View>
          </View>

          {/* Valid Until */}
          <View className="mb-4">
            <Text className="text-foreground mb-2 text-sm font-medium">
              {t('voucher.validUntilLabel')}{' '}
              <Text className="text-error">*</Text>
            </Text>
            <TouchableOpacity
              className="rounded-lg border border-gray-300 bg-white px-4 py-3"
              onPress={() => setActiveValidUntilPicker(true)}
            >
              <View className="flex-row items-center justify-between">
                <Text className="text-foreground text-base">
                  {validUntil.toLocaleDateString('vi-VN')}
                </Text>
                <Ionicons name="calendar-outline" size={20} color="#6b7280" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Code */}
          <View className="mb-4">
            <Text className="text-foreground mb-2 text-sm font-medium">
              {t('voucher.codeLabel')} <Text className="text-error">*</Text>
            </Text>
            <TextInput
              className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-base uppercase"
              placeholder={t('voucher.codePlaceholder')}
              value={code}
              autoCapitalize="characters"
              onChangeText={(value) => setCode(value.toUpperCase())}
            />
          </View>

          {/* Applicable Scope */}
          <View className="mb-8">
            <Text className="text-foreground mb-2 text-sm font-medium">
              {t('voucher.applicableScopeLabel')}
            </Text>
            <View className="flex-row gap-3">
              <TouchableOpacity
                className={`flex-1 items-center rounded-lg border py-3 ${
                  applicableType === 'ALL'
                    ? 'bg-primary border-primary'
                    : 'border-gray-300 bg-white'
                }`}
                onPress={() => setApplicableType('ALL')}
              >
                <Text
                  className={
                    applicableType === 'ALL'
                      ? 'font-semibold text-white'
                      : 'text-foreground'
                  }
                >
                  {t('voucher.applicableScopeAll')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 items-center rounded-lg border py-3 ${
                  applicableType === 'SPECIFIC'
                    ? 'bg-primary border-primary'
                    : 'border-gray-300 bg-white'
                }`}
                onPress={() => setApplicableType('SPECIFIC')}
              >
                <Text
                  className={
                    applicableType === 'SPECIFIC'
                      ? 'font-semibold text-white'
                      : 'text-foreground'
                  }
                >
                  {t('voucher.applicableScopeSpecific')}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Post multi-select (SPECIFIC mode only) */}
            {applicableType === 'SPECIFIC' && (
              <View className="mt-3">
                {selectedPostIds.length > 0 && (
                  <Text className="text-primary mb-2 text-xs font-medium">
                    {t('voucher.applicableSelectedCount', {
                      count: selectedPostIds.length,
                    })}
                  </Text>
                )}
                {loadingPosts ? (
                  <ActivityIndicator className="mt-2" />
                ) : availablePosts.length === 0 ? (
                  <Text className="text-neutral-T50 mt-2 text-sm">
                    {t('voucher.applicableNoPostsFound')}
                  </Text>
                ) : (
                  availablePosts.map((post) => {
                    const selected = selectedPostIds.includes(post._id);
                    return (
                      <TouchableOpacity
                        key={post._id}
                        className={`mb-2 flex-row items-center rounded-xl border p-3 ${
                          selected
                            ? 'border-primary-T40 bg-primary-T95'
                            : 'border-gray-200 bg-white'
                        }`}
                        onPress={() => togglePostSelection(post._id)}
                        activeOpacity={0.7}
                      >
                        {post.images[0] ? (
                          <Image
                            source={{ uri: post.images[0] }}
                            style={{
                              width: 48,
                              height: 48,
                              borderRadius: 8,
                              marginRight: 12,
                            }}
                            resizeMode="cover"
                          />
                        ) : null}
                        <View className="flex-1">
                          <Text
                            className="text-neutral-T10 text-sm font-medium"
                            numberOfLines={1}
                          >
                            {post.title}
                          </Text>
                          <View className="mt-1 flex-row items-center gap-2">
                            <View
                              className="rounded px-1.5 py-0.5"
                              style={{ backgroundColor: 'rgba(148,74,0,0.12)' }}
                            >
                              <Text
                                className="font-label text-[10px] font-semibold"
                                style={{ color: '#944A00' }}
                              >
                                B2C
                              </Text>
                            </View>
                            <Text className="text-neutral-T50 text-[11px]">
                              {t('post.remainingCount', {
                                remaining: post.remainingQuantity,
                                total: post.totalQuantity,
                              })}
                            </Text>
                            <Text className="text-neutral-T50 text-[11px]">
                              {t('post.expiryPrefix')}{' '}
                              {new Date(post.expiryDate).toLocaleDateString(
                                'vi-VN'
                              )}
                            </Text>
                          </View>
                        </View>
                        <Ionicons
                          name={
                            selected ? 'checkmark-circle' : 'ellipse-outline'
                          }
                          size={22}
                          color={selected ? '#296C24' : '#9CA3AF'}
                        />
                      </TouchableOpacity>
                    );
                  })
                )}
              </View>
            )}
          </View>
        </ScrollView>

        {/* Fixed Bottom Submit Button */}
        <View className="px-6 pb-6">
          <TouchableOpacity
            className="bg-primary items-center rounded-xl py-4"
            onPress={handleCreate}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-lg font-bold text-white">
                {t('voucher.createVoucherBtn')}
              </Text>
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
