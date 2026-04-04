// app/(tabs)/chat.tsx  –  Messages · Soft Elevation Rebuild
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// ─── MOCK DATA ───────────────────────────────────────────────────────────────

const ACTIVE_CONTACTS = [
  {
    id: 'a1',
    name: 'You',
    avatar: 'https://i.pravatar.cc/150?img=68',
    isMe: true,
  },
  {
    id: 'a2',
    name: 'Martin',
    avatar: 'https://i.pravatar.cc/150?img=11',
    online: true,
  },
  {
    id: 'a3',
    name: 'Karen',
    avatar: 'https://i.pravatar.cc/150?img=5',
    online: true,
  },
  {
    id: 'a4',
    name: 'Andrew',
    avatar: 'https://i.pravatar.cc/150?img=12',
    online: false,
  },
  {
    id: 'a5',
    name: 'Maisy',
    avatar: 'https://i.pravatar.cc/150?img=33',
    online: true,
  },
  {
    id: 'a6',
    name: 'Lena',
    avatar: 'https://i.pravatar.cc/150?img=45',
    online: false,
  },
];

const MOCK_CHATS = [
  {
    id: '1',
    name: 'Martin Randolph',
    message: "What's up man! Did you see the salad post?",
    time: '9:40 AM',
    unread: 2,
    avatar: 'https://i.pravatar.cc/150?img=11',
    online: true,
  },
  {
    id: '2',
    name: 'Andrew Parker',
    message: 'You: Ok, thanks for the sourdough!',
    time: '9:25 AM',
    unread: 0,
    avatar: 'https://i.pravatar.cc/150?img=12',
    online: false,
  },
  {
    id: '3',
    name: 'Karen Castillo',
    message: 'You: Ok, See you in Town Square at 7...',
    time: 'Fri',
    unread: 0,
    avatar: 'https://i.pravatar.cc/150?img=5',
    online: true,
  },
  {
    id: '4',
    name: 'Maisy Humphrey',
    message: 'Have a good day! 🌿',
    time: 'Thu',
    unread: 1,
    avatar: 'https://i.pravatar.cc/150?img=33',
    online: false,
  },
  {
    id: '5',
    name: 'Noah Bennett',
    message: 'You: The garden mix was perfect, merci!',
    time: 'Wed',
    unread: 0,
    avatar: 'https://i.pravatar.cc/150?img=15',
    online: false,
  },
];

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────

function ActiveAvatar({ item }: { item: (typeof ACTIVE_CONTACTS)[number] }) {
  return (
    <TouchableOpacity
      activeOpacity={0.75}
      className="items-center gap-1.5 mr-5"
    >
      <View className="relative">
        {item.isMe ? (
          <View className="relative">
            <Image
              source={{ uri: item.avatar }}
              className="w-[52px] h-[52px] rounded-full"
            />
            <View className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-primary-T40 rounded-full items-center justify-center border-2 border-neutral-T100">
              <Feather name="plus" size={10} color="white" />
            </View>
          </View>
        ) : (
          <View>
            <View
              className={`p-[2.5px] rounded-full ${item.online ? 'bg-primary-T40' : 'bg-neutral-T80'}`}
            >
              <Image
                source={{ uri: item.avatar }}
                className="w-[48px] h-[48px] rounded-full border-2 border-neutral-T100"
              />
            </View>
            {item.online && (
              <View className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-primary-T40 border-2 border-neutral-T100" />
            )}
          </View>
        )}
      </View>
      <Text
        className="font-body text-[11px] text-neutral-T50"
        numberOfLines={1}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );
}

function ChatCard({
  chat,
  onPress,
}: {
  chat: (typeof MOCK_CHATS)[number];
  onPress: () => void;
}) {
  const hasUnread = chat.unread > 0;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      className="mx-5 mb-3 bg-neutral-T100 rounded-2xl px-4 py-3.5 flex-row items-center shadow-sm active:opacity-80"
    >
      {/* Avatar + online dot */}
      <View className="relative mr-3.5">
        <Image
          source={{ uri: chat.avatar }}
          className="w-[54px] h-[54px] rounded-full"
        />
        {chat.online && (
          <View className="absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full bg-primary-T40 border-2 border-neutral-T100" />
        )}
      </View>

      {/* Text content */}
      <View className="flex-1 justify-center">
        <View className="flex-row justify-between items-baseline mb-1">
          <Text
            className="font-body text-[15px] text-neutral-T10 flex-1 mr-2"
            style={{ fontWeight: hasUnread ? '700' : '400' }}
            numberOfLines={1}
          >
            {chat.name}
          </Text>
          <Text
            className={`font-label text-[11px] ${hasUnread ? 'text-primary-T40' : 'text-neutral-T50'}`}
            style={{ fontWeight: hasUnread ? '600' : '400' }}
          >
            {chat.time}
          </Text>
        </View>

        <View className="flex-row justify-between items-center">
          <Text
            className={`font-body text-[13px] flex-1 mr-2 ${hasUnread ? 'text-neutral-T30' : 'text-neutral-T50'}`}
            style={{ fontWeight: hasUnread ? '500' : '400' }}
            numberOfLines={1}
          >
            {chat.message}
          </Text>

          {hasUnread ? (
            <View className="min-w-[20px] h-5 bg-primary-T40 rounded-full items-center justify-center px-1.5">
              <Text
                className="font-label text-[10px] text-neutral-T100"
                style={{ fontWeight: '700' }}
              >
                {chat.unread}
              </Text>
            </View>
          ) : (
            <Feather name="check-circle" size={15} color="#AAABAB" />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── MAIN SCREEN ──────────────────────────────────────────────────────────────

export default function ChatListScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const filtered = query.trim()
    ? MOCK_CHATS.filter(
        (c) =>
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          c.message.toLowerCase().includes(query.toLowerCase())
      )
    : MOCK_CHATS;

  return (
    <SafeAreaView className="flex-1 bg-neutral" edges={['top']}>
      {/* ── Header ── */}
      <View className="flex-row items-center justify-between px-5 pt-3 pb-2">
        <Text
          className="font-sans text-[28px] text-neutral-T10"
          style={{ fontWeight: '700', letterSpacing: -0.5 }}
        >
          Messages
        </Text>
        <View className="flex-row items-center gap-3">
          <TouchableOpacity
            activeOpacity={0.7}
            className="w-9 h-9 bg-neutral-T95 rounded-full items-center justify-center active:opacity-70"
          >
            <Feather name="edit" size={17} color="#296C24" />
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.8} className="active:opacity-70">
            <Image
              source={{ uri: 'https://i.pravatar.cc/150?img=68' }}
              className="w-9 h-9 rounded-full"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Search Bar ── */}
      <View className="px-5 mb-4">
        <View className="flex-row items-center bg-neutral-T100 rounded-xl px-4 py-5 shadow-sm border border-neutral-T90">
          <Feather name="search" size={18} color="#AAABAB" />
          <TextInput
            placeholder="Search messages…"
            placeholderTextColor="#AAABAB"
            value={query}
            onChangeText={setQuery}
            className="flex-1 ml-2.5 font-body text-[14px] text-neutral-T10"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} activeOpacity={0.7}>
              <Feather name="x" size={16} color="#AAABAB" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* ── Active Now ── */}
        {!query && (
          <View className="mb-5">
            <View className="flex-row justify-between items-center px-5 mb-3">
              <Text className="font-body-semibold text-[13px] text-neutral-T50">
                Active now
              </Text>
              <TouchableOpacity
                activeOpacity={0.7}
                className="active:opacity-70"
              >
                <Text
                  className="font-body text-[13px] text-primary-T40"
                  style={{ fontWeight: '600' }}
                >
                  See all
                </Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: 20,
                paddingVertical: 4,
              }}
            >
              {ACTIVE_CONTACTS.map((contact) => (
                <ActiveAvatar key={contact.id} item={contact} />
              ))}
            </ScrollView>
          </View>
        )}

        {/* ── Section label ── */}
        <View className="flex-row justify-between items-center px-5 mb-3">
          <Text className="font-body-semibold text-[13px] text-neutral-T50">
            {query ? `Results for "${query}"` : 'Recent'}
          </Text>
          {!query && (
            <TouchableOpacity activeOpacity={0.7} className="active:opacity-70">
              <Text
                className="font-body text-[13px] text-primary-T40"
                style={{ fontWeight: '600' }}
              >
                Filter
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── Chat Cards ── */}
        {filtered.length > 0 ? (
          filtered.map((chat) => (
            <ChatCard
              key={chat.id}
              chat={chat}
              onPress={() =>
                router.push({
                  pathname: '/(chat)/chat-detail' as any,
                  params: { id: chat.id, name: chat.name },
                })
              }
            />
          ))
        ) : (
          <View className="items-center mt-16 px-8">
            <View className="w-16 h-16 bg-neutral-T95 rounded-full items-center justify-center mb-4">
              <Feather name="message-circle" size={28} color="#AAABAB" />
            </View>
            <Text
              className="font-body text-[15px] text-neutral-T10 mb-1"
              style={{ fontWeight: '700' }}
            >
              No conversations found
            </Text>
            <Text className="font-body text-[13px] text-neutral-T50 text-center">
              Try a different name or keyword.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
