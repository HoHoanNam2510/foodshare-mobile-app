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
      className="flex-1 items-center py-4 px-2 gap-2"
    >
      {/* Image container */}
      <View
        className={`w-20 h-20 rounded-2xl items-center justify-center overflow-hidden ${
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
          <View className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-primary items-center justify-center">
            <MaterialIcons name="check" size={10} color="#fff" />
          </View>
        )}
      </View>

      {/* Name */}
      <Text
        className={`font-label text-[11px] text-center leading-tight ${
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
        <View className="flex-row items-center gap-0.5 bg-primary-T95 px-2 py-0.5 rounded-full">
          <MaterialIcons name="eco" size={10} color="#296C24" />
          <Text className="font-label text-[9px] font-bold text-primary-T30">
            +{badge.pointReward}
          </Text>
        </View>
      ) : (
        <View className="flex-row items-center gap-0.5 bg-neutral-T90 px-2 py-0.5 rounded-full">
          <MaterialIcons name="lock" size={10} color="#757777" />
          <Text className="font-label text-[9px] text-neutral-T50">
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
      <View className="bg-neutral-T100 rounded-t-3xl w-full px-6 pt-6 pb-10 gap-5">
        {/* Drag handle */}
        <View className="w-12 h-1 rounded-full bg-neutral-T80 self-center -mt-1 mb-1" />

        {/* Badge image */}
        <View className="items-center gap-3">
          <View
            className={`w-24 h-24 rounded-3xl items-center justify-center ${
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
            <Text className="font-sans font-bold text-xl text-neutral-T10 text-center">
              {badge.name}
            </Text>
            <View
              className={`flex-row items-center gap-1 px-3 py-1 rounded-full ${
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
        <View className="bg-neutral-T97 rounded-2xl p-4 gap-3">
          <Text className="font-body text-sm text-neutral-T30 leading-5">
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
          className="h-12 bg-primary rounded-2xl items-center justify-center active:opacity-80"
        >
          <Text className="font-label font-bold text-sm text-neutral-T100">
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
      <Text className="font-label text-xs text-neutral-T50 w-24">{label}</Text>
      <Text
        className="font-label text-xs font-semibold flex-1"
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
  }, []);

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
    <View className="flex-1 bg-neutral">
      <ManagementHeader
        title={t('profile.badgesCollection')}
        onBack={() => router.back()}
      />

      {/* Progress summary */}
      <View className="mx-4 mt-4 bg-primary-T95 rounded-2xl p-5 gap-3">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <MaterialIcons name="military-tech" size={22} color="#296C24" />
            <Text className="font-sans font-bold text-lg text-primary-T20">
              {t('profile.badgesCount', { unlocked, total })}
            </Text>
          </View>
          <Text className="font-label text-sm font-bold text-primary-T40">
            {total > 0 ? Math.round((unlocked / total) * 100) : 0}%
          </Text>
        </View>
        <View className="h-2 bg-primary-T90 rounded-full overflow-hidden">
          <View
            className="h-full bg-primary rounded-full"
            style={{ width: total > 0 ? `${(unlocked / total) * 100}%` : '0%' }}
          />
        </View>
        <Text className="font-body text-xs text-primary-T40">
          {t('profile.badgesProgressText')}
        </Text>
      </View>

      {/* Filter chips */}
      <View className="flex-row gap-2 px-4 pt-4">
        {FILTER_OPTIONS.map((f) => (
          <TouchableOpacity
            key={f.value}
            onPress={() => setFilter(f.value)}
            className={`px-4 py-2 rounded-full ${
              filter === f.value
                ? 'bg-primary'
                : 'bg-neutral-T100 border border-neutral-T80'
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
          <Text className="font-body text-sm text-neutral-T50">
            {t('common.loading')}
          </Text>
        </View>
      ) : filtered.length === 0 ? (
        <View className="flex-1 items-center justify-center gap-3 px-8">
          <MaterialIcons name="military-tech" size={56} color="#C5C7C6" />
          <Text className="font-body text-sm text-neutral-T50 text-center">
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
              return <View className="flex-1 py-4 px-2" />;
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
