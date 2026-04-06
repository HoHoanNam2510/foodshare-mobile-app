// components/shared/SelectPostTypeModal.tsx
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Modal, Pressable, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type PostType = 'FREE_FOOD' | 'SURPRISE_BAG';
type UserRole = 'USER' | 'STORE' | 'ADMIN';

// USER chỉ tạo P2P (FREE_FOOD), STORE chỉ tạo B2C (SURPRISE_BAG)
const ALLOWED_POST_TYPE: Record<UserRole, PostType> = {
  USER:  'FREE_FOOD',
  STORE: 'SURPRISE_BAG',
  ADMIN: 'FREE_FOOD', // Admin không tạo bài, nhưng fallback về P2P
};

const ROLE_RESTRICTION_MSG: Record<PostType, string> = {
  FREE_FOOD:    'Chỉ dành cho Người dùng (P2P)',
  SURPRISE_BAG: 'Chỉ dành cho Cửa hàng (B2C)',
};

type SelectPostTypeModalProps = {
  visible: boolean;
  onClose: () => void;
  userRole?: UserRole;
};

export default function SelectPostTypeModal({
  visible,
  onClose,
  userRole = 'USER',
}: SelectPostTypeModalProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [errorType, setErrorType] = useState<PostType | null>(null);

  const allowedType = ALLOWED_POST_TYPE[userRole];

  const handleSelect = (postType: PostType) => {
    if (postType !== allowedType) {
      setErrorType(postType);
      return;
    }
    setErrorType(null);
    onClose();
    setTimeout(() => {
      router.push({
        pathname: '/(post)/create-post' as any,
        params: { type: postType },
      });
    }, 150);
  };

  const handleClose = () => {
    setErrorType(null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <Pressable
        className="flex-1 bg-neutral-T10/70 justify-end"
        onPress={handleClose}
      >
        <Pressable onPress={(e) => e.stopPropagation()}>
          <View
            className="bg-neutral-T100 rounded-t-3xl px-6 pt-4 border-t border-neutral-T90 shadow-lg"
            style={{ paddingBottom: Math.max(insets.bottom, 24) + 16 }}
          >
            {/* Drag handle */}
            <View className="w-12 h-1.5 bg-neutral-T80 rounded-md self-center mb-8" />

            {/* ── Option 1: P2P Free Food ── */}
            <PostTypeOption
              icon="heart"
              iconBg={allowedType === 'FREE_FOOD' ? '#296C24' : '#AAABAB'}
              title="Free food"
              subtitle="Chia sẻ thức ăn miễn phí"
              allowed={allowedType === 'FREE_FOOD'}
              showError={errorType === 'FREE_FOOD'}
              errorMsg={ROLE_RESTRICTION_MSG['FREE_FOOD']}
              onPress={() => handleSelect('FREE_FOOD')}
            />

            <View className="mb-4" />

            {/* ── Option 2: B2C Surprise Bag ── */}
            <PostTypeOption
              icon="shopping-bag"
              iconBg={allowedType === 'SURPRISE_BAG' ? '#944A00' : '#AAABAB'}
              title="Surprise bag"
              subtitle="Bán túi thức ăn thừa với giá ưu đãi"
              allowed={allowedType === 'SURPRISE_BAG'}
              showError={errorType === 'SURPRISE_BAG'}
              errorMsg={ROLE_RESTRICTION_MSG['SURPRISE_BAG']}
              onPress={() => handleSelect('SURPRISE_BAG')}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ── Internal sub-component ──
interface PostTypeOptionProps {
  icon: React.ComponentProps<typeof Feather>['name'];
  iconBg: string;
  title: string;
  subtitle: string;
  allowed: boolean;
  showError: boolean;
  errorMsg: string;
  onPress: () => void;
}

function PostTypeOption({
  icon,
  iconBg,
  title,
  subtitle,
  allowed,
  showError,
  errorMsg,
  onPress,
}: PostTypeOptionProps) {
  return (
    <View>
      <TouchableOpacity
        activeOpacity={allowed ? 0.8 : 0.95}
        className={`flex-row items-center gap-4 py-4 px-4 rounded-2xl shadow-sm border ${
          allowed
            ? 'bg-neutral-T100 border-neutral-T90'
            : 'bg-neutral-T97 border-neutral-T90 opacity-50'
        }`}
        onPress={onPress}
      >
        <View
          className="w-14 h-14 rounded-xl items-center justify-center"
          style={{ backgroundColor: iconBg }}
        >
          <Feather name={icon} size={24} color="#FFFFFF" />
        </View>
        <View className="flex-1">
          <Text
            className={`text-lg font-sans leading-tight mb-0.5 ${allowed ? 'text-neutral-T10' : 'text-neutral-T50'}`}
            style={{ fontWeight: '800' }}
          >
            {title}
          </Text>
          <Text className="text-sm font-body text-neutral-T50">{subtitle}</Text>
        </View>
        {allowed ? (
          <Feather name="arrow-right" size={20} color="#191C1C" />
        ) : (
          <MaterialIcons name="lock" size={18} color="#AAABAB" />
        )}
      </TouchableOpacity>
      {showError && (
        <View className="flex-row items-center gap-1 mt-1.5 ml-1">
          <MaterialIcons name="info-outline" size={13} color="#ba1a1a" />
          <Text className="font-body text-xs text-error">{errorMsg}</Text>
        </View>
      )}
    </View>
  );
}
