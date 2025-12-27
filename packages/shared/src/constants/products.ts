/**
 * Product IDs for in-app purchases
 * These should match the IDs configured in App Store Connect and Stripe
 */
export const ProductIds = {
  // Subscriptions
  MONTHLY_PREMIUM: 'com.starter.premium.monthly',
  YEARLY_PREMIUM: 'com.starter.premium.yearly',
  LIFETIME_PREMIUM: 'com.starter.premium.lifetime',
} as const;

export type ProductId = (typeof ProductIds)[keyof typeof ProductIds];

/**
 * Product display information
 */
export const Products = {
  [ProductIds.MONTHLY_PREMIUM]: {
    id: ProductIds.MONTHLY_PREMIUM,
    name: 'Monthly Premium',
    description: 'Full access to all premium features',
    type: 'subscription' as const,
    period: 'month' as const,
  },
  [ProductIds.YEARLY_PREMIUM]: {
    id: ProductIds.YEARLY_PREMIUM,
    name: 'Yearly Premium',
    description: 'Best value - Save 33%',
    type: 'subscription' as const,
    period: 'year' as const,
    badge: 'Best Value',
  },
  [ProductIds.LIFETIME_PREMIUM]: {
    id: ProductIds.LIFETIME_PREMIUM,
    name: 'Lifetime Premium',
    description: 'One-time purchase, forever access',
    type: 'non-consumable' as const,
  },
} as const;

/**
 * Premium features list for marketing
 */
export const PremiumFeatures = [
  { icon: 'checkmark.circle.fill', text: 'Unlimited usage' },
  { icon: 'bolt.fill', text: 'Priority support' },
  { icon: 'icloud.fill', text: 'Cloud sync' },
  { icon: 'nosign', text: 'No ads' },
  { icon: 'sparkles', text: 'Exclusive features' },
] as const;
