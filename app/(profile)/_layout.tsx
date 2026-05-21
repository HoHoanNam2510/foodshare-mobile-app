import { Stack } from 'expo-router';
import React from 'react';

export default function ProfileLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="profile" />
      <Stack.Screen name="edit-profile" />
      <Stack.Screen name="register-store" />
      <Stack.Screen name="kyc-resubmit" />
      <Stack.Screen name="badges" />
    </Stack>
  );
}
