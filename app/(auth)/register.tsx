// app/(auth)/register.tsx
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
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

export default function RegisterScreen() {
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
          {/* ── Header with Back Button (Giữ nguyên) ── */}
          <View className="flex-row items-center px-6 mt-4 mb-2">
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

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1 }}
          >
            {/* ── White Card Container (Giữ nguyên) ── */}
            <View
              className="flex-1 bg-surface-lowest rounded-t-[40px] px-8 pt-8 mt-4"
              style={{
                shadowColor: '#191c1c',
                shadowOpacity: 0.05,
                shadowRadius: 24,
                elevation: 10,
              }}
            >
              <Text className="font-sans text-4xl font-bold text-primary-dark text-center tracking-tight mb-2">
                Sign Up
              </Text>
              <View className="flex-row justify-center mb-8">
                <Text className="font-body text-sm text-text-muted text-center">
                  Already have an account?{' '}
                </Text>
                <TouchableOpacity onPress={() => router.back()}>
                  <Text className="font-body text-sm font-bold text-primary-dark">
                    Login
                  </Text>
                </TouchableOpacity>
              </View>

              {/* ── Form Fields (Giữ nguyên) ── */}
              <View className="gap-5">
                {/* Đổi First/Last Name thành Full Name theo Model */}
                <View>
                  <Text className="font-body text-sm text-text-muted mb-2 ml-1">
                    Full Name
                  </Text>
                  <TextInput
                    placeholder="Nguyen Van A"
                    placeholderTextColor="#9ea99d"
                    className="font-body text-base text-text bg-surface rounded-2xl px-5 py-4"
                  />
                </View>

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

                {/* Giữ lại SĐT để phục vụ isProfileCompleted = true */}
                <View>
                  <Text className="font-body text-sm text-text-muted mb-2 ml-1">
                    Phone Number
                  </Text>
                  <TextInput
                    placeholder="+84 987 654 321"
                    placeholderTextColor="#9ea99d"
                    keyboardType="phone-pad"
                    className="font-body text-base text-text bg-surface rounded-2xl px-5 py-4"
                  />
                </View>

                <View>
                  <Text className="font-body text-sm text-text-muted mb-2 ml-1">
                    Set Password
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

              {/* ── Submit Button (Giữ nguyên) ── */}
              <TouchableOpacity
                activeOpacity={0.8}
                className="bg-primary-dark py-4 rounded-full items-center justify-center mt-10 mb-10"
                style={{
                  shadowColor: '#296c24',
                  shadowOpacity: 0.3,
                  shadowRadius: 16,
                  shadowOffset: { width: 0, height: 6 },
                  elevation: 8,
                }}
              >
                <Text className="font-body text-white text-lg font-bold">
                  Register
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
