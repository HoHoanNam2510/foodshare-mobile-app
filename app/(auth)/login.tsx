import { Feather } from '@expo/vector-icons';
import * as AuthSession from 'expo-auth-session';
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useCallback, useEffect, useState } from 'react';
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

import { useAuthStore } from '@/stores/authStore';
import { useThemeColors } from '@/lib/hooks/useThemeColors';

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
  const { t } = useTranslation();
  const colors = useThemeColors();
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

  // Đổi auth code → id_token rồi gửi lên backend
  const exchangeGoogleCode = useCallback(
    async (code: string, codeVerifier: string) => {
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
          error instanceof Error ? error.message : t('errors.tryAgain');
        Alert.alert(t('auth.googleLoginFailed'), message);
      } finally {
        setIsGoogleLoading(false);
      }
    },
    [googleClientId, googleRedirectUri, googleLogin, router, t]
  );

  useEffect(() => {
    if (
      response?.type === 'success' &&
      response.params.code &&
      request?.codeVerifier
    ) {
      exchangeGoogleCode(response.params.code, request.codeVerifier);
    }
  }, [response, request, exchangeGoogleCode]);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert(t('auth.missingFields'), t('auth.enterEmailAndPassword'));
      return;
    }
    try {
      await login(email.trim().toLowerCase(), password);
      router.replace('/(tabs)/home' as never);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t('errors.tryAgain');
      Alert.alert(t('auth.loginFailed'), message);
    }
  };

  return (
    <View className="bg-neutral-T100 dark:bg-neutral-T10 flex-1">
      {/* Gradient header background */}
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
            <View className="mb-4 mt-6 items-center">
              <Image
                source={require('../../assets/images/logo.png')}
                style={{ width: 220, height: 88 }}
                resizeMode="contain"
              />
            </View>

            {/* White card */}
            <View className="bg-neutral-T100 dark:bg-neutral-T20 flex-1 rounded-t-3xl px-7 pt-10 shadow-md dark:shadow-none">
              {/* Heading */}
              <Text className="text-neutral-T10 dark:text-neutral-T90 mb-1 text-center font-sans text-3xl font-bold">
                {t('auth.welcomeBack')}
              </Text>
              <Text className="font-body text-neutral-T50 dark:text-neutral-T60 mb-8 text-center text-sm">
                {t('auth.loginSubtitle')}
              </Text>

              {/* Google sign-in */}
              <TouchableOpacity
                activeOpacity={0.8}
                disabled={isGoogleLoading}
                onPress={() => promptAsync()}
                className="bg-neutral-T100 dark:bg-neutral-T30 dark:border-neutral-T30 mb-6 h-14 flex-row items-center justify-center rounded-xl shadow-sm dark:border dark:shadow-none"
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
                    <Text className="font-body text-neutral-T10 dark:text-neutral-T90 text-base font-semibold">
                      {t('auth.continueWithGoogle')}
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Divider */}
              <View className="mb-6 flex-row items-center">
                <View className="bg-neutral-T90 dark:bg-neutral-T30 h-[1px] flex-1" />
                <Text className="font-label text-neutral-T70 dark:text-neutral-T60 px-4 text-xs">
                  {t('auth.or')}
                </Text>
                <View className="bg-neutral-T90 dark:bg-neutral-T30 h-[1px] flex-1" />
              </View>

              {/* Form */}
              <View className="gap-5">
                {/* Email */}
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

                {/* Password */}
                <View className="gap-2">
                  <Text className="font-label text-neutral-T50 dark:text-neutral-T60 ml-1 text-sm font-semibold">
                    {t('auth.password')}
                  </Text>
                  <View className="bg-neutral-T95 dark:bg-neutral-T30 border-neutral-T90 dark:border-neutral-T30 h-14 flex-row items-center rounded-xl border px-4">
                    <TextInput
                      placeholder={t('auth.passwordPlaceholder')}
                      placeholderTextColor={colors.placeholder}
                      secureTextEntry={!showPassword}
                      value={password}
                      onChangeText={setPassword}
                      className="font-body text-neutral-T10 dark:text-neutral-T90 flex-1 text-base"
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
              <View className="mb-8 mt-3 flex-row justify-end">
                <TouchableOpacity
                  onPress={() =>
                    router.push('/(auth)/forgot-password' as never)
                  }
                >
                  <Text className="font-label text-primary-T40 dark:text-primary-T60 text-sm font-semibold">
                    {t('auth.forgotPassword')}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Login button */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleLogin}
                disabled={isLoading}
                className="bg-primary-T40 dark:bg-primary-T50 h-14 items-center justify-center rounded-xl shadow-sm active:opacity-80"
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text className="font-label text-neutral-T100 text-base font-semibold">
                    {t('auth.login')}
                  </Text>
                )}
              </TouchableOpacity>

              {/* Register link */}
              <View className="mt-6 flex-row justify-center pb-8">
                <Text className="font-body text-neutral-T50 dark:text-neutral-T60 text-sm">
                  {t('auth.dontHaveAccount')}{' '}
                </Text>
                <Link href="/(auth)/register" asChild>
                  <TouchableOpacity>
                    <Text className="font-body text-primary-T40 dark:text-primary-T60 text-sm font-bold">
                      {t('auth.register')}
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
