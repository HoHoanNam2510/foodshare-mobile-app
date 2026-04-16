import { AxiosError } from 'axios';

import api from '@/lib/axios';

// ── Field-level validation error ──
export interface FieldError {
  path: string;
  message: string;
}

export class ApiValidationError extends Error {
  fieldErrors: FieldError[];

  constructor(message: string, fieldErrors: FieldError[]) {
    super(message);
    this.name = 'ApiValidationError';
    this.fieldErrors = fieldErrors;
  }
}

interface SendPasscodeResponse {
  success: boolean;
  message: string;
  data?: {
    expiresInMinutes: number;
    deliveryMethod: 'email';
  };
}

interface CreatePostPayload {
  type: 'P2P_FREE' | 'B2C_MYSTERY_BAG';
  category: string;
  title: string;
  description?: string;
  images: string[];
  totalQuantity: number;
  price?: number;
  expiryDate: string;
  pickupTime: { start: string; end: string };
  location?: {
    type: 'Point';
    coordinates: [number, number];
  };
  publishAt?: string;
  passcode: string;
}

interface CreatePostResponse {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
}

function extractErrorMessage(error: unknown, fallback: string): never {
  if (error instanceof AxiosError && error.response?.data) {
    const data = error.response.data;
    // Nếu server trả về field-level errors (Zod validation)
    if (Array.isArray(data.errors) && data.errors.length > 0) {
      throw new ApiValidationError(data.message || fallback, data.errors);
    }
    if (data.message) {
      throw new Error(data.message);
    }
  }
  if (error instanceof Error) {
    throw error;
  }
  throw new Error(fallback);
}

export async function sendPostPasscodeApi(): Promise<SendPasscodeResponse> {
  try {
    const { data } = await api.post<SendPasscodeResponse>(
      '/posts/passcode/send',
      {}
    );
    return data;
  } catch (error) {
    extractErrorMessage(error, 'Gửi passcode thất bại');
  }
}

export async function createPostApi(
  payload: CreatePostPayload
): Promise<CreatePostResponse> {
  try {
    const { data } = await api.post<CreatePostResponse>('/posts', payload);
    return data;
  } catch (error) {
    extractErrorMessage(error, 'Tạo bài đăng thất bại');
  }
}

// ── Post detail ────────────────────────────────────────────────────────────

export interface IPostDetail {
  _id: string;
  type: 'P2P_FREE' | 'B2C_MYSTERY_BAG';
  category: string;
  title: string;
  description?: string;
  images: string[];
  totalQuantity: number;
  remainingQuantity: number;
  price: number;
  expiryDate: string;
  pickupTime: { start: string; end: string };
  status: string;
  createdAt: string;
  location?: { type: 'Point'; coordinates: [number, number] };
  ownerId: {
    _id: string;
    fullName: string;
    avatar?: string;
    averageRating?: number;
    role: string;
  };
}

export async function getPostByIdApi(
  postId: string
): Promise<{ success: boolean; data: IPostDetail }> {
  try {
    const { data } = await api.get(`/posts/${postId}`);
    return data;
  } catch (error) {
    extractErrorMessage(error, 'Không thể tải bài đăng');
  }
}

export async function getMyPostsApi(): Promise<{
  success: boolean;
  data: IPostDetail[];
}> {
  try {
    const { data } = await api.get('/posts/me');
    return data;
  } catch (error) {
    extractErrorMessage(error, 'Không lấy được danh sách bài đăng');
  }
}

// ── Update post ───────────────────────────────────────────────────────────

export interface UpdatePostPayload {
  category?: string;
  title?: string;
  description?: string;
  images?: string[];
  totalQuantity?: number;
  remainingQuantity?: number;
  price?: number;
  expiryDate?: string;
  pickupTime?: { start: string; end: string };
  location?: { type: 'Point'; coordinates: [number, number] };
  publishAt?: string;
}

export async function updatePostApi(
  postId: string,
  payload: UpdatePostPayload
): Promise<{ success: boolean; message: string; data?: IPostDetail }> {
  try {
    const { data } = await api.put(`/posts/${postId}`, payload);
    return data;
  } catch (error) {
    extractErrorMessage(error, 'Cập nhật bài đăng thất bại');
  }
}

// ── Delete post ───────────────────────────────────────────────────────────

export async function deletePostApi(
  postId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const { data } = await api.delete(`/posts/${postId}`);
    return data;
  } catch (error) {
    extractErrorMessage(error, 'Xóa bài đăng thất bại');
  }
}
