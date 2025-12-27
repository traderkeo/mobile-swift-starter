/**
 * Banner Ad Container
 *
 * A container for banner ads that handles:
 * - Automatic hiding for premium users
 * - Safe area spacing
 * - Loading states
 *
 * @example
 * ```tsx
 * <BannerAdContainer position="bottom" />
 * ```
 */

import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BannerAd, useAds } from '@/lib/ads';
import { type BannerSize } from '@/config/ads';

interface BannerAdContainerProps {
  position?: 'top' | 'bottom';
  size?: BannerSize;
  className?: string;
}

export function BannerAdContainer({
  position = 'bottom',
  size = 'banner',
  className = '',
}: BannerAdContainerProps) {
  const insets = useSafeAreaInsets();
  const { shouldShowAds } = useAds();

  if (!shouldShowAds) {
    return null;
  }

  return (
    <View
      className={`bg-transparent ${className}`}
      style={position === 'bottom' ? { paddingBottom: insets.bottom } : { paddingTop: insets.top }}
    >
      <BannerAd size={size} position={position} />
    </View>
  );
}

export default BannerAdContainer;
