import { useLocalSearchParams } from 'expo-router';
import React, { useRef } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ChatHeader from '@/components/chat/ChatHeader';
import ChatInput from '@/components/chat/ChatInput';
import MessageBubble, { Message } from '@/components/chat/MessageBubble';

const AVATAR_URI = 'https://i.pravatar.cc/150?img=11';

const MOCK_MESSAGES: Message[] = [
  {
    id: '1',
    sender: 'other',
    type: 'text',
    text: 'Hi bạn, mình thấy bó rau xà lách bạn share.',
    time: '10:30 SA',
  },
  {
    id: '2',
    sender: 'other',
    type: 'text',
    text: 'Rau còn tươi không bạn ơi? Nhà mình ngay gần.',
    time: '10:30 SA',
  },
  {
    id: '3',
    sender: 'me',
    type: 'text',
    text: 'Hi Nam! Rau mình vừa hái sáng nay, tươi rói nha.',
    time: '10:32 SA',
    isRead: true,
  },
  {
    id: '4',
    sender: 'me',
    type: 'text',
    text: 'Bạn qua lấy lúc nào cũng được, mình ở nhà cả ngày.',
    time: '10:32 SA',
    isRead: true,
  },
  {
    id: '5',
    sender: 'other',
    type: 'image',
    imageUri: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
    text: 'Đây là rau mình đang cần nè bạn, giống không?',
    time: '10:33 SA',
  },
  {
    id: '6',
    sender: 'other',
    type: 'location',
    time: '10:34 SA',
    location: {
      name: '12 Nguyễn Thị Minh Khai',
      subtitle: 'Cổng chung cư The Garden',
      previewUri: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=400',
    },
  },
  {
    id: '7',
    sender: 'me',
    type: 'text',
    text: 'Ok bạn, 7pm mình ghé lấy nhé. Giống y chang rồi 😄',
    time: '10:36 SA',
    isRead: false,
  },
];

export default function ChatDetailScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const scrollRef = useRef<ScrollView>(null);

  return (
    <View className="flex-1 bg-neutral">
      <ChatHeader
        name={(params.name as string) || 'Hồ Hoàn Nam'}
        avatarUri={AVATAR_URI}
        isOnline
      />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          ref={scrollRef}
          className="flex-1 px-6 pt-4"
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
          contentContainerStyle={{ paddingBottom: 8 }}
        >
          {/* Date separator */}
          <View className="items-center my-4">
            <View className="bg-neutral-T95 rounded-full px-4 py-1">
              <Text className="font-label text-xs text-neutral-T50 uppercase tracking-widest">
                Hôm nay
              </Text>
            </View>
          </View>

          {MOCK_MESSAGES.map((msg) => (
            <MessageBubble key={msg.id} message={msg} avatarUri={AVATAR_URI} />
          ))}
        </ScrollView>

        <View style={{ paddingBottom: Math.max(insets.bottom, 8) }}>
          <ChatInput />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
