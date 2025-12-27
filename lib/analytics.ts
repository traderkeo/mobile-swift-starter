/**
 * Lightweight Local Analytics
 *
 * Events are logged locally for debugging. You can integrate with
 * third-party analytics services (Mixpanel, Amplitude, etc.) if needed.
 *
 * Usage:
 * ```tsx
 * import { trackEvent, identifyUser, AnalyticsEvents } from '@/lib/analytics';
 *
 * // Track an event
 * trackEvent(AnalyticsEvents.PURCHASE_COMPLETED, { productId: 'premium' });
 *
 * // Identify user after login
 * identifyUser(user.id, { email: user.email });
 * ```
 */

import { Platform } from 'react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Anonymous ID for tracking before user signs in
let anonymousId: string | null = null;
let userId: string | null = null;
let userTraits: Record<string, unknown> = {};

const ANONYMOUS_ID_KEY = '@analytics_anonymous_id';

/**
 * Initialize analytics - call once at app startup
 */
export async function initAnalytics(): Promise<void> {
  // Get or create anonymous ID
  try {
    const storedId = await AsyncStorage.getItem(ANONYMOUS_ID_KEY);
    if (storedId) {
      anonymousId = storedId;
    } else {
      anonymousId = generateId();
      await AsyncStorage.setItem(ANONYMOUS_ID_KEY, anonymousId);
    }
  } catch {
    anonymousId = generateId();
  }

  console.log('Analytics initialized');
}

/**
 * Generate a simple unique ID
 */
function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Identify a user
 */
export function identifyUser(
  id: string,
  traits?: {
    email?: string;
    name?: string;
    plan?: string;
    [key: string]: unknown;
  }
): void {
  userId = id;
  userTraits = { ...userTraits, ...traits };

  // Track identify event
  trackEvent('$identify', { ...traits });
}

/**
 * Reset user identity (call on logout)
 */
export function resetUser(): void {
  userId = null;
  userTraits = {};
}

/**
 * Track a custom event
 * Currently logs locally - integrate your analytics service here
 */
export function trackEvent(eventName: string, properties?: Record<string, unknown>): void {
  const event = {
    event: eventName,
    properties: {
      ...properties,
      ...userTraits,
    },
    userId,
    anonymousId,
    timestamp: new Date().toISOString(),
    context: {
      app: {
        version: Constants.expoConfig?.version || '1.0.0',
        build:
          Constants.expoConfig?.ios?.buildNumber ||
          String(Constants.expoConfig?.android?.versionCode) ||
          '1',
      },
      device: {
        platform: Platform.OS,
      },
    },
  };

  // Log event in development
  if (__DEV__) {
    console.log(`[Analytics] ${eventName}`, properties);
  }

  // TODO: Integrate your analytics service here
  // Examples:
  // - Mixpanel.track(eventName, event.properties)
  // - Amplitude.track(eventName, event.properties)
  // - posthog.capture(eventName, event.properties)
  void event; // Suppress unused warning
}

/**
 * Track a screen view
 */
export function trackScreen(screenName: string, properties?: Record<string, unknown>): void {
  trackEvent('$screen', {
    screen_name: screenName,
    ...properties,
  });
}

/**
 * Set user properties
 */
export function setUserProperties(properties: Record<string, unknown>): void {
  userTraits = { ...userTraits, ...properties };
}

// Pre-defined event names for consistency
export const AnalyticsEvents = {
  // Authentication
  SIGN_UP: 'sign_up',
  SIGN_IN: 'sign_in',
  SIGN_OUT: 'sign_out',
  PASSWORD_RESET: 'password_reset',

  // Onboarding
  ONBOARDING_STARTED: 'onboarding_started',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  ONBOARDING_SKIPPED: 'onboarding_skipped',

  // Subscription & Paywall
  PAYWALL_VIEWED: 'paywall_viewed',
  PAYWALL_CLOSED: 'paywall_closed',
  SUBSCRIPTION_VIEWED: 'subscription_viewed',
  SUBSCRIPTION_STARTED: 'subscription_started',
  SUBSCRIPTION_CANCELLED: 'subscription_cancelled',
  SUBSCRIPTION_RESTORED: 'subscription_restored',
  TRIAL_STARTED: 'trial_started',

  // Payments
  CHECKOUT_STARTED: 'checkout_started',
  CHECKOUT_COMPLETED: 'checkout_completed',
  CHECKOUT_FAILED: 'checkout_failed',
  PURCHASE_COMPLETED: 'purchase_completed',
  PURCHASE_FAILED: 'purchase_failed',

  // App
  APP_OPENED: 'app_opened',
  APP_BACKGROUNDED: 'app_backgrounded',
  DEEP_LINK_OPENED: 'deep_link_opened',
  PUSH_NOTIFICATION_RECEIVED: 'push_notification_received',
  PUSH_NOTIFICATION_OPENED: 'push_notification_opened',

  // Errors
  ERROR_OCCURRED: 'error_occurred',

  // Feature Usage
  FEATURE_USED: 'feature_used',

  // Settings
  SETTINGS_CHANGED: 'settings_changed',
  NOTIFICATIONS_TOGGLED: 'notifications_toggled',
  ACCOUNT_DELETED: 'account_deleted',

  // Ads
  AD_IMPRESSION: 'ad_impression',
  AD_REWARD_EARNED: 'ad_reward_earned',
  AD_ATTRIBUTION_RECEIVED: 'ad_attribution_received',
  AD_CONVERSION: 'ad_conversion',
} as const;

export type AnalyticsEvent = (typeof AnalyticsEvents)[keyof typeof AnalyticsEvents];
