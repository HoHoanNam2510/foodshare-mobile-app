import { Feather, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
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
import { deletePostApi } from '@/lib/postApi';
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

const STATUS_FILTER_IDS: (PostStatus | 'ALL')[] = [
  'ALL',
  'DRAFT',
  'PENDING_REVIEW',
  'AVAILABLE',
  'BOOKED',
  'OUT_OF_STOCK',
  'HIDDEN',
  'REJECTED',
];

const STATUS_LABEL_KEYS: Record<PostStatus | 'ALL', string> = {
  ALL: 'post.statusAll',
  DRAFT: 'post.statusDraft',
  PENDING_REVIEW: 'post.statusPending',
  AVAILABLE: 'post.statusOpen',
  BOOKED: 'post.statusBooked',
  OUT_OF_STOCK: 'post.statusOutOfStock',
  HIDDEN: 'post.statusHidden',
  REJECTED: 'post.statusRejected',
};

const STATUS_CONFIG: Record<PostStatus, Omit<StatusConfig, 'label'>> = {
  DRAFT: {
    bgClass: 'bg-neutral-T95',
    textClass: 'text-neutral-T40',
    dotColor: '#5C5F5E',
  },
  PENDING_REVIEW: {
    bgClass: 'bg-secondary-T95',
    textClass: 'text-secondary-T40',
    dotColor: '#944A00',
  },
  AVAILABLE: {
    bgClass: 'bg-primary-T95',
    textClass: 'text-primary-T40',
    dotColor: '#296C24',
  },
  BOOKED: {
    bgClass: 'bg-primary-T95',
    textClass: 'text-primary-T30',
    dotColor: '#0A530C',
  },
  OUT_OF_STOCK: {
    bgClass: 'bg-tertiary-T95',
    textClass: 'text-tertiary-T40',
    dotColor: '#983F6A',
  },
  HIDDEN: {
    bgClass: 'bg-neutral-T90',
    textClass: 'text-neutral-T50',
    dotColor: '#757777',
  },
  REJECTED: {
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
  const { t } = useTranslation();
  const config = STATUS_CONFIG[status];
  return (
    <View
      className={`flex-row items-center gap-1 rounded-full px-2.5 py-1 ${config.bgClass}`}
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
        {t(STATUS_LABEL_KEYS[status])}
      </Text>
    </View>
  );
}

interface PostCardProps {
  post: Post;
  onPress: () => void;
  onLongPress?: () => void;
}

function PostCard({ post, onPress, onLongPress }: PostCardProps) {
  const { t } = useTranslation();
  const isDimmed =
    post.status === 'HIDDEN' ||
    post.status === 'REJECTED' ||
    post.status === 'DRAFT';
  const imageUrl = post.images?.[0];

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={400}
      className="bg-neutral-T100 overflow-hidden rounded-2xl shadow-sm active:scale-[0.98]"
    >
      {/* Image */}
      <View className="bg-neutral-T90 relative h-44 w-full">
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            className={`h-full w-full ${isDimmed ? 'opacity-50' : ''}`}
            resizeMode="cover"
          />
        ) : (
          <View className="bg-neutral-T95 h-full w-full items-center justify-center">
            <Feather name="image" size={32} color="#AAABAB" />
          </View>
        )}
        {/* Type chip — top left */}
        <View className="bg-neutral-T10/70 absolute left-3 top-3 rounded-full px-2.5 py-1">
          <Text className="font-label text-neutral-T100 text-[10px] font-semibold uppercase tracking-wide">
            {post.type === 'P2P_FREE'
              ? t('common.free')
              : t('post.b2cMysteryBag')}
          </Text>
        </View>
        {/* Status badge — top right */}
        <View className="absolute right-3 top-3">
          <StatusBadge status={post.status} />
        </View>
      </View>

      {/* Body */}
      <View className="gap-2 px-4 pb-4 pt-3">
        <Text
          className={`font-sans text-base font-extrabold tracking-tight ${
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
            <Text className="font-body text-neutral-T50 text-xs">
              {post.type === 'P2P_FREE'
                ? t('common.free')
                : `${post.price.toLocaleString('vi-VN')}đ`}
            </Text>
          </View>
          {post.expiryDate && (
            <View className="flex-row items-center gap-1.5">
              <Feather name="clock" size={13} color="#AAABAB" />
              <Text className="font-body text-neutral-T50 text-xs">
                {t('post.expiryPrefix')}{' '}
                {new Date(post.expiryDate).toLocaleDateString('vi-VN')}
              </Text>
            </View>
          )}
        </View>

        {/* Created at */}
        <View className="flex-row items-center gap-1.5 pt-0.5">
          <Feather name="calendar" size={12} color="#C5C7C6" />
          <Text className="font-label text-neutral-T70 text-[11px]">
            {formatDate(post.createdAt)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── MAIN SCREEN ──────────────────────────────────────────────────────────────

export default function PostList() {
  const { t } = useTranslation();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<PostStatus | 'ALL'>('ALL');
  const [sortAsc, setSortAsc] = useState(false);

  const handleDeletePost = useCallback(
    (post: Post) => {
      Alert.alert(t('post.confirmDeleteTitle'), t('post.confirmDeleteMsg'), [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePostApi(post._id);
              setPosts((prev) => prev.filter((p) => p._id !== post._id));
            } catch (e) {
              Alert.alert(
                t('common.error'),
                e instanceof Error ? e.message : t('post.errorLoadPosts')
              );
            }
          },
        },
      ]);
    },
    [t]
  );

  const load = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setIsRefreshing(true);
      else setIsLoading(true);
      setError(null);
      try {
        const { data } = await api.get('/posts/me');
        setPosts(data.data ?? []);
      } catch (e) {
        setError(e instanceof Error ? e.message : t('post.errorLoadPosts'));
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [t]
  );

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
    <View className="bg-neutral flex-1">
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />
      <MainHeader />

      {/* ── Search bar ── */}
      <View className="bg-neutral-T100 flex-row items-center gap-3 p-3">
        <View className="bg-neutral-T95 border-neutral-T90 h-11 flex-1 flex-row items-center gap-2 rounded-xl border px-3">
          <Feather name="search" size={16} color="#AAABAB" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={t('post.searchByTitle')}
            placeholderTextColor="#AAABAB"
            className="font-body text-neutral-T10 h-full flex-1 text-sm"
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
          onPress={() => router.push('/(post)/my-templates' as any)}
          activeOpacity={0.8}
          className="bg-neutral-T95 border-neutral-T90 h-11 w-11 items-center justify-center rounded-full border active:opacity-70"
        >
          <MaterialIcons name="bookmark" size={18} color="#191C1C" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setSortAsc((prev) => !prev)}
          activeOpacity={0.8}
          className="bg-neutral-T95 border-neutral-T90 h-11 w-11 items-center justify-center rounded-full border active:opacity-70"
        >
          <Feather
            name={sortAsc ? 'arrow-up' : 'arrow-down'}
            size={18}
            color="#191C1C"
          />
        </TouchableOpacity>
      </View>

      {/* ── Filter Bar ── */}
      <View className="bg-neutral-T100 border-neutral-T90 overflow-hidden border-b px-3">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            gap: 8,
            paddingVertical: 12,
          }}
        >
          {STATUS_FILTER_IDS.map((id) => {
            const isActive = activeFilter === id;
            return (
              <TouchableOpacity
                key={id}
                onPress={() => setActiveFilter(id as PostStatus | 'ALL')}
                activeOpacity={0.8}
                className={`rounded-full px-4 py-2 active:scale-95 ${
                  isActive
                    ? 'bg-primary-T40'
                    : 'bg-neutral-T95 border-neutral-T90 border'
                }`}
              >
                <Text
                  className={`font-label text-xs font-semibold ${
                    isActive ? 'text-neutral-T100' : 'text-neutral-T50'
                  }`}
                >
                  {t(STATUS_LABEL_KEYS[id])}
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
          <Text className="font-body text-neutral-T50 mt-3 text-sm">
            {t('common.loading')}
          </Text>
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center gap-4 px-8">
          <Text className="font-body text-neutral-T50 text-center text-sm">
            {error}
          </Text>
          <TouchableOpacity
            onPress={() => load()}
            className="bg-primary-T40 rounded-xl px-6 py-3"
            activeOpacity={0.85}
          >
            <Text className="font-label text-neutral-T100 font-semibold">
              {t('common.retry')}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Result count */}
          <View className="px-4 pb-2 pt-4">
            <Text className="font-label text-neutral-T70 text-xs">
              {t('post.postCount', { count: displayedPosts.length })}
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
              <View className="items-center justify-center gap-3 py-20">
                <View className="bg-neutral-T95 h-16 w-16 items-center justify-center rounded-full">
                  <Feather name="inbox" size={28} color="#AAABAB" />
                </View>
                <Text className="font-body text-neutral-T50 text-center text-sm">
                  {t('post.noPostsFound')}
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
                  onLongPress={() => handleDeletePost(post)}
                />
              ))
            )}
          </ScrollView>
        </>
      )}
    </View>
  );
}
