/**
 * Biometric Authentication Hook
 *
 * Provides Face ID, Touch ID, and fingerprint authentication.
 *
 * Usage:
 * ```tsx
 * const { isAvailable, biometricType, authenticate, isEnabled, setEnabled } = useBiometric();
 *
 * // Check if biometric is available
 * if (isAvailable) {
 *   // Show biometric login option
 * }
 *
 * // Authenticate user
 * const success = await authenticate('Unlock your account');
 *
 * // Enable/disable biometric login
 * await setEnabled(true);
 * ```
 */

import { useState, useEffect, useCallback } from 'react';
import { Platform, Alert } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { secureStorage } from '@/lib/storage';

const BIOMETRIC_ENABLED_KEY = 'biometric:enabled';

export type BiometricType = 'face' | 'fingerprint' | 'iris' | 'none';

interface UseBiometricReturn {
  // Device capabilities
  isAvailable: boolean;
  biometricType: BiometricType;
  biometricLabel: string;
  // User preference
  isEnabled: boolean;
  isLoading: boolean;
  // Actions
  authenticate: (reason?: string) => Promise<boolean>;
  setEnabled: (enabled: boolean) => Promise<void>;
  checkAvailability: () => Promise<boolean>;
}

/**
 * Get human-readable biometric type label
 */
function getBiometricLabel(type: BiometricType): string {
  switch (type) {
    case 'face':
      return Platform.OS === 'ios' ? 'Face ID' : 'Face Recognition';
    case 'fingerprint':
      return Platform.OS === 'ios' ? 'Touch ID' : 'Fingerprint';
    case 'iris':
      return 'Iris Recognition';
    default:
      return 'Biometric';
  }
}

/**
 * Convert LocalAuthentication type to our BiometricType
 */
function mapAuthenticationType(types: LocalAuthentication.AuthenticationType[]): BiometricType {
  if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
    return 'face';
  }
  if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
    return 'fingerprint';
  }
  if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
    return 'iris';
  }
  return 'none';
}

export function useBiometric(): UseBiometricReturn {
  const [isAvailable, setIsAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState<BiometricType>('none');
  const [isEnabled, setIsEnabledState] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const biometricLabel = getBiometricLabel(biometricType);

  /**
   * Check if biometric authentication is available on device
   */
  const checkAvailability = useCallback(async (): Promise<boolean> => {
    try {
      // Check hardware support
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      if (!hasHardware) {
        setIsAvailable(false);
        setBiometricType('none');
        return false;
      }

      // Check if biometrics are enrolled
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!isEnrolled) {
        setIsAvailable(false);
        setBiometricType('none');
        return false;
      }

      // Get supported authentication types
      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
      const type = mapAuthenticationType(types);

      setIsAvailable(true);
      setBiometricType(type);

      return true;
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      setIsAvailable(false);
      setBiometricType('none');
      return false;
    }
  }, []);

  /**
   * Load saved preference and check availability
   */
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      try {
        // Check if biometrics are available
        await checkAvailability();

        // Load user preference
        const savedEnabled = await secureStorage.get(BIOMETRIC_ENABLED_KEY);
        setIsEnabledState(savedEnabled === 'true');
      } catch (error) {
        console.error('Error initializing biometric:', error);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, [checkAvailability]);

  /**
   * Authenticate user with biometrics
   */
  const authenticate = useCallback(
    async (reason?: string): Promise<boolean> => {
      if (!isAvailable) {
        console.warn('Biometric authentication not available');
        return false;
      }

      try {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: reason || `Authenticate with ${biometricLabel}`,
          fallbackLabel: 'Use passcode',
          cancelLabel: 'Cancel',
          disableDeviceFallback: false,
        });

        if (result.success) {
          return true;
        }

        // Handle specific error cases
        if (result.error === 'user_cancel') {
          console.log('User cancelled biometric authentication');
          return false;
        }

        if (result.error === 'lockout') {
          Alert.alert(
            'Too Many Attempts',
            'Biometric authentication is locked. Please try again later or use your passcode.',
            [{ text: 'OK' }]
          );
          return false;
        }

        console.log('Biometric authentication failed:', result.error);
        return false;
      } catch (error) {
        console.error('Biometric authentication error:', error);
        return false;
      }
    },
    [isAvailable, biometricLabel]
  );

  /**
   * Enable or disable biometric authentication
   */
  const setEnabled = useCallback(
    async (enabled: boolean): Promise<void> => {
      if (enabled && !isAvailable) {
        Alert.alert(
          'Biometric Not Available',
          `${biometricLabel} is not available on this device. Please set up biometric authentication in your device settings.`,
          [{ text: 'OK' }]
        );
        return;
      }

      if (enabled) {
        // Verify biometric works before enabling
        const success = await authenticate('Verify your identity to enable biometric login');
        if (!success) {
          return;
        }
      }

      await secureStorage.set(BIOMETRIC_ENABLED_KEY, enabled.toString());
      setIsEnabledState(enabled);
    },
    [isAvailable, authenticate, biometricLabel]
  );

  return {
    isAvailable,
    biometricType,
    biometricLabel,
    isEnabled,
    isLoading,
    authenticate,
    setEnabled,
    checkAvailability,
  };
}

/**
 * Standalone function to check biometric availability
 */
export async function isBiometricAvailable(): Promise<boolean> {
  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    return hasHardware && isEnrolled;
  } catch {
    return false;
  }
}

/**
 * Get the type of biometric available
 */
export async function getBiometricType(): Promise<BiometricType> {
  try {
    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
    return mapAuthenticationType(types);
  } catch {
    return 'none';
  }
}
