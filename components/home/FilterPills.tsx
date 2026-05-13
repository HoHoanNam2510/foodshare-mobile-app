import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import { fetchCategories, ICategory } from '@/lib/categoryApi';

// Fallback khi API không khả dụng (offline / server lỗi)
const FALLBACK_CATEGORIES: ICategory[] = [
  {
    _id: 'vegetables',
    slug: 'vegetables',
    name: 'Rau củ quả',
    icon: 'sprout',
    color: '#2E7D32',
    applyTo: 'BOTH',
    isSystem: true,
    sortOrder: 1,
    isActive: true,
  },
  {
    _id: 'starches',
    slug: 'starches',
    name: 'Tinh bột',
    icon: 'bread-slice',
    color: '#E65100',
    applyTo: 'BOTH',
    isSystem: true,
    sortOrder: 2,
    isActive: true,
  },
  {
    _id: 'protein',
    slug: 'protein',
    name: 'Đạm',
    icon: 'food-drumstick',
    color: '#B71C1C',
    applyTo: 'BOTH',
    isSystem: true,
    sortOrder: 3,
    isActive: true,
  },
  {
    _id: 'seafood',
    slug: 'seafood',
    name: 'Hải sản',
    icon: 'fish',
    color: '#01579B',
    applyTo: 'BOTH',
    isSystem: true,
    sortOrder: 4,
    isActive: true,
  },
  {
    _id: 'bakery',
    slug: 'bakery',
    name: 'Bánh & Đồ ngọt',
    icon: 'cake-variant',
    color: '#AD1457',
    applyTo: 'BOTH',
    isSystem: true,
    sortOrder: 6,
    isActive: true,
  },
];

// Số lượng skeleton pill hiển thị trong lúc load
const SKELETON_COUNT = 5;

interface FilterPillsProps {
  activeCategory: string;
  onCategoryChange: (slug: string) => void;
}

function SkeletonPill({ animValue }: { animValue: Animated.Value }) {
  return (
    <Animated.View
      className="bg-neutral-T90 mr-2 rounded-full"
      style={{ width: 80, height: 36, opacity: animValue }}
    />
  );
}

export default function FilterPills({
  activeCategory,
  onCategoryChange,
}: FilterPillsProps) {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Animated value dùng chung cho tất cả skeleton pills
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Vòng lặp pulse cho skeleton
  useEffect(() => {
    if (!loading) return;

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.4,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [loading, pulseAnim]);

  const loadCategories = useCallback(async () => {
    try {
      const data = await fetchCategories();
      setCategories(data);
    } catch {
      setCategories(FALLBACK_CATEGORIES);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  if (loading) {
    return (
      <View className="mx-5 overflow-hidden">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="py-1"
          scrollEnabled={false}
        >
          {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <SkeletonPill key={i} animValue={pulseAnim} />
          ))}
        </ScrollView>
      </View>
    );
  }

  return (
    <View className="mx-5 overflow-hidden">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="py-1"
      >
        {/* Pill "Tất cả" — luôn đứng đầu, không lấy từ DB */}
        <TouchableOpacity
          onPress={() => onCategoryChange('all')}
          className={`mr-2 rounded-full px-4 py-2 ${
            activeCategory === 'all'
              ? 'bg-primary-T40'
              : 'bg-neutral-T100 border-neutral-T90 border'
          }`}
          activeOpacity={0.8}
        >
          <Text
            className={`font-body text-sm ${
              activeCategory === 'all'
                ? 'text-neutral-T100'
                : 'text-neutral-T30'
            }`}
            style={{ fontWeight: activeCategory === 'all' ? '600' : '400' }}
          >
            {t('home.filterAll')}
          </Text>
        </TouchableOpacity>

        {categories.map((cat, index) => {
          const isActive = activeCategory === cat.slug;
          const isLast = index === categories.length - 1;
          return (
            <TouchableOpacity
              key={cat._id}
              onPress={() => onCategoryChange(cat.slug)}
              className={`rounded-full px-4 py-2 ${
                isActive
                  ? 'bg-primary-T40'
                  : 'bg-neutral-T100 border-neutral-T90 border'
              } ${!isLast ? 'mr-2' : ''}`}
              activeOpacity={0.8}
            >
              <Text
                className={`font-body text-sm ${
                  isActive ? 'text-neutral-T100' : 'text-neutral-T30'
                }`}
                style={{ fontWeight: isActive ? '600' : '400' }}
              >
                {cat.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
