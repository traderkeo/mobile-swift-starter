/**
 * Deep Linking configuration and handlers
 *
 * Supports:
 * - Custom URL schemes (yourapp://)
 * - Universal Links (iOS) / App Links (Android)
 * - Deferred deep links
 *
 * @example
 * ```typescript
 * import { useDeepLinking, handleDeepLink, buildDeepLink } from '@/lib/deep-linking';
 *
 * // In your root component
 * useDeepLinking();
 *
 * // Build a deep link URL
 * const shareUrl = buildDeepLink('/product/123', { ref: 'share' });
 * ```
 */

import { useEffect, useCallback, useRef } from 'react';
import * as Linking from 'expo-linking';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Platform } from 'react-native';
import { trackEvent, AnalyticsEvents } from './analytics';

// Configuration
const URL_SCHEME = 'dodoexpo';
const UNIVERSAL_LINK_DOMAIN = 'yourapp.com'; // Update with your domain
const DEFERRED_LINK_KEY = '@app:deferred_deep_link';

// Types
export interface DeepLinkParams {
  path: string;
  queryParams: Record<string, string>;
  hostname: string | null;
  scheme: string;
  isUniversalLink: boolean;
}

export interface DeepLinkHandler {
  pattern: RegExp | string;
  handler: (params: DeepLinkParams, matches: RegExpMatchArray | null) => void;
}

// Registered handlers
const handlers: DeepLinkHandler[] = [];

/**
 * Parse a deep link URL into components
 */
export function parseDeepLink(url: string): DeepLinkParams {
  const parsed = Linking.parse(url);

  return {
    path: parsed.path || '',
    queryParams: (parsed.queryParams as Record<string, string>) || {},
    hostname: parsed.hostname,
    scheme: parsed.scheme || URL_SCHEME,
    isUniversalLink: parsed.scheme === 'https' || parsed.scheme === 'http',
  };
}

/**
 * Build a deep link URL
 */
export function buildDeepLink(
  path: string,
  params?: Record<string, string | number>,
  options?: { universal?: boolean }
): string {
  const queryString = params
    ? '?' +
      Object.entries(params)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&')
    : '';

  if (options?.universal) {
    return `https://${UNIVERSAL_LINK_DOMAIN}${path}${queryString}`;
  }

  return `${URL_SCHEME}://${path}${queryString}`;
}

/**
 * Register a deep link handler
 */
export function registerDeepLinkHandler(
  pattern: RegExp | string,
  handler: DeepLinkHandler['handler']
): () => void {
  const handlerObj: DeepLinkHandler = { pattern, handler };
  handlers.push(handlerObj);

  // Return unregister function
  return () => {
    const index = handlers.indexOf(handlerObj);
    if (index > -1) {
      handlers.splice(index, 1);
    }
  };
}

/**
 * Handle a deep link URL
 */
export async function handleDeepLink(
  url: string,
  router: ReturnType<typeof useRouter>
): Promise<boolean> {
  const params = parseDeepLink(url);

  // Track the deep link
  trackEvent(AnalyticsEvents.DEEP_LINK_OPENED, {
    path: params.path,
    scheme: params.scheme,
    isUniversalLink: params.isUniversalLink,
  });

  // Check registered handlers first
  for (const { pattern, handler } of handlers) {
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
    const matches = params.path.match(regex);

    if (matches) {
      handler(params, matches);
      return true;
    }
  }

  // Default routing based on path
  const { path, queryParams } = params;

  // Handle common deep link paths
  switch (true) {
    // Auth links
    case path.startsWith('auth/reset-password'):
      router.push({
        pathname: '/(auth)/forgot-password',
        params: queryParams,
      });
      return true;

    case path.startsWith('auth/verify'):
      router.push({
        pathname: '/(auth)/login',
        params: { ...queryParams, verified: 'true' },
      });
      return true;

    // Payment links
    case path.startsWith('payment/result'):
    case path.startsWith('payment/success'):
    case path.startsWith('payment/cancel'):
      router.push({
        pathname: '/payment/result',
        params: queryParams,
      });
      return true;

    case path.startsWith('premium'):
    case path.startsWith('subscribe'):
      router.push('/(tabs)/profile');
      return true;

    // Product/content links
    case /^product\/(\d+)/.test(path): {
      const productId = path.match(/^product\/(\d+)/)?.[1];
      router.push({
        pathname: '/(tabs)',
        params: { productId, ...queryParams },
      });
      return true;
    }

    // Profile links
    case path.startsWith('profile'):
      router.push('/(tabs)/profile');
      return true;

    // Settings links
    case path.startsWith('settings'):
      router.push('/(tabs)/settings');
      return true;

    // Legal pages
    case path.startsWith('privacy'):
      router.push('/legal/privacy');
      return true;

    case path.startsWith('terms'):
      router.push('/legal/terms');
      return true;

    // Share/referral links
    case path.startsWith('invite'):
    case path.startsWith('share'):
      await saveDeferredDeepLink(url);
      return true;

    default:
      // Try to navigate to the path directly
      try {
        router.push(path as any);
        return true;
      } catch {
        console.warn(`[DeepLink] Unhandled deep link: ${url}`);
        return false;
      }
  }
}

/**
 * Save a deep link to be handled after authentication
 */
export async function saveDeferredDeepLink(url: string): Promise<void> {
  try {
    await AsyncStorage.setItem(DEFERRED_LINK_KEY, url);
  } catch {
    // Ignore storage errors
  }
}

/**
 * Get and clear any deferred deep link
 */
export async function getDeferredDeepLink(): Promise<string | null> {
  try {
    const url = await AsyncStorage.getItem(DEFERRED_LINK_KEY);
    if (url) {
      await AsyncStorage.removeItem(DEFERRED_LINK_KEY);
    }
    return url;
  } catch {
    return null;
  }
}

/**
 * Hook to handle deep links in the root component
 */
export function useDeepLinking() {
  const router = useRouter();
  const isHandlingRef = useRef(false);

  const handleUrl = useCallback(
    async (url: string) => {
      if (isHandlingRef.current) return;
      isHandlingRef.current = true;

      try {
        await handleDeepLink(url, router);
      } finally {
        isHandlingRef.current = false;
      }
    },
    [router]
  );

  useEffect(() => {
    // Handle URL that launched the app
    const handleInitialUrl = async () => {
      const url = await Linking.getInitialURL();
      if (url) {
        handleUrl(url);
      }
    };

    handleInitialUrl();

    // Handle URLs while app is open
    const subscription = Linking.addEventListener('url', (event) => {
      handleUrl(event.url);
    });

    return () => {
      subscription.remove();
    };
  }, [handleUrl]);
}

/**
 * Get the app's URL schemes for sharing
 */
export function getUrlSchemes(): string[] {
  return [URL_SCHEME, `https://${UNIVERSAL_LINK_DOMAIN}`];
}

/**
 * Check if a URL can be handled by the app
 */
export async function canHandleUrl(url: string): Promise<boolean> {
  const parsed = parseDeepLink(url);

  // Check if it's our scheme
  if (parsed.scheme === URL_SCHEME) {
    return true;
  }

  // Check if it's our universal link domain
  if (
    (parsed.scheme === 'https' || parsed.scheme === 'http') &&
    parsed.hostname === UNIVERSAL_LINK_DOMAIN
  ) {
    return true;
  }

  return false;
}

/**
 * Create a shareable URL for the current screen
 */
export function createShareableUrl(
  path: string,
  params?: Record<string, string | number>,
  options?: { preferUniversal?: boolean }
): string {
  // On iOS, prefer Universal Links for better UX
  // On Android, custom schemes work well
  const useUniversal = options?.preferUniversal ?? Platform.OS === 'ios';
  return buildDeepLink(path, params, { universal: useUniversal });
}

/**
 * Get deep link configuration for expo-router
 */
export function getLinkingConfig() {
  return {
    prefixes: [Linking.createURL('/'), `${URL_SCHEME}://`, `https://${UNIVERSAL_LINK_DOMAIN}`],
    config: {
      screens: {
        '(auth)': {
          screens: {
            login: 'auth/login',
            signup: 'auth/signup',
            'forgot-password': 'auth/reset-password',
          },
        },
        '(tabs)': {
          screens: {
            index: '',
            profile: 'profile',
            settings: 'settings',
          },
        },
        'payment/result': 'payment/:status',
        'legal/[type]': 'legal/:type',
        onboarding: 'onboarding',
      },
    },
  };
}
