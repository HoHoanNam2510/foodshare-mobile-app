// components/shared/SelectPostTypeModal.tsx
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Modal, Pressable, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type SelectPostTypeModalProps = {
  visible: boolean;
  onClose: () => void;
};

export default function SelectPostTypeModal({
  visible,
  onClose,
}: SelectPostTypeModalProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleSelect = (route: string) => {
    onClose(); // Đóng modal trước khi chuyển trang
    // Dùng setTimeout nhỏ để modal đóng mượt mà trước khi router push màn hình mới
    setTimeout(() => {
      router.push(route as any);
    }, 150);
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      {/* Lớp overlay đen mờ bao phủ toàn màn hình. Bấm vào đây để đóng modal */}
      <Pressable className="flex-1 bg-black/40 justify-end" onPress={onClose}>
        {/* Ngăn chặn sự kiện onPress lan truyền khi bấm vào phần nội dung trắng */}
        <Pressable onPress={(e) => e.stopPropagation()}>
          <View
            className="bg-surface-lowest rounded-t-3xl px-6 pt-3"
            style={{ paddingBottom: Math.max(insets.bottom, 24) + 16 }}
          >
            {/* Thanh drag handle nhỏ ở trên cùng (chỉ để trang trí cho giống Bottom Sheet) */}
            <View className="w-12 h-1.5 bg-gray-300 rounded-full self-center mb-6" />

            {/* Option 1: P2P Free Food */}
            <TouchableOpacity
              activeOpacity={0.7}
              className="flex-row items-center gap-4 py-4"
              onPress={() => handleSelect('/(post)/CreatePostP2P')}
            >
              <View className="w-14 h-14 rounded-full bg-primary items-center justify-center">
                <Feather name="heart" size={24} color="#FFFFFF" />
              </View>
              <View className="flex-1">
                <Text className="text-xl font-sans text-text font-bold mb-1">
                  Free food
                </Text>
                <Text className="text-sm font-body text-text-muted">
                  Give away free food/non-food
                </Text>
              </View>
              <Feather
                name="chevron-right"
                size={20}
                className="text-text-muted"
              />
            </TouchableOpacity>

            {/* Option 2: B2C Surprise Bag */}
            <TouchableOpacity
              activeOpacity={0.7}
              className="flex-row items-center gap-4 py-4 mt-2"
              onPress={() => handleSelect('/(post)/CreatePostB2C')}
            >
              <View className="w-14 h-14 rounded-full bg-secondary items-center justify-center">
                <Feather name="shopping-bag" size={24} color="#FFFFFF" />
              </View>
              <View className="flex-1">
                <Text className="text-xl font-sans text-text font-bold mb-1">
                  Surprise bag
                </Text>
                <Text className="text-sm font-body text-text-muted">
                  Sell surplus food bags
                </Text>
              </View>
              <Feather
                name="chevron-right"
                size={20}
                className="text-text-muted"
              />
            </TouchableOpacity>

            {/* Footer / Help link */}
            <TouchableOpacity
              activeOpacity={0.7}
              className="mt-8 items-center py-4 bg-surface rounded-2xl"
            >
              <Text className="text-sm font-body text-text font-semibold">
                🙋‍♀️ Help! What can I add?
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
