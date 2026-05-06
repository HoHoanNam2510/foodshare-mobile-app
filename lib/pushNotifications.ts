import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

import api from '@/lib/axios';

const isExpoGo = Constants.appOwnership === 'expo';

export function setupNotificationHandler(): void {
  if (isExpoGo) return;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Notifications =
    require('expo-notifications') as typeof import('expo-notifications');
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export async function registerForPushNotificationsAsync(): Promise<
  string | null
> {
  if (isExpoGo || !Device.isDevice) return null;

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Notifications =
    require('expo-notifications') as typeof import('expo-notifications');

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'FoodShare',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#2A7C6E',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') return null;

  const tokenData = await Notifications.getExpoPushTokenAsync();
  return tokenData.data;
}

export async function savePushTokenToServer(token: string): Promise<void> {
  try {
    await api.put('/notifications/push-token', { token });
  } catch {
    // ignore — non-critical
  }
}
