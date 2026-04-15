import AsyncStorage from '@react-native-async-storage/async-storage';

import api from '@/lib/axios';
import { SupportedLanguage } from '@/lib/i18n';

const CACHE_PREFIX = 'tr:';
const MAX_BATCH = 50;
const DEBOUNCE_MS = 60;

type PendingEntry = {
  text: string;
  resolve: (translated: string) => void;
  reject: (err: unknown) => void;
};

type Queues = Partial<Record<SupportedLanguage, Map<string, PendingEntry[]>>>;

const queues: Queues = {};
const timers: Partial<Record<SupportedLanguage, ReturnType<typeof setTimeout>>> = {};

function cacheKey(target: SupportedLanguage, text: string) {
  return `${CACHE_PREFIX}${target}:${text}`;
}

async function getCached(
  target: SupportedLanguage,
  text: string
): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(cacheKey(target, text));
  } catch {
    return null;
  }
}

async function setCached(
  target: SupportedLanguage,
  text: string,
  translated: string
): Promise<void> {
  try {
    await AsyncStorage.setItem(cacheKey(target, text), translated);
  } catch {
    // ignore
  }
}

async function flushQueue(target: SupportedLanguage): Promise<void> {
  const q = queues[target];
  if (!q || q.size === 0) return;

  const batch = Array.from(q.entries()).slice(0, MAX_BATCH);
  const texts = batch.map(([text]) => text);

  batch.forEach(([text]) => q.delete(text));

  try {
    const res = await api.post<{
      success: boolean;
      data: { translations: string[] };
    }>('/translate', { texts, targetLang: target });

    const translations = res.data.data.translations;
    await Promise.all(
      batch.map(async ([text, entries], i) => {
        const translated = translations[i] ?? text;
        await setCached(target, text, translated);
        entries.forEach((e) => e.resolve(translated));
      })
    );
  } catch (err) {
    batch.forEach(([text, entries]) => {
      entries.forEach((e) => e.resolve(text)); // fallback to original on error
    });
    void err;
  }

  if (q.size > 0) {
    scheduleFlush(target);
  }
}

function scheduleFlush(target: SupportedLanguage) {
  if (timers[target]) return;
  timers[target] = setTimeout(() => {
    timers[target] = undefined;
    void flushQueue(target);
  }, DEBOUNCE_MS);
}

/**
 * Dịch 1 chuỗi. Check cache trước; nếu miss thì queue và batch call API.
 * Trả về chuỗi gốc ngay lập tức nếu target trùng nguồn hoặc text rỗng.
 */
export async function translateText(
  text: string,
  targetLang: SupportedLanguage
): Promise<string> {
  if (!text) return text;
  if (text.length > 2000) return text;

  const cached = await getCached(targetLang, text);
  if (cached !== null) return cached;

  return new Promise<string>((resolve, reject) => {
    const q = queues[targetLang] ?? new Map<string, PendingEntry[]>();
    queues[targetLang] = q;

    const entries = q.get(text) ?? [];
    entries.push({ text, resolve, reject });
    q.set(text, entries);

    scheduleFlush(targetLang);
  });
}
