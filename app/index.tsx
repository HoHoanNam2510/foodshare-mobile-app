import { Redirect } from 'expo-router';

import { useAuthStore } from '@/stores/authStore';

export default function Index() {
  const token = useAuthStore((s) => s.token);

  if (!token) {
    return <Redirect href={'/(auth)/login' as never} />;
  }

  return <Redirect href={'/(tabs)/home' as never} />;
}
