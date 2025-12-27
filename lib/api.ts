/**
 * Network layer with retry, caching, and offline support
 *
 * Features:
 * - Automatic retry with exponential backoff
 * - Response caching with TTL
 * - Offline queue for failed requests
 * - Request deduplication
 * - Timeout handling
 * - Error normalization
 *
 * @example
 * ```typescript
 * import { api, ApiError } from '@/lib/api';
 *
 * // Simple GET request
 * const users = await api.get('/users');
 *
 * // POST with body
 * const newUser = await api.post('/users', { name: 'John' });
 *
 * // With caching
 * const products = await api.get('/products', { cache: { ttl: 60000 } });
 * ```
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { getNetworkState } from './network';

// Configuration
const DEFAULT_TIMEOUT = 30000; // 30 seconds
const DEFAULT_RETRY_COUNT = 3;
const DEFAULT_RETRY_DELAY = 1000; // 1 second
const CACHE_PREFIX = '@api_cache:';
const OFFLINE_QUEUE_KEY = '@api:offline_queue';

// Types
export interface ApiConfig {
  baseUrl?: string;
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

export interface RequestOptions {
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
  cache?: {
    ttl: number; // Cache time-to-live in ms
    key?: string; // Custom cache key
  };
  signal?: AbortSignal;
  skipRetry?: boolean;
  queueIfOffline?: boolean;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export interface QueuedRequest {
  id: string;
  method: string;
  url: string;
  body?: unknown;
  options?: RequestOptions;
  timestamp: number;
}

export class ApiError extends Error {
  public status: number;
  public code: string;
  public data: unknown;
  public isNetworkError: boolean;
  public isTimeout: boolean;

  constructor(
    message: string,
    status: number = 0,
    code: string = 'UNKNOWN_ERROR',
    data: unknown = null
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.data = data;
    this.isNetworkError = status === 0;
    this.isTimeout = code === 'TIMEOUT';
  }
}

// In-flight request tracking for deduplication
const inFlightRequests = new Map<string, Promise<unknown>>();

/**
 * Create API client with configuration
 */
export function createApiClient(config: ApiConfig = {}) {
  const {
    baseUrl = '',
    headers: defaultHeaders = {},
    timeout: defaultTimeout = DEFAULT_TIMEOUT,
    retries: defaultRetries = DEFAULT_RETRY_COUNT,
    retryDelay: defaultRetryDelay = DEFAULT_RETRY_DELAY,
  } = config;

  /**
   * Make an HTTP request with retry and caching
   */
  async function request<T>(
    method: string,
    endpoint: string,
    body?: unknown,
    options: RequestOptions = {}
  ): Promise<T> {
    const url = `${baseUrl}${endpoint}`;
    const cacheKey = options.cache?.key || `${method}:${url}`;
    const timeout = options.timeout ?? defaultTimeout;
    const retries = options.skipRetry ? 0 : (options.retries ?? defaultRetries);

    // Check cache for GET requests
    if (method === 'GET' && options.cache) {
      const cached = await getFromCache<T>(cacheKey);
      if (cached !== null) {
        return cached;
      }
    }

    // Check for in-flight request (deduplication)
    if (method === 'GET' && inFlightRequests.has(cacheKey)) {
      return inFlightRequests.get(cacheKey) as Promise<T>;
    }

    // Check network state
    const networkState = await getNetworkState();
    if (!networkState.isConnected) {
      if (options.queueIfOffline && method !== 'GET') {
        await queueRequest(method, url, body, options);
        throw new ApiError('Request queued for when online', 0, 'OFFLINE_QUEUED');
      }
      throw new ApiError('No internet connection', 0, 'NETWORK_ERROR');
    }

    // Create the request promise
    const requestPromise = executeWithRetry<T>(
      () => makeRequest<T>(method, url, body, { ...options, timeout }),
      retries,
      defaultRetryDelay
    );

    // Track in-flight GET requests
    if (method === 'GET') {
      inFlightRequests.set(cacheKey, requestPromise);
    }

    try {
      const result = await requestPromise;

      // Cache successful GET responses
      if (method === 'GET' && options.cache) {
        await saveToCache(cacheKey, result, options.cache.ttl);
      }

      return result;
    } finally {
      inFlightRequests.delete(cacheKey);
    }
  }

  /**
   * Execute a request with retry logic
   */
  async function executeWithRetry<T>(
    fn: () => Promise<T>,
    retries: number,
    delay: number
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;

        // Don't retry on non-retryable errors
        if (error instanceof ApiError) {
          if (error.status >= 400 && error.status < 500 && error.status !== 429) {
            throw error;
          }
        }

        // Wait before retrying (exponential backoff)
        if (attempt < retries) {
          await sleep(delay * Math.pow(2, attempt));
        }
      }
    }

    throw lastError;
  }

  /**
   * Make the actual HTTP request
   */
  async function makeRequest<T>(
    method: string,
    url: string,
    body?: unknown,
    options: RequestOptions = {}
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), options.timeout ?? defaultTimeout);

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...defaultHeaders,
          ...options.headers,
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: options.signal ?? controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new ApiError(
          errorData?.message || `HTTP ${response.status}`,
          response.status,
          errorData?.code || 'HTTP_ERROR',
          errorData
        );
      }

      // Handle empty responses
      const text = await response.text();
      if (!text) {
        return null as T;
      }

      return JSON.parse(text) as T;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof ApiError) {
        throw error;
      }

      if ((error as Error).name === 'AbortError') {
        throw new ApiError('Request timeout', 0, 'TIMEOUT');
      }

      throw new ApiError((error as Error).message || 'Network error', 0, 'NETWORK_ERROR');
    }
  }

  return {
    get: <T>(endpoint: string, options?: RequestOptions) =>
      request<T>('GET', endpoint, undefined, options),

    post: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
      request<T>('POST', endpoint, body, options),

    put: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
      request<T>('PUT', endpoint, body, options),

    patch: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
      request<T>('PATCH', endpoint, body, options),

    delete: <T>(endpoint: string, options?: RequestOptions) =>
      request<T>('DELETE', endpoint, undefined, options),

    request,
  };
}

// Cache helpers
async function getFromCache<T>(key: string): Promise<T | null> {
  try {
    const cached = await AsyncStorage.getItem(`${CACHE_PREFIX}${key}`);
    if (!cached) return null;

    const entry: CacheEntry<T> = JSON.parse(cached);
    const isExpired = Date.now() - entry.timestamp > entry.ttl;

    if (isExpired) {
      await AsyncStorage.removeItem(`${CACHE_PREFIX}${key}`);
      return null;
    }

    return entry.data;
  } catch {
    return null;
  }
}

async function saveToCache<T>(key: string, data: T, ttl: number): Promise<void> {
  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
    };
    await AsyncStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(entry));
  } catch {
    // Ignore cache save errors
  }
}

/**
 * Clear all cached API responses
 */
export async function clearApiCache(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter((key) => key.startsWith(CACHE_PREFIX));
    await AsyncStorage.multiRemove(cacheKeys);
  } catch {
    // Ignore errors
  }
}

// Offline queue helpers
async function queueRequest(
  method: string,
  url: string,
  body?: unknown,
  options?: RequestOptions
): Promise<void> {
  try {
    const queue = await getOfflineQueue();
    const request: QueuedRequest = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      method,
      url,
      body,
      options,
      timestamp: Date.now(),
    };
    queue.push(request);
    await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
  } catch {
    // Ignore queue errors
  }
}

/**
 * Get all queued offline requests
 */
export async function getOfflineQueue(): Promise<QueuedRequest[]> {
  try {
    const queue = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
    return queue ? JSON.parse(queue) : [];
  } catch {
    return [];
  }
}

/**
 * Process queued offline requests
 * Call this when network becomes available
 */
export async function processOfflineQueue(
  apiClient: ReturnType<typeof createApiClient>
): Promise<{ success: number; failed: number }> {
  const queue = await getOfflineQueue();
  if (queue.length === 0) {
    return { success: 0, failed: 0 };
  }

  let success = 0;
  let failed = 0;
  const remainingQueue: QueuedRequest[] = [];

  for (const request of queue) {
    try {
      await apiClient.request(request.method, request.url, request.body, {
        ...request.options,
        skipRetry: true,
      });
      success++;
    } catch {
      // Keep failed requests that are less than 24 hours old
      const isOld = Date.now() - request.timestamp > 24 * 60 * 60 * 1000;
      if (!isOld) {
        remainingQueue.push(request);
      }
      failed++;
    }
  }

  await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(remainingQueue));
  return { success, failed };
}

/**
 * Clear the offline queue
 */
export async function clearOfflineQueue(): Promise<void> {
  await AsyncStorage.removeItem(OFFLINE_QUEUE_KEY);
}

// Utility
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Default API client (configure with your base URL)
export const api = createApiClient({
  baseUrl: process.env.EXPO_PUBLIC_API_URL || '',
});

export default api;
