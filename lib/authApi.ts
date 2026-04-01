import { AxiosError } from 'axios';

import api from '@/lib/axios';

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
}

interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  data?: Record<string, unknown>;
  onboardingRequired?: boolean;
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

export async function loginApi(payload: LoginPayload): Promise<AuthResponse> {
  try {
    const { data } = await api.post<AuthResponse>('/auth/login', payload);
    return data;
  } catch (error) {
    extractErrorMessage(error, 'Đăng nhập thất bại');
  }
}

export async function registerApi(
  payload: RegisterPayload
): Promise<AuthResponse> {
  try {
    const { data } = await api.post<AuthResponse>('/auth/register', payload);
    return data;
  } catch (error) {
    extractErrorMessage(error, 'Đăng ký thất bại');
  }
}

export async function logoutApi(): Promise<AuthResponse> {
  try {
    const { data } = await api.post<AuthResponse>('/auth/logout');
    return data;
  } catch (error) {
    extractErrorMessage(error, 'Đăng xuất thất bại');
  }
}
