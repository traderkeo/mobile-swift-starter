/**
 * App Store Review prompt
 *
 * Smart review prompting that follows Apple and Google guidelines:
 * - Only prompt after positive user experiences
 * - Limit prompt frequency (max once per 120 days)
 * - Track user engagement before prompting
 *
 * @example
 * ```typescript
 * import { maybeRequestReview, trackPositiveAction } from '@/lib/store-review';
 *
 * // Track positive actions throughout the app
 * trackPositiveAction('completed_purchase');
 * trackPositiveAction('shared_content');
 *
 * // Try to show review prompt (will only show if conditions met)
 * await maybeRequestReview();
 * ```
 */

import * as StoreReview from 'expo-store-review';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, Linking } from 'react-native';

// Storage keys
const REVIEW_DATA_KEY = '@store_review:data';

// Configuration
const CONFIG = {
  // Minimum days since install before prompting
  minDaysAfterInstall: 7,
  // Minimum positive actions before prompting
  minPositiveActions: 5,
  // Days between review prompts
  daysBetweenPrompts: 120,
  // Maximum prompts total
  maxTotalPrompts: 3,
  // App Store URLs for fallback
  appStoreId: '', // Set your App Store ID
  playStoreId: '', // Set your Play Store package name
};

interface ReviewData {
  installDate: string;
  positiveActions: number;
  promptCount: number;
  lastPromptDate: string | null;
  hasReviewed: boolean;
}

const defaultReviewData: ReviewData = {
  installDate: new Date().toISOString(),
  positiveActions: 0,
  promptCount: 0,
  lastPromptDate: null,
  hasReviewed: false,
};

/**
 * Get review data from storage
 */
async function getReviewData(): Promise<ReviewData> {
  try {
    const data = await AsyncStorage.getItem(REVIEW_DATA_KEY);
    if (data) {
      return { ...defaultReviewData, ...JSON.parse(data) };
    }
    // Initialize on first access
    await AsyncStorage.setItem(REVIEW_DATA_KEY, JSON.stringify(defaultReviewData));
    return defaultReviewData;
  } catch {
    return defaultReviewData;
  }
}

/**
 * Save review data to storage
 */
async function saveReviewData(data: ReviewData): Promise<void> {
  try {
    await AsyncStorage.setItem(REVIEW_DATA_KEY, JSON.stringify(data));
  } catch {
    // Ignore save errors
  }
}

/**
 * Track a positive user action
 * Call this when users complete meaningful actions
 */
export async function trackPositiveAction(actionName?: string): Promise<void> {
  const data = await getReviewData();
  data.positiveActions++;
  await saveReviewData(data);

  if (__DEV__ && actionName) {
    console.log(
      `[StoreReview] Tracked positive action: ${actionName} (total: ${data.positiveActions})`
    );
  }
}

/**
 * Check if we should show the review prompt
 */
async function shouldPromptForReview(): Promise<boolean> {
  const data = await getReviewData();

  // Already reviewed
  if (data.hasReviewed) {
    return false;
  }

  // Max prompts reached
  if (data.promptCount >= CONFIG.maxTotalPrompts) {
    return false;
  }

  // Not enough positive actions
  if (data.positiveActions < CONFIG.minPositiveActions) {
    return false;
  }

  // Check days since install
  const daysSinceInstall = daysBetween(new Date(data.installDate), new Date());
  if (daysSinceInstall < CONFIG.minDaysAfterInstall) {
    return false;
  }

  // Check days since last prompt
  if (data.lastPromptDate) {
    const daysSinceLastPrompt = daysBetween(new Date(data.lastPromptDate), new Date());
    if (daysSinceLastPrompt < CONFIG.daysBetweenPrompts) {
      return false;
    }
  }

  return true;
}

/**
 * Request a review if conditions are met
 * Returns true if review was requested, false otherwise
 */
export async function maybeRequestReview(): Promise<boolean> {
  // Check if we should prompt
  const shouldPrompt = await shouldPromptForReview();
  if (!shouldPrompt) {
    return false;
  }

  // Check if in-app review is available
  const isAvailable = await StoreReview.isAvailableAsync();
  if (!isAvailable) {
    if (__DEV__) {
      console.log('[StoreReview] In-app review not available');
    }
    return false;
  }

  try {
    await StoreReview.requestReview();

    // Update review data
    const data = await getReviewData();
    data.promptCount++;
    data.lastPromptDate = new Date().toISOString();
    await saveReviewData(data);

    if (__DEV__) {
      console.log('[StoreReview] Review requested successfully');
    }

    return true;
  } catch (error) {
    if (__DEV__) {
      console.error('[StoreReview] Error requesting review:', error);
    }
    return false;
  }
}

/**
 * Mark that user has reviewed the app
 * Call this if you have confirmation the user left a review
 */
export async function markAsReviewed(): Promise<void> {
  const data = await getReviewData();
  data.hasReviewed = true;
  await saveReviewData(data);
}

/**
 * Open the app store page directly
 * Use this for a "Rate Us" button in settings
 */
export async function openStoreListing(): Promise<boolean> {
  try {
    // Try in-app review first
    const isAvailable = await StoreReview.isAvailableAsync();
    if (isAvailable) {
      await StoreReview.requestReview();
      return true;
    }

    // Fall back to opening store URL
    let storeUrl: string;

    if (Platform.OS === 'ios') {
      const appId = CONFIG.appStoreId || 'your-app-id';
      storeUrl = `itms-apps://apps.apple.com/app/id${appId}?action=write-review`;
    } else {
      const packageName = CONFIG.playStoreId || 'com.yourcompany.yourapp';
      storeUrl = `market://details?id=${packageName}`;
    }

    const canOpen = await Linking.canOpenURL(storeUrl);
    if (canOpen) {
      await Linking.openURL(storeUrl);
      return true;
    }

    // Web fallback
    if (Platform.OS === 'ios') {
      const appId = CONFIG.appStoreId || 'your-app-id';
      await Linking.openURL(`https://apps.apple.com/app/id${appId}?action=write-review`);
    } else {
      const packageName = CONFIG.playStoreId || 'com.yourcompany.yourapp';
      await Linking.openURL(`https://play.google.com/store/apps/details?id=${packageName}`);
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Reset review tracking data (for testing)
 */
export async function resetReviewData(): Promise<void> {
  await AsyncStorage.removeItem(REVIEW_DATA_KEY);
}

/**
 * Get current review stats (for debugging)
 */
export async function getReviewStats(): Promise<
  ReviewData & {
    daysSinceInstall: number;
    daysSinceLastPrompt: number | null;
    canPrompt: boolean;
  }
> {
  const data = await getReviewData();
  const daysSinceInstall = daysBetween(new Date(data.installDate), new Date());
  const daysSinceLastPrompt = data.lastPromptDate
    ? daysBetween(new Date(data.lastPromptDate), new Date())
    : null;
  const canPrompt = await shouldPromptForReview();

  return {
    ...data,
    daysSinceInstall,
    daysSinceLastPrompt,
    canPrompt,
  };
}

/**
 * Configure review prompt settings
 */
export function configureReview(config: Partial<typeof CONFIG>): void {
  Object.assign(CONFIG, config);
}

// Utility function
function daysBetween(date1: Date, date2: Date): number {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.floor(Math.abs(date2.getTime() - date1.getTime()) / oneDay);
}
