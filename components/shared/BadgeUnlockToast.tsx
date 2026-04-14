import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Image,
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

  useEffect(() => {
    if (badge) {
      // Reset before animating in (handles rapid successive badges)
      translateY.setValue(-140);
      opacity.setValue(0);
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
    } else {
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
      ]).start();
    }
  }, [badge, opacity, translateY]);

  // Always rendered — animation slides it off-screen when badge is null.
  // pointerEvents="none" prevents invisible toast from eating taps.
  return (
    <Animated.View
      pointerEvents={badge ? 'auto' : 'none'}
      style={{
        position: 'absolute',
        top: insets.top + 8,
        left: 12,
        right: 12,
        zIndex: 9999,
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
          {badge?.imageUrl ? (
            <Image
              source={{ uri: badge.imageUrl }}
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
              {badge?.name ?? ''}
            </Text>
            {badge && badge.pointReward > 0 && (
              <Text
                style={{ color: '#A8E6A1', fontSize: 11, marginTop: 3 }}
              >
                +{badge.pointReward} điểm xanh
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
  );
}
