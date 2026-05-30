import React from 'react';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import PostCard from './PostCard';
import SearchFilterBar from './SearchFilterBar';
import { ExplorePost, SortOption, TypeFilter } from './types';

interface ExploreListViewProps {
  posts: ExplorePost[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  activeFilter: TypeFilter;
  onFilterChange: (filter: TypeFilter) => void;
  sortOption: SortOption;
  onSortChange: (sort: SortOption) => void;
  searchText: string;
  onSearchChange: (text: string) => void;
  activeCategory: string | undefined;
  onCategoryChange: (cat: string | undefined) => void;
  onPostPress?: (post: ExplorePost) => void;
}

export default function ExploreListView({
  posts,
  loading,
  loadingMore,
  hasMore,
  onLoadMore,
  activeFilter,
  onFilterChange,
  sortOption,
  onSortChange,
  searchText,
  onSearchChange,
  activeCategory,
  onCategoryChange,
  onPostPress,
}: ExploreListViewProps) {
  const { t } = useTranslation();

  return (
    <View className="flex-1">
      {/* SearchFilterBar sits outside FlatList to prevent keyboard scroll issues */}
      <View className="px-4 pb-2 pt-4">
        <SearchFilterBar
          activeFilter={activeFilter}
          onFilterChange={onFilterChange}
          sortOption={sortOption}
          onSortChange={onSortChange}
          searchText={searchText}
          onSearchChange={onSearchChange}
          activeCategory={activeCategory}
          onCategoryChange={onCategoryChange}
        />
      </View>

      {/* Full-screen spinner on initial load */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#4A7C59" />
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: 120,
            paddingTop: 4,
          }}
          ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
          renderItem={({ item }) => (
            <PostCard post={item} onPress={() => onPostPress?.(item)} />
          )}
          ListEmptyComponent={
            <View className="items-center gap-2 py-12">
              <Text className="text-neutral-T50 font-sans text-base">
                {t('explore.noPostsTitle')}
              </Text>
              <Text className="text-neutral-T70 font-label text-center text-sm">
                {t('explore.noPostsHint')}
              </Text>
            </View>
          }
          ListFooterComponent={
            loadingMore ? (
              <View className="items-center py-4">
                <ActivityIndicator size="small" color="#4A7C59" />
              </View>
            ) : null
          }
          onEndReached={hasMore ? onLoadMore : undefined}
          onEndReachedThreshold={0.3}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
