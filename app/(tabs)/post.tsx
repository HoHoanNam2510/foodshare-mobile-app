import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import api from '@/lib/axios';
import MainHeader from '@/components/shared/headers/MainHeader';

// ─── TYPES ───────────────────────────────────────────────────────────────────

type PostStatus =
  | 'DRAFT'
  | 'PENDING_REVIEW'
  | 'AVAILABLE'
  | 'BOOKED'
  | 'OUT_OF_STOCK'
  | 'HIDDEN'
  | 'REJECTED';

type PostType = 'P2P_FREE' | 'B2C_MYSTERY_BAG';

interface Post {
  _id: string;
  title: string;
  images: string[];
  type: PostType;
  status: PostStatus;
  price: number;
  expiryDate: string | null;
  createdAt: string;
}

interface StatusConfig {
  label: string;
  bgClass: string;
  textClass: string;
  dotColor: string;
}

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const STATUS_FILTERS: { id: PostStatus | 'ALL'; label: string }[] = [
  { id: 'ALL', label: 'Tất cả' },
  { id: 'DRAFT', label: 'Draft' },
  { id: 'PENDING_REVIEW', label: 'Chờ duyệt' },
  { id: 'AVAILABLE', label: 'Đang mở' },
  { id: 'BOOKED', label: 'Đã đặt' },
  { id: 'OUT_OF_STOCK', label: 'Hết hàng' },
  { id: 'HIDDEN', label: 'Ẩn' },
  { id: 'REJECTED', label: 'Từ chối' },
];

const STATUS_CONFIG: Record<PostStatus, StatusConfig> = {
  DRAFT: {
    label: 'Draft',
    bgClass: 'bg-neutral-T95',
    textClass: 'text-neutral-T40',
    dotColor: '#5C5F5E',
  },
  PENDING_REVIEW: {
    label: 'Chờ duyệt',
    bgClass: 'bg-secondary-T95',
    textClass: 'text-secondary-T40',
    dotColor: '#944A00',
  },
  AVAILABLE: {
    label: 'Đang mở',
    bgClass: 'bg-primary-T95',
    textClass: 'text-primary-T40',
    dotColor: '#296C24',
  },
  BOOKED: {
    label: 'Đã đặt',
    bgClass: 'bg-primary-T95',
    textClass: 'text-primary-T30',
    dotColor: '#0A530C',
  },
  OUT_OF_STOCK: {
    label: 'Hết hàng',
    bgClass: 'bg-tertiary-T95',
    textClass: 'text-tertiary-T40',
    dotColor: '#983F6A',
  },
  HIDDEN: {
    label: 'Ẩn',
    bgClass: 'bg-neutral-T90',
    textClass: 'text-neutral-T50',
    dotColor: '#757777',
  },
  REJECTED: {
    label: 'Từ chối',
    bgClass: 'bg-tertiary-T95',
    textClass: 'text-tertiary-T30',
    dotColor: '#7B2752',
  },
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yy = String(d.getFullYear()).slice(-2);
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${dd}/${mm}/${yy} - ${hh}:${min}:${ss}`;
}

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: PostStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <View
      className={`flex-row items-center gap-1 px-2.5 py-1 rounded-full ${config.bgClass}`}
    >
      <View
        style={{
          width: 6,
          height: 6,
          borderRadius: 3,
          backgroundColor: config.dotColor,
        }}
      />
      <Text
        className={`font-label text-[11px] font-semibold ${config.textClass}`}
      >
        {config.label}
      </Text>
    </View>
  );
}

interface PostCardProps {
  post: Post;
  onPress: () => void;
}

function PostCard({ post, onPress }: PostCardProps) {
  const isDimmed =
    post.status === 'HIDDEN' ||
    post.status === 'REJECTED' ||
    post.status === 'DRAFT';
  const imageUrl = post.images?.[0];

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      className="bg-neutral-T100 rounded-2xl shadow-sm overflow-hidden active:scale-[0.98]"
    >
      {/* Image */}
      <View className="relative w-full h-44 bg-neutral-T90">
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            className={`w-full h-full ${isDimmed ? 'opacity-50' : ''}`}
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-full bg-neutral-T95 items-center justify-center">
            <Feather name="image" size={32} color="#AAABAB" />
          </View>
        )}
        {/* Type chip — top left */}
        <View className="absolute top-3 left-3 bg-neutral-T10/70 px-2.5 py-1 rounded-full">
          <Text className="font-label text-[10px] font-semibold text-neutral-T100 uppercase tracking-wide">
            {post.type === 'P2P_FREE' ? 'Miễn phí' : 'Túi bí ngờ'}
          </Text>
        </View>
        {/* Status badge — top right */}
        <View className="absolute top-3 right-3">
          <StatusBadge status={post.status} />
        </View>
      </View>

      {/* Body */}
      <View className="px-4 pt-3 pb-4 gap-2">
        <Text
          className={`text-base font-sans font-extrabold tracking-tight ${
            isDimmed ? 'text-neutral-T50' : 'text-neutral-T10'
          }`}
          numberOfLines={2}
        >
          {post.title}
        </Text>

        {/* Meta row */}
        <View className="flex-row items-center gap-4">
          <View className="flex-row items-center gap-1.5">
            <Feather name="tag" size={13} color="#AAABAB" />
            <Text className="font-body text-xs text-neutral-T50">
              {post.type === 'P2P_FREE'
                ? 'Miễn phí'
                : `${post.price.toLocaleString('vi-VN')}đ`}
            </Text>
          </View>
          {post.expiryDate && (
            <View className="flex-row items-center gap-1.5">
              <Feather name="clock" size={13} color="#AAABAB" />
              <Text className="font-body text-xs text-neutral-T50">
                HSD: {new Date(post.expiryDate).toLocaleDateString('vi-VN')}
              </Text>
            </View>
          )}
        </View>

        {/* Created at */}
        <View className="flex-row items-center gap-1.5 pt-0.5">
          <Feather name="calendar" size={12} color="#C5C7C6" />
          <Text className="font-label text-[11px] text-neutral-T70">
            {formatDate(post.createdAt)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── MAIN SCREEN ──────────────────────────────────────────────────────────────

export default function PostList() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<PostStatus | 'ALL'>('ALL');
  const [sortAsc, setSortAsc] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setIsRefreshing(true);
    else setIsLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/posts/me');
      setPosts(data.data ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không thể tải bài đăng.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const displayedPosts = useMemo(() => {
    let result = posts;

    if (activeFilter !== 'ALL') {
      result = result.filter((p) => p.status === activeFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter((p) => p.title.toLowerCase().includes(q));
    }

    result = [...result].sort((a, b) => {
      const at = new Date(a.createdAt).getTime();
      const bt = new Date(b.createdAt).getTime();
      return sortAsc ? at - bt : bt - at;
    });

    return result;
  }, [posts, searchQuery, activeFilter, sortAsc]);

  return (
    <View className="flex-1 bg-neutral">
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />
      <MainHeader />

      {/* ── Search bar ── */}
      <View className="bg-neutral-T100 p-3 flex-row items-center gap-3">
        <View className="flex-1 flex-row items-center bg-neutral-T95 rounded-xl px-3 gap-2 border border-neutral-T90 h-11">
          <Feather name="search" size={16} color="#AAABAB" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Tìm kiếm theo tên bài đăng..."
            placeholderTextColor="#AAABAB"
            className="flex-1 font-body text-sm text-neutral-T10 h-full"
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              activeOpacity={0.7}
            >
              <Feather name="x" size={16} color="#AAABAB" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          onPress={() => setSortAsc((prev) => !prev)}
          activeOpacity={0.8}
          className="w-11 h-11 rounded-full bg-neutral-T95 items-center justify-center border border-neutral-T90 active:opacity-70"
        >
          <Feather
            name={sortAsc ? 'arrow-up' : 'arrow-down'}
            size={18}
            color="#191C1C"
          />
        </TouchableOpacity>
      </View>

      {/* ── Filter Bar ── */}
      <View className="bg-neutral-T100 border-b border-neutral-T90 px-3 overflow-hidden">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            gap: 8,
            paddingVertical: 12,
          }}
        >
          {STATUS_FILTERS.map((filter) => {
            const isActive = activeFilter === filter.id;
            return (
              <TouchableOpacity
                key={filter.id}
                onPress={() => setActiveFilter(filter.id as PostStatus | 'ALL')}
                activeOpacity={0.8}
                className={`px-4 py-2 rounded-full active:scale-95 ${
                  isActive
                    ? 'bg-primary-T40'
                    : 'bg-neutral-T95 border border-neutral-T90'
                }`}
              >
                <Text
                  className={`font-label text-xs font-semibold ${
                    isActive ? 'text-neutral-T100' : 'text-neutral-T50'
                  }`}
                >
                  {filter.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ── Content ── */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#296C24" />
          <Text className="font-body text-sm text-neutral-T50 mt-3">
            Đang tải...
          </Text>
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-8 gap-4">
          <Text className="font-body text-sm text-neutral-T50 text-center">
            {error}
          </Text>
          <TouchableOpacity
            onPress={() => load()}
            className="px-6 py-3 bg-primary-T40 rounded-xl"
            activeOpacity={0.85}
          >
            <Text className="font-label font-semibold text-neutral-T100">
              Thử lại
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Result count */}
          <View className="px-4 pt-4 pb-2">
            <Text className="font-label text-xs text-neutral-T70">
              {displayedPosts.length} bài đăng
            </Text>
          </View>

          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingBottom: 120,
              gap: 12,
            }}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={() => load(true)}
                tintColor="#296C24"
              />
            }
          >
            {displayedPosts.length === 0 ? (
              <View className="items-center justify-center py-20 gap-3">
                <View className="w-16 h-16 rounded-full bg-neutral-T95 items-center justify-center">
                  <Feather name="inbox" size={28} color="#AAABAB" />
                </View>
                <Text className="font-body text-sm text-neutral-T50 text-center">
                  Không tìm thấy bài đăng nào
                </Text>
              </View>
            ) : (
              displayedPosts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  onPress={() =>
                    router.push({
                      pathname: '/(post)/post-detail' as any,
                      params: { id: post._id },
                    })
                  }
                />
              ))
            )}
          </ScrollView>
        </>
      )}
    </View>
  );
}
