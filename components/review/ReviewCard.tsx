import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import StarRating from './StarRating';
import {
  type IReceivedReview,
  type IReviewUser,
  type IWrittenReview,
} from '@/lib/reviewApi';

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function getUser(u: IReviewUser | string | undefined): IReviewUser | null {
  if (!u || typeof u === 'string') return null;
  return u;
}

// ── Avatar ─────────────────────────────────────────────────────────────────

function UserAvatar({ user }: { user: IReviewUser | null }) {
  if (user?.avatar) {
    return (
      <Image
        source={{ uri: user.avatar }}
        style={styles.avatar}
        resizeMode="cover"
      />
    );
  }
  return (
    <View style={styles.avatarPlaceholder}>
      <MaterialIcons name="person" size={16} color="#757777" />
    </View>
  );
}

// ── Written Review Card ───────────────────────────────────────────────────────

interface WrittenCardProps {
  review: IWrittenReview;
  onEdit: () => void;
  onDelete: () => void;
  onReport?: () => void;
}

export function WrittenReviewCard({
  review,
  onEdit,
  onDelete,
  onReport,
}: WrittenCardProps) {
  const { t } = useTranslation();
  const reviewee = getUser(review.revieweeId as any);
  const tx =
    typeof review.transactionId === 'object' ? review.transactionId : null;
  const postTitle = tx?.postId ? (tx.postId as any).title : null;

  return (
    <View
      style={styles.card}
      className="bg-neutral-T100 mx-4 mb-3 overflow-hidden rounded-2xl"
    >
      {/* Header row */}
      <View className="gap-3 p-4">
        {/* Reviewee identity */}
        <View className="flex-row items-center gap-2.5">
          <UserAvatar user={reviewee} />
          <View className="flex-1">
            <Text
              className="font-label text-neutral-T10 text-sm font-semibold"
              numberOfLines={1}
            >
              {reviewee?.fullName ?? t('review.unknownUser')}
            </Text>
            {postTitle ? (
              <Text
                className="font-body text-neutral-T50 text-xs"
                numberOfLines={1}
              >
                {postTitle}
              </Text>
            ) : null}
          </View>
          <Text className="font-body text-neutral-T70 text-xs">
            {formatDate(review.createdAt)}
          </Text>
        </View>

        {/* Stars */}
        <StarRating rating={review.rating} size={18} gap={3} />

        {/* Feedback */}
        {review.feedback ? (
          <Text className="font-body text-neutral-T30 text-sm leading-5">
            {review.feedback}
          </Text>
        ) : (
          <Text className="font-body text-neutral-T70 text-xs italic">
            {t('review.noFeedback')}
          </Text>
        )}
      </View>

      {/* Action row */}
      <View className="border-neutral-T90 flex-row border-t">
        <TouchableOpacity
          onPress={onEdit}
          activeOpacity={0.8}
          className="flex-1 flex-row items-center justify-center gap-1.5 py-3"
        >
          <MaterialIcons name="edit" size={15} color="#296C24" />
          <Text className="font-label text-primary-T40 text-xs font-semibold">
            {t('review.editBtn')}
          </Text>
        </TouchableOpacity>

        <View className="bg-neutral-T90 w-px" />

        <TouchableOpacity
          onPress={onDelete}
          activeOpacity={0.8}
          className="flex-1 flex-row items-center justify-center gap-1.5 py-3"
        >
          <MaterialIcons name="delete-outline" size={15} color="#DC2626" />
          <Text
            className="font-label text-xs font-semibold"
            style={{ color: '#DC2626' }}
          >
            {t('review.withdrawBtn')}
          </Text>
        </TouchableOpacity>

        {onReport && (
          <>
            <View className="bg-neutral-T90 w-px" />
            <TouchableOpacity
              onPress={onReport}
              activeOpacity={0.8}
              className="flex-1 flex-row items-center justify-center gap-1.5 py-3"
            >
              <MaterialIcons name="flag" size={15} color="#AAABAB" />
              <Text className="font-label text-neutral-T50 text-xs font-semibold">
                {t('review.reportBtn')}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

// ── Received Review Card ──────────────────────────────────────────────────────

interface ReceivedCardProps {
  review: IReceivedReview;
  onReport: () => void;
}

export function ReceivedReviewCard({ review, onReport }: ReceivedCardProps) {
  const { t } = useTranslation();
  const reviewer = getUser(review.reviewerId as any);

  return (
    <View
      style={styles.card}
      className="bg-neutral-T100 mx-4 mb-3 overflow-hidden rounded-2xl"
    >
      <View className="gap-3 p-4">
        {/* Reviewer identity */}
        <View className="flex-row items-center gap-2.5">
          <UserAvatar user={reviewer} />
          <View className="flex-1">
            <Text
              className="font-label text-neutral-T10 text-sm font-semibold"
              numberOfLines={1}
            >
              {reviewer?.fullName ?? t('review.unknownUser')}
            </Text>
            <Text className="font-body text-neutral-T50 text-xs">
              {t('review.reviewedYou')}
            </Text>
          </View>
          <Text className="font-body text-neutral-T70 text-xs">
            {formatDate(review.createdAt)}
          </Text>
        </View>

        {/* Stars */}
        <StarRating rating={review.rating} size={18} gap={3} />

        {/* Feedback */}
        {review.feedback ? (
          <Text className="font-body text-neutral-T30 text-sm leading-5">
            {review.feedback}
          </Text>
        ) : (
          <Text className="font-body text-neutral-T70 text-xs italic">
            {t('review.noFeedback')}
          </Text>
        )}
      </View>

      {/* Report action */}
      <View className="border-neutral-T90 flex-row border-t">
        <TouchableOpacity
          onPress={onReport}
          activeOpacity={0.8}
          className="flex-1 flex-row items-center justify-center gap-1.5 py-3"
        >
          <MaterialIcons name="flag" size={15} color="#AAABAB" />
          <Text className="font-label text-neutral-T50 text-xs font-semibold">
            {t('review.reportIncorrect')}
          </Text>
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
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 3,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0F4F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
