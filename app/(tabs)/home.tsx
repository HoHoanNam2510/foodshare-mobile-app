import React from 'react';
import { ScrollView, StatusBar, View } from 'react-native';

import FilterPills from '../../components/home/FilterPills';
import FreshlyShared from '../../components/home/FreshlyShared';
import GuideSection from '../../components/home/GuideSection';
import HeroBanner from '../../components/home/HeroBanner';
import ImpactBanner from '../../components/home/ImpactBanner';
import MarketTeaser from '../../components/home/MarketTeaser';
import MainHeader from '../../components/shared/headers/MainHeader';

export default function HomeScreen() {
  return (
    <View className="flex-1 bg-neutral">
      <StatusBar
        barStyle="dark-content"
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
