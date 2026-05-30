import api from '@/lib/axios';

import {
  ExplorePost,
  SortOption,
  TypeFilter,
} from '../components/explore/types';

export type ExplorePagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type ExplorePage = {
  posts: ExplorePost[];
  pagination: ExplorePagination;
};

export type ExploreApiParams = {
  filter?: TypeFilter;
  sort?: SortOption;
  search?: string;
  categoryId?: string;
  page?: number;
  limit?: number;
  lat?: number;
  lng?: number;
};

function toApiType(
  filter: TypeFilter
): 'P2P_FREE' | 'B2C_MYSTERY_BAG' | undefined {
  if (filter === 'Free Food') return 'P2P_FREE';
  if (filter === 'Surprise Bags') return 'B2C_MYSTERY_BAG';
  return undefined;
}

function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

export async function fetchExplorePosts(
  params: ExploreApiParams = {}
): Promise<ExplorePage> {
  const {
    filter = 'All',
    sort = 'newest',
    search,
    categoryId,
    page = 1,
    limit = 15,
    lat,
    lng,
  } = params;

  const apiParams: Record<string, string> = {
    sort,
    page: String(page),
    limit: String(limit),
  };

  const type = toApiType(filter);
  if (type) apiParams.type = type;
  if (search?.trim()) apiParams.search = search.trim();
  if (categoryId) apiParams.category = categoryId;
  if (sort === 'closest' && lat != null && lng != null) {
    apiParams.lat = String(lat);
    apiParams.lng = String(lng);
  }

  const { data } = await api.get<{
    success: boolean;
    data: (ExplorePost & { distanceMeters?: number })[];
    pagination: ExplorePagination;
  }>('/posts/explore', { params: apiParams });

  const posts: ExplorePost[] = data.data.map((post) => ({
    ...post,
    distance:
      post.distanceMeters != null
        ? formatDistance(post.distanceMeters)
        : post.distance,
  }));

  return { posts, pagination: data.pagination };
}
