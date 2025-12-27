/**
 * Interstitial Ad Trigger
 *
 * A component that shows an interstitial ad when triggered.
 * Use this to wrap actions that should show ads.
 *
 * @example
 * ```tsx
 * <InterstitialAdTrigger
 *   onComplete={() => navigateToNextLevel()}
 *   showEvery={3}
 * >
 *   <Button>Next Level</Button>
 * </InterstitialAdTrigger>
 * ```
 */

import React, { useCallback, useRef } from 'react';
import { Pressable, PressableProps } from 'react-native';
import { useInterstitialAd, trackAdAction, useAds } from '@/lib/ads';

interface InterstitialAdTriggerProps extends Omit<PressableProps, 'onPress'> {
  children: React.ReactNode;
  onComplete: () => void;
  showEvery?: number; // Show ad every N triggers
  disabled?: boolean;
}

export function InterstitialAdTrigger({
  children,
  onComplete,
  showEvery = 3,
  disabled = false,
  ...pressableProps
}: InterstitialAdTriggerProps) {
  const { show, isLoaded, isShowing } = useInterstitialAd();
  const { shouldShowAds } = useAds();
  const triggerCount = useRef(0);

  const handlePress = useCallback(async () => {
    if (disabled || isShowing) return;

    triggerCount.current += 1;

    // Check if we should show an ad
    if (shouldShowAds && triggerCount.current % showEvery === 0 && isLoaded) {
      await show();
    }

    // Always complete the action
    onComplete();
  }, [disabled, isShowing, shouldShowAds, showEvery, isLoaded, show, onComplete]);

  return (
    <Pressable onPress={handlePress} disabled={disabled || isShowing} {...pressableProps}>
      {children}
    </Pressable>
  );
}

export default InterstitialAdTrigger;
