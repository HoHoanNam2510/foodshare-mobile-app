import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React, { useEffect } from 'react';
import { Dimensions, Modal, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const MAX_SCALE = 4;

interface ImageViewerModalProps {
  visible: boolean;
  imageUrl?: string;
  onClose: () => void;
}

export default function ImageViewerModal({
  visible,
  imageUrl,
  onClose,
}: ImageViewerModalProps) {
  const insets = useSafeAreaInsets();

  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  // Reset transform mỗi lần mở viewer
  useEffect(() => {
    if (visible) {
      scale.value = 1;
      savedScale.value = 1;
      translateX.value = 0;
      translateY.value = 0;
      savedTranslateX.value = 0;
      savedTranslateY.value = 0;
    }
  }, [
    visible,
    scale,
    savedScale,
    translateX,
    translateY,
    savedTranslateX,
    savedTranslateY,
  ]);

  const resetToFit = () => {
    'worklet';
    scale.value = withTiming(1);
    savedScale.value = 1;
    translateX.value = withTiming(0);
    translateY.value = withTiming(0);
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
  };

  const pinch = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = Math.min(
        Math.max(savedScale.value * e.scale, 1),
        MAX_SCALE
      );
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      if (scale.value <= 1) resetToFit();
    });

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      if (scale.value > 1) {
        translateX.value = savedTranslateX.value + e.translationX;
        translateY.value = savedTranslateY.value + e.translationY;
      }
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      if (scale.value > 1) {
        resetToFit();
      } else {
        scale.value = withTiming(2);
        savedScale.value = 2;
      }
    });

  const composed = Gesture.Exclusive(
    doubleTap,
    Gesture.Simultaneous(pinch, pan)
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black">
        <GestureDetector gesture={composed}>
          <Animated.View
            style={[
              { flex: 1, alignItems: 'center', justifyContent: 'center' },
              animatedStyle,
            ]}
          >
            {imageUrl && (
              <Image
                source={{ uri: imageUrl }}
                style={{ width: SCREEN_W, height: SCREEN_H }}
                contentFit="contain"
              />
            )}
          </Animated.View>
        </GestureDetector>

        <TouchableOpacity
          onPress={onClose}
          className="absolute right-4 h-10 w-10 items-center justify-center rounded-full bg-black/50"
          style={{ top: insets.top + 8 }}
        >
          <Feather name="x" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </Modal>
  );
}
