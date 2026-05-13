import api from '@/lib/axios';

export interface HomePostOwner {
  _id: string;
  fullName: string;
  avatar?: string;
  averageRating: number;
  role: string;
}

export interface HomePost {
  _id: string;
  title: string;
  images: string[];
  remainingQuantity: number;
  price: number;
  expiryDate: string;
  createdAt: string;
  ownerId: HomePostOwner;
  distanceLabel?: string;
  category: string;
  status: string;
}

export interface HomePostsParams {
  categorySlug?: string;
  lng?: number;
  lat?: number;
  limit?: number;
}

export async function fetchFreshlyShared(
  params?: HomePostsParams
): Promise<HomePost[]> {
  const { data } = await api.get<{ success: boolean; data: HomePost[] }>(
    '/posts/home/freshly-shared',
    { params }
  );
  return data.data;
}

export async function fetchMarketTeaser(
  params?: HomePostsParams
): Promise<HomePost[]> {
  const { data } = await api.get<{ success: boolean; data: HomePost[] }>(
    '/posts/home/market-teaser',
    { params }
  );
  return data.data;
}

export interface ImpactStats {
  itemsReceived: number;
  itemsGiven: number;
  bagsPurchased: number;
  bagsSold: number | null;
  greenPoints: number;
}

export async function fetchMyImpact(): Promise<ImpactStats> {
  const { data } = await api.get<{ success: boolean; data: ImpactStats }>(
    '/auth/me/impact'
  );
  return data.data;
}
