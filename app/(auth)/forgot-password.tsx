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
import {
  ApiError,
  forgotPasswordSendCodeApi,
  forgotPasswordVerifyCodeApi,
  forgotPasswordResetApi,
} from '@/lib/authApi';
import { useThemeColors } from '@/lib/hooks/useThemeColors';

type Step = 'email' | 'password';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const colors = useThemeColors();

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [verifiedCode, setVerifiedCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  const handleSendCode = async () => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      Alert.alert(t('auth.missingFields'), t('auth.emailRequired'));
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      Alert.alert(t('auth.missingFields'), t('auth.invalidEmail'));
      return;
    }

    setIsSendingCode(true);
    try {
      await forgotPasswordSendCodeApi(trimmedEmail);
      setEmail(trimmedEmail);
      setShowVerifyModal(true);
    } catch (error) {
      if (error instanceof ApiError && error.errorCode === 'EMAIL_NOT_FOUND') {
        Alert.alert(
          t('auth.emailNotRegistered'),
          t('auth.emailNotRegisteredMsg'),
          [
            { text: t('common.cancel'), style: 'cancel' },
            {
              text: t('auth.goToRegister'),
              onPress: () => router.replace('/(auth)/register' as never),
            },
          ]
        );
        return;
      }
      if (error instanceof ApiError && error.errorCode === 'GOOGLE_ACCOUNT') {
        Alert.alert(
          t('auth.googleAccountOnly'),
          t('auth.googleAccountOnlyMsg'),
          [
            {
              text: 'OK',
              onPress: () => router.replace('/(auth)/login' as never),
            },
          ]
        );
        return;
      }
      const message =
        error instanceof Error ? error.message : t('errors.tryAgain');
      Alert.alert(t('auth.sendCodeFailed'), message);
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleVerifyCode = async (code: string) => {
    setIsVerifying(true);
    try {
      await forgotPasswordVerifyCodeApi(email, code);
      setVerifiedCode(code);
      setShowVerifyModal(false);
      setStep('password');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t('errors.tryAgain');
      Alert.alert(t('common.error'), message);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    try {
      await forgotPasswordSendCodeApi(email);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t('errors.tryAgain');
      Alert.alert(t('auth.sendCodeFailed'), message);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword.trim() || !confirmPassword.trim()) {
      Alert.alert(t('auth.missingFields'), t('auth.enterAllFields'));
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert(t('auth.weakPassword'), t('auth.passwordMinLength'));
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert(t('common.error'), t('auth.passwordsDoNotMatch'));
      return;
    }

    setIsResetting(true);
    try {
      await forgotPasswordResetApi(email, verifiedCode, newPassword);
      Alert.alert(
        t('auth.resetPasswordSuccess'),
        t('auth.resetPasswordSuccessMsg'),
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(auth)/login' as never),
          },
        ]
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t('errors.tryAgain');
      Alert.alert(t('auth.forgotPasswordFailed'), message);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <View className="bg-neutral-T100 dark:bg-neutral-T10 flex-1">
      <LinearGradient
        colors={colors.loginGradient as [string, string, string]}
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
          {/* Header */}
          <View className="mb-2 mt-2 flex-row items-center px-6">
            <TouchableOpacity
              onPress={() => router.back()}
              className="bg-neutral-T100 dark:bg-neutral-T30 h-10 w-10 items-center justify-center rounded-full shadow-sm active:opacity-80 dark:shadow-none"
            >
              <Feather name="arrow-left" size={20} color={colors.textPrimary} />
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
            <View className="bg-neutral-T100 dark:bg-neutral-T20 mt-2 flex-1 rounded-t-3xl px-7 pt-8 shadow-md dark:shadow-none">
              {step === 'email' ? (
                <>
                  <Text className="text-neutral-T10 dark:text-neutral-T90 mb-1 text-center font-sans text-3xl font-bold">
                    {t('auth.forgotPasswordTitle')}
                  </Text>
                  <Text className="font-body text-neutral-T50 dark:text-neutral-T60 mb-8 text-center text-sm">
                    {t('auth.forgotPasswordSubtitle')}
                  </Text>

                  <View className="gap-2">
                    <Text className="font-label text-neutral-T50 dark:text-neutral-T60 ml-1 text-sm font-semibold">
                      {t('auth.email')}
                    </Text>
                    <TextInput
                      placeholder="example@gmail.com"
                      placeholderTextColor={colors.placeholder}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      value={email}
                      onChangeText={setEmail}
                      className="font-body text-neutral-T10 dark:text-neutral-T90 bg-neutral-T95 dark:bg-neutral-T30 border-neutral-T90 dark:border-neutral-T30 h-14 rounded-xl border px-4 text-base"
                    />
                  </View>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={handleSendCode}
                    disabled={isSendingCode}
                    className="bg-primary-T40 dark:bg-primary-T50 mb-10 mt-8 h-14 items-center justify-center rounded-xl shadow-sm active:opacity-80"
                  >
                    {isSendingCode ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text className="font-label text-neutral-T100 text-base font-semibold">
                        {t('auth.sendResetCode')}
                      </Text>
                    )}
                  </TouchableOpacity>

                  <View className="mb-8 flex-row justify-center">
                    <Text className="font-body text-neutral-T50 dark:text-neutral-T60 text-sm">
                      {t('auth.alreadyHaveAccount')}{' '}
                    </Text>
                    <TouchableOpacity onPress={() => router.back()}>
                      <Text className="font-body text-primary-T40 dark:text-primary-T60 text-sm font-bold">
                        {t('auth.login')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <>
                  <Text className="text-neutral-T10 dark:text-neutral-T90 mb-1 text-center font-sans text-3xl font-bold">
                    {t('auth.resetPasswordTitle')}
                  </Text>
                  <Text className="font-body text-neutral-T50 dark:text-neutral-T60 mb-8 text-center text-sm">
                    {t('auth.resetPasswordSubtitle')}
                  </Text>

                  <View className="gap-5">
                    {/* New password */}
                    <View className="gap-2">
                      <Text className="font-label text-neutral-T50 dark:text-neutral-T60 ml-1 text-sm font-semibold">
                        {t('auth.newPassword')}
                      </Text>
                      <View className="bg-neutral-T95 dark:bg-neutral-T30 border-neutral-T90 dark:border-neutral-T30 h-14 flex-row items-center rounded-xl border px-4">
                        <TextInput
                          placeholder={t('auth.newPasswordPlaceholder')}
                          placeholderTextColor={colors.placeholder}
                          secureTextEntry={!showNewPassword}
                          value={newPassword}
                          onChangeText={setNewPassword}
                          className="font-body text-neutral-T10 dark:text-neutral-T90 flex-1 text-base"
                        />
                        <TouchableOpacity
                          onPress={() => setShowNewPassword(!showNewPassword)}
                          className="p-1"
                        >
                          <Feather
                            name={showNewPassword ? 'eye' : 'eye-off'}
                            size={20}
                            color="#AAABAB"
                          />
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Confirm password */}
                    <View className="gap-2">
                      <Text className="font-label text-neutral-T50 dark:text-neutral-T60 ml-1 text-sm font-semibold">
                        {t('auth.confirmNewPassword')}
                      </Text>
                      <View className="bg-neutral-T95 dark:bg-neutral-T30 border-neutral-T90 dark:border-neutral-T30 h-14 flex-row items-center rounded-xl border px-4">
                        <TextInput
                          placeholder={t('auth.confirmNewPasswordPlaceholder')}
                          placeholderTextColor={colors.placeholder}
                          secureTextEntry={!showConfirmPassword}
                          value={confirmPassword}
                          onChangeText={setConfirmPassword}
                          className="font-body text-neutral-T10 dark:text-neutral-T90 flex-1 text-base"
                        />
                        <TouchableOpacity
                          onPress={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="p-1"
                        >
                          <Feather
                            name={showConfirmPassword ? 'eye' : 'eye-off'}
                            size={20}
                            color="#AAABAB"
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={handleResetPassword}
                    disabled={isResetting}
                    className="bg-primary-T40 dark:bg-primary-T50 mb-10 mt-8 h-14 items-center justify-center rounded-xl shadow-sm active:opacity-80"
                  >
                    {isResetting ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text className="font-label text-neutral-T100 text-base font-semibold">
                        {t('auth.resetPassword')}
                      </Text>
                    )}
                  </TouchableOpacity>

                  <View className="mb-8 flex-row justify-center">
                    <TouchableOpacity
                      onPress={() => router.replace('/(auth)/login' as never)}
                    >
                      <Text className="font-body text-primary-T40 dark:text-primary-T60 text-sm font-bold">
                        {t('auth.backToLogin')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <EmailVerifyModal
        visible={showVerifyModal}
        email={email}
        onCancel={() => setShowVerifyModal(false)}
        onVerify={handleVerifyCode}
        onResend={handleResendCode}
        isLoading={isVerifying}
      />
    </View>
  );
}
