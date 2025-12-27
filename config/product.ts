/**
 * Product configuration
 * Centralized place to manage product details for subscription and usage-based plans
 *
 * IMPORTANT: With RevenueCat, products are managed in the RevenueCat dashboard.
 * This file contains display configuration and entitlement identifiers.
 *
 * RevenueCat Setup:
 * 1. Create products in App Store Connect / Google Play Console
 * 2. Add products to RevenueCat dashboard
 * 3. Create an Offering with packages (weekly, monthly, yearly)
 * 4. Create an Entitlement called "premium"
 */

import { Platform } from 'react-native';

export const HEADER_CONFIG = {
  title: 'Premium Plan',
  subtitle: 'Upgrade to unlock all features',
};

/**
 * RevenueCat Entitlement Identifiers
 * Create these in RevenueCat Dashboard > Entitlements
 */
export const ENTITLEMENTS = {
  premium: 'premium', // Main premium access entitlement
} as const;

/**
 * RevenueCat Offering Identifier
 * Create this in RevenueCat Dashboard > Offerings
 * The "default" offering is shown to all users
 */
export const DEFAULT_OFFERING = 'default';

/**
 * Legal Pages Configuration
 *
 * This app uses IN-APP legal pages by default (see config/legal-content.ts).
 * The in-app pages work offline and give you full control over styling.
 *
 * In-App Routes:
 * - Privacy Policy: /legal/privacy
 * - Terms of Service: /legal/terms
 * - FAQ: /legal/faq
 *
 * To customize the legal content, edit: config/legal-content.ts
 *
 * External URLs (optional fallbacks for web or external links):
 * If you also want external URLs (e.g., for your website footer),
 * replace the example.com URLs below with your actual URLs.
 */
export const LEGAL_URLS = {
  // In-app routes (used by settings screen)
  inApp: {
    privacyPolicy: '/legal/privacy',
    termsOfService: '/legal/terms',
    faq: '/legal/faq',
  },

  // External URLs (optional - for website links, App Store metadata, etc.)
  // TODO: Replace with your actual URLs if you need external links
  external: {
    privacyPolicy: 'https://example.com/privacy',
    termsOfService: 'https://example.com/terms',
    faq: 'https://example.com/faq',
  },

  // Apple subscription management URL (DO NOT CHANGE - this is correct)
  manageSubscriptions: 'https://apps.apple.com/account/subscriptions',

  // TODO: Replace with your support email
  support: 'mailto:support@example.com',
};

// Legacy exports for backwards compatibility
export const PRIVACY_POLICY_URL = LEGAL_URLS.external.privacyPolicy;
export const TERMS_OF_SERVICE_URL = LEGAL_URLS.external.termsOfService;

/**
 * App Store compliant subscription disclaimers
 * These are REQUIRED by Apple for auto-renewable subscriptions
 */
export const SUBSCRIPTION_DISCLAIMERS = {
  // Short disclaimer for product cards
  short: 'Cancel anytime. No hidden fees.',

  // Full Apple-compliant disclaimer (REQUIRED)
  full: Platform.select({
    ios: `Payment will be charged to your Apple ID account at confirmation of purchase. Subscription automatically renews unless it is canceled at least 24 hours before the end of the current period. Your account will be charged for renewal within 24 hours prior to the end of the current period. You can manage and cancel your subscriptions by going to your App Store account settings after purchase.`,
    default: `Subscription automatically renews unless canceled at least 24 hours before the end of the current period. You can manage and cancel your subscriptions in your account settings.`,
  }),

  // Trial disclaimer (if offering free trials)
  trial: Platform.select({
    ios: `Free trial will automatically convert to a paid subscription unless canceled at least 24 hours before the trial ends. Payment will be charged to your Apple ID account.`,
    default: `Free trial will automatically convert to a paid subscription unless canceled before the trial ends.`,
  }),
};

/**
 * Product display configuration
 * Badges and descriptions for UI - actual prices come from RevenueCat
 */
export const PRODUCT_DISPLAY = {
  weekly: {
    badge: null,
    description: 'Try premium features',
    savings: null,
  },
  monthly: {
    badge: 'MOST POPULAR',
    description: 'Best for regular users',
    savings: '17% vs weekly',
  },
  yearly: {
    badge: 'BEST VALUE',
    description: 'Maximum savings',
    savings: '50% off',
  },
};

/**
 * Product details for display
 * Price shown is for display only - actual price comes from the store
 */
export const PRODUCT_CONFIG = {
  price: '$9.99',
  period: '/month',
  badge: 'MOST POPULAR',
  description: 'Get full access to all premium features',
  features: [
    'Unlimited access to all features',
    'Priority customer support',
    'Advanced analytics dashboard',
    'Remove all advertisements',
    'Early access to new features',
  ],
  buttonText: 'Subscribe Now',
  disclaimer: SUBSCRIPTION_DISCLAIMERS.short,
  // Full legal disclaimer (shown below button)
  legalDisclaimer: SUBSCRIPTION_DISCLAIMERS.full,
};

/**
 * RevenueCat Package Types (for display logic)
 * Packages are fetched from RevenueCat - these are for UI mapping
 */
export const PACKAGE_TYPES = {
  WEEKLY: '$rc_weekly',
  MONTHLY: '$rc_monthly',
  ANNUAL: '$rc_annual',
  LIFETIME: '$rc_lifetime',
} as const;

/**
 * Get display info for a package type
 */
export function getPackageDisplayInfo(packageType: string): {
  badge: string | null;
  description: string;
  savings: string | null;
} {
  switch (packageType) {
    case PACKAGE_TYPES.WEEKLY:
      return PRODUCT_DISPLAY.weekly;
    case PACKAGE_TYPES.MONTHLY:
      return PRODUCT_DISPLAY.monthly;
    case PACKAGE_TYPES.ANNUAL:
      return PRODUCT_DISPLAY.yearly;
    default:
      return { badge: null, description: '', savings: null };
  }
}

// =============================================================================
// Usage-Based AI Billing Configuration
// =============================================================================

/**
 * Usage plan IDs - these map to subscription products in Dodo
 *
 * IMPORTANT: You don't need separate Dodo products for each AI model.
 * Instead, create subscription products with included token allowances,
 * and optionally token pack products for overage purchases.
 */
export type UsagePlanId = 'free' | 'starter' | 'pro' | 'enterprise';

/**
 * Usage plan configuration
 */
export interface UsagePlan {
  id: UsagePlanId;
  name: string;
  description: string;
  // Token limits
  includedTokensPerMonth: number;
  // Rate limits
  requestsPerMinute: number;
  requestsPerDay: number;
  // Pricing (in cents)
  priceCents: number;
  priceDisplay: string;
  overagePricePerMillionTokens: number; // Price per 1M tokens over limit
  // Features
  allowedModels: string[];
  allowOverage: boolean;
  features: string[];
  // RevenueCat entitlement that grants this plan
  revenueCatEntitlement?: string;
}

/**
 * Usage plans with AI token allowances
 *
 * Configure these based on your business model:
 * - Free: Limited tokens for trial
 * - Starter: For individuals
 * - Pro: For professionals/teams
 * - Enterprise: Custom/high-volume
 */
export const USAGE_PLANS: Record<UsagePlanId, UsagePlan> = {
  free: {
    id: 'free',
    name: 'Free',
    description: 'Try AI features with limited usage',
    includedTokensPerMonth: 10_000, // 10K tokens (~5-10 conversations)
    requestsPerMinute: 5,
    requestsPerDay: 50,
    priceCents: 0,
    priceDisplay: 'Free',
    overagePricePerMillionTokens: 0, // No overage on free tier
    allowedModels: ['gpt-4o-mini', 'claude-3-5-haiku-20241022'],
    allowOverage: false,
    features: ['10,000 tokens/month', 'Basic AI models', '5 requests/minute', '50 requests/day'],
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    description: 'For individuals and small projects',
    includedTokensPerMonth: 100_000, // 100K tokens
    requestsPerMinute: 20,
    requestsPerDay: 500,
    priceCents: 999, // $9.99/month
    priceDisplay: '$9.99/month',
    overagePricePerMillionTokens: 1000, // $10 per 1M tokens
    allowedModels: [
      'gpt-4o-mini',
      'gpt-4o',
      'claude-3-5-haiku-20241022',
      'claude-sonnet-4-20250514',
    ],
    allowOverage: true,
    features: [
      '100,000 tokens/month',
      'Access to GPT-4o & Claude Sonnet',
      '20 requests/minute',
      '500 requests/day',
      'Pay-as-you-go overage',
    ],
    revenueCatEntitlement: 'premium', // Starter plan is granted by premium entitlement
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    description: 'For professionals and growing teams',
    includedTokensPerMonth: 1_000_000, // 1M tokens
    requestsPerMinute: 60,
    requestsPerDay: 5000,
    priceCents: 4999, // $49.99/month
    priceDisplay: '$49.99/month',
    overagePricePerMillionTokens: 800, // $8 per 1M tokens (20% discount)
    allowedModels: [
      'gpt-4o-mini',
      'gpt-4o',
      'gpt-4-turbo',
      'claude-3-5-haiku-20241022',
      'claude-sonnet-4-20250514',
      'claude-3-opus-20240229',
    ],
    allowOverage: true,
    features: [
      '1,000,000 tokens/month',
      'Access to all AI models',
      '60 requests/minute',
      '5,000 requests/day',
      'Discounted overage rates',
      'Priority support',
    ],
    revenueCatEntitlement: 'pro', // Pro-specific entitlement
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Custom solutions for large organizations',
    includedTokensPerMonth: 10_000_000, // 10M tokens
    requestsPerMinute: 120,
    requestsPerDay: 50000,
    priceCents: 29999, // $299.99/month
    priceDisplay: '$299.99/month',
    overagePricePerMillionTokens: 500, // $5 per 1M tokens (50% discount)
    allowedModels: [
      'gpt-4o-mini',
      'gpt-4o',
      'gpt-4-turbo',
      'gpt-3.5-turbo',
      'claude-3-5-haiku-20241022',
      'claude-sonnet-4-20250514',
      'claude-3-opus-20240229',
    ],
    allowOverage: true,
    features: [
      '10,000,000 tokens/month',
      'All models + early access',
      '120 requests/minute',
      '50,000 requests/day',
      'Best overage rates',
      'Priority support',
      'Custom integrations',
    ],
    revenueCatEntitlement: 'enterprise', // Enterprise-specific entitlement
  },
};

/**
 * Token packs for one-time purchases (overage or top-up)
 *
 * Create these as non-subscription products in RevenueCat dashboard.
 * Configure them in App Store Connect / Play Console first.
 */
export const TOKEN_PACKS = {
  small: {
    id: 'token_pack_100k',
    name: '100K Token Pack',
    tokens: 100_000,
    priceCents: 999, // $9.99
    priceDisplay: '$9.99',
  },
  medium: {
    id: 'token_pack_500k',
    name: '500K Token Pack',
    tokens: 500_000,
    priceCents: 3999, // $39.99 (20% discount)
    priceDisplay: '$39.99',
    savings: '20% off',
  },
  large: {
    id: 'token_pack_1m',
    name: '1M Token Pack',
    tokens: 1_000_000,
    priceCents: 6999, // $69.99 (30% discount)
    priceDisplay: '$69.99',
    savings: '30% off',
  },
};

/**
 * AI model pricing reference (per 1M tokens, in cents)
 *
 * These prices are for reference and cost calculation.
 * Update based on actual provider pricing.
 */
export const AI_MODEL_PRICING = {
  // Anthropic Claude models
  'claude-sonnet-4-20250514': {
    name: 'Claude Sonnet 4',
    provider: 'anthropic',
    inputPrice: 300, // $3.00 per 1M input tokens
    outputPrice: 1500, // $15.00 per 1M output tokens
  },
  'claude-3-5-sonnet-20241022': {
    name: 'Claude 3.5 Sonnet',
    provider: 'anthropic',
    inputPrice: 300,
    outputPrice: 1500,
  },
  'claude-3-5-haiku-20241022': {
    name: 'Claude 3.5 Haiku',
    provider: 'anthropic',
    inputPrice: 80, // $0.80 per 1M input tokens
    outputPrice: 40, // $0.40 per 1M output tokens
  },
  'claude-3-opus-20240229': {
    name: 'Claude 3 Opus',
    provider: 'anthropic',
    inputPrice: 1500, // $15.00 per 1M input tokens
    outputPrice: 7500, // $75.00 per 1M output tokens
  },
  // OpenAI models
  'gpt-4o': {
    name: 'GPT-4o',
    provider: 'openai',
    inputPrice: 250, // $2.50 per 1M input tokens
    outputPrice: 1000, // $10.00 per 1M output tokens
  },
  'gpt-4o-mini': {
    name: 'GPT-4o Mini',
    provider: 'openai',
    inputPrice: 15, // $0.15 per 1M input tokens
    outputPrice: 60, // $0.60 per 1M output tokens
  },
  'gpt-4-turbo': {
    name: 'GPT-4 Turbo',
    provider: 'openai',
    inputPrice: 1000, // $10.00 per 1M input tokens
    outputPrice: 3000, // $30.00 per 1M output tokens
  },
  'gpt-3.5-turbo': {
    name: 'GPT-3.5 Turbo',
    provider: 'openai',
    inputPrice: 50, // $0.50 per 1M input tokens
    outputPrice: 150, // $1.50 per 1M output tokens
  },
} as const;

export type AIModelId = keyof typeof AI_MODEL_PRICING;

/**
 * Default AI model to use when none specified
 */
export const DEFAULT_AI_MODEL: AIModelId = 'claude-sonnet-4-20250514';

/**
 * Helper to format token count for display
 */
export function formatTokenCount(tokens: number): string {
  if (tokens >= 1_000_000) {
    return `${(tokens / 1_000_000).toFixed(1)}M`;
  }
  if (tokens >= 1_000) {
    return `${(tokens / 1_000).toFixed(0)}K`;
  }
  return tokens.toString();
}

/**
 * Helper to calculate estimated cost for tokens
 */
export function calculateTokenCost(
  modelId: AIModelId,
  inputTokens: number,
  outputTokens: number
): number {
  const model = AI_MODEL_PRICING[modelId];
  if (!model) return 0;

  const inputCost = (inputTokens * model.inputPrice) / 1_000_000;
  const outputCost = (outputTokens * model.outputPrice) / 1_000_000;

  return Math.ceil(inputCost + outputCost); // Round up to nearest cent
}
