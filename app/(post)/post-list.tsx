import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
  id: string;
  title: string;
  image: string;
  type: PostType;
  status: PostStatus;
  requests: number;
  expiryDate: string | null;
  createdAt: Date;
}

interface StatusConfig {
  label: string;
  bgClass: string;
  textClass: string;
  dotColor: string;
}

// ─── MOCK DATA ────────────────────────────────────────────────────────────────

const MOCK_POSTS: Post[] = [
  {
    id: '1',
    title: 'Artisan Sourdough Loaves',
    image: 'https://images.unsplash.com/photo-1587486913049-53fc88980cfc?w=800&q=80',
    type: 'P2P_FREE',
    status: 'AVAILABLE',
    requests: 12,
    expiryDate: '2026-04-05',
    createdAt: new Date('2026-04-03T10:30:00'),
  },
  {
    id: '2',
    title: 'Fresh Produce Surprise Bag',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80',
    type: 'B2C_MYSTERY_BAG',
    status: 'BOOKED',
    requests: 5,
    expiryDate: '2026-04-03',
    createdAt: new Date('2026-04-02T15:00:00'),
  },
  {
    id: '3',
    title: 'Mediterranean Salad Box',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80',
    type: 'P2P_FREE',
    status: 'DRAFT',
    requests: 0,
    expiryDate: null,
    createdAt: new Date('2026-04-01T08:20:00'),
  },
  {
    id: '4',
    title: 'Homemade Banana Bread',
    image: 'https://images.unsplash.com/photo-1585478259715-876acc5be8eb?w=800&q=80',
    type: 'P2P_FREE',
    status: 'PENDING_REVIEW',
    requests: 0,
    expiryDate: '2026-04-06',
    createdAt: new Date('2026-04-03T09:00:00'),
  },
  {
    id: '5',
    title: 'Leftover Pasta Bake',
    image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&q=80',
    type: 'B2C_MYSTERY_BAG',
    status: 'OUT_OF_STOCK',
    requests: 8,
    expiryDate: '2026-04-02',
    createdAt: new Date('2026-03-30T17:45:00'),
  },
  {
    id: '6',
    title: 'Organic Veggie Bundle',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&q=80',
    type: 'P2P_FREE',
    status: 'HIDDEN',
    requests: 2,
    expiryDate: '2026-04-08',
    createdAt: new Date('2026-03-28T12:10:00'),
  },
  {
    id: '7',
    title: 'Spicy Kimchi Jars',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80',
    type: 'P2P_FREE',
    status: 'REJECTED',
    requests: 0,
    expiryDate: null,
    createdAt: new Date('2026-03-25T14:30:00'),
  },
];

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

function formatDate(date: Date): string {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yy = String(date.getFullYear()).slice(-2);
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  return `${dd}/${mm}/${yy} - ${hh}:${min}:${ss}`;
}

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────

interface StatusBadgeProps {
  status: PostStatus;
}

function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  return (
    <View className={`flex-row items-center gap-1 px-2.5 py-1 rounded-full ${config.bgClass}`}>
      <View
        style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: config.dotColor }}
      />
      <Text className={`font-label text-[11px] font-semibold ${config.textClass}`}>
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
  const isDimmed = post.status === 'HIDDEN' || post.status === 'REJECTED' || post.status === 'DRAFT';

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      className="bg-neutral-T100 rounded-2xl shadow-sm overflow-hidden active:scale-[0.98]"
    >
      {/* Image */}
      <View className="relative w-full h-44 bg-neutral-T90">
        <Image
          source={{ uri: post.image }}
          className={`w-full h-full ${isDimmed ? 'opacity-50' : ''}`}
          resizeMode="cover"
        />
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
            <Feather name="users" size={13} color="#AAABAB" />
            <Text className="font-body text-xs text-neutral-T50">
              {post.requests} yêu cầu
            </Text>
          </View>
          {post.expiryDate && (
            <View className="flex-row items-center gap-1.5">
              <Feather name="clock" size={13} color="#AAABAB" />
              <Text className="font-body text-xs text-neutral-T50">HSD: {post.expiryDate}</Text>
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
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<PostStatus | 'ALL'>('ALL');
  const [sortAsc, setSortAsc] = useState(false);

  const displayedPosts = useMemo(() => {
    let result = MOCK_POSTS;

    if (activeFilter !== 'ALL') {
      result = result.filter((p) => p.status === activeFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter((p) => p.title.toLowerCase().includes(q));
    }

    result = [...result].sort((a, b) =>
      sortAsc
        ? a.createdAt.getTime() - b.createdAt.getTime()
        : b.createdAt.getTime() - a.createdAt.getTime()
    );

    return result;
  }, [searchQuery, activeFilter, sortAsc]);

  return (
    <SafeAreaView className="flex-1 bg-neutral" edges={['top']}>
      {/* ── Header ── */}
      <View className="bg-neutral-T100 px-4 pt-4 pb-3 shadow-sm z-10">
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center gap-3">
            <TouchableOpacity
              onPress={() => router.back()}
              activeOpacity={0.7}
              className="w-9 h-9 rounded-xl bg-neutral-T95 items-center justify-center active:opacity-70"
            >
              <Feather name="arrow-left" size={20} color="#191C1C" />
            </TouchableOpacity>
            <Text className="text-xl font-sans font-extrabold tracking-tight text-neutral-T10">
              Bài đăng của tôi
            </Text>
          </View>

          {/* Sort toggle */}
          <TouchableOpacity
            onPress={() => setSortAsc((prev) => !prev)}
            activeOpacity={0.7}
            className="flex-row items-center gap-1.5 bg-neutral-T95 px-3 py-2 rounded-xl active:opacity-70"
          >
            <Feather
              name={sortAsc ? 'arrow-up' : 'arrow-down'}
              size={14}
              color="#296C24"
            />
            <Text className="font-label text-xs font-semibold text-primary-T40">
              {sortAsc ? 'Cũ nhất' : 'Mới nhất'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search bar */}
        <View className="flex-row items-center bg-neutral-T95 rounded-xl px-3 gap-2 border border-neutral-T90 h-11">
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
            <TouchableOpacity onPress={() => setSearchQuery('')} activeOpacity={0.7}>
              <Feather name="x" size={16} color="#AAABAB" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Filter Bar ── */}
      <View className="bg-neutral-T100 border-b border-neutral-T90">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingHorizontal: 16, paddingVertical: 12 }}
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

      {/* ── Result count ── */}
      <View className="px-4 pt-4 pb-2">
        <Text className="font-label text-xs text-neutral-T70">
          {displayedPosts.length} bài đăng
        </Text>
      </View>

      {/* ── List ── */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120, gap: 12 }}
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
              key={post.id}
              post={post}
              onPress={() =>
                router.push({
                  pathname: '/(post)/post-detail' as any,
                  params: { id: post.id },
                })
              }
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
