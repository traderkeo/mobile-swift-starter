/**
 * Payment and Subscription Types
 * Shared types for RevenueCat payment flows
 */

/**
 * Payment status from RevenueCat/backend
 */
export type PaymentStatus =
  | 'succeeded'
  | 'failed'
  | 'pending'
  | 'refunded'
  | 'active'
  | 'cancelled';

/**
 * Subscription status values
 */
export type SubscriptionStatusValue =
  | 'active'
  | 'inactive'
  | 'cancelled'
  | 'past_due'
  | 'on_trial'
  | 'expired';

/**
 * Individual subscription record
 */
export interface Subscription {
  id: string;
  userId: string;
  productId: string;
  status: SubscriptionStatusValue;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  cancelledAt: string | null;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

/**
 * Subscription status response from backend
 */
export interface SubscriptionStatus {
  hasActiveSubscription: boolean;
  subscription: Subscription | null;
}

/**
 * Individual payment record
 */
export interface Payment {
  id: string;
  userId: string;
  subscriptionId: string | null;
  productId: string;
  amount: number;
  tax: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: string | null;
  cardLast4: string | null;
  cardBrand: string | null;
  receiptUrl: string | null;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

/**
 * Payment history response from backend
 */
export interface PaymentHistory {
  payments: Payment[];
}

/**
 * Usage quota information
 */
export interface UsageQuota {
  planId: string;
  billingPeriodStart: string;
  billingPeriodEnd: string;
  includedTokens: number;
  usedTokens: number;
  remainingTokens: number;
  overageTokens: number;
  isOverLimit: boolean;
  allowOverage: boolean;
  requestsPerMinute: number;
  requestsPerDay: number;
  currentMinuteRequests: number;
  currentDayRequests: number;
}

/**
 * Usage summary for display
 */
export interface UsageSummary {
  totalRequests: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalTokens: number;
  totalCostCents: number;
  byModel: {
    modelId: string;
    requests: number;
    inputTokens: number;
    outputTokens: number;
    costCents: number;
  }[];
}
