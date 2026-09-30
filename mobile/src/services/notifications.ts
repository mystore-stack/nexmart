// mobile/src/services/notifications.ts
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { apiClient, storage } from '../api/client';

const EXPO_PUSH_TOKEN_PATTERN = /^ExponentPushToken\[[A-Za-z0-9_-]+\]$/;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

function normalizeExpoPushToken(token: string | null | undefined): string | null {
  if (!token) return null;
  const trimmed = token.trim();
  return EXPO_PUSH_TOKEN_PATTERN.test(trimmed) ? trimmed : null;
}

async function syncPushTokenWithBackend(token: string): Promise<boolean> {
  try {
    const accessToken = await storage.getItem('accessToken');
    if (!accessToken) {
      return false;
    }

    const response = await apiClient.post('/auth/mobile/push-token', {
      token,
      platform: Platform.OS,
    });

    return Boolean(response.data?.success);
  } catch (error) {
    console.warn('Failed to register push token with backend:', error);
    return false;
  }
}

export async function clearPushNotificationToken(): Promise<void> {
  try {
    const accessToken = await storage.getItem('accessToken');
    if (!accessToken) {
      return;
    }

    const token = await storage.getItem('pushToken');
    if (!token) {
      await apiClient.delete('/auth/mobile/push-token');
      return;
    }

    await apiClient.delete('/auth/mobile/push-token', {
      data: { token },
    });
    await storage.removeItem('pushToken');
  } catch (error) {
    console.warn('Failed to unregister push token:', error);
  }
}

export async function registerForPushNotificationsAsync(): Promise<string | null> {
  let token: string | null = null;

  try {
    const accessToken = await storage.getItem('accessToken');
    if (!accessToken) {
      return null;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Only request permissions if status is undetermined (user hasn't been asked yet)
    if (existingStatus === 'undetermined') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    } else if (existingStatus === 'denied') {
      // User already denied - don't request again, just log and continue
      if (__DEV__) {
        console.debug('Push notification permissions previously denied by user.');
      }
      return null;
    }

    if (finalStatus !== 'granted') {
      if (__DEV__) {
        console.debug('Push notification permissions not granted:', finalStatus);
      }
      return null;
    }

    const projectId = process.env.EXPO_PUBLIC_PUSH_PROJECT_ID || 'nexmart-moroccan-luxury-prod';
    const pushTokenData = await Notifications.getExpoPushTokenAsync({ projectId });
    token = normalizeExpoPushToken(pushTokenData?.data ?? null);

    if (!token) {
      if (__DEV__) {
        console.debug('Received invalid Expo push token format.');
      }
      return null;
    }

    const previousToken = await storage.getItem('pushToken');
    if (previousToken !== token) {
      await storage.setItem('pushToken', token);
    }

    await syncPushTokenWithBackend(token);

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#059669',
      });
    }
  } catch (error) {
    // Expo Go doesn't support push tokens in all cases - fail gracefully
    if (__DEV__) {
      console.debug('Failed to get push token (may be expected in Expo Go):', error);
    }
    return null;
  }

  return token;
}
