import { createMiddleware } from 'hono/factory';
import type { Env, Variables } from '../types/env';

/**
 * Request logging middleware
 */
export const loggerMiddleware = createMiddleware<{
  Bindings: Env;
  Variables: Variables;
}>(async (c, next) => {
  const start = Date.now();
  const requestId = crypto.randomUUID();

  // Add request ID to headers
  c.header('X-Request-Id', requestId);

  // Log request
  console.log(
    JSON.stringify({
      type: 'request',
      requestId,
      method: c.req.method,
      path: c.req.path,
      userAgent: c.req.header('User-Agent'),
      ip: c.req.header('CF-Connecting-IP'),
      country: c.req.header('CF-IPCountry'),
    })
  );

  try {
    await next();
  } finally {
    const duration = Date.now() - start;

    // Log response
    console.log(
      JSON.stringify({
        type: 'response',
        requestId,
        method: c.req.method,
        path: c.req.path,
        status: c.res.status,
        duration,
        userId: c.get('userId'),
      })
    );
  }
});
