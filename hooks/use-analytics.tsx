/**
 * Analytics hook for tracking user events
 *
 * Usage:
 * ```tsx
 * const { track, trackScreen } = useAnalytics();
 *
 * // Track an event
 * track(AnalyticsEvents.PURCHASE_COMPLETED, { productId: 'premium' });
 *
 * // Track a screen view
 * trackScreen('Home');
 * ```
 */

import { useCallback, useEffect } from 'react';
import { usePathname } from 'expo-router';
import {
  trackEvent,
  trackScreen,
  identifyUser,
  resetUser,
  AnalyticsEvents,
  type AnalyticsEvent,
} from '@/lib/analytics';
import { useAuth } from '@/context/AuthContext';

export function useAnalytics() {
  const pathname = usePathname();
  const { user } = useAuth();

  // Track screen views automatically when pathname changes
  useEffect(() => {
    if (pathname) {
      // Convert pathname to a readable screen name
      const screenName =
        pathname
          .replace(/^\/(tabs\/)?/, '')
          .replace(/\//g, ' > ')
          .replace(/-/g, ' ')
          .replace(/\[.*?\]/g, ':param')
          .trim() || 'Home';

      trackScreen(screenName, { path: pathname });
    }
  }, [pathname]);

  // Identify user when auth state changes
  useEffect(() => {
    if (user) {
      identifyUser(user.id, {
        email: user.email,
      });
    } else {
      resetUser();
    }
  }, [user?.id]);

  /**
   * Track a custom event
   */
  const track = useCallback(
    (eventName: AnalyticsEvent | string, properties?: Record<string, unknown>) => {
      trackEvent(eventName, properties);
    },
    []
  );

  /**
   * Track a screen view manually
   */
  const trackScreenView = useCallback(
    (screenName: string, properties?: Record<string, unknown>) => {
      trackScreen(screenName, properties);
    },
    []
  );

  return {
    track,
    trackScreen: trackScreenView,
    AnalyticsEvents,
  };
}

/**
 * HOC to track screen views for class components
 */
export function withAnalytics<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  screenName: string
) {
  return function WithAnalyticsComponent(props: P) {
    useEffect(() => {
      trackScreen(screenName);
    }, []);

    return <WrappedComponent {...props} />;
  };
}
