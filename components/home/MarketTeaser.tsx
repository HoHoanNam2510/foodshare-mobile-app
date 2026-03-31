import { Feather, Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';

const MARKET_ITEMS = [
  {
    id: 'm1',
    name: 'Tiệm bánh ABC',
    subtitle: 'Fresh pastry assortment',
    image:
      'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&q=80',
    price: '$2.00',
    rating: 4.8,
  },
  {
    id: 'm2',
    name: 'Green Organics',
    subtitle: 'Seasonal vegetable box',
    image:
      'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=400&q=80',
    price: '$4.50',
    rating: 4.6,
  },
  {
    id: 'm3',
    name: 'La Boulangerie',
    subtitle: 'Mixed bread & rolls',
    image:
      'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=400&q=80',
    price: '$3.00',
    rating: 4.9,
  },
  {
    id: 'm4',
    name: 'Sunrise Deli',
    subtitle: 'Ready meals & sides',
    image:
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80',
    price: '$5.50',
    rating: 4.7,
  },
];

export default function MarketTeaser() {
  return (
    <View className="mt-8">
      <View className="px-5 mb-1">
        <Text className="text-sm font-body text-neutral-T50">From shops</Text>
        <View className="flex-row items-end justify-between mt-1">
          <Text
            className="text-xl font-sans text-neutral-T10"
            style={{ fontWeight: '700', letterSpacing: -0.3 }}
          >
            Surprise bags{'\n'}around you
          </Text>
          <TouchableOpacity className="flex-row items-center gap-1 mb-1 active:opacity-70">
            <Text
              className="text-sm font-body text-primary-T40"
              style={{ fontWeight: '600' }}
            >
              See all
            </Text>
            <Feather name="chevron-right" size={16} color="#296C24" />
          </TouchableOpacity>
        </View>
      </View>

      <View className="mx-5 overflow-hidden">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop: 14,
            paddingBottom: 4,
          }}
        >
          {MARKET_ITEMS.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.9}
              className={`bg-neutral-T100 rounded-2xl overflow-hidden shadow-sm active:opacity-90 ${
                index < MARKET_ITEMS.length - 1 ? 'mr-3' : ''
              }`}
              style={{ width: 190 }}
            >
              <View className="relative">
                <Image
                  source={{ uri: item.image }}
                  style={{ width: 190, height: 150 }}
                  className="rounded-t-2xl"
                  resizeMode="cover"
                />
                <View className="absolute bottom-3 left-3 bg-primary-T40 rounded-full px-2.5 py-1">
                  <Text
                    className="text-neutral-T100 text-xs font-body"
                    style={{ fontWeight: '600' }}
                  >
                    {item.price}
                  </Text>
                </View>
                <TouchableOpacity className="absolute top-3 right-3 bg-neutral-T100/90 w-8 h-8 rounded-full items-center justify-center">
                  <Ionicons name="bag-outline" size={16} color="#191C1C" />
                </TouchableOpacity>
              </View>
              <View className="px-3.5 pt-3 pb-3.5">
                <Text
                  className="text-[15px] font-body text-neutral-T10"
                  style={{ fontWeight: '600' }}
                  numberOfLines={1}
                >
                  {item.name}
                </Text>
                <View className="flex-row items-center justify-between mt-1.5">
                  <Text
                    className="text-xs font-body text-neutral-T50 flex-1 mr-2"
                    numberOfLines={1}
                  >
                    {item.subtitle}
                  </Text>
                  <View className="flex-row items-center gap-0.5">
                    <Ionicons name="star" size={12} color="#EC8632" />
                    <Text
                      className="text-xs font-body text-neutral-T10"
                      style={{ fontWeight: '600' }}
                    >
                      {item.rating}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}
