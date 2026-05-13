import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  cancelAnimation,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

interface StepKeys {
  titleKey: string;
  descKey: string;
}

interface GuideData {
  id: string;
  icon: IconName;
  color: string;
  bgColor: string;
  labelKey: string;
  stepsKeys: StepKeys[];
}

const GUIDE_DATA: GuideData[] = [
  {
    id: 'safety',
    icon: 'shield-check',
    color: '#1B5E20',
    bgColor: '#E8F5E9',
    labelKey: 'home.guideSafety',
    stepsKeys: [
      {
        titleKey: 'home.guideSafetyStep1Title',
        descKey: 'home.guideSafetyStep1Desc',
      },
      {
        titleKey: 'home.guideSafetyStep2Title',
        descKey: 'home.guideSafetyStep2Desc',
      },
      {
        titleKey: 'home.guideSafetyStep3Title',
        descKey: 'home.guideSafetyStep3Desc',
      },
    ],
  },
  {
    id: 'pickup',
    icon: 'truck-fast',
    color: '#0D47A1',
    bgColor: '#E3F2FD',
    labelKey: 'home.guideFastPickup',
    stepsKeys: [
      {
        titleKey: 'home.guidePickupStep1Title',
        descKey: 'home.guidePickupStep1Desc',
      },
      {
        titleKey: 'home.guidePickupStep2Title',
        descKey: 'home.guidePickupStep2Desc',
      },
      {
        titleKey: 'home.guidePickupStep3Title',
        descKey: 'home.guidePickupStep3Desc',
      },
    ],
  },
  {
    id: 'waste',
    icon: 'leaf',
    color: '#004D40',
    bgColor: '#E0F2F1',
    labelKey: 'home.guideReduceWaste',
    stepsKeys: [
      {
        titleKey: 'home.guideWasteStep1Title',
        descKey: 'home.guideWasteStep1Desc',
      },
      {
        titleKey: 'home.guideWasteStep2Title',
        descKey: 'home.guideWasteStep2Desc',
      },
      {
        titleKey: 'home.guideWasteStep3Title',
        descKey: 'home.guideWasteStep3Desc',
      },
    ],
  },
  {
    id: 'community',
    icon: 'account-group',
    color: '#4A148C',
    bgColor: '#F3E5F5',
    labelKey: 'home.guideCommunity',
    stepsKeys: [
      {
        titleKey: 'home.guideCommunityStep1Title',
        descKey: 'home.guideCommunityStep1Desc',
      },
      {
        titleKey: 'home.guideCommunityStep2Title',
        descKey: 'home.guideCommunityStep2Desc',
      },
      {
        titleKey: 'home.guideCommunityStep3Title',
        descKey: 'home.guideCommunityStep3Desc',
      },
    ],
  },
];

interface GuideSectionModalProps {
  guideIndex: number | null;
  onClose: () => void;
}

export default function GuideSectionModal({
  guideIndex,
  onClose,
}: GuideSectionModalProps) {
  const { t } = useTranslation();
  const { width: screenWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  // px-6 on each side = 24*2 = 48px total horizontal padding
  const stepContentWidth = screenWidth - 48;

  const [isShowing, setIsShowing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const slideY = useSharedValue(600);
  const iconScale = useSharedValue(1);
  const progressFraction = useSharedValue(0);
  const containerWidth = useSharedValue(0);

  // guideIndex can be null while closed; GUIDE_DATA[0] is safe fallback (never rendered when null)
  const guide = GUIDE_DATA[guideIndex ?? 0];

  const startIconBounce = useCallback(() => {
    cancelAnimation(iconScale);
    iconScale.value = 1;
    iconScale.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 380 }),
        withTiming(0.95, { duration: 150 }),
        withTiming(1.0, { duration: 200 })
      ),
      -1,
      false
    );
  }, [iconScale]);

  const handleClose = useCallback(() => {
    cancelAnimation(iconScale);
    slideY.value = withTiming(600, { duration: 280 }, (finished) => {
      if (finished) runOnJS(setIsShowing)(false);
    });
    onClose();
  }, [onClose, iconScale, slideY]);

  const goToStep = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(guide.stepsKeys.length - 1, index));
      scrollRef.current?.scrollTo({
        x: clamped * stepContentWidth,
        animated: true,
      });
      setCurrentStep(clamped);
      progressFraction.value = withTiming(
        (clamped + 1) / guide.stepsKeys.length,
        { duration: 300 }
      );
    },
    [guide, stepContentWidth, progressFraction]
  );

  const onMomentumScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const index = Math.round(
        e.nativeEvent.contentOffset.x / stepContentWidth
      );
      setCurrentStep(index);
      progressFraction.value = withTiming(
        (index + 1) / guide.stepsKeys.length,
        { duration: 300 }
      );
    },
    [stepContentWidth, guide, progressFraction]
  );

  useEffect(() => {
    if (guideIndex !== null) {
      setIsShowing(true);
      setCurrentStep(0);
      progressFraction.value = 1 / GUIDE_DATA[guideIndex].stepsKeys.length;
      slideY.value = 600;
      slideY.value = withSpring(0, { damping: 22, stiffness: 220 });
      startIconBounce();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guideIndex, startIconBounce]);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: slideY.value }],
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: progressFraction.value * containerWidth.value,
  }));

  if (!isShowing) return null;

  const isLastStep = currentStep === guide.stepsKeys.length - 1;

  return (
    <Modal
      visible
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={{ flex: 1 }}>
        <BlurView
          intensity={25}
          tint="dark"
          style={StyleSheet.absoluteFillObject}
        />
        <Pressable style={{ flex: 1 }} onPress={handleClose} />

        <Pressable onPress={(e) => e.stopPropagation()}>
          <Animated.View
            className="bg-neutral-T100 rounded-t-3xl px-6 pt-4"
            style={[
              cardStyle,
              { paddingBottom: Math.max(insets.bottom, 16) + 8 },
            ]}
          >
            {/* Drag handle */}
            <View className="bg-neutral-T80 mb-5 h-1.5 w-12 self-center rounded-full" />

            {/* Close button */}
            <TouchableOpacity
              onPress={handleClose}
              className="bg-neutral-T90 absolute h-8 w-8 items-center justify-center rounded-full"
              style={{ top: 20, right: 24 }}
            >
              <Feather name="x" size={16} color="#4A4F4F" />
            </TouchableOpacity>

            {/* Animated icon + guide label */}
            <View className="mb-5 items-center">
              <Animated.View
                style={[
                  iconStyle,
                  {
                    backgroundColor: guide.bgColor,
                    borderRadius: 20,
                    padding: 16,
                    marginBottom: 12,
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name={guide.icon}
                  size={36}
                  color={guide.color}
                />
              </Animated.View>
              <Text
                className="text-neutral-T10 font-sans text-xl"
                style={{ fontWeight: '700' }}
              >
                {t(guide.labelKey)}
              </Text>
            </View>

            {/* Step counter */}
            <Text className="font-body text-neutral-T50 mb-2 text-center text-xs">
              {t('home.guideStepCounter', {
                current: currentStep + 1,
                total: guide.stepsKeys.length,
              })}
            </Text>

            {/* Animated progress bar */}
            <View
              className="bg-neutral-T90 mb-5 rounded-full"
              style={{ height: 6 }}
              onLayout={(e) => {
                containerWidth.value = e.nativeEvent.layout.width;
              }}
            >
              <Animated.View
                className="bg-primary-T40 rounded-full"
                style={[progressStyle, { height: 6 }]}
              />
            </View>

            {/* Swipeable step content */}
            <ScrollView
              ref={scrollRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={onMomentumScrollEnd}
              style={{ width: stepContentWidth, height: 148 }}
            >
              {guide.stepsKeys.map((stepKeys, index) => (
                <View key={index} style={{ width: stepContentWidth }}>
                  <Text
                    className="text-neutral-T10 font-sans text-lg leading-tight"
                    style={{ fontWeight: '700', marginBottom: 8 }}
                  >
                    {t(stepKeys.titleKey)}
                  </Text>
                  <Text
                    className="font-body text-neutral-T50 text-sm"
                    style={{ lineHeight: 21 }}
                  >
                    {t(stepKeys.descKey)}
                  </Text>
                </View>
              ))}
            </ScrollView>

            {/* Navigation buttons */}
            <View className="mt-5 flex-row items-center justify-between">
              <TouchableOpacity
                onPress={() => goToStep(currentStep - 1)}
                disabled={currentStep === 0}
                className={`flex-row items-center gap-1.5 rounded-xl px-4 py-2.5 ${
                  currentStep === 0 ? 'opacity-30' : 'bg-neutral-T90'
                }`}
              >
                <Feather name="arrow-left" size={15} color="#191C1C" />
                <Text
                  className="font-body text-neutral-T10 text-sm"
                  style={{ fontWeight: '600' }}
                >
                  {t('home.guidePrev')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={
                  isLastStep ? handleClose : () => goToStep(currentStep + 1)
                }
                className="bg-primary-T40 flex-row items-center gap-1.5 rounded-xl px-5 py-2.5"
              >
                <Text
                  className="font-body text-neutral-T100 text-sm"
                  style={{ fontWeight: '600' }}
                >
                  {isLastStep ? t('home.guideDone') : t('home.guideNext')}
                </Text>
                {isLastStep ? (
                  <MaterialCommunityIcons
                    name="check"
                    size={15}
                    color="#FFFFFF"
                  />
                ) : (
                  <Feather name="arrow-right" size={15} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Pressable>
      </View>
    </Modal>
  );
}
