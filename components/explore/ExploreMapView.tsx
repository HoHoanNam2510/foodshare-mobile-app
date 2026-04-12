import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import GoongMapView from '@/components/map/GoongMapView';
import PostMarker from '@/components/map/PostMarker';
import PostPreviewCard from '@/components/map/PostPreviewCard';
import RadiusFilter, { RadiusOption } from '@/components/map/RadiusFilter';
import { MapPost } from '@/components/map/types';
import { fetchMapPosts } from '@/lib/mapApi';
import { TypeFilter } from './types';

// HCM center fallback [lng, lat]
const HCM_CENTER: [number, number] = [106.6297, 10.8231];

interface ExploreMapViewProps {
  activeFilter: TypeFilter;
}

function toApiType(
  filter: TypeFilter
): 'P2P_FREE' | 'B2C_MYSTERY_BAG' | undefined {
  if (filter === 'Free Food') return 'P2P_FREE';
  if (filter === 'Surprise Bags') return 'B2C_MYSTERY_BAG';
  return undefined;
}

export default function ExploreMapView({ activeFilter }: ExploreMapViewProps) {
  const router = useRouter();
  const userCoordsRef = useRef<[number, number]>(HCM_CENTER);

  const [radius, setRadius] = useState<RadiusOption>(3000);
  const [posts, setPosts] = useState<MapPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const loadPosts = async (coords: [number, number], r: RadiusOption) => {
    setLoading(true);
    try {
      const results = await fetchMapPosts({
        lng: coords[0],
        lat: coords[1],
        distance: r,
        type: toApiType(activeFilter),
      });
      setPosts(results);
      setSelectedId(results[0]?._id ?? null);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUserLocation = (coords: [number, number]) => {
    userCoordsRef.current = coords;
    setReady(true);
    loadPosts(coords, radius);
  };

  // Re-fetch when filter or radius changes (after GPS ready)
  useEffect(() => {
    if (!ready) return;
    loadPosts(userCoordsRef.current, radius);
  }, [activeFilter, radius]);

  const handleRadiusChange = (r: RadiusOption) => {
    setRadius(r);
  };

  const selectedPost = posts.find((p) => p._id === selectedId) ?? null;

  return (
    <View className="flex-1">
      <GoongMapView onUserLocation={handleUserLocation}>
        {posts.map((post) => (
          <PostMarker
            key={post._id}
            post={post}
            isActive={post._id === selectedId}
            onPress={setSelectedId}
          />
        ))}
      </GoongMapView>

      {/* Radius filter — top overlay */}
      <View
        style={{
          position: 'absolute',
          top: 16,
          left: 16,
          right: 16,
          zIndex: 20,
        }}
        pointerEvents="box-none"
      >
        <RadiusFilter value={radius} onChange={handleRadiusChange} />
      </View>

      {/* Loading indicator */}
      {loading && (
        <View
          style={{
            position: 'absolute',
            top: 68,
            alignSelf: 'center',
            zIndex: 25,
          }}
        >
          <View className="bg-neutral-T100 rounded-full px-4 py-2 flex-row items-center gap-2 shadow-sm">
            <ActivityIndicator size="small" color="#296C24" />
            <Text className="font-label text-xs text-neutral-T50">
              Đang tải...
            </Text>
          </View>
        </View>
      )}

      {/* Bottom post preview card */}
      {selectedPost && (
        <View
          style={{
            position: 'absolute',
            bottom: 80,
            left: 16,
            right: 16,
            zIndex: 30,
          }}
        >
          <PostPreviewCard
            post={selectedPost}
            onViewDetails={() =>
              router.push({
                pathname: '/(post)/post-detail' as any,
                params: { id: selectedPost._id },
              })
            }
          />
        </View>
      )}
    </View>
  );
}
