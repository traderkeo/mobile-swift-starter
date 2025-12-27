import { Hono } from 'hono';
import type { Env, Variables } from '../../types/env';
import { createDb } from '../../db';
import { SubscriptionService } from '../../services/subscription.service';
import { users } from '../../db/schema';
import { eq } from 'drizzle-orm';

/**
 * Stripe Webhook Handler
 * Handles subscription lifecycle events from Stripe
 *
 * @see https://stripe.com/docs/webhooks
 */

const stripeWebhook = new Hono<{ Bindings: Env; Variables: Variables }>();

// Stripe event types we handle
type StripeEventType =
  | 'checkout.session.completed'
  | 'customer.subscription.created'
  | 'customer.subscription.updated'
  | 'customer.subscription.deleted'
  | 'customer.subscription.paused'
  | 'customer.subscription.resumed'
  | 'customer.subscription.pending_update_applied'
  | 'customer.subscription.pending_update_expired'
  | 'customer.subscription.trial_will_end'
  | 'invoice.paid'
  | 'invoice.payment_failed'
  | 'invoice.payment_action_required'
  | 'payment_intent.succeeded'
  | 'payment_intent.payment_failed';

interface StripeEvent {
  id: string;
  object: 'event';
  type: StripeEventType;
  data: {
    object: Record<string, unknown>;
    previous_attributes?: Record<string, unknown>;
  };
  created: number;
  livemode: boolean;
}

interface StripeSubscription {
  id: string;
  customer: string;
  status:
    | 'active'
    | 'past_due'
    | 'unpaid'
    | 'canceled'
    | 'incomplete'
    | 'incomplete_expired'
    | 'trialing'
    | 'paused';
  current_period_start: number;
  current_period_end: number;
  cancel_at_period_end: boolean;
  canceled_at: number | null;
  ended_at: number | null;
  trial_start: number | null;
  trial_end: number | null;
  items: {
    data: Array<{
      id: string;
      price: {
        id: string;
        product: string;
      };
    }>;
  };
  metadata: Record<string, string>;
}

interface StripeCheckoutSession {
  id: string;
  customer: string;
  subscription: string;
  client_reference_id: string | null; // We store userId here
  metadata: Record<string, string>;
  mode: 'payment' | 'setup' | 'subscription';
}

interface StripeInvoice {
  id: string;
  customer: string;
  subscription: string;
  status: 'draft' | 'open' | 'paid' | 'uncollectible' | 'void';
  amount_paid: number;
  amount_due: number;
}

/**
 * Verify Stripe webhook signature
 */
async function verifyStripeSignature(
  payload: string,
  signature: string,
  secret: string
): Promise<boolean> {
  try {
    const parts = signature.split(',');
    const timestamp = parts.find((p) => p.startsWith('t='))?.slice(2);
    const signatures = parts
      .filter((p) => p.startsWith('v1='))
      .map((p) => p.slice(3));

    if (!timestamp || signatures.length === 0) {
      return false;
    }

    // Check timestamp is within 5 minutes
    const signedAt = parseInt(timestamp, 10) * 1000;
    if (Date.now() - signedAt > 300000) {
      console.error('Stripe webhook timestamp too old');
      return false;
    }

    // Generate expected signature
    const signedPayload = `${timestamp}.${payload}`;
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signatureBytes = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(signedPayload)
    );

    const expectedSignature = Array.from(new Uint8Array(signatureBytes))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    // Compare signatures
    return signatures.some((sig) => sig === expectedSignature);
  } catch (error) {
    console.error('Error verifying Stripe signature:', error);
    return false;
  }
}

/**
 * Map Stripe subscription status to our status
 */
function mapStripeStatus(
  stripeStatus: StripeSubscription['status']
): 'active' | 'expired' | 'cancelled' | 'trial' | 'pending' {
  switch (stripeStatus) {
    case 'active':
      return 'active';
    case 'trialing':
      return 'trial';
    case 'past_due':
    case 'unpaid':
      return 'pending';
    case 'canceled':
    case 'incomplete':
    case 'incomplete_expired':
    case 'paused':
      return 'cancelled';
    default:
      return 'expired';
  }
}

stripeWebhook.post('/', async (c) => {
  try {
    const signature = c.req.header('stripe-signature');

    if (!signature) {
      return c.json({ error: 'Missing signature' }, 400);
    }

    const payload = await c.req.text();

    // Verify webhook signature in production
    if (c.env.STRIPE_WEBHOOK_SECRET) {
      const isValid = await verifyStripeSignature(
        payload,
        signature,
        c.env.STRIPE_WEBHOOK_SECRET
      );

      if (!isValid) {
        console.error('Invalid Stripe webhook signature');
        return c.json({ error: 'Invalid signature' }, 401);
      }
    }

    const event = JSON.parse(payload) as StripeEvent;

    console.log('Stripe event received:', {
      type: event.type,
      id: event.id,
    });

    const db = createDb(c.env.DB);
    const subscriptionService = new SubscriptionService(db);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as StripeCheckoutSession;

        if (session.mode !== 'subscription') {
          break; // Only handle subscription checkouts
        }

        // Get userId from client_reference_id or metadata
        const userId =
          session.client_reference_id || session.metadata?.userId;

        if (!userId) {
          console.error('No userId in checkout session');
          break;
        }

        // Create subscription record
        await subscriptionService.createSubscription({
          userId,
          productId: 'stripe_subscription', // Will be updated from subscription event
          platform: 'web',
          status: 'active',
          stripeSubscriptionId: session.subscription,
        });
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as StripeSubscription;

        // Find subscription by Stripe ID
        const existingSubscription =
          await subscriptionService.getSubscriptionByStripeId(subscription.id);

        if (!existingSubscription) {
          // Try to find user by Stripe customer ID in metadata
          console.log(
            'No subscription found for Stripe subscription:',
            subscription.id
          );
          break;
        }

        const productId =
          subscription.items.data[0]?.price?.product || 'unknown';

        await subscriptionService.updateSubscription(existingSubscription.id, {
          productId:
            typeof productId === 'string' ? productId : 'stripe_product',
          status: mapStripeStatus(subscription.status),
          currentPeriodStart: new Date(
            subscription.current_period_start * 1000
          ),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          expiresAt: new Date(subscription.current_period_end * 1000),
          cancelledAt: subscription.canceled_at
            ? new Date(subscription.canceled_at * 1000)
            : undefined,
        });
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as StripeSubscription;

        const existingSubscription =
          await subscriptionService.getSubscriptionByStripeId(subscription.id);

        if (existingSubscription) {
          await subscriptionService.updateSubscription(existingSubscription.id, {
            status: 'expired',
          });
        }
        break;
      }

      case 'customer.subscription.paused': {
        const subscription = event.data.object as StripeSubscription;

        const existingSubscription =
          await subscriptionService.getSubscriptionByStripeId(subscription.id);

        if (existingSubscription) {
          await subscriptionService.updateSubscription(existingSubscription.id, {
            status: 'cancelled',
          });
        }
        break;
      }

      case 'customer.subscription.resumed': {
        const subscription = event.data.object as StripeSubscription;

        const existingSubscription =
          await subscriptionService.getSubscriptionByStripeId(subscription.id);

        if (existingSubscription) {
          await subscriptionService.updateSubscription(existingSubscription.id, {
            status: 'active',
          });
        }
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as StripeInvoice;

        if (invoice.subscription) {
          const existingSubscription =
            await subscriptionService.getSubscriptionByStripeId(
              invoice.subscription
            );

          if (existingSubscription) {
            await subscriptionService.updateSubscription(existingSubscription.id, {
              status: 'active',
            });
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as StripeInvoice;

        if (invoice.subscription) {
          const existingSubscription =
            await subscriptionService.getSubscriptionByStripeId(
              invoice.subscription
            );

          if (existingSubscription) {
            await subscriptionService.updateSubscription(existingSubscription.id, {
              status: 'pending',
            });
          }
        }
        break;
      }

      case 'customer.subscription.trial_will_end': {
        const subscription = event.data.object as StripeSubscription;
        // You could send an email reminder here
        console.log('Trial ending soon for subscription:', subscription.id);
        break;
      }

      default:
        console.log('Unhandled Stripe event type:', event.type);
    }

    return c.json({ received: true });
  } catch (error) {
    console.error('Error processing Stripe webhook:', error);
    return c.json({ error: 'Webhook processing failed' }, 500);
  }
});

export { stripeWebhook };
