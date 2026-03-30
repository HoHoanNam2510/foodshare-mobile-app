import React from 'react';
import { ScrollView, StatusBar, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import FilterPills from '../../components/home/FilterPills';
import FreshlyShared from '../../components/home/FreshlyShared';
import GuideSection from '../../components/home/GuideSection';
import HeroBanner from '../../components/home/HeroBanner';
import ImpactBanner from '../../components/home/ImpactBanner';
import MarketTeaser from '../../components/home/MarketTeaser';
import Header from '../../components/shared/Header';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-neutral">
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />
      <Header />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 90,
          paddingTop: insets.top + 90,
        }}
        className="flex-1"
      >
        <FilterPills />
        <View className="mt-5">
          <HeroBanner />
        </View>
        <GuideSection />
        <FreshlyShared />
        <MarketTeaser />
        <ImpactBanner />
      </ScrollView>
    </View>
  );
}
