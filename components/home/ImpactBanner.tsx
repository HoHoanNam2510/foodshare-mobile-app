import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { fetchMyImpact, type ImpactStats } from '@/lib/homeApi';
import { useAuthStore } from '@/stores/authStore';

const GLOBAL_MOCK = [
  { labelKey: 'home.impactMeals', value: '2.4M' },
  { labelKey: 'home.impactCO2', value: '800t' },
  { labelKey: 'home.impactMembers', value: '150K+' },
] as const;

function AnimatedCounter({ targetValue }: { targetValue: number }) {
  const [display, setDisplay] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    startTimeRef.current = null;
    const DURATION = 1200;

    const tick = (now: number) => {
      if (!startTimeRef.current) startTimeRef.current = now;
      const elapsed = now - startTimeRef.current;
      const progress = Math.min(elapsed / DURATION, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(targetValue * eased));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [targetValue]);

  return (
    <Text
      className="text-neutral-T100 font-sans text-[22px]"
      style={{ fontWeight: '800' }}
    >
      {display}
    </Text>
  );
}

function PersonalStatItem({
  labelKey,
  value,
}: {
  labelKey: string;
  value: number;
}) {
  const { t } = useTranslation();
  return (
    <View className="w-1/2 items-center py-2.5">
      <AnimatedCounter targetValue={value} />
      <Text className="font-body text-neutral-T95/80 mt-0.5 text-center text-xs">
        {t(labelKey)}
      </Text>
    </View>
  );
}

function GlobalStatsFallback() {
  const { t } = useTranslation();
  return (
    <View className="flex-row justify-between">
      {GLOBAL_MOCK.map((stat, i) => (
        <View key={i} className="items-center">
          <Text
            className="text-neutral-T100 font-sans text-xl"
            style={{ fontWeight: '800' }}
          >
            {stat.value}
          </Text>
          <Text className="font-body text-neutral-T95/80 mt-0.5 text-xs">
            {t(stat.labelKey)}
          </Text>
        </View>
      ))}
    </View>
  );
}

export default function ImpactBanner() {
  const { t } = useTranslation();
  const token = useAuthStore((state) => state.token);
  const role = useAuthStore((state) => state.user?.role ?? 'USER');

  const [stats, setStats] = useState<ImpactStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setStats(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchMyImpact()
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, [token]);

  const personalStats = stats
    ? [
        { labelKey: 'home.impactReceived', value: stats.itemsReceived },
        { labelKey: 'home.impactGiven', value: stats.itemsGiven },
        { labelKey: 'home.impactBagsBought', value: stats.bagsPurchased },
        ...(role === 'STORE' && stats.bagsSold != null
          ? [{ labelKey: 'home.impactBagsSold', value: stats.bagsSold }]
          : []),
        { labelKey: 'home.impactGreenPoints', value: stats.greenPoints },
      ]
    : [];

  return (
    <View className="bg-primary-T40 mx-5 mb-6 mt-8 overflow-hidden rounded-2xl px-5 py-5 shadow-md">
      {/* Decorative elements */}
      <View
        className="bg-primary-T30/30 absolute -right-4 -top-4 h-20 w-20 rounded-xl"
        style={{ transform: [{ rotate: '15deg' }] }}
      />
      <View
        className="bg-primary-T50/25 absolute bottom-2 right-10 h-10 w-10 rounded-lg"
        style={{ transform: [{ rotate: '-10deg' }] }}
      />

      <View className="mb-4 flex-row items-center gap-2">
        <View className="bg-secondary-T80 h-9 w-9 items-center justify-center rounded-full">
          <Ionicons name="flash" size={18} color="#296C24" />
        </View>
        <Text
          className="text-neutral-T100 font-sans text-lg"
          style={{ fontWeight: '700' }}
        >
          {stats !== null
            ? t('home.impactPersonalTitle')
            : t('home.impactTitle')}
        </Text>
      </View>

      {loading && (
        <View className="items-center py-3">
          <Text className="font-body text-neutral-T100/60 text-sm">
            {t('common.loading')}
          </Text>
        </View>
      )}

      {!loading && stats === null && <GlobalStatsFallback />}

      {!loading && stats !== null && (
        <View className="flex-row flex-wrap">
          {personalStats.map((item) => (
            <PersonalStatItem
              key={item.labelKey}
              labelKey={item.labelKey}
              value={item.value}
            />
          ))}
          {personalStats.length % 2 !== 0 && <View className="w-1/2" />}
        </View>
      )}
    </View>
  );
}
