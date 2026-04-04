import { Feather } from '@expo/vector-icons';
import React from 'react';
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { FILTER_OPTIONS } from './mockData';
import { ExploreFilter } from './types';

interface SearchFilterBarProps {
  activeFilter: ExploreFilter;
  onFilterChange: (filter: ExploreFilter) => void;
  searchText: string;
  onSearchChange: (text: string) => void;
}

export default function SearchFilterBar({
  activeFilter,
  onFilterChange,
  searchText,
  onSearchChange,
}: SearchFilterBarProps) {
  return (
    <View className="gap-3">
      {/* Search input */}
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
          placeholder="Search for surplus food nearby..."
          placeholderTextColor="#AAABAB"
          value={searchText}
          onChangeText={onSearchChange}
        />
        <Feather name="sliders" size={16} color="#757777" />
      </View>

      {/* Filter pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingRight: 4 }}
      >
        {FILTER_OPTIONS.map((filter) => {
          const isActive = activeFilter === filter;
          return (
            <TouchableOpacity
              key={filter}
              onPress={() => onFilterChange(filter as ExploreFilter)}
              activeOpacity={0.8}
              className={`flex-row items-center gap-1 px-4 py-2 rounded-full ${
                isActive
                  ? 'bg-primary-T70'
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
                {filter}
              </Text>
              {filter === 'Closest' && !isActive && (
                <Feather name="chevron-down" size={12} color="#5C5F5E" />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
