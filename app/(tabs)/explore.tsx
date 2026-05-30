import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, StatusBar, View } from 'react-native';

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

const EXPLORE_LIMIT = 15;

export default function ExploreScreen() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [activeFilter, setActiveFilter] = useState<TypeFilter>('All');
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | undefined>(
    undefined
  );

  const [posts, setPosts] = useState<ExplorePost[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const [gpsCoords, setGpsCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const gpsLoadingRef = useRef(false);

  // Debounce search input 300ms
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchText), 300);
    return () => clearTimeout(timer);
  }, [searchText]);

  // Fetch GPS when sort = closest
  useEffect(() => {
    if (sortOption !== 'closest') {
      setGpsCoords(null);
      return;
    }
    if (gpsLoadingRef.current) return;
    gpsLoadingRef.current = true;

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Cần quyền vị trí',
            'Cho phép ứng dụng truy cập vị trí để sắp xếp bài đăng theo khoảng cách.'
          );
          setSortOption('newest');
          return;
        }
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setGpsCoords({ lat: loc.coords.latitude, lng: loc.coords.longitude });
      } catch {
        setSortOption('newest');
      } finally {
        gpsLoadingRef.current = false;
      }
    })();
  }, [sortOption]);

  // Main load effect — triggers when any filter/sort/search/category/GPS changes
  useEffect(() => {
    if (viewMode !== 'list') return;
    if (sortOption === 'closest' && !gpsCoords) return;

    let cancelled = false;
    setLoading(true);

    fetchExplorePosts({
      filter: activeFilter,
      sort: sortOption,
      search: debouncedSearch,
      categoryId: activeCategory,
      page: 1,
      limit: EXPLORE_LIMIT,
      ...(sortOption === 'closest' && gpsCoords ? gpsCoords : {}),
    })
      .then((result) => {
        if (cancelled) return;
        setPosts(result.posts);
        setPage(1);
        setHasMore(result.pagination.totalPages > 1);
      })
      .catch(() => {
        if (cancelled) return;
        setPosts([]);
        setHasMore(false);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [
    activeFilter,
    sortOption,
    debouncedSearch,
    activeCategory,
    gpsCoords,
    viewMode,
  ]);

  const loadMore = useCallback(() => {
    if (!hasMore || loadingMore || loading) return;
    const nextPage = page + 1;
    setLoadingMore(true);

    fetchExplorePosts({
      filter: activeFilter,
      sort: sortOption,
      search: debouncedSearch,
      categoryId: activeCategory,
      page: nextPage,
      limit: EXPLORE_LIMIT,
      ...(sortOption === 'closest' && gpsCoords ? gpsCoords : {}),
    })
      .then((result) => {
        setPosts((prev) => [...prev, ...result.posts]);
        setPage(nextPage);
        setHasMore(nextPage < result.pagination.totalPages);
      })
      .catch(() => {})
      .finally(() => setLoadingMore(false));
  }, [
    hasMore,
    loadingMore,
    loading,
    page,
    activeFilter,
    sortOption,
    debouncedSearch,
    activeCategory,
    gpsCoords,
  ]);

  const handleFilterChange = (filter: TypeFilter) => {
    setActiveFilter(filter);
    setActiveCategory(undefined);
  };

  return (
    <View className="bg-neutral dark:bg-neutral-T10 flex-1">
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      <MainHeader />

      {/* ── View Toggle ── */}
      <View className="bg-neutral-T100 dark:bg-neutral-T20 border-neutral-T95 dark:border-neutral-T30 items-center border-b px-4 py-2">
        <ViewToggle activeView={viewMode} onViewChange={setViewMode} />
      </View>

      {/* ── Content ── */}
      <View className="flex-1">
        {viewMode === 'list' ? (
          <ExploreListView
            posts={posts}
            loading={loading}
            loadingMore={loadingMore}
            hasMore={hasMore}
            onLoadMore={loadMore}
            activeFilter={activeFilter}
            onFilterChange={handleFilterChange}
            sortOption={sortOption}
            onSortChange={setSortOption}
            searchText={searchText}
            onSearchChange={setSearchText}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
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
