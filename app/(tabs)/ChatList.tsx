// app/(tabs)/ChatList.tsx
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// ─── MOCK DATA ───
const MOCK_CHATS = [
  {
    id: '1',
    name: 'Martin Randolph',
    message: "You: What's man!",
    time: '9:40 AM',
    unread: true,
    avatar: 'https://i.pravatar.cc/150?img=11',
  },
  {
    id: '2',
    name: 'Andrew Parker',
    message: 'You: Ok, thanks!',
    time: '9:25 AM',
    unread: false,
    avatar: 'https://i.pravatar.cc/150?img=12',
  },
  {
    id: '3',
    name: 'Karen Castillo',
    message: 'You: Ok, See you in To...',
    time: 'Fri',
    unread: false,
    avatar: 'https://i.pravatar.cc/150?img=5',
  },
  {
    id: '4',
    name: 'Maisy Humphrey',
    message: 'Have a good day, Maisy!',
    time: 'Fri',
    unread: false,
    avatar: 'https://i.pravatar.cc/150?img=33',
  },
];

export default function ChatListScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top']}>
      {/* ── Header ── */}
      <View className="flex-row items-center justify-between px-6 py-4">
        <View className="flex-row items-center gap-4">
          <TouchableOpacity activeOpacity={0.7} className="p-1 -ml-1">
            <Feather name="menu" size={24} color="#296C24" />
          </TouchableOpacity>
          <Text className="font-sans text-3xl font-bold text-primary-dark tracking-tight">
            Messages
          </Text>
        </View>
        <TouchableOpacity activeOpacity={0.8}>
          <Image
            source={{ uri: 'https://i.pravatar.cc/150?img=68' }}
            className="w-10 h-10 rounded-full"
          />
        </TouchableOpacity>
      </View>

      {/* ── Search Bar ── */}
      <View className="px-6 mb-2">
        <View className="flex-row items-center bg-surface-container rounded-2xl px-4 py-3">
          <Feather name="search" size={20} color="#9ea99d" />
          <TextInput
            placeholder="Search"
            placeholderTextColor="#9ea99d"
            className="flex-1 ml-3 font-body text-base text-text"
          />
        </View>
      </View>

      {/* ── Chat List ── */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100, paddingTop: 8 }}
      >
        {MOCK_CHATS.map((chat) => (
          <TouchableOpacity
            key={chat.id}
            activeOpacity={0.6}
            onPress={() =>
              router.push({
                pathname: '/(post)/ChatDetail' as any,
                params: { id: chat.id, name: chat.name },
              })
            }
            // The No-Line Rule: Dùng padding rộng để phân cách tự nhiên
            className="flex-row items-center px-6 py-3.5"
          >
            {/* Avatar */}
            <Image
              source={{ uri: chat.avatar }}
              className="w-[60px] h-[60px] rounded-full mr-4"
            />

            {/* Content */}
            <View className="flex-1 justify-center">
              <View className="flex-row justify-between items-center mb-1">
                <Text className="font-body text-[15px] font-bold text-text truncate">
                  {chat.name}
                </Text>

                {/* Trạng thái tin nhắn: Dấu chấm xanh (Chưa đọc) hoặc Dấu tick (Đã đọc) */}
                {chat.unread ? (
                  <View className="w-2.5 h-2.5 rounded-full bg-primary-dark" />
                ) : (
                  <Feather name="check-circle" size={16} color="#c0c9b9" />
                )}
              </View>

              <Text
                className="font-body text-[13px] text-text-muted truncate"
                numberOfLines={1}
              >
                {chat.message} · {chat.time}
              </Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* ── Ad / Special Item (Như trong HTML template) ── */}
        <TouchableOpacity
          activeOpacity={0.8}
          className="mx-6 mt-4 p-4 bg-surface-lowest rounded-2xl flex-row items-center gap-4"
          style={{
            shadowColor: '#191c1c',
            shadowOpacity: 0.04,
            shadowRadius: 12,
            elevation: 2,
          }}
        >
          <View className="w-12 h-12 bg-surface rounded-xl items-center justify-center">
            <Feather name="grid" size={24} color="#296C24" />
          </View>
          <View className="flex-1">
            <View className="flex-row items-center gap-2 mb-1">
              <Text className="font-body text-[14px] font-bold text-text">
                Editorial Harvest
              </Text>
              <View className="bg-surface-container px-1.5 py-0.5 rounded">
                <Text className="font-body text-[10px] font-bold text-text-muted uppercase tracking-wider">
                  Ad
                </Text>
              </View>
            </View>
            <Text
              className="font-body text-[12px] text-text-muted mb-1"
              numberOfLines={1}
            >
              Harvest the best of the season...
            </Text>
            <Text className="font-body text-[12px] font-bold text-primary-dark">
              Learn More
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
