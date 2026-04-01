import { AxiosError } from 'axios';

import api from '@/lib/axios';

interface ProfileResponse {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
}

interface UpdateProfilePayload {
  fullName?: string;
  phoneNumber?: string;
  defaultAddress?: string;
  avatar?: string;
  storeInfo?: {
    businessName?: string;
    openHours?: string;
    closeHours?: string;
    description?: string;
    businessAddress?: string;
  };
  kycDocuments?: string[];
}

function extractErrorMessage(error: unknown, fallback: string): never {
  if (error instanceof AxiosError && error.response?.data?.message) {
    throw new Error(error.response.data.message);
  }
  if (error instanceof Error) {
    throw error;
  }
  throw new Error(fallback);
}

export async function getMeApi(): Promise<ProfileResponse> {
  try {
    const { data } = await api.get<ProfileResponse>('/auth/me');
    return data;
  } catch (error) {
    extractErrorMessage(error, 'Lấy thông tin thất bại');
  }
}

export async function updateProfileApi(
  payload: UpdateProfilePayload
): Promise<ProfileResponse> {
  try {
    const { data } = await api.put<ProfileResponse>(
      '/auth/update-profile',
      payload
    );
    return data;
  } catch (error) {
    extractErrorMessage(error, 'Cập nhật hồ sơ thất bại');
  }
}
