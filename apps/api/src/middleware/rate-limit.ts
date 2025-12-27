import { createMiddleware } from 'hono/factory';
import type { Env, Variables } from '../types/env';
import { Errors } from '../lib/errors';
import { ErrorCodes } from '@starter/shared';

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  keyPrefix?: string; // Prefix for the cache key
}

const defaultConfig: RateLimitConfig = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 60, // 60 requests per minute
  keyPrefix: 'ratelimit',
};

/**
 * Rate limiting middleware using Cloudflare KV
 */
export function rateLimitMiddleware(config: Partial<RateLimitConfig> = {}) {
  const { windowMs, maxRequests, keyPrefix } = { ...defaultConfig, ...config };

  return createMiddleware<{
    Bindings: Env;
    Variables: Variables;
  }>(async (c, next) => {
    // Get client identifier (IP or user ID if authenticated)
    const userId = c.get('userId');
    const clientIp = c.req.header('CF-Connecting-IP') || 'unknown';
    const identifier = userId || clientIp;

    // Create cache key
    const windowStart = Math.floor(Date.now() / windowMs);
    const key = `${keyPrefix}:${identifier}:${windowStart}`;

    try {
      // Get current count from KV
      const currentCount = await c.env.CACHE.get(key);
      const count = currentCount ? parseInt(currentCount, 10) : 0;

      if (count >= maxRequests) {
        throw Errors.tooManyRequests(ErrorCodes.RATE_LIMITED);
      }

      // Increment counter
      await c.env.CACHE.put(key, String(count + 1), {
        expirationTtl: Math.ceil(windowMs / 1000),
      });

      // Add rate limit headers
      c.header('X-RateLimit-Limit', String(maxRequests));
      c.header('X-RateLimit-Remaining', String(maxRequests - count - 1));
      c.header(
        'X-RateLimit-Reset',
        String(Math.ceil((windowStart + 1) * windowMs / 1000))
      );

      await next();
    } catch (error) {
      if (error instanceof Error && error.message.includes('Too many')) {
        throw error;
      }
      // If KV fails, let the request through
      console.error('Rate limit KV error:', error);
      await next();
    }
  });
}

// Pre-configured rate limiters
export const authRateLimiter = rateLimitMiddleware({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 10, // 10 attempts per 15 minutes
  keyPrefix: 'ratelimit:auth',
});

export const apiRateLimiter = rateLimitMiddleware({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100, // 100 requests per minute
  keyPrefix: 'ratelimit:api',
});
