/**
 * Ad-Free Gate
 *
 * Shows content only to users who see ads, or alternative content
 * for premium users. Useful for ad-related UI that shouldn't show
 * to paying subscribers.
 *
 * @example
 * ```tsx
 * // Show banner only to free users
 * <AdFreeGate>
 *   <BannerAd />
 * </AdFreeGate>
 *
 * // Show different content for premium users
 * <AdFreeGate
 *   premiumContent={<Text>Thanks for your support!</Text>}
 * >
 *   <BannerAd />
 * </AdFreeGate>
 * ```
 */

import React from 'react';
import { useAds } from '@/lib/ads';

interface AdFreeGateProps {
  children: React.ReactNode;
  premiumContent?: React.ReactNode;
  showLoadingState?: boolean;
}

export function AdFreeGate({
  children,
  premiumContent = null,
  showLoadingState = false,
}: AdFreeGateProps) {
  const { shouldShowAds, isInitialized } = useAds();

  // Optionally show nothing while initializing
  if (!isInitialized && showLoadingState) {
    return null;
  }

  // Show premium content for subscribers
  if (!shouldShowAds) {
    return <>{premiumContent}</>;
  }

  // Show ad content for free users
  return <>{children}</>;
}

export default AdFreeGate;
