import { AxiosError } from 'axios';

import api from '@/lib/axios';

export interface IPostTemplate {
  _id: string;
  templateName: string;
  type: 'P2P_FREE' | 'B2C_MYSTERY_BAG';
  category: string;
  title: string;
  description?: string;
  images: string[];
  totalQuantity: number;
  price: number;
  createdAt: string;
}

export interface CreateTemplatePayload {
  templateName: string;
  type: 'P2P_FREE' | 'B2C_MYSTERY_BAG';
  category: string;
  title: string;
  description?: string;
  images?: string[];
  totalQuantity: number;
  price?: number;
}

export type UpdateTemplatePayload = Partial<CreateTemplatePayload>;

function extractErrorMessage(error: unknown, fallback: string): never {
  if (error instanceof AxiosError && error.response?.data) {
    const data = error.response.data;
    const msg = data.error || data.message;
    if (msg) throw new Error(msg);
  }
  if (error instanceof Error) throw error;
  throw new Error(fallback);
}

export async function getMyTemplatesApi(): Promise<IPostTemplate[]> {
  try {
    const { data } = await api.get<{ success: boolean; data: IPostTemplate[] }>(
      '/post-templates'
    );
    return data.data;
  } catch (error) {
    extractErrorMessage(error, 'Không thể tải danh sách mẫu bài đăng');
  }
}

export async function createTemplateApi(
  payload: CreateTemplatePayload
): Promise<IPostTemplate> {
  try {
    const { data } = await api.post<{ success: boolean; data: IPostTemplate }>(
      '/post-templates',
      payload
    );
    return data.data;
  } catch (error) {
    extractErrorMessage(error, 'Lưu mẫu bài đăng thất bại');
  }
}

export async function updateTemplateApi(
  id: string,
  payload: UpdateTemplatePayload
): Promise<IPostTemplate> {
  try {
    const { data } = await api.put<{ success: boolean; data: IPostTemplate }>(
      `/post-templates/${id}`,
      payload
    );
    return data.data;
  } catch (error) {
    extractErrorMessage(error, 'Cập nhật mẫu bài đăng thất bại');
  }
}

export async function deleteTemplateApi(id: string): Promise<void> {
  try {
    await api.delete(`/post-templates/${id}`);
  } catch (error) {
    extractErrorMessage(error, 'Xóa mẫu bài đăng thất bại');
  }
}
