import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter } from 'expo-router';
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

import { useAuthStore } from '@/stores/authStore';

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing fields', 'Please enter both email and password.');
      return;
    }
    try {
      await login(email.trim().toLowerCase(), password);
      router.replace('/(tabs)/home' as never);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Login failed. Please try again.';
      Alert.alert('Login failed', message);
    }
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
          height: '55%',
        }}
      />

      <SafeAreaView className="flex-1" edges={['top']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
          >
            {/* Logo */}
            <View className="items-center mt-6 mb-4">
              <Image
                source={require('../../assets/images/logo.png')}
                style={{ width: 220, height: 88 }}
                resizeMode="contain"
              />
            </View>

            {/* White card */}
            <View className="flex-1 bg-neutral-T100 rounded-t-3xl px-7 pt-10 shadow-md">
              {/* Heading */}
              <Text className="font-sans text-3xl font-bold text-neutral-T10 text-center mb-1">
                Welcome back
              </Text>
              <Text className="font-body text-sm text-neutral-T50 text-center mb-8">
                Log in to continue sharing meals
              </Text>

              {/* Google sign-in */}
              <TouchableOpacity
                activeOpacity={0.8}
                className="flex-row items-center justify-center bg-neutral-T100 h-14 rounded-xl mb-6 shadow-sm"
              >
                <Image
                  source={{
                    uri: 'https://img.icons8.com/color/48/google-logo.png',
                  }}
                  style={{ width: 24, height: 24 }}
                  className="mr-3"
                />
                <Text className="font-body font-semibold text-base text-neutral-T10">
                  Continue with Google
                </Text>
              </TouchableOpacity>

              {/* Divider */}
              <View className="flex-row items-center mb-6">
                <View className="flex-1 h-[1px] bg-neutral-T90" />
                <Text className="font-label text-xs text-neutral-T70 px-4">
                  or
                </Text>
                <View className="flex-1 h-[1px] bg-neutral-T90" />
              </View>

              {/* Form */}
              <View className="gap-5">
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

                {/* Password */}
                <View className="gap-2">
                  <Text className="font-label font-semibold text-sm text-neutral-T50 ml-1">
                    Password
                  </Text>
                  <View className="flex-row items-center bg-neutral-T95 rounded-xl h-14 px-4 border border-neutral-T90">
                    <TextInput
                      placeholder="Enter your password"
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

              {/* Forgot password */}
              <View className="flex-row justify-end mt-3 mb-8">
                <TouchableOpacity>
                  <Text className="font-label text-sm font-semibold text-primary-T40">
                    Forgot password?
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Login button */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleLogin}
                disabled={isLoading}
                className="bg-primary-T40 h-14 rounded-xl items-center justify-center shadow-sm active:opacity-80"
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text className="font-label font-semibold text-base text-neutral-T100">
                    Log in
                  </Text>
                )}
              </TouchableOpacity>

              {/* Register link */}
              <View className="flex-row justify-center mt-6 pb-8">
                <Text className="font-body text-sm text-neutral-T50">
                  Don't have an account?{' '}
                </Text>
                <Link href="/(auth)/register" asChild>
                  <TouchableOpacity>
                    <Text className="font-body text-sm font-bold text-primary-T40">
                      Sign up
                    </Text>
                  </TouchableOpacity>
                </Link>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
