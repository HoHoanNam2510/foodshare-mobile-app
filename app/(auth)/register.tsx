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

import EmailVerifyModal from '@/components/auth/EmailVerifyModal';
import { registerSendCodeApi } from '@/lib/authApi';
import { useAuthStore } from '@/stores/authStore';

export default function RegisterScreen() {
  const router = useRouter();
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
      Alert.alert('Missing fields', 'Please fill in all required fields.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Weak password', 'Password must be at least 6 characters.');
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
        error instanceof Error
          ? error.message
          : 'Registration failed. Please try again.';
      Alert.alert('Registration failed', message);
    }
  };

  const handleVerifyEmail = async (code: string) => {
    setIsVerifying(true);
    try {
      // Bước 2: Xác minh mã → tạo account + auto-login
      await registerVerify(registeredEmail, code);

      setShowVerifyModal(false);
      Alert.alert('Success', 'Email verified! Your account is ready.', [
        { text: 'OK', onPress: () => router.replace('/(tabs)' as never) },
      ]);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Verification failed';
      Alert.alert('Error', message);
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
        error instanceof Error ? error.message : 'Failed to resend code';
      Alert.alert('Error', message);
    }
  };

  const handleCancelVerification = () => {
    setShowVerifyModal(false);
  };

  return (
    <View className="flex-1 bg-neutral-T100">
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
          <View className="flex-row items-center px-6 mt-2 mb-2">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 rounded-full bg-neutral-T100 items-center justify-center shadow-sm active:opacity-80"
            >
              <Feather name="arrow-left" size={20} color="#191C1C" />
            </TouchableOpacity>
            <View className="flex-1 items-center mr-10">
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
            <View className="flex-1 bg-neutral-T100 rounded-t-3xl px-7 pt-8 mt-2 shadow-md">
              {/* Heading */}
              <Text className="font-sans text-3xl font-bold text-neutral-T10 text-center mb-1">
                Create account
              </Text>
              <View className="flex-row justify-center mb-8">
                <Text className="font-body text-sm text-neutral-T50">
                  Already have an account?{' '}
                </Text>
                <TouchableOpacity onPress={() => router.back()}>
                  <Text className="font-body text-sm font-bold text-primary-T40">
                    Log in
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Form */}
              <View className="gap-5">
                {/* Full Name */}
                <View className="gap-2">
                  <Text className="font-label font-semibold text-sm text-neutral-T50 ml-1">
                    Full name
                  </Text>
                  <TextInput
                    placeholder="Nguyen Van A"
                    placeholderTextColor="#AAABAB"
                    autoCapitalize="words"
                    value={fullName}
                    onChangeText={setFullName}
                    className="font-body text-base text-neutral-T10 bg-neutral-T95 rounded-xl h-14 px-4 border border-neutral-T90"
                  />
                </View>

                {/* Email */}
                <View className="gap-2">
                  <Text className="font-label font-semibold text-sm text-neutral-T50 ml-1">
                    Email
                  </Text>
                  <TextInput
                    placeholder="example@gmail.com"
                    placeholderTextColor="#AAABAB"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={email}
                    onChangeText={setEmail}
                    className="font-body text-base text-neutral-T10 bg-neutral-T95 rounded-xl h-14 px-4 border border-neutral-T90"
                  />
                </View>

                {/* Phone */}
                <View className="gap-2">
                  <Text className="font-label font-semibold text-sm text-neutral-T50 ml-1">
                    Phone number
                  </Text>
                  <TextInput
                    placeholder="+84 987 654 321"
                    placeholderTextColor="#AAABAB"
                    keyboardType="phone-pad"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    className="font-body text-base text-neutral-T10 bg-neutral-T95 rounded-xl h-14 px-4 border border-neutral-T90"
                  />
                </View>

                {/* Password */}
                <View className="gap-2">
                  <Text className="font-label font-semibold text-sm text-neutral-T50 ml-1">
                    Password
                  </Text>
                  <View className="flex-row items-center bg-neutral-T95 rounded-xl h-14 px-4 border border-neutral-T90">
                    <TextInput
                      placeholder="At least 6 characters"
                      placeholderTextColor="#AAABAB"
                      secureTextEntry={!showPassword}
                      value={password}
                      onChangeText={setPassword}
                      className="font-body text-base text-neutral-T10 flex-1"
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
                className="bg-primary-T40 h-14 rounded-xl items-center justify-center mt-8 mb-10 shadow-sm active:opacity-80"
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text className="font-label font-semibold text-base text-neutral-T100">
                    Create account
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
