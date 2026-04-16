import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
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

const SORT_OPTION_CONFIGS: { value: SortOption; labelKey: string; icon: string }[] = [
  { value: 'newest', labelKey: 'explore.sortNewest', icon: 'clock' },
  { value: 'closest', labelKey: 'explore.sortClosest', icon: 'navigation' },
  { value: 'expiring', labelKey: 'explore.sortExpiring', icon: 'alert-triangle' },
];

interface SearchFilterBarProps {
  activeFilter: TypeFilter;
  onFilterChange: (filter: TypeFilter) => void;
  searchText: string;
  onSearchChange: (text: string) => void;
  sortOption: SortOption;
  onSortChange: (sort: SortOption) => void;
}

export default function SearchFilterBar({
  activeFilter,
  onFilterChange,
  searchText,
  onSearchChange,
  sortOption,
  onSortChange,
}: SearchFilterBarProps) {
  const { t } = useTranslation();
  const [sortOpen, setSortOpen] = useState(false);

  const FILTER_DISPLAY: Record<TypeFilter, string> = {
    All: t('explore.filterAll'),
    'Free Food': t('explore.filterFreeFood'),
    'Surprise Bags': t('explore.filterSurpriseBags'),
  };

  const activeSortLabelKey =
    SORT_OPTION_CONFIGS.find((o) => o.value === sortOption)?.labelKey ?? 'explore.sortNewest';

  return (
    <View className="gap-3">
      {/* ── Search input ── */}
      <View
        className="bg-neutral-T100 flex-row items-center px-3 py-5 rounded-xl gap-2"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.06,
          shadowRadius: 4,
          elevation: 2,
        }}
      >
        <Feather name="search" size={20} color="#757777" />
        <TextInput
          className="flex-1 font-label text-neutral-T10"
          placeholder={t('explore.searchPlaceholder')}
          placeholderTextColor="#AAABAB"
          value={searchText}
          onChangeText={onSearchChange}
        />
        <Feather name="sliders" size={16} color="#757777" />
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
              className={`px-4 py-2 rounded-full ${
                isActive
                  ? 'bg-primary-T40'
                  : 'bg-neutral-T100 border border-neutral-T90'
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
                  isActive ? 'text-neutral-T100' : 'text-neutral-T30'
                }`}
                style={{ fontWeight: isActive ? '600' : '400' }}
              >
                {FILTER_DISPLAY[filter]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* ── Sort row ── */}
      <View className="flex-row items-center gap-2">
        <Text className="text-neutral-T50 text-sm font-label">{t('explore.sort')}:</Text>

        <TouchableOpacity
          onPress={() => setSortOpen((prev) => !prev)}
          activeOpacity={0.8}
          className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary-T90 border border-secondary-T70"
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
          className="bg-neutral-T100 rounded-2xl overflow-hidden border border-neutral-T90"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 6,
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
                  index < SORT_OPTION_CONFIGS.length - 1 ? 'border-b border-neutral-T95' : ''
                } ${isSelected ? 'bg-secondary-T95' : ''}`}
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
                      color: isSelected ? '#983F6A' : '#191C1C',
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
