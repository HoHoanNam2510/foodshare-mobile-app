import { Link } from 'expo-router';
import React from 'react';
import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Explore() {
  return (
    <SafeAreaView>
      <Text>explore</Text>
      <Link href={'/CreatePostP2P'}>CreatePostP2P</Link>
    </SafeAreaView>
  );
}
