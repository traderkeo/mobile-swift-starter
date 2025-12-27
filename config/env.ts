/**
 * Environment configuration with validation
 *
 * This app uses local storage (AsyncStorage) + RevenueCat for payments.
 * No backend/Supabase required.
 *
 * @example
 * ```typescript
 * import { env } from '@/config/env';
 *
 * if (env.revenueCatAppleApiKey) {
 *   // Configure RevenueCat
 * }
 * ```
 */

// Environment variable definitions with metadata
const envConfig = {
  // RevenueCat (required for payments)
  revenueCatAppleApiKey: {
    value: process.env.EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY || '',
    required: false,
    description: 'RevenueCat Apple API Key',
    hint: 'Get this from: https://app.revenuecat.com → Project Settings → API Keys',
  },
  revenueCatGoogleApiKey: {
    value: process.env.EXPO_PUBLIC_REVENUECAT_GOOGLE_API_KEY || '',
    required: false,
    description: 'RevenueCat Google API Key',
    hint: 'Get this from: https://app.revenuecat.com → Project Settings → API Keys',
  },

  // Sentry (recommended for crash reporting)
  sentryDsn: {
    value: process.env.EXPO_PUBLIC_SENTRY_DSN || '',
    required: false,
    description: 'Sentry DSN for crash reporting',
    hint: 'Get this from: https://sentry.io → Project Settings → Client Keys (DSN)',
  },

  // API (optional - for apps with backend)
  apiUrl: {
    value: process.env.EXPO_PUBLIC_API_URL || '',
    required: false,
    description: 'Backend API base URL',
    hint: 'Your API server URL (e.g., https://api.yourapp.com)',
  },

  // App Store IDs (for store review and update prompts)
  appStoreId: {
    value: process.env.EXPO_PUBLIC_APP_STORE_ID || '',
    required: false,
    description: 'Apple App Store ID',
    hint: 'Get this from App Store Connect → App Information → Apple ID',
  },
  playStoreId: {
    value: process.env.EXPO_PUBLIC_PLAY_STORE_ID || '',
    required: false,
    description: 'Google Play Store package name',
    hint: 'Your Android package name (e.g., com.yourcompany.yourapp)',
  },

  // Universal Links domain
  universalLinksDomain: {
    value: process.env.EXPO_PUBLIC_UNIVERSAL_LINKS_DOMAIN || '',
    required: false,
    description: 'Domain for Universal Links / App Links',
    hint: 'Your domain that handles deep links (e.g., yourapp.com)',
  },
} as const;

type EnvKey = keyof typeof envConfig;

interface ValidationError {
  key: string;
  envVar: string;
  description: string;
  hint?: string;
}

/**
 * Environment variable names mapping
 */
const envVarNames: Record<EnvKey, string> = {
  revenueCatAppleApiKey: 'EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY',
  revenueCatGoogleApiKey: 'EXPO_PUBLIC_REVENUECAT_GOOGLE_API_KEY',
  sentryDsn: 'EXPO_PUBLIC_SENTRY_DSN',
  apiUrl: 'EXPO_PUBLIC_API_URL',
  appStoreId: 'EXPO_PUBLIC_APP_STORE_ID',
  playStoreId: 'EXPO_PUBLIC_PLAY_STORE_ID',
  universalLinksDomain: 'EXPO_PUBLIC_UNIVERSAL_LINKS_DOMAIN',
};

/**
 * Validates all required environment variables
 * Returns an array of missing/invalid variables
 */
export function validateEnv(): ValidationError[] {
  const errors: ValidationError[] = [];

  for (const [key, config] of Object.entries(envConfig)) {
    if (config.required && !config.value) {
      errors.push({
        key,
        envVar: envVarNames[key as EnvKey],
        description: config.description,
        hint: 'hint' in config ? config.hint : undefined,
      });
    }
  }

  return errors;
}

/**
 * Checks if environment is properly configured
 * Logs helpful error messages for missing variables
 */
export function checkEnv(): boolean {
  const errors = validateEnv();

  if (errors.length === 0) {
    return true;
  }

  console.error('\n╔══════════════════════════════════════════════════════════════╗');
  console.error('║           MISSING REQUIRED ENVIRONMENT VARIABLES             ║');
  console.error('╚══════════════════════════════════════════════════════════════╝\n');

  for (const error of errors) {
    console.error(`❌ ${error.envVar}`);
    console.error(`   ${error.description}`);
    if (error.hint) {
      console.error(`   💡 ${error.hint}`);
    }
    console.error('');
  }

  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.error('To fix this:');
  console.error('1. Create a .env file in the project root');
  console.error('2. Add the missing variables above');
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  return false;
}

/**
 * Returns true if the app is running in development mode
 */
export function isDev(): boolean {
  return __DEV__ || process.env.NODE_ENV === 'development';
}

/**
 * Returns true if all required env vars are configured
 */
export function isConfigured(): boolean {
  return validateEnv().length === 0;
}

/**
 * Check if a specific service is configured
 */
export function isServiceConfigured(service: 'revenuecat' | 'sentry' | 'api'): boolean {
  switch (service) {
    case 'revenuecat':
      return !!(envConfig.revenueCatAppleApiKey.value || envConfig.revenueCatGoogleApiKey.value);
    case 'sentry':
      return !!envConfig.sentryDsn.value;
    case 'api':
      return !!envConfig.apiUrl.value;
    default:
      return false;
  }
}

/**
 * Log which optional services are configured (for debugging)
 */
export function logConfiguredServices(): void {
  if (!__DEV__) return;

  console.log('\n📋 Configured Services:');
  console.log(
    `   RevenueCat: ${isServiceConfigured('revenuecat') ? '✅' : '❌ (payments disabled)'}`
  );
  console.log(
    `   Sentry:     ${isServiceConfigured('sentry') ? '✅' : '❌ (crash reporting disabled)'}`
  );
  console.log(`   API:        ${isServiceConfigured('api') ? '✅' : '❌ (no backend)'}`);
  console.log('');
}

// Export the environment values
export const env = {
  revenueCatAppleApiKey: envConfig.revenueCatAppleApiKey.value,
  revenueCatGoogleApiKey: envConfig.revenueCatGoogleApiKey.value,
  sentryDsn: envConfig.sentryDsn.value,
  apiUrl: envConfig.apiUrl.value,
  appStoreId: envConfig.appStoreId.value,
  playStoreId: envConfig.playStoreId.value,
  universalLinksDomain: envConfig.universalLinksDomain.value,
};

export default env;
