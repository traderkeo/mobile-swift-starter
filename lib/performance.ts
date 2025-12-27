/**
 * Performance Utilities
 *
 * Memoization, image optimization, and performance helpers.
 */

import { useMemo, useCallback, useRef, useEffect } from 'react';

// ============================================
// MEMOIZATION UTILITIES
// ============================================

/**
 * Simple memoization function with cache
 * @param fn Function to memoize
 * @param maxCacheSize Maximum cache entries
 */
export function memoize<T extends (...args: unknown[]) => unknown>(
  fn: T,
  maxCacheSize: number = 100
): T {
  const cache = new Map<string, ReturnType<T>>();

  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const result = fn(...args) as ReturnType<T>;

    // Limit cache size
    if (cache.size >= maxCacheSize) {
      const firstKey = cache.keys().next().value;
      if (firstKey !== undefined) {
        cache.delete(firstKey);
      }
    }

    cache.set(key, result);
    return result;
  }) as T;
}

/**
 * Memoize async function with cache
 */
export function memoizeAsync<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  maxCacheSize: number = 50,
  ttlMs: number = 5 * 60 * 1000 // 5 minutes default
): T {
  const cache = new Map<string, { value: Awaited<ReturnType<T>>; timestamp: number }>();

  return (async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> => {
    const key = JSON.stringify(args);
    const now = Date.now();

    const cached = cache.get(key);
    if (cached && now - cached.timestamp < ttlMs) {
      return cached.value;
    }

    const result = (await fn(...args)) as Awaited<ReturnType<T>>;

    // Clean old entries and limit cache size
    for (const [k, v] of cache.entries()) {
      if (now - v.timestamp > ttlMs) {
        cache.delete(k);
      }
    }
    if (cache.size >= maxCacheSize) {
      const firstKey = cache.keys().next().value;
      if (firstKey !== undefined) {
        cache.delete(firstKey);
      }
    }

    cache.set(key, { value: result, timestamp: now });
    return result;
  }) as T;
}

// ============================================
// REACT HOOKS
// ============================================

/**
 * Debounce a value
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// Need to import useState for useDebounce
import { useState } from 'react';

/**
 * Debounce a callback function
 */
export function useDebouncedCallback<T extends (...args: unknown[]) => void>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback as T;
}

/**
 * Throttle a callback function
 */
export function useThrottledCallback<T extends (...args: unknown[]) => void>(
  callback: T,
  limit: number
): T {
  const lastRun = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      const timeSinceLastRun = now - lastRun.current;

      if (timeSinceLastRun >= limit) {
        lastRun.current = now;
        callback(...args);
      } else {
        // Schedule trailing call
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
          lastRun.current = Date.now();
          callback(...args);
        }, limit - timeSinceLastRun);
      }
    },
    [callback, limit]
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return throttledCallback as T;
}

/**
 * Track previous value
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

/**
 * Run effect only when dependencies actually change (deep compare)
 */
export function useDeepCompareEffect(effect: () => void | (() => void), deps: unknown[]): void {
  const ref = useRef<unknown[]>(deps);

  if (!deepEqual(ref.current, deps)) {
    ref.current = deps;
  }

  useEffect(effect, [ref.current]);
}

/**
 * Memoize value with deep comparison
 */
export function useDeepCompareMemo<T>(factory: () => T, deps: unknown[]): T {
  const ref = useRef<{ deps: unknown[]; value: T } | null>(null);

  if (!ref.current || !deepEqual(ref.current.deps, deps)) {
    ref.current = { deps, value: factory() };
  }

  return ref.current.value;
}

// ============================================
// IMAGE OPTIMIZATION
// ============================================

/**
 * Calculate optimal image dimensions for display
 */
export function getOptimalImageSize(
  originalWidth: number,
  originalHeight: number,
  containerWidth: number,
  containerHeight?: number,
  devicePixelRatio: number = 2
): { width: number; height: number } {
  const aspectRatio = originalWidth / originalHeight;

  let width = containerWidth * devicePixelRatio;
  let height = width / aspectRatio;

  if (containerHeight && height > containerHeight * devicePixelRatio) {
    height = containerHeight * devicePixelRatio;
    width = height * aspectRatio;
  }

  // Round to nearest 100 for better caching
  width = Math.ceil(width / 100) * 100;
  height = Math.ceil(height / 100) * 100;

  return { width, height };
}

/**
 * Generate image placeholder color from string
 */
export function getPlaceholderColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }

  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 60%, 80%)`;
}

/**
 * Calculate blurhash dimensions
 */
export function getBlurhashSize(
  width: number,
  height: number,
  maxDim: number = 32
): { width: number; height: number } {
  const ratio = width / height;

  if (width > height) {
    return { width: maxDim, height: Math.round(maxDim / ratio) };
  } else {
    return { width: Math.round(maxDim * ratio), height: maxDim };
  }
}

// ============================================
// LIST OPTIMIZATION
// ============================================

/**
 * Generate stable key for list items
 */
export function generateStableKey(
  item: Record<string, unknown>,
  index: number,
  fields: string[] = ['id', '_id', 'key', 'uuid']
): string {
  for (const field of fields) {
    if (item[field] !== undefined && item[field] !== null) {
      return String(item[field]);
    }
  }
  return `item-${index}`;
}

/**
 * Batch updates for FlatList
 */
export function batchUpdates<T>(items: T[], batchSize: number = 10): T[][] {
  const batches: T[][] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    batches.push(items.slice(i, i + batchSize));
  }
  return batches;
}

// ============================================
// DEEP EQUALITY
// ============================================

/**
 * Deep equality check
 */
export function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;

  if (typeof a !== typeof b) return false;
  if (a === null || b === null) return a === b;
  if (typeof a !== 'object') return a === b;

  const aObj = a as Record<string, unknown>;
  const bObj = b as Record<string, unknown>;

  const aKeys = Object.keys(aObj);
  const bKeys = Object.keys(bObj);

  if (aKeys.length !== bKeys.length) return false;

  for (const key of aKeys) {
    if (!bKeys.includes(key)) return false;
    if (!deepEqual(aObj[key], bObj[key])) return false;
  }

  return true;
}

// ============================================
// PERFORMANCE MONITORING
// ============================================

/**
 * Measure execution time
 */
export function measureTime<T>(fn: () => T, label: string): T {
  const start = performance.now();
  const result = fn();
  const end = performance.now();

  if (__DEV__) {
    console.log(`[Performance] ${label}: ${(end - start).toFixed(2)}ms`);
  }

  return result;
}

/**
 * Measure async execution time
 */
export async function measureTimeAsync<T>(fn: () => Promise<T>, label: string): Promise<T> {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();

  if (__DEV__) {
    console.log(`[Performance] ${label}: ${(end - start).toFixed(2)}ms`);
  }

  return result;
}

/**
 * Track renders in development
 */
export function useRenderCount(componentName: string): void {
  const renderCount = useRef(0);

  useEffect(() => {
    renderCount.current += 1;
    if (__DEV__) {
      console.log(`[Render] ${componentName}: ${renderCount.current}`);
    }
  });
}

/**
 * Log when component mounts/unmounts
 */
export function useLifecycleLog(componentName: string): void {
  useEffect(() => {
    if (__DEV__) {
      console.log(`[Mount] ${componentName}`);
      return () => console.log(`[Unmount] ${componentName}`);
    }
  }, [componentName]);
}
