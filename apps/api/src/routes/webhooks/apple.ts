import { Hono } from 'hono';
import type { Env, Variables } from '../../types/env';
import { createDb } from '../../db';
import { SubscriptionService } from '../../services/subscription.service';
import { createAppStoreService } from '../../services/appstore.service';
import { subscriptions, users } from '../../db/schema';
import { eq } from 'drizzle-orm';

/**
 * Apple App Store Server Notifications Webhook Handler
 * Handles subscription lifecycle events from Apple
 *
 * @see https://developer.apple.com/documentation/appstoreservernotifications
 */

const appleWebhook = new Hono<{ Bindings: Env; Variables: Variables }>();

// Notification types from Apple
type NotificationType =
  | 'CONSUMPTION_REQUEST'
  | 'DID_CHANGE_RENEWAL_PREF'
  | 'DID_CHANGE_RENEWAL_STATUS'
  | 'DID_FAIL_TO_RENEW'
  | 'DID_RENEW'
  | 'EXPIRED'
  | 'GRACE_PERIOD_EXPIRED'
  | 'OFFER_REDEEMED'
  | 'PRICE_INCREASE'
  | 'REFUND'
  | 'REFUND_DECLINED'
  | 'REFUND_REVERSED'
  | 'RENEWAL_EXTENDED'
  | 'RENEWAL_EXTENSION'
  | 'REVOKE'
  | 'SUBSCRIBED'
  | 'TEST';

interface AppleNotificationPayload {
  notificationType: NotificationType;
  subtype?: string;
  notificationUUID: string;
  data: {
    appAppleId: number;
    bundleId: string;
    bundleVersion: string;
    environment: 'Sandbox' | 'Production';
    signedTransactionInfo: string;
    signedRenewalInfo?: string;
  };
  version: string;
  signedDate: number;
}

interface DecodedTransactionInfo {
  transactionId: string;
  originalTransactionId: string;
  productId: string;
  purchaseDate: number;
  expiresDate?: number;
  type: string;
  inAppOwnershipType: string;
  signedDate: number;
  environment: string;
  revocationDate?: number;
  revocationReason?: number;
}

interface DecodedRenewalInfo {
  autoRenewProductId: string;
  autoRenewStatus: number;
  expirationIntent?: number;
  gracePeriodExpiresDate?: number;
  isInBillingRetryPeriod?: boolean;
  originalTransactionId: string;
  productId: string;
  renewalDate?: number;
  signedDate: number;
}

/**
 * Decode a JWS (JSON Web Signature) from Apple
 * In production, you should verify the signature using Apple's certificates
 */
function decodeJWS<T>(jws: string): T {
  const parts = jws.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid JWS format');
  }
  return JSON.parse(atob(parts[1])) as T;
}

// Handle Apple Server Notifications V2
appleWebhook.post('/', async (c) => {
  try {
    const body = await c.req.json<{ signedPayload: string }>();

    if (!body.signedPayload) {
      console.error('Missing signedPayload in Apple webhook');
      return c.json({ error: 'Missing signedPayload' }, 400);
    }

    // Decode the notification payload
    // In production, verify the JWS signature using Apple's certificates
    const notification = decodeJWS<AppleNotificationPayload>(body.signedPayload);

    console.log('Apple notification received:', {
      type: notification.notificationType,
      subtype: notification.subtype,
      uuid: notification.notificationUUID,
    });

    // Handle test notifications
    if (notification.notificationType === 'TEST') {
      console.log('Test notification received from Apple');
      return c.json({ success: true });
    }

    // Decode transaction info
    const transactionInfo = decodeJWS<DecodedTransactionInfo>(
      notification.data.signedTransactionInfo
    );

    // Decode renewal info if present
    const renewalInfo = notification.data.signedRenewalInfo
      ? decodeJWS<DecodedRenewalInfo>(notification.data.signedRenewalInfo)
      : null;

    const db = createDb(c.env.DB);
    const subscriptionService = new SubscriptionService(db);

    // Find the subscription by original transaction ID
    const existingSubscription =
      await subscriptionService.getSubscriptionByTransactionId(
        transactionInfo.originalTransactionId
      );

    if (!existingSubscription) {
      console.log(
        'No subscription found for transaction:',
        transactionInfo.originalTransactionId
      );
      // Return success anyway - Apple expects 200
      return c.json({ success: true });
    }

    // Handle different notification types
    switch (notification.notificationType) {
      case 'SUBSCRIBED':
        // New subscription or resubscription
        await subscriptionService.updateSubscription(existingSubscription.id, {
          status: 'active',
          productId: transactionInfo.productId,
          currentPeriodStart: new Date(transactionInfo.purchaseDate),
          currentPeriodEnd: transactionInfo.expiresDate
            ? new Date(transactionInfo.expiresDate)
            : undefined,
          expiresAt: transactionInfo.expiresDate
            ? new Date(transactionInfo.expiresDate)
            : undefined,
        });
        break;

      case 'DID_RENEW':
        // Subscription successfully renewed
        await subscriptionService.updateSubscription(existingSubscription.id, {
          status: 'active',
          currentPeriodStart: new Date(transactionInfo.purchaseDate),
          currentPeriodEnd: transactionInfo.expiresDate
            ? new Date(transactionInfo.expiresDate)
            : undefined,
          expiresAt: transactionInfo.expiresDate
            ? new Date(transactionInfo.expiresDate)
            : undefined,
        });
        break;

      case 'EXPIRED':
        // Subscription expired
        await subscriptionService.updateSubscription(existingSubscription.id, {
          status: 'expired',
        });
        break;

      case 'DID_FAIL_TO_RENEW':
        // Billing issue - subscription is in retry or grace period
        if (notification.subtype === 'GRACE_PERIOD') {
          // Still in grace period - keep active
          console.log('Subscription in grace period');
        } else {
          // In billing retry
          console.log('Subscription in billing retry');
        }
        break;

      case 'GRACE_PERIOD_EXPIRED':
        // Grace period ended without successful billing
        await subscriptionService.updateSubscription(existingSubscription.id, {
          status: 'expired',
        });
        break;

      case 'DID_CHANGE_RENEWAL_STATUS':
        // User enabled/disabled auto-renew
        if (notification.subtype === 'AUTO_RENEW_DISABLED') {
          // User will not renew - mark as cancelled but still active
          await subscriptionService.updateSubscription(existingSubscription.id, {
            cancelledAt: new Date(),
          });
        } else if (notification.subtype === 'AUTO_RENEW_ENABLED') {
          // User re-enabled auto-renew
          // Clear cancelled status if needed
        }
        break;

      case 'DID_CHANGE_RENEWAL_PREF':
        // User changed to a different subscription tier
        if (renewalInfo) {
          console.log('User changing to product:', renewalInfo.autoRenewProductId);
        }
        break;

      case 'REFUND':
        // Refund granted
        await subscriptionService.updateSubscription(existingSubscription.id, {
          status: 'expired',
        });
        break;

      case 'REVOKE':
        // Subscription revoked (family sharing removed, etc.)
        await subscriptionService.updateSubscription(existingSubscription.id, {
          status: 'expired',
        });
        break;

      case 'OFFER_REDEEMED':
        // Promotional offer redeemed
        console.log('Offer redeemed:', transactionInfo.productId);
        break;

      case 'RENEWAL_EXTENDED':
        // Subscription extended (customer support action)
        if (transactionInfo.expiresDate) {
          await subscriptionService.updateSubscription(existingSubscription.id, {
            expiresAt: new Date(transactionInfo.expiresDate),
          });
        }
        break;

      case 'PRICE_INCREASE':
        // Price increase notification
        console.log('Price increase notification');
        break;

      default:
        console.log('Unhandled notification type:', notification.notificationType);
    }

    return c.json({ success: true });
  } catch (error) {
    console.error('Error processing Apple webhook:', error);
    // Return 200 to prevent Apple from retrying
    return c.json({ success: false, error: 'Processing failed' });
  }
});

export { appleWebhook };
