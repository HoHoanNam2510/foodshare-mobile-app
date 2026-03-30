// app/(post)/ChatDetail.tsx
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

// ─── MOCK DATA (Conversation) ───
const MOCK_MESSAGES = [
  {
    id: '1',
    sender: 'other',
    text: 'Hi bạn, mình thấy bó rau xà lách bạn share.',
    time: '10:30 AM',
  },
  {
    id: '2',
    sender: 'other',
    text: 'Rau còn tươi không bạn ơi? Nhà mình ngay gần.',
    time: '10:30 AM',
  },
  {
    id: '3',
    sender: 'me',
    text: 'Hi Nam! Rau mình vừa hái sáng nay, tươi rói nha.',
    time: '10:32 AM',
  },
  {
    id: '4',
    sender: 'me',
    text: 'Bạn qua lấy lúc nào cũng được, mình ở nhà cả ngày.',
    time: '10:32 AM',
  },
  {
    id: '5',
    sender: 'other',
    text: 'Ok bạn, 7pm mình ghé lấy trứng nha.',
    time: '10:35 AM',
  }, // Last message from list
  {
    id: '6',
    sender: 'me',
    text: 'Ghé lấy rau chứ, nhầm sang trứng rồi haha 😂',
    time: '10:36 AM',
  },
];

export default function ChatDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams(); // Lấy params id, name từ List
  const [message, setMessage] = useState('');

  return (
    <View className="flex-1 bg-surface">
      {/* ── Sticky Header (Surface Lowest - elevated) ── */}
      <SafeAreaView
        edges={['top']}
        className="bg-surface-lowest shadow-sm z-10"
        style={{
          shadowColor: '#191c1c',
          shadowOpacity: 0.05,
          shadowRadius: 10,
          elevation: 3,
        }}
      >
        <View className="flex-row items-center gap-4 px-6 py-3">
          <TouchableOpacity onPress={() => router.back()} className="p-1">
            <Feather name="arrow-left" size={22} color="#191c1c" />
          </TouchableOpacity>

          <Image
            source={{ uri: 'https://i.pravatar.cc/150?img=11' }}
            className="w-10 h-10 rounded-full"
          />

          <View className="flex-1">
            <Text className="font-body-semibold text-lg text-text">
              {params.name || 'Ho Hoàn Nam'}
            </Text>
            <Text className="font-body text-xs text-primary-dark">
              Active now
            </Text>
          </View>

          <TouchableOpacity className="p-1">
            <Feather name="phone" size={20} color="#296C24" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* ── Message Area ── */}
      <ScrollView
        className="flex-1 px-6 pt-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <Text className="font-label text-xs text-text-muted text-center my-4 uppercase tracking-widest">
          Today
        </Text>

        {MOCK_MESSAGES.map((msg) => {
          const isMe = msg.sender === 'me';
          return (
            <View
              key={msg.id}
              className={`flex-row mb-5 ${isMe ? 'justify-end' : 'justify-start'}`}
            >
              {!isMe && (
                <Image
                  source={{ uri: 'https://i.pravatar.cc/150?img=11' }}
                  className="w-8 h-8 rounded-full mr-2 self-end"
                />
              )}
              <View className="gap-1">
                <View
                  // COLOR RULES: Me = Primary, Other = Surface Container. No Line Rule.
                  className={`px-5 py-3.5 ${isMe ? 'bg-primary rounded-br-lg rounded-t-3xl rounded-bl-3xl' : 'bg-surface-container rounded-bl-lg rounded-t-3xl rounded-br-3xl'} max-w-[80%]`}
                >
                  <Text
                    className={`font-body text-base ${isMe ? 'text-white' : 'text-text'}`}
                  >
                    {msg.text}
                  </Text>
                </View>
                {/* Timestamp (Label style) */}
                <Text
                  className={`font-label text-xs text-text-muted ${isMe ? 'text-right' : 'ml-2'}`}
                >
                  {msg.time}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* ── Input Area (Sticky - Floating Style) ── */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View
          // FLOATING STYLE: bg-lowest, rounded, shadow-soft
          className="flex-row items-center gap-3 bg-surface-lowest px-5 py-3 m-4 rounded-full shadow-soft"
          style={{
            bottom: Math.max(insets.bottom, 10),
            shadowColor: '#191c1c',
            shadowOpacity: 0.08,
            shadowRadius: 15,
            elevation: 5,
          }}
        >
          <TouchableOpacity className="p-1">
            <Feather name="image" size={20} color="#6b7a6a" />
          </TouchableOpacity>

          <TextInput
            placeholder="Type a message..."
            placeholderTextColor="#9ea99d"
            value={message}
            onChangeText={setMessage}
            multiline
            className="flex-1 font-body text-base text-text bg-surface rounded-full px-5 py-2.5 max-h-24"
          />

          {message.trim().length > 0 ? (
            <TouchableOpacity className="w-10 h-10 bg-primary rounded-full items-center justify-center">
              <Feather name="send" size={18} color="white" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity className="p-1">
              <Feather name="mic" size={20} color="#6b7a6a" />
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
