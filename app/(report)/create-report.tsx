// app/(report)/create-report.tsx
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import StackHeader from '@/components/shared/headers/StackHeader';
import { pickImage } from '@/lib/imagePicker';
import {
  createReportApi,
  updateReportApi,
  type ReportReason,
  type ReportTargetType,
} from '@/lib/reportApi';
import { uploadImage } from '@/lib/uploadApi';

// ── Constants ─────────────────────────────────────────────────────────────────

const MAX_IMAGES = 5;

interface ReasonOption {
  value: ReportReason;
  label: string;
  icon: string;
  description: string;
}

const REASON_OPTIONS: ReasonOption[] = [
  {
    value: 'FOOD_SAFETY',
    label: 'An toàn thực phẩm',
    icon: 'warning',
    description: 'Thức ăn gây ngộ độc, hư hỏng, không an toàn',
  },
  {
    value: 'SCAM',
    label: 'Lừa đảo',
    icon: 'gpp-bad',
    description: 'Hàng không đúng mô tả, cố ý gian lận',
  },
  {
    value: 'INAPPROPRIATE_CONTENT',
    label: 'Nội dung không phù hợp',
    icon: 'block',
    description: 'Thông tin sai lệch, hình ảnh phản cảm',
  },
  {
    value: 'NO_SHOW',
    label: 'Không xuất hiện',
    icon: 'event-busy',
    description: 'Đã xác nhận nhưng không đến giao/nhận đồ',
  },
  {
    value: 'OTHER',
    label: 'Lý do khác',
    icon: 'more-horiz',
    description: 'Vi phạm khác không thuộc các mục trên',
  },
];

const TARGET_TYPE_LABEL: Record<ReportTargetType, string> = {
  POST: 'Bài đăng',
  USER: 'Người dùng',
  TRANSACTION: 'Giao dịch',
  REVIEW: 'Đánh giá',
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function CreateReportScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    targetType,
    targetId,
    targetTitle,
    reportId,
    existingReason,
    existingDescription,
    existingImages,
  } = useLocalSearchParams<{
    targetType: ReportTargetType;
    targetId: string;
    targetTitle?: string;
    // Edit-mode params (all optional)
    reportId?: string;
    existingReason?: ReportReason;
    existingDescription?: string;
    existingImages?: string; // JSON string of string[]
  }>();

  const isEditMode = !!reportId;

  // Parse pre-existing image URLs (already uploaded to Cloudinary)
  const parsedExistingImages: string[] = (() => {
    try {
      return existingImages ? (JSON.parse(existingImages) as string[]) : [];
    } catch {
      return [];
    }
  })();

  const [selectedReason, setSelectedReason] = useState<ReportReason | null>(
    (existingReason as ReportReason) ?? null
  );
  const [description, setDescription] = useState(existingDescription ?? '');
  // Already-uploaded URLs the user wants to keep
  const [keptImageUrls, setKeptImageUrls] =
    useState<string[]>(parsedExistingImages);
  // New local URIs picked from the device (need uploading)
  const [newLocalImages, setNewLocalImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  const totalImages = keptImageUrls.length + newLocalImages.length;

  const targetLabel = targetType ? TARGET_TYPE_LABEL[targetType] : 'Thực thể';

  // ── Image handling ────────────────────────────────────────────────────────

  const handleAddImage = async () => {
    if (totalImages >= MAX_IMAGES) return;
    const uri = await pickImage();
    if (uri) {
      setNewLocalImages((prev) => [...prev, uri]);
    }
  };

  const handleRemoveKeptImage = (index: number) => {
    setKeptImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveNewImage = (index: number) => {
    setNewLocalImages((prev) => prev.filter((_, i) => i !== index));
  };

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!selectedReason) {
      Alert.alert('Thiếu thông tin', 'Vui lòng chọn lý do vi phạm.');
      return;
    }
    if (description.trim().length < 10) {
      Alert.alert('Thiếu thông tin', 'Mô tả sự việc tối thiểu 10 ký tự.');
      return;
    }
    if (totalImages === 0) {
      Alert.alert(
        'Thiếu bằng chứng',
        'Vui lòng đính kèm ít nhất 1 ảnh bằng chứng.'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      // Upload any newly picked images to Cloudinary
      const uploadedNewUrls: string[] = [];
      for (let i = 0; i < newLocalImages.length; i++) {
        setUploadingIndex(i);
        const result = await uploadImage(newLocalImages[i], 'reports');
        uploadedNewUrls.push(result.url);
      }
      setUploadingIndex(null);

      const finalImages = [...keptImageUrls, ...uploadedNewUrls];

      if (isEditMode) {
        await updateReportApi(reportId!, {
          reason: selectedReason,
          description: description.trim(),
          images: finalImages,
        });
        Alert.alert(
          'Đã cập nhật báo cáo',
          'Thông tin báo cáo đã được cập nhật thành công.',
          [{ text: 'Đóng', onPress: () => router.back() }]
        );
      } else {
        await createReportApi({
          targetType,
          targetId,
          reason: selectedReason,
          description: description.trim(),
          images: finalImages,
        });
        Alert.alert(
          'Đã gửi báo cáo',
          'Cảm ơn bạn đã báo cáo. Đội ngũ FoodShare sẽ xem xét và xử lý trong thời gian sớm nhất.',
          [{ text: 'Về trang chính', onPress: () => router.back() }]
        );
      }
    } catch (err: any) {
      const msg: string =
        err?.response?.data?.message ??
        (isEditMode
          ? 'Không thể cập nhật báo cáo. Vui lòng thử lại.'
          : 'Không thể gửi báo cáo. Vui lòng thử lại.');
      if (err?.response?.status === 409) {
        Alert.alert('Không thể gửi', msg);
      } else {
        Alert.alert('Lỗi', msg);
      }
    } finally {
      setIsSubmitting(false);
      setUploadingIndex(null);
    }
  };

  const canSubmit =
    !!selectedReason &&
    description.trim().length >= 10 &&
    totalImages > 0 &&
    !isSubmitting;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <View className="flex-1 bg-neutral">
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />
      <StackHeader title={isEditMode ? 'Sửa báo cáo' : 'Báo cáo vi phạm'} />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Target Info ── */}
          <View
            className="mx-4 mt-4 bg-neutral-T100 rounded-2xl p-4 gap-2"
            style={styles.card}
          >
            <View className="flex-row items-center gap-2">
              <View className="w-7 h-7 rounded-lg bg-secondary-T95 items-center justify-center">
                <MaterialIcons name="flag" size={15} color="#C05621" />
              </View>
              <Text className="font-label font-semibold text-sm text-neutral-T50">
                Đối tượng báo cáo
              </Text>
            </View>
            <View className="flex-row items-center gap-2">
              <View className="px-2.5 py-1 rounded-lg bg-neutral-T95">
                <Text className="font-label font-semibold text-xs text-neutral-T30">
                  {targetLabel}
                </Text>
              </View>
              {targetTitle ? (
                <Text
                  className="font-body text-sm text-neutral-T10 flex-1"
                  numberOfLines={1}
                >
                  {targetTitle}
                </Text>
              ) : (
                <Text
                  className="font-body text-xs text-neutral-T50 flex-1"
                  numberOfLines={1}
                >
                  ID: {targetId}
                </Text>
              )}
            </View>
          </View>

          {/* ── Reason Selector ── */}
          <View className="mx-4 mt-4 gap-2">
            <Text
              className="text-base text-neutral-T10"
              style={{ fontFamily: 'Epilogue', fontWeight: '700' }}
            >
              Lý do vi phạm
            </Text>
            <Text className="font-body text-sm text-neutral-T50 -mt-1">
              Chọn lý do phù hợp nhất với sự việc
            </Text>

            <View className="gap-2 mt-1">
              {REASON_OPTIONS.map((option) => {
                const isSelected = selectedReason === option.value;
                return (
                  <TouchableOpacity
                    key={option.value}
                    activeOpacity={0.8}
                    onPress={() => setSelectedReason(option.value)}
                    className="bg-neutral-T100 rounded-2xl p-4 flex-row items-center gap-3"
                    style={[styles.card, isSelected && styles.cardSelected]}
                  >
                    <View
                      className="w-10 h-10 rounded-xl items-center justify-center"
                      style={{
                        backgroundColor: isSelected ? '#296C24' : '#F0F4F0',
                      }}
                    >
                      <MaterialIcons
                        name={option.icon as any}
                        size={20}
                        color={isSelected ? '#FFFFFF' : '#296C24'}
                      />
                    </View>
                    <View className="flex-1 gap-0.5">
                      <Text
                        className="font-label text-sm text-neutral-T10"
                        style={{ fontWeight: isSelected ? '700' : '600' }}
                      >
                        {option.label}
                      </Text>
                      <Text
                        className="font-body text-xs text-neutral-T50"
                        numberOfLines={1}
                      >
                        {option.description}
                      </Text>
                    </View>
                    <View
                      className="w-5 h-5 rounded-full border-2 items-center justify-center"
                      style={{
                        borderColor: isSelected ? '#296C24' : '#C8CACA',
                        backgroundColor: isSelected ? '#296C24' : 'transparent',
                      }}
                    >
                      {isSelected && (
                        <MaterialIcons name="check" size={12} color="#FFFFFF" />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* ── Description ── */}
          <View className="mx-4 mt-5 gap-2">
            <Text
              className="text-base text-neutral-T10"
              style={{ fontFamily: 'Epilogue', fontWeight: '700' }}
            >
              Mô tả sự việc
            </Text>
            <Text className="font-body text-sm text-neutral-T50 -mt-1">
              Tối thiểu 10 ký tự — cung cấp càng nhiều chi tiết càng tốt
            </Text>
            <View
              className="bg-neutral-T100 rounded-2xl overflow-hidden"
              style={[
                styles.card,
                description.length > 0 &&
                  description.trim().length < 10 &&
                  styles.cardError,
              ]}
            >
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Mô tả chi tiết sự việc vi phạm..."
                placeholderTextColor="#AAABAB"
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                style={[
                  styles.textArea,
                  { fontFamily: 'BeVietnamPro-Regular' },
                ]}
                className="text-neutral-T10 text-sm"
              />
              <View className="px-4 pb-3 flex-row justify-end">
                <Text
                  className="font-label text-xs"
                  style={{
                    color:
                      description.trim().length < 10 ? '#C05621' : '#AAABAB',
                  }}
                >
                  {description.trim().length}/10 ký tự tối thiểu
                </Text>
              </View>
            </View>
          </View>

          {/* ── Evidence Images ── */}
          <View className="mx-4 mt-5 gap-2">
            <View className="flex-row items-center justify-between">
              <View className="gap-0.5">
                <Text
                  className="text-base text-neutral-T10"
                  style={{ fontFamily: 'Epilogue', fontWeight: '700' }}
                >
                  Ảnh bằng chứng
                </Text>
                <Text className="font-body text-sm text-neutral-T50">
                  Bắt buộc — tối đa {MAX_IMAGES} ảnh
                </Text>
              </View>
              <Text className="font-label font-semibold text-xs text-neutral-T50">
                {totalImages}/{MAX_IMAGES}
              </Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 12, paddingBottom: 4 }}
            >
              {totalImages < MAX_IMAGES && (
                <TouchableOpacity
                  className="w-28 h-28 rounded-2xl border border-dashed border-neutral-T80 bg-neutral-T95 items-center justify-center gap-1 active:opacity-80"
                  onPress={handleAddImage}
                  disabled={isSubmitting}
                >
                  <MaterialIcons name="add-a-photo" size={26} color="#296C24" />
                  <Text className="font-label text-xs font-semibold text-primary-T40">
                    Thêm ảnh
                  </Text>
                </TouchableOpacity>
              )}
              {/* Already-uploaded images (edit mode) */}
              {keptImageUrls.map((url, index) => (
                <View
                  key={`kept-${url}-${index}`}
                  className="w-28 h-28 rounded-2xl overflow-hidden shadow-sm"
                >
                  <Image
                    source={{ uri: url }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                  {/* "Saved" badge */}
                  <View className="absolute bottom-1.5 left-1.5 bg-primary-T40/80 rounded px-1.5 py-0.5">
                    <Text className="text-white text-[9px] font-bold">
                      Đã lưu
                    </Text>
                  </View>
                  {!isSubmitting && (
                    <TouchableOpacity
                      className="absolute top-2 right-2 w-6 h-6 bg-black/40 rounded-full items-center justify-center active:opacity-80"
                      onPress={() => handleRemoveKeptImage(index)}
                    >
                      <MaterialIcons name="close" size={14} color="white" />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
              {/* Newly picked local images */}
              {newLocalImages.map((uri, index) => (
                <View
                  key={`new-${uri}-${index}`}
                  className="w-28 h-28 rounded-2xl overflow-hidden shadow-sm"
                >
                  <Image
                    source={{ uri }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                  {uploadingIndex === index && (
                    <View className="absolute inset-0 bg-black/50 items-center justify-center">
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    </View>
                  )}
                  {!isSubmitting && (
                    <TouchableOpacity
                      className="absolute top-2 right-2 w-6 h-6 bg-black/40 rounded-full items-center justify-center active:opacity-80"
                      onPress={() => handleRemoveNewImage(index)}
                    >
                      <MaterialIcons name="close" size={14} color="white" />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </ScrollView>
          </View>

          {/* ── Policy note ── */}
          <View className="mx-4 mt-4 flex-row gap-2 p-3 bg-red-100 rounded-xl">
            <MaterialIcons
              name="info-outline"
              size={16}
              color="#ba1a1a"
              style={{ marginTop: 1 }}
            />
            <Text className="font-body text-xs text-error flex-1 leading-4">
              Báo cáo sai sự thật hoặc cố ý spam có thể dẫn đến trừ điểm xanh và
              khóa tài khoản. Mỗi thực thể chỉ được báo cáo một lần.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── Submit Button ── */}
      <View
        className="absolute bottom-0 left-0 right-0 bg-neutral-T100 px-4 pt-3 border-t border-neutral-T90"
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={!canSubmit}
          activeOpacity={0.85}
          className="h-14 rounded-xl items-center justify-center flex-row gap-2"
          style={{ backgroundColor: canSubmit ? '#296C24' : '#E0E0E0' }}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <MaterialIcons
                name="send"
                size={18}
                color={canSubmit ? '#FFFFFF' : '#AAABAB'}
              />
              <Text
                className="font-label font-semibold text-base"
                style={{ color: canSubmit ? '#FFFFFF' : '#AAABAB' }}
              >
                {isEditMode ? 'Lưu thay đổi' : 'Gửi báo cáo'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  cardSelected: {
    shadowColor: '#296C24',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1.5,
    borderColor: '#296C24',
  },
  cardError: {
    borderWidth: 1.5,
    borderColor: '#E53E3E',
  },
  textArea: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
    minHeight: 120,
    fontSize: 14,
    color: '#191C1C',
  },
});
