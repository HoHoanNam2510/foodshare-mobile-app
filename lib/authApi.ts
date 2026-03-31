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

export async function loginApi(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/login', payload);
  return data;
}

export async function registerApi(
  payload: RegisterPayload
): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/register', payload);
  return data;
}
