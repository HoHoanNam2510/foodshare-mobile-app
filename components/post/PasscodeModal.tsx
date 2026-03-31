import React, { useRef, useState } from 'react';
import {
  Modal,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const PASSCODE_LENGTH = 4;

interface PasscodeModalProps {
  visible: boolean;
  onCancel: () => void;
  onVerify: (passcode: string) => void;
  isLoading?: boolean;
}

export default function PasscodeModal({
  visible,
  onCancel,
  onVerify,
  isLoading = false,
}: PasscodeModalProps) {
  const insets = useSafeAreaInsets();
  const [digits, setDigits] = useState(Array(PASSCODE_LENGTH).fill(''));

  const ref0 = useRef<TextInput>(null);
  const ref1 = useRef<TextInput>(null);
  const ref2 = useRef<TextInput>(null);
  const ref3 = useRef<TextInput>(null);
  const refs = [ref0, ref1, ref2, ref3];

  const handleChange = (text: string, index: number) => {
    const char = text.slice(-1);
    const newDigits = [...digits];
    newDigits[index] = char;
    setDigits(newDigits);
    if (char && index < 3) {
      refs[index + 1].current?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !digits[index] && index > 0) {
      refs[index - 1].current?.focus();
    }
  };

  const handleVerify = () => {
    const passcode = digits.join('');
    if (passcode.length === 4) {
      onVerify(passcode);
    }
  };

  const handleCancel = () => {
    setDigits(Array(PASSCODE_LENGTH).fill(''));
    onCancel();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleCancel}
    >
      <Pressable
        className="flex-1 justify-end"
        style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
        onPress={handleCancel}
      >
        <Pressable onPress={(e) => e.stopPropagation()}>
          <View
            className="bg-neutral-T100 rounded-t-3xl px-8 pt-8 gap-6"
            style={{ paddingBottom: Math.max(insets.bottom, 24) + 16 }}
          >
            <View className="items-center gap-2">
              <Text className="font-sans font-bold text-xl text-neutral-T10">
                Confirm listing
              </Text>
              <Text className="font-body text-sm text-neutral-T50 text-center leading-relaxed">
                Please enter your secret pin to confirm and publish this meal
                listing.
              </Text>
            </View>

            <View className="flex-row justify-center gap-4">
              {digits.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={refs[index]}
                  className="w-14 h-16 text-center text-2xl font-sans font-bold bg-neutral-T95 rounded-xl border border-neutral-T90 text-neutral-T10"
                  maxLength={1}
                  keyboardType="numeric"
                  secureTextEntry
                  value={digit}
                  onChangeText={(text) => handleChange(text, index)}
                  onKeyPress={({ nativeEvent }) =>
                    handleKeyPress(nativeEvent.key, index)
                  }
                />
              ))}
            </View>

            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 h-14 rounded-xl bg-neutral-T95 items-center justify-center active:opacity-80"
                onPress={handleCancel}
              >
                <Text className="font-label font-semibold text-neutral-T50">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 h-14 rounded-xl bg-primary-T40 items-center justify-center shadow-sm active:opacity-80"
                onPress={handleVerify}
                disabled={isLoading || digits.join('').length < PASSCODE_LENGTH}
              >
                <Text className="font-label font-semibold text-neutral-T100">
                  {isLoading ? 'Verifying...' : 'Verify'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
