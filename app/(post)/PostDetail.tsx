// app/(post)/PostDetail.tsx
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PostDetail() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleDelete = () => {
    Alert.alert(
      'Delete Listing',
      'Are you sure you want to delete this listing? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => router.back() },
      ]
    );
  };

  return (
    <View className="flex-1 bg-surface">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        {/* ── Ảnh Cover & Header Nổi ── */}
        <View className="relative w-full h-72">
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1587486913049-53fc88980cfc?w=800&q=80',
            }}
            className="w-full h-full"
            resizeMode="cover"
          />
          {/* Nút Back & Share */}
          <View
            className="absolute left-0 right-0 flex-row justify-between px-6"
            style={{ top: Math.max(insets.top, 20) }}
          >
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 bg-surface-lowest/90 rounded-full items-center justify-center"
            >
              <Feather name="arrow-left" size={20} color="#191c1c" />
            </TouchableOpacity>
            <TouchableOpacity className="w-10 h-10 bg-surface-lowest/90 rounded-full items-center justify-center">
              <Feather name="share" size={20} color="#191c1c" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Nội dung chi tiết ── */}
        <View className="bg-surface px-6 pt-6 -mt-8 rounded-t-3xl">
          {/* Người đăng */}
          <View className="flex-row items-center gap-3 mb-6">
            <Image
              source={{ uri: 'https://i.pravatar.cc/100?img=3' }}
              className="w-12 h-12 rounded-full"
            />
            <View>
              <Text className="font-body text-sm text-text-muted">
                Ho is giving away
              </Text>
              <Text className="font-sans text-2xl font-bold text-text leading-tight">
                Organic Eggs
              </Text>
            </View>
          </View>

          {/* Dữ liệu từ Model Post.ts & CreatePostP2P */}
          <View
            className="bg-surface-lowest rounded-3xl p-5 mb-6"
            style={{
              shadowColor: '#191c1c',
              shadowOpacity: 0.04,
              shadowRadius: 16,
              elevation: 2,
            }}
          >
            <View className="flex-row items-center gap-3 mb-4">
              <View className="w-10 h-10 bg-primary/20 rounded-full items-center justify-center">
                <Feather name="package" size={18} color="#296C24" />
              </View>
              <View>
                <Text className="font-body text-xs text-text-muted uppercase tracking-wider">
                  Quantity
                </Text>
                <Text className="font-body text-base font-bold text-text">
                  16 x items
                </Text>
              </View>
            </View>

            <View className="flex-row items-center gap-3 mb-4">
              <View className="w-10 h-10 bg-secondary/20 rounded-full items-center justify-center">
                <Feather name="clock" size={18} color="#EC8632" />
              </View>
              <View>
                <Text className="font-body text-xs text-text-muted uppercase tracking-wider">
                  Expiry Date (Perishable)
                </Text>
                <Text className="font-body text-base font-bold text-text">
                  28th Mar 2026, 18:00
                </Text>
              </View>
            </View>

            <View className="flex-row items-center gap-3 mb-4">
              <View className="w-10 h-10 bg-primary/20 rounded-full items-center justify-center">
                <Feather name="info" size={18} color="#296C24" />
              </View>
              <View className="flex-1">
                <Text className="font-body text-xs text-text-muted uppercase tracking-wider">
                  Description
                </Text>
                <Text className="font-body text-base text-text mt-1">
                  Fresh organic eggs from local farm. Box is slightly damaged
                  but eggs are perfectly fine.
                </Text>
              </View>
            </View>

            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 bg-primary/20 rounded-full items-center justify-center">
                <Feather name="calendar" size={18} color="#296C24" />
              </View>
              <View>
                <Text className="font-body text-xs text-text-muted uppercase tracking-wider">
                  Pick-up Times
                </Text>
                <Text className="font-body text-base font-bold text-text">
                  Today from 7pm - 9pm
                </Text>
              </View>
            </View>
          </View>

          {/* Map tĩnh */}
          <Text className="font-body text-xs text-text-muted uppercase tracking-wider mb-3">
            Location
          </Text>
          <View className="w-full h-32 bg-primary-light rounded-3xl items-center justify-center mb-8 overflow-hidden">
            {/* Giả lập Map. Nếu dùng react-native-maps thì gắn vào đây */}
            <Feather name="map" size={32} color="#72B866" opacity={0.5} />
            <Text className="font-body text-sm text-primary-dark mt-2 font-bold">
              12 Phan Văn Trị, Bình Thạnh
            </Text>
          </View>

          {/* ── Menu Action List ── */}
          <Text className="font-body text-xs text-text-muted uppercase tracking-wider mb-3">
            Manage Listing
          </Text>
          <View
            className="bg-surface-lowest rounded-3xl overflow-hidden"
            style={{
              shadowColor: '#191c1c',
              shadowOpacity: 0.04,
              shadowRadius: 16,
              elevation: 2,
            }}
          >
            <ActionRow icon="edit-2" label="Edit Listing" />
            <ActionRow icon="copy" label="Copy Listing" />
            <ActionRow icon="message-square" label="Messages" badge="2" />
            <ActionRow icon="check-circle" label="Mark as Booked" />
            <ActionRow icon="eye-off" label="Unlist" />
            {/* Nút Delete (Màu đỏ/hồng Tertiary) */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleDelete}
              className="flex-row items-center justify-between px-5 py-4 bg-tertiary/10"
            >
              <View className="flex-row items-center gap-4">
                <Feather name="trash-2" size={20} color="#EF86B5" />
                <Text
                  className="font-body text-base font-bold"
                  style={{ color: '#EF86B5' }}
                >
                  Delete Post
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// Sub-component cho các dòng Menu
const ActionRow = ({
  icon,
  label,
  badge,
}: {
  icon: any;
  label: string;
  badge?: string;
}) => (
  <TouchableOpacity
    activeOpacity={0.7}
    className="flex-row items-center justify-between px-5 py-4 border-b border-surface"
  >
    <View className="flex-row items-center gap-4">
      <Feather name={icon} size={20} color="#191c1c" />
      <Text className="font-body text-base text-text font-medium">{label}</Text>
    </View>
    <View className="flex-row items-center gap-3">
      {badge && (
        <View className="bg-secondary px-2 py-0.5 rounded-full">
          <Text className="font-body text-xs text-white font-bold">
            {badge}
          </Text>
        </View>
      )}
      <Feather name="chevron-right" size={18} color="#9ea99d" />
    </View>
  </TouchableOpacity>
);
