/**
 * AdMob Integration
 *
 * Provides hooks and utilities for displaying Google AdMob ads.
 * Supports banner, interstitial, and rewarded ad formats.
 *
 * @example
 * ```typescript
 * import { BannerAd, useInterstitialAd, useRewardedAd } from '@/lib/ads';
 *
 * function MyScreen() {
 *   const { showInterstitial, isLoaded } = useInterstitialAd();
 *   const { showRewarded, earnedReward } = useRewardedAd();
 *
 *   return (
 *     <View>
 *       <Content />
 *       <BannerAd size="banner" />
 *       <Button onPress={showInterstitial} disabled={!isLoaded}>
 *         Next Level
 *       </Button>
 *     </View>
 *   );
 * }
 * ```
 */

import React, { useEffect, useState, useCallback, useRef, createContext, useContext } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { trackEvent, AnalyticsEvents } from './analytics';
import {
  AD_UNIT_IDS,
  AD_FREQUENCY,
  BANNER_SIZES,
  type BannerSize,
  shouldShowAds,
  getRewardForPlacement,
  AD_PLACEMENTS,
} from '@/config/ads';

// Storage keys
const AD_SESSION_KEY = '@ads:session';
const LAST_INTERSTITIAL_KEY = '@ads:last_interstitial';
const LAST_REWARDED_KEY = '@ads:last_rewarded';

// Types
export interface AdSession {
  interstitialCount: number;
  rewardedCount: number;
  actionCount: number;
  sessionStart: number;
}

export interface RewardedResult {
  type: string;
  amount: number;
}

export interface AdContextValue {
  isInitialized: boolean;
  isPremium: boolean;
  setIsPremium: (premium: boolean) => void;
  shouldShowAds: boolean;
}

// Context
const AdContext = createContext<AdContextValue | null>(null);

/**
 * Ad Provider component
 *
 * Wrap your app with this to enable ad functionality
 */
export function AdProvider({
  children,
  isPremium = false,
}: {
  children: React.ReactNode;
  isPremium?: boolean;
}) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [premium, setPremium] = useState(isPremium);

  useEffect(() => {
    initializeAds().then(() => setIsInitialized(true));
  }, []);

  useEffect(() => {
    setPremium(isPremium);
  }, [isPremium]);

  const value: AdContextValue = {
    isInitialized,
    isPremium: premium,
    setIsPremium: setPremium,
    shouldShowAds: shouldShowAds(premium),
  };

  return <AdContext.Provider value={value}>{children}</AdContext.Provider>;
}

/**
 * Hook to access ad context
 */
export function useAds() {
  const context = useContext(AdContext);
  if (!context) {
    return {
      isInitialized: false,
      isPremium: false,
      setIsPremium: () => {},
      shouldShowAds: true,
    };
  }
  return context;
}

/**
 * Initialize AdMob
 */
async function initializeAds(): Promise<void> {
  try {
    // In production, use:
    // import mobileAds from 'react-native-google-mobile-ads';
    // await mobileAds().initialize();

    // Reset session on app start
    await resetAdSession();

    if (__DEV__) {
      console.log('[Ads] Initialized');
    }
  } catch (error) {
    console.error('[Ads] Failed to initialize:', error);
  }
}

/**
 * Get/update ad session data
 */
async function getAdSession(): Promise<AdSession> {
  try {
    const data = await AsyncStorage.getItem(AD_SESSION_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch {
    // Ignore errors
  }

  return {
    interstitialCount: 0,
    rewardedCount: 0,
    actionCount: 0,
    sessionStart: Date.now(),
  };
}

async function updateAdSession(updates: Partial<AdSession>): Promise<void> {
  const session = await getAdSession();
  const updated = { ...session, ...updates };
  await AsyncStorage.setItem(AD_SESSION_KEY, JSON.stringify(updated));
}

async function resetAdSession(): Promise<void> {
  const session: AdSession = {
    interstitialCount: 0,
    rewardedCount: 0,
    actionCount: 0,
    sessionStart: Date.now(),
  };
  await AsyncStorage.setItem(AD_SESSION_KEY, JSON.stringify(session));
}

/**
 * Check if enough time has passed since last ad
 */
async function checkCooldown(type: 'interstitial' | 'rewarded'): Promise<boolean> {
  const key = type === 'interstitial' ? LAST_INTERSTITIAL_KEY : LAST_REWARDED_KEY;
  const cooldown =
    type === 'interstitial' ? AD_FREQUENCY.interstitialCooldown : AD_FREQUENCY.rewardedCooldown;

  try {
    const lastShown = await AsyncStorage.getItem(key);
    if (!lastShown) return true;

    const elapsed = (Date.now() - parseInt(lastShown, 10)) / 1000;
    return elapsed >= cooldown;
  } catch {
    return true;
  }
}

async function recordAdShown(type: 'interstitial' | 'rewarded'): Promise<void> {
  const key = type === 'interstitial' ? LAST_INTERSTITIAL_KEY : LAST_REWARDED_KEY;
  await AsyncStorage.setItem(key, Date.now().toString());
}

// Banner Ad Component
interface BannerAdProps {
  size?: BannerSize;
  position?: 'top' | 'bottom';
  style?: object;
  onAdLoaded?: () => void;
  onAdFailedToLoad?: (error: Error) => void;
}

/**
 * Banner Ad component
 */
export function BannerAd({
  size = 'banner',
  position = 'bottom',
  style,
  onAdLoaded,
  onAdFailedToLoad,
}: BannerAdProps) {
  const { shouldShowAds: showAds, isInitialized } = useAds();
  const [isLoaded, setIsLoaded] = useState(false);

  if (!showAds || !isInitialized) {
    return null;
  }

  // In production, use react-native-google-mobile-ads:
  // import { BannerAd as AdMobBanner, BannerAdSize } from 'react-native-google-mobile-ads';
  // return (
  //   <AdMobBanner
  //     unitId={AD_UNIT_IDS.banner}
  //     size={BannerAdSize[BANNER_SIZES[size]]}
  //     onAdLoaded={() => { setIsLoaded(true); onAdLoaded?.(); }}
  //     onAdFailedToLoad={(error) => onAdFailedToLoad?.(error)}
  //   />
  // );

  // Placeholder for development
  return (
    <View
      style={[
        styles.bannerContainer,
        position === 'top' ? styles.bannerTop : styles.bannerBottom,
        style,
      ]}
    >
      <View style={[styles.bannerPlaceholder, getBannerDimensions(size)]}>
        {/* Ad placeholder */}
      </View>
    </View>
  );
}

function getBannerDimensions(size: BannerSize): { width: number; height: number } {
  switch (size) {
    case 'banner':
      return { width: 320, height: 50 };
    case 'largeBanner':
      return { width: 320, height: 100 };
    case 'mediumRectangle':
      return { width: 300, height: 250 };
    case 'fullBanner':
      return { width: 468, height: 60 };
    case 'leaderboard':
      return { width: 728, height: 90 };
    default:
      return { width: 320, height: 50 };
  }
}

/**
 * Hook for interstitial ads
 */
export function useInterstitialAd(options?: { adUnitId?: string; autoLoad?: boolean }) {
  const { adUnitId = AD_UNIT_IDS.interstitial, autoLoad = true } = options || {};
  const { shouldShowAds: showAds, isInitialized } = useAds();

  const [isLoaded, setIsLoaded] = useState(false);
  const [isShowing, setIsShowing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Load the ad
  const load = useCallback(async () => {
    if (!showAds || !isInitialized) return;

    try {
      // In production:
      // const interstitial = InterstitialAd.createForAdRequest(adUnitId);
      // await interstitial.load();
      // interstitialRef.current = interstitial;

      // Simulate loading
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsLoaded(true);
      setError(null);
    } catch (err) {
      setError(err as Error);
      setIsLoaded(false);
    }
  }, [adUnitId, showAds, isInitialized]);

  // Show the ad
  const show = useCallback(async (): Promise<boolean> => {
    if (!isLoaded || isShowing || !showAds) {
      return false;
    }

    // Check frequency caps
    const session = await getAdSession();
    if (session.interstitialCount >= AD_FREQUENCY.maxInterstitialsPerSession) {
      if (__DEV__) console.log('[Ads] Max interstitials reached');
      return false;
    }

    const cooldownOk = await checkCooldown('interstitial');
    if (!cooldownOk) {
      if (__DEV__) console.log('[Ads] Interstitial cooldown active');
      return false;
    }

    setIsShowing(true);

    try {
      // In production:
      // await interstitialRef.current?.show();

      // Simulate showing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Track event
      trackEvent(AnalyticsEvents.AD_IMPRESSION, {
        type: 'interstitial',
        ad_unit: adUnitId,
      });

      // Update session
      await updateAdSession({ interstitialCount: session.interstitialCount + 1 });
      await recordAdShown('interstitial');

      setIsShowing(false);
      setIsLoaded(false);

      // Auto-reload
      if (autoLoad) {
        load();
      }

      return true;
    } catch (err) {
      setError(err as Error);
      setIsShowing(false);
      return false;
    }
  }, [isLoaded, isShowing, showAds, adUnitId, autoLoad, load]);

  // Auto-load on mount
  useEffect(() => {
    if (autoLoad && showAds && isInitialized) {
      load();
    }
  }, [autoLoad, showAds, isInitialized, load]);

  return {
    isLoaded,
    isShowing,
    error,
    load,
    show,
    showInterstitial: show, // Alias
  };
}

/**
 * Hook for rewarded ads
 */
export function useRewardedAd(options?: {
  adUnitId?: string;
  autoLoad?: boolean;
  placementId?: keyof typeof AD_PLACEMENTS;
}) {
  const {
    adUnitId = AD_UNIT_IDS.rewarded,
    autoLoad = true,
    placementId = 'watchForCoins',
  } = options || {};
  const { shouldShowAds: showAds, isInitialized } = useAds();

  const [isLoaded, setIsLoaded] = useState(false);
  const [isShowing, setIsShowing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [earnedReward, setEarnedReward] = useState<RewardedResult | null>(null);

  // Load the ad
  const load = useCallback(async () => {
    if (!showAds || !isInitialized) return;

    try {
      // In production:
      // const rewarded = RewardedAd.createForAdRequest(adUnitId);
      // await rewarded.load();

      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsLoaded(true);
      setError(null);
    } catch (err) {
      setError(err as Error);
      setIsLoaded(false);
    }
  }, [adUnitId, showAds, isInitialized]);

  // Show the ad
  const show = useCallback(async (): Promise<RewardedResult | null> => {
    if (!isLoaded || isShowing || !showAds) {
      return null;
    }

    // Check frequency caps
    const session = await getAdSession();
    if (session.rewardedCount >= AD_FREQUENCY.maxRewardedPerSession) {
      if (__DEV__) console.log('[Ads] Max rewarded ads reached');
      return null;
    }

    const cooldownOk = await checkCooldown('rewarded');
    if (!cooldownOk) {
      if (__DEV__) console.log('[Ads] Rewarded cooldown active');
      return null;
    }

    setIsShowing(true);
    setEarnedReward(null);

    try {
      // In production:
      // await rewardedRef.current?.show();
      // The reward is delivered via event listener

      // Simulate watching
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Get reward for this placement
      const reward = getRewardForPlacement(placementId);
      const result: RewardedResult = reward;

      // Track event
      trackEvent(AnalyticsEvents.AD_REWARD_EARNED, {
        type: 'rewarded',
        reward_type: reward.type,
        reward_amount: reward.amount,
        ad_unit: adUnitId,
      });

      // Update session
      await updateAdSession({ rewardedCount: session.rewardedCount + 1 });
      await recordAdShown('rewarded');

      setEarnedReward(result);
      setIsShowing(false);
      setIsLoaded(false);

      // Auto-reload
      if (autoLoad) {
        load();
      }

      return result;
    } catch (err) {
      setError(err as Error);
      setIsShowing(false);
      return null;
    }
  }, [isLoaded, isShowing, showAds, adUnitId, placementId, autoLoad, load]);

  // Auto-load on mount
  useEffect(() => {
    if (autoLoad && showAds && isInitialized) {
      load();
    }
  }, [autoLoad, showAds, isInitialized, load]);

  return {
    isLoaded,
    isShowing,
    error,
    earnedReward,
    load,
    show,
    showRewarded: show, // Alias
  };
}

/**
 * Track a user action for frequency-based interstitials
 *
 * Call this after significant actions (level complete, article read, etc.)
 * An interstitial will be shown every N actions based on config
 */
export async function trackAdAction(): Promise<boolean> {
  const session = await getAdSession();
  const newCount = session.actionCount + 1;
  await updateAdSession({ actionCount: newCount });

  return newCount % AD_FREQUENCY.interstitialEveryNActions === 0;
}

/**
 * Check if an interstitial should be shown after an action
 */
export async function shouldShowInterstitialAfterAction(): Promise<boolean> {
  const session = await getAdSession();
  return session.actionCount % AD_FREQUENCY.interstitialEveryNActions === 0;
}

const styles = StyleSheet.create({
  bannerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  bannerTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  bannerBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  bannerPlaceholder: {
    backgroundColor: __DEV__ ? '#f0f0f0' : 'transparent',
    borderRadius: 4,
  },
});

export default {
  BannerAd,
  useInterstitialAd,
  useRewardedAd,
  useAds,
  AdProvider,
  trackAdAction,
};
