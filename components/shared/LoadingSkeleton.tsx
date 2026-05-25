import { useColorScheme } from 'nativewind';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

interface LoadingSkeletonProps {
  variant: 'chart' | 'card' | 'list';
}

export default function LoadingSkeleton({ variant }: LoadingSkeletonProps) {
  const [containerWidth, setContainerWidth] = useState(0);
  const shimmerPos = useSharedValue(-100);
  const { colorScheme } = useColorScheme();
  const shimmerColor =
    colorScheme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.5)';

  useEffect(() => {
    shimmerPos.value = withRepeat(
      withTiming(containerWidth, { duration: 1500 }),
      -1,
      false
    );
  }, [containerWidth, shimmerPos]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerPos.value }],
  }));

  const renderSkeleton = () => {
    switch (variant) {
      case 'chart':
        return (
          <View
            className="bg-neutral-T95 dark:bg-neutral-T30 w-full overflow-hidden rounded-xl"
            style={{ height: 240 }}
            onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
          >
            <Animated.View
              style={[
                {
                  width: '30%',
                  height: '100%',
                  backgroundColor: shimmerColor,
                },
                animatedStyle,
              ]}
            />
          </View>
        );
      case 'card':
        return (
          <View
            className="bg-neutral-T95 dark:bg-neutral-T30 w-full overflow-hidden rounded-xl"
            style={{ height: 100 }}
            onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
          >
            <Animated.View
              style={[
                {
                  width: '30%',
                  height: '100%',
                  backgroundColor: shimmerColor,
                },
                animatedStyle,
              ]}
            />
          </View>
        );
      case 'list':
        return (
          <View className="w-full">
            {[1, 2, 3].map((_, i) => (
              <View
                key={i}
                className="bg-neutral-T95 dark:bg-neutral-T30 mb-3 w-full overflow-hidden rounded-xl"
                style={{ height: 60 }}
                onLayout={(e) => {
                  if (i === 0) setContainerWidth(e.nativeEvent.layout.width);
                }}
              >
                <Animated.View
                  style={[
                    {
                      width: '30%',
                      height: '100%',
                      backgroundColor: shimmerColor,
                    },
                    animatedStyle,
                  ]}
                />
              </View>
            ))}
          </View>
        );
      default:
        return null;
    }
  };

  return <View className="w-full">{renderSkeleton()}</View>;
}
