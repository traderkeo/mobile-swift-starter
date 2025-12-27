/**
 * Enhanced Push Notifications with Rich Notification Support
 *
 * Features:
 * - Rich notifications with images, actions, and categories
 * - Notification scheduling
 * - Badge management
 * - Notification history
 * - Deep link handling from notifications
 *
 * @example
 * ```typescript
 * import { useNotifications, scheduleNotification } from '@/hooks/use-notifications-enhanced';
 *
 * function App() {
 *   const { hasPermission, requestPermission, expoPushToken } = useNotifications();
 *
 *   // Schedule a notification
 *   await scheduleNotification({
 *     title: 'Reminder',
 *     body: 'Check out the new features!',
 *     data: { screen: 'features' },
 *     trigger: { seconds: 60 },
 *   });
 * }
 * ```
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Platform, AppState, AppStateStatus } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { trackEvent, AnalyticsEvents } from '@/lib/analytics';

// Storage keys
const PUSH_TOKEN_KEY = '@notifications:push_token';
const NOTIFICATION_HISTORY_KEY = '@notifications:history';
const BADGE_COUNT_KEY = '@notifications:badge_count';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    priority: Notifications.AndroidNotificationPriority.HIGH,
  }),
});

// Types
export interface NotificationData {
  screen?: string;
  params?: Record<string, string>;
  action?: string;
  [key: string]: unknown;
}

export interface ScheduledNotification {
  id: string;
  title: string;
  body: string;
  data?: NotificationData;
  trigger: Notifications.NotificationTriggerInput;
}

export interface NotificationHistoryItem {
  id: string;
  title: string;
  body: string;
  data?: NotificationData;
  receivedAt: string;
  read: boolean;
}

// Notification categories with actions
export const NotificationCategories = {
  MESSAGE: 'message',
  REMINDER: 'reminder',
  PROMOTION: 'promotion',
  UPDATE: 'update',
} as const;

/**
 * Register notification categories with action buttons
 */
async function registerNotificationCategories(): Promise<void> {
  if (Platform.OS === 'ios') {
    await Notifications.setNotificationCategoryAsync(NotificationCategories.MESSAGE, [
      {
        identifier: 'reply',
        buttonTitle: 'Reply',
        options: { opensAppToForeground: true },
      },
      {
        identifier: 'dismiss',
        buttonTitle: 'Dismiss',
        options: { isDestructive: true },
      },
    ]);

    await Notifications.setNotificationCategoryAsync(NotificationCategories.REMINDER, [
      {
        identifier: 'complete',
        buttonTitle: 'Mark Complete',
        options: { opensAppToForeground: false },
      },
      {
        identifier: 'snooze',
        buttonTitle: 'Snooze 1 Hour',
        options: { opensAppToForeground: false },
      },
    ]);

    await Notifications.setNotificationCategoryAsync(NotificationCategories.PROMOTION, [
      {
        identifier: 'view',
        buttonTitle: 'View Offer',
        options: { opensAppToForeground: true },
      },
    ]);
  }

  if (Platform.OS === 'android') {
    // Create notification channels for Android
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#0a7ea4',
    });

    await Notifications.setNotificationChannelAsync('reminders', {
      name: 'Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
    });

    await Notifications.setNotificationChannelAsync('promotions', {
      name: 'Promotions',
      importance: Notifications.AndroidImportance.DEFAULT,
    });

    await Notifications.setNotificationChannelAsync('updates', {
      name: 'App Updates',
      importance: Notifications.AndroidImportance.LOW,
    });
  }
}

/**
 * Get the Expo push token
 */
async function getExpoPushToken(): Promise<string | null> {
  if (!Device.isDevice) {
    console.warn('[Notifications] Push notifications require a physical device');
    return null;
  }

  try {
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    if (!projectId) {
      console.warn('[Notifications] EAS project ID not configured');
      return null;
    }

    const { data: token } = await Notifications.getExpoPushTokenAsync({
      projectId,
    });

    // Cache the token
    await AsyncStorage.setItem(PUSH_TOKEN_KEY, token);

    return token;
  } catch (error) {
    console.error('[Notifications] Failed to get push token:', error);
    return null;
  }
}

/**
 * Request notification permissions
 */
async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();

  if (existingStatus === 'granted') {
    return true;
  }

  const { status } = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: true,
      allowSound: true,
      allowCriticalAlerts: false,
      provideAppNotificationSettings: true,
    },
  });

  return status === 'granted';
}

/**
 * Schedule a local notification
 */
export async function scheduleNotification(
  notification: Omit<ScheduledNotification, 'id'>
): Promise<string> {
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: notification.title,
      body: notification.body,
      data: notification.data,
      sound: true,
      badge: 1,
    },
    trigger: notification.trigger,
  });

  return id;
}

/**
 * Schedule a notification for a specific date
 */
export async function scheduleNotificationAtDate(
  title: string,
  body: string,
  date: Date,
  data?: NotificationData
): Promise<string> {
  // Calculate seconds until the target date
  const secondsUntil = Math.max(1, Math.floor((date.getTime() - Date.now()) / 1000));
  return scheduleNotification({
    title,
    body,
    data,
    trigger: {
      type: 'timeInterval',
      seconds: secondsUntil,
    } as Notifications.TimeIntervalTriggerInput,
  });
}

/**
 * Schedule a daily repeating notification
 */
export async function scheduleDailyNotification(
  title: string,
  body: string,
  hour: number,
  minute: number,
  data?: NotificationData
): Promise<string> {
  return scheduleNotification({
    title,
    body,
    data,
    trigger: {
      type: 'calendar',
      hour,
      minute,
      repeats: true,
    } as Notifications.CalendarTriggerInput,
  });
}

/**
 * Cancel a scheduled notification
 */
export async function cancelNotification(id: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(id);
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Get all scheduled notifications
 */
export async function getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  return Notifications.getAllScheduledNotificationsAsync();
}

/**
 * Set the app badge count
 */
export async function setBadgeCount(count: number): Promise<void> {
  await Notifications.setBadgeCountAsync(count);
  await AsyncStorage.setItem(BADGE_COUNT_KEY, count.toString());
}

/**
 * Get the current badge count
 */
export async function getBadgeCount(): Promise<number> {
  const count = await Notifications.getBadgeCountAsync();
  return count;
}

/**
 * Clear the app badge
 */
export async function clearBadge(): Promise<void> {
  await setBadgeCount(0);
}

/**
 * Save notification to history
 */
async function saveNotificationToHistory(notification: Notifications.Notification): Promise<void> {
  try {
    const historyData = await AsyncStorage.getItem(NOTIFICATION_HISTORY_KEY);
    const history: NotificationHistoryItem[] = historyData ? JSON.parse(historyData) : [];

    const item: NotificationHistoryItem = {
      id: notification.request.identifier,
      title: notification.request.content.title || '',
      body: notification.request.content.body || '',
      data: notification.request.content.data as NotificationData,
      receivedAt: new Date().toISOString(),
      read: false,
    };

    history.unshift(item);

    // Keep last 50 notifications
    if (history.length > 50) {
      history.pop();
    }

    await AsyncStorage.setItem(NOTIFICATION_HISTORY_KEY, JSON.stringify(history));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Get notification history
 */
export async function getNotificationHistory(): Promise<NotificationHistoryItem[]> {
  try {
    const data = await AsyncStorage.getItem(NOTIFICATION_HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(id: string): Promise<void> {
  try {
    const history = await getNotificationHistory();
    const updated = history.map((item) => (item.id === id ? { ...item, read: true } : item));
    await AsyncStorage.setItem(NOTIFICATION_HISTORY_KEY, JSON.stringify(updated));

    // Update badge count
    const unreadCount = updated.filter((n) => !n.read).length;
    await setBadgeCount(unreadCount);
  } catch {
    // Ignore errors
  }
}

/**
 * Clear notification history
 */
export async function clearNotificationHistory(): Promise<void> {
  await AsyncStorage.removeItem(NOTIFICATION_HISTORY_KEY);
  await clearBadge();
}

/**
 * Hook for managing push notifications
 */
export function useNotifications() {
  const router = useRouter();
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const notificationListener = useRef<Notifications.Subscription | undefined>(undefined);
  const responseListener = useRef<Notifications.Subscription | undefined>(undefined);
  const appState = useRef(AppState.currentState);

  // Initialize notifications
  useEffect(() => {
    async function initialize() {
      // Register categories
      await registerNotificationCategories();

      // Check permission status
      const { status } = await Notifications.getPermissionsAsync();
      setHasPermission(status === 'granted');

      if (status === 'granted') {
        const token = await getExpoPushToken();
        setExpoPushToken(token);
      }

      setIsLoading(false);
    }

    initialize();
  }, []);

  // Handle notification received while app is in foreground
  useEffect(() => {
    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      // Save to history
      saveNotificationToHistory(notification);

      // Track event
      trackEvent(AnalyticsEvents.PUSH_NOTIFICATION_RECEIVED, {
        title: notification.request.content.title,
      });
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
    };
  }, []);

  // Handle notification response (user tapped on notification)
  useEffect(() => {
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as NotificationData;
      const actionId = response.actionIdentifier;

      // Track event
      trackEvent(AnalyticsEvents.PUSH_NOTIFICATION_OPENED, {
        title: response.notification.request.content.title,
        action: actionId,
      });

      // Handle action buttons
      if (actionId !== Notifications.DEFAULT_ACTION_IDENTIFIER) {
        handleNotificationAction(actionId, data);
        return;
      }

      // Navigate to screen if specified
      if (data?.screen) {
        router.push({
          pathname: data.screen as any,
          params: data.params,
        });
      }
    });

    return () => {
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [router]);

  // Clear badge when app becomes active
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        // Optionally clear badge when app opens
        // clearBadge();
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    const granted = await requestNotificationPermissions();
    setHasPermission(granted);

    if (granted) {
      const token = await getExpoPushToken();
      setExpoPushToken(token);
    }

    return granted;
  }, []);

  return {
    expoPushToken,
    hasPermission,
    isLoading,
    requestPermission,
    scheduleNotification,
    cancelNotification,
    cancelAllNotifications,
    getScheduledNotifications,
    setBadgeCount,
    clearBadge,
    getNotificationHistory,
    markNotificationAsRead,
    clearNotificationHistory,
  };
}

/**
 * Handle notification action buttons
 */
function handleNotificationAction(actionId: string, data?: NotificationData): void {
  switch (actionId) {
    case 'reply':
      // Handle reply action
      break;
    case 'dismiss':
      // Handle dismiss
      break;
    case 'complete':
      // Handle mark complete
      break;
    case 'snooze':
      // Reschedule notification for 1 hour later
      if (data) {
        scheduleNotification({
          title: (data.title as string) || 'Reminder',
          body: (data.body as string) || '',
          data,
          trigger: {
            type: 'timeInterval',
            seconds: 3600,
          } as Notifications.TimeIntervalTriggerInput,
        });
      }
      break;
    case 'view':
      // Will be handled by navigation logic
      break;
    default:
      break;
  }
}

export default useNotifications;
