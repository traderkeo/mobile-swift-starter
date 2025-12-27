import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { Env, Variables } from '../types/env';
import { createDb } from '../db';
import { SubscriptionService } from '../services/subscription.service';
import { authMiddleware } from '../middleware/auth';

const subscriptions = new Hono<{ Bindings: Env; Variables: Variables }>();

// Validation schemas
const verifyReceiptSchema = z.object({
  receiptData: z.string().min(1, 'Receipt data is required'),
  transactionId: z.string().min(1, 'Transaction ID is required'),
  productId: z.string().min(1, 'Product ID is required'),
});

// All subscription routes require authentication
subscriptions.use('/*', authMiddleware);

// Get current subscription
subscriptions.get('/', async (c) => {
  const userId = c.get('userId')!;
  const db = createDb(c.env.DB);
  const subscriptionService = new SubscriptionService(db);

  const subscription = await subscriptionService.getSubscription(userId);

  return c.json({
    success: true,
    data: subscription,
  });
});

// Verify iOS receipt and activate subscription
subscriptions.post(
  '/verify-receipt',
  zValidator('json', verifyReceiptSchema),
  async (c) => {
    const userId = c.get('userId')!;
    const { receiptData, transactionId, productId } = c.req.valid('json');
    const db = createDb(c.env.DB);
    const subscriptionService = new SubscriptionService(db);

    // Store the receipt
    await subscriptionService.storeReceipt(
      userId,
      receiptData,
      transactionId,
      'ios'
    );

    // TODO: Verify receipt with Apple's server
    // For now, we'll trust the receipt and create the subscription
    // In production, implement proper App Store Server API verification

    // Create or update subscription
    const subscription = await subscriptionService.createSubscription({
      userId,
      productId,
      platform: 'ios',
      status: 'active',
      originalTransactionId: transactionId,
      currentPeriodStart: new Date(),
      // Set expiry based on product duration (monthly = 30 days, yearly = 365 days)
      expiresAt: getExpiryFromProduct(productId),
    });

    // Mark receipt as verified
    await subscriptionService.markReceiptVerified(transactionId);

    return c.json({
      success: true,
      data: subscription,
    });
  }
);

// Restore purchases
subscriptions.post('/restore', async (c) => {
  const userId = c.get('userId')!;
  const db = createDb(c.env.DB);
  const subscriptionService = new SubscriptionService(db);

  // Get existing subscription
  const subscription = await subscriptionService.getSubscription(userId);

  if (!subscription) {
    return c.json({
      success: true,
      data: null,
      message: 'No previous purchases found',
    });
  }

  return c.json({
    success: true,
    data: subscription,
    message: subscription.isActive
      ? 'Subscription restored successfully'
      : 'Previous subscription found but expired',
  });
});

// Cancel subscription
subscriptions.post('/cancel', async (c) => {
  const userId = c.get('userId')!;
  const db = createDb(c.env.DB);
  const subscriptionService = new SubscriptionService(db);

  const subscription = await subscriptionService.cancelSubscription(userId);

  return c.json({
    success: true,
    data: subscription,
    message: 'Subscription cancelled. Access continues until the end of the billing period.',
  });
});

// Helper function to calculate expiry date based on product ID
function getExpiryFromProduct(productId: string): Date {
  const now = new Date();

  // Determine subscription duration based on product ID naming convention
  if (productId.includes('yearly') || productId.includes('annual')) {
    now.setFullYear(now.getFullYear() + 1);
  } else if (productId.includes('monthly')) {
    now.setMonth(now.getMonth() + 1);
  } else if (productId.includes('weekly')) {
    now.setDate(now.getDate() + 7);
  } else {
    // Default to monthly
    now.setMonth(now.getMonth() + 1);
  }

  return now;
}

export { subscriptions };
