import React from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import PostCard from './PostCard';
import SearchFilterBar from './SearchFilterBar';
import { ExplorePost, SortOption, TypeFilter } from './types';

interface ExploreListViewProps {
  posts: ExplorePost[];
  loading: boolean;
  activeFilter: TypeFilter;
  onFilterChange: (filter: TypeFilter) => void;
  sortOption: SortOption;
  onSortChange: (sort: SortOption) => void;
  searchText: string;
  onSearchChange: (text: string) => void;
  onPostPress?: (post: ExplorePost) => void;
}

export default function ExploreListView({
  posts,
  loading,
  activeFilter,
  onFilterChange,
  sortOption,
  onSortChange,
  searchText,
  onSearchChange,
  onPostPress,
}: ExploreListViewProps) {
  const { t } = useTranslation();
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingTop: 16,
        paddingHorizontal: 16,
        paddingBottom: 120,
        gap: 16,
      }}
    >
      {/* Search + filter */}
      <SearchFilterBar
        activeFilter={activeFilter}
        onFilterChange={onFilterChange}
        sortOption={sortOption}
        onSortChange={onSortChange}
        searchText={searchText}
        onSearchChange={onSearchChange}
      />

      {/* Loading state */}
      {loading && (
        <View className="items-center py-8">
          <ActivityIndicator size="large" color="#4A7C59" />
        </View>
      )}

      {/* Empty state */}
      {!loading && posts.length === 0 && (
        <View className="items-center py-12 gap-2">
          <Text className="text-neutral-T50 font-sans text-base">
            {t('explore.noPostsTitle')}
          </Text>
          <Text className="text-neutral-T70 font-label text-sm text-center">
            {t('explore.noPostsHint')}
          </Text>
        </View>
      )}

      {/* Post cards */}
      {!loading && posts.length > 0 && (
        <View className="gap-4">
          {posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onPress={() => onPostPress?.(post)}
            />
          ))}
        </View>
      )}
    </ScrollView>
  );
}
