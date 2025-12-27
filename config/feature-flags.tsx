/**
 * Feature Flags System
 *
 * Simple local feature flags for A/B testing and gradual rollouts.
 * No external service required.
 *
 * Usage:
 * ```tsx
 * import { useFeatureFlags, FLAGS } from '@/config/feature-flags';
 *
 * // In component
 * const { isEnabled, variant } = useFeatureFlags();
 *
 * if (isEnabled('NEW_PAYWALL')) {
 *   return <NewPaywall />;
 * }
 *
 * // Get A/B test variant
 * const paywallVariant = variant('PAYWALL_VARIANT'); // 'A' | 'B' | 'C'
 * ```
 */

import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { storage, STORAGE_KEYS } from '@/lib/storage';

/**
 * Feature flag definitions
 * Add new flags here with their default values
 */
export const FLAGS = {
  // UI Features
  NEW_ONBOARDING: false,
  NEW_PAYWALL: false,
  SHOW_AI_CHAT: false,

  // Experimental Features
  BIOMETRIC_LOGIN: false,
  DARK_MODE_ONLY: false,

  // Payment Features
  SHOW_ANNUAL_FIRST: true,
  ENABLE_PROMO_CODES: false,

  // Debug Features (auto-disabled in production)
  SHOW_DEBUG_INFO: __DEV__,
  LOG_ANALYTICS: __DEV__,
} as const;

export type FlagName = keyof typeof FLAGS;

/**
 * A/B Test variants
 * Define your experiments here
 */
export const EXPERIMENTS = {
  PAYWALL_VARIANT: ['A', 'B'] as const,
  ONBOARDING_FLOW: ['standard', 'simplified', 'gamified'] as const,
  CTA_TEXT: ['Subscribe Now', 'Start Free Trial', 'Get Premium'] as const,
} as const;

export type ExperimentName = keyof typeof EXPERIMENTS;
export type ExperimentVariant<T extends ExperimentName> = (typeof EXPERIMENTS)[T][number];

/**
 * User's assigned variants (persisted)
 */
interface UserVariants {
  [key: string]: string;
}

/**
 * Flag overrides (for development/testing)
 */
interface FlagOverrides {
  [key: string]: boolean;
}

interface FeatureFlagsState {
  flags: typeof FLAGS;
  variants: UserVariants;
  overrides: FlagOverrides;
  isLoaded: boolean;
}

interface FeatureFlagsContextType extends FeatureFlagsState {
  isEnabled: (flag: FlagName) => boolean;
  variant: <T extends ExperimentName>(experiment: T) => ExperimentVariant<T>;
  setOverride: (flag: FlagName, value: boolean) => void;
  clearOverrides: () => void;
  resetVariants: () => void;
}

const FeatureFlagsContext = createContext<FeatureFlagsContextType | undefined>(undefined);

const VARIANTS_STORAGE_KEY = STORAGE_KEYS.FEATURE_FLAGS_VARIANTS;
const OVERRIDES_STORAGE_KEY = STORAGE_KEYS.FEATURE_FLAGS_OVERRIDES;

/**
 * Generate a consistent variant for a user based on their ID or device
 */
function assignVariant<T extends ExperimentName>(
  experiment: T,
  userId?: string
): ExperimentVariant<T> {
  const variants = EXPERIMENTS[experiment];
  // Use a simple hash to consistently assign the same user to the same variant
  const seed = userId || 'anonymous';
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash = hash & hash;
  }
  const index = Math.abs(hash) % variants.length;
  return variants[index] as ExperimentVariant<T>;
}

/**
 * Feature Flags Provider
 */
export function FeatureFlagsProvider({
  children,
  userId,
}: {
  children: React.ReactNode;
  userId?: string;
}) {
  const [state, setState] = useState<FeatureFlagsState>({
    flags: FLAGS,
    variants: {},
    overrides: {},
    isLoaded: false,
  });

  // Load persisted variants and overrides
  useEffect(() => {
    const loadState = async () => {
      try {
        const [savedVariants, savedOverrides] = await Promise.all([
          storage.get<UserVariants>(VARIANTS_STORAGE_KEY),
          storage.get<FlagOverrides>(OVERRIDES_STORAGE_KEY),
        ]);

        setState((prev) => ({
          ...prev,
          variants: savedVariants || {},
          overrides: __DEV__ ? savedOverrides || {} : {}, // Only load overrides in dev
          isLoaded: true,
        }));
      } catch (error) {
        console.error('Error loading feature flags:', error);
        setState((prev) => ({ ...prev, isLoaded: true }));
      }
    };

    loadState();
  }, []);

  // Assign variants for experiments
  useEffect(() => {
    if (!state.isLoaded) return;

    const newVariants: UserVariants = { ...state.variants };
    let hasChanges = false;

    for (const experiment of Object.keys(EXPERIMENTS) as ExperimentName[]) {
      if (!newVariants[experiment]) {
        newVariants[experiment] = assignVariant(experiment, userId);
        hasChanges = true;
      }
    }

    if (hasChanges) {
      setState((prev) => ({ ...prev, variants: newVariants }));
      storage.set(VARIANTS_STORAGE_KEY, newVariants);
    }
  }, [state.isLoaded, userId]);

  const isEnabled = useCallback(
    (flag: FlagName): boolean => {
      // Check for dev overrides first
      if (__DEV__ && state.overrides[flag] !== undefined) {
        return state.overrides[flag];
      }
      return state.flags[flag];
    },
    [state.flags, state.overrides]
  );

  const variant = useCallback(
    <T extends ExperimentName>(experiment: T): ExperimentVariant<T> => {
      const savedVariant = state.variants[experiment];
      if (savedVariant && EXPERIMENTS[experiment].includes(savedVariant as never)) {
        return savedVariant as ExperimentVariant<T>;
      }
      return assignVariant(experiment, userId);
    },
    [state.variants, userId]
  );

  const setOverride = useCallback((flag: FlagName, value: boolean) => {
    if (!__DEV__) {
      console.warn('Flag overrides are only available in development mode');
      return;
    }

    setState((prev) => {
      const newOverrides = { ...prev.overrides, [flag]: value };
      storage.set(OVERRIDES_STORAGE_KEY, newOverrides);
      return { ...prev, overrides: newOverrides };
    });
  }, []);

  const clearOverrides = useCallback(() => {
    setState((prev) => ({ ...prev, overrides: {} }));
    storage.remove(OVERRIDES_STORAGE_KEY);
  }, []);

  const resetVariants = useCallback(() => {
    setState((prev) => ({ ...prev, variants: {} }));
    storage.remove(VARIANTS_STORAGE_KEY);
  }, []);

  const value: FeatureFlagsContextType = {
    ...state,
    isEnabled,
    variant,
    setOverride,
    clearOverrides,
    resetVariants,
  };

  return <FeatureFlagsContext.Provider value={value}>{children}</FeatureFlagsContext.Provider>;
}

/**
 * Hook to access feature flags
 */
export function useFeatureFlags(): FeatureFlagsContextType {
  const context = useContext(FeatureFlagsContext);
  if (context === undefined) {
    throw new Error('useFeatureFlags must be used within a FeatureFlagsProvider');
  }
  return context;
}

/**
 * Standalone function to check flags (for use outside React components)
 */
export function checkFlag(flag: FlagName): boolean {
  return FLAGS[flag];
}

/**
 * Debug component to show/override flags in development
 */
export { FLAGS as DEFAULT_FLAGS };
