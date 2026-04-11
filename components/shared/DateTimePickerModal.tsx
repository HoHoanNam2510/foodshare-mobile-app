import React from 'react';
import {
  Modal,
  Pressable,
  View,
  TouchableOpacity,
  Text,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';

interface DateTimePickerModalProps {
  visible: boolean;
  value: Date;
  mode: 'date' | 'time' | 'datetime';
  onChange: (event: unknown, date?: Date) => void;
  onClose: () => void;
  minimumDate?: Date;
  themeVariant?: 'light' | 'dark';
}

const DateTimePickerModal: React.FC<DateTimePickerModalProps> = ({
  visible,
  value,
  mode,
  onChange,
  onClose,
  minimumDate,
  themeVariant = 'light',
}) => {
  const insets = useSafeAreaInsets();

  if (!visible) return null;

  return (
    <Modal
      transparent
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 justify-end"
        style={{ backgroundColor: 'rgba(0,0,0,0.35)' }}
        onPress={onClose}
      >
        <Pressable onPress={(e) => e.stopPropagation()}>
          <View
            className="bg-neutral-T100 rounded-t-3xl px-6 pt-4 pb-6"
            style={{ paddingBottom: Math.max(insets.bottom, 24) + 8 }}
          >
            <View className="w-10 h-1 bg-neutral-T80 rounded-full self-center mb-2" />
            <View style={{ overflow: 'hidden', alignSelf: 'center' }}>
              <DateTimePicker
                value={value}
                mode={mode}
                display="spinner"
                onChange={onChange}
                minimumDate={minimumDate}
                themeVariant={themeVariant}
                style={{ height: 216 }}
              />
            </View>
            <TouchableOpacity
              className="h-14 bg-primary-T40 rounded-xl items-center justify-center shadow-sm active:opacity-80 mt-4"
              onPress={onClose}
            >
              <Text className="font-label font-semibold text-neutral-T100">
                Xong
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default DateTimePickerModal;
