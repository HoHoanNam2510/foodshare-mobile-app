import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

interface ChatInputProps {
  onSend?: (text: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (!message.trim()) return;
    onSend?.(message.trim());
    setMessage('');
  };

  return (
    <View
      className="flex-row items-center gap-2 bg-white mx-4 mb-4 mt-2 px-3 py-2 rounded-full"
      style={{
        shadowColor: '#191c1c',
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: -4 },
        shadowRadius: 16,
        elevation: 5,
        borderWidth: 1,
        borderColor: 'rgba(192,201,185,0.2)',
      }}
    >
      {/* Add button */}
      <TouchableOpacity className="p-2">
        <Feather name="plus-circle" size={22} color="#AAABAB" />
      </TouchableOpacity>

      {/* Text input */}
      <TextInput
        placeholder="Nhập tin nhắn..."
        placeholderTextColor="#AAABAB"
        value={message}
        onChangeText={setMessage}
        multiline
        className="flex-1 font-body text-base text-neutral-T10 py-1.5 max-h-24"
      />

      {/* Emoji or Send */}
      {message.trim().length > 0 ? (
        <TouchableOpacity
          onPress={handleSend}
          disabled={disabled}
          className="w-10 h-10 bg-primary rounded-full items-center justify-center"
          style={{ shadowColor: '#72B866', shadowOpacity: 0.3, shadowRadius: 6, elevation: 3, opacity: disabled ? 0.5 : 1 }}
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
