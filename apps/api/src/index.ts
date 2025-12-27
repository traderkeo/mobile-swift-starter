import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import type { Env, Variables } from './types/env';
import { auth } from './routes/auth';
import { users } from './routes/users';
import { subscriptions } from './routes/subscriptions';
import { webhooks } from './routes/webhooks';
import { errorHandler } from './middleware/error-handler';
import { requestLogger } from './middleware/logger';

// Create app instance
const app = new Hono<{ Bindings: Env; Variables: Variables }>();

// Global middleware
app.use('*', logger());
app.use('*', requestLogger);
app.use(
  '*',
  cors({
    origin: (origin) => {
      // Allow all origins in development, restrict in production
      // Configure ALLOWED_ORIGINS in wrangler.toml for production
      return origin || '*';
    },
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'X-Refresh-Token'],
    exposeHeaders: ['Content-Length', 'X-Request-Id'],
    maxAge: 86400,
    credentials: true,
  })
);

// Error handler
app.onError(errorHandler);

// Health check endpoint
app.get('/', (c) => {
  return c.json({
    name: 'Mobile Starter API',
    version: '1.0.0',
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

// Health check endpoint
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// Mount routes
app.route('/auth', auth);
app.route('/users', users);
app.route('/subscriptions', subscriptions);
app.route('/webhooks', webhooks);

// 404 handler
app.notFound((c) => {
  return c.json(
    {
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: `Route ${c.req.method} ${c.req.path} not found`,
      },
    },
    404
  );
});

export default app;
