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
  Image,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePickerModal from '@/components/shared/DateTimePickerModal';
import { useRouter } from 'expo-router';
import StackHeader from '@/components/shared/headers/StackHeader';
import { useAuthStore } from '@/stores/authStore';
import { storeCreateVoucherApi, CreateVoucherBody } from '@/lib/voucherApi';
import { getMyStorePostsApi, IPostDetail } from '@/lib/postApi';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '@/lib/hooks/useThemeColors';

const CreateVoucherScreen = () => {
  const router = useRouter();
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();

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
    } catch {
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
    <View className="bg-neutral dark:bg-neutral-T10 flex-1">
      <StackHeader title={t('voucher.createVoucherTitle')} />
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
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Basic Info ── */}
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
          </View>

          {/* ── Discount Config ── */}
          <View className="mb-8 gap-6">
            <View className="gap-2">
              <Text className="font-label text-neutral-T50 dark:text-neutral-T60 ml-1 text-sm font-semibold">
                {t('voucher.discountTypeLabel')}{' '}
                <Text className="text-error">*</Text>
              </Text>
              <View className="flex-row gap-3">
                <TouchableOpacity
                  className={`flex-1 items-center rounded-xl border py-3 active:opacity-80 ${
                    discountType === 'PERCENTAGE'
                      ? 'bg-primary-T40 border-primary-T40'
                      : 'bg-neutral-T95 dark:bg-neutral-T30 border-neutral-T90 dark:border-neutral-T30'
                  }`}
                  onPress={() => setDiscountType('PERCENTAGE')}
                >
                  <Text
                    className={`font-label text-sm font-semibold ${
                      discountType === 'PERCENTAGE'
                        ? 'text-neutral-T100'
                        : 'text-neutral-T50 dark:text-neutral-T60'
                    }`}
                  >
                    {t('voucher.percentageLabel')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`flex-1 items-center rounded-xl border py-3 active:opacity-80 ${
                    discountType === 'FIXED_AMOUNT'
                      ? 'bg-primary-T40 border-primary-T40'
                      : 'bg-neutral-T95 dark:bg-neutral-T30 border-neutral-T90 dark:border-neutral-T30'
                  }`}
                  onPress={() => setDiscountType('FIXED_AMOUNT')}
                >
                  <Text
                    className={`font-label text-sm font-semibold ${
                      discountType === 'FIXED_AMOUNT'
                        ? 'text-neutral-T100'
                        : 'text-neutral-T50 dark:text-neutral-T60'
                    }`}
                  >
                    {t('voucher.fixedAmountLabel')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View className="gap-2">
              <Text className="font-label text-neutral-T50 dark:text-neutral-T60 ml-1 text-sm font-semibold">
                {t('voucher.discountValueLabel')}{' '}
                {discountType === 'PERCENTAGE'
                  ? t('voucher.percentageSuffix')
                  : t('voucher.fixedAmountSuffix')}{' '}
                <Text className="text-error">*</Text>
              </Text>
              <TextInput
                className="bg-neutral-T95 dark:bg-neutral-T30 border-neutral-T90 dark:border-neutral-T30 font-body text-neutral-T10 dark:text-neutral-T90 h-14 w-full rounded-xl border px-4 text-base"
                placeholder={
                  discountType === 'PERCENTAGE'
                    ? t('voucher.percentagePlaceholder')
                    : t('voucher.fixedAmountPlaceholder')
                }
                placeholderTextColor={colors.placeholder}
                keyboardType="numeric"
                value={discountValue}
                onChangeText={setDiscountValue}
              />
            </View>

            <View className="flex-row gap-4">
              <View className="flex-1 gap-2">
                <Text className="font-label text-neutral-T50 dark:text-neutral-T60 ml-1 text-sm font-semibold">
                  {t('voucher.pointCostLabel')}{' '}
                  <Text className="text-error">*</Text>
                </Text>
                <TextInput
                  className="bg-neutral-T95 dark:bg-neutral-T30 border-neutral-T90 dark:border-neutral-T30 font-body text-neutral-T10 dark:text-neutral-T90 h-14 w-full rounded-xl border px-4 text-base"
                  placeholder={t('voucher.pointCostPlaceholder')}
                  placeholderTextColor={colors.placeholder}
                  keyboardType="numeric"
                  value={pointCost}
                  onChangeText={setPointCost}
                />
              </View>
              <View className="flex-1 gap-2">
                <Text className="font-label text-neutral-T50 dark:text-neutral-T60 ml-1 text-sm font-semibold">
                  {t('voucher.quantityLabel')}{' '}
                  <Text className="text-error">*</Text>
                </Text>
                <TextInput
                  className="bg-neutral-T95 dark:bg-neutral-T30 border-neutral-T90 dark:border-neutral-T30 font-body text-neutral-T10 dark:text-neutral-T90 h-14 w-full rounded-xl border px-4 text-base"
                  placeholder={t('voucher.quantityPlaceholder')}
                  placeholderTextColor={colors.placeholder}
                  keyboardType="numeric"
                  value={totalQuantity}
                  onChangeText={setTotalQuantity}
                />
              </View>
            </View>
          </View>

          {/* ── Validity & Code ── */}
          <View className="mb-8 gap-6">
            <View className="gap-2">
              <Text className="font-label text-neutral-T50 dark:text-neutral-T60 ml-1 text-sm font-semibold">
                {t('voucher.validUntilLabel')}{' '}
                <Text className="text-error">*</Text>
              </Text>
              <TouchableOpacity
                className="bg-neutral-T95 dark:bg-neutral-T30 border-neutral-T90 dark:border-neutral-T30 h-14 flex-row items-center justify-between rounded-xl border px-4 active:opacity-80"
                onPress={() => setActiveValidUntilPicker(true)}
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

            <View className="gap-2">
              <Text className="font-label text-neutral-T50 dark:text-neutral-T60 ml-1 text-sm font-semibold">
                {t('voucher.codeLabel')} <Text className="text-error">*</Text>
              </Text>
              <TextInput
                className="bg-neutral-T95 dark:bg-neutral-T30 border-neutral-T90 dark:border-neutral-T30 font-body text-neutral-T10 dark:text-neutral-T90 h-14 w-full rounded-xl border px-4 text-base uppercase"
                placeholder={t('voucher.codePlaceholder')}
                placeholderTextColor={colors.placeholder}
                value={code}
                autoCapitalize="characters"
                onChangeText={(value) => setCode(value.toUpperCase())}
              />
            </View>
          </View>

          {/* ── Applicable Scope ── */}
          <View className="mb-8 gap-3">
            <Text className="font-label text-neutral-T50 dark:text-neutral-T60 ml-1 text-sm font-semibold">
              {t('voucher.applicableScopeLabel')}
            </Text>
            <View className="flex-row gap-3">
              <TouchableOpacity
                className={`flex-1 items-center rounded-xl border py-3 active:opacity-80 ${
                  applicableType === 'ALL'
                    ? 'bg-primary-T40 border-primary-T40'
                    : 'bg-neutral-T95 dark:bg-neutral-T30 border-neutral-T90 dark:border-neutral-T30'
                }`}
                onPress={() => setApplicableType('ALL')}
              >
                <Text
                  className={`font-label text-sm font-semibold ${
                    applicableType === 'ALL'
                      ? 'text-neutral-T100'
                      : 'text-neutral-T50 dark:text-neutral-T60'
                  }`}
                >
                  {t('voucher.applicableScopeAll')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 items-center rounded-xl border py-3 active:opacity-80 ${
                  applicableType === 'SPECIFIC'
                    ? 'bg-primary-T40 border-primary-T40'
                    : 'bg-neutral-T95 dark:bg-neutral-T30 border-neutral-T90 dark:border-neutral-T30'
                }`}
                onPress={() => setApplicableType('SPECIFIC')}
              >
                <Text
                  className={`font-label text-sm font-semibold ${
                    applicableType === 'SPECIFIC'
                      ? 'text-neutral-T100'
                      : 'text-neutral-T50 dark:text-neutral-T60'
                  }`}
                >
                  {t('voucher.applicableScopeSpecific')}
                </Text>
              </TouchableOpacity>
            </View>

            {applicableType === 'SPECIFIC' && (
              <View className="mt-1 gap-2">
                {selectedPostIds.length > 0 && (
                  <Text className="font-label text-primary-T40 dark:text-primary-T60 ml-1 text-xs font-semibold">
                    {t('voucher.applicableSelectedCount', {
                      count: selectedPostIds.length,
                    })}
                  </Text>
                )}
                {loadingPosts ? (
                  <ActivityIndicator
                    className="mt-2"
                    color={colors.primaryGreen}
                  />
                ) : availablePosts.length === 0 ? (
                  <Text className="font-body text-neutral-T50 dark:text-neutral-T60 mt-2 text-sm">
                    {t('voucher.applicableNoPostsFound')}
                  </Text>
                ) : (
                  availablePosts.map((post) => {
                    const selected = selectedPostIds.includes(post._id);
                    return (
                      <TouchableOpacity
                        key={post._id}
                        className={`flex-row items-center rounded-xl border p-3 active:opacity-80 ${
                          selected
                            ? 'border-primary-T40 bg-primary-T95 dark:bg-primary-T20'
                            : 'bg-neutral-T95 dark:bg-neutral-T30 border-neutral-T90 dark:border-neutral-T30'
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
                            className="font-label text-neutral-T10 dark:text-neutral-T90 text-sm font-medium"
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
                            <Text className="font-label text-neutral-T50 dark:text-neutral-T60 text-[11px]">
                              {t('post.remainingCount', {
                                remaining: post.remainingQuantity,
                                total: post.totalQuantity,
                              })}
                            </Text>
                            <Text className="font-label text-neutral-T50 dark:text-neutral-T60 text-[11px]">
                              {t('post.expiryPrefix')}{' '}
                              {new Date(post.expiryDate).toLocaleDateString(
                                'vi-VN'
                              )}
                            </Text>
                          </View>
                        </View>
                        <MaterialIcons
                          name={
                            selected ? 'check-circle' : 'radio-button-unchecked'
                          }
                          size={22}
                          color={
                            selected ? colors.primaryGreen : colors.textMuted
                          }
                        />
                      </TouchableOpacity>
                    );
                  })
                )}
              </View>
            )}
          </View>
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
        <TouchableOpacity
          className="bg-primary-T40 h-14 flex-row items-center justify-center gap-2 rounded-xl shadow-sm active:opacity-80"
          onPress={handleCreate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <MaterialIcons name="check-circle" size={18} color="#FFFFFF" />
              <Text className="font-label text-neutral-T100 text-sm font-medium">
                {t('voucher.createVoucherBtn')}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <DateTimePickerModal
        visible={activeValidUntilPicker}
        value={validUntil}
        mode="date"
        minimumDate={new Date()}
        onChange={(_, date) => {
          if (date) setValidUntil(date);
        }}
        onClose={() => setActiveValidUntilPicker(false)}
      />
    </View>
  );
};

export default CreateVoucherScreen;
