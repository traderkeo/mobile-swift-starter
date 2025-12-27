/**
 * Share Utilities
 *
 * Native share functionality for content, referrals, and files.
 *
 * INSTALLATION: expo install expo-sharing expo-file-system
 *
 * @example
 * // Share text
 * await shareText('Check out this app!');
 *
 * // Share URL
 * await shareUrl('https://example.com');
 *
 * // Share app with referral
 * await shareApp({ referralCode: 'ABC123' });
 *
 * // Share image
 * await shareImage(imageUri);
 */

import { Share, Platform } from 'react-native';
import { env } from '@/config/env';

// Types for optional dependencies
interface SharingModule {
  isAvailableAsync: () => Promise<boolean>;
  shareAsync: (
    url: string,
    options?: { mimeType?: string; dialogTitle?: string; UTI?: string }
  ) => Promise<void>;
}

interface FileSystemModule {
  cacheDirectory: string | null;
  downloadAsync: (uri: string, fileUri: string) => Promise<{ uri: string }>;
}

// Lazy load optional dependencies
let Sharing: SharingModule | null = null;
let FileSystem: FileSystemModule | null = null;

async function loadSharingModules() {
  if (!Sharing) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      Sharing = require('expo-sharing') as SharingModule;
    } catch {
      console.warn('expo-sharing not installed. Run: expo install expo-sharing');
    }
  }
  if (!FileSystem) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      FileSystem = require('expo-file-system') as FileSystemModule;
    } catch {
      console.warn('expo-file-system not installed. Run: expo install expo-file-system');
    }
  }
}

// ===========================================
// TYPES
// ===========================================

export interface ShareOptions {
  title?: string;
  message?: string;
  url?: string;
  dialogTitle?: string;
}

export interface ShareAppOptions {
  referralCode?: string;
  campaign?: string;
  customMessage?: string;
}

export interface ShareResult {
  shared: boolean;
  action?: 'sharedAction' | 'dismissedAction';
  activityType?: string | null;
}

// ===========================================
// CORE SHARE FUNCTIONS
// ===========================================

/**
 * Check if sharing is available on this device
 */
export async function isShareAvailable(): Promise<boolean> {
  await loadSharingModules();
  if (!Sharing) return false;
  return Sharing.isAvailableAsync();
}

/**
 * Share plain text content
 */
export async function shareText(message: string, title?: string): Promise<ShareResult> {
  try {
    const result = await Share.share({ message, title }, { dialogTitle: title });

    return {
      shared: result.action === Share.sharedAction,
      action: result.action as ShareResult['action'],
      activityType: result.activityType,
    };
  } catch (error) {
    console.error('Share failed:', error);
    return { shared: false };
  }
}

/**
 * Share a URL with optional message
 */
export async function shareUrl(
  url: string,
  message?: string,
  title?: string
): Promise<ShareResult> {
  try {
    const shareContent = Platform.select({
      ios: { url, message, title },
      android: { message: message ? `${message}\n${url}` : url, title },
      default: { message: message ? `${message}\n${url}` : url },
    });

    const result = await Share.share(shareContent!, { dialogTitle: title });

    return {
      shared: result.action === Share.sharedAction,
      action: result.action as ShareResult['action'],
      activityType: result.activityType,
    };
  } catch (error) {
    console.error('Share URL failed:', error);
    return { shared: false };
  }
}

/**
 * Share app with referral link
 */
export async function shareApp(options: ShareAppOptions = {}): Promise<ShareResult> {
  const { referralCode, campaign, customMessage } = options;

  const appName = 'Our App';
  const appStoreUrl = env.appStoreId ? `https://apps.apple.com/app/id${env.appStoreId}` : '';
  const playStoreUrl = env.playStoreId
    ? `https://play.google.com/store/apps/details?id=${env.playStoreId}`
    : '';

  let storeUrl =
    Platform.select({
      ios: appStoreUrl,
      android: playStoreUrl,
      default: appStoreUrl || playStoreUrl,
    }) || '';

  if (referralCode && storeUrl) {
    const separator = storeUrl.includes('?') ? '&' : '?';
    storeUrl += `${separator}referral=${referralCode}`;
  }

  if (campaign && storeUrl) {
    const separator = storeUrl.includes('?') ? '&' : '?';
    storeUrl += `${separator}campaign=${campaign}`;
  }

  const defaultMessage = `Check out ${appName}! ${storeUrl}`;
  const message = customMessage
    ? `${customMessage}${storeUrl ? `\n\n${storeUrl}` : ''}`
    : defaultMessage;

  return shareText(message, `Share ${appName}`);
}

/**
 * Share content to a specific screen/feature in app
 */
export async function shareDeepLink(
  path: string,
  params?: Record<string, string>,
  message?: string
): Promise<ShareResult> {
  const domain = env.universalLinksDomain;
  if (!domain) {
    console.warn('No universal links domain configured');
    return shareText(message || 'Check this out!');
  }

  let url = `https://${domain}${path}`;
  if (params) {
    const queryString = Object.entries(params)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');
    url += `?${queryString}`;
  }

  return shareUrl(url, message);
}

// ===========================================
// FILE SHARING
// ===========================================

/**
 * Share an image file
 */
export async function shareImage(imageUri: string, message?: string): Promise<ShareResult> {
  try {
    await loadSharingModules();
    if (!Sharing || !FileSystem) {
      console.warn('Sharing modules not available. Install expo-sharing and expo-file-system');
      return { shared: false };
    }

    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      console.warn('Sharing not available on this device');
      return { shared: false };
    }

    let localUri = imageUri;
    if (imageUri.startsWith('http')) {
      if (!FileSystem.cacheDirectory) {
        console.warn('Cache directory not available');
        return { shared: false };
      }
      const filename = imageUri.split('/').pop() || 'shared-image.jpg';
      const downloadPath = `${FileSystem.cacheDirectory}${filename}`;
      await FileSystem.downloadAsync(imageUri, downloadPath);
      localUri = downloadPath;
    }

    await Sharing.shareAsync(localUri, {
      mimeType: 'image/*',
      dialogTitle: message || 'Share Image',
      UTI: 'public.image',
    });

    return { shared: true };
  } catch (error) {
    console.error('Share image failed:', error);
    return { shared: false };
  }
}

/**
 * Share a PDF file
 */
export async function sharePdf(pdfUri: string, title?: string): Promise<ShareResult> {
  try {
    await loadSharingModules();
    if (!Sharing || !FileSystem) {
      console.warn('Sharing modules not available. Install expo-sharing and expo-file-system');
      return { shared: false };
    }

    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      console.warn('Sharing not available on this device');
      return { shared: false };
    }

    let localUri = pdfUri;
    if (pdfUri.startsWith('http')) {
      if (!FileSystem.cacheDirectory) {
        console.warn('Cache directory not available');
        return { shared: false };
      }
      const filename = pdfUri.split('/').pop() || 'document.pdf';
      const downloadPath = `${FileSystem.cacheDirectory}${filename}`;
      await FileSystem.downloadAsync(pdfUri, downloadPath);
      localUri = downloadPath;
    }

    await Sharing.shareAsync(localUri, {
      mimeType: 'application/pdf',
      dialogTitle: title || 'Share PDF',
      UTI: 'com.adobe.pdf',
    });

    return { shared: true };
  } catch (error) {
    console.error('Share PDF failed:', error);
    return { shared: false };
  }
}

/**
 * Share any file
 */
export async function shareFile(
  fileUri: string,
  options?: {
    mimeType?: string;
    dialogTitle?: string;
    UTI?: string;
  }
): Promise<ShareResult> {
  try {
    await loadSharingModules();
    if (!Sharing) {
      console.warn('expo-sharing not available. Install expo-sharing');
      return { shared: false };
    }

    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      console.warn('Sharing not available on this device');
      return { shared: false };
    }

    await Sharing.shareAsync(fileUri, options);
    return { shared: true };
  } catch (error) {
    console.error('Share file failed:', error);
    return { shared: false };
  }
}

// ===========================================
// SOCIAL SHARING HELPERS
// ===========================================

/**
 * Generate share content for different platforms
 */
export function generateShareContent(
  type: 'twitter' | 'facebook' | 'whatsapp' | 'email' | 'sms',
  content: { text: string; url?: string; hashtags?: string[] }
): string {
  const { text, url, hashtags } = content;

  switch (type) {
    case 'twitter':
      const hashtagString = hashtags?.map((h) => `#${h}`).join(' ') || '';
      return `${text} ${url || ''} ${hashtagString}`.trim();

    case 'facebook':
      return url ? `${text}\n\n${url}` : text;

    case 'whatsapp':
      return url ? `${text}\n${url}` : text;

    case 'email':
      return url ? `${text}\n\nLink: ${url}` : text;

    case 'sms':
      return url ? `${text} ${url}` : text;

    default:
      return text;
  }
}

// ===========================================
// REFERRAL UTILITIES
// ===========================================

/**
 * Generate a unique referral code
 */
export function generateReferralCode(userId: string): string {
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  const userHash = userId.slice(-4).toUpperCase();
  return `${userHash}${random}`;
}

/**
 * Share with referral tracking
 */
export async function shareWithReferral(
  userId: string,
  content: string
): Promise<ShareResult & { referralCode: string }> {
  const referralCode = generateReferralCode(userId);
  const result = await shareApp({
    referralCode,
    customMessage: content,
  });

  return { ...result, referralCode };
}
