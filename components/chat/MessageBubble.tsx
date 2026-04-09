import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Image, Text, View } from 'react-native';

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

export default function MessageBubble({ message, avatarUri }: MessageBubbleProps) {
  const isMe = message.sender === 'me';

  return (
    <View className={`flex-row mb-5 ${isMe ? 'justify-end' : 'justify-start'}`}>
      {!isMe && avatarUri && (
        <Image source={{ uri: avatarUri }} className="w-8 h-8 rounded-full mr-2 self-end" />
      )}

      <View className={`gap-1 ${isMe ? 'items-end' : 'items-start'}`} style={{ maxWidth: '80%' }}>
        <View
          className={`px-5 py-3.5 ${
            isMe
              ? 'bg-primary-T40 rounded-3xl rounded-tr-sm'
              : 'bg-neutral-T90 rounded-3xl rounded-tl-sm'
          }`}
          style={
            isMe
              ? { shadowColor: '#191c1c', shadowOpacity: 0.1, shadowRadius: 8, elevation: 2 }
              : { shadowColor: '#191c1c', shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 }
          }
        >
          <Text className={`font-body text-base ${isMe ? 'text-white' : 'text-neutral-T10'}`}>
            {message.text}
          </Text>
        </View>

        <View className={`flex-row items-center gap-1 px-1 ${isMe ? 'flex-row-reverse' : ''}`}>
          <Text className="font-label text-[10px] text-neutral-T50">{message.time}</Text>
          {isMe && message.isRead && (
            <MaterialCommunityIcons name="check-all" size={13} color="#296C24" />
          )}
        </View>
      </View>
    </View>
  );
}
