import React, { useState } from 'react';
import { Dimensions, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconMarker, PriceMarker } from './MapMarker';
import MapPreviewCard from './MapPreviewCard';
import SearchFilterBar from './SearchFilterBar';
import { ExploreFilter, ExplorePost } from './types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ExploreMapViewProps {
  posts: ExplorePost[];
  activeFilter: ExploreFilter;
  onFilterChange: (filter: ExploreFilter) => void;
  searchText: string;
  onSearchChange: (text: string) => void;
  headerHeight: number;
}

export default function ExploreMapView({
  posts,
  activeFilter,
  onFilterChange,
  searchText,
  onSearchChange,
  headerHeight,
}: ExploreMapViewProps) {
  const insets = useSafeAreaInsets();
  const [selectedPostId, setSelectedPostId] = useState<string>(posts[0]?.id);

  const selectedPost = posts.find((p) => p.id === selectedPostId) ?? posts[0];

  const handleMarkerPress = (postId: string) => {
    setSelectedPostId(postId);
  };

  return (
    <View className="flex-1">
      {/* ── Simulated Map Background ── */}
      <View className="absolute inset-0 bg-[#E8F2E8]">
        {/* Block fills to simulate city parcels */}
        <View
          style={{
            position: 'absolute',
            top: '15%',
            left: '10%',
            width: '35%',
            height: '18%',
            backgroundColor: '#D4E9D0',
            borderRadius: 4,
          }}
        />
        <View
          style={{
            position: 'absolute',
            top: '15%',
            right: '8%',
            width: '28%',
            height: '14%',
            backgroundColor: '#D4E9D0',
            borderRadius: 4,
          }}
        />
        <View
          style={{
            position: 'absolute',
            top: '42%',
            left: '5%',
            width: '22%',
            height: '22%',
            backgroundColor: '#D4E9D0',
            borderRadius: 4,
          }}
        />
        <View
          style={{
            position: 'absolute',
            top: '55%',
            right: '12%',
            width: '30%',
            height: '16%',
            backgroundColor: '#D4E9D0',
            borderRadius: 4,
          }}
        />

        {/* Horizontal roads */}
        <View
          style={{
            position: 'absolute',
            top: '36%',
            left: 0,
            right: 0,
            height: 10,
            backgroundColor: '#fff',
            opacity: 0.7,
          }}
        />
        <View
          style={{
            position: 'absolute',
            top: '60%',
            left: 0,
            right: 0,
            height: 7,
            backgroundColor: '#fff',
            opacity: 0.6,
          }}
        />
        {/* Vertical roads */}
        <View
          style={{
            position: 'absolute',
            left: '32%',
            top: 0,
            bottom: 0,
            width: 8,
            backgroundColor: '#fff',
            opacity: 0.7,
          }}
        />
        <View
          style={{
            position: 'absolute',
            left: '65%',
            top: 0,
            bottom: 0,
            width: 10,
            backgroundColor: '#fff',
            opacity: 0.65,
          }}
        />

        {/* Park area */}
        <View
          style={{
            position: 'absolute',
            top: '70%',
            left: '35%',
            width: '25%',
            height: '15%',
            backgroundColor: '#B8D9B2',
            borderRadius: 6,
          }}
        />
      </View>

      {/* ── Search + Filter overlay ── */}
      <View
        style={{
          position: 'absolute',
          top: headerHeight + insets.top + 12,
          left: 16,
          right: 16,
          zIndex: 20,
        }}
      >
        <SearchFilterBar
          activeFilter={activeFilter}
          onFilterChange={onFilterChange}
          searchText={searchText}
          onSearchChange={onSearchChange}
        />
      </View>

      {/* ── Map Markers ── */}
      {posts.map((post) => {
        if (post.mapX == null || post.mapY == null) return null;
        const left = post.mapX * SCREEN_WIDTH;
        const top = post.mapY * SCREEN_HEIGHT;
        const isActive = post.id === selectedPostId;

        return (
          <View
            key={post.id}
            style={{ position: 'absolute', left, top, zIndex: 15 }}
          >
            {post.type === 'MYSTERY_BAG' ? (
              <PriceMarker
                price={post.price ?? ''}
                isActive={isActive}
                onPress={() => handleMarkerPress(post.id)}
              />
            ) : (
              <IconMarker
                isActive={isActive}
                onPress={() => handleMarkerPress(post.id)}
              />
            )}
          </View>
        );
      })}

      {/* ── My Location dot ── */}
      <View
        style={{
          position: 'absolute',
          left: SCREEN_WIDTH * 0.5 - 8,
          top: SCREEN_HEIGHT * 0.52,
          zIndex: 15,
        }}
      >
        <View className="w-4 h-4 rounded-full bg-primary-T40 items-center justify-center border-2 border-neutral-T100">
          <View className="w-2 h-2 rounded-full bg-neutral-T100" />
        </View>
        {/* Ripple ring */}
        <View
          className="absolute rounded-full border border-primary-T40 opacity-30"
          style={{
            width: 32,
            height: 32,
            top: -8,
            left: -8,
          }}
        />
      </View>

      {/* ── Bottom preview card ── */}
      {selectedPost && (
        <View
          style={{
            position: 'absolute',
            bottom: 80, // above tab bar
            left: 16,
            right: 16,
            zIndex: 30,
          }}
        >
          <MapPreviewCard post={selectedPost} />
        </View>
      )}
    </View>
  );
}
