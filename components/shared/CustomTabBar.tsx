import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ─── Types ───────────────────────────────────────────────────────────────────

type FeatherIconName = React.ComponentProps<typeof Feather>['name'];

interface Tab {
  name: string;
  routeName: string;
  iconName: FeatherIconName;
}

interface CustomTabBarProps {
  activeIndex?: number;
  onTabPress?: (routeName: string, index: number) => void;
}

// ─── Tab Config ──────────────────────────────────────────────────────────────

const TABS: Tab[] = [
  { name: 'Home', routeName: '/', iconName: 'home' },
  { name: 'Explore', routeName: '/Explore', iconName: 'compass' },
  // Đổi routeName thành một hằng số hành động thay vì đường dẫn
  { name: 'Add', routeName: 'ACTION_ADD', iconName: 'plus' },
  { name: 'Chat', routeName: '/chat', iconName: 'message-circle' },
  { name: 'Profile', routeName: '/profile', iconName: 'user' },
];

// ─── Constants ───────────────────────────────────────────────────────────────

const PRIMARY_GREEN = '#72B866';
const MUTED_GRAY = '#9CA3AF'; // text-text-muted
const WHITE = '#FFFFFF';

const FAB_OUTER = 64; // white ring diameter
const FAB_INNER = 52; // green circle diameter
const FAB_RISE = 24; // how many px the FAB floats above the bar top

// ─── Component ───────────────────────────────────────────────────────────────

export default function CustomTabBar({
  activeIndex: controlledIndex,
  onTabPress,
}: CustomTabBarProps) {
  const insets = useSafeAreaInsets();
  const [internalIndex, setInternalIndex] = useState(0);

  const activeIndex =
    controlledIndex !== undefined ? controlledIndex : internalIndex;

  const handlePress = (index: number, routeName: string) => {
    if (controlledIndex === undefined) setInternalIndex(index);
    onTabPress?.(routeName, index);
  };

  // Bottom padding: respect safe area but guarantee at least 8 px
  const bottomPad = Math.max(insets.bottom, 8);

  return (
    /**
     * Outer wrapper: absolutely positioned at the screen bottom.
     * Holds both the bar and the floating FAB.
     */
    <View
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        // Extend container height to accommodate the FAB rise above the bar
        paddingTop: FAB_RISE,
      }}
      pointerEvents="box-none"
    >
      {/* ── Main Bar ──────────────────────────────────────────────────── */}
      <View
        className="bg-surface-lowest flex-row items-center justify-around"
        style={{
          borderRadius: 20,
          marginHorizontal: 12,
          paddingBottom: bottomPad,
          paddingTop: 10,
          // Elevation / shadow
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 12,
        }}
      >
        {TABS.map((tab, index) => {
          if (index === 2) {
            // Reserve space for the central FAB so siblings stay evenly spaced
            return <View key="fab-placeholder" style={{ width: FAB_OUTER }} />;
          }

          const isActive = activeIndex === index;

          return (
            <TouchableOpacity
              key={tab.routeName}
              onPress={() => handlePress(index, tab.routeName)}
              activeOpacity={0.7}
              className="flex-col items-center"
              style={{ gap: 4, minWidth: 48 }}
              accessibilityRole="button"
              accessibilityLabel={tab.name}
              accessibilityState={{ selected: isActive }}
            >
              {/* Active indicator line at top */}
              {isActive ? (
                <View
                  style={{
                    position: 'absolute',
                    top: -10,
                    width: 28,
                    height: 3,
                    borderRadius: 2,
                    backgroundColor: PRIMARY_GREEN,
                  }}
                />
              ) : null}

              <Feather
                name={tab.iconName}
                size={22}
                color={isActive ? PRIMARY_GREEN : MUTED_GRAY}
              />
              <Text
                className="font-sans"
                style={{
                  fontSize: 10,
                  fontWeight: '500',
                  color: isActive ? PRIMARY_GREEN : MUTED_GRAY,
                }}
              >
                {tab.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── Floating Action Button (index 2) ──────────────────────────── */}
      {/* Centred absolutely; sits above the bar by FAB_RISE px */}
      <View
        pointerEvents="box-none"
        style={{
          position: 'absolute',
          // Align to the bar's top edge (which is at y = FAB_RISE inside the container)
          top: 16, // 16 px paddingTop of the bar
          left: 0,
          right: 0,
          alignItems: 'center',
          // Don't intercept touches outside the button
        }}
      >
        <TouchableOpacity
          onPress={() => handlePress(2, TABS[2].routeName)}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Add"
          style={{
            width: FAB_OUTER,
            height: FAB_OUTER,
            borderRadius: FAB_OUTER / 2,
            backgroundColor: WHITE,
            justifyContent: 'center',
            alignItems: 'center',
            // Thick white ring via shadow-less border
            borderWidth: 4,
            borderColor: WHITE,
            // Lift the FAB so its centre sits at the bar's top edge
            marginTop: -(FAB_OUTER / 2 - FAB_RISE / 2),
            // Drop shadow
            shadowColor: PRIMARY_GREEN,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.35,
            shadowRadius: 10,
            elevation: 16,
          }}
        >
          {/* Inner green circle */}
          <View
            style={{
              width: FAB_INNER,
              height: FAB_INNER,
              borderRadius: FAB_INNER / 2,
              backgroundColor: PRIMARY_GREEN,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Feather name="plus" size={26} color={WHITE} strokeWidth={2.5} />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}
