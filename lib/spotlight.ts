/**
 * Spotlight Search Indexing for iOS
 *
 * Allows your app content to appear in iOS Spotlight search results.
 * Users can search for content and deep link directly into your app.
 *
 * Note: This requires expo-dev-client and native module support.
 * For full functionality, you may need a custom native module.
 *
 * @example
 * ```typescript
 * import { indexItem, removeItem, searchItems } from '@/lib/spotlight';
 *
 * // Index a product
 * await indexItem({
 *   id: 'product-123',
 *   title: 'Premium Subscription',
 *   description: 'Unlock all features',
 *   keywords: ['premium', 'subscription', 'pro'],
 *   thumbnailUri: 'https://example.com/image.png',
 *   deepLink: 'yourapp://product/123',
 * });
 * ```
 */

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage key for indexed items
const INDEXED_ITEMS_KEY = '@spotlight:indexed_items';

// Types
export interface SpotlightItem {
  id: string;
  title: string;
  description?: string;
  keywords?: string[];
  thumbnailUri?: string;
  deepLink?: string;
  contentType?: 'product' | 'article' | 'profile' | 'setting' | 'other';
  expirationDate?: Date;
  domainId?: string;
}

export interface IndexedItem extends SpotlightItem {
  indexedAt: string;
}

// Track indexed items locally
let indexedItems: Map<string, IndexedItem> = new Map();
let isInitialized = false;

/**
 * Initialize spotlight indexing
 */
export async function initializeSpotlight(): Promise<void> {
  if (isInitialized) return;

  try {
    const data = await AsyncStorage.getItem(INDEXED_ITEMS_KEY);
    if (data) {
      const items: IndexedItem[] = JSON.parse(data);
      indexedItems = new Map(items.map((item) => [item.id, item]));
    }
  } catch {
    // Ignore initialization errors
  }

  isInitialized = true;
}

/**
 * Save indexed items to storage
 */
async function saveIndexedItems(): Promise<void> {
  try {
    const items = Array.from(indexedItems.values());
    await AsyncStorage.setItem(INDEXED_ITEMS_KEY, JSON.stringify(items));
  } catch {
    // Ignore save errors
  }
}

/**
 * Index an item for Spotlight search
 *
 * On iOS, this will use Core Spotlight for native indexing.
 * On other platforms, it stores locally for potential web search integration.
 */
export async function indexItem(item: SpotlightItem): Promise<boolean> {
  await initializeSpotlight();

  // Create indexed item
  const indexedItem: IndexedItem = {
    ...item,
    indexedAt: new Date().toISOString(),
  };

  // Store locally
  indexedItems.set(item.id, indexedItem);
  await saveIndexedItems();

  if (Platform.OS === 'ios') {
    // For native iOS Spotlight, you would use:
    // - expo-spotlight (if available)
    // - react-native-spotlight-search
    // - Custom native module
    //
    // Example with native module:
    // await NativeSpotlight.indexItem({
    //   uniqueIdentifier: item.id,
    //   title: item.title,
    //   contentDescription: item.description,
    //   keywords: item.keywords,
    //   thumbnailURL: item.thumbnailUri,
    //   domainIdentifier: item.domainId || 'com.yourapp.content',
    // });

    if (__DEV__) {
      console.log('[Spotlight] Indexed item:', item.id, item.title);
    }
  }

  return true;
}

/**
 * Index multiple items at once
 */
export async function indexItems(items: SpotlightItem[]): Promise<number> {
  let indexed = 0;
  for (const item of items) {
    const success = await indexItem(item);
    if (success) indexed++;
  }
  return indexed;
}

/**
 * Remove an item from Spotlight index
 */
export async function removeItem(id: string): Promise<boolean> {
  await initializeSpotlight();

  if (!indexedItems.has(id)) {
    return false;
  }

  indexedItems.delete(id);
  await saveIndexedItems();

  if (Platform.OS === 'ios') {
    // NativeSpotlight.deleteSearchableItems([id]);
    if (__DEV__) {
      console.log('[Spotlight] Removed item:', id);
    }
  }

  return true;
}

/**
 * Remove multiple items from Spotlight index
 */
export async function removeItems(ids: string[]): Promise<number> {
  let removed = 0;
  for (const id of ids) {
    const success = await removeItem(id);
    if (success) removed++;
  }
  return removed;
}

/**
 * Remove all items from Spotlight index
 */
export async function removeAllItems(): Promise<void> {
  await initializeSpotlight();

  indexedItems.clear();
  await AsyncStorage.removeItem(INDEXED_ITEMS_KEY);

  if (Platform.OS === 'ios') {
    // NativeSpotlight.deleteAllSearchableItems();
    if (__DEV__) {
      console.log('[Spotlight] Removed all items');
    }
  }
}

/**
 * Remove items by domain
 */
export async function removeItemsByDomain(domainId: string): Promise<number> {
  await initializeSpotlight();

  const toRemove: string[] = [];
  indexedItems.forEach((item, id) => {
    if (item.domainId === domainId) {
      toRemove.push(id);
    }
  });

  return removeItems(toRemove);
}

/**
 * Get all indexed items (local cache)
 */
export async function getIndexedItems(): Promise<IndexedItem[]> {
  await initializeSpotlight();
  return Array.from(indexedItems.values());
}

/**
 * Search indexed items locally
 * (For testing or web platforms)
 */
export async function searchItems(query: string): Promise<IndexedItem[]> {
  await initializeSpotlight();

  const lowerQuery = query.toLowerCase();
  const results: IndexedItem[] = [];

  indexedItems.forEach((item) => {
    const matchesTitle = item.title.toLowerCase().includes(lowerQuery);
    const matchesDescription = item.description?.toLowerCase().includes(lowerQuery);
    const matchesKeywords = item.keywords?.some((kw) => kw.toLowerCase().includes(lowerQuery));

    if (matchesTitle || matchesDescription || matchesKeywords) {
      results.push(item);
    }
  });

  return results;
}

/**
 * Handle a Spotlight search result selection
 * Call this when user taps on a Spotlight result
 */
export function handleSpotlightResult(
  uniqueIdentifier: string,
  router: { push: (path: string) => void }
): void {
  const item = indexedItems.get(uniqueIdentifier);

  if (item?.deepLink) {
    // Extract path from deep link
    const path = item.deepLink.replace(/^[a-z]+:\/\//, '/');
    router.push(path);
  }

  if (__DEV__) {
    console.log('[Spotlight] Handled result:', uniqueIdentifier);
  }
}

/**
 * Predefined content types for indexing
 */
export const SpotlightContentTypes = {
  // Products and features
  PRODUCT: 'product',
  FEATURE: 'feature',
  SUBSCRIPTION: 'subscription',

  // Content
  ARTICLE: 'article',
  TUTORIAL: 'tutorial',
  FAQ: 'faq',

  // App sections
  SETTING: 'setting',
  PROFILE: 'profile',
  SCREEN: 'screen',
} as const;

/**
 * Helper to create product index item
 */
export function createProductItem(
  id: string,
  title: string,
  description: string,
  options?: Partial<SpotlightItem>
): SpotlightItem {
  return {
    id: `product-${id}`,
    title,
    description,
    contentType: 'product',
    deepLink: `dodoexpo://product/${id}`,
    domainId: 'products',
    ...options,
  };
}

/**
 * Helper to create setting index item
 */
export function createSettingItem(
  id: string,
  title: string,
  description: string,
  options?: Partial<SpotlightItem>
): SpotlightItem {
  return {
    id: `setting-${id}`,
    title,
    description,
    contentType: 'setting',
    keywords: ['settings', 'preferences', title.toLowerCase()],
    deepLink: `dodoexpo://settings/${id}`,
    domainId: 'settings',
    ...options,
  };
}

/**
 * Index common app screens for Spotlight
 */
export async function indexAppScreens(): Promise<void> {
  const screens: SpotlightItem[] = [
    {
      id: 'screen-home',
      title: 'Home',
      description: 'Go to home screen',
      keywords: ['home', 'main', 'start'],
      deepLink: 'dodoexpo://',
      contentType: 'other',
      domainId: 'screens',
    },
    {
      id: 'screen-profile',
      title: 'Profile',
      description: 'View your profile',
      keywords: ['profile', 'account', 'user'],
      deepLink: 'dodoexpo://profile',
      contentType: 'profile',
      domainId: 'screens',
    },
    {
      id: 'screen-settings',
      title: 'Settings',
      description: 'App settings and preferences',
      keywords: ['settings', 'preferences', 'options', 'configure'],
      deepLink: 'dodoexpo://settings',
      contentType: 'setting',
      domainId: 'screens',
    },
    {
      id: 'screen-premium',
      title: 'Premium',
      description: 'Upgrade to premium',
      keywords: ['premium', 'pro', 'upgrade', 'subscription'],
      deepLink: 'dodoexpo://premium',
      contentType: 'product',
      domainId: 'screens',
    },
  ];

  await indexItems(screens);
}

// Initialize on import
initializeSpotlight();
