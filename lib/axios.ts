import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Alert } from 'react-native';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Chỉ trigger logout khi user đã đăng nhập (có token), tránh loop khi login sai mật khẩu
      const token = await SecureStore.getItemAsync('auth_token');
      if (token) {
        const { useAuthStore } = await import('@/stores/authStore');
        await useAuthStore.getState().logout();
        Alert.alert(
          'Phiên đăng nhập hết hạn',
          'Vui lòng đăng nhập lại để tiếp tục.'
        );
      }
    }
    return Promise.reject(error);
  }
);

export default api;
