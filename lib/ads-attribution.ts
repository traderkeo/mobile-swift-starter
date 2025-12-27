/**
 * Apple Search Ads Attribution
 *
 * Tracks attribution data from Apple Search Ads campaigns to measure
 * ad effectiveness and optimize marketing spend.
 *
 * @example
 * ```typescript
 * import { getSearchAdsAttribution, trackConversion } from '@/lib/ads-attribution';
 *
 * // Get attribution on first launch
 * const attribution = await getSearchAdsAttribution();
 * if (attribution.iad_attribution) {
 *   console.log('User came from Search Ads campaign:', attribution.iad_campaign_name);
 * }
 *
 * // Track conversion after purchase
 * trackConversion('subscription_purchase', 9.99);
 * ```
 */

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { trackEvent, AnalyticsEvents } from './analytics';

// Storage keys
const ATTRIBUTION_KEY = '@ads:attribution';
const ATTRIBUTION_CHECKED_KEY = '@ads:attribution_checked';

// Types
export interface SearchAdsAttribution {
  // Whether the user came from Apple Search Ads
  iad_attribution: boolean;
  // Organization ID that owns the campaign
  iad_org_id?: string;
  iad_org_name?: string;
  // Campaign that led to the install
  iad_campaign_id?: string;
  iad_campaign_name?: string;
  // Ad group within the campaign
  iad_adgroup_id?: string;
  iad_adgroup_name?: string;
  // Specific keyword that triggered the ad
  iad_keyword_id?: string;
  iad_keyword?: string;
  // Creative that was shown
  iad_creativeset_id?: string;
  iad_creativeset_name?: string;
  // Click and conversion dates
  iad_click_date?: string;
  iad_conversion_date?: string;
  // Conversion type
  iad_conversion_type?: 'Download' | 'Redownload';
  // Country code
  iad_country_or_region?: string;
  // Keyword match type
  iad_keyword_matchtype?: 'Broad' | 'Exact' | 'Search Match';
}

export interface ConversionData {
  event_type: string;
  revenue?: number;
  currency?: string;
  timestamp: string;
  attribution?: SearchAdsAttribution;
}

/**
 * Get Apple Search Ads attribution data
 *
 * Should be called once on first app launch.
 * Returns cached data on subsequent calls.
 */
export async function getSearchAdsAttribution(): Promise<SearchAdsAttribution | null> {
  // Only available on iOS
  if (Platform.OS !== 'ios') {
    return null;
  }

  // Check if we've already fetched attribution
  const checked = await AsyncStorage.getItem(ATTRIBUTION_CHECKED_KEY);
  if (checked === 'true') {
    // Return cached attribution
    const cached = await AsyncStorage.getItem(ATTRIBUTION_KEY);
    return cached ? JSON.parse(cached) : null;
  }

  try {
    // Request attribution from Apple
    // Note: In production, use react-native-ad-services or expo plugin
    // This is a placeholder for the native module call
    const attribution = await requestAttributionFromApple();

    // Cache the result
    await AsyncStorage.setItem(ATTRIBUTION_CHECKED_KEY, 'true');
    if (attribution) {
      await AsyncStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(attribution));
    }

    // Track attribution event
    if (attribution?.iad_attribution) {
      trackEvent(AnalyticsEvents.AD_ATTRIBUTION_RECEIVED, {
        campaign: attribution.iad_campaign_name,
        adgroup: attribution.iad_adgroup_name,
        keyword: attribution.iad_keyword,
      });
    }

    return attribution;
  } catch (error) {
    console.error('[AdsAttribution] Failed to get attribution:', error);
    await AsyncStorage.setItem(ATTRIBUTION_CHECKED_KEY, 'true');
    return null;
  }
}

/**
 * Request attribution data from Apple's AdServices framework
 *
 * In production, this should use a native module like:
 * - react-native-ad-services
 * - expo-ad-services (when available)
 * - Custom native module
 */
async function requestAttributionFromApple(): Promise<SearchAdsAttribution | null> {
  // Placeholder implementation
  // In production, use:
  //
  // import { AdServices } from 'react-native-ad-services';
  // const token = await AdServices.attributionToken();
  // const attribution = await fetchAttributionFromToken(token);
  //
  // Or use iAd framework directly:
  // import { ADClient } from 'react-native-ad-client';
  // const attribution = await ADClient.requestAttributionDetails();

  if (__DEV__) {
    console.log('[AdsAttribution] Requesting attribution from Apple...');
    // Return mock data for development
    return {
      iad_attribution: false,
    };
  }

  // In production, implement actual API call
  return null;
}

/**
 * Track a conversion event for Search Ads reporting
 *
 * Call this after significant user actions (purchase, signup, etc.)
 * to measure the effectiveness of your ad campaigns.
 */
export async function trackConversion(
  eventType: string,
  revenue?: number,
  currency: string = 'USD'
): Promise<void> {
  const attribution = await getCachedAttribution();

  const conversionData: ConversionData = {
    event_type: eventType,
    revenue,
    currency,
    timestamp: new Date().toISOString(),
    attribution: attribution || undefined,
  };

  // Track the conversion
  trackEvent(AnalyticsEvents.AD_CONVERSION, {
    event_type: eventType,
    revenue,
    currency,
    from_search_ads: attribution?.iad_attribution || false,
    campaign: attribution?.iad_campaign_name,
  });

  // In production, send to your analytics backend
  // await sendConversionToBackend(conversionData);

  if (__DEV__) {
    console.log('[AdsAttribution] Conversion tracked:', conversionData);
  }
}

/**
 * Get cached attribution data
 */
export async function getCachedAttribution(): Promise<SearchAdsAttribution | null> {
  try {
    const cached = await AsyncStorage.getItem(ATTRIBUTION_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
}

/**
 * Check if user came from Apple Search Ads
 */
export async function isFromSearchAds(): Promise<boolean> {
  const attribution = await getCachedAttribution();
  return attribution?.iad_attribution === true;
}

/**
 * Get campaign name if user came from Search Ads
 */
export async function getSearchAdsCampaign(): Promise<string | null> {
  const attribution = await getCachedAttribution();
  return attribution?.iad_campaign_name || null;
}

/**
 * Get keyword that triggered the Search Ad
 */
export async function getSearchAdsKeyword(): Promise<string | null> {
  const attribution = await getCachedAttribution();
  return attribution?.iad_keyword || null;
}

/**
 * Clear attribution data (for testing)
 */
export async function clearAttribution(): Promise<void> {
  await AsyncStorage.multiRemove([ATTRIBUTION_KEY, ATTRIBUTION_CHECKED_KEY]);
}

/**
 * Attribution report for analytics dashboard
 */
export interface AttributionReport {
  hasAttribution: boolean;
  source: 'search_ads' | 'organic' | 'unknown';
  campaign?: string;
  adgroup?: string;
  keyword?: string;
  installDate?: string;
}

/**
 * Generate an attribution report
 */
export async function getAttributionReport(): Promise<AttributionReport> {
  const attribution = await getCachedAttribution();

  if (!attribution) {
    return {
      hasAttribution: false,
      source: 'unknown',
    };
  }

  if (attribution.iad_attribution) {
    return {
      hasAttribution: true,
      source: 'search_ads',
      campaign: attribution.iad_campaign_name,
      adgroup: attribution.iad_adgroup_name,
      keyword: attribution.iad_keyword,
      installDate: attribution.iad_conversion_date,
    };
  }

  return {
    hasAttribution: true,
    source: 'organic',
  };
}

/**
 * Initialize attribution tracking on app launch
 * Call this in your app's root layout
 */
export async function initializeAttribution(): Promise<void> {
  if (Platform.OS === 'ios') {
    await getSearchAdsAttribution();
  }
}
