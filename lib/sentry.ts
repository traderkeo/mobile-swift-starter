/**
 * Sentry crash reporting and error tracking
 *
 * @example
 * ```typescript
 * import { captureException, captureMessage, setUser } from '@/lib/sentry';
 *
 * // Capture an error
 * try {
 *   riskyOperation();
 * } catch (error) {
 *   captureException(error);
 * }
 *
 * // Set user context after login
 * setUser({ id: 'user-123', email: 'user@example.com' });
 * ```
 */

import * as Sentry from '@sentry/react-native';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Sentry DSN from environment variables
const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN || '';

/**
 * Initialize Sentry for crash reporting
 * Should be called early in app initialization
 */
export function initializeSentry(): void {
  if (!SENTRY_DSN) {
    if (__DEV__) {
      console.log('[Sentry] No DSN configured, skipping initialization');
    }
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    debug: __DEV__,
    enabled: !__DEV__, // Only enable in production
    environment: __DEV__ ? 'development' : 'production',
    release: `${Constants.expoConfig?.slug}@${Constants.expoConfig?.version}`,
    dist: Constants.expoConfig?.version,

    // Performance monitoring
    tracesSampleRate: __DEV__ ? 1.0 : 0.2,
    profilesSampleRate: __DEV__ ? 1.0 : 0.1,

    // Session replay for debugging (optional)
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    // Integrations
    integrations: [Sentry.reactNativeTracingIntegration(), Sentry.mobileReplayIntegration()],

    // Before sending, filter sensitive data
    beforeSend(event) {
      // Remove sensitive query params
      if (event.request?.query_string) {
        const sensitiveParams = ['token', 'password', 'secret', 'api_key'];
        const query = event.request.query_string;
        for (const param of sensitiveParams) {
          if (typeof query === 'string' && query.includes(param)) {
            event.request.query_string = '[Filtered]';
            break;
          }
        }
      }
      return event;
    },

    // Ignore certain errors
    ignoreErrors: [
      // Network errors that aren't actionable
      'Network request failed',
      'Failed to fetch',
      // User cancelled operations
      'User cancelled',
      'AbortError',
    ],
  });

  // Set default tags
  Sentry.setTag('platform', Platform.OS);
  Sentry.setTag('app_version', Constants.expoConfig?.version || 'unknown');
}

/**
 * Capture an exception and send to Sentry
 */
export function captureException(
  error: Error | unknown,
  context?: Record<string, unknown>
): string {
  if (!SENTRY_DSN && __DEV__) {
    console.error('[Sentry] Exception:', error);
    return '';
  }

  if (context) {
    Sentry.setContext('additional', context);
  }

  return Sentry.captureException(error);
}

/**
 * Capture a message (non-error event)
 */
export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info'): string {
  if (!SENTRY_DSN && __DEV__) {
    console.log(`[Sentry] ${level}: ${message}`);
    return '';
  }

  return Sentry.captureMessage(message, level);
}

/**
 * Set user context for error tracking
 * Call after user authentication
 */
export function setUser(
  user: {
    id: string;
    email?: string;
    username?: string;
  } | null
): void {
  Sentry.setUser(user);
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(
  category: string,
  message: string,
  data?: Record<string, unknown>,
  level: Sentry.SeverityLevel = 'info'
): void {
  Sentry.addBreadcrumb({
    category,
    message,
    data,
    level,
  });
}

/**
 * Set custom tag for filtering in Sentry dashboard
 */
export function setTag(key: string, value: string): void {
  Sentry.setTag(key, value);
}

/**
 * Set extra context data
 */
export function setExtra(key: string, value: unknown): void {
  Sentry.setExtra(key, value);
}

/**
 * Start a performance transaction
 */
export function startTransaction(name: string, op: string): Sentry.Span | undefined {
  return Sentry.startInactiveSpan({ name, op });
}

/**
 * Wrap a component with Sentry error boundary
 */
export const SentryErrorBoundary = Sentry.ErrorBoundary;

/**
 * Wrap navigation container for automatic screen tracking
 */
export const SentryNavigationContainer = Sentry.wrap;

/**
 * HOC to wrap components with Sentry profiling
 */
export function withSentryProfiler<P extends object>(
  Component: React.ComponentType<P>,
  name?: string
): React.ComponentType<P> {
  return Sentry.withProfiler(Component, { name });
}

export { Sentry };
