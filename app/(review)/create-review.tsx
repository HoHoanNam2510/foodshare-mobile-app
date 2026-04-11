// app/(review)/create-review.tsx
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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

import StarRating from '@/components/review/StarRating';
import StackHeader from '@/components/shared/headers/StackHeader';
import { createReviewApi, updateMyReviewApi } from '@/lib/reviewApi';

// ── Rating Labels ─────────────────────────────────────────────────────────────

const RATING_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: 'Rất không hài lòng', color: '#DC2626' },
  2: { label: 'Không hài lòng',     color: '#F97316' },
  3: { label: 'Bình thường',        color: '#A16207' },
  4: { label: 'Hài lòng',          color: '#15803D' },
  5: { label: 'Rất hài lòng',      color: '#296C24' },
};

// ── Screen ────────────────────────────────────────────────────────────────────

export default function CreateReviewScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const {
    transactionId,
    reviewerName,
    revieweeName,
    // Edit-mode params
    reviewId,
    existingRating,
    existingFeedback,
  } = useLocalSearchParams<{
    transactionId?: string;
    reviewerName?: string;
    revieweeName?: string;
    reviewId?: string;
    existingRating?: string;
    existingFeedback?: string;
  }>();

  const isEditMode = !!reviewId;

  const [rating, setRating] = useState<number>(
    existingRating ? Number(existingRating) : 0
  );
  const [feedback, setFeedback] = useState(existingFeedback ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const ratingMeta = rating > 0 ? RATING_LABELS[rating] : null;
  const canSubmit = rating > 0 && !isSubmitting;

  // ── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setIsSubmitting(true);
    try {
      if (isEditMode) {
        await updateMyReviewApi(reviewId!, { rating, feedback: feedback.trim() });
        Alert.alert(
          'Đã cập nhật',
          'Đánh giá của bạn đã được cập nhật. Điểm uy tín của người được đánh giá sẽ được tính lại.',
          [{ text: 'Xong', onPress: () => router.back() }]
        );
      } else {
        if (!transactionId) {
          Alert.alert('Lỗi', 'Thiếu thông tin giao dịch.');
          return;
        }
        await createReviewApi({
          transactionId,
          rating,
          feedback: feedback.trim(),
        });
        Alert.alert(
          'Đánh giá thành công! +2 🌿',
          'Cảm ơn bạn đã để lại đánh giá. Bạn được cộng 2 GreenPoints vì đã có tâm với cộng đồng.',
          [{ text: 'Tuyệt vời!', onPress: () => router.back() }]
        );
      }
    } catch (err: any) {
      const status = err?.response?.status;
      const message: string = err?.response?.data?.message ?? 'Không thể gửi đánh giá.';

      if (status === 409) {
        Alert.alert(
          'Đã đánh giá rồi',
          'Bạn đã đánh giá giao dịch này trước đó. Vào "Đánh giá của tôi" để xem và chỉnh sửa.',
          [{ text: 'Đóng', onPress: () => router.back() }]
        );
      } else if (status === 400) {
        Alert.alert('Không thể đánh giá', message);
      } else {
        Alert.alert('Lỗi', message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <View className="flex-1 bg-neutral">
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <StackHeader title={isEditMode ? 'Sửa đánh giá' : 'Đánh giá giao dịch'} />

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
          {/* ── Context info ── */}
          {(revieweeName || reviewerName) && (
            <View className="mx-4 mt-4 bg-neutral-T100 rounded-2xl p-4 gap-2" style={styles.card}>
              <View className="flex-row items-center gap-2">
                <View className="w-7 h-7 rounded-lg bg-primary-T95 items-center justify-center">
                  <MaterialIcons name="rate-review" size={15} color="#296C24" />
                </View>
                <Text className="font-label font-semibold text-sm text-neutral-T50">
                  {isEditMode ? 'Chỉnh sửa đánh giá cho' : 'Bạn đang đánh giá'}
                </Text>
              </View>
              <Text
                style={{ fontFamily: 'Epilogue', fontWeight: '700' }}
                className="text-base text-neutral-T10"
              >
                {revieweeName ?? reviewerName ?? '—'}
              </Text>
            </View>
          )}

          {/* ── Star Picker ── */}
          <View className="mx-4 mt-4 bg-neutral-T100 rounded-2xl p-5 gap-4 items-center" style={styles.card}>
            <Text
              style={{ fontFamily: 'Epilogue', fontWeight: '700' }}
              className="text-base text-neutral-T10"
            >
              Chọn mức độ hài lòng
            </Text>

            <StarRating rating={rating} onRate={setRating} size={40} gap={8} />

            {ratingMeta ? (
              <View
                className="px-4 py-1.5 rounded-full"
                style={{ backgroundColor: `${ratingMeta.color}15` }}
              >
                <Text
                  className="font-label font-semibold text-sm"
                  style={{ color: ratingMeta.color }}
                >
                  {ratingMeta.label}
                </Text>
              </View>
            ) : (
              <Text className="font-body text-sm text-neutral-T70">
                Nhấn vào sao để chọn
              </Text>
            )}
          </View>

          {/* ── Feedback ── */}
          <View className="mx-4 mt-4 gap-2">
            <Text
              style={{ fontFamily: 'Epilogue', fontWeight: '700' }}
              className="text-base text-neutral-T10"
            >
              Nhận xét (tùy chọn)
            </Text>
            <Text className="font-body text-sm text-neutral-T50 -mt-1">
              Chia sẻ trải nghiệm của bạn với cộng đồng
            </Text>

            <View className="bg-neutral-T100 rounded-2xl overflow-hidden" style={styles.card}>
              <TextInput
                value={feedback}
                onChangeText={setFeedback}
                placeholder="Viết nhận xét của bạn về giao dịch này..."
                placeholderTextColor="#AAABAB"
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                style={[styles.textArea, { fontFamily: 'BeVietnamPro-Regular' }]}
                className="text-neutral-T10 text-sm"
              />
              <View className="px-4 pb-3 flex-row justify-end">
                <Text className="font-label text-xs text-neutral-T70">
                  {feedback.trim().length} ký tự
                </Text>
              </View>
            </View>
          </View>

          {/* ── GreenPoints incentive (create-mode only) ── */}
          {!isEditMode && (
            <View className="mx-4 mt-4 flex-row gap-2 p-3 bg-primary-T95 rounded-xl items-start">
              <MaterialIcons name="eco" size={16} color="#296C24" style={{ marginTop: 1 }} />
              <Text className="font-body text-xs text-primary-T30 flex-1 leading-4">
                Bạn sẽ nhận được +2 GreenPoints khi hoàn thành đánh giá này. Góp phần xây dựng cộng đồng FoodShare văn minh hơn!
              </Text>
            </View>
          )}

          {/* ── Edit warning ── */}
          {isEditMode && (
            <View className="mx-4 mt-4 flex-row gap-2 p-3 bg-amber-50 rounded-xl items-start">
              <MaterialIcons name="info-outline" size={16} color="#A16207" style={{ marginTop: 1 }} />
              <Text className="font-body text-xs leading-4" style={{ color: '#A16207', flex: 1 }}>
                Sửa đánh giá sẽ tự động tính lại điểm uy tín của người được đánh giá. Không có GreenPoints bổ sung khi sửa.
              </Text>
            </View>
          )}

          {/* ── Integrity policy ── */}
          <View className="mx-4 mt-4 flex-row gap-2 p-3 bg-red-50 rounded-xl items-start">
            <MaterialIcons name="gpp-good" size={16} color="#ba1a1a" style={{ marginTop: 1 }} />
            <Text className="font-body text-xs text-error flex-1 leading-4">
              Đánh giá sai lệch hoặc cố ý ác ý có thể bị Admin xóa và dẫn đến trừ điểm xanh. Người dùng bị đánh giá có quyền báo cáo đánh giá của bạn.
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
                name={isEditMode ? 'save' : 'star'}
                size={18}
                color={canSubmit ? '#FFFFFF' : '#AAABAB'}
              />
              <Text
                className="font-label font-semibold text-base"
                style={{ color: canSubmit ? '#FFFFFF' : '#AAABAB' }}
              >
                {isEditMode ? 'Lưu thay đổi' : 'Gửi đánh giá'}
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
  textArea: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
    minHeight: 120,
    fontSize: 14,
    color: '#191C1C',
  },
});
