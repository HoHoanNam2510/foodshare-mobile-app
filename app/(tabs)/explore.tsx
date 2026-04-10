import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { StatusBar, View } from 'react-native';

import ExploreListView from '../../components/explore/ExploreListView';
import ExploreMapView from '../../components/explore/ExploreMapView';
import MainHeader from '../../components/shared/headers/MainHeader';
import ViewToggle from '../../components/explore/ViewToggle';
import { EXPLORE_POSTS } from '../../components/explore/mockData';
import {
  ExplorePost,
  SortOption,
  TypeFilter,
  ViewMode,
} from '../../components/explore/types';
import { fetchExplorePosts } from '../../lib/exploreApi';

export default function ExploreScreen() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [activeFilter, setActiveFilter] = useState<TypeFilter>('All');
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [searchText, setSearchText] = useState('');

  const [posts, setPosts] = useState<ExplorePost[]>([]);
  const [loading, setLoading] = useState(false);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchExplorePosts(activeFilter, sortOption);
      setPosts(data);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [activeFilter, sortOption]);

  // Fetch on mount and whenever filter/sort changes (list view only)
  useEffect(() => {
    if (viewMode === 'list') {
      loadPosts();
    }
  }, [loadPosts, viewMode]);

  const filteredPosts = posts.filter((post) => {
    if (searchText.trim() === '') return true;
    return post.title.toLowerCase().includes(searchText.toLowerCase());
  });

  return (
    <View className="flex-1 bg-neutral">
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />

      <MainHeader />

      {/* ── Content ── */}
      <View className="flex-1">
        {viewMode === 'list' ? (
          <ExploreListView
            posts={filteredPosts}
            loading={loading}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            sortOption={sortOption}
            onSortChange={setSortOption}
            searchText={searchText}
            onSearchChange={setSearchText}
            onPostPress={(post) =>
              router.push({
                pathname: '/(post)/post-detail' as any,
                params: { id: post._id },
              })
            }
          />
        ) : (
          // Map view stays static — uses mock data
          <ExploreMapView
            posts={EXPLORE_POSTS}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            sortOption={sortOption}
            onSortChange={setSortOption}
            searchText={searchText}
            onSearchChange={setSearchText}
          />
        )}
      </View>

      {/* ── Floating View Toggle ── */}
      <View
        className="absolute items-center"
        style={{
          bottom: 72,
          left: 0,
          right: 0,
          zIndex: 40,
        }}
        pointerEvents="box-none"
      >
        <ViewToggle activeView={viewMode} onViewChange={setViewMode} />
      </View>
    </View>
  );
}
