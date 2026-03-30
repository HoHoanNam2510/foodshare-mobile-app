import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

const P2P_ITEMS = [
  {
    id: 'p1',
    name: 'Bánh mì dư',
    image:
      'https://images.unsplash.com/photo-1600628421055-4d30de868b8f?w=400&q=80',
    user: 'Liam',
    avatar: 'https://i.pravatar.cc/40?img=11',
    distance: '2km away',
    badge: 'FRESH',
    badgeType: 'fresh',
  },
  {
    id: 'p2',
    name: '6 Glazed Donuts',
    image:
      'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&q=80',
    user: 'Sara',
    avatar: 'https://i.pravatar.cc/40?img=5',
    distance: '0.5km away',
    badge: 'EXPIRING SOON',
    badgeType: 'expiring',
  },
  {
    id: 'p3',
    name: 'Garden Salad Mix',
    image:
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80',
    user: 'Noah',
    avatar: 'https://i.pravatar.cc/40?img=15',
    distance: '1.2km away',
    badge: null,
    badgeType: null,
  },
  {
    id: 'p4',
    name: 'Artisanal Sourdough',
    image:
      'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80',
    user: 'Maya',
    avatar: 'https://i.pravatar.cc/40?img=20',
    distance: '3km away',
    badge: null,
    badgeType: null,
  },
];

type P2PItem = (typeof P2P_ITEMS)[0];

const P2PCard = ({ item }: { item: P2PItem }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      className="bg-neutral-T100 rounded-2xl overflow-hidden flex-1 shadow-sm active:opacity-90"
    >
      <View className="relative">
        <Image
          source={{ uri: item.image }}
          className="w-full rounded-t-2xl"
          style={{ height: 140 }}
          resizeMode="cover"
        />
        {item.badge && (
          <View
            className={`absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full ${
              item.badgeType === 'expiring'
                ? 'bg-secondary-T40'
                : 'bg-neutral-T100/90'
            }`}
          >
            <Text
              className={`text-[10px] font-label ${
                item.badgeType === 'expiring'
                  ? 'text-neutral-T100'
                  : 'text-primary-T40'
              }`}
              style={{ fontWeight: '600' }}
            >
              {item.badge}
            </Text>
          </View>
        )}
      </View>

      <View className="px-3 pt-3 pb-3.5">
        <Text
          className="text-[15px] font-body text-neutral-T10 leading-snug"
          style={{ fontWeight: '600' }}
          numberOfLines={1}
        >
          {item.name}
        </Text>
        <View className="flex-row items-center gap-2 mt-2">
          <Image
            source={{ uri: item.avatar }}
            className="w-5 h-5 rounded-full"
          />
          <Text
            className="text-xs font-body text-neutral-T50"
            numberOfLines={1}
          >
            {item.user} · {item.distance}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function FreshlyShared() {
  const rows: P2PItem[][] = [];
  for (let i = 0; i < P2P_ITEMS.length; i += 2) {
    rows.push(P2P_ITEMS.slice(i, i + 2));
  }

  return (
    <View className="mt-8 px-5">
      <View className="flex-row items-center justify-between mb-4">
        <Text
          className="text-xl font-sans text-neutral-T10"
          style={{ fontWeight: '700', letterSpacing: -0.3 }}
        >
          Freshly shared
        </Text>
        <TouchableOpacity className="flex-row items-center gap-1 active:opacity-70">
          <Text
            className="text-sm font-body text-primary-T40"
            style={{ fontWeight: '600' }}
          >
            See all
          </Text>
          <Feather name="chevron-right" size={16} color="#296C24" />
        </TouchableOpacity>
      </View>
      <View className="gap-3">
        {rows.map((row, idx) => (
          <View key={idx} className="flex-row gap-3">
            {row.map((item) => (
              <P2PCard key={item.id} item={item} />
            ))}
            {row.length === 1 && <View className="flex-1" />}
          </View>
        ))}
      </View>
    </View>
  );
}
