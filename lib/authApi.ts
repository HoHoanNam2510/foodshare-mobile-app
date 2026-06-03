import { AxiosError } from 'axios';

import api from '@/lib/axios';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly errorCode?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  fullName: string;
  email: string;
  phoneNumber?: string;
  password: string;
}

interface RegisterVerifyPayload {
  email: string;
  code: string;
}

interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  data?: Record<string, unknown>;
  onboardingRequired?: boolean;
}

interface GoogleLoginPayload {
  idToken: string;
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

export async function registerSendCodeApi(
  payload: RegisterPayload
): Promise<AuthResponse> {
  try {
    const { data } = await api.post<AuthResponse>(
      '/auth/register/send-code',
      payload
    );
    return data;
  } catch (error) {
    extractErrorMessage(error, 'Đăng ký thất bại');
  }
}

export async function registerVerifyApi(
  payload: RegisterVerifyPayload
): Promise<AuthResponse> {
  try {
    const { data } = await api.post<AuthResponse>(
      '/auth/register/verify',
      payload
    );
    return data;
  } catch (error) {
    extractErrorMessage(error, 'Xác minh mã thất bại');
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

export async function googleLoginApi(
  payload: GoogleLoginPayload
): Promise<AuthResponse> {
  try {
    const { data } = await api.post<AuthResponse>(
      '/auth/google-login',
      payload
    );
    return data;
  } catch (error) {
    extractErrorMessage(error, 'Đăng nhập Google thất bại');
  }
}

export async function forgotPasswordSendCodeApi(
  email: string
): Promise<AuthResponse> {
  try {
    const { data } = await api.post<AuthResponse>(
      '/auth/forgot-password/send-code',
      { email }
    );
    return data;
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data) {
      const { message, errorCode } = error.response.data as {
        message?: string;
        errorCode?: string;
      };
      throw new ApiError(message || 'Gửi mã xác minh thất bại', errorCode);
    }
    throw new ApiError('Gửi mã xác minh thất bại');
  }
}

export async function forgotPasswordVerifyCodeApi(
  email: string,
  code: string
): Promise<AuthResponse> {
  try {
    const { data } = await api.post<AuthResponse>(
      '/auth/forgot-password/verify-code',
      { email, code }
    );
    return data;
  } catch (error) {
    extractErrorMessage(error, 'Mã xác minh không hợp lệ');
  }
}

export async function forgotPasswordResetApi(
  email: string,
  code: string,
  newPassword: string
): Promise<AuthResponse> {
  try {
    const { data } = await api.post<AuthResponse>(
      '/auth/forgot-password/reset',
      { email, code, newPassword }
    );
    return data;
  } catch (error) {
    extractErrorMessage(error, 'Đặt lại mật khẩu thất bại');
  }
}
