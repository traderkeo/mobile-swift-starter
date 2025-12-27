import { eq, and } from 'drizzle-orm';
import type { Database } from '../db';
import { subscriptions, receipts, type Subscription } from '../db/schema';
import { Errors } from '../lib/errors';
import { ErrorCodes } from '@starter/shared';
import { generateId } from '../lib/utils';

export interface SubscriptionDetails {
  id: string;
  productId: string;
  platform: 'ios' | 'web';
  status: 'active' | 'expired' | 'cancelled' | 'trial' | 'pending';
  currentPeriodStart: Date;
  currentPeriodEnd: Date | null;
  cancelledAt: Date | null;
  expiresAt: Date | null;
  isActive: boolean;
}

export interface CreateSubscriptionInput {
  userId: string;
  productId: string;
  platform: 'ios' | 'web';
  status: 'active' | 'expired' | 'cancelled' | 'trial' | 'pending';
  originalTransactionId?: string;
  stripeSubscriptionId?: string;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  expiresAt?: Date;
}

export class SubscriptionService {
  constructor(private db: Database) {}

  async getSubscription(userId: string): Promise<SubscriptionDetails | null> {
    const subscription = await this.db.query.subscriptions.findFirst({
      where: eq(subscriptions.userId, userId),
    });

    if (!subscription) {
      return null;
    }

    const isActive =
      subscription.status === 'active' &&
      (!subscription.expiresAt || subscription.expiresAt > new Date());

    return {
      id: subscription.id,
      productId: subscription.productId,
      platform: subscription.platform,
      status: subscription.status,
      currentPeriodStart: subscription.currentPeriodStart,
      currentPeriodEnd: subscription.currentPeriodEnd,
      cancelledAt: subscription.cancelledAt,
      expiresAt: subscription.expiresAt,
      isActive,
    };
  }

  async createSubscription(
    input: CreateSubscriptionInput
  ): Promise<SubscriptionDetails> {
    // Check if user already has a subscription
    const existing = await this.db.query.subscriptions.findFirst({
      where: eq(subscriptions.userId, input.userId),
    });

    if (existing) {
      // Update existing subscription
      const updated = await this.updateSubscription(existing.id, {
        productId: input.productId,
        status: input.status,
        originalTransactionId: input.originalTransactionId,
        stripeSubscriptionId: input.stripeSubscriptionId,
        currentPeriodStart: input.currentPeriodStart,
        currentPeriodEnd: input.currentPeriodEnd,
        expiresAt: input.expiresAt,
      });
      return updated;
    }

    const now = new Date();
    const subscriptionId = generateId();

    await this.db.insert(subscriptions).values({
      id: subscriptionId,
      userId: input.userId,
      productId: input.productId,
      platform: input.platform,
      status: input.status,
      originalTransactionId: input.originalTransactionId || null,
      stripeSubscriptionId: input.stripeSubscriptionId || null,
      currentPeriodStart: input.currentPeriodStart || now,
      currentPeriodEnd: input.currentPeriodEnd || null,
      expiresAt: input.expiresAt || null,
      createdAt: now,
      updatedAt: now,
    });

    return this.getSubscription(input.userId) as Promise<SubscriptionDetails>;
  }

  async updateSubscription(
    subscriptionId: string,
    data: Partial<{
      productId: string;
      status: 'active' | 'expired' | 'cancelled' | 'trial' | 'pending';
      originalTransactionId: string;
      stripeSubscriptionId: string;
      currentPeriodStart: Date;
      currentPeriodEnd: Date;
      cancelledAt: Date;
      expiresAt: Date;
    }>
  ): Promise<SubscriptionDetails> {
    const subscription = await this.db.query.subscriptions.findFirst({
      where: eq(subscriptions.id, subscriptionId),
    });

    if (!subscription) {
      throw Errors.notFound(ErrorCodes.SUBSCRIPTION_NOT_FOUND);
    }

    await this.db
      .update(subscriptions)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.id, subscriptionId));

    return this.getSubscription(subscription.userId) as Promise<SubscriptionDetails>;
  }

  async cancelSubscription(userId: string): Promise<SubscriptionDetails> {
    const subscription = await this.db.query.subscriptions.findFirst({
      where: eq(subscriptions.userId, userId),
    });

    if (!subscription) {
      throw Errors.notFound(ErrorCodes.SUBSCRIPTION_NOT_FOUND);
    }

    const now = new Date();

    await this.db
      .update(subscriptions)
      .set({
        status: 'cancelled',
        cancelledAt: now,
        updatedAt: now,
      })
      .where(eq(subscriptions.id, subscription.id));

    return this.getSubscription(userId) as Promise<SubscriptionDetails>;
  }

  async storeReceipt(
    userId: string,
    receiptData: string,
    transactionId: string,
    platform: 'ios' | 'web'
  ): Promise<void> {
    const receiptId = generateId();
    const now = new Date();

    await this.db.insert(receipts).values({
      id: receiptId,
      userId,
      platform,
      transactionId,
      receiptData,
      verified: false,
      createdAt: now,
    });
  }

  async markReceiptVerified(transactionId: string): Promise<void> {
    await this.db
      .update(receipts)
      .set({ verified: true })
      .where(eq(receipts.transactionId, transactionId));
  }

  async getSubscriptionByTransactionId(
    transactionId: string
  ): Promise<SubscriptionDetails | null> {
    const subscription = await this.db.query.subscriptions.findFirst({
      where: eq(subscriptions.originalTransactionId, transactionId),
    });

    if (!subscription) {
      return null;
    }

    const isActive =
      subscription.status === 'active' &&
      (!subscription.expiresAt || subscription.expiresAt > new Date());

    return {
      id: subscription.id,
      productId: subscription.productId,
      platform: subscription.platform,
      status: subscription.status,
      currentPeriodStart: subscription.currentPeriodStart,
      currentPeriodEnd: subscription.currentPeriodEnd,
      cancelledAt: subscription.cancelledAt,
      expiresAt: subscription.expiresAt,
      isActive,
    };
  }

  async getSubscriptionByStripeId(
    stripeSubscriptionId: string
  ): Promise<SubscriptionDetails | null> {
    const subscription = await this.db.query.subscriptions.findFirst({
      where: eq(subscriptions.stripeSubscriptionId, stripeSubscriptionId),
    });

    if (!subscription) {
      return null;
    }

    const isActive =
      subscription.status === 'active' &&
      (!subscription.expiresAt || subscription.expiresAt > new Date());

    return {
      id: subscription.id,
      productId: subscription.productId,
      platform: subscription.platform,
      status: subscription.status,
      currentPeriodStart: subscription.currentPeriodStart,
      currentPeriodEnd: subscription.currentPeriodEnd,
      cancelledAt: subscription.cancelledAt,
      expiresAt: subscription.expiresAt,
      isActive,
    };
  }
}
