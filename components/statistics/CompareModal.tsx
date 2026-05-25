import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { validateCompareRange } from '@/utils/statisticsHelpers';

type PickerField = 'currentFrom' | 'currentTo' | 'compareFrom' | 'compareTo';

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

function formatDate(date: Date | null): string {
  if (!date) return 'Chọn ngày';
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

interface DateFieldProps {
  label: string;
  value: Date | null;
  fieldKey: PickerField;
  activePicker: PickerField | null;
  onToggle: (field: PickerField) => void;
  onChange: (event: DateTimePickerEvent, date?: Date) => void;
}

function DateField({
  label,
  value,
  fieldKey,
  activePicker,
  onToggle,
  onChange,
}: DateFieldProps) {
  const isActive = activePicker === fieldKey;
  return (
    <>
      <Text className="font-body-semibold text-neutral-T50 dark:text-neutral-T60 mb-1 text-xs uppercase tracking-wide">
        {label}
      </Text>
      <TouchableOpacity
        className={`bg-neutral-T95 dark:bg-neutral-T30 mb-1 h-14 flex-row items-center justify-between rounded-xl border px-4 ${
          isActive
            ? 'border-primary'
            : 'border-neutral-T90 dark:border-neutral-T30'
        }`}
        onPress={() => onToggle(fieldKey)}
      >
        <Text
          className={`font-body text-base ${value ? 'text-neutral-T10 dark:text-neutral-T90' : 'text-neutral-T50 dark:text-neutral-T60'}`}
        >
          {formatDate(value)}
        </Text>
        <MaterialIcons name="event" size={20} color="#AAABAB" />
      </TouchableOpacity>
      {isActive && (
        <View
          className="mb-2"
          style={{ overflow: 'hidden', alignSelf: 'center' }}
        >
          <DateTimePicker
            value={value ?? new Date()}
            mode="date"
            display="spinner"
            onChange={onChange}
            themeVariant="light"
            style={{ height: 180 }}
          />
        </View>
      )}
    </>
  );
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
  const [activePicker, setActivePicker] = useState<PickerField | null>(null);
  const insets = useSafeAreaInsets();
  const hasAutoSuggested = useRef(false);

  // Re-sync state and reset auto-suggest flag each time the modal opens
  useEffect(() => {
    if (visible) {
      setCurrentFrom(initialCurrentFrom ? new Date(initialCurrentFrom) : null);
      setCurrentTo(initialCurrentTo ? new Date(initialCurrentTo) : null);
      setCompareFrom(initialCompareFrom ? new Date(initialCompareFrom) : null);
      setCompareTo(initialCompareTo ? new Date(initialCompareTo) : null);
      setActivePicker(null);
      hasAutoSuggested.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  // Auto-suggest compare range once, only when user hasn't manually edited it yet
  useEffect(() => {
    if (currentFrom && currentTo && !hasAutoSuggested.current) {
      hasAutoSuggested.current = true;
      const duration = currentTo.getTime() - currentFrom.getTime();
      const compTo = new Date(currentFrom.getTime() - 24 * 60 * 60 * 1000);
      const compFrom = new Date(compTo.getTime() - duration);
      setCompareFrom(compFrom);
      setCompareTo(compTo);
    }
  }, [currentFrom, currentTo]);

  const handleToggle = (field: PickerField) => {
    setActivePicker((prev) => (prev === field ? null : field));
  };

  const handleDateChange = (_event: DateTimePickerEvent, date?: Date) => {
    if (!date || !activePicker) return;
    switch (activePicker) {
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
    if (!canApply) return;
    onApply({
      from: currentFrom!.toISOString(),
      to: currentTo!.toISOString(),
      compareFrom: compareFrom!.toISOString(),
      compareTo: compareTo!.toISOString(),
    });
  };

  const fieldProps = {
    activePicker,
    onToggle: handleToggle,
    onChange: handleDateChange,
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View className="dark:bg-neutral-T10 flex-1 bg-white">
        {/* Header — paddingTop accounts for status bar since SafeAreaView is unreliable in Modal on iOS */}
        <View
          className="border-neutral-T90 dark:border-neutral-T30 flex-row items-center border-b px-6"
          style={{ paddingTop: insets.top + 12, paddingBottom: 12 }}
        >
          <TouchableOpacity onPress={onClose} className="mr-3">
            <MaterialIcons name="arrow-back" size={24} color="#191C1C" />
          </TouchableOpacity>
          <Text className="font-body-bold text-neutral-T10 dark:text-neutral-T90 text-xl">
            So sánh khoảng thời gian
          </Text>
        </View>

        <ScrollView
          className="flex-1 px-6"
          contentContainerStyle={{ paddingTop: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          <Text className="font-body-bold text-neutral-T10 dark:text-neutral-T90 mb-4 text-base">
            Khoảng hiện tại
          </Text>
          <DateField
            label="Từ ngày"
            value={currentFrom}
            fieldKey="currentFrom"
            {...fieldProps}
          />
          <View className="mt-3">
            <DateField
              label="Đến ngày"
              value={currentTo}
              fieldKey="currentTo"
              {...fieldProps}
            />
          </View>

          <View className="border-neutral-T90 dark:border-neutral-T30 my-5 border-t" />

          <Text className="font-body-bold text-neutral-T10 dark:text-neutral-T90 mb-4 text-base">
            Khoảng so sánh
          </Text>
          <DateField
            label="Từ ngày"
            value={compareFrom}
            fieldKey="compareFrom"
            {...fieldProps}
          />
          <View className="mt-3">
            <DateField
              label="Đến ngày"
              value={compareTo}
              fieldKey="compareTo"
              {...fieldProps}
            />
          </View>
        </ScrollView>

        {/* Apply button */}
        <View
          className="px-6"
          style={{ paddingBottom: Math.max(insets.bottom, 24) }}
        >
          <TouchableOpacity
            className={`h-14 items-center justify-center rounded-xl active:opacity-80 ${
              canApply ? 'bg-primary-T40' : 'bg-neutral-T80 dark:bg-neutral-T30'
            }`}
            onPress={handleApply}
            disabled={!canApply}
          >
            <Text
              className={`font-body-semibold text-base ${
                canApply ? 'text-neutral-T100' : 'text-neutral-T50'
              }`}
            >
              Áp dụng
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
