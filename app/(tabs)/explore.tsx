import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Image, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ExploreListView from '../../components/explore/ExploreListView';
import ExploreMapView from '../../components/explore/ExploreMapView';
import ViewToggle from '../../components/explore/ViewToggle';
import { EXPLORE_POSTS } from '../../components/explore/mockData';
import { ExplorePost, SortOption, TypeFilter, ViewMode } from '../../components/explore/types';
import { fetchExplorePosts } from '../../lib/exploreApi';

const HEADER_HEIGHT = 56;

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
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

      {/* ── Fixed Header ── */}
      <View
        className="absolute top-0 left-0 right-0 z-50 bg-neutral-T100"
        style={{
          paddingTop: insets.top > 0 ? insets.top + 8 : 44,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.06,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        <View
          className="flex-row items-center justify-between px-5 pb-3"
          style={{ height: HEADER_HEIGHT }}
        >
          {/* Left: search icon */}
          <TouchableOpacity className="w-9 h-9 rounded-full bg-neutral-T95 items-center justify-center">
            <Feather name="search" size={20} color="#191C1C" />
          </TouchableOpacity>

          {/* Center: logo */}
          <View className="flex-row items-center gap-2">
            <Image
              source={require('../../assets/images/logo.png')}
              style={{ width: 32, height: 32 }}
              resizeMode="contain"
            />
            <Text
              className="text-lg font-sans text-primary-T40 tracking-tight"
              style={{ fontWeight: '700' }}
            >
              Explore
            </Text>
          </View>

          {/* Right: avatar */}
          <Image
            source={{ uri: 'https://i.pravatar.cc/60?img=33' }}
            className="w-9 h-9 rounded-full border border-neutral-T90"
          />
        </View>
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
            headerHeight={HEADER_HEIGHT}
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
            headerHeight={HEADER_HEIGHT}
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
