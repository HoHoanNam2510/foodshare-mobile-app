import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ChatHeaderProps {
  name: string;
  avatarUri: string;
  isOnline?: boolean;
}

export default function ChatHeader({ name, avatarUri, isOnline = true }: ChatHeaderProps) {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <SafeAreaView
      edges={['top']}
      className="bg-white z-10"
      style={{
        shadowColor: '#191c1c',
        shadowOpacity: 0.06,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 12,
        elevation: 4,
      }}
    >
      <View className="flex-row items-center gap-4 px-6 py-3">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <Feather name="arrow-left" size={22} color="#191c1c" />
        </TouchableOpacity>

        {/* Avatar with online dot */}
        <View className="relative">
          <Image source={{ uri: avatarUri }} className="w-10 h-10 rounded-full" />
          {isOnline && (
            <View
              className="absolute bottom-0 right-0 w-3 h-3 bg-primary-T40 rounded-full border-2 border-white"
            />
          )}
        </View>

        <View className="flex-1">
          <Text className="font-sans text-lg text-neutral-T10">{name}</Text>
          <Text className="font-label text-xs text-primary-T40">
            {isOnline ? t('chat.online') : t('chat.offline')}
          </Text>
        </View>

        <TouchableOpacity className="p-2">
          <Feather name="phone" size={20} color="#296C24" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
