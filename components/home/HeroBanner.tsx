import { Feather } from '@expo/vector-icons';
import React from 'react';
import { ImageBackground, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';

export default function HeroBanner() {
  const { t } = useTranslation();
  return (
    <View className="mx-5">
      <ImageBackground
        source={{
          uri: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&q=80',
        }}
        className="rounded-2xl overflow-hidden shadow-md"
        style={{ minHeight: 180 }}
      >
        <View
          className="absolute inset-0"
          style={{ backgroundColor: 'rgba(10, 83, 12, 0.75)' }}
        />
        <View className="p-6 justify-between" style={{ minHeight: 180 }}>
          <Text
            className="text-xs font-body tracking-widest text-neutral-T100/70"
            style={{ letterSpacing: 1.5 }}
          >
            {t('home.heroBannerBadge')}
          </Text>
          <View className="mt-3">
            <Text
              className="text-2xl font-sans text-neutral-T100 leading-tight"
              style={{ fontWeight: '700', letterSpacing: -0.5, lineHeight: 32 }}
            >
              {t('home.heroBannerTitle')}
            </Text>
            <TouchableOpacity className="mt-5 self-start bg-neutral-T100 rounded-xl px-5 py-3 flex-row items-center gap-2 active:opacity-80">
              <Text
                className="text-primary-T40 text-sm font-body"
                style={{ fontWeight: '600' }}
              >
                {t('home.heroBannerCta')}
              </Text>
              <Feather name="arrow-right" size={14} color="#296C24" />
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}
