import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';

import { loginApi, logoutApi, registerApi } from '@/lib/authApi';

interface User {
  _id: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  avatar?: string;
  role: 'USER' | 'STORE' | 'ADMIN';
  isProfileCompleted: boolean;
  greenPoints: number;
  averageRating: number;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isHydrated: boolean;

  hydrate: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (
    fullName: string,
    email: string,
    phoneNumber: string,
    password: string
  ) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  isHydrated: false,

  hydrate: async () => {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      const userJson = await SecureStore.getItemAsync('auth_user');
      if (token && userJson) {
        set({ token, user: JSON.parse(userJson), isHydrated: true });
      } else {
        set({ isHydrated: true });
      }
    } catch {
      set({ isHydrated: true });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const res = await loginApi({ email, password });
      if (res.success && res.token && res.data) {
        await SecureStore.setItemAsync('auth_token', res.token);
        await SecureStore.setItemAsync('auth_user', JSON.stringify(res.data));
        set({
          token: res.token,
          user: res.data as unknown as User,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
        throw new Error(res.message || 'Đăng nhập thất bại');
      }
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (fullName, email, phoneNumber, password) => {
    set({ isLoading: true });
    try {
      const res = await registerApi({
        fullName,
        email,
        phoneNumber,
        password,
      });
      if (!res.success) {
        throw new Error(res.message || 'Đăng ký thất bại');
      }
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    try {
      await logoutApi();
    } catch {
      // Vẫn cho phép logout ở client ngay cả khi gọi server thất bại
    }
    await SecureStore.deleteItemAsync('auth_token');
    await SecureStore.deleteItemAsync('auth_user');
    set({ user: null, token: null });
  },
}));
