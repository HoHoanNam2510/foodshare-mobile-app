import React from 'react';
import { Text, TextProps } from 'react-native';

import { useAutoTranslate } from '@/lib/useAutoTranslate';

interface TranslatedTextProps extends TextProps {
  children: string | null | undefined;
}

/**
 * Hiển thị một chuỗi động (user-generated content) tự động dịch theo ngôn ngữ hiện tại.
 * Dùng cho: post.title, post.description, message.content, user.fullName (nếu cần),
 * store.businessName, v.v. Không dùng cho static UI strings — strings cố định nên dùng t().
 */
export default function TranslatedText({
  children,
  ...rest
}: TranslatedTextProps) {
  const translated = useAutoTranslate(children ?? '');
  return <Text {...rest}>{translated}</Text>;
}
