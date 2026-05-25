import { Feather } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import React, { useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { useThemeStore } from '@/stores/themeStore';

const TRACK_WIDTH = 60;
const TRACK_HEIGHT = 32;
const THUMB_SIZE = 26;
const PADDING = 3;
const THUMB_TRAVEL = TRACK_WIDTH - THUMB_SIZE - PADDING * 2;

export default function ThemeToggle() {
  const { toggleTheme } = useThemeStore();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const progress = useSharedValue(isDark ? 1 : 0);

  useEffect(() => {
    progress.value = withSpring(isDark ? 1 : 0, {
      damping: 15,
      stiffness: 150,
    });
  }, [isDark, progress]);

  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      ['#E1E3E2', '#454747']
    ),
  }));

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: progress.value * THUMB_TRAVEL }],
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      ['#FFFFFF', '#42863A']
    ),
  }));

  const sunStyle = useAnimatedStyle(() => ({
    opacity: 1 - progress.value,
  }));

  const moonStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
  }));

  return (
    <Pressable onPress={toggleTheme} hitSlop={8}>
      <Animated.View
        style={[
          {
            width: TRACK_WIDTH,
            height: TRACK_HEIGHT,
            borderRadius: TRACK_HEIGHT / 2,
            padding: PADDING,
            justifyContent: 'center',
          },
          trackStyle,
        ]}
      >
        <Animated.View
          style={[
            {
              width: THUMB_SIZE,
              height: THUMB_SIZE,
              borderRadius: THUMB_SIZE / 2,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.15,
              shadowRadius: 2,
              elevation: 2,
            },
            thumbStyle,
          ]}
        >
          {/* Sun icon — light mode */}
          <Animated.View
            style={[StyleSheet.absoluteFill, styles.center, sunStyle]}
          >
            <Feather name="sun" size={13} color="#B45309" />
          </Animated.View>
          {/* Moon icon — dark mode */}
          <Animated.View
            style={[StyleSheet.absoluteFill, styles.center, moonStyle]}
          >
            <Feather name="moon" size={13} color="#FFFFFF" />
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
