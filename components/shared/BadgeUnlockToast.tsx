import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { IBadge } from '@/lib/badgeApi';

type BadgeUnlockToastProps = {
  badge: IBadge | null;
  onDismiss: () => void;
};

export default function BadgeUnlockToast({
  badge,
  onDismiss,
}: BadgeUnlockToastProps) {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(-140)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const [modalVisible, setModalVisible] = useState(false);
  // Keeps badge content visible during the exit animation so it doesn't flash empty
  const [displayBadge, setDisplayBadge] = useState<IBadge | null>(null);

  useEffect(() => {
    if (badge) {
      setDisplayBadge(badge);
      // Reset animated values before the Modal mounts
      translateY.setValue(-140);
      opacity.setValue(0);
      setModalVisible(true);
      // Do NOT start animation here — onShow fires after Modal is actually
      // visible on screen, avoiding the iOS native-driver race condition where
      // the animation completes before the Modal has rendered.
    } else if (modalVisible) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -140,
          duration: 240,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 240,
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) {
          setModalVisible(false);
          setDisplayBadge(null);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [badge]);

  // Called by Modal once the view is actually on screen — safe to start animation
  const handleShow = useCallback(() => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        tension: 90,
        friction: 11,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 260,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, translateY]);

  return (
    <Modal
      visible={modalVisible}
      transparent
      animationType="none"
      statusBarTranslucent
      onShow={handleShow}
      onRequestClose={onDismiss}
    >
      <View pointerEvents="box-none" style={{ flex: 1 }}>
        <Animated.View
          pointerEvents="box-none"
          style={{
            position: 'absolute',
            top: insets.top + 8,
            left: 12,
            right: 12,
            transform: [{ translateY }],
            opacity,
          }}
        >
          <TouchableOpacity activeOpacity={0.9} onPress={onDismiss}>
            <View
              style={{
                backgroundColor: '#1A4A17',
                borderRadius: 16,
                paddingHorizontal: 14,
                paddingVertical: 12,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                shadowColor: '#000',
                shadowOpacity: 0.22,
                shadowOffset: { width: 0, height: 6 },
                shadowRadius: 14,
                elevation: 10,
              }}
            >
              {/* Badge image / fallback */}
              {displayBadge?.imageUrl ? (
                <Image
                  source={{ uri: displayBadge.imageUrl }}
                  style={{ width: 54, height: 54, borderRadius: 10 }}
                  resizeMode="contain"
                />
              ) : (
                <View
                  style={{
                    width: 54,
                    height: 54,
                    borderRadius: 10,
                    backgroundColor: '#296C2440',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ fontSize: 30 }}>🏅</Text>
                </View>
              )}

              {/* Text block */}
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: '#A8E6A1',
                    fontSize: 11,
                    fontWeight: '600',
                    marginBottom: 3,
                    letterSpacing: 0.3,
                  }}
                >
                  🎉 Huy hiệu mới mở khóa!
                </Text>
                <Text
                  style={{
                    color: '#FFFFFF',
                    fontSize: 14,
                    fontWeight: '800',
                    lineHeight: 18,
                  }}
                  numberOfLines={1}
                >
                  {displayBadge?.name ?? ''}
                </Text>
                {displayBadge && displayBadge.pointReward > 0 && (
                  <Text
                    style={{ color: '#A8E6A1', fontSize: 11, marginTop: 3 }}
                  >
                    +{displayBadge.pointReward} điểm xanh
                  </Text>
                )}
              </View>

              {/* Tap-to-dismiss hint */}
              <Text style={{ color: '#A8E6A180', fontSize: 16, paddingLeft: 4 }}>
                ✕
              </Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}
