import { Stack } from 'expo-router';
import React from 'react';

export default function StatisticsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="statistics" />
    </Stack>
  );
}
