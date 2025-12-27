/**
 * TypeScript type definitions for Usage-Based Billing
 *
 * This module provides types for tracking AI usage, quotas, and billing.
 */

/**
 * Supported AI models with their pricing (per 1M tokens in cents)
 * Prices are approximate and should be updated based on actual provider pricing
 */
export const AI_MODEL_PRICING = {
  // Anthropic Claude models
  'claude-sonnet-4-20250514': { input: 300, output: 1500 }, // $3/$15 per 1M
  'claude-3-5-sonnet-20241022': { input: 300, output: 1500 },
  'claude-3-5-haiku-20241022': { input: 80, output: 40 }, // $0.80/$0.40 per 1M
  'claude-3-opus-20240229': { input: 1500, output: 7500 }, // $15/$75 per 1M

  // OpenAI models
  'gpt-4o': { input: 250, output: 1000 }, // $2.50/$10 per 1M
  'gpt-4o-mini': { input: 15, output: 60 }, // $0.15/$0.60 per 1M
  'gpt-4-turbo': { input: 1000, output: 3000 }, // $10/$30 per 1M
  'gpt-3.5-turbo': { input: 50, output: 150 }, // $0.50/$1.50 per 1M
} as const;

export type SupportedModel = keyof typeof AI_MODEL_PRICING;

/**
 * Usage event types
 */
export type UsageEventType =
  | 'ai_chat' // Standard AI chat
  | 'ai_chat_premium' // Premium AI chat with model selection
  | 'ai_generate' // Text generation
  | 'api_call'; // Generic API call

/**
 * Plan tiers with included usage
 */
export type PlanId = 'free' | 'starter' | 'pro' | 'enterprise';

/**
 * Plan configuration with token limits and pricing
 */
export interface PlanConfig {
  id: PlanId;
  name: string;
  description: string;
  // Token limits
  includedTokensPerMonth: number;
  // Rate limits
  requestsPerMinute: number;
  requestsPerDay: number;
  // Pricing
  basePriceCents: number; // Monthly base price in cents
  overagePricePerMillionTokens: number; // Price per 1M tokens over limit
  // Features
  allowedModels: SupportedModel[];
  allowOverage: boolean;
  prioritySupport: boolean;
}

/**
 * Default plan configurations
 */
export const USAGE_PLANS: Record<PlanId, PlanConfig> = {
  free: {
    id: 'free',
    name: 'Free',
    description: 'Try AI features with limited usage',
    includedTokensPerMonth: 10_000, // 10K tokens
    requestsPerMinute: 5,
    requestsPerDay: 50,
    basePriceCents: 0,
    overagePricePerMillionTokens: 0, // No overage allowed
    allowedModels: ['gpt-4o-mini', 'claude-3-5-haiku-20241022'],
    allowOverage: false,
    prioritySupport: false,
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    description: 'For individuals and small projects',
    includedTokensPerMonth: 100_000, // 100K tokens
    requestsPerMinute: 20,
    requestsPerDay: 500,
    basePriceCents: 999, // $9.99/month
    overagePricePerMillionTokens: 1000, // $10 per 1M tokens
    allowedModels: [
      'gpt-4o-mini',
      'gpt-4o',
      'claude-3-5-haiku-20241022',
      'claude-sonnet-4-20250514',
    ],
    allowOverage: true,
    prioritySupport: false,
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    description: 'For professionals and growing teams',
    includedTokensPerMonth: 1_000_000, // 1M tokens
    requestsPerMinute: 60,
    requestsPerDay: 5000,
    basePriceCents: 4999, // $49.99/month
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
    prioritySupport: true,
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Custom solutions for large organizations',
    includedTokensPerMonth: 10_000_000, // 10M tokens
    requestsPerMinute: 120,
    requestsPerDay: 50000,
    basePriceCents: 29999, // $299.99/month
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
    prioritySupport: true,
  },
};

/**
 * Individual usage event record
 */
export interface UsageEvent {
  id: string;
  userId: string;
  eventType: UsageEventType;
  modelId: string | null;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  costCents: number;
  endpoint: string | null;
  metadata: Record<string, unknown> | null;
  billingPeriodStart: string | null;
  createdAt: string;
}

/**
 * User quota/limit status
 */
export interface UsageQuota {
  id: string;
  userId: string;
  planId: PlanId;
  billingPeriodStart: string;
  billingPeriodEnd: string;
  // Token usage
  includedTokens: number;
  usedTokens: number;
  overageTokens: number;
  remainingTokens: number; // Computed
  usagePercentage: number; // Computed (0-100+)
  // Cost
  baseCostCents: number;
  overageCostCents: number;
  totalCostCents: number;
  // Rate limits
  requestsPerMinute: number;
  requestsPerDay: number;
  currentMinuteRequests: number;
  currentDayRequests: number;
  // Status
  isOverLimit: boolean;
  allowOverage: boolean;
}

/**
 * Response from usage quota endpoint
 */
export interface UsageQuotaResponse {
  quota: UsageQuota;
  plan: PlanConfig;
  canMakeRequest: boolean;
  rateLimitReason: string | null;
}

/**
 * Usage summary for a billing period
 */
export interface UsageSummary {
  userId: string;
  billingPeriodStart: string;
  billingPeriodEnd: string;
  // Aggregated stats
  totalRequests: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalTokens: number;
  totalCostCents: number;
  // Breakdown by model
  byModel: Record<
    string,
    {
      requests: number;
      inputTokens: number;
      outputTokens: number;
      totalTokens: number;
      costCents: number;
    }
  >;
  // Breakdown by day
  byDay: Array<{
    date: string;
    requests: number;
    totalTokens: number;
    costCents: number;
  }>;
}

/**
 * Response from usage history endpoint
 */
export interface UsageHistoryResponse {
  events: UsageEvent[];
  summary: UsageSummary;
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
  };
}

/**
 * Request to track usage (internal)
 */
export interface TrackUsageRequest {
  userId: string;
  eventType: UsageEventType;
  modelId?: string;
  inputTokens?: number;
  outputTokens?: number;
  endpoint?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Rate limit check result
 */
export interface RateLimitResult {
  allowed: boolean;
  reason: string | null;
  retryAfterSeconds: number | null;
  currentUsage: {
    minuteRequests: number;
    dayRequests: number;
    tokensUsed: number;
  };
  limits: {
    requestsPerMinute: number;
    requestsPerDay: number;
    tokensPerMonth: number;
  };
}

/**
 * Dodo Payments usage product configuration
 * Note: You don't need separate products for each AI model.
 * Instead, create usage products for token bundles or tiers.
 */
export interface DodoUsageProduct {
  productId: string;
  name: string;
  type: 'usage' | 'subscription';
  // For usage products
  unitName?: string; // e.g., "tokens", "API calls"
  pricePerUnit?: number; // Price in cents per unit
  // For subscription products with included usage
  includedUnits?: number;
  overagePrice?: number;
}

/**
 * Recommended Dodo product setup for usage billing
 */
export const RECOMMENDED_DODO_PRODUCTS = {
  // Subscription products (monthly recurring)
  subscriptions: {
    starter: {
      name: 'Starter Plan',
      description: 'Includes 100K tokens/month',
      price: 999, // $9.99
      interval: 'month',
    },
    pro: {
      name: 'Pro Plan',
      description: 'Includes 1M tokens/month',
      price: 4999, // $49.99
      interval: 'month',
    },
    enterprise: {
      name: 'Enterprise Plan',
      description: 'Includes 10M tokens/month',
      price: 29999, // $299.99
      interval: 'month',
    },
  },
  // Token pack products (one-time purchase for overages)
  tokenPacks: {
    small: {
      name: '100K Token Pack',
      description: 'One-time purchase of 100,000 tokens',
      price: 999, // $9.99
      tokens: 100_000,
    },
    medium: {
      name: '500K Token Pack',
      description: 'One-time purchase of 500,000 tokens',
      price: 3999, // $39.99 (20% discount)
      tokens: 500_000,
    },
    large: {
      name: '1M Token Pack',
      description: 'One-time purchase of 1,000,000 tokens',
      price: 6999, // $69.99 (30% discount)
      tokens: 1_000_000,
    },
  },
};

/**
 * Helper to calculate cost for a given model and token count
 */
export function calculateUsageCost(
  modelId: string,
  inputTokens: number,
  outputTokens: number
): number {
  const pricing = AI_MODEL_PRICING[modelId as SupportedModel];
  if (!pricing) {
    // Default to a middle-tier price if model not found
    return Math.ceil((inputTokens * 100 + outputTokens * 300) / 1_000_000);
  }

  const inputCost = (inputTokens * pricing.input) / 1_000_000;
  const outputCost = (outputTokens * pricing.output) / 1_000_000;

  return Math.ceil(inputCost + outputCost); // Round up to nearest cent
}

/**
 * Helper to get billing period dates
 */
export function getBillingPeriod(date: Date = new Date()): {
  start: Date;
  end: Date;
} {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
}
