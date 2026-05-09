import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
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

export default function RangePicker({
  selectedRange,
  onRangeChange,
}: RangePickerProps) {
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [tempFrom, setTempFrom] = useState<Date | null>(null);
  const [tempTo, setTempTo] = useState<Date | null>(null);
  const [pickerMode, setPickerMode] = useState<'from' | 'to'>('from');

  const handlePress = (range: StatisticsRange) => {
    if (range === 'custom') {
      setPickerMode('from');
      setDatePickerVisibility(true);
    } else {
      onRangeChange(range);
    }
  };

  const handleConfirm = (date: Date) => {
    if (pickerMode === 'from') {
      setTempFrom(date);
      setPickerMode('to');
    } else {
      setTempTo(date);
      setDatePickerVisibility(false);
      if (tempFrom) {
        onRangeChange('custom', tempFrom.toISOString(), date.toISOString());
      }
    }
  };

  const handleCancel = () => {
    setDatePickerVisibility(false);
    setPickerMode('from');
    setTempFrom(null);
    setTempTo(null);
  };

  return (
    <View className="my-4 flex-row flex-wrap gap-2">
      {RANGE_OPTIONS.map((option) => {
        const isActive = selectedRange === option.value;
        return (
          <TouchableOpacity
            key={option.value}
            onPress={() => handlePress(option.value)}
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

      {isDatePickerVisible && (
        <DateTimePicker
          value={
            pickerMode === 'from'
              ? (tempFrom ?? new Date())
              : (tempTo ?? new Date())
          }
          mode="date"
          onChange={(event: DateTimePickerEvent, date?: Date) => {
            if (event.type === 'dismissed' || !date) {
              handleCancel();
            } else {
              handleConfirm(date);
            }
          }}
        />
      )}
    </View>
  );
}
