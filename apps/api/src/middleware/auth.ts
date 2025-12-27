import { createMiddleware } from 'hono/factory';
import type { Env, Variables } from '../types/env';
import { verifyToken } from '../lib/jwt';
import { Errors } from '../lib/errors';
import { ErrorCodes } from '@starter/shared';

/**
 * Authentication middleware - verifies JWT and adds user to context
 */
export const authMiddleware = createMiddleware<{
  Bindings: Env;
  Variables: Variables;
}>(async (c, next) => {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw Errors.unauthorized(ErrorCodes.INVALID_TOKEN, 'Missing auth token');
  }

  const token = authHeader.slice(7);

  try {
    const payload = await verifyToken(token, c.env.JWT_SECRET);

    if (!payload.sub || !payload.email) {
      throw Errors.unauthorized(ErrorCodes.INVALID_TOKEN, 'Invalid token payload');
    }

    // Add user info to context
    c.set('userId', payload.sub);
    c.set('user', {
      id: payload.sub,
      email: payload.email as string,
    });

    await next();
  } catch (error) {
    if (error instanceof Error && error.name === 'JWTExpired') {
      throw Errors.unauthorized(ErrorCodes.TOKEN_EXPIRED);
    }
    throw Errors.unauthorized(ErrorCodes.INVALID_TOKEN);
  }
});

/**
 * Optional auth middleware - doesn't throw if no token, just skips setting user
 */
export const optionalAuthMiddleware = createMiddleware<{
  Bindings: Env;
  Variables: Variables;
}>(async (c, next) => {
  const authHeader = c.req.header('Authorization');

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7);

    try {
      const payload = await verifyToken(token, c.env.JWT_SECRET);

      if (payload.sub && payload.email) {
        c.set('userId', payload.sub);
        c.set('user', {
          id: payload.sub,
          email: payload.email as string,
        });
      }
    } catch {
      // Silently ignore invalid tokens for optional auth
    }
  }

  await next();
});
