/**
 * Payment Service (RevenueCat)
 *
 * Client-side payment utilities using RevenueCat.
 * No backend sync required - RevenueCat handles receipt validation.
 */

import { Platform } from 'react-native';
import Purchases, { PurchasesPackage, CustomerInfo } from 'react-native-purchases';

// Re-export types from hook for convenience
export type { RevenueCatProduct } from '@/hooks/use-revenuecat';

export type PaymentPlatform = 'apple' | 'google' | 'stripe';

export interface PurchaseResult {
  success: boolean;
  platform: PaymentPlatform;
  customerInfo?: CustomerInfo;
  error?: string;
}

/**
 * Get the current payment platform
 */
export function getPaymentPlatform(): PaymentPlatform {
  switch (Platform.OS) {
    case 'ios':
      return 'apple';
    case 'android':
      return 'google';
    default:
      return 'stripe';
  }
}

/**
 * Check if using Apple platform
 */
export function isApplePlatform(): boolean {
  return Platform.OS === 'ios';
}

/**
 * Purchase a RevenueCat package
 */
export async function purchasePackage(pkg: PurchasesPackage): Promise<PurchaseResult> {
  const platform = getPaymentPlatform();

  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);

    return {
      success: true,
      platform,
      customerInfo,
    };
  } catch (error) {
    console.error('Purchase failed:', error);

    // Check for user cancellation
    const err = error as { userCancelled?: boolean; message?: string };
    if (err.userCancelled) {
      return {
        success: false,
        platform,
        error: 'Purchase cancelled',
      };
    }

    return {
      success: false,
      platform,
      error: err.message || 'Purchase failed',
    };
  }
}

/**
 * Restore previous purchases
 * Required for App Store compliance (iOS)
 */
export async function restorePurchases(): Promise<PurchaseResult> {
  const platform = getPaymentPlatform();

  try {
    const customerInfo = await Purchases.restorePurchases();

    return {
      success: true,
      platform,
      customerInfo,
    };
  } catch (error) {
    console.error('Restore failed:', error);
    const err = error as { message?: string };

    return {
      success: false,
      platform,
      error: err.message || 'Failed to restore purchases',
    };
  }
}

/**
 * Get current customer info (subscription status, entitlements)
 */
export async function getCustomerInfo(): Promise<CustomerInfo | null> {
  try {
    return await Purchases.getCustomerInfo();
  } catch (error) {
    console.error('Failed to get customer info:', error);
    return null;
  }
}

/**
 * Check if user has an active entitlement
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

/**
 * Get available offerings (products)
 */
export async function getOfferings() {
  try {
    return await Purchases.getOfferings();
  } catch (error) {
    console.error('Failed to get offerings:', error);
    return null;
  }
}

/**
 * Get subscription management URL
 * Opens the appropriate store's subscription management page
 */
export async function getManagementURL(): Promise<string | null> {
  try {
    const info = await Purchases.getCustomerInfo();
    return info.managementURL;
  } catch (error) {
    console.error('Failed to get management URL:', error);
    return null;
  }
}
