import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
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

export default function CreatePost() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Lấy params từ URL (được truyền từ SelectPostTypeModal)
  const { type } = useLocalSearchParams();
  // Kiểm tra xem có phải luồng B2C không
  const isB2C = type === 'SURPRISE_BAG';

  return (
    <SafeAreaView className="flex-1 bg-neutral">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* ─── Top Navigation Header ─── */}
        <View className="flex-row items-center w-full h-16 px-4 justify-between bg-neutral-T100 border-b-2 border-neutral-T80 z-50">
          <View className="flex-row items-center gap-3">
            <TouchableOpacity
              className="p-2 active:scale-95 transition-transform rounded-lg bg-neutral"
              onPress={() => router.back()}
            >
              <MaterialIcons name="arrow-back" size={24} color="#191C1C" />
            </TouchableOpacity>
            {/* Đổi tiêu đề động dựa trên loại bài đăng */}
            <Text className="font-headline font-extrabold tracking-tighter uppercase text-primary-T40 text-xl">
              {isB2C ? 'SHARE SURPRISE BAG' : 'SHARE MEAL'}
            </Text>
          </View>
          <View className="flex-row items-center gap-2">
            <Text className="font-label font-bold text-[10px] tracking-widest uppercase text-neutral-T50">
              DRAFT SAVED
            </Text>
          </View>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 24,
            paddingBottom: 60,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* ─── Media Uploader ─── */}
          <View className="mb-8 flex-col gap-3">
            <Text className="font-label text-xs font-bold tracking-widest uppercase text-neutral-T50 px-1">
              MEAL PHOTOS
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                gap: 16,
                paddingTop: 8,
                paddingRight: 8,
                paddingBottom: 8,
              }}
            >
              <TouchableOpacity className="w-32 h-32 border-2 border-dashed border-neutral-T80 bg-neutral-T100 rounded-xl flex-col items-center justify-center active:scale-95 transition-transform">
                <MaterialIcons name="add-a-photo" size={32} color="#C5C7C6" />
                <Text className="font-label text-[10px] mt-1 font-bold text-neutral-T50">
                  ADD PHOTO
                </Text>
              </TouchableOpacity>

              <View className="w-32 h-32 relative">
                <View className="w-full h-full border-2 border-neutral-T80 rounded-xl overflow-hidden">
                  <Image
                    source={{
                      uri: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80',
                    }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                </View>
                <TouchableOpacity className="absolute -top-2.5 -right-2.5 bg-[#ef4444] w-7 h-7 rounded-full border-2 border-neutral-T0 items-center justify-center active:scale-95 transition-transform z-10">
                  <MaterialIcons name="close" size={14} color="white" />
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>

          {/* ─── General Information ─── */}
          <View className="mb-8 flex-col gap-6">
            <View className="flex-col gap-2">
              <Text className="font-label text-xs font-bold tracking-widest uppercase text-neutral-T50 px-1">
                MEAL TITLE
              </Text>
              <TextInput
                className="w-full bg-neutral-T100 border-2 border-neutral-T80 rounded-xl p-4 font-body text-base text-neutral-T10"
                placeholder="What are you sharing today?"
                placeholderTextColor="#AAABAB"
              />
            </View>

            <View className="flex-row gap-4">
              <View className="flex-1 flex-col gap-2">
                <Text className="font-label text-xs font-bold tracking-widest uppercase text-neutral-T50 px-1">
                  CATEGORY
                </Text>
                <TouchableOpacity className="w-full bg-neutral-T100 border-2 border-neutral-T80 rounded-xl p-4 flex-row items-center justify-between">
                  <Text className="font-body text-base text-neutral-T10">
                    Home Cooked
                  </Text>
                  <MaterialIcons name="expand-more" size={24} color="#191C1C" />
                </TouchableOpacity>
              </View>

              <View className="flex-1 flex-col gap-2">
                <Text className="font-label text-xs font-bold tracking-widest uppercase text-neutral-T50 px-1">
                  QUANTITY (PORTIONS)
                </Text>
                <View className="flex-row items-center border-2 border-neutral-T80 rounded-xl bg-neutral-T100 overflow-hidden">
                  <TouchableOpacity className="p-4 active:bg-neutral-T95">
                    <MaterialIcons name="remove" size={20} color="#191C1C" />
                  </TouchableOpacity>
                  <TextInput
                    className="flex-1 text-center font-headline font-extrabold text-lg text-neutral-T10 p-0"
                    keyboardType="numeric"
                    value="1"
                  />
                  <TouchableOpacity className="p-4 active:bg-neutral-T95">
                    <MaterialIcons name="add" size={20} color="#191C1C" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* ─── NẾU LÀ B2C THÌ HIỂN THỊ TRƯỜNG NHẬP GIÁ (PRICE) ─── */}
            {isB2C && (
              <View className="flex-col gap-2">
                <Text className="font-label text-xs font-bold tracking-widest uppercase text-neutral-T50 px-1">
                  PRICE ($)
                </Text>
                <TextInput
                  className="w-full bg-neutral-T100 border-2 border-neutral-T80 rounded-xl p-4 font-headline font-extrabold text-lg text-neutral-T10"
                  placeholder="0.00"
                  placeholderTextColor="#AAABAB"
                  keyboardType="decimal-pad"
                />
              </View>
            )}

            <View className="flex-col gap-2">
              <Text className="font-label text-xs font-bold tracking-widest uppercase text-neutral-T50 px-1">
                DESCRIPTION
              </Text>
              <TextInput
                className="w-full bg-neutral-T100 border-2 border-neutral-T80 rounded-xl p-4 font-body text-base text-neutral-T10"
                placeholder="Mention ingredients, dietary info, or reason for sharing..."
                placeholderTextColor="#AAABAB"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                style={{ minHeight: 100 }}
              />
            </View>
          </View>

          {/* ─── Logistics Section ─── */}
          <View className="mb-8 flex-col gap-6">
            <Text className="font-headline text-2xl font-extrabold tracking-tighter uppercase border-b-2 border-neutral-T80 pb-2 text-neutral-T10">
              LOGISTICS
            </Text>

            <View className="flex-row gap-4">
              <View className="flex-1 flex-col gap-2">
                <Text className="font-label text-xs font-bold tracking-widest uppercase text-neutral-T50 px-1">
                  PICKUP START
                </Text>
                <TouchableOpacity className="w-full bg-neutral-T100 border-2 border-neutral-T80 rounded-xl p-4 flex-row items-center justify-between">
                  <Text className="font-body text-base text-neutral-T10">
                    17:00
                  </Text>
                  <MaterialIcons name="schedule" size={20} color="#AAABAB" />
                </TouchableOpacity>
              </View>
              <View className="flex-1 flex-col gap-2">
                <Text className="font-label text-xs font-bold tracking-widest uppercase text-neutral-T50 px-1">
                  PICKUP END
                </Text>
                <TouchableOpacity className="w-full bg-neutral-T100 border-2 border-neutral-T80 rounded-xl p-4 flex-row items-center justify-between">
                  <Text className="font-body text-base text-neutral-T10">
                    20:00
                  </Text>
                  <MaterialIcons name="history" size={20} color="#AAABAB" />
                </TouchableOpacity>
              </View>
            </View>

            <View className="flex-col gap-2">
              <Text className="font-label text-xs font-bold tracking-widest uppercase text-neutral-T50 px-1">
                EXPIRY DATE
              </Text>
              <TouchableOpacity className="w-full bg-neutral-T100 border-2 border-neutral-T80 rounded-xl p-4 flex-row items-center justify-between">
                <Text className="font-body text-base text-neutral-T10">
                  2023-10-27
                </Text>
                <MaterialIcons name="event-busy" size={20} color="#AAABAB" />
              </TouchableOpacity>
            </View>
          </View>

          {/* ─── Location Section ─── */}
          <View className="mb-8 flex-col gap-4">
            <View className="flex-row justify-between items-end">
              <Text className="font-label text-xs font-bold tracking-widest uppercase text-neutral-T50 px-1">
                PICKUP LOCATION
              </Text>
              <TouchableOpacity>
                <Text className="font-label text-[10px] font-black uppercase text-primary underline">
                  CHANGE ADDRESS
                </Text>
              </TouchableOpacity>
            </View>

            <View className="w-full h-48 border-2 border-neutral-T80 rounded-2xl overflow-hidden relative items-center justify-center">
              <View className="absolute inset-0 bg-[#e8f0e6]" />
              <MaterialIcons name="location-on" size={48} color="#72B866" />

              <View className="absolute bottom-3 left-3 right-3 bg-neutral-T100 border-2 border-neutral-T80 p-3 rounded-xl flex-row items-center gap-3">
                <MaterialIcons name="home" size={20} color="#72B866" />
                <Text
                  className="font-body text-xs font-bold text-neutral-T10 flex-1"
                  numberOfLines={1}
                >
                  245 Editorial Ave, Food District, NY
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ─── Fixed Action Button Footer ─── */}
      <View
        className="absolute bottom-0 left-0 right-0 bg-neutral border-t-2 border-neutral-T80"
        style={{
          paddingBottom: Math.max(insets.bottom, 16),
          paddingTop: 16,
          paddingHorizontal: 16,
        }}
      >
        <View className="flex-row gap-4">
          <TouchableOpacity className="flex-1 bg-neutral-T100 border-2 border-neutral-T80 rounded-xl p-4 items-center justify-center active:scale-95 transition-transform">
            <Text className="font-label font-black text-sm uppercase text-neutral-T10 text-center">
              SAVE DRAFT
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 bg-primary-T40 border-2 border-primary-T40 rounded-xl p-4 items-center justify-center flex-row gap-2 active:scale-95 transition-transform"
            onPress={() => router.push('/(post)/post-list' as any)}
          >
            <Text className="font-label font-black text-sm uppercase text-neutral-T100 text-center">
              PUBLISH MEAL
            </Text>
            <MaterialIcons name="send" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
