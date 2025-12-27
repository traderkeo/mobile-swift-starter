/**
 * RevenueCat Hook
 * Unified in-app purchases for iOS, Android, and Web
 *
 * Features:
 * - Single SDK for all platforms
 * - Client-side receipt validation (handled by RevenueCat)
 * - Cross-platform entitlement sync
 * - Local caching with AsyncStorage
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Platform } from 'react-native';
import Purchases, {
  PurchasesPackage,
  CustomerInfo,
  PurchasesOffering,
  LOG_LEVEL,
  PURCHASES_ERROR_CODE,
} from 'react-native-purchases';
import { env } from '@/config/env';
import { storage, STORAGE_KEYS, StoredSubscriptionStatus } from '@/lib/storage';
import { trackEvent, AnalyticsEvents } from '@/lib/analytics';

// RevenueCat entitlement identifier - configure this in RevenueCat dashboard
export const PREMIUM_ENTITLEMENT = 'premium';

/**
 * Parse introductory price info into TrialInfo
 */
function parseTrialInfo(
  introPrice: {
    price: number;
    priceString: string;
    period: string;
    periodUnit: string;
    periodNumberOfUnits: number;
  } | null
): TrialInfo | null {
  if (!introPrice) return null;

  const { price, priceString, period, periodUnit, periodNumberOfUnits } = introPrice;

  // Calculate trial days based on period unit
  let trialDays = periodNumberOfUnits;
  switch (periodUnit) {
    case 'WEEK':
      trialDays = periodNumberOfUnits * 7;
      break;
    case 'MONTH':
      trialDays = periodNumberOfUnits * 30;
      break;
    case 'YEAR':
      trialDays = periodNumberOfUnits * 365;
      break;
  }

  // Format duration text
  let trialDurationText: string;
  if (periodUnit === 'DAY') {
    trialDurationText = periodNumberOfUnits === 1 ? '1 day' : `${periodNumberOfUnits} days`;
  } else if (periodUnit === 'WEEK') {
    trialDurationText = periodNumberOfUnits === 1 ? '1 week' : `${periodNumberOfUnits} weeks`;
  } else if (periodUnit === 'MONTH') {
    trialDurationText = periodNumberOfUnits === 1 ? '1 month' : `${periodNumberOfUnits} months`;
  } else {
    trialDurationText = periodNumberOfUnits === 1 ? '1 year' : `${periodNumberOfUnits} years`;
  }

  return {
    hasFreeTrial: price === 0,
    trialDays,
    trialDurationText,
    introPrice: price,
    introPriceString: priceString,
    introPeriod: period,
  };
}

export interface TrialInfo {
  /** Whether this product has a free trial */
  hasFreeTrial: boolean;
  /** Trial duration in days (e.g., 7) */
  trialDays: number;
  /** Formatted trial duration (e.g., "7 days", "1 week") */
  trialDurationText: string;
  /** Intro price (0 for free trial) */
  introPrice: number;
  /** Formatted intro price string */
  introPriceString: string;
  /** Intro period in ISO 8601 (e.g., "P7D") */
  introPeriod: string;
}

export interface RevenueCatProduct {
  identifier: string;
  title: string;
  description: string;
  priceString: string;
  price: number;
  currencyCode: string;
  packageType: string;
  offering: string;
  /** Trial/introductory offer info (null if none) */
  trial: TrialInfo | null;
  // Original package for purchase
  package: PurchasesPackage;
}

export interface UseRevenueCatReturn {
  // State
  isReady: boolean;
  isLoading: boolean;
  error: string | null;
  // Subscription status
  isPremium: boolean;
  customerInfo: CustomerInfo | null;
  // Products
  offerings: PurchasesOffering | null;
  products: RevenueCatProduct[];
  // Actions
  purchasePackage: (pkg: PurchasesPackage) => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
  refreshCustomerInfo: () => Promise<void>;
}

/**
 * Cache customer info to AsyncStorage
 */
async function cacheSubscriptionStatus(customerInfo: CustomerInfo): Promise<void> {
  const premiumEntitlement = customerInfo.entitlements.active[PREMIUM_ENTITLEMENT];

  const status: StoredSubscriptionStatus = {
    isPremium: premiumEntitlement !== undefined,
    entitlements: Object.keys(customerInfo.entitlements.active),
    expiresAt: premiumEntitlement?.expirationDate ?? undefined,
    lastUpdated: new Date().toISOString(),
  };

  await storage.set(STORAGE_KEYS.SUBSCRIPTION_STATUS, status);
}

/**
 * Get cached subscription status
 */
async function getCachedSubscriptionStatus(): Promise<StoredSubscriptionStatus | null> {
  return storage.get<StoredSubscriptionStatus>(STORAGE_KEYS.SUBSCRIPTION_STATUS);
}

/**
 * Initialize RevenueCat - call this once at app startup
 */
export async function initializeRevenueCat(): Promise<void> {
  const apiKey = Platform.select({
    ios: env.revenueCatAppleApiKey,
    android: env.revenueCatGoogleApiKey,
    default: env.revenueCatGoogleApiKey, // Web uses Google/Stripe
  });

  if (!apiKey) {
    console.warn('RevenueCat API key not configured for platform:', Platform.OS);
    return;
  }

  try {
    // Enable debug logs in development
    if (__DEV__) {
      Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    }

    // Configure RevenueCat
    Purchases.configure({ apiKey });

    console.log('RevenueCat initialized successfully');
  } catch (error) {
    console.error('Failed to initialize RevenueCat:', error);
  }
}

/**
 * Hook for managing RevenueCat purchases
 * Works across iOS, Android, and Web
 */
export function useRevenueCat(): UseRevenueCatReturn {
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [offerings, setOfferings] = useState<PurchasesOffering | null>(null);

  // Memoize premium check to avoid recalculation
  const isPremium = useMemo(
    () => customerInfo?.entitlements.active[PREMIUM_ENTITLEMENT] !== undefined,
    [customerInfo]
  );

  // Memoize products transformation to prevent unnecessary re-renders
  const products: RevenueCatProduct[] = useMemo(
    () =>
      offerings?.availablePackages.map((pkg) => ({
        identifier: pkg.product.identifier,
        title: pkg.product.title,
        description: pkg.product.description,
        priceString: pkg.product.priceString,
        price: pkg.product.price,
        currencyCode: pkg.product.currencyCode,
        packageType: pkg.packageType,
        offering: pkg.offeringIdentifier,
        trial: parseTrialInfo(pkg.product.introPrice ?? null),
        package: pkg,
      })) ?? [],
    [offerings]
  );

  // Initialize and fetch data
  useEffect(() => {
    const init = async () => {
      try {
        // Get customer info
        const info = await Purchases.getCustomerInfo();
        setCustomerInfo(info);

        // Cache subscription status locally
        await cacheSubscriptionStatus(info);

        // Get offerings (products)
        const offerings = await Purchases.getOfferings();
        setOfferings(offerings.current);

        setIsReady(true);
      } catch (err) {
        console.error('Failed to initialize RevenueCat hook:', err);

        // Try to load cached status on error
        const cachedStatus = await getCachedSubscriptionStatus();
        if (cachedStatus) {
          console.log('Using cached subscription status');
        }

        setError('Failed to load subscription info');
        setIsReady(true); // Still mark as ready to not block UI
      }
    };

    init();

    // Listen for customer info updates
    // Note: addCustomerInfoUpdateListener returns EmitterSubscription with remove()
    const listener = Purchases.addCustomerInfoUpdateListener((info) => {
      setCustomerInfo(info);
      // Update cache whenever customer info changes
      cacheSubscriptionStatus(info);
    }) as unknown as { remove: () => void };

    return () => {
      listener?.remove?.();
    };
  }, []);

  /**
   * Purchase a package
   */
  const purchasePackage = useCallback(async (pkg: PurchasesPackage): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    // Track checkout started
    trackEvent(AnalyticsEvents.CHECKOUT_STARTED, {
      product_id: pkg.product.identifier,
      price: pkg.product.price,
      currency: pkg.product.currencyCode,
      package_type: pkg.packageType,
    });

    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      setCustomerInfo(customerInfo);

      // Cache the updated status
      await cacheSubscriptionStatus(customerInfo);

      // Check if purchase granted premium
      const hasPremium = customerInfo.entitlements.active[PREMIUM_ENTITLEMENT] !== undefined;

      // Check if this was a trial start
      const trialInfo = parseTrialInfo(pkg.product.introPrice ?? null);
      const isTrialStart = trialInfo?.hasFreeTrial ?? false;

      // Track trial started or purchase completed
      if (isTrialStart) {
        trackEvent(AnalyticsEvents.TRIAL_STARTED, {
          product_id: pkg.product.identifier,
          trial_duration: trialInfo?.trialDurationText,
          trial_days: trialInfo?.trialDays,
          price_after_trial: pkg.product.price,
          currency: pkg.product.currencyCode,
        });
      }

      trackEvent(AnalyticsEvents.PURCHASE_COMPLETED, {
        product_id: pkg.product.identifier,
        price: pkg.product.price,
        currency: pkg.product.currencyCode,
        has_premium: hasPremium,
        is_trial: isTrialStart,
      });

      return hasPremium;
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      // User cancelled is not an error
      if (error.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) {
        console.log('Purchase cancelled by user');
        trackEvent(AnalyticsEvents.CHECKOUT_FAILED, {
          product_id: pkg.product.identifier,
          reason: 'cancelled',
        });
        return false;
      }

      console.error('Purchase failed:', err);
      setError(error.message || 'Purchase failed');

      // Track purchase failed
      trackEvent(AnalyticsEvents.PURCHASE_FAILED, {
        product_id: pkg.product.identifier,
        error: error.message || 'Unknown error',
        error_code: error.code,
      });

      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Restore previous purchases
   */
  const restorePurchases = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const info = await Purchases.restorePurchases();
      setCustomerInfo(info);

      // Cache the restored status
      await cacheSubscriptionStatus(info);

      const hasPremium = info.entitlements.active[PREMIUM_ENTITLEMENT] !== undefined;

      // Track restore result
      trackEvent(AnalyticsEvents.SUBSCRIPTION_RESTORED, {
        success: hasPremium,
        entitlements: Object.keys(info.entitlements.active),
      });

      if (!hasPremium) {
        setError('No active subscriptions found');
      }

      return hasPremium;
    } catch (err: unknown) {
      const error = err as { message?: string };
      console.error('Restore failed:', err);
      setError(error.message || 'Failed to restore purchases');

      trackEvent(AnalyticsEvents.SUBSCRIPTION_RESTORED, {
        success: false,
        error: error.message || 'Unknown error',
      });

      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Refresh customer info
   */
  const refreshCustomerInfo = useCallback(async (): Promise<void> => {
    try {
      const info = await Purchases.getCustomerInfo();
      setCustomerInfo(info);
      await cacheSubscriptionStatus(info);
    } catch (err) {
      console.error('Failed to refresh customer info:', err);
    }
  }, []);

  return {
    isReady,
    isLoading,
    error,
    isPremium,
    customerInfo,
    offerings,
    products,
    purchasePackage,
    restorePurchases,
    refreshCustomerInfo,
  };
}

/**
 * Sync RevenueCat user ID with local user
 * Call this after user signs in
 */
export async function syncRevenueCatUser(userId: string): Promise<void> {
  try {
    await Purchases.logIn(userId);
    console.log('RevenueCat user synced:', userId);
  } catch (error) {
    console.error('Failed to sync RevenueCat user:', error);
  }
}

/**
 * Log out RevenueCat user
 * Call this after user signs out
 */
export async function logOutRevenueCat(): Promise<void> {
  try {
    await Purchases.logOut();
    // Clear cached subscription status
    await storage.remove(STORAGE_KEYS.SUBSCRIPTION_STATUS);
    console.log('RevenueCat user logged out');
  } catch (error) {
    console.error('Failed to log out RevenueCat user:', error);
  }
}

/**
 * Check if user has a specific entitlement
 */
export async function hasEntitlement(entitlementId: string): Promise<boolean> {
  try {
    const info = await Purchases.getCustomerInfo();
    return info.entitlements.active[entitlementId] !== undefined;
  } catch (error) {
    console.error('Failed to check entitlement:', error);
    return false;
  }
}
