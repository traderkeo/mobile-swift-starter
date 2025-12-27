/**
 * Ad Configuration
 *
 * Configuration for AdMob ads including ad unit IDs,
 * frequency capping, and monetization settings.
 */

import { Platform } from 'react-native';

// AdMob test ad unit IDs (use these for development)
// Replace with your actual ad unit IDs for production
export const TEST_AD_IDS = {
  // iOS test IDs
  ios: {
    banner: 'ca-app-pub-3940256099942544/2934735716',
    interstitial: 'ca-app-pub-3940256099942544/4411468910',
    rewarded: 'ca-app-pub-3940256099942544/1712485313',
    rewardedInterstitial: 'ca-app-pub-3940256099942544/6978759866',
    native: 'ca-app-pub-3940256099942544/3986624511',
    appOpen: 'ca-app-pub-3940256099942544/5662855259',
  },
  // Android test IDs
  android: {
    banner: 'ca-app-pub-3940256099942544/6300978111',
    interstitial: 'ca-app-pub-3940256099942544/1033173712',
    rewarded: 'ca-app-pub-3940256099942544/5224354917',
    rewardedInterstitial: 'ca-app-pub-3940256099942544/5354046379',
    native: 'ca-app-pub-3940256099942544/2247696110',
    appOpen: 'ca-app-pub-3940256099942544/9257395921',
  },
};

// Environment-based ad IDs
const getAdId = (type: keyof typeof TEST_AD_IDS.ios): string => {
  const platformIds = Platform.OS === 'ios' ? TEST_AD_IDS.ios : TEST_AD_IDS.android;
  const envKey = `EXPO_PUBLIC_ADMOB_${type.toUpperCase()}_ID`;

  // Use environment variable in production, test IDs in development
  if (__DEV__) {
    return platformIds[type];
  }

  return process.env[envKey] || platformIds[type];
};

/**
 * Ad unit IDs
 */
export const AD_UNIT_IDS = {
  banner: getAdId('banner'),
  interstitial: getAdId('interstitial'),
  rewarded: getAdId('rewarded'),
  rewardedInterstitial: getAdId('rewardedInterstitial'),
  native: getAdId('native'),
  appOpen: getAdId('appOpen'),
};

/**
 * AdMob App IDs
 */
export const ADMOB_APP_IDS = {
  ios: process.env.EXPO_PUBLIC_ADMOB_APP_ID_IOS || 'ca-app-pub-3940256099942544~1458002511',
  android: process.env.EXPO_PUBLIC_ADMOB_APP_ID_ANDROID || 'ca-app-pub-3940256099942544~3347511713',
};

/**
 * Frequency capping configuration
 *
 * Controls how often ads are shown to avoid user fatigue
 */
export const AD_FREQUENCY = {
  // Minimum seconds between interstitial ads
  interstitialCooldown: 60,

  // Minimum seconds between rewarded ads
  rewardedCooldown: 30,

  // Maximum interstitials per session
  maxInterstitialsPerSession: 5,

  // Maximum rewarded ads per session
  maxRewardedPerSession: 10,

  // Show interstitial after N actions (e.g., level completions)
  interstitialEveryNActions: 3,

  // Don't show ads for first N seconds after app launch
  initialDelay: 30,
};

/**
 * Banner ad sizes
 */
export const BANNER_SIZES = {
  // Standard banner (320x50)
  banner: 'BANNER',
  // Large banner (320x100)
  largeBanner: 'LARGE_BANNER',
  // Medium rectangle (300x250)
  mediumRectangle: 'MEDIUM_RECTANGLE',
  // Full banner (468x60)
  fullBanner: 'FULL_BANNER',
  // Leaderboard (728x90)
  leaderboard: 'LEADERBOARD',
  // Smart banner (auto-sized)
  smartBanner: 'SMART_BANNER',
  // Adaptive banner (recommended)
  adaptiveBanner: 'ADAPTIVE_BANNER',
} as const;

export type BannerSize = keyof typeof BANNER_SIZES;

/**
 * Rewarded ad configuration
 */
export const REWARDED_CONFIG = {
  // Default reward amount
  defaultRewardAmount: 100,

  // Default reward type
  defaultRewardType: 'coins',

  // Whether to show reward confirmation dialog
  showConfirmation: true,

  // Auto-close reward dialog after N seconds
  confirmationTimeout: 3,
};

/**
 * Ad placements
 *
 * Define where ads appear in your app
 */
export const AD_PLACEMENTS = {
  // Banner at bottom of home screen
  homeBanner: {
    type: 'banner',
    size: 'adaptiveBanner',
    position: 'bottom',
  },

  // Interstitial between game levels
  levelComplete: {
    type: 'interstitial',
    frequency: 3, // Every 3 levels
  },

  // Rewarded ad for extra lives
  extraLife: {
    type: 'rewarded',
    reward: { amount: 1, type: 'life' },
  },

  // Rewarded ad for in-app currency
  watchForCoins: {
    type: 'rewarded',
    reward: { amount: 100, type: 'coins' },
  },

  // App open ad on cold start
  appOpen: {
    type: 'appOpen',
    showOnColdStart: true,
    cooldown: 300, // 5 minutes between shows
  },
} as const;

/**
 * Targeting configuration
 *
 * For personalized ads (requires ATT consent on iOS 14.5+)
 */
export const TARGETING_CONFIG = {
  // Content rating
  maxAdContentRating: 'G' as const,

  // Tag for child-directed treatment (COPPA)
  tagForChildDirectedTreatment: false,

  // Tag for users under age of consent (GDPR)
  tagForUnderAgeOfConsent: false,
};

/**
 * Check if ads are enabled
 *
 * Disable ads for premium users or in certain conditions
 */
export function shouldShowAds(isPremium: boolean): boolean {
  // Premium users don't see ads
  if (isPremium) {
    return false;
  }

  // Add any other conditions here
  // e.g., disable during onboarding

  return true;
}

/**
 * Get reward for a placement
 */
export function getRewardForPlacement(placementId: keyof typeof AD_PLACEMENTS): {
  amount: number;
  type: string;
} {
  const placement = AD_PLACEMENTS[placementId];

  if ('reward' in placement) {
    return placement.reward;
  }

  return {
    amount: REWARDED_CONFIG.defaultRewardAmount,
    type: REWARDED_CONFIG.defaultRewardType,
  };
}
