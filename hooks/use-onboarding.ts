/**
 * Onboarding Hook
 *
 * Manages the onboarding flow state using the typed storage wrapper.
 * Tracks whether the user has completed the onboarding screens.
 */

import { useState, useEffect, useCallback } from 'react';
import { storage, STORAGE_KEYS } from '@/lib/storage';

export function useOnboarding() {
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const value = await storage.get<boolean>(STORAGE_KEYS.ONBOARDING_COMPLETE);
      setHasSeenOnboarding(value === true);
    } catch (error) {
      console.error('Error reading onboarding status:', error);
      setHasSeenOnboarding(false);
    } finally {
      setIsLoading(false);
    }
  };

  const completeOnboarding = useCallback(async () => {
    try {
      await storage.set(STORAGE_KEYS.ONBOARDING_COMPLETE, true);
      setHasSeenOnboarding(true);
    } catch (error) {
      console.error('Error saving onboarding status:', error);
    }
  }, []);

  const resetOnboarding = useCallback(async () => {
    try {
      await storage.remove(STORAGE_KEYS.ONBOARDING_COMPLETE);
      setHasSeenOnboarding(false);
    } catch (error) {
      console.error('Error resetting onboarding status:', error);
    }
  }, []);

  return {
    hasSeenOnboarding,
    isLoading,
    completeOnboarding,
    resetOnboarding,
  };
}
