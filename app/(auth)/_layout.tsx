import { Stack } from 'expo-router';
import React from 'react';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Khai báo các màn hình trong luồng Auth */}
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
    </Stack>
  );
}
