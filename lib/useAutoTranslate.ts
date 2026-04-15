import { useEffect, useState } from 'react';

import { useLanguageStore } from '@/stores/languageStore';
import { translateText } from '@/lib/translateApi';

/**
 * Auto-translate một chuỗi động (user-generated content) sang ngôn ngữ hiện tại.
 * Giả định chuỗi gốc là tiếng Việt — nếu ngôn ngữ hiện tại là 'vi' thì trả về nguyên văn.
 */
export function useAutoTranslate(text: string | null | undefined): string {
  const language = useLanguageStore((s) => s.language);
  const source = text ?? '';
  const [result, setResult] = useState<string>(source);

  useEffect(() => {
    if (!source) {
      setResult('');
      return;
    }
    if (language === 'vi') {
      setResult(source);
      return;
    }
    let cancelled = false;
    setResult(source); // optimistic: show original until translation arrives
    translateText(source, language)
      .then((translated) => {
        if (!cancelled) setResult(translated);
      })
      .catch(() => {
        if (!cancelled) setResult(source);
      });
    return () => {
      cancelled = true;
    };
  }, [source, language]);

  return result;
}
