import { create } from 'zustand';

import i18n, {
  DEFAULT_LANGUAGE,
  getStoredLanguage,
  setStoredLanguage,
  SupportedLanguage,
} from '@/lib/i18n';
import { updateProfileApi } from '@/lib/profileApi';

interface LanguageState {
  language: SupportedLanguage;
  isHydrated: boolean;
  hydrate: () => Promise<void>;
  setLanguage: (lang: SupportedLanguage) => Promise<void>;
  toggleLanguage: () => Promise<void>;
}

export const useLanguageStore = create<LanguageState>((set, get) => ({
  language: DEFAULT_LANGUAGE,
  isHydrated: false,

  hydrate: async () => {
    const lang = await getStoredLanguage();
    await i18n.changeLanguage(lang);
    set({ language: lang, isHydrated: true });
  },

  setLanguage: async (lang) => {
    if (get().language === lang) return;
    await i18n.changeLanguage(lang);
    await setStoredLanguage(lang);
    set({ language: lang });
    // Sync to server for push notification i18n — silent, no user-facing error
    updateProfileApi({ language: lang }).catch(() => {});
  },

  toggleLanguage: async () => {
    const next: SupportedLanguage = get().language === 'vi' ? 'en' : 'vi';
    await get().setLanguage(next);
  },
}));
