/**
 * Siri Shortcuts Integration for iOS
 *
 * Allows users to create Siri shortcuts for common app actions.
 * Users can trigger these via Siri voice commands or the Shortcuts app.
 *
 * Note: Full Siri Shortcuts requires native module support.
 * This provides the interface and simulation for development.
 *
 * @example
 * ```typescript
 * import { donateShortcut, SiriShortcuts } from '@/lib/siri-shortcuts';
 *
 * // Donate a shortcut when user performs an action
 * await donateShortcut(SiriShortcuts.OPEN_PREMIUM);
 *
 * // With custom parameters
 * await donateShortcut(SiriShortcuts.VIEW_PRODUCT, {
 *   productId: '123',
 *   productName: 'Premium Plan',
 * });
 * ```
 */

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage key for donated shortcuts
const DONATED_SHORTCUTS_KEY = '@siri:donated_shortcuts';

// Types
export interface ShortcutActivity {
  activityType: string;
  title: string;
  suggestedInvocationPhrase: string;
  description?: string;
  keywords?: string[];
  userInfo?: Record<string, unknown>;
  isEligibleForSearch?: boolean;
  isEligibleForPrediction?: boolean;
  persistentIdentifier?: string;
}

export interface DonatedShortcut extends ShortcutActivity {
  donatedAt: string;
  donationCount: number;
}

// Predefined shortcuts
export const SiriShortcuts = {
  // App navigation
  OPEN_APP: {
    activityType: 'com.yourapp.open',
    title: 'Open App',
    suggestedInvocationPhrase: 'Open my app',
    description: 'Opens the app',
    keywords: ['open', 'launch', 'start'],
  },
  OPEN_PREMIUM: {
    activityType: 'com.yourapp.premium',
    title: 'View Premium',
    suggestedInvocationPhrase: 'Show premium features',
    description: 'Opens the premium subscription page',
    keywords: ['premium', 'upgrade', 'subscription', 'pro'],
  },
  OPEN_PROFILE: {
    activityType: 'com.yourapp.profile',
    title: 'View Profile',
    suggestedInvocationPhrase: 'Show my profile',
    description: 'Opens your profile',
    keywords: ['profile', 'account', 'me'],
  },
  OPEN_SETTINGS: {
    activityType: 'com.yourapp.settings',
    title: 'Open Settings',
    suggestedInvocationPhrase: 'Open app settings',
    description: 'Opens the settings screen',
    keywords: ['settings', 'preferences', 'options'],
  },

  // Actions
  CHECK_STATUS: {
    activityType: 'com.yourapp.check-status',
    title: 'Check Status',
    suggestedInvocationPhrase: 'Check my status',
    description: 'Check your current subscription status',
    keywords: ['status', 'subscription', 'check'],
  },
  VIEW_PRODUCT: {
    activityType: 'com.yourapp.view-product',
    title: 'View Product',
    suggestedInvocationPhrase: 'Show product',
    description: 'View a specific product',
    keywords: ['product', 'view', 'show'],
  },
  QUICK_ACTION: {
    activityType: 'com.yourapp.quick-action',
    title: 'Quick Action',
    suggestedInvocationPhrase: 'Do the thing',
    description: 'Perform a quick action',
    keywords: ['quick', 'fast', 'action'],
  },
} as const;

// Track donated shortcuts
let donatedShortcuts: Map<string, DonatedShortcut> = new Map();

/**
 * Initialize shortcuts tracking
 */
async function initializeShortcuts(): Promise<void> {
  try {
    const data = await AsyncStorage.getItem(DONATED_SHORTCUTS_KEY);
    if (data) {
      const shortcuts: DonatedShortcut[] = JSON.parse(data);
      donatedShortcuts = new Map(shortcuts.map((s) => [s.activityType, s]));
    }
  } catch {
    // Ignore initialization errors
  }
}

/**
 * Save donated shortcuts to storage
 */
async function saveDonatedShortcuts(): Promise<void> {
  try {
    const shortcuts = Array.from(donatedShortcuts.values());
    await AsyncStorage.setItem(DONATED_SHORTCUTS_KEY, JSON.stringify(shortcuts));
  } catch {
    // Ignore save errors
  }
}

/**
 * Donate a shortcut to Siri
 *
 * Call this when the user performs an action you want to make available as a shortcut.
 * The more a shortcut is donated, the more likely Siri will suggest it.
 */
export async function donateShortcut(
  shortcut: ShortcutActivity,
  userInfo?: Record<string, unknown>
): Promise<boolean> {
  if (Platform.OS !== 'ios') {
    return false;
  }

  await initializeShortcuts();

  // Merge user info with shortcut
  const activity: ShortcutActivity = {
    ...shortcut,
    userInfo: { ...shortcut.userInfo, ...userInfo },
    isEligibleForSearch: true,
    isEligibleForPrediction: true,
    persistentIdentifier: shortcut.activityType,
  };

  // Track donation
  const existing = donatedShortcuts.get(activity.activityType);
  const donated: DonatedShortcut = {
    ...activity,
    donatedAt: new Date().toISOString(),
    donationCount: (existing?.donationCount || 0) + 1,
  };
  donatedShortcuts.set(activity.activityType, donated);
  await saveDonatedShortcuts();

  // On actual iOS with native module:
  // await NativeSiriShortcuts.donateShortcut(activity);

  if (__DEV__) {
    console.log('[SiriShortcuts] Donated:', activity.title, `(${donated.donationCount}x)`);
  }

  return true;
}

/**
 * Delete a donated shortcut
 */
export async function deleteShortcut(activityType: string): Promise<boolean> {
  if (Platform.OS !== 'ios') {
    return false;
  }

  await initializeShortcuts();

  if (!donatedShortcuts.has(activityType)) {
    return false;
  }

  donatedShortcuts.delete(activityType);
  await saveDonatedShortcuts();

  // On actual iOS with native module:
  // await NativeSiriShortcuts.deleteShortcut(activityType);

  if (__DEV__) {
    console.log('[SiriShortcuts] Deleted:', activityType);
  }

  return true;
}

/**
 * Delete all donated shortcuts
 */
export async function deleteAllShortcuts(): Promise<void> {
  if (Platform.OS !== 'ios') {
    return;
  }

  donatedShortcuts.clear();
  await AsyncStorage.removeItem(DONATED_SHORTCUTS_KEY);

  // On actual iOS with native module:
  // await NativeSiriShortcuts.deleteAllShortcuts();

  if (__DEV__) {
    console.log('[SiriShortcuts] Deleted all shortcuts');
  }
}

/**
 * Get all donated shortcuts
 */
export async function getDonatedShortcuts(): Promise<DonatedShortcut[]> {
  await initializeShortcuts();
  return Array.from(donatedShortcuts.values());
}

/**
 * Present the "Add to Siri" UI for a shortcut
 */
export async function presentShortcutUI(shortcut: ShortcutActivity): Promise<boolean> {
  if (Platform.OS !== 'ios') {
    return false;
  }

  // On actual iOS with native module:
  // await NativeSiriShortcuts.presentShortcut(shortcut);

  if (__DEV__) {
    console.log('[SiriShortcuts] Would present Add to Siri UI for:', shortcut.title);
  }

  return true;
}

/**
 * Check if shortcuts are available
 */
export function isAvailable(): boolean {
  return Platform.OS === 'ios';
}

/**
 * Handle incoming shortcut action
 * Call this from your app's root to handle Siri-triggered shortcuts
 */
export function handleShortcutAction(
  activityType: string,
  userInfo: Record<string, unknown> | null,
  router: { push: (path: string, params?: Record<string, unknown>) => void }
): void {
  if (__DEV__) {
    console.log('[SiriShortcuts] Handling action:', activityType, userInfo);
  }

  switch (activityType) {
    case SiriShortcuts.OPEN_PREMIUM.activityType:
      router.push('/(tabs)/profile');
      break;

    case SiriShortcuts.OPEN_PROFILE.activityType:
      router.push('/(tabs)/profile');
      break;

    case SiriShortcuts.OPEN_SETTINGS.activityType:
      router.push('/(tabs)/settings');
      break;

    case SiriShortcuts.VIEW_PRODUCT.activityType:
      if (userInfo?.productId) {
        router.push('/(tabs)', { productId: userInfo.productId as string });
      }
      break;

    case SiriShortcuts.CHECK_STATUS.activityType:
      router.push('/(tabs)/profile');
      break;

    default:
      // Open home by default
      router.push('/(tabs)');
      break;
  }
}

/**
 * Suggested shortcuts to donate based on user behavior
 */
export function getSuggestedShortcuts(): ShortcutActivity[] {
  return [
    { ...SiriShortcuts.OPEN_APP, keywords: [...SiriShortcuts.OPEN_APP.keywords] },
    { ...SiriShortcuts.OPEN_PREMIUM, keywords: [...SiriShortcuts.OPEN_PREMIUM.keywords] },
    { ...SiriShortcuts.CHECK_STATUS, keywords: [...SiriShortcuts.CHECK_STATUS.keywords] },
  ];
}

/**
 * Donate initial shortcuts on first app launch
 */
export async function donateInitialShortcuts(): Promise<void> {
  const suggestions = getSuggestedShortcuts();
  for (const shortcut of suggestions) {
    await donateShortcut(shortcut);
  }
}

// Initialize on import
initializeShortcuts();
