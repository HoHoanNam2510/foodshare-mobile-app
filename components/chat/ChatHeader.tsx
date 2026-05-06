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

export default function ChatHeader({
  name,
  avatarUri,
  isOnline = true,
}: ChatHeaderProps) {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <SafeAreaView
      edges={['top']}
      className="z-10 bg-white"
      style={{
        shadowColor: '#191c1c',
        shadowOpacity: 0.06,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 12,
        elevation: 4,
      }}
    >
      <View className="flex-row items-center gap-4 px-6 py-3">
        <TouchableOpacity onPress={() => router.back()} className="-ml-2 p-2">
          <Feather name="arrow-left" size={22} color="#191c1c" />
        </TouchableOpacity>

        {/* Avatar with online dot */}
        <View className="relative">
          <Image
            source={{ uri: avatarUri }}
            className="h-10 w-10 rounded-full"
          />
          {isOnline && (
            <View className="bg-primary-T40 absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white" />
          )}
        </View>

        <View className="flex-1">
          <Text className="text-neutral-T10 font-sans text-lg">{name}</Text>
          <Text className="font-label text-primary-T40 text-xs">
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
