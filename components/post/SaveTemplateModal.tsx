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
import { useColorScheme } from 'nativewind';

interface SaveTemplateModalProps {
  visible: boolean;
  initialName?: string;
  isSaving?: boolean;
  onSave: (name: string) => Promise<void>;
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
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [name, setName] = useState(initialName);
  const [nameError, setNameError] = useState('');
  const [androidKeyboardHeight, setAndroidKeyboardHeight] = useState(0);

  useEffect(() => {
    if (visible) {
      setName(initialName);
      setNameError('');
    }
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

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setNameError(t('template.missingName'));
      return;
    }
    setNameError('');
    try {
      await onSave(trimmed);
    } catch (e) {
      setNameError(e instanceof Error ? e.message : t('template.saveFailed'));
    }
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
          className="bg-neutral-T100 dark:bg-neutral-T20 gap-6 rounded-t-3xl px-6 pt-6"
          style={{
            paddingBottom: Math.max(insets.bottom, 24) + 8,
            marginBottom: androidKeyboardHeight,
          }}
        >
          {/* Handle bar */}
          <View className="bg-neutral-T80 dark:bg-neutral-T30 h-1 w-10 self-center rounded-full" />

          {/* Header */}
          <View className="flex-row items-center gap-3">
            <View className="bg-primary-T95 dark:bg-primary-T20 h-10 w-10 items-center justify-center rounded-xl">
              <MaterialIcons
                name="bookmark-add"
                size={20}
                color={isDark ? '#72B866' : '#296C24'}
              />
            </View>
            <View className="flex-1">
              <Text className="text-neutral-T10 dark:text-neutral-T90 font-sans text-base font-bold">
                {t('template.saveModalTitle')}
              </Text>
              <Text className="font-body text-neutral-T50 dark:text-neutral-T60 text-xs">
                {t('template.saveModalSubtitle')}
              </Text>
            </View>
          </View>

          {/* Input */}
          <View className="gap-1">
            <TextInput
              className={`bg-neutral-T95 dark:bg-neutral-T30 font-body text-neutral-T10 dark:text-neutral-T90 h-14 rounded-xl border px-4 text-base ${nameError ? 'border-red-500' : 'border-neutral-T90 dark:border-neutral-T30'}`}
              placeholder={t('template.saveModalPlaceholder')}
              placeholderTextColor={isDark ? '#757777' : '#AAABAB'}
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (nameError) setNameError('');
              }}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleSave}
              maxLength={60}
            />
            {!!nameError && (
              <Text className="font-label ml-1 text-xs text-red-500">
                {nameError}
              </Text>
            )}
          </View>

          {/* Actions */}
          <View className="flex-row gap-3">
            <TouchableOpacity
              className="bg-neutral-T95 dark:bg-neutral-T30 h-14 flex-1 items-center justify-center rounded-xl active:opacity-80"
              onPress={onCancel}
              disabled={isSaving}
            >
              <Text className="font-label text-neutral-T50 dark:text-neutral-T60 font-semibold">
                {t('common.cancel')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-primary-T40 h-14 flex-1 items-center justify-center rounded-xl shadow-sm active:opacity-80"
              onPress={handleSave}
              disabled={isSaving}
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
