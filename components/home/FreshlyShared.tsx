import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';

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
      className="bg-neutral-T100 flex-1 overflow-hidden rounded-2xl shadow-sm active:opacity-90"
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
            className={`absolute left-2.5 top-2.5 rounded-full px-2.5 py-1 ${
              item.badgeType === 'expiring'
                ? 'bg-secondary-T40'
                : 'bg-neutral-T100/90'
            }`}
          >
            <Text
              className={`font-label text-[10px] ${
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

      <View className="px-3 pb-3.5 pt-3">
        <Text
          className="font-body text-neutral-T10 text-[15px] leading-snug"
          style={{ fontWeight: '600' }}
          numberOfLines={1}
        >
          {item.name}
        </Text>
        <View className="mt-2 flex-row items-center gap-2">
          <Image
            source={{ uri: item.avatar }}
            className="h-5 w-5 rounded-full"
          />
          <Text
            className="font-body text-neutral-T50 text-xs"
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
  const { t } = useTranslation();
  const rows: P2PItem[][] = [];
  for (let i = 0; i < P2P_ITEMS.length; i += 2) {
    rows.push(P2P_ITEMS.slice(i, i + 2));
  }

  return (
    <View className="mt-8 px-5">
      <View className="mb-4 flex-row items-center justify-between">
        <Text
          className="text-neutral-T10 font-sans text-xl"
          style={{ fontWeight: '700', letterSpacing: -0.3 }}
        >
          {t('home.freshlySharedTitle')}
        </Text>
        <TouchableOpacity className="flex-row items-center gap-1 active:opacity-70">
          <Text
            className="font-body text-primary-T40 text-sm"
            style={{ fontWeight: '600' }}
          >
            {t('common.seeAll')}
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
