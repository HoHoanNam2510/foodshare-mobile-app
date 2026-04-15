import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ─── Types (Giữ nguyên) ──────────────────────────────────────────────────────

type FeatherIconName = React.ComponentProps<typeof Feather>['name'];

interface Tab {
  labelKey: string;
  routeName: string;
  iconName: FeatherIconName;
}

interface CustomTabBarProps {
  activeIndex?: number;
  onTabPress?: (routeName: string, index: number) => void;
}

// ─── Tab Config (Giữ nguyên) ─────────────────────────────────────────────────
const TABS: Tab[] = [
  { labelKey: 'tabs.home', routeName: '/home', iconName: 'home' },
  { labelKey: 'tabs.explore', routeName: '/explore', iconName: 'compass' },
  { labelKey: 'common.add', routeName: 'ACTION_ADD', iconName: 'plus' },
  { labelKey: 'profile.myPosts', routeName: '/post', iconName: 'file-text' },
  { labelKey: 'tabs.chat', routeName: '/chat', iconName: 'message-circle' },
];

// ─── Constants ───────────────────────────────────────────────────────────────
const PRIMARY_T40 = '#296C24';
const NEUTRAL_T50 = '#757777';
const NEUTRAL_T100 = '#FFFFFF';

const FAB_SIZE = 56;
const FAB_RISE = 18;

// ─── Component ───────────────────────────────────────────────────────────────
export default function CustomTabBar({
  activeIndex: controlledIndex,
  onTabPress,
}: CustomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [internalIndex, setInternalIndex] = useState(0);

  const activeIndex =
    controlledIndex !== undefined ? controlledIndex : internalIndex;

  const handlePress = (index: number, routeName: string) => {
    if (controlledIndex === undefined) setInternalIndex(index);
    onTabPress?.(routeName, index);
  };

  const bottomPad = Math.max(insets.bottom, 8);

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        paddingTop: FAB_RISE,
      }}
    >
      {/* ── Main Bar ── */}
      <View
        className="bg-neutral-T100 flex-row items-center justify-around rounded-2xl shadow-md"
        style={{
          marginHorizontal: 16,
          paddingBottom: bottomPad,
          paddingTop: 10,
        }}
      >
        {TABS.map((tab, index) => {
          if (index === 2) {
            return <View key="fab-placeholder" style={{ width: FAB_SIZE }} />;
          }

          const isActive = activeIndex === index;

          return (
            <TouchableOpacity
              key={tab.routeName}
              onPress={() => handlePress(index, tab.routeName)}
              activeOpacity={0.7}
              className="flex-col items-center active:opacity-70"
              style={{ gap: 4, minWidth: 48 }}
              accessibilityRole="button"
              accessibilityLabel={t(tab.labelKey)}
              accessibilityState={{ selected: isActive }}
            >
              <Feather
                name={tab.iconName}
                size={22}
                color={isActive ? PRIMARY_T40 : NEUTRAL_T50}
              />
              <Text
                className="font-body"
                style={{
                  fontSize: 10,
                  fontWeight: isActive ? '600' : '400',
                  color: isActive ? PRIMARY_T40 : NEUTRAL_T50,
                }}
              >
                {t(tab.labelKey)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── Floating Action Button ── */}
      <View
        pointerEvents="box-none"
        style={{
          position: 'absolute',
          top: 10,
          left: 0,
          right: 0,
          alignItems: 'center',
        }}
      >
        <TouchableOpacity
          onPress={() => handlePress(2, TABS[2].routeName)}
          activeOpacity={0.9}
          accessibilityRole="button"
          accessibilityLabel="Add"
          className="bg-primary-T40 items-center justify-center rounded-full shadow active:scale-[0.95]"
          style={{
            width: FAB_SIZE,
            height: FAB_SIZE,
            marginTop: -(FAB_SIZE / 2 - FAB_RISE / 2),
            borderWidth: 4,
            borderColor: NEUTRAL_T100,
          }}
        >
          <Feather
            name="plus"
            size={24}
            color={NEUTRAL_T100}
            strokeWidth={2.5}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}
