import AsyncStorage from '@react-native-async-storage/async-storage';
import { colorScheme } from 'nativewind';
import { create } from 'zustand';

export type ThemeMode = 'light' | 'dark' | 'system';

const SUPPORTED_THEMES = ['light', 'dark', 'system'] as const;
const THEME_STORAGE_KEY = 'app_theme';
const DEFAULT_THEME: ThemeMode = 'light';

interface ThemeState {
  theme: ThemeMode;
  isHydrated: boolean;
  hydrate: () => Promise<void>;
  setTheme: (mode: ThemeMode) => Promise<void>;
  toggleTheme: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: DEFAULT_THEME,
  isHydrated: false,

  hydrate: async () => {
    try {
      const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      const resolved =
        stored && (SUPPORTED_THEMES as readonly string[]).includes(stored)
          ? (stored as ThemeMode)
          : DEFAULT_THEME;
      colorScheme.set(resolved);
      set({ theme: resolved, isHydrated: true });
    } catch {
      set({ isHydrated: true });
    }
  },

  setTheme: async (mode) => {
    if (get().theme === mode) return;
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch {
      // ignore storage errors
    }
    colorScheme.set(mode);
    set({ theme: mode });
  },

  toggleTheme: async () => {
    const next: ThemeMode = get().theme === 'dark' ? 'light' : 'dark';
    await get().setTheme(next);
  },
}));
