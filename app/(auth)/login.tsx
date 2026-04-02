import { Feather } from '@expo/vector-icons';
import * as AuthSession from 'expo-auth-session';
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useEffect, useState } from 'react';
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

WebBrowser.maybeCompleteAuthSession();

const isExpoGo = Constants.appOwnership === 'expo';

const GOOGLE_DISCOVERY: AuthSession.DiscoveryDocument = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
};

// Reverse Google client ID → URL scheme
// "123-abc.apps.googleusercontent.com" → "com.googleusercontent.apps.123-abc"
function reverseClientId(clientId: string): string {
  return clientId.split('.').reverse().join('.');
}

// Pick client ID theo platform + môi trường
function getGoogleClientId(): string {
  if (Platform.OS === 'ios') {
    return isExpoGo
      ? (process.env.EXPO_PUBLIC_GOOGLE_EXPO_GO_IOS_CLIENT_ID ?? '')
      : (process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? '');
  }
  if (Platform.OS === 'android') {
    return process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ?? '';
  }
  return process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '';
}

// iOS: dùng reversed client ID scheme (ASWebAuthenticationSession tự bắt)
// Android/Web: dùng scheme mặc định
function getGoogleRedirectUri(clientId: string): string {
  if (Platform.OS === 'ios' && clientId) {
    return `${reverseClientId(clientId)}:/oauthredirect`;
  }
  return AuthSession.makeRedirectUri();
}

export default function LoginScreen() {
  const router = useRouter();
  const { login, googleLogin, isLoading } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const googleClientId = getGoogleClientId();
  const googleRedirectUri = getGoogleRedirectUri(googleClientId);

  // Auth code flow + PKCE (không cần proxy, không cần client secret)
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: googleClientId,
      redirectUri: googleRedirectUri,
      responseType: AuthSession.ResponseType.Code,
      scopes: ['openid', 'email', 'profile'],
      usePKCE: true,
    },
    GOOGLE_DISCOVERY
  );

  useEffect(() => {
    if (
      response?.type === 'success' &&
      response.params.code &&
      request?.codeVerifier
    ) {
      exchangeGoogleCode(response.params.code, request.codeVerifier);
    }
  }, [response]);

  // Đổi auth code → id_token rồi gửi lên backend
  const exchangeGoogleCode = async (code: string, codeVerifier: string) => {
    setIsGoogleLoading(true);
    try {
      const tokenResult = await AuthSession.exchangeCodeAsync(
        {
          clientId: googleClientId,
          code,
          redirectUri: googleRedirectUri,
          extraParams: { code_verifier: codeVerifier },
        },
        GOOGLE_DISCOVERY
      );

      if (!tokenResult.idToken) {
        throw new Error('Không nhận được ID token từ Google');
      }

      await googleLogin(tokenResult.idToken);
      router.replace('/(tabs)/home' as never);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Google login failed. Please try again.';
      Alert.alert('Google login failed', message);
    } finally {
      setIsGoogleLoading(false);
    }
  };

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
                disabled={isGoogleLoading}
                onPress={() => promptAsync()}
                className="flex-row items-center justify-center bg-neutral-T100 h-14 rounded-xl mb-6 shadow-sm"
              >
                {isGoogleLoading ? (
                  <ActivityIndicator color="#296C24" />
                ) : (
                  <>
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
                  </>
                )}
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
