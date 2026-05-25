import { Feather } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TextInput, TouchableOpacity, View } from 'react-native';
import { useThemeColors } from '@/lib/hooks/useThemeColors';

interface ChatInputProps {
  onSend?: (text: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const { t } = useTranslation();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = useThemeColors();
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (!message.trim()) return;
    onSend?.(message.trim());
    setMessage('');
  };

  return (
    <View
      className="bg-neutral-T100 dark:bg-neutral-T20 mx-4 mb-4 mt-2 flex-row items-center gap-2 rounded-full px-3 py-2"
      style={{
        shadowColor: '#191c1c',
        shadowOpacity: isDark ? 0 : 0.08,
        shadowOffset: { width: 0, height: -4 },
        shadowRadius: 16,
        elevation: isDark ? 0 : 5,
        borderWidth: 1,
        borderColor: isDark ? 'rgba(69,71,71,0.6)' : 'rgba(192,201,185,0.2)',
      }}
    >
      {/* Add button */}
      <TouchableOpacity className="p-2">
        <Feather name="plus-circle" size={22} color="#AAABAB" />
      </TouchableOpacity>

      {/* Text input */}
      <TextInput
        placeholder={t('chat.typeMessage')}
        placeholderTextColor={colors.placeholder}
        value={message}
        onChangeText={setMessage}
        multiline
        className="font-body text-neutral-T10 dark:text-neutral-T90 max-h-24 flex-1 py-1.5 text-base"
      />

      {/* Emoji or Send */}
      {message.trim().length > 0 ? (
        <TouchableOpacity
          onPress={handleSend}
          disabled={disabled}
          className="bg-primary h-10 w-10 items-center justify-center rounded-full"
          style={{
            shadowColor: '#72B866',
            shadowOpacity: 0.3,
            shadowRadius: 6,
            elevation: 3,
            opacity: disabled ? 0.5 : 1,
          }}
        >
          <Feather name="send" size={16} color="white" />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity className="p-2">
          <Feather name="smile" size={22} color="#AAABAB" />
        </TouchableOpacity>
      )}
    </View>
  );
}
