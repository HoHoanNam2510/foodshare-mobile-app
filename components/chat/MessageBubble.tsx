import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

export type MessageType = 'text' | 'image' | 'location';

export interface Message {
  id: string;
  sender: 'me' | 'other';
  type: MessageType;
  text?: string;
  imageUri?: string;
  time: string;
  isRead?: boolean;
  location?: {
    name: string;
    subtitle: string;
    previewUri: string;
  };
}

interface MessageBubbleProps {
  message: Message;
  avatarUri: string;
}

export default function MessageBubble({ message, avatarUri }: MessageBubbleProps) {
  const isMe = message.sender === 'me';

  return (
    <View className={`flex-row mb-5 ${isMe ? 'justify-end' : 'justify-start'}`}>
      {!isMe && (
        <Image source={{ uri: avatarUri }} className="w-8 h-8 rounded-full mr-2 self-end" />
      )}

      <View className={`gap-1 ${isMe ? 'items-end' : 'items-start'}`} style={{ maxWidth: '80%' }}>
        {/* ── Text bubble ── */}
        {message.type === 'text' && (
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
        )}

        {/* ── Image bubble (received only) ── */}
        {message.type === 'image' && !isMe && (
          <View className="bg-neutral-T90 p-2 rounded-2xl">
            <Image
              source={{ uri: message.imageUri }}
              className="w-48 h-48 rounded-xl"
              resizeMode="cover"
            />
            {message.text ? (
              <View className="px-3 pt-2">
                <Text className="font-body text-sm text-neutral-T10">{message.text}</Text>
              </View>
            ) : null}
          </View>
        )}

        {/* ── Location card (received only) ── */}
        {message.type === 'location' && !isMe && message.location && (
          <View
            className="bg-white rounded-2xl overflow-hidden w-56"
            style={{
              shadowColor: '#191c1c',
              shadowOpacity: 0.06,
              shadowRadius: 8,
              elevation: 2,
              borderWidth: 1,
              borderColor: 'rgba(192,201,185,0.15)',
            }}
          >
            <View className="h-28 bg-neutral-T90 relative overflow-hidden">
              <Image
                source={{ uri: message.location.previewUri }}
                className="w-full h-full"
                resizeMode="cover"
                style={{ opacity: 0.6 }}
              />
              <View className="absolute inset-0 items-center justify-center">
                <Feather name="map-pin" size={28} color="#ba1a1a" />
              </View>
            </View>
            <View className="p-3 gap-2">
              <View>
                <Text className="font-sans text-sm text-neutral-T10">{message.location.name}</Text>
                <Text className="font-label text-xs text-neutral-T50 mt-0.5">
                  {message.location.subtitle}
                </Text>
              </View>
              <TouchableOpacity className="py-1.5 bg-neutral-T95 rounded-xl items-center">
                <Text className="font-label text-xs font-semibold text-primary-T40">Xem bản đồ</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ── Timestamp + read receipt ── */}
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
