import React from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import PostCard from './PostCard';
import SearchFilterBar from './SearchFilterBar';
import { ExploreFilter, ExplorePost } from './types';

interface ExploreListViewProps {
  posts: ExplorePost[];
  activeFilter: ExploreFilter;
  onFilterChange: (filter: ExploreFilter) => void;
  searchText: string;
  onSearchChange: (text: string) => void;
  headerHeight: number;
  onPostPress?: (post: ExplorePost) => void;
}

export default function ExploreListView({
  posts,
  activeFilter,
  onFilterChange,
  searchText,
  onSearchChange,
  headerHeight,
  onPostPress,
}: ExploreListViewProps) {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingTop: headerHeight + insets.top + 16,
        paddingHorizontal: 16,
        paddingBottom: 120, // space for toggle + tab bar
        gap: 16,
      }}
    >
      {/* Search + filter */}
      <SearchFilterBar
        activeFilter={activeFilter}
        onFilterChange={onFilterChange}
        searchText={searchText}
        onSearchChange={onSearchChange}
      />

      {/* Post cards */}
      <View className="gap-4">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onPress={() => onPostPress?.(post)}
          />
        ))}
      </View>
    </ScrollView>
  );
}
