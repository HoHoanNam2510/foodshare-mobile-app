// app/(profile)/badges.tsx
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ManagementHeader from '@/components/shared/headers/ManagementHeader';
import { getBadgeCatalogApi } from '@/lib/badgeApi';
import type { IBadge, TargetRole } from '@/lib/badgeApi';

// ─── Bộ lọc ───
type FilterOption = 'ALL' | 'UNLOCKED' | 'LOCKED';

const FILTER_OPTIONS: { value: FilterOption; labelKey: string }[] = [
  { value: 'ALL', labelKey: 'profile.badgeFilterAll' },
  { value: 'UNLOCKED', labelKey: 'profile.badgeFilterUnlocked' },
  { value: 'LOCKED', labelKey: 'profile.badgeFilterLocked' },
];

const TARGET_ROLE_LABEL_KEYS: Record<TargetRole, string> = {
  BOTH: 'profile.badgeTargetBoth',
  USER: 'roles.USER',
  STORE: 'roles.STORE',
};

const NUM_COLUMNS = 3;

// ─── Badge card ───
function BadgeCard({ badge, onPress }: { badge: IBadge; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      className="flex-1 items-center gap-2 px-2 py-4"
    >
      {/* Image container */}
      <View
        className={`h-20 w-20 items-center justify-center overflow-hidden rounded-2xl ${
          badge.isUnlocked ? 'bg-primary-T95' : 'bg-neutral-T95'
        }`}
        style={
          badge.isUnlocked
            ? {
                shadowColor: '#296C24',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.18,
                shadowRadius: 6,
                elevation: 3,
              }
            : undefined
        }
      >
        <Image
          source={{ uri: badge.imageUrl }}
          style={{
            width: 52,
            height: 52,
            opacity: badge.isUnlocked ? 1 : 0.25,
          }}
          resizeMode="contain"
        />
        {badge.isUnlocked && (
          <View className="bg-primary absolute bottom-1 right-1 h-4 w-4 items-center justify-center rounded-full">
            <MaterialIcons name="check" size={10} color="#fff" />
          </View>
        )}
      </View>

      {/* Name */}
      <Text
        className={`font-label text-center text-[11px] leading-tight ${
          badge.isUnlocked
            ? 'text-neutral-T10 font-semibold'
            : 'text-neutral-T50'
        }`}
        numberOfLines={2}
      >
        {badge.name}
      </Text>

      {/* Point reward chip */}
      {badge.isUnlocked ? (
        <View className="bg-primary-T95 flex-row items-center gap-0.5 rounded-full px-2 py-0.5">
          <MaterialIcons name="eco" size={10} color="#296C24" />
          <Text className="font-label text-primary-T30 text-[9px] font-bold">
            +{badge.pointReward}
          </Text>
        </View>
      ) : (
        <View className="bg-neutral-T90 flex-row items-center gap-0.5 rounded-full px-2 py-0.5">
          <MaterialIcons name="lock" size={10} color="#757777" />
          <Text className="font-label text-neutral-T50 text-[9px]">
            +{badge.pointReward}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// ─── Badge detail bottom sheet (simple modal-like View) ───
function BadgeDetail({
  badge,
  onClose,
}: {
  badge: IBadge;
  onClose: () => void;
}) {
  const { t, i18n } = useTranslation();
  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString(
      i18n.language === 'vi' ? 'vi-VN' : 'en-US',
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }
    );

  return (
    <View
      className="absolute inset-0 items-end justify-end"
      style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
    >
      <TouchableOpacity
        className="absolute inset-0"
        onPress={onClose}
        activeOpacity={1}
      />
      <View className="bg-neutral-T100 w-full gap-5 rounded-t-3xl px-6 pb-10 pt-6">
        {/* Drag handle */}
        <View className="bg-neutral-T80 -mt-1 mb-1 h-1 w-12 self-center rounded-full" />

        {/* Badge image */}
        <View className="items-center gap-3">
          <View
            className={`h-24 w-24 items-center justify-center rounded-3xl ${
              badge.isUnlocked ? 'bg-primary-T95' : 'bg-neutral-T95'
            }`}
          >
            <Image
              source={{ uri: badge.imageUrl }}
              style={{
                width: 64,
                height: 64,
                opacity: badge.isUnlocked ? 1 : 0.3,
              }}
              resizeMode="contain"
            />
          </View>
          <View className="items-center gap-1">
            <Text className="text-neutral-T10 text-center font-sans text-xl font-bold">
              {badge.name}
            </Text>
            <View
              className={`flex-row items-center gap-1 rounded-full px-3 py-1 ${
                badge.isUnlocked ? 'bg-primary-T95' : 'bg-neutral-T90'
              }`}
            >
              <MaterialIcons
                name={badge.isUnlocked ? 'check-circle' : 'lock'}
                size={12}
                color={badge.isUnlocked ? '#296C24' : '#757777'}
              />
              <Text
                className={`font-label text-xs font-semibold ${
                  badge.isUnlocked ? 'text-primary-T30' : 'text-neutral-T50'
                }`}
              >
                {badge.isUnlocked
                  ? t('profile.badgeUnlocked')
                  : t('profile.badgeLocked')}
              </Text>
            </View>
          </View>
        </View>

        {/* Description */}
        <View className="bg-neutral-T97 gap-3 rounded-2xl p-4">
          <Text className="font-body text-neutral-T30 text-sm leading-5">
            {badge.description}
          </Text>

          {/* Meta */}
          <View className="gap-2">
            <InfoRow
              icon="eco"
              label={t('profile.badgeRewardLabel')}
              value={`+${badge.pointReward} Green Points`}
              valueColor="#296C24"
            />
            <InfoRow
              icon="group"
              label={t('profile.badgeTargetLabel')}
              value={t(TARGET_ROLE_LABEL_KEYS[badge.targetRole])}
            />
            {badge.isUnlocked && badge.unlockedAt && (
              <InfoRow
                icon="calendar-today"
                label={t('profile.badgeUnlockedAtLabel')}
                value={formatDate(badge.unlockedAt)}
              />
            )}
          </View>
        </View>

        <TouchableOpacity
          onPress={onClose}
          className="bg-primary h-12 items-center justify-center rounded-2xl active:opacity-80"
        >
          <Text className="font-label text-neutral-T100 text-sm font-bold">
            {t('common.close')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function InfoRow({
  icon,
  label,
  value,
  valueColor,
}: {
  icon: string;
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <View className="flex-row items-center gap-2">
      <MaterialIcons name={icon as any} size={14} color="#757777" />
      <Text className="font-label text-neutral-T50 w-24 text-xs">{label}</Text>
      <Text
        className="font-label flex-1 text-xs font-semibold"
        style={{ color: valueColor ?? '#191C1C' }}
      >
        {value}
      </Text>
    </View>
  );
}

// ─── Main Screen ───
export default function BadgesScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [badges, setBadges] = useState<IBadge[]>([]);
  const [total, setTotal] = useState(0);
  const [unlocked, setUnlocked] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterOption>('ALL');
  const [selectedBadge, setSelectedBadge] = useState<IBadge | null>(null);

  const loadCatalog = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getBadgeCatalogApi();
      setBadges(res.data.badges);
      setTotal(res.data.total);
      setUnlocked(res.data.unlocked);
    } catch {
      Alert.alert(t('common.error'), t('profile.badgesError'));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadCatalog();
  }, [loadCatalog]);

  const filtered = badges.filter((b) => {
    if (filter === 'UNLOCKED') return b.isUnlocked;
    if (filter === 'LOCKED') return !b.isUnlocked;
    return true;
  });

  // Pad array to fill last row in 3-column grid
  const padded = [...filtered];
  const remainder = padded.length % NUM_COLUMNS;
  if (remainder !== 0) {
    for (let i = 0; i < NUM_COLUMNS - remainder; i++) {
      padded.push(null as unknown as IBadge);
    }
  }

  return (
    <View className="bg-neutral flex-1">
      <ManagementHeader
        title={t('profile.badgesCollection')}
        onBack={() => router.back()}
      />

      {/* Progress summary */}
      <View className="bg-primary-T95 mx-4 mt-4 gap-3 rounded-2xl p-5">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <MaterialIcons name="military-tech" size={22} color="#296C24" />
            <Text className="text-primary-T20 font-sans text-lg font-bold">
              {t('profile.badgesCount', { unlocked, total })}
            </Text>
          </View>
          <Text className="font-label text-primary-T40 text-sm font-bold">
            {total > 0 ? Math.round((unlocked / total) * 100) : 0}%
          </Text>
        </View>
        <View className="bg-primary-T90 h-2 overflow-hidden rounded-full">
          <View
            className="bg-primary h-full rounded-full"
            style={{ width: total > 0 ? `${(unlocked / total) * 100}%` : '0%' }}
          />
        </View>
        <Text className="font-body text-primary-T40 text-xs">
          {t('profile.badgesProgressText')}
        </Text>
      </View>

      {/* Filter chips */}
      <View className="flex-row gap-2 px-4 pt-4">
        {FILTER_OPTIONS.map((f) => (
          <TouchableOpacity
            key={f.value}
            onPress={() => setFilter(f.value)}
            className={`rounded-full px-4 py-2 ${
              filter === f.value
                ? 'bg-primary'
                : 'bg-neutral-T100 border-neutral-T80 border'
            }`}
          >
            <Text
              className={`font-label text-xs font-semibold ${
                filter === f.value ? 'text-neutral-T100' : 'text-neutral-T30'
              }`}
            >
              {t(f.labelKey)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Badge grid */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center gap-3">
          <ActivityIndicator size="large" color="#296C24" />
          <Text className="font-body text-neutral-T50 text-sm">
            {t('common.loading')}
          </Text>
        </View>
      ) : filtered.length === 0 ? (
        <View className="flex-1 items-center justify-center gap-3 px-8">
          <MaterialIcons name="military-tech" size={56} color="#C5C7C6" />
          <Text className="font-body text-neutral-T50 text-center text-sm">
            {filter === 'UNLOCKED'
              ? t('profile.badgeEmptyUnlocked')
              : t('profile.badgesEmptyAll')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={padded}
          numColumns={NUM_COLUMNS}
          keyExtractor={(item, index) => item?._id ?? `pad-${index}`}
          contentContainerStyle={{
            paddingHorizontal: 8,
            paddingTop: 8,
            paddingBottom: insets.bottom + 24,
          }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            if (!item) {
              return <View className="flex-1 px-2 py-4" />;
            }
            return (
              <View className="flex-1">
                <BadgeCard
                  badge={item}
                  onPress={() => setSelectedBadge(item)}
                />
              </View>
            );
          }}
        />
      )}

      {/* Badge detail overlay */}
      {selectedBadge && (
        <BadgeDetail
          badge={selectedBadge}
          onClose={() => setSelectedBadge(null)}
        />
      )}
    </View>
  );
}
