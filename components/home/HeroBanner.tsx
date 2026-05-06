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
        className="overflow-hidden rounded-2xl shadow-md"
        style={{ minHeight: 180 }}
      >
        <View
          className="absolute inset-0"
          style={{ backgroundColor: 'rgba(10, 83, 12, 0.75)' }}
        />
        <View className="justify-between p-6" style={{ minHeight: 180 }}>
          <Text
            className="font-body text-neutral-T100/70 text-xs tracking-widest"
            style={{ letterSpacing: 1.5 }}
          >
            {t('home.heroBannerBadge')}
          </Text>
          <View className="mt-3">
            <Text
              className="text-neutral-T100 font-sans text-2xl leading-tight"
              style={{ fontWeight: '700', letterSpacing: -0.5, lineHeight: 32 }}
            >
              {t('home.heroBannerTitle')}
            </Text>
            <TouchableOpacity className="bg-neutral-T100 mt-5 flex-row items-center gap-2 self-start rounded-xl px-5 py-3 active:opacity-80">
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
    </View>
  );
}
