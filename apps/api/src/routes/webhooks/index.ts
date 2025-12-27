import { Hono } from 'hono';
import type { Env, Variables } from '../../types/env';
import { appleWebhook } from './apple';
import { stripeWebhook } from './stripe';

const webhooks = new Hono<{ Bindings: Env; Variables: Variables }>();

// Mount webhook handlers
webhooks.route('/apple', appleWebhook);
webhooks.route('/stripe', stripeWebhook);

export { webhooks };
