// app/(auth)/login.tsx
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
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

export default function LoginScreen() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View className="flex-1 bg-surface-lowest">
      {/* ── CẬP NHẬT MÀU NỀN: Gradient Primary -> Secondary đậm nét ── */}
      <LinearGradient
        colors={['#b2d8ab', '#f5bd8f', '#FFFFFF']}
        locations={[0, 0.4, 0.6]}
        start={{ x: 0, y: 0 }} // Bắt buộc thêm cho iOS (bắt đầu từ Top)
        end={{ x: 0, y: 1 }} // Bắt buộc thêm cho iOS (kết thúc ở Bottom)
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '66%', // Thay thế cho className="h-2/3" để iOS hiểu chính xác
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
          >
            {/* ── Header & Logo (Giữ nguyên) mt-8 mb-6 ── */}
            <View className="flex-row items-center px-6 my-4">
              <TouchableOpacity
                onPress={() => router.back()}
                className="w-10 h-10 rounded-full bg-surface-lowest items-center justify-center"
                style={{
                  shadowColor: '#191c1c',
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                  elevation: 2,
                }}
              >
                <Feather name="arrow-left" size={20} color="#191c1c" />
              </TouchableOpacity>
              <View className="flex-1 items-center mr-10">
                <Image
                  source={require('../../assets/images/logo.png')}
                  style={{ width: 240, height: 96 }}
                  resizeMode="contain"
                />
              </View>
            </View>

            {/* ── White Card Container (Giữ nguyên) ── */}
            <View
              className="flex-1 bg-surface-lowest rounded-t-[40px] px-8 pt-10"
              style={{
                shadowColor: '#191c1c',
                shadowOpacity: 0.05,
                shadowRadius: 24,
                elevation: 10,
              }}
            >
              <Text className="font-sans text-4xl font-bold text-text text-center tracking-tight mb-2">
                Get Started <Text className="text-primary-dark">now</Text>
              </Text>
              <Text className="font-body text-sm text-text-muted text-center mb-8">
                Create an account or log in to explore our app
              </Text>

              {/* ── Google Login (Giữ nguyên) ── */}
              <TouchableOpacity
                activeOpacity={0.7}
                className="flex-row items-center justify-center bg-surface-lowest py-4 rounded-full mb-6"
                style={{
                  shadowColor: '#191c1c',
                  shadowOpacity: 0.06,
                  shadowRadius: 16,
                  shadowOffset: { width: 0, height: 4 },
                  elevation: 4,
                }}
              >
                <Image
                  source={{
                    uri: 'https://img.icons8.com/color/48/google-logo.png',
                  }}
                  className="w-8 h-8 mr-3"
                />
                <Text className="font-body font-bold text-lg">
                  Sign in with Google
                </Text>
              </TouchableOpacity>

              {/* ── Divider (Giữ nguyên) ── */}
              <View className="flex-row items-center justify-center mb-6">
                <View className="flex-1 h-[1px] bg-surface" />
                <Text className="font-body text-xs text-text-muted px-4 uppercase tracking-widest">
                  Or
                </Text>
                <View className="flex-1 h-[1px] bg-surface" />
              </View>

              {/* ── Form Fields (Giữ nguyên) ── */}
              <View className="gap-5">
                <View>
                  <Text className="font-body text-sm text-text-muted mb-2 ml-1">
                    Email
                  </Text>
                  <TextInput
                    placeholder="example@gmail.com"
                    placeholderTextColor="#9ea99d"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    className="font-body text-base text-text bg-surface rounded-2xl px-5 py-4"
                  />
                </View>

                <View>
                  <Text className="font-body text-sm text-text-muted mb-2 ml-1">
                    Password
                  </Text>
                  <View className="flex-row items-center bg-surface rounded-2xl px-5 py-4">
                    <TextInput
                      placeholder="••••••••"
                      placeholderTextColor="#9ea99d"
                      secureTextEntry={!showPassword}
                      className="font-body text-base text-text flex-1"
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <Feather
                        name={showPassword ? 'eye' : 'eye-off'}
                        size={20}
                        color="#9ea99d"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* ── Forgot Password & Remember Me (Giữ nguyên) ── */}
              <View className="flex-row justify-between items-center mt-4 mb-8">
                <View className="flex-row items-center gap-2">
                  <View className="w-5 h-5 rounded border border-gray-300 items-center justify-center" />
                  <Text className="font-body text-sm text-text-muted">
                    Remember me
                  </Text>
                </View>
                <TouchableOpacity>
                  <Text className="font-body text-sm font-bold text-primary-dark">
                    Forgot Password?
                  </Text>
                </TouchableOpacity>
              </View>

              {/* ── Submit Button (Giữ nguyên) ── */}
              <TouchableOpacity
                activeOpacity={0.8}
                className="bg-primary-dark py-4 rounded-full items-center justify-center mb-8"
                style={{
                  shadowColor: '#296c24',
                  shadowOpacity: 0.3,
                  shadowRadius: 16,
                  shadowOffset: { width: 0, height: 6 },
                  elevation: 8,
                }}
              >
                <Text className="font-body text-white text-lg font-bold">
                  Log In
                </Text>
              </TouchableOpacity>

              {/* ── Navigation to Register (Giữ nguyên) ── */}
              <View className="flex-row justify-center pb-8">
                <Text className="font-body text-text-muted">
                  Don't have an account?{' '}
                </Text>
                <Link href="/(auth)/register" asChild>
                  <TouchableOpacity>
                    <Text className="font-body font-bold text-primary-dark">
                      Sign Up
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
