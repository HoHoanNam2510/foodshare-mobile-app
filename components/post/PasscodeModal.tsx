import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
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

const PASSCODE_LENGTH = 6;

interface PasscodeModalProps {
  visible: boolean;
  onCancel: () => void;
  onVerify: (passcode: string) => void;
  onResend?: () => Promise<void>;
  isLoading?: boolean;
  deliveryMethod?: 'email' | null;
}

export default function PasscodeModal({
  visible,
  onCancel,
  onVerify,
  onResend,
  isLoading = false,
  deliveryMethod = null,
}: PasscodeModalProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [digits, setDigits] = useState(Array(PASSCODE_LENGTH).fill(''));
  const [isResending, setIsResending] = useState(false);
  const ref0 = useRef<TextInput>(null);
  const ref1 = useRef<TextInput>(null);
  const ref2 = useRef<TextInput>(null);
  const ref3 = useRef<TextInput>(null);
  const ref4 = useRef<TextInput>(null);
  const ref5 = useRef<TextInput>(null);
  const refs = [ref0, ref1, ref2, ref3, ref4, ref5];

  const handleChange = (text: string, index: number) => {
    const char = text.slice(-1);
    const newDigits = [...digits];
    newDigits[index] = char;
    setDigits(newDigits);
    if (char && index < PASSCODE_LENGTH - 1) {
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
    if (passcode.length === PASSCODE_LENGTH) {
      onVerify(passcode);
    }
  };

  const handleCancel = () => {
    setDigits(Array(PASSCODE_LENGTH).fill(''));
    onCancel();
  };

  const handleResend = async () => {
    if (!onResend || isResending) return;
    setIsResending(true);
    try {
      await onResend();
      setDigits(Array(PASSCODE_LENGTH).fill(''));
      refs[0].current?.focus();
    } finally {
      setIsResending(false);
    }
  };

  const deliveryHint =
    deliveryMethod === 'email'
      ? t('post.emailCodeHint')
      : t('post.pinCodeHint');

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={handleCancel}
    >
      <View style={{ flex: 1 }}>
        {/* Backdrop — taps outside to dismiss */}
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }}
          onPress={handleCancel}
        />

        {/* Sheet sits at the bottom, KAV only wraps the sheet */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View
            className="bg-neutral-T100 rounded-t-3xl px-8 pt-8 gap-6"
            style={{ paddingBottom: Math.max(insets.bottom, 24) + 16 }}
          >
            <View className="items-center gap-2">
              <Text className="font-sans font-bold text-xl text-neutral-T10">
                {t('post.confirmListing')}
              </Text>
              <Text className="font-body text-sm text-neutral-T50 text-center leading-relaxed">
                {deliveryHint}
              </Text>
            </View>

            <View className="flex-row justify-center gap-3">
              {digits.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={refs[index]}
                  className="w-12 h-14 text-center text-2xl font-sans font-bold bg-neutral-T95 rounded-xl border border-neutral-T90 text-neutral-T10"
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

            {onResend && (
              <TouchableOpacity
                className="items-center py-1"
                onPress={handleResend}
                disabled={isResending}
              >
                {isResending ? (
                  <ActivityIndicator size="small" color="#296C24" />
                ) : (
                  <Text className="font-label text-sm font-semibold text-primary-T40">
                    {t('post.resendCode')}
                  </Text>
                )}
              </TouchableOpacity>
            )}

            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 h-14 rounded-xl bg-neutral-T95 items-center justify-center active:opacity-80"
                onPress={handleCancel}
              >
                <Text className="font-label font-semibold text-neutral-T50">
                  {t('common.cancel')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 h-14 rounded-xl bg-primary-T40 items-center justify-center shadow-sm active:opacity-80"
                onPress={handleVerify}
                disabled={isLoading || digits.join('').length < PASSCODE_LENGTH}
              >
                <Text className="font-label font-semibold text-neutral-T100">
                  {isLoading ? t('common.verifying', 'Verifying...') : t('common.verify', 'Verify')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
