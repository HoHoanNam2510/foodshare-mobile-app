import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { TYPE_FILTER_OPTIONS } from './mockData';
import { SortOption, TypeFilter } from './types';
import { useTranslation } from 'react-i18next';
import { useThemeColors } from '@/lib/hooks/useThemeColors';
import { useColorScheme } from 'nativewind';
import { CATEGORIES } from '@/components/post/CategoryPicker';

const RECENT_SEARCHES_KEY = 'recent_searches_explore';
const MAX_RECENT = 5;

async function loadRecentSearches(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

async function saveRecentSearch(term: string): Promise<void> {
  try {
    const existing = await loadRecentSearches();
    const deduped = [term, ...existing.filter((s) => s !== term)].slice(
      0,
      MAX_RECENT
    );
    await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(deduped));
  } catch {
    // ignore
  }
}

const SORT_OPTION_CONFIGS: {
  value: SortOption;
  labelKey: string;
  icon: string;
}[] = [
  { value: 'newest', labelKey: 'explore.sortNewest', icon: 'clock' },
  { value: 'closest', labelKey: 'explore.sortClosest', icon: 'navigation' },
  {
    value: 'expiring',
    labelKey: 'explore.sortExpiring',
    icon: 'alert-triangle',
  },
];

interface SearchFilterBarProps {
  activeFilter: TypeFilter;
  onFilterChange: (filter: TypeFilter) => void;
  searchText: string;
  onSearchChange: (text: string) => void;
  sortOption: SortOption;
  onSortChange: (sort: SortOption) => void;
  activeCategory?: string;
  onCategoryChange?: (cat: string | undefined) => void;
}

export default function SearchFilterBar({
  activeFilter,
  onFilterChange,
  searchText,
  onSearchChange,
  sortOption,
  onSortChange,
  activeCategory,
  onCategoryChange,
}: SearchFilterBarProps) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [sortOpen, setSortOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const lastSavedRef = useRef<string>('');

  useEffect(() => {
    loadRecentSearches().then(setRecentSearches);
  }, []);

  const handleBlur = () => {
    setIsFocused(false);
    if (searchText.trim() && searchText.trim() !== lastSavedRef.current) {
      lastSavedRef.current = searchText.trim();
      saveRecentSearch(searchText.trim()).then(() =>
        loadRecentSearches().then(setRecentSearches)
      );
    }
  };

  const showRecentDropdown =
    isFocused && searchText === '' && recentSearches.length > 0;

  const FILTER_DISPLAY: Record<TypeFilter, string> = {
    All: t('explore.filterAll'),
    'Free Food': t('explore.filterFreeFood'),
    'Surprise Bags': t('explore.filterSurpriseBags'),
  };

  const activeSortLabelKey =
    SORT_OPTION_CONFIGS.find((o) => o.value === sortOption)?.labelKey ??
    'explore.sortNewest';

  return (
    <View className="gap-3">
      {/* ── Search input ── */}
      <View>
        <View
          className="bg-neutral-T100 dark:bg-neutral-T20 dark:border-neutral-T30 flex-row items-center gap-2 rounded-xl px-3 py-5 dark:border"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: isDark ? 0 : 0.06,
            shadowRadius: 4,
            elevation: isDark ? 0 : 2,
          }}
        >
          <Feather name="search" size={20} color="#757777" />
          <TextInput
            className="font-label text-neutral-T10 dark:text-neutral-T90 flex-1"
            placeholder={t('explore.searchPlaceholder')}
            placeholderTextColor={colors.placeholder}
            value={searchText}
            onChangeText={onSearchChange}
            onFocus={() => setIsFocused(true)}
            onBlur={handleBlur}
          />
          {searchText !== '' && (
            <TouchableOpacity
              onPress={() => onSearchChange('')}
              activeOpacity={0.7}
            >
              <Feather name="x" size={16} color="#757777" />
            </TouchableOpacity>
          )}
          <Feather name="sliders" size={16} color="#757777" />
        </View>

        {/* ── Recent search dropdown ── */}
        {showRecentDropdown && (
          <View
            className="bg-neutral-T100 dark:bg-neutral-T20 border-neutral-T90 dark:border-neutral-T30 mt-1 overflow-hidden rounded-xl border"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: isDark ? 0 : 0.08,
              shadowRadius: 8,
              elevation: isDark ? 0 : 4,
            }}
          >
            <View className="border-neutral-T95 dark:border-neutral-T30 flex-row items-center justify-between border-b px-4 py-2">
              <Text className="font-label text-neutral-T50 dark:text-neutral-T60 text-xs font-semibold uppercase tracking-wider">
                {t('explore.recentSearches')}
              </Text>
              <TouchableOpacity
                onPress={async () => {
                  await AsyncStorage.removeItem(RECENT_SEARCHES_KEY);
                  setRecentSearches([]);
                }}
                activeOpacity={0.7}
              >
                <Text className="font-label text-primary-T40 text-xs">
                  {t('explore.clearHistory')}
                </Text>
              </TouchableOpacity>
            </View>
            {recentSearches.map((item, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  onSearchChange(item);
                  setIsFocused(false);
                }}
                activeOpacity={0.7}
                className={`flex-row items-center gap-3 px-4 py-3 ${
                  index < recentSearches.length - 1
                    ? 'border-neutral-T95 dark:border-neutral-T30 border-b'
                    : ''
                }`}
              >
                <Feather name="clock" size={14} color="#757777" />
                <Text className="font-label text-neutral-T30 dark:text-neutral-T80 flex-1 text-sm">
                  {item}
                </Text>
                <TouchableOpacity
                  onPress={async (e) => {
                    e.stopPropagation();
                    const updated = recentSearches.filter(
                      (_, i) => i !== index
                    );
                    setRecentSearches(updated);
                    await AsyncStorage.setItem(
                      RECENT_SEARCHES_KEY,
                      JSON.stringify(updated)
                    );
                  }}
                  activeOpacity={0.7}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Feather name="x" size={13} color="#AAABAB" />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* ── Type filter pills ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingRight: 4 }}
      >
        {TYPE_FILTER_OPTIONS.map((filter) => {
          const isActive = activeFilter === filter;
          return (
            <TouchableOpacity
              key={filter}
              onPress={() => onFilterChange(filter)}
              activeOpacity={0.8}
              className={`rounded-full px-4 py-2 ${
                isActive
                  ? 'bg-primary-T40'
                  : 'bg-neutral-T100 dark:bg-neutral-T20 border-neutral-T90 dark:border-neutral-T30 border'
              }`}
              style={
                isActive
                  ? {
                      shadowColor: '#72B866',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.25,
                      shadowRadius: 6,
                      elevation: 3,
                    }
                  : undefined
              }
            >
              <Text
                className={`font-label ${
                  isActive
                    ? 'text-neutral-T100'
                    : 'text-neutral-T30 dark:text-neutral-T80'
                }`}
                style={{ fontWeight: isActive ? '600' : '400' }}
              >
                {FILTER_DISPLAY[filter]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* ── Category chips — sử dụng cùng danh sách với CategoryPicker ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingRight: 4 }}
      >
        <TouchableOpacity
          onPress={() => onCategoryChange?.(undefined)}
          activeOpacity={0.8}
          className={`rounded-full px-3 py-1.5 ${
            !activeCategory
              ? 'bg-primary-T40'
              : 'bg-neutral-T100 dark:bg-neutral-T20 border-neutral-T90 dark:border-neutral-T30 border'
          }`}
        >
          <Text
            className={`font-label text-xs ${
              !activeCategory
                ? 'text-neutral-T100'
                : 'text-neutral-T50 dark:text-neutral-T60'
            }`}
            style={{ fontWeight: !activeCategory ? '600' : '400' }}
          >
            {t('explore.filterAll')}
          </Text>
        </TouchableOpacity>
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <TouchableOpacity
              key={cat}
              onPress={() => onCategoryChange?.(isActive ? undefined : cat)}
              activeOpacity={0.8}
              className={`rounded-full px-3 py-1.5 ${
                isActive
                  ? 'bg-primary-T40'
                  : 'bg-neutral-T100 dark:bg-neutral-T20 border-neutral-T90 dark:border-neutral-T30 border'
              }`}
            >
              <Text
                className={`font-label text-xs ${
                  isActive
                    ? 'text-neutral-T100'
                    : 'text-neutral-T50 dark:text-neutral-T60'
                }`}
                style={{ fontWeight: isActive ? '600' : '400' }}
              >
                {t(`post.categories.${cat}`, { defaultValue: cat })}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* ── Sort row ── */}
      <View className="flex-row items-center gap-2">
        <Text className="text-neutral-T50 dark:text-neutral-T60 font-label text-sm">
          {t('explore.sort')}:
        </Text>

        <TouchableOpacity
          onPress={() => setSortOpen((prev) => !prev)}
          activeOpacity={0.8}
          className="bg-secondary-T90 border-secondary-T70 flex-row items-center gap-1.5 rounded-full border px-3 py-1.5"
        >
          <Text
            className="text-secondary font-label text-sm"
            style={{ fontWeight: '600' }}
          >
            {t(activeSortLabelKey)}
          </Text>
          <Feather
            name={sortOpen ? 'chevron-up' : 'chevron-down'}
            size={13}
            color="#983F6A"
          />
        </TouchableOpacity>
      </View>

      {/* ── Sort dropdown panel ── */}
      {sortOpen && (
        <View
          className="bg-neutral-T100 dark:bg-neutral-T20 border-neutral-T90 dark:border-neutral-T30 overflow-hidden rounded-2xl border"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: isDark ? 0 : 0.1,
            shadowRadius: 12,
            elevation: isDark ? 0 : 6,
          }}
        >
          {SORT_OPTION_CONFIGS.map((option, index) => {
            const isSelected = sortOption === option.value;
            return (
              <TouchableOpacity
                key={option.value}
                onPress={() => {
                  onSortChange(option.value);
                  setSortOpen(false);
                }}
                activeOpacity={0.7}
                className={`flex-row items-center justify-between px-4 py-3 ${
                  index < SORT_OPTION_CONFIGS.length - 1
                    ? 'border-neutral-T95 dark:border-neutral-T30 border-b'
                    : ''
                } ${isSelected ? 'bg-secondary-T95 dark:bg-secondary-T20' : ''}`}
              >
                <View className="flex-row items-center gap-2">
                  <Feather
                    name={option.icon as any}
                    size={15}
                    color={isSelected ? '#983F6A' : '#757777'}
                  />
                  <Text
                    className="font-label text-sm"
                    style={{
                      color: isSelected
                        ? '#983F6A'
                        : isDark
                          ? '#C5C7C6'
                          : '#191C1C',
                      fontWeight: isSelected ? '600' : '400',
                    }}
                  >
                    {t(option.labelKey)}
                  </Text>
                </View>
                {isSelected && (
                  <Feather name="check" size={15} color="#983F6A" />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
}
