import api from '@/lib/axios';

// ── Types ──────────────────────────────────────────────────────────────────

export interface IReviewUser {
  _id: string;
  fullName: string;
  avatar?: string;
}

export interface IReviewTransaction {
  _id: string;
  postId?: { _id: string; title: string; images?: string[] };
  type?: string;
  quantity?: number;
  status?: string;
}

/** Review as written by me — revieweeId is populated, transactionId is populated */
export interface IWrittenReview {
  _id: string;
  transactionId: IReviewTransaction | string;
  reviewerId: string;
  revieweeId: IReviewUser | string;
  rating: number;
  feedback: string;
  createdAt: string;
}

/** Review received — reviewerId is populated */
export interface IReceivedReview {
  _id: string;
  transactionId: string;
  reviewerId: IReviewUser | string;
  revieweeId: string;
  rating: number;
  feedback: string;
  createdAt: string;
}

export interface CreateReviewPayload {
  transactionId: string;
  rating: number;
  feedback?: string;
}

export interface UpdateReviewPayload {
  rating: number;
  feedback?: string;
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ── POST /api/reviews ──────────────────────────────────────────────────────

export async function createReviewApi(
  payload: CreateReviewPayload
): Promise<{ success: boolean; message: string; data: IWrittenReview }> {
  const { data } = await api.post('/reviews', payload);
  return data;
}

// ── GET /api/reviews/me ────────────────────────────────────────────────────

export async function getMyWrittenReviewsApi(params?: {
  page?: number;
  limit?: number;
}): Promise<{ success: boolean; data: IWrittenReview[]; pagination: PaginationMeta }> {
  const { data } = await api.get('/reviews/me', { params });
  return data;
}

// ── GET /api/reviews/users/:userId ────────────────────────────────────────

export async function getUserReviewsApi(
  userId: string,
  params?: { page?: number; limit?: number; sort?: string }
): Promise<{ success: boolean; data: IReceivedReview[]; pagination: PaginationMeta }> {
  const { data } = await api.get(`/reviews/users/${userId}`, { params });
  return data;
}

// ── PUT /api/reviews/:reviewId ─────────────────────────────────────────────

export async function updateMyReviewApi(
  reviewId: string,
  payload: UpdateReviewPayload
): Promise<{ success: boolean; message: string; data: IWrittenReview }> {
  const { data } = await api.put(`/reviews/${reviewId}`, payload);
  return data;
}

// ── DELETE /api/reviews/:reviewId ─────────────────────────────────────────

export async function deleteMyReviewApi(
  reviewId: string
): Promise<{ success: boolean; message: string }> {
  const { data } = await api.delete(`/reviews/${reviewId}`);
  return data;
}
