import { useColorScheme } from 'nativewind';
import React, { useState } from 'react';
import { ScrollView, StatusBar, View } from 'react-native';

import FilterPills from '../../components/home/FilterPills';
import FreshlyShared from '../../components/home/FreshlyShared';
import GuideSection from '../../components/home/GuideSection';
import HeroBanner from '../../components/home/HeroBanner';
import ImpactBanner from '../../components/home/ImpactBanner';
import MarketTeaser from '../../components/home/MarketTeaser';
import MainHeader from '../../components/shared/headers/MainHeader';

export default function HomeScreen() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View className="bg-neutral dark:bg-neutral-T10 flex-1">
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      <MainHeader />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 90,
          paddingTop: 16,
        }}
        className="flex-1"
      >
        <FilterPills
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />
        <View className="mt-5">
          <HeroBanner />
        </View>
        <GuideSection />
        <FreshlyShared activeCategory={activeCategory} />
        <MarketTeaser activeCategory={activeCategory} />
        <ImpactBanner />
      </ScrollView>
    </View>
  );
}
