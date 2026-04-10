import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';

import {
  googleLoginApi,
  loginApi,
  logoutApi,
  registerSendCodeApi,
  registerVerifyApi,
} from '@/lib/authApi';
import { getMeApi } from '@/lib/profileApi';

interface StoreInfo {
  businessName?: string;
  openHours?: string;
  closeHours?: string;
  description?: string;
  businessAddress?: string;
}

interface PaymentInfo {
  momoPhone?: string;
  // zalopayPhone?: string; // TODO: Re-enable when ZaloPay is ready
  bankName?: string;
  bankCode?: string;
  bankAccountNumber?: string;
  bankAccountName?: string;
  preferredDisbursement?: 'MOMO' | /* 'ZALOPAY' | */ 'BANK'; // TODO: Re-add ZALOPAY when ready
}

interface User {
  _id: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  avatar?: string;
  defaultAddress?: string;
  role: 'USER' | 'STORE' | 'ADMIN';
  authProvider: 'LOCAL' | 'GOOGLE';
  isEmailVerified: boolean;
  isProfileCompleted: boolean;
  location?: {
    type: 'Point';
    coordinates: [number, number];
  };
  kycStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  kycDocuments: string[];
  storeInfo?: StoreInfo;
  paymentInfo?: PaymentInfo;
  greenPoints: number;
  averageRating: number;
  status: 'ACTIVE' | 'BANNED';
  createdAt: string;
  updatedAt: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isHydrated: boolean;

  hydrate: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  googleLogin: (idToken: string) => Promise<void>;
  registerSendCode: (
    fullName: string,
    email: string,
    phoneNumber: string,
    password: string
  ) => Promise<void>;
  registerVerify: (email: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  setUser: (user: User) => void;
  /** Optimistic update: trừ điểm ngay lập tức trước khi server xác nhận */
  deductGreenPoints: (amount: number) => void;
  /** Rollback: hoàn trả điểm nếu server báo lỗi */
  restoreGreenPoints: (amount: number) => void;
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

  googleLogin: async (idToken) => {
    set({ isLoading: true });
    try {
      const res = await googleLoginApi({ idToken });
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
        throw new Error(res.message || 'Đăng nhập Google thất bại');
      }
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  registerSendCode: async (fullName, email, phoneNumber, password) => {
    set({ isLoading: true });
    try {
      const res = await registerSendCodeApi({
        fullName,
        email,
        phoneNumber: phoneNumber || undefined,
        password,
      });
      if (!res.success) {
        throw new Error(res.message || 'Gửi mã xác minh thất bại');
      }
    } finally {
      set({ isLoading: false });
    }
  },

  registerVerify: async (email, code) => {
    set({ isLoading: true });
    try {
      const res = await registerVerifyApi({ email, code });
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
        throw new Error(res.message || 'Xác minh thất bại');
      }
    } catch (error) {
      set({ isLoading: false });
      throw error;
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

  fetchProfile: async () => {
    try {
      const res = await getMeApi();
      if (res.success && res.data) {
        const user = res.data as unknown as User;
        await SecureStore.setItemAsync('auth_user', JSON.stringify(user));
        set({ user });
      }
    } catch {
      // Giữ nguyên user cũ nếu fetch thất bại
    }
  },

  setUser: (user: User) => {
    set({ user });
    SecureStore.setItemAsync('auth_user', JSON.stringify(user));
  },

  deductGreenPoints: (amount) =>
    set((state) => ({
      user: state.user
        ? { ...state.user, greenPoints: Math.max(0, state.user.greenPoints - amount) }
        : null,
    })),

  restoreGreenPoints: (amount) =>
    set((state) => ({
      user: state.user
        ? { ...state.user, greenPoints: state.user.greenPoints + amount }
        : null,
    })),
}));
