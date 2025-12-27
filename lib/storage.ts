/**
 * AsyncStorage Wrapper with TypeScript Support
 *
 * Provides a typed, secure storage layer for the app using AsyncStorage
 * on web and SecureStore on mobile for sensitive data.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * Storage keys used throughout the app
 */
export const STORAGE_KEYS = {
  // Auth
  USER: 'auth:user',
  SESSION_TOKEN: 'auth:session_token',

  // RevenueCat Cache
  CUSTOMER_INFO: 'rc:customer_info',
  OFFERINGS: 'rc:offerings',
  LAST_SYNC: 'rc:last_sync',

  // Subscription State (local cache)
  SUBSCRIPTION_STATUS: 'subscription:status',

  // App State
  ONBOARDING_COMPLETE: 'app:onboarding_complete',
  THEME_PREFERENCE: 'app:theme',

  // Feature Flags
  FEATURE_FLAGS_VARIANTS: 'feature_flags:variants',
  FEATURE_FLAGS_OVERRIDES: 'feature_flags:overrides',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

/**
 * Generic storage operations with JSON serialization
 */
export const storage = {
  /**
   * Get a value from storage
   */
  async get<T>(key: StorageKey): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      if (value === null) return null;
      return JSON.parse(value) as T;
    } catch (error) {
      console.warn(`Storage get error for ${key}:`, error);
      return null;
    }
  },

  /**
   * Set a value in storage
   */
  async set<T>(key: StorageKey, value: T): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`Storage set error for ${key}:`, error);
    }
  },

  /**
   * Remove a value from storage
   */
  async remove(key: StorageKey): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.warn(`Storage remove error for ${key}:`, error);
    }
  },

  /**
   * Clear all app storage
   */
  async clear(): Promise<void> {
    try {
      const keys = Object.values(STORAGE_KEYS);
      await AsyncStorage.multiRemove(keys);
    } catch (error) {
      console.warn('Storage clear error:', error);
    }
  },

  /**
   * Get multiple values at once
   */
  async getMultiple<T extends Record<string, unknown>>(keys: StorageKey[]): Promise<Partial<T>> {
    try {
      const pairs = await AsyncStorage.multiGet(keys);
      const result: Record<string, unknown> = {};

      for (const [key, value] of pairs) {
        if (value !== null) {
          result[key] = JSON.parse(value);
        }
      }

      return result as Partial<T>;
    } catch (error) {
      console.warn('Storage getMultiple error:', error);
      return {};
    }
  },
};

/**
 * Secure storage for sensitive data (tokens, passwords)
 * Uses Keychain on iOS, Keystore on Android, falls back to AsyncStorage on web
 */
export const secureStorage = {
  /**
   * Get a secure value
   */
  async get(key: string): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        return await AsyncStorage.getItem(`secure:${key}`);
      }
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.warn(`SecureStorage get error for ${key}:`, error);
      return null;
    }
  },

  /**
   * Set a secure value
   */
  async set(key: string, value: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        await AsyncStorage.setItem(`secure:${key}`, value);
      } else {
        await SecureStore.setItemAsync(key, value, {
          keychainAccessible: SecureStore.WHEN_UNLOCKED,
        });
      }
    } catch (error) {
      console.warn(`SecureStorage set error for ${key}:`, error);
    }
  },

  /**
   * Remove a secure value
   */
  async remove(key: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        await AsyncStorage.removeItem(`secure:${key}`);
      } else {
        await SecureStore.deleteItemAsync(key);
      }
    } catch (error) {
      console.warn(`SecureStorage remove error for ${key}:`, error);
    }
  },
};

/**
 * User data stored in AsyncStorage
 */
export interface StoredUser {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  createdAt: string;
}

/**
 * Subscription status cached locally
 */
export interface StoredSubscriptionStatus {
  isPremium: boolean;
  entitlements: string[];
  expiresAt?: string;
  lastUpdated: string;
}
