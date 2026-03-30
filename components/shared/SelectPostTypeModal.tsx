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

  const handleSelect = (postType: 'FREE_FOOD' | 'SURPRISE_BAG') => {
    onClose(); // Đóng modal trước khi chuyển trang
    // Dùng setTimeout nhỏ để modal đóng mượt mà trước khi router push màn hình mới
    setTimeout(() => {
      // ── 3. ĐIỀU HƯỚNG SANG MÀN HÌNH HỢP NHẤT CreatePost VÀ TRUYỀN TYPE PROP ──
      router.push({
        pathname: '/(post)/create-post' as any,
        params: { type: postType }, // Truyền prop type để CreatePost nhận biết
      });
    }, 150);
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 bg-neutral-T10/70 justify-end"
        onPress={onClose}
      >
        <Pressable onPress={(e) => e.stopPropagation()}>
          <View
            // FLAT DESIGN: Nền trắng tuyệt đối, góc bo xl cứng, không shadow, viền t-2 bao phủ
            className="bg-neutral-T100 rounded-t-3xl px-6 pt-4 border-t-2 border-neutral-T90 shadow-none"
            style={{ paddingBottom: Math.max(insets.bottom, 24) + 16 }}
          >
            {/* Thanh drag handle (vuông vức hơn) */}
            <View className="w-12 h-1.5 bg-neutral-T80 rounded-md self-center mb-8" />

            {/* ── Option 1: P2P Free Food ── */}
            <TouchableOpacity
              activeOpacity={0.9}
              className="flex-row items-center gap-4 py-4 px-4 mb-4 bg-neutral-T100 border-2 border-neutral-T90 rounded-2xl active:scale-95 transition-transform"
              // Truyền type 'FREE_FOOD' cho logic P2P
              onPress={() => handleSelect('FREE_FOOD')}
            >
              <View className="w-14 h-14 rounded-xl bg-primary-T40 items-center justify-center border-2 border-primary-T30">
                <Feather name="heart" size={24} color="#FFFFFF" />
              </View>
              <View className="flex-1">
                <Text
                  className="text-lg font-sans text-neutral-T10 leading-tight mb-0.5"
                  style={{ fontWeight: '800' }}
                >
                  Free food
                </Text>
                <Text className="text-sm font-body text-neutral-T50">
                  Give away free food
                </Text>
              </View>
              <Feather name="arrow-right" size={20} color="#191C1C" />
            </TouchableOpacity>

            {/* ── Option 2: B2C Surprise Bag ── */}
            <TouchableOpacity
              activeOpacity={0.9}
              className="flex-row items-center gap-4 py-4 px-4 mb-2 bg-neutral-T100 border-2 border-neutral-T90 rounded-2xl active:scale-95 transition-transform"
              // Truyền type 'SURPRISE_BAG' cho logic B2C
              onPress={() => handleSelect('SURPRISE_BAG')}
            >
              <View className="w-14 h-14 rounded-xl bg-secondary-T40 items-center justify-center border-2 border-secondary-T30">
                <Feather name="shopping-bag" size={24} color="#FFFFFF" />
              </View>
              <View className="flex-1">
                <Text
                  className="text-lg font-sans text-neutral-T10 leading-tight mb-0.5"
                  style={{ fontWeight: '800' }}
                >
                  Surprise bag
                </Text>
                <Text className="text-sm font-body text-neutral-T50">
                  Sell surplus food bags
                </Text>
              </View>
              <Feather name="arrow-right" size={20} color="#191C1C" />
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
