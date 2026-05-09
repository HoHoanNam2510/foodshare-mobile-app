import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { validateCompareRange } from '@/utils/statisticsHelpers';

interface CompareModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (params: {
    from: string;
    to: string;
    compareFrom: string;
    compareTo: string;
  }) => void;
  initialCurrentFrom?: string;
  initialCurrentTo?: string;
  initialCompareFrom?: string;
  initialCompareTo?: string;
}

export default function CompareModal({
  visible,
  onClose,
  onApply,
  initialCurrentFrom,
  initialCurrentTo,
  initialCompareFrom,
  initialCompareTo,
}: CompareModalProps) {
  const [currentFrom, setCurrentFrom] = useState<Date | null>(
    initialCurrentFrom ? new Date(initialCurrentFrom) : null
  );
  const [currentTo, setCurrentTo] = useState<Date | null>(
    initialCurrentTo ? new Date(initialCurrentTo) : null
  );
  const [compareFrom, setCompareFrom] = useState<Date | null>(
    initialCompareFrom ? new Date(initialCompareFrom) : null
  );
  const [compareTo, setCompareTo] = useState<Date | null>(
    initialCompareTo ? new Date(initialCompareTo) : null
  );

  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<
    'currentFrom' | 'currentTo' | 'compareFrom' | 'compareTo'
  >('currentFrom');

  // Auto-suggest compare range when current range changes
  useEffect(() => {
    if (currentFrom && currentTo) {
      const duration = currentTo.getTime() - currentFrom.getTime();
      const compTo = new Date(currentFrom.getTime() - 24 * 60 * 60 * 1000);
      const compFrom = new Date(compTo.getTime() - duration);
      setCompareFrom(compFrom);
      setCompareTo(compTo);
    }
  }, [currentFrom, currentTo]);

  const handleDateChange = (event: DateTimePickerEvent, date?: Date) => {
    setShowPicker(false);
    if (event.type === 'dismissed' || !date) return;
    switch (pickerMode) {
      case 'currentFrom':
        setCurrentFrom(date);
        break;
      case 'currentTo':
        setCurrentTo(date);
        break;
      case 'compareFrom':
        setCompareFrom(date);
        break;
      case 'compareTo':
        setCompareTo(date);
        break;
    }
  };

  const openPicker = (
    mode: 'currentFrom' | 'currentTo' | 'compareFrom' | 'compareTo'
  ) => {
    setPickerMode(mode);
    setShowPicker(true);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Chọn ngày';
    return date.toLocaleDateString('vi-VN');
  };

  const canApply =
    currentFrom &&
    currentTo &&
    compareFrom &&
    compareTo &&
    validateCompareRange(
      { from: currentFrom, to: currentTo },
      { from: compareFrom, to: compareTo }
    );

  const handleApply = () => {
    if (canApply) {
      onApply({
        from: currentFrom!.toISOString(),
        to: currentTo!.toISOString(),
        compareFrom: compareFrom!.toISOString(),
        compareTo: compareTo!.toISOString(),
      });
    }
  };

  const pickerValue =
    pickerMode === 'currentFrom'
      ? (currentFrom ?? new Date())
      : pickerMode === 'currentTo'
        ? (currentTo ?? new Date())
        : pickerMode === 'compareFrom'
          ? (compareFrom ?? new Date())
          : (compareTo ?? new Date());

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-white p-4">
        <View className="mb-6 flex-row items-center justify-between">
          <Text className="font-body-bold text-neutral-T10 text-xl">
            So sánh khoảng thời gian
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Text className="text-primary font-body-semibold">Đóng</Text>
          </TouchableOpacity>
        </View>

        {/* Current range */}
        <View className="mb-6">
          <Text className="font-body-semibold text-neutral-T20 mb-2 text-base">
            Khoảng hiện tại
          </Text>
          <View className="flex-row gap-4">
            <TouchableOpacity
              className="border-neutral-T80 flex-1 rounded-lg border p-3"
              onPress={() => openPicker('currentFrom')}
            >
              <Text className="text-neutral-T30 text-sm">
                {formatDate(currentFrom)}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="border-neutral-T80 flex-1 rounded-lg border p-3"
              onPress={() => openPicker('currentTo')}
            >
              <Text className="text-neutral-T30 text-sm">
                {formatDate(currentTo)}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Compare range */}
        <View className="mb-8">
          <Text className="font-body-semibold text-neutral-T20 mb-2 text-base">
            Khoảng so sánh
          </Text>
          <View className="flex-row gap-4">
            <TouchableOpacity
              className="border-neutral-T80 flex-1 rounded-lg border p-3"
              onPress={() => openPicker('compareFrom')}
            >
              <Text className="text-neutral-T30 text-sm">
                {formatDate(compareFrom)}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="border-neutral-T80 flex-1 rounded-lg border p-3"
              onPress={() => openPicker('compareTo')}
            >
              <Text className="text-neutral-T30 text-sm">
                {formatDate(compareTo)}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          className={`rounded-xl p-4 ${canApply ? 'bg-primary' : 'bg-neutral-T80'}`}
          onPress={handleApply}
          disabled={!canApply}
        >
          <Text className="font-body-bold text-center text-white">Áp dụng</Text>
        </TouchableOpacity>

        {showPicker && (
          <DateTimePicker
            value={pickerValue}
            mode="date"
            onChange={handleDateChange}
          />
        )}
      </View>
    </Modal>
  );
}
