import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ChatHeaderProps {
  name: string;
  avatarUri: string;
  isOnline?: boolean;
  lastSeen?: string;
}

function relativeTime(
  iso: string,
  t: (key: string, opts?: Record<string, unknown>) => string
): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.max(1, Math.floor(diffMs / 60000));
  if (mins < 60) return t('common.minutesAgo', { count: mins });
  const hours = Math.floor(mins / 60);
  if (hours < 24) return t('common.hoursAgo', { count: hours });
  return t('common.daysAgo', { count: Math.floor(hours / 24) });
}

export default function ChatHeader({
  name,
  avatarUri,
  isOnline = true,
  lastSeen,
}: ChatHeaderProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const statusText = isOnline
    ? t('chat.online')
    : lastSeen
      ? t('chat.lastSeen', { time: relativeTime(lastSeen, t) })
      : t('chat.offline');

  return (
    <SafeAreaView
      edges={['top']}
      className="dark:bg-neutral-T20 dark:border-neutral-T30 z-10 bg-white dark:border-b"
      style={
        isDark
          ? undefined
          : {
              shadowColor: '#191c1c',
              shadowOpacity: 0.06,
              shadowOffset: { width: 0, height: 4 },
              shadowRadius: 12,
              elevation: 4,
            }
      }
    >
      <View className="flex-row items-center gap-4 px-6 py-3">
        <TouchableOpacity onPress={() => router.back()} className="-ml-2 p-2">
          <Feather
            name="arrow-left"
            size={22}
            color={isDark ? '#E1E3E2' : '#191c1c'}
          />
        </TouchableOpacity>

        {/* Avatar with online dot */}
        <View className="relative">
          <Image
            source={{ uri: avatarUri }}
            className="h-10 w-10 rounded-full"
          />
          {isOnline && (
            <View className="bg-primary-T40 dark:border-neutral-T20 absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white" />
          )}
        </View>

        <View className="flex-1">
          <Text className="text-neutral-T10 dark:text-neutral-T90 font-sans text-lg">
            {name}
          </Text>
          <Text className="font-label text-primary-T40 dark:text-primary-T60 text-xs">
            {statusText}
          </Text>
        </View>

        <TouchableOpacity className="p-2">
          <Feather name="phone" size={20} color="#296C24" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
