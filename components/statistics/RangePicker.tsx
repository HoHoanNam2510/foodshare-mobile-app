import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
  Platform,
} from 'react-native';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StatisticsRange } from '@/types/statistics';

interface RangePickerProps {
  selectedRange: StatisticsRange;
  onRangeChange: (range: StatisticsRange, from?: string, to?: string) => void;
}

const RANGE_OPTIONS: { label: string; value: StatisticsRange }[] = [
  { label: '7 ngày', value: '7d' },
  { label: '30 ngày', value: '30d' },
  { label: '12 tháng', value: '12m' },
  { label: 'Tùy chỉnh', value: 'custom' },
];

function formatDate(date: Date): string {
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export default function RangePicker({
  selectedRange,
  onRangeChange,
}: RangePickerProps) {
  const insets = useSafeAreaInsets();
  const [showModal, setShowModal] = useState(false);
  const [customFrom, setCustomFrom] = useState<Date>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d;
  });
  const [customTo, setCustomTo] = useState<Date>(new Date());
  const [activePicker, setActivePicker] = useState<'from' | 'to' | null>(null);

  const handleChipPress = (range: StatisticsRange) => {
    if (range === 'custom') {
      setShowModal(true);
    } else {
      onRangeChange(range);
    }
  };

  const handleDateChange = (event: DateTimePickerEvent, date?: Date) => {
    if (!date) return;
    if (activePicker === 'from') setCustomFrom(date);
    else if (activePicker === 'to') setCustomTo(date);
    // Android spinner fires onChange continuously — keep picker open
    if (Platform.OS === 'android' && event.type === 'set') {
      // do not auto-close; user confirms via button
    }
  };

  const handleApply = () => {
    if (customFrom > customTo) return;
    setActivePicker(null);
    setShowModal(false);
    onRangeChange('custom', customFrom.toISOString(), customTo.toISOString());
  };

  const handleClose = () => {
    setActivePicker(null);
    setShowModal(false);
  };

  return (
    <>
      <View className="flex-row flex-wrap gap-2">
        {RANGE_OPTIONS.map((option) => {
          const isActive = selectedRange === option.value;
          return (
            <TouchableOpacity
              key={option.value}
              onPress={() => handleChipPress(option.value)}
              className={`rounded-lg border px-4 py-2 ${
                isActive
                  ? 'bg-primary border-primary'
                  : 'border-neutral-T80 bg-white'
              }`}
            >
              <Text
                className={`font-body-semibold text-sm ${
                  isActive ? 'text-white' : 'text-neutral-T30'
                }`}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Modal
        transparent
        animationType="slide"
        visible={showModal}
        onRequestClose={handleClose}
      >
        <Pressable
          className="flex-1 justify-end"
          style={{ backgroundColor: 'rgba(0,0,0,0.35)' }}
          onPress={handleClose}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View
              className="bg-neutral-T100 rounded-t-3xl px-6 pt-4"
              style={{ paddingBottom: Math.max(insets.bottom, 24) + 8 }}
            >
              {/* Handle bar */}
              <View className="bg-neutral-T80 mb-4 h-1 w-10 self-center rounded-full" />

              <Text className="font-body-bold text-neutral-T10 mb-5 text-base">
                Chọn khoảng thời gian
              </Text>

              {/* From field */}
              <Text className="font-body-semibold text-neutral-T50 mb-1 text-xs uppercase tracking-wide">
                Từ ngày
              </Text>
              <TouchableOpacity
                className={`bg-neutral-T95 mb-1 h-14 flex-row items-center justify-between rounded-xl border px-4 ${
                  activePicker === 'from'
                    ? 'border-primary'
                    : 'border-neutral-T90'
                }`}
                onPress={() =>
                  setActivePicker(activePicker === 'from' ? null : 'from')
                }
              >
                <Text className="font-body text-neutral-T10 text-base">
                  {formatDate(customFrom)}
                </Text>
                <MaterialIcons name="event" size={20} color="#AAABAB" />
              </TouchableOpacity>
              {activePicker === 'from' && (
                <View
                  className="mb-2"
                  style={{ overflow: 'hidden', alignSelf: 'center' }}
                >
                  <DateTimePicker
                    value={customFrom}
                    mode="date"
                    display="spinner"
                    onChange={handleDateChange}
                    themeVariant="light"
                    style={{ height: 180 }}
                  />
                </View>
              )}

              {/* To field */}
              <Text className="font-body-semibold text-neutral-T50 mb-1 mt-3 text-xs uppercase tracking-wide">
                Đến ngày
              </Text>
              <TouchableOpacity
                className={`bg-neutral-T95 mb-1 h-14 flex-row items-center justify-between rounded-xl border px-4 ${
                  activePicker === 'to'
                    ? 'border-primary'
                    : 'border-neutral-T90'
                }`}
                onPress={() =>
                  setActivePicker(activePicker === 'to' ? null : 'to')
                }
              >
                <Text className="font-body text-neutral-T10 text-base">
                  {formatDate(customTo)}
                </Text>
                <MaterialIcons name="event" size={20} color="#AAABAB" />
              </TouchableOpacity>
              {activePicker === 'to' && (
                <View
                  className="mb-2"
                  style={{ overflow: 'hidden', alignSelf: 'center' }}
                >
                  <DateTimePicker
                    value={customTo}
                    mode="date"
                    display="spinner"
                    onChange={handleDateChange}
                    themeVariant="light"
                    style={{ height: 180 }}
                  />
                </View>
              )}

              {/* Confirm button */}
              <TouchableOpacity
                className="bg-primary-T40 mt-5 h-14 items-center justify-center rounded-xl active:opacity-80"
                onPress={handleApply}
              >
                <Text className="font-body-semibold text-neutral-T100 text-base">
                  Xác nhận
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
