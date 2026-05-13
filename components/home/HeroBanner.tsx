import { Feather } from '@expo/vector-icons';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  ImageBackground,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';

import SelectPostTypeModal from '@/components/shared/SelectPostTypeModal';
import { useAuthStore } from '@/stores/authStore';

const SLIDE_WIDTH = Dimensions.get('window').width - 40;
const AUTO_SLIDE_INTERVAL = 5000;

const BANNER_SLIDES = [
  {
    id: 'slide1',
    badgeKey: 'home.heroBannerBadge',
    titleKey: 'home.heroBannerTitle',
    image:
      'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&q=80',
    overlay: 'rgba(10, 83, 12, 0.75)',
  },
  {
    id: 'slide2',
    badgeKey: 'home.heroBanner2Badge',
    titleKey: 'home.heroBanner2Title',
    image:
      'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800&q=80',
    overlay: 'rgba(10, 50, 80, 0.75)',
  },
  {
    id: 'slide3',
    badgeKey: 'home.heroBanner3Badge',
    titleKey: 'home.heroBanner3Title',
    image:
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80',
    overlay: 'rgba(80, 40, 0, 0.75)',
  },
];

function Dot({ active }: { active: boolean }) {
  const animStyle = useAnimatedStyle(
    () => ({
      width: withTiming(active ? 20 : 8, { duration: 300 }),
      opacity: withTiming(active ? 1 : 0.45, { duration: 300 }),
    }),
    [active]
  );
  return (
    <Animated.View
      className="bg-primary-T40"
      style={[{ height: 8, borderRadius: 4 }, animStyle]}
    />
  );
}

export default function HeroBanner() {
  const { t } = useTranslation();
  const userRole = useAuthStore((state) => state.user?.role ?? 'USER') as
    | 'USER'
    | 'STORE'
    | 'ADMIN';
  const [activeIndex, setActiveIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearAutoSlide = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startAutoSlide = useCallback(() => {
    clearAutoSlide();
    intervalRef.current = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % BANNER_SLIDES.length;
        scrollRef.current?.scrollTo({ x: next * SLIDE_WIDTH, animated: true });
        return next;
      });
    }, AUTO_SLIDE_INTERVAL);
  }, [clearAutoSlide]);

  useEffect(() => {
    startAutoSlide();
    return clearAutoSlide;
  }, [startAutoSlide, clearAutoSlide]);

  const onMomentumScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const index = Math.round(e.nativeEvent.contentOffset.x / SLIDE_WIDTH);
      setActiveIndex(index);
      startAutoSlide();
    },
    [startAutoSlide]
  );

  return (
    <View className="mx-5">
      <View className="overflow-hidden rounded-2xl shadow-md">
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          onScrollBeginDrag={clearAutoSlide}
          onMomentumScrollEnd={onMomentumScrollEnd}
          style={{ width: SLIDE_WIDTH }}
        >
          {BANNER_SLIDES.map((slide) => (
            <ImageBackground
              key={slide.id}
              source={{ uri: slide.image }}
              style={{ width: SLIDE_WIDTH, minHeight: 180 }}
              resizeMode="cover"
            >
              <View
                className="absolute inset-0"
                style={{ backgroundColor: slide.overlay }}
              />
              <View className="justify-between p-6" style={{ minHeight: 180 }}>
                <Text
                  className="font-body text-neutral-T100/70 text-xs"
                  style={{ letterSpacing: 1.5 }}
                >
                  {t(slide.badgeKey)}
                </Text>
                <View className="mt-3">
                  <Text
                    className="text-neutral-T100 font-sans text-2xl leading-tight"
                    style={{
                      fontWeight: '700',
                      letterSpacing: -0.5,
                      lineHeight: 32,
                    }}
                  >
                    {t(slide.titleKey)}
                  </Text>
                  <TouchableOpacity
                    className="bg-neutral-T100 mt-5 flex-row items-center gap-2 self-start rounded-xl px-5 py-3 active:opacity-80"
                    onPress={() => setModalVisible(true)}
                  >
                    <Text
                      className="text-primary-T40 font-body text-sm"
                      style={{ fontWeight: '600' }}
                    >
                      {t('home.heroBannerCta')}
                    </Text>
                    <Feather name="arrow-right" size={14} color="#296C24" />
                  </TouchableOpacity>
                </View>
              </View>
            </ImageBackground>
          ))}
        </ScrollView>
      </View>

      <View className="mt-3 flex-row items-center justify-center gap-1.5">
        {BANNER_SLIDES.map((slide, index) => (
          <Dot key={slide.id} active={index === activeIndex} />
        ))}
      </View>

      <SelectPostTypeModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        userRole={userRole}
      />
    </View>
  );
}
