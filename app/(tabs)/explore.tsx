import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { StatusBar, View } from 'react-native';

import ExploreListView from '../../components/explore/ExploreListView';
import ExploreMapView from '../../components/explore/ExploreMapView';
import MainHeader from '../../components/shared/headers/MainHeader';
import ViewToggle from '../../components/explore/ViewToggle';
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
    <View className="bg-neutral flex-1">
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />

      <MainHeader />

      {/* ── View Toggle — nằm ngay dưới header, căn giữa ── */}
      <View className="bg-neutral-T100 border-neutral-T95 items-center border-b px-4 py-2">
        <ViewToggle activeView={viewMode} onViewChange={setViewMode} />
      </View>

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
          <ExploreMapView activeFilter={activeFilter} />
        )}
      </View>
    </View>
  );
}
