// components/shared/FormInput.tsx
import React from 'react';
import { Text, TextInput, View } from 'react-native';

export interface FormInputProps {
  label: string;
  value: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  multiline?: boolean;
  errorMessage?: string;
  editable?: boolean;
  keyboardType?: 'default' | 'phone-pad' | 'email-address' | 'numeric';
}

export default function FormInput({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
  errorMessage,
  editable = true,
  keyboardType = 'default',
}: FormInputProps) {
  return (
    <View className="gap-1.5">
      <Text className="font-label text-xs font-semibold text-neutral-T50 uppercase tracking-wider">
        {label}
      </Text>
      <TextInput
        className={`bg-neutral-T100 border rounded-xl px-4 font-body text-sm text-neutral-T10 ${
          multiline ? 'h-24 pt-3' : 'h-12'
        } ${errorMessage ? 'border-error' : 'border-neutral-T80'} ${
          !editable ? 'opacity-50' : ''
        }`}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#AAABAB"
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        editable={editable}
        keyboardType={keyboardType}
      />
      {errorMessage ? (
        <Text className="font-body text-xs text-error ml-1">{errorMessage}</Text>
      ) : null}
    </View>
  );
}
