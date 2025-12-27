/**
 * Unified Payments Hook (RevenueCat)
 *
 * Provides a single interface for payments across all platforms using RevenueCat.
 * RevenueCat handles:
 * - iOS: Apple In-App Purchases (StoreKit)
 * - Android: Google Play Billing
 * - Web: Stripe (via RevenueCat Web Billing)
 *
 * No backend sync required - RevenueCat handles receipt validation client-side.
 */

import { useState, useCallback } from 'react';
import { PurchasesPackage } from 'react-native-purchases';
import { useRevenueCat, RevenueCatProduct } from './use-revenuecat';
import { getPaymentPlatform, isApplePlatform } from '@/services/payments';

export interface PurchaseResult {
  success: boolean;
  isPremium: boolean;
  error?: string;
}

interface UseUnifiedPaymentsReturn {
  // State
  platform: 'apple' | 'google' | 'stripe';
  isApple: boolean;
  isReady: boolean;
  isLoading: boolean;
  error: string | null;

  // Subscription status
  isPremium: boolean;

  // Products
  products: RevenueCatProduct[];

  // Actions
  purchase: (product: RevenueCatProduct) => Promise<PurchaseResult>;
  purchasePackage: (pkg: PurchasesPackage) => Promise<PurchaseResult>;
  restore: () => Promise<PurchaseResult>;
  clearError: () => void;
}

export function useUnifiedPayments(): UseUnifiedPaymentsReturn {
  const [localError, setLocalError] = useState<string | null>(null);

  const {
    isReady,
    isLoading,
    error: rcError,
    isPremium,
    products,
    purchasePackage: rcPurchasePackage,
    restorePurchases,
  } = useRevenueCat();

  const platform = getPaymentPlatform();
  const isApple = isApplePlatform();
  const error = localError || rcError;

  /**
   * Purchase a product using RevenueCat
   */
  const purchase = useCallback(
    async (product: RevenueCatProduct): Promise<PurchaseResult> => {
      setLocalError(null);

      try {
        const success = await rcPurchasePackage(product.package);

        return {
          success,
          isPremium: success,
          error: success ? undefined : 'Purchase was not completed',
        };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Purchase failed';
        setLocalError(errorMessage);
        return {
          success: false,
          isPremium: false,
          error: errorMessage,
        };
      }
    },
    [rcPurchasePackage]
  );

  /**
   * Purchase using raw RevenueCat package
   */
  const purchasePackage = useCallback(
    async (pkg: PurchasesPackage): Promise<PurchaseResult> => {
      setLocalError(null);

      try {
        const success = await rcPurchasePackage(pkg);

        return {
          success,
          isPremium: success,
          error: success ? undefined : 'Purchase was not completed',
        };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Purchase failed';
        setLocalError(errorMessage);
        return {
          success: false,
          isPremium: false,
          error: errorMessage,
        };
      }
    },
    [rcPurchasePackage]
  );

  /**
   * Restore previous purchases
   */
  const restore = useCallback(async (): Promise<PurchaseResult> => {
    setLocalError(null);

    try {
      const success = await restorePurchases();

      return {
        success,
        isPremium: success,
        error: success ? undefined : 'No active subscriptions found',
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Restore failed';
      setLocalError(errorMessage);
      return {
        success: false,
        isPremium: false,
        error: errorMessage,
      };
    }
  }, [restorePurchases]);

  const clearError = useCallback(() => {
    setLocalError(null);
  }, []);

  return {
    platform,
    isApple,
    isReady,
    isLoading,
    error,
    isPremium,
    products,
    purchase,
    purchasePackage,
    restore,
    clearError,
  };
}
