import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ─── Types (Giữ nguyên) ──────────────────────────────────────────────────────

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

// ─── Tab Config (Giữ nguyên) ─────────────────────────────────────────────────
const TABS: Tab[] = [
  { name: 'Home', routeName: '/', iconName: 'home' },
  { name: 'Explore', routeName: '/Explore', iconName: 'compass' },
  { name: 'Add', routeName: 'ACTION_ADD', iconName: 'plus' }, // Tab đặc biệt để mở Modal
  { name: 'Chat', routeName: '/Chat', iconName: 'message-circle' },
  { name: 'Profile', routeName: '/Profile', iconName: 'user' },
];

// ─── Constants (Đã cập nhật sắc độ theo Tonal Scale mới) ─────────────────────
const PRIMARY_T40 = '#296C24';
const NEUTRAL_T50 = '#757777';
const NEUTRAL_T100 = '#FFFFFF';

// Sizing cho Floating Action Button (index 2)
const FAB_SIZE = 60; // Kích thước nút Add (vuông)
const FAB_RISE = 20; // Số px nút Add nổi lên trên thanh bar top

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

  // Bottom padding: tôn trọng safe area nhưng đảm bảo ít nhất là 8 px
  const bottomPad = Math.max(insets.bottom, 8);

  return (
    /**
     * Outer wrapper: absolute nằm dưới đáy màn hình.
     * Chứa cả thanh bar và nút bấm Add nổi lên.
     */
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        // Nới rộng container lên trên để chứa phần nút Add nổi lên
        paddingTop: FAB_RISE,
      }}
    >
      {/* ── Main Bar ──────────────────────────────────────────────────── */}
      <View
        // FLAT DESIGN: Cập nhật màu sắc và bo góc cứng cáp xl/2xl
        className="bg-neutral-T100 flex-row items-center justify-around border-2 border-neutral-T90 rounded-2xl"
        style={{
          marginHorizontal: 12,
          paddingBottom: bottomPad,
          paddingTop: 10,
          // FLAT RULE: Tiêu diệt toàn bộ shadow/elevation
          shadowColor: 'transparent',
          elevation: 0,
        }}
      >
        {TABS.map((tab, index) => {
          if (index === 2) {
            // Chừa chỗ cho nút Add ở giữa để các Tab siblings cách đều nhau
            return <View key="fab-placeholder" style={{ width: FAB_SIZE }} />;
          }

          const isActive = activeIndex === index;

          return (
            <TouchableOpacity
              key={tab.routeName}
              onPress={() => handlePress(index, tab.routeName)}
              activeOpacity={0.8}
              // FLAT DESIGN: Phản hồi tức thì Snappy
              className="flex-col items-center active:scale-95 transition-transform"
              style={{ gap: 4, minWidth: 48 }}
              accessibilityRole="button"
              accessibilityLabel={tab.name}
              accessibilityState={{ selected: isActive }}
            >
              <Feather
                name={tab.iconName}
                size={22}
                color={isActive ? PRIMARY_T40 : NEUTRAL_T50}
              />
              <Text
                // FLAT DESIGN: Chuyển sang in hoa (font-label, uppercase tracking-wider)
                className="font-label uppercase tracking-wider text-neutral-T10"
                style={{
                  fontSize: 9, // Font-size nhỏ hơn cho chữ in hoa
                  fontWeight: '700',
                  color: isActive ? PRIMARY_T40 : NEUTRAL_T50,
                }}
              >
                {tab.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── Floating Action Button (index 2) - Nút Add nổi lên ─────────── */}
      {/* Căn giữa tuyệt đối; nằm trên thanh bar top FAB_RISE px */}
      <View
        pointerEvents="box-none"
        style={{
          position: 'absolute',
          top: 10, // padding-top of the bar
          left: 0,
          right: 0,
          alignItems: 'center',
          // Không intercept touches bên ngoài nút
        }}
      >
        <TouchableOpacity
          onPress={() => handlePress(2, TABS[2].routeName)}
          activeOpacity={0.9}
          accessibilityRole="button"
          accessibilityLabel="Add"
          // FLAT DESIGN: Zero Shadows, Geometric Radius xl/2xl, Utility Colors
          className="bg-primary-T40 border-4 border-neutral-T100 items-center justify-center rounded-2xl shadow-none active:scale-90 transition-transform"
          style={{
            width: FAB_SIZE,
            height: FAB_SIZE,
            // Nâng nút Add lên để tâm của nó nằm ở top edge của bar
            marginTop: -(FAB_SIZE / 2 - FAB_RISE / 2),
            // FLAT RULE: Tiêu diệt shadow
            shadowColor: 'transparent',
            elevation: 0,
          }}
        >
          <Feather
            name="plus"
            size={26}
            color={NEUTRAL_T100}
            strokeWidth={2.5}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}
