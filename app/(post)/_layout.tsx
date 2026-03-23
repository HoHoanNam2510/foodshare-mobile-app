import { Slot, useSegments } from 'expo-router';
import React from 'react';

export default function PostLayout() {
  const segments = useSegments();

  console.log(segments);

  return <Slot />;
}
