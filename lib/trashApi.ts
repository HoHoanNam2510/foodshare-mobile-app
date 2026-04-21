import api from '@/lib/axios';

// ── Types ──────────────────────────────────────────────────────────────────

export type UserTrashCollection = 'posts' | 'reviews' | 'vouchers';

export interface ITrashPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ITrashPost {
  _id: string;
  title: string;
  images?: string[];
  deletedAt?: string;
  deletedBy?: string;
}

export interface ITrashReview {
  _id: string;
  rating: number;
  feedback?: string;
  deletedAt?: string;
  deletedBy?: string;
}

export interface ITrashVoucher {
  _id: string;
  code: string;
  title: string;
  deletedAt?: string;
  deletedBy?: string;
}

export type ITrashItem = ITrashPost | ITrashReview | ITrashVoucher;

export interface ITrashCollectionResult {
  collection: UserTrashCollection;
  data: ITrashItem[];
  pagination: ITrashPagination;
}

// ── API Functions ───────────────────────────────────────────────────────────

export async function getMyTrashItemsApi(
  collection?: UserTrashCollection,
  page = 1,
  limit = 20
): Promise<ITrashCollectionResult[]> {
  const params: Record<string, unknown> = { page, limit };
  if (collection) params.collection = collection;

  const { data } = await api.get<{
    success: boolean;
    data: ITrashCollectionResult[] | ITrashItem[];
    pagination?: ITrashPagination;
  }>('/auth/me/trash', { params });

  if (collection && data.pagination) {
    return [
      {
        collection,
        data: data.data as ITrashItem[],
        pagination: data.pagination,
      },
    ];
  }

  return data.data as ITrashCollectionResult[];
}

export async function restoreMyTrashItemApi(
  collection: UserTrashCollection,
  id: string
): Promise<{ success: boolean; message: string }> {
  const { data } = await api.post<{ success: boolean; message: string }>(
    `/auth/me/trash/restore/${collection}/${id}`
  );
  return data;
}

export async function purgeMyTrashItemApi(
  collection: UserTrashCollection,
  id: string
): Promise<{ success: boolean; message: string }> {
  const { data } = await api.delete<{ success: boolean; message: string }>(
    `/auth/me/trash/purge/${collection}/${id}`
  );
  return data;
}
