/**
 * Performance Monitoring
 *
 * Tracks app performance metrics including:
 * - App startup time
 * - Screen render times
 * - API response times
 * - Memory usage
 * - Frame rate
 *
 * @example
 * ```typescript
 * import { PerformanceMonitor, useScreenPerformance } from '@/lib/performance-monitor';
 *
 * // Track app startup
 * PerformanceMonitor.markAppStart();
 * // Later...
 * PerformanceMonitor.markAppReady();
 *
 * // In screens
 * function MyScreen() {
 *   useScreenPerformance('MyScreen');
 *   return <Content />;
 * }
 * ```
 */

import { useEffect, useRef } from 'react';
import { InteractionManager, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const METRICS_KEY = '@performance:metrics';
const SESSION_KEY = '@performance:session';

// Types
export interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'mb' | 'fps' | 'count';
  timestamp: number;
  tags?: Record<string, string>;
}

export interface PerformanceSession {
  sessionId: string;
  startTime: number;
  appStartTime?: number;
  appReadyTime?: number;
  metrics: PerformanceMetric[];
}

// Global state
let currentSession: PerformanceSession | null = null;
let appStartMark: number | null = null;

/**
 * Generate a unique session ID
 */
function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Performance monitoring utilities
 */
export const PerformanceMonitor = {
  /**
   * Start a new performance session
   */
  startSession(): void {
    currentSession = {
      sessionId: generateSessionId(),
      startTime: Date.now(),
      metrics: [],
    };

    if (__DEV__) {
      console.log('[Performance] Session started:', currentSession.sessionId);
    }
  },

  /**
   * Mark app start time (call as early as possible)
   */
  markAppStart(): void {
    appStartMark = Date.now();
    if (!currentSession) {
      this.startSession();
    }
    if (currentSession) {
      currentSession.appStartTime = appStartMark;
    }
  },

  /**
   * Mark app ready time (call when app is interactive)
   */
  markAppReady(): void {
    const readyTime = Date.now();
    if (currentSession) {
      currentSession.appReadyTime = readyTime;

      if (appStartMark) {
        const startupTime = readyTime - appStartMark;
        this.recordMetric('app_startup', startupTime, 'ms');

        if (__DEV__) {
          console.log(`[Performance] App startup time: ${startupTime}ms`);
        }
      }
    }
  },

  /**
   * Record a performance metric
   */
  recordMetric(
    name: string,
    value: number,
    unit: PerformanceMetric['unit'] = 'ms',
    tags?: Record<string, string>
  ): void {
    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: Date.now(),
      tags,
    };

    if (currentSession) {
      currentSession.metrics.push(metric);
    }

    if (__DEV__) {
      console.log(`[Performance] ${name}: ${value}${unit}`, tags || '');
    }
  },

  /**
   * Create a timer for measuring durations
   */
  startTimer(name: string): () => number {
    const startTime = Date.now();

    return () => {
      const duration = Date.now() - startTime;
      this.recordMetric(name, duration, 'ms');
      return duration;
    };
  },

  /**
   * Measure async function execution time
   */
  async measureAsync<T>(
    name: string,
    fn: () => Promise<T>,
    tags?: Record<string, string>
  ): Promise<T> {
    const startTime = Date.now();
    try {
      const result = await fn();
      this.recordMetric(name, Date.now() - startTime, 'ms', {
        ...tags,
        status: 'success',
      });
      return result;
    } catch (error) {
      this.recordMetric(name, Date.now() - startTime, 'ms', {
        ...tags,
        status: 'error',
      });
      throw error;
    }
  },

  /**
   * Get current session metrics
   */
  getSessionMetrics(): PerformanceMetric[] {
    return currentSession?.metrics || [];
  },

  /**
   * Get session summary
   */
  getSessionSummary(): Record<string, number> {
    const metrics = this.getSessionMetrics();
    const summary: Record<string, number> = {};

    for (const metric of metrics) {
      const key = metric.name;
      if (summary[key] === undefined) {
        summary[key] = metric.value;
      } else {
        // Average for repeated metrics
        summary[key] = (summary[key] + metric.value) / 2;
      }
    }

    return summary;
  },

  /**
   * Save session to storage
   */
  async saveSession(): Promise<void> {
    if (!currentSession) return;

    try {
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(currentSession));

      // Also append to historical metrics
      const existingData = await AsyncStorage.getItem(METRICS_KEY);
      const existing: PerformanceSession[] = existingData ? JSON.parse(existingData) : [];

      // Keep last 10 sessions
      existing.push(currentSession);
      if (existing.length > 10) {
        existing.shift();
      }

      await AsyncStorage.setItem(METRICS_KEY, JSON.stringify(existing));
    } catch {
      // Ignore storage errors
    }
  },

  /**
   * Get historical sessions
   */
  async getHistoricalSessions(): Promise<PerformanceSession[]> {
    try {
      const data = await AsyncStorage.getItem(METRICS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  /**
   * Clear all performance data
   */
  async clearData(): Promise<void> {
    await AsyncStorage.multiRemove([METRICS_KEY, SESSION_KEY]);
    currentSession = null;
    appStartMark = null;
  },
};

/**
 * Hook to track screen render performance
 */
export function useScreenPerformance(screenName: string): void {
  const mountTime = useRef(Date.now());
  const hasReported = useRef(false);

  useEffect(() => {
    // Track time to mount
    const mountDuration = Date.now() - mountTime.current;
    PerformanceMonitor.recordMetric('screen_mount', mountDuration, 'ms', {
      screen: screenName,
    });

    // Track time to interactive
    const interactionPromise = InteractionManager.runAfterInteractions(() => {
      if (!hasReported.current) {
        const interactiveDuration = Date.now() - mountTime.current;
        PerformanceMonitor.recordMetric('screen_interactive', interactiveDuration, 'ms', {
          screen: screenName,
        });
        hasReported.current = true;
      }
    });

    return () => {
      interactionPromise.cancel();
    };
  }, [screenName]);
}

/**
 * Hook to track component render time
 */
export function useRenderTime(componentName: string): void {
  const renderStart = useRef(Date.now());

  useEffect(() => {
    const renderTime = Date.now() - renderStart.current;
    if (renderTime > 16) {
      // Only log slow renders (> 1 frame at 60fps)
      PerformanceMonitor.recordMetric('slow_render', renderTime, 'ms', {
        component: componentName,
      });
    }
  });

  // Reset on each render
  renderStart.current = Date.now();
}

/**
 * Create an API timing wrapper
 */
export function createApiTimer(endpoint: string) {
  const startTime = Date.now();

  return {
    success(): void {
      PerformanceMonitor.recordMetric('api_request', Date.now() - startTime, 'ms', {
        endpoint,
        status: 'success',
      });
    },
    error(): void {
      PerformanceMonitor.recordMetric('api_request', Date.now() - startTime, 'ms', {
        endpoint,
        status: 'error',
      });
    },
  };
}

/**
 * Measure memory usage (approximate, dev only)
 */
export function measureMemory(): { usedMB: number; totalMB: number } | null {
  if (Platform.OS === 'web' && typeof performance !== 'undefined') {
    // @ts-expect-error - memory is non-standard
    const memory = performance.memory;
    if (memory) {
      return {
        usedMB: Math.round(memory.usedJSHeapSize / 1024 / 1024),
        totalMB: Math.round(memory.totalJSHeapSize / 1024 / 1024),
      };
    }
  }
  return null;
}

/**
 * Performance monitoring wrapper for functions
 */
export function withPerformanceTracking<T extends (...args: unknown[]) => unknown>(
  fn: T,
  name: string
): T {
  return ((...args: unknown[]) => {
    const stopTimer = PerformanceMonitor.startTimer(name);
    try {
      const result = fn(...args);
      if (result instanceof Promise) {
        return result.finally(stopTimer);
      }
      stopTimer();
      return result;
    } catch (error) {
      stopTimer();
      throw error;
    }
  }) as T;
}

// Initialize session on import
PerformanceMonitor.startSession();
