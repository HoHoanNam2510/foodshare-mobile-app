import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

interface SaveTemplateModalProps {
  visible: boolean;
  initialName?: string;
  isSaving?: boolean;
  onSave: (name: string) => void;
  onCancel: () => void;
}

export default function SaveTemplateModal({
  visible,
  initialName = '',
  isSaving = false,
  onSave,
  onCancel,
}: SaveTemplateModalProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState(initialName);
  const [androidKeyboardHeight, setAndroidKeyboardHeight] = useState(0);

  useEffect(() => {
    if (visible) setName(initialName);
  }, [visible, initialName]);

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const show = Keyboard.addListener('keyboardDidShow', (e) => {
      setAndroidKeyboardHeight(e.endCoordinates.height);
    });
    const hide = Keyboard.addListener('keyboardDidHide', () => {
      setAndroidKeyboardHeight(0);
    });
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  useEffect(() => {
    if (!visible) setAndroidKeyboardHeight(0);
  }, [visible]);

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onSave(trimmed);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }}
          onPress={onCancel}
        />

        <View
          className="bg-neutral-T100 gap-6 rounded-t-3xl px-6 pt-6"
          style={{
            paddingBottom: Math.max(insets.bottom, 24) + 8,
            marginBottom: androidKeyboardHeight,
          }}
        >
          {/* Handle bar */}
          <View className="bg-neutral-T80 h-1 w-10 self-center rounded-full" />

          {/* Header */}
          <View className="flex-row items-center gap-3">
            <View className="bg-primary-T95 h-10 w-10 items-center justify-center rounded-xl">
              <MaterialIcons name="bookmark-add" size={20} color="#296C24" />
            </View>
            <View className="flex-1">
              <Text className="text-neutral-T10 font-sans text-base font-bold">
                {t('template.saveModalTitle')}
              </Text>
              <Text className="font-body text-neutral-T50 text-xs">
                {t('template.saveModalSubtitle')}
              </Text>
            </View>
          </View>

          {/* Input */}
          <TextInput
            className="bg-neutral-T95 border-neutral-T90 font-body text-neutral-T10 h-14 rounded-xl border px-4 text-base"
            placeholder={t('template.saveModalPlaceholder')}
            placeholderTextColor="#AAABAB"
            value={name}
            onChangeText={setName}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={handleSave}
            maxLength={60}
          />

          {/* Actions */}
          <View className="flex-row gap-3">
            <TouchableOpacity
              className="bg-neutral-T95 h-14 flex-1 items-center justify-center rounded-xl active:opacity-80"
              onPress={onCancel}
              disabled={isSaving}
            >
              <Text className="font-label text-neutral-T50 font-semibold">
                {t('common.cancel')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-primary-T40 h-14 flex-1 items-center justify-center rounded-xl shadow-sm active:opacity-80"
              onPress={handleSave}
              disabled={isSaving || !name.trim()}
            >
              {isSaving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="font-label text-neutral-T100 font-semibold">
                  {t('common.save')}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
