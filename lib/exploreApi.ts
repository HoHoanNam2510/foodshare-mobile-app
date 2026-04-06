import api from '@/lib/axios';

import { ExplorePost, SortOption, TypeFilter } from '../components/explore/types';

function toApiType(
  filter: TypeFilter
): 'P2P_FREE' | 'B2C_MYSTERY_BAG' | undefined {
  if (filter === 'Free Food') return 'P2P_FREE';
  if (filter === 'Surprise Bags') return 'B2C_MYSTERY_BAG';
  return undefined;
}

function toApiSort(
  sort: SortOption
): 'newest' | 'expiring' | undefined {
  if (sort === 'newest') return 'newest';
  if (sort === 'expiring') return 'expiring';
  // 'closest' handled client-side (no GPS on server)
  return 'newest';
}

export async function fetchExplorePosts(
  filter: TypeFilter = 'All',
  sort: SortOption = 'newest'
): Promise<ExplorePost[]> {
  const params: Record<string, string> = {
    sort: toApiSort(sort) ?? 'newest',
  };

  const type = toApiType(filter);
  if (type) params.type = type;

  const { data } = await api.get<{ success: boolean; data: ExplorePost[] }>(
    '/posts/explore',
    { params }
  );
  return data.data;
}
