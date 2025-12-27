/**
 * App Update Checker Hook
 *
 * Checks for app updates and prompts users to update when a new version is available.
 * Supports both OTA updates (Expo Updates) and store updates.
 *
 * Usage:
 * ```tsx
 * const { checkForUpdate, isUpdateAvailable, isChecking } = useAppUpdate();
 *
 * // Check for updates
 * await checkForUpdate();
 *
 * // Or use the component
 * <AppUpdateChecker />
 * ```
 */

import { useState, useEffect, useCallback } from 'react';
import { Platform, Alert, Linking } from 'react-native';
import Constants from 'expo-constants';
import * as Updates from 'expo-updates';

// Configuration for app store URLs
const APP_STORE_CONFIG = {
  // Replace with your actual App Store ID
  iosAppId: 'your-app-store-id',
  // Replace with your actual Android package name
  androidPackage: Constants.expoConfig?.android?.package || 'com.yourcompany.dodoexpo',
};

// Minimum version configuration (update these when you release breaking changes)
const MIN_VERSION_CONFIG = {
  // If current version is below this, force update
  forceUpdateBelow: '1.0.0',
  // If current version is below this, suggest update
  suggestUpdateBelow: '1.0.0',
};

interface AppUpdateState {
  isChecking: boolean;
  isUpdateAvailable: boolean;
  isOtaUpdate: boolean;
  isStoreUpdate: boolean;
  newVersion?: string;
  releaseNotes?: string;
  isForceUpdate: boolean;
}

interface UseAppUpdateReturn extends AppUpdateState {
  checkForUpdate: () => Promise<void>;
  applyOtaUpdate: () => Promise<void>;
  openStore: () => void;
  dismissUpdate: () => void;
}

export function useAppUpdate(): UseAppUpdateReturn {
  const [state, setState] = useState<AppUpdateState>({
    isChecking: false,
    isUpdateAvailable: false,
    isOtaUpdate: false,
    isStoreUpdate: false,
    isForceUpdate: false,
  });

  const currentVersion = Constants.expoConfig?.version || '1.0.0';

  /**
   * Compare semantic versions
   * Returns: -1 if v1 < v2, 0 if equal, 1 if v1 > v2
   */
  const compareVersions = useCallback((v1: string, v2: string): number => {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);

    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const p1 = parts1[i] || 0;
      const p2 = parts2[i] || 0;

      if (p1 < p2) return -1;
      if (p1 > p2) return 1;
    }

    return 0;
  }, []);

  /**
   * Check for OTA updates (Expo Updates)
   */
  const checkOtaUpdate = useCallback(async (): Promise<boolean> => {
    if (__DEV__) {
      console.log('OTA updates not available in development mode');
      return false;
    }

    try {
      const update = await Updates.checkForUpdateAsync();

      if (update.isAvailable) {
        // Access extra field safely - manifest type varies between expo-updates versions
        const manifest = update.manifest as { extra?: { releaseNotes?: string } } | undefined;
        setState((prev) => ({
          ...prev,
          isUpdateAvailable: true,
          isOtaUpdate: true,
          releaseNotes: manifest?.extra?.releaseNotes,
        }));
        return true;
      }

      return false;
    } catch (error) {
      console.log('Error checking for OTA update:', error);
      return false;
    }
  }, []);

  /**
   * Check for store updates
   * This is a simplified version - in production you'd want to use a service
   * like react-native-version-check or your own API
   */
  const checkStoreUpdate = useCallback(async (): Promise<boolean> => {
    // Check if current version is below minimum
    const needsForceUpdate =
      compareVersions(currentVersion, MIN_VERSION_CONFIG.forceUpdateBelow) < 0;
    const needsSuggestedUpdate =
      compareVersions(currentVersion, MIN_VERSION_CONFIG.suggestUpdateBelow) < 0;

    if (needsForceUpdate || needsSuggestedUpdate) {
      setState((prev) => ({
        ...prev,
        isUpdateAvailable: true,
        isStoreUpdate: true,
        isForceUpdate: needsForceUpdate,
        newVersion: needsForceUpdate
          ? MIN_VERSION_CONFIG.forceUpdateBelow
          : MIN_VERSION_CONFIG.suggestUpdateBelow,
      }));
      return true;
    }

    return false;
  }, [currentVersion, compareVersions]);

  /**
   * Check for all types of updates
   */
  const checkForUpdate = useCallback(async () => {
    setState((prev) => ({ ...prev, isChecking: true }));

    try {
      // First check for OTA updates (faster to apply)
      const hasOtaUpdate = await checkOtaUpdate();
      if (hasOtaUpdate) {
        setState((prev) => ({ ...prev, isChecking: false }));
        return;
      }

      // Then check for store updates
      await checkStoreUpdate();
    } finally {
      setState((prev) => ({ ...prev, isChecking: false }));
    }
  }, [checkOtaUpdate, checkStoreUpdate]);

  /**
   * Apply OTA update
   */
  const applyOtaUpdate = useCallback(async () => {
    if (!state.isOtaUpdate) return;

    try {
      await Updates.fetchUpdateAsync();
      await Updates.reloadAsync();
    } catch (error) {
      console.error('Error applying OTA update:', error);
      Alert.alert('Update Failed', 'Please try again later.');
    }
  }, [state.isOtaUpdate]);

  /**
   * Open app store
   */
  const openStore = useCallback(() => {
    const storeUrl = Platform.select({
      ios: `https://apps.apple.com/app/id${APP_STORE_CONFIG.iosAppId}`,
      android: `market://details?id=${APP_STORE_CONFIG.androidPackage}`,
      default: '',
    });

    if (storeUrl) {
      Linking.openURL(storeUrl).catch(() => {
        // Fallback for Android if Play Store app isn't installed
        if (Platform.OS === 'android') {
          Linking.openURL(
            `https://play.google.com/store/apps/details?id=${APP_STORE_CONFIG.androidPackage}`
          );
        }
      });
    }
  }, []);

  /**
   * Dismiss update prompt (only for non-force updates)
   */
  const dismissUpdate = useCallback(() => {
    if (!state.isForceUpdate) {
      setState((prev) => ({
        ...prev,
        isUpdateAvailable: false,
        isOtaUpdate: false,
        isStoreUpdate: false,
      }));
    }
  }, [state.isForceUpdate]);

  // Check for updates on mount
  useEffect(() => {
    checkForUpdate();
  }, []);

  return {
    ...state,
    checkForUpdate,
    applyOtaUpdate,
    openStore,
    dismissUpdate,
  };
}

/**
 * Export the app store config for use in other components
 */
export { APP_STORE_CONFIG, MIN_VERSION_CONFIG };
