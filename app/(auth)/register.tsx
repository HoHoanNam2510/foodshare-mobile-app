import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTranslation } from 'react-i18next';

import EmailVerifyModal from '@/components/auth/EmailVerifyModal';
import { registerSendCodeApi } from '@/lib/authApi';
import { useAuthStore } from '@/stores/authStore';

export default function RegisterScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { registerSendCode, registerVerify, isLoading } = useAuthStore();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Email verification state
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  const handleRegister = async () => {
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      Alert.alert(t('auth.missingFields'), t('auth.enterAllFields'));
      return;
    }
    if (password.length < 6) {
      Alert.alert(t('auth.weakPassword'), t('auth.passwordMinLength'));
      return;
    }
    try {
      // Bước 1: Gửi mã xác minh về email (CHƯA tạo account)
      await registerSendCode(
        fullName.trim(),
        email.trim().toLowerCase(),
        phoneNumber.trim(),
        password
      );

      setRegisteredEmail(email.trim().toLowerCase());
      setShowVerifyModal(true);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t('errors.tryAgain');
      Alert.alert(t('auth.registerFailed'), message);
    }
  };

  const handleVerifyEmail = async (code: string) => {
    setIsVerifying(true);
    try {
      // Bước 2: Xác minh mã → tạo account + auto-login
      await registerVerify(registeredEmail, code);

      setShowVerifyModal(false);
      Alert.alert(t('common.success'), t('auth.emailVerified'), [
        { text: 'OK', onPress: () => router.replace('/(tabs)' as never) },
      ]);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t('auth.verifyEmail');
      Alert.alert(t('common.error'), message);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      // Gửi lại mã bằng cách gọi lại send-code với cùng thông tin
      await registerSendCodeApi({
        fullName: fullName.trim(),
        email: registeredEmail,
        phoneNumber: phoneNumber.trim() || undefined,
        password,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t('auth.resendCode');
      Alert.alert(t('common.error'), message);
    }
  };

  const handleCancelVerification = () => {
    setShowVerifyModal(false);
  };

  return (
    <View className="bg-neutral-T100 flex-1">
      {/* Gradient header background */}
      <LinearGradient
        colors={['#ABF59C', '#FFDCC6', '#FFFFFF']}
        locations={[0, 0.45, 0.7]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '45%',
        }}
      />

      <SafeAreaView className="flex-1" edges={['top']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          {/* Header with back button */}
          <View className="mb-2 mt-2 flex-row items-center px-6">
            <TouchableOpacity
              onPress={() => router.back()}
              className="bg-neutral-T100 h-10 w-10 items-center justify-center rounded-full shadow-sm active:opacity-80"
            >
              <Feather name="arrow-left" size={20} color="#191C1C" />
            </TouchableOpacity>
            <View className="mr-10 flex-1 items-center">
              <Image
                source={require('../../assets/images/logo.png')}
                style={{ width: 180, height: 72 }}
                resizeMode="contain"
              />
            </View>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
          >
            {/* White card */}
            <View className="bg-neutral-T100 mt-2 flex-1 rounded-t-3xl px-7 pt-8 shadow-md">
              {/* Heading */}
              <Text className="text-neutral-T10 mb-1 text-center font-sans text-3xl font-bold">
                {t('auth.createAccount')}
              </Text>
              <View className="mb-8 flex-row justify-center">
                <Text className="font-body text-neutral-T50 text-sm">
                  {t('auth.alreadyHaveAccount')}{' '}
                </Text>
                <TouchableOpacity onPress={() => router.back()}>
                  <Text className="font-body text-primary-T40 text-sm font-bold">
                    {t('auth.login')}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Form */}
              <View className="gap-5">
                {/* Full Name */}
                <View className="gap-2">
                  <Text className="font-label text-neutral-T50 ml-1 text-sm font-semibold">
                    {t('auth.fullName')}
                  </Text>
                  <TextInput
                    placeholder="Nguyen Van A"
                    placeholderTextColor="#AAABAB"
                    autoCapitalize="words"
                    value={fullName}
                    onChangeText={setFullName}
                    className="font-body text-neutral-T10 bg-neutral-T95 border-neutral-T90 h-14 rounded-xl border px-4 text-base"
                  />
                </View>

                {/* Email */}
                <View className="gap-2">
                  <Text className="font-label text-neutral-T50 ml-1 text-sm font-semibold">
                    {t('auth.email')}
                  </Text>
                  <TextInput
                    placeholder="example@gmail.com"
                    placeholderTextColor="#AAABAB"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={email}
                    onChangeText={setEmail}
                    className="font-body text-neutral-T10 bg-neutral-T95 border-neutral-T90 h-14 rounded-xl border px-4 text-base"
                  />
                </View>

                {/* Phone */}
                <View className="gap-2">
                  <Text className="font-label text-neutral-T50 ml-1 text-sm font-semibold">
                    {t('auth.phoneNumber')}
                  </Text>
                  <TextInput
                    placeholder="+84 987 654 321"
                    placeholderTextColor="#AAABAB"
                    keyboardType="phone-pad"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    className="font-body text-neutral-T10 bg-neutral-T95 border-neutral-T90 h-14 rounded-xl border px-4 text-base"
                  />
                </View>

                {/* Password */}
                <View className="gap-2">
                  <Text className="font-label text-neutral-T50 ml-1 text-sm font-semibold">
                    {t('auth.password')}
                  </Text>
                  <View className="bg-neutral-T95 border-neutral-T90 h-14 flex-row items-center rounded-xl border px-4">
                    <TextInput
                      placeholder={t('auth.passwordMinPlaceholder')}
                      placeholderTextColor="#AAABAB"
                      secureTextEntry={!showPassword}
                      value={password}
                      onChangeText={setPassword}
                      className="font-body text-neutral-T10 flex-1 text-base"
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      className="p-1"
                    >
                      <Feather
                        name={showPassword ? 'eye' : 'eye-off'}
                        size={20}
                        color="#AAABAB"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Register button */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleRegister}
                disabled={isLoading}
                className="bg-primary-T40 mb-10 mt-8 h-14 items-center justify-center rounded-xl shadow-sm active:opacity-80"
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text className="font-label text-neutral-T100 text-base font-semibold">
                    {t('auth.createAccount')}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* Email verification modal */}
      <EmailVerifyModal
        visible={showVerifyModal}
        email={registeredEmail}
        onCancel={handleCancelVerification}
        onVerify={handleVerifyEmail}
        onResend={handleResendVerification}
        isLoading={isVerifying}
      />
    </View>
  );
}
