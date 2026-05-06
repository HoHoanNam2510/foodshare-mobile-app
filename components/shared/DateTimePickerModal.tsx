import React from 'react';
import { Modal, Pressable, View, TouchableOpacity, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
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
            className="bg-neutral-T100 rounded-t-3xl px-6 pb-6 pt-4"
            style={{ paddingBottom: Math.max(insets.bottom, 24) + 8 }}
          >
            <View className="bg-neutral-T80 mb-2 h-1 w-10 self-center rounded-full" />
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
              className="bg-primary-T40 mt-4 h-14 items-center justify-center rounded-xl shadow-sm active:opacity-80"
              onPress={onClose}
            >
              <Text className="font-label text-neutral-T100 font-semibold">
                {t('common.done')}
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default DateTimePickerModal;
