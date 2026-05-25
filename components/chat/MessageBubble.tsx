import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Image, Text, View } from 'react-native';
import { useThemeColors } from '@/lib/hooks/useThemeColors';

export interface Message {
  id: string;
  sender: 'me' | 'other';
  text: string;
  time: string;
  isRead?: boolean;
}

interface MessageBubbleProps {
  message: Message;
  avatarUri?: string;
}

export default function MessageBubble({
  message,
  avatarUri,
}: MessageBubbleProps) {
  const isMe = message.sender === 'me';
  const colors = useThemeColors();

  return (
    <View className={`mb-5 flex-row ${isMe ? 'justify-end' : 'justify-start'}`}>
      {!isMe && avatarUri && (
        <Image
          source={{ uri: avatarUri }}
          className="mr-2 h-8 w-8 self-end rounded-full"
        />
      )}

      <View
        className={`gap-1 ${isMe ? 'items-end' : 'items-start'}`}
        style={{ maxWidth: '80%' }}
      >
        <View
          className={`px-5 py-3.5 ${
            isMe
              ? 'bg-primary-T40 dark:bg-primary-T50 rounded-3xl rounded-tr-sm'
              : 'bg-neutral-T90 dark:bg-neutral-T30 rounded-3xl rounded-tl-sm'
          }`}
          style={
            isMe
              ? {
                  shadowColor: '#191c1c',
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 2,
                }
              : {
                  shadowColor: '#191c1c',
                  shadowOpacity: 0.05,
                  shadowRadius: 4,
                  elevation: 1,
                }
          }
        >
          <Text
            className={`font-body text-base ${isMe ? 'text-white' : 'text-neutral-T10 dark:text-neutral-T90'}`}
          >
            {message.text}
          </Text>
        </View>

        <View
          className={`flex-row items-center gap-1 px-1 ${isMe ? 'flex-row-reverse' : ''}`}
        >
          <Text className="font-label text-neutral-T50 dark:text-neutral-T60 text-[10px]">
            {message.time}
          </Text>
          {isMe && message.isRead && (
            <MaterialCommunityIcons
              name="check-all"
              size={13}
              color={colors.primaryGreen}
            />
          )}
        </View>
      </View>
    </View>
  );
}
