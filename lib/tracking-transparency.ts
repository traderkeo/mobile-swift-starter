/**
 * App Tracking Transparency (ATT) for iOS
 *
 * Apple requires apps to request user permission before tracking.
 * This module handles the ATT prompt and stores the user's choice.
 *
 * @example
 * ```typescript
 * import { requestTrackingPermission, getTrackingStatus } from '@/lib/tracking-transparency';
 *
 * // Request permission (should be called after onboarding)
 * const status = await requestTrackingPermission();
 * if (status === 'granted') {
 *   // Enable analytics/ads tracking
 * }
 * ```
 */

import { Platform } from 'react-native';
import {
  requestTrackingPermissionsAsync,
  getTrackingPermissionsAsync,
  PermissionStatus,
} from 'expo-tracking-transparency';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ATT_PROMPTED_KEY = '@app:att_prompted';
const ATT_STATUS_KEY = '@app:att_status';

export type TrackingStatus = 'granted' | 'denied' | 'undetermined' | 'restricted' | 'unavailable';

/**
 * Maps Expo permission status to our TrackingStatus
 */
function mapPermissionStatus(status: PermissionStatus): TrackingStatus {
  switch (status) {
    case PermissionStatus.GRANTED:
      return 'granted';
    case PermissionStatus.DENIED:
      return 'denied';
    case PermissionStatus.UNDETERMINED:
      return 'undetermined';
    default:
      return 'restricted';
  }
}

/**
 * Get the current tracking permission status
 */
export async function getTrackingStatus(): Promise<TrackingStatus> {
  // ATT is only available on iOS 14+
  if (Platform.OS !== 'ios') {
    return 'unavailable';
  }

  try {
    const { status } = await getTrackingPermissionsAsync();
    return mapPermissionStatus(status);
  } catch {
    return 'unavailable';
  }
}

/**
 * Check if we've already prompted the user for tracking permission
 */
export async function hasPromptedForTracking(): Promise<boolean> {
  try {
    const prompted = await AsyncStorage.getItem(ATT_PROMPTED_KEY);
    return prompted === 'true';
  } catch {
    return false;
  }
}

/**
 * Request tracking permission from the user
 *
 * Best practices:
 * - Call AFTER onboarding, not immediately on app launch
 * - Show a pre-prompt explaining why you need tracking
 * - Only call once per user (check hasPromptedForTracking first)
 *
 * @returns The tracking permission status
 */
export async function requestTrackingPermission(): Promise<TrackingStatus> {
  // ATT is only available on iOS 14+
  if (Platform.OS !== 'ios') {
    return 'unavailable';
  }

  try {
    // Check if already determined
    const currentStatus = await getTrackingStatus();
    if (currentStatus !== 'undetermined') {
      return currentStatus;
    }

    // Request permission
    const { status } = await requestTrackingPermissionsAsync();
    const trackingStatus = mapPermissionStatus(status);

    // Store that we've prompted
    await AsyncStorage.setItem(ATT_PROMPTED_KEY, 'true');
    await AsyncStorage.setItem(ATT_STATUS_KEY, trackingStatus);

    return trackingStatus;
  } catch {
    return 'unavailable';
  }
}

/**
 * Check if tracking is allowed
 * Returns true if user granted permission or ATT is not applicable
 */
export async function isTrackingAllowed(): Promise<boolean> {
  const status = await getTrackingStatus();
  // Tracking is allowed if granted, or if ATT doesn't apply (non-iOS, older iOS)
  return status === 'granted' || status === 'unavailable';
}

/**
 * Get the cached tracking status (synchronous, for quick checks)
 */
export async function getCachedTrackingStatus(): Promise<TrackingStatus | null> {
  try {
    const status = await AsyncStorage.getItem(ATT_STATUS_KEY);
    return status as TrackingStatus | null;
  } catch {
    return null;
  }
}

/**
 * Hook to use tracking transparency in components
 */
export function useTrackingTransparency() {
  const [status, setStatus] = React.useState<TrackingStatus>('undetermined');
  const [isLoading, setIsLoading] = React.useState(true);
  const [hasPrompted, setHasPrompted] = React.useState(false);

  React.useEffect(() => {
    async function checkStatus() {
      const [currentStatus, prompted] = await Promise.all([
        getTrackingStatus(),
        hasPromptedForTracking(),
      ]);
      setStatus(currentStatus);
      setHasPrompted(prompted);
      setIsLoading(false);
    }
    checkStatus();
  }, []);

  const requestPermission = React.useCallback(async () => {
    setIsLoading(true);
    const newStatus = await requestTrackingPermission();
    setStatus(newStatus);
    setHasPrompted(true);
    setIsLoading(false);
    return newStatus;
  }, []);

  return {
    status,
    isLoading,
    hasPrompted,
    isAllowed: status === 'granted' || status === 'unavailable',
    requestPermission,
  };
}

// Import React for the hook
import * as React from 'react';
