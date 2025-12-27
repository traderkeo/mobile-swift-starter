import { useState, useEffect, useRef, useCallback } from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

// Configure how notifications are handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface PushNotificationState {
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
  error: string | null;
}

export function useNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const [error, setError] = useState<string | null>(null);

  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  const registerForPushNotifications = useCallback(async (): Promise<string | null> => {
    // Push notifications don't work on emulators/simulators
    if (!Device.isDevice) {
      setError('Push notifications require a physical device');
      return null;
    }

    // Check existing permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Request permissions if not granted
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      setError('Permission not granted for push notifications');
      return null;
    }

    // Android requires a notification channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    try {
      const projectId =
        Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;

      if (!projectId) {
        // For development without EAS, return a placeholder
        console.log('No EAS project ID found. Push tokens require EAS configuration.');
        return null;
      }

      const token = await Notifications.getExpoPushTokenAsync({ projectId });
      setExpoPushToken(token.data);
      return token.data;
    } catch (err) {
      setError(`Failed to get push token: ${err}`);
      return null;
    }
  }, []);

  useEffect(() => {
    // Register for push notifications on mount
    registerForPushNotifications();

    // Listen for incoming notifications
    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      setNotification(notification);
    });

    // Listen for notification interactions (user taps)
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const { notification } = response;
      // Handle notification tap - you can navigate to specific screens here
      console.log('Notification tapped:', notification.request.content);
    });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [registerForPushNotifications]);

  // Schedule a local notification
  const scheduleLocalNotification = useCallback(
    async (
      title: string,
      body: string,
      data?: Record<string, unknown>,
      trigger?: Notifications.NotificationTriggerInput
    ) => {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: data ?? {},
        },
        trigger: trigger ?? null, // null = immediate
      });
    },
    []
  );

  // Cancel all scheduled notifications
  const cancelAllNotifications = useCallback(async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }, []);

  // Get badge count
  const getBadgeCount = useCallback(async () => {
    return await Notifications.getBadgeCountAsync();
  }, []);

  // Set badge count
  const setBadgeCount = useCallback(async (count: number) => {
    await Notifications.setBadgeCountAsync(count);
  }, []);

  return {
    expoPushToken,
    notification,
    error,
    registerForPushNotifications,
    scheduleLocalNotification,
    cancelAllNotifications,
    getBadgeCount,
    setBadgeCount,
  };
}

// Utility to send push notification via Expo's push service (for testing)
export async function sendPushNotification(
  expoPushToken: string,
  title: string,
  body: string,
  data?: Record<string, unknown>
) {
  const message = {
    to: expoPushToken,
    sound: 'default',
    title,
    body,
    data: data ?? {},
  };

  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });
}
