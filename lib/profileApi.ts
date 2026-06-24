import { AxiosError } from 'axios';

import api from '@/lib/axios';

interface ProfileResponse {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
}

export interface PaymentInfoPayload {
  bankName?: string;
  bankCode?: string;
  bankAccountNumber?: string;
  bankAccountName?: string;
  preferredDisbursement?: 'MOMO' | 'BANK';
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
  paymentInfo?: PaymentInfoPayload;
  kycDocuments?: string[];
  language?: 'vi' | 'en';
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

interface RegisterStorePayload {
  storeInfo: {
    businessName: string;
    openHours: string;
    closeHours: string;
    description?: string;
    businessAddress: string;
  };
  kycDocuments: string[];
  paymentInfo?: PaymentInfoPayload;
}

export async function registerStoreApi(
  payload: RegisterStorePayload
): Promise<ProfileResponse> {
  try {
    const { data } = await api.post<ProfileResponse>(
      '/auth/register-store',
      payload
    );
    return data;
  } catch (error) {
    extractErrorMessage(error, 'Đăng ký cửa hàng thất bại');
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

export async function resubmitKycApi(
  kycDocuments: string[]
): Promise<ProfileResponse> {
  try {
    const { data } = await api.post<ProfileResponse>('/auth/kyc-resubmit', {
      kycDocuments,
    });
    return data;
  } catch (error) {
    extractErrorMessage(error, 'Nộp lại KYC thất bại');
  }
}

export async function deleteAccountApi(): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const { data } = await api.delete<{ success: boolean; message: string }>(
      '/auth/me/account'
    );
    return data;
  } catch (error) {
    extractErrorMessage(error, 'Xóa tài khoản thất bại');
  }
}

export async function changePasswordApi(
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> {
  try {
    const { data } = await api.put<{ success: boolean; message: string }>(
      '/auth/change-password',
      { currentPassword, newPassword }
    );
    return data;
  } catch (error) {
    extractErrorMessage(error, 'Đổi mật khẩu thất bại');
  }
}

export interface IPublicUser {
  _id: string;
  fullName: string;
  avatar?: string;
  role: 'USER' | 'STORE';
  averageRating?: number;
  totalReviews?: number;
  greenPoints?: number;
  createdAt: string;
  storeInfo?: {
    businessName?: string;
    description?: string;
    businessAddress?: string;
  };
}

export async function getUserByIdApi(userId: string): Promise<{
  success: boolean;
  data: IPublicUser;
}> {
  try {
    const { data } = await api.get<{ success: boolean; data: IPublicUser }>(
      `/users/${userId}/profile`
    );
    return data;
  } catch (error) {
    extractErrorMessage(error, 'Không tìm thấy người dùng');
  }
}
