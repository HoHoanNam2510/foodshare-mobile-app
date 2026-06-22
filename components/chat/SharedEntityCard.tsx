import { Feather } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';

interface SharedEntityCardProps {
  kind: 'POST' | 'TRANSACTION';
  title: string;
  imageUrl?: string;
  subtitle?: string;
  onPress?: () => void;
  /** Khi true: layout nhỏ gọn hơn dùng trong pending banner */
  compact?: boolean;
}

export default function SharedEntityCard({
  kind,
  title,
  imageUrl,
  subtitle,
  onPress,
  compact = false,
}: SharedEntityCardProps) {
  const { t } = useTranslation();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const kindLabel =
    kind === 'POST' ? t('chat.sharedPost') : t('chat.sharedTransaction');
  const accentColor = kind === 'POST' ? '#296C24' : '#1D4ED8';

  const content = (
    <View
      className={`bg-neutral-T100 dark:bg-neutral-T20 border-neutral-T90 dark:border-neutral-T30 flex-row items-center gap-3 overflow-hidden rounded-2xl border ${
        compact ? 'px-3 py-2.5' : 'px-3 py-3'
      }`}
      style={{ minWidth: 200, maxWidth: 260 }}
    >
      {/* Thumbnail */}
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={{
            width: compact ? 44 : 56,
            height: compact ? 44 : 56,
            borderRadius: 10,
          }}
          resizeMode="cover"
        />
      ) : (
        <View
          className="items-center justify-center rounded-[10px]"
          style={{
            width: compact ? 44 : 56,
            height: compact ? 44 : 56,
            backgroundColor: isDark
              ? 'rgba(255,255,255,0.08)'
              : 'rgba(0,0,0,0.06)',
          }}
        >
          <Feather
            name={kind === 'POST' ? 'package' : 'file-text'}
            size={compact ? 20 : 24}
            color={accentColor}
          />
        </View>
      )}

      {/* Text info */}
      <View className="min-w-0 flex-1 gap-0.5">
        <Text
          style={{ color: accentColor, fontSize: 10 }}
          className="font-label font-bold uppercase tracking-wider"
          numberOfLines={1}
        >
          {kindLabel}
        </Text>
        <Text
          className="text-neutral-T10 dark:text-neutral-T90 font-sans text-sm font-semibold"
          numberOfLines={2}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text
            className="font-label text-neutral-T50 dark:text-neutral-T60 text-xs"
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>

      {/* Chevron — chỉ khi có onPress */}
      {onPress && (
        <Feather
          name="chevron-right"
          size={16}
          color={isDark ? '#9BA19A' : '#AAABAB'}
        />
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}
